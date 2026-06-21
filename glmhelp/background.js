// Service Worker — MV3 后台调度器
// 关键：所有 listener 必须在顶层同步注册，否则 SW 唤醒后收不到事件

const STORAGE_KEYS = {
  CONFIG: 'glm_snipe_config',
  STATE: 'glm_snipe_state',
  LOG: 'glm_snipe_log'
};

const DEFAULT_CONFIG = {
  enabled: true,
  targets: { lite: false, pro: true, max: false, team_standard: false, team_premium: false },
  autoClick: true,
  stopAtPayment: true,
  notify: true,
  sound: true,
  refresh: {
    prepMinutesBefore: 5,
    intervalSec: 30
  },
  clickDelay: { min: 200, max: 600 }
};

const PLAN_INDEX = { lite: 1, pro: 2, max: 3 };

const PLAN_NAMES = {
  lite: 'GLM Coding Lite',
  pro: 'GLM Coding Pro',
  max: 'GLM Coding Max',
  team_standard: 'GLM Coding 团队标准版',
  team_premium: 'GLM Coding 团队高级版'
};

const TEAM_PLAN_MATCHERS = {
  team_standard: '标准版',
  team_premium: '高级版'
};

const SELECTORS = {
  PACKAGE_LIST: '.glm-coding-package-list',
  CARD: (n) => `.glm-coding-package-list > div:nth-child(${n})`,
  BUTTON: (n) => `.glm-coding-package-list > div:nth-child(${n}) > div > .package-card-btn-box > button`,
  TEAM_PACKAGE_LIST: '.package-list.enterprise-package-list',
  TEAM_CARD: '.package-card',
  TEAM_BUY_BTN: '.buy-btn',
  TAB_BOX: '#switchTabBox',
  TAB: (n) => `#switchTabBox .switch-tab-item:nth-child(${n})`,
  DIALOG_WRAPPER: '.el-dialog__wrapper',
  DIALOG_CLOSE: '.el-dialog__close',
  PAY_DIALOG: '.pay-dialog',
  PAY_SUCCESS: '.pay-success-dialog-box'
};

const BUTTON_STATUS = {
  SOLD_OUT_RE: /售罄|补货|暂时/,
  BUSY_RE: /抢购人数过多|请刷新/,
  PURCHASABLE_TEXTS: ['特惠订阅', '立即订阅', '立即购买', '购买']
};

