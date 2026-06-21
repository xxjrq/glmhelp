// Service Worker — MV3 后台调度器
// 关键：所有 listener 必须在顶层同步注册，否则 SW 唤醒后收不到事件

import { STORAGE_KEYS, DEFAULT_CONFIG, MSG, ALARMS } from './constants.js';
import { parseChineseDate, appendLog, fmtTime } from './utils.js';

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
          // content 报告某套餐状态变化
          const { planKey, status, restockText, buttonText } = message;
          const state = await getState();
          state.plans = state.plans || {};
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
          await pushLog({
            level: 'info',
            msg: `[${planKey}] 状态: ${status} / ${buttonText}${restockText ? ' / 补货:' + restockText : ''}`
          });
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
