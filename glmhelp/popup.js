// Popup — 配置界面逻辑
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


const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let currentState = { config: { ...DEFAULT_CONFIG }, state: {}, log: [] };

// ============================================================
// 渲染
// ============================================================

function renderStatus() {
  const cfg = currentState.config;
  const st = currentState.state;
  const dot = $('#statusDot');
  const text = $('#statusText');
  const time = $('#statusTime');

  time.textContent = fmtTime(Date.now());

  if (!cfg.enabled) {
    dot.className = 'status-dot idle';
    text.textContent = '已暂停';
    return;
  }

  if (st.lastPurchaseTriggered && (Date.now() - st.lastPurchaseTriggered.ts) < 5 * 60 * 1000) {
    dot.className = 'status-dot triggered';
    text.textContent = '🎉 已触发购买!';
    return;
  }

  const hasAvailable = Object.values(st.plans || {}).some(p => p.status === 'available');
  if (hasAvailable) {
    dot.className = 'status-dot active';
    text.textContent = '可购买!';
    return;
  }

  dot.className = 'status-dot waiting';
  const restockTimes = Object.values(st.plans || {})
    .filter(p => p.restockText)
    .map(p => p.restockText);
  if (restockTimes.length > 0) {
    text.textContent = `等待补货 (${restockTimes.join(', ')})`;
  } else {
    text.textContent = '监控中...';
  }
}

function renderPlanStatus(planKey, planData) {
  const el = document.getElementById(`planStatus-${planKey}`);
  if (!el) return;
  if (!planData) {
    el.textContent = '-';
    el.className = 'plan-status';
    return;
  }
  el.textContent = planData.status === 'available' ? '可购' :
    planData.status === 'sold_out' ? (planData.restockText || '售罄') :
    planData.status === 'busy' ? '繁忙' : '-';
  el.className = `plan-status ${planData.status}`;
}

function renderLog() {
  const list = $('#logList');
  const entries = currentState.log || [];
  if (entries.length === 0) {
    list.innerHTML = '<div class="log-empty">暂无日志</div>';
    return;
  }
  list.innerHTML = entries.map(e => {
    const level = e.level || 'info';
    return `<div class="log-entry">
      <span class="log-time">${fmtTime(e.ts)}</span>
      <span class="log-msg ${level}">${escapeHtml(e.msg || '')}</span>
    </div>`;
  }).join('');
  list.scrollTop = 0;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderAll() {
  renderStatus();
  for (const key of Object.keys(DEFAULT_CONFIG.targets)) {
    renderPlanStatus(key, currentState.state.plans?.[key]);
  }
  renderLog();
}

// ============================================================
// 从 background 拉取状态
// ============================================================

async function fetchState() {
  try {
    const resp = await chrome.runtime.sendMessage({ type: MSG.GET_STATE });
    if (resp?.ok) {
      currentState.config = resp.config;
      currentState.state = resp.state;
      currentState.log = resp.log || [];
      renderAll();
      syncUIFromConfig();
    }
  } catch (e) {
    console.warn('fetchState error', e);
  }
}

// ============================================================
// UI ↔ Config 同步
// ============================================================

function syncUIFromConfig() {
  const cfg = currentState.config;
  $('#toggleEnabled').checked = cfg.enabled;
  $('#autoClick').checked = cfg.autoClick !== false;
  $('#notify').checked = cfg.notify !== false;
  $('#sound').checked = cfg.sound !== false;
  $('#prepMinutes').value = cfg.refresh?.prepMinutesBefore || 5;

  for (const card of $$('.plan-card')) {
    const key = card.dataset.plan;
    const checked = cfg.targets?.[key] === true;
    card.querySelector('.plan-checkbox').checked = checked;
    card.classList.toggle('active', checked);
  }
}

function readConfigFromUI() {
  const cfg = { ...currentState.config };
  cfg.enabled = $('#toggleEnabled').checked;
  cfg.autoClick = $('#autoClick').checked;
  cfg.notify = $('#notify').checked;
  cfg.sound = $('#sound').checked;
  cfg.refresh = {
    ...cfg.refresh,
    prepMinutesBefore: parseInt($('#prepMinutes').value, 10) || 5
  };
  cfg.targets = {};
  for (const card of $$('.plan-card')) {
    cfg.targets[card.dataset.plan] = card.querySelector('.plan-checkbox').checked;
  }
  return cfg;
}

async function saveConfig() {
  const cfg = readConfigFromUI();
  currentState.config = cfg;
  try {
    await chrome.runtime.sendMessage({ type: MSG.UPDATE_CONFIG, config: cfg });
  } catch (e) {}
}

// ============================================================
// 事件绑定
// ============================================================

$('#toggleEnabled').addEventListener('change', async () => {
  const enabled = $('#toggleEnabled').checked;
  try {
    await chrome.runtime.sendMessage({ type: MSG.TOGGLE_ENABLED, enabled });
  } catch (e) {}
  await fetchState();
});

for (const card of $$('.plan-card')) {
  card.addEventListener('click', () => {
    const cb = card.querySelector('.plan-checkbox');
    cb.checked = !cb.checked;
    card.classList.toggle('active', cb.checked);
    saveConfig();
  });
}

for (const el of $$('#autoClick, #notify, #sound, #prepMinutes')) {
  el.addEventListener('change', saveConfig);
}

$('#clearLog').addEventListener('click', async () => {
  await chrome.storage.local.set({ [STORAGE_KEYS.LOG]: [] });
  currentState.log = [];
  renderLog();
});

// ============================================================
// 轮询更新
// ============================================================

// 每 2 秒拉一次最新状态
setInterval(fetchState, 2000);

// 初始加载
$('#versionText').textContent = 'v' + chrome.runtime.getManifest().version;
fetchState();