const RESTOCK_RE = /(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/;

const RATE_LIMIT_TEXT = '当前购买人数较多';

const MSG = {
  TOGGLE_ENABLED: 'toggle_enabled',
  UPDATE_CONFIG: 'update_config',
  GET_STATE: 'get_state',
  PLAN_STATE_CHANGED: 'plan_state_changed',
  PURCHASE_TRIGGERED: 'purchase_triggered',
  TRIGGER_REFRESH: 'trigger_refresh',
  TRIGGER_SCAN: 'trigger_scan',
  STATE_BROADCAST: 'state_broadcast'
};

const ALARMS = {
  HEARTBEAT: 'glm_heartbeat',
  REFILL_PREP: 'glm_refill_prep'
};

const API = {
  PRODUCT_INFO: '/api/biz/tokenResPack/productIdInfo',
  TOKEN_MAGNITUDE: '/api/biz/customer/getTokenMagnitude',
  PREVIEW: '/api/biz/pay/preview',
  CHECK: '/api/biz/pay/check'
};

const WATCHED_API_RE = /\/api\/biz\/(tokenResPack\/productIdInfo|customer\/getTokenMagnitude|pay\/(preview|check))/;

const PRODUCTS = {
  'lite-month': { id: 'product-02434c', price: 49 },
  'pro-month': { id: 'product-1df3e1', price: 149 },
  'max-month': { id: 'product-2fc421', price: 469 },
  'lite-quarter': { id: 'product-b8ea38', price: 132.3 },
  'pro-quarter': { id: 'product-fef82f', price: 402.3 },
  'max-quarter': { id: 'product-5d3a03', price: 1266.3 },
  'lite-year': { id: 'product-70a804', price: 470.4 },
  'pro-year': { id: 'product-5643e6', price: 1430.4 },
  'max-year': { id: 'product-d46f8b', price: 4502.4 }
};

const VERIFY_SELECTORS = [
  '[class*="verify"]', '[class*="captcha"]', '[class*="geetest"]',
  '[class*="tcaptcha"]', '[class*="yidun"]',
  '[id*="verify"]', '[id*="captcha"]', '[id*="geetest"]',
  '.geetest_panel', '.yidun_panel'
];

const VERIFY_TEXT_KEYWORDS = [
  '安全验证', '安全检测', '请完成验证', '滑动验证', '拖动滑块',
  '图形验证', '人机验证', '点击验证', '请验证', '验证码',
  '请拖动', '按住滑块', '向右滑动'
];

const CONFIRM_TEXTS = ['确认支付', '同意并继续', '确认购买', '确认订阅', '已知悉，继续订阅', '继续订阅', '立即支付', '去支付', '提交订单', '下一步', '继续', '确认', '确定', '同意'];

const CONFIRM_NEGATIVE = ['取消', '放弃', '返回', '关闭', '退出', '拒绝', '不同意', '稍后', '暂不'];

const AGREEMENT_HINT = ['同意', '协议', '已阅读'];

const BALANCE_PAY_TEXTS = ['账户余额', '余额支付', '余额付款', '账户支付', '余额'];

const FINAL_PAY_TEXTS = ['确认支付', '立即支付', '确认付款', '去支付'];

const PAY_DIALOG_SELECTORS = ['.pay-dialog', '.el-dialog__wrapper', '.el-dialog', '[role="dialog"]', '[class*="dialog"]', '[class*="modal"]'];

const PAY_SUCCESS_SELECTORS = ['.pay-success-dialog-box'];

const PURCHASE_RESULT = {
  SUCCESS: ['支付成功', '购买成功', '开通成功', '订阅成功', '订单成功', '感谢购买'],
  FAILURE: ['支付失败', '购买失败', '已售罄', '库存不足', '抢购人数过多', '余额不足', '订单失败', '抢购失败', '名额已满']
};

// ============================================================
// 团队套餐详情页（team-coding-detail）选择器
// ============================================================
const TEAM_DETAIL_SELECTORS = {
  CONTAINER: '.enterprise-coding-detail-content',
  PLAN_TYPE_ITEM: '.select-item-list .select-item',
  PLAN_TYPE_TITLE: '.select-item-title',
  SERVICE_TYPE_ITEM: '.service-type-item',
  SEAT_INPUT: '.number-input-box input[type="number"]',
  PAY_BTN: '.pay-btn, button.el-button--primary',
  FORM_AGREEMENT: 'input[type="checkbox"]'
};

const TEAM_DETAIL_PAGE_RE = /team-coding-detail/;

const TEAM_DETAIL_BALANCE_TEXTS = [
  '使用余额', '余额抵扣', '余额支付'
];

// 共享工具函数：日期解析、随机延迟、日志、消息封装

/**
 * 解析中文日期字符串如 "06月19日 10:00" → Date 对象
 * 自动推断年份（如果月日早于今天则用明年）
 * 处理时区：浏览器本地时区
 */
function parseChineseDate(str, now = new Date()) {
  if (!str || typeof str !== 'string') return null;

  // 兼容多种分隔："06月19日 10:00"、"6月19日10:00"、"06-19 10:00"
  const re1 = /(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(\d{1,2})\s*[:：]\s*(\d{2})/;
  const re2 = /(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/;

  let m = str.match(re1) || str.match(re2);
  if (!m) return null;

  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  const hour = parseInt(m[3], 10);
  const minute = parseInt(m[4], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }

  let year = now.getFullYear();
  const candidate = new Date(year, month - 1, day, hour, minute, 0, 0);

  // 如果候选时间已经过了 12 小时以上，认为是明年
  if (candidate.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
    year += 1;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/**
 * 随机延迟 — 反检测核心
 */
function randomDelay(min = 200, max = 600) {
  return new Promise(resolve => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(resolve, ms);
  });
}

/**
 * 节流：在指定窗口内最多触发一次
 */
function throttle(fn, wait) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * 防抖
 */
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * 简单日志环（保存最近 N 条）— 便于 popup 显示
 */
function appendLog(log, entry, max = 100) {
  const next = Array.isArray(log) ? log.slice() : [];
  next.unshift({
    ts: Date.now(),
    ...entry
  });
  return next.slice(0, max);
}

/**
 * 格式化时间戳为 HH:mm:ss
 */
function fmtTime(ts) {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(x => String(x).padStart(2, '0'))
    .join(':');
}

/**
 * 等待页面出现某元素，超时返回 null
 */
function waitForElement(selector, timeout = 5000, root = document) {
  return new Promise(resolve => {
    const found = root.querySelector(selector);
    if (found) return resolve(found);

    const obs = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        obs.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });
    obs.observe(root === document ? document.documentElement : root, {
      childList: true,
      subtree: true
    });

    const timer = setTimeout(() => {
      obs.disconnect();
      resolve(null);
    }, timeout);
  });
}


// ============================================================
// 状态管理
// ============================================================

async function getConfig() {
  const obj = await chrome.storage.local.get(STORAGE_KEYS.CONFIG);
  return { ...DEFAULT_CONFIG, ...(obj[STORAGE_KEYS.CONFIG] || {}) };
}

async function setConfig(cfg) {
  await chrome.storage.local.set({ [STORAGE_KEYS.CONFIG]: cfg });
}

async function getState() {
  const obj = await chrome.storage.local.get(STORAGE_KEYS.STATE);
  return obj[STORAGE_KEYS.STATE] || {
    plans: {},          // { lite: {status, restockAt, lastSeen}, pro: {...}, max: {...} }
    lastHeartbeat: 0,
    lastPurchaseTriggered: null,
    inPrepWindow: false
  };
}

async function setState(state) {
  await chrome.storage.local.set({ [STORAGE_KEYS.STATE]: state });
}

async function pushLog(entry) {
  const obj = await chrome.storage.local.get(STORAGE_KEYS.LOG);
  const next = appendLog(obj[STORAGE_KEYS.LOG] || [], entry);
  await chrome.storage.local.set({ [STORAGE_KEYS.LOG]: next });
  console.log(`[SW ${fmtTime(Date.now())}]`, entry);
}

// ============================================================
// chrome.alarms 调度
// ============================================================

async function setupAlarms() {
  // 心跳：每 60s 唤醒 SW（MV3 强制最小 1 分钟）
  await chrome.alarms.create(ALARMS.HEARTBEAT, {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
  await pushLog({ level: 'info', msg: '心跳 alarm 已建立（每 60s）' });
}

async function cancelAlarms() {
  await chrome.alarms.clearAll();
  await pushLog({ level: 'info', msg: '所有 alarms 已取消' });
}

/**
 * 根据所有套餐的最近 restockAt，决定是否进入"补货前 5 分钟"高频准备窗口
 */
async function evaluateRefillPrep() {
  const config = await getConfig();
  const state = await getState();
  const now = Date.now();

  let nearestRestock = null;
  for (const planKey of Object.keys(state.plans || {})) {
    if (!config.targets[planKey]) continue;
    const p = state.plans[planKey];
    if (p.restockAt && p.restockAt > now) {
      if (!nearestRestock || p.restockAt < nearestRestock) {
        nearestRestock = p.restockAt;
      }
    }
  }

  if (!nearestRestock) {
    state.inPrepWindow = false;
    await setState(state);
    return;
  }

  const msToRestock = nearestRestock - now;
  const prepWindowMs = config.refresh.prepMinutesBefore * 60 * 1000;

  const wasInPrep = state.inPrepWindow;
  state.inPrepWindow = msToRestock <= prepWindowMs && msToRestock > 0;
  await setState(state);

  if (state.inPrepWindow && !wasInPrep) {
    await pushLog({
      level: 'info',
      msg: `进入补货前准备窗口（剩余 ${Math.round(msToRestock / 1000)}s）`
    });
    // 通知 content 进入高频扫描模式
    await broadcastToContent({
      type: MSG.TRIGGER_SCAN,
      mode: 'prep',
      intervalSec: config.refresh.intervalSec
    });
  }
}

// ============================================================
// 消息广播
// ============================================================

async function broadcastToContent(message) {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://bigmodel.cn/glm-coding*' });
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, message);
      } catch (e) {
        // tab 已关闭或 content 未注入
      }
    }
  } catch (e) {
    console.warn('broadcastToContent error', e);
  }
}

const GLM_URL = 'https://bigmodel.cn/glm-coding?plantype=personal';

async function ensureBigmodelTab() {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://bigmodel.cn/glm-coding*' });
    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { active: true });
      return;
    }
    await chrome.tabs.create({ url: GLM_URL, active: true });
    await pushLog({ level: 'info', msg: '已打开 GLM Coding 套餐页' });
  } catch (e) {
    console.warn('ensureBigmodelTab error', e);
  }
}

// ============================================================
// 通知与声音
// ============================================================

async function notifyPurchase(planKey, planName) {
  const config = await getConfig();
  if (!config.notify) return;

  await chrome.notifications.create(`glm-purchase-${Date.now()}`, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title: '🎉 GLM 套餐可购买!',
    message: `${planName} 已可购买，已自动点击购买按钮，请尽快完成支付`,
    priority: 2,
    requireInteraction: true
  });

  if (config.sound) {
    // SW 不能直接播声音，让 content 播放
    await broadcastToContent({ type: 'play_sound' });
  }
}

// ============================================================
// 团队详情页动态注入（manifest 可能缓存旧规则）
// ============================================================

const injectedTeamDetailTabs = new Set();

async function injectTeamDetailContent(tabId, url) {
  if (injectedTeamDetailTabs.has(tabId)) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    injectedTeamDetailTabs.add(tabId);
    console.log('[GLM Snipe SW] 已注入 content.js 到 team-coding-detail');
  } catch (e) {
    if (!e.message?.includes('already exists')) {
      console.warn('[GLM Snipe SW] 注入失败', e.message);
    }
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTeamDetailTabs.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url?.includes('team-coding-detail')) {
    injectTeamDetailContent(tabId, tab.url);
  }
});

// ============================================================
// 顶层 Listener 注册（必须同步！）
// ============================================================

chrome.runtime.onInstalled.addListener(async () => {
  await pushLog({ level: 'info', msg: '扩展已安装/更新' });
  const cfg = await getConfig();
  if (cfg.enabled) {
    await setupAlarms();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await pushLog({ level: 'info', msg: '浏览器启动，恢复 alarms' });
  const cfg = await getConfig();
  if (cfg.enabled) {
    await setupAlarms();
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARMS.HEARTBEAT) {
    const state = await getState();
    state.lastHeartbeat = Date.now();
    await setState(state);

    await evaluateRefillPrep();

    // 触发一次扫描
    await broadcastToContent({ type: MSG.TRIGGER_SCAN, mode: 'normal' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 异步处理，必须 return true
  (async () => {
    try {
      switch (message?.type) {
        case MSG.TOGGLE_ENABLED: {
          const cfg = await getConfig();
          cfg.enabled = !!message.enabled;
          await setConfig(cfg);
          if (cfg.enabled) {
            const st = await getState();
            st.lastPurchaseTriggered = null;
            st.plans = {};
            st.verifying = false;
            await setState(st);
            await setupAlarms();
            await pushLog({ level: 'info', msg: '✅ 抢购已启动' });
            await ensureBigmodelTab();
          } else {
            await cancelAlarms();
            await pushLog({ level: 'info', msg: '⏸ 抢购已暂停' });
          }
          await broadcastToContent({ type: MSG.UPDATE_CONFIG, config: cfg });
          sendResponse({ ok: true, config: cfg });
          break;
        }

        case MSG.UPDATE_CONFIG: {
          const cfg = await getConfig();
          const merged = { ...cfg, ...message.config };
          await setConfig(merged);
          await broadcastToContent({ type: MSG.UPDATE_CONFIG, config: merged });
          sendResponse({ ok: true, config: merged });
          break;
        }

        case MSG.GET_STATE: {
          const cfg = await getConfig();
          const state = await getState();
          const log = (await chrome.storage.local.get(STORAGE_KEYS.LOG))[STORAGE_KEYS.LOG] || [];
          sendResponse({ ok: true, config: cfg, state, log });
          break;
        }

        case MSG.PLAN_STATE_CHANGED: {
          const { planKey, status, restockText, buttonText } = message;
          const state = await getState();
          state.plans = state.plans || {};

          if (planKey === '_verify') {
            state.verifying = status === 'verifying';
            await setState(state);
            await pushLog({ level: 'info', msg: buttonText || ('安全验证: ' + status) });
            sendResponse({ ok: true });
            break;
          }
          if (planKey === '_page_state') {
            await setState(state);
            sendResponse({ ok: true });
            break;
          }

          const prev = state.plans[planKey] || {};
          const restockAt = restockText ? parseChineseDate(restockText)?.getTime() : null;
          state.plans[planKey] = {
            status,
            buttonText,
            restockText,
            restockAt: restockAt || prev.restockAt || null,
            lastSeen: Date.now()
          };
          await setState(state);
          if (prev.status !== status) {
            await pushLog({
              level: 'info',
              msg: `[${planKey}] 状态: ${status} / ${buttonText}${restockText ? ' / 补货:' + restockText : ''}`
            });
          }
          await evaluateRefillPrep();
          sendResponse({ ok: true });
          break;
        }

        case MSG.PURCHASE_TRIGGERED: {
          const { planKey, planName } = message;
          const state = await getState();
          state.lastPurchaseTriggered = { planKey, ts: Date.now() };
          await setState(state);
          await pushLog({ level: 'success', msg: `🎉 已点击购买: ${planName}` });
          await notifyPurchase(planKey, planName);
          sendResponse({ ok: true });
          break;
        }

        default:
          sendResponse({ ok: false, error: 'unknown_message' });
      }
    } catch (e) {
      console.error('message handler error', e);
      sendResponse({ ok: false, error: String(e) });
    }
  })();
  return true; // 异步响应
});

// SW 启动时打个 log（用于调试）
console.log('[GLM Snipe SW] Service worker booted at', new Date().toISOString());
