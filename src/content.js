import { STORAGE_KEYS, DEFAULT_CONFIG, MSG, PLAN_INDEX, PLAN_NAMES, SELECTORS, BUTTON_STATUS, RESTOCK_RE, RATE_LIMIT_TEXT } from './constants.js';
import { randomDelay, debounce } from './utils.js';

const STATE = {
  config: { ...DEFAULT_CONFIG },
  cards: new Map(),
  triggeredKeys: new Set(),
  observer: null,
  heartbeatTimer: null,
  paused: false
};

function classifyButton(btn) {
  if (!btn) return { status: 'unknown', text: '' };
  const text = (btn.textContent || '').trim();
  const disabled = btn.disabled || btn.classList.contains('is-disabled') || btn.classList.contains('disabled');
  const soldOut = BUTTON_STATUS.SOLD_OUT_RE.test(text);
  const busy = BUTTON_STATUS.BUSY_RE.test(text);
  const purchasable = BUTTON_STATUS.PURCHASABLE_TEXTS.some(t => text.includes(t));
  if (busy) return { status: 'busy', text };
  if (soldOut || disabled) return { status: 'sold_out', text };
  if (purchasable && !disabled) return { status: 'available', text };
  return { status: 'unknown', text };
}

function extractRestock(text) {
  if (!text) return null;
  const m = text.match(RESTOCK_RE);
  if (m) return `${parseInt(m[1])}月${parseInt(m[2])}日 ${parseInt(m[3])}:${m[4]}`;
  if (/今日/.test(text)) {
    const tm = text.match(/(\d{1,2}):(\d{2})/);
    if (tm) {
      const now = new Date();
      return `${now.getMonth() + 1}月${now.getDate()}日 ${tm[1]}:${tm[2]}`;
    }
  }
  return null;
}

function scanCards() {
  const found = new Map();
  for (const [planKey, idx] of Object.entries(PLAN_INDEX)) {
    const btn = document.querySelector(SELECTORS.BUTTON(idx));
    if (!btn) continue;
    const cls = classifyButton(btn);
    if (cls.status === 'unknown') continue;
    const cardEl = document.querySelector(SELECTORS.CARD(idx));
    const restockText = extractRestock(btn.textContent || '');
    found.set(planKey, { planKey, cardEl, buttonEl: btn, status: cls.status, buttonText: cls.text, restockText });
  }
  return found;
}

// ============================================================
// 状态同步 + 触发购买
// ============================================================

async function processCard(card) {
  const prev = STATE.cards.get(card.planKey);
  STATE.cards.set(card.planKey, card);

  const changed = !prev ||
    prev.status !== card.status ||
    prev.buttonText !== card.buttonText ||
    prev.restockText !== card.restockText;

  if (changed) {
    chrome.runtime.sendMessage({
      type: MSG.PLAN_STATE_CHANGED,
      planKey: card.planKey,
      status: card.status,
      buttonText: card.buttonText,
      restockText: card.restockText
    }).catch(() => {});
  }

  // 触发购买条件
  const enabled = STATE.config.enabled;
  const target = STATE.config.targets?.[card.planKey];
  const autoClick = STATE.config.autoClick;
  const justBecameAvailable = card.status === 'available' && (!prev || prev.status !== 'available');

  if (enabled && target && autoClick && card.status === 'available' && !STATE.triggeredKeys.has(card.planKey)) {
    STATE.triggeredKeys.add(card.planKey);
    await triggerPurchase(card);
  }
}

/**
 * 真实点击序列 —— React/Vue 兼容
 * mousedown → 30-80ms → mouseup → click，每事件都 bubble 且 isTrusted-ish
 */
async function triggerPurchase(card) {
  STATE.paused = true;
  try {
    // 反检测随机延迟
    await randomDelay(STATE.config.clickDelay.min, STATE.config.clickDelay.max);

    const btn = card.buttonEl;
    if (!btn || !document.body.contains(btn)) {
      console.warn('[GLM Snipe] 按钮已脱离 DOM');
      return;
    }

    // 滚动到视图（人类行为）
    btn.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
    await randomDelay(50, 150);

    const rect = btn.getBoundingClientRect();
    // 在按钮内随机一个点（避免每次都点中心）
    const x = rect.left + rect.width * (0.3 + Math.random() * 0.4);
    const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);

    const opts = {
      view: window,
      bubbles: true,
      cancelable: true,
      composed: true,
      buttons: 1,
      button: 0,
      clientX: x,
      clientY: y
    };

    btn.dispatchEvent(new PointerEvent('pointerover', opts));
    btn.dispatchEvent(new MouseEvent('mouseover', opts));
    btn.dispatchEvent(new PointerEvent('pointermove', opts));
    btn.dispatchEvent(new MouseEvent('mousemove', opts));
    await new Promise(r => setTimeout(r, 30 + Math.random() * 50));

    btn.dispatchEvent(new PointerEvent('pointerdown', opts));
    btn.dispatchEvent(new MouseEvent('mousedown', opts));
    await new Promise(r => setTimeout(r, 40 + Math.random() * 60));

    btn.dispatchEvent(new PointerEvent('pointerup', opts));
    btn.dispatchEvent(new MouseEvent('mouseup', opts));
    btn.dispatchEvent(new MouseEvent('click', opts));

    // 兜底：再调一次原生 click()（部分框架需要）
    if (typeof btn.click === 'function') {
      try { btn.click(); } catch (e) {}
    }

    chrome.runtime.sendMessage({
      type: MSG.PURCHASE_TRIGGERED,
      planKey: card.planKey,
      planName: PLAN_NAMES[card.planKey] || card.planKey
    }).catch(() => {});

    console.log(`[GLM Snipe] ✅ 已触发购买: ${card.planKey}`);
  } catch (e) {
    console.error('[GLM Snipe] triggerPurchase error', e);
  } finally {
    setTimeout(() => { STATE.paused = false; }, 2000);
  }
}

// ============================================================
// 第一层：MutationObserver
// ============================================================

const debouncedScan = debounce(() => {
  if (STATE.paused) return;
  const cards = scanCards();
  for (const card of cards.values()) {
    processCard(card);
  }
}, 150);

function startObserver() {
  if (STATE.observer) return;

  STATE.observer = new MutationObserver(() => {
    debouncedScan();
  });

  STATE.observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  console.log('[GLM Snipe] MutationObserver 已启动');
}

function stopObserver() {
  if (STATE.observer) {
    STATE.observer.disconnect();
    STATE.observer = null;
  }
}

// ============================================================
// 第二层：心跳兜底（每 1s 扫描一次，content script 内安全）
// 注意：这是 content script，页面活着 setInterval 才有效，与 SW 无关
// ============================================================

function startHeartbeat() {
  if (STATE.heartbeatTimer) return;
  STATE.heartbeatTimer = setInterval(() => {
    if (!STATE.paused) debouncedScan();
  }, 1000);
}

function stopHeartbeat() {
  if (STATE.heartbeatTimer) {
    clearInterval(STATE.heartbeatTimer);
    STATE.heartbeatTimer = null;
  }
}

// ============================================================
// 第三层：fetch/XHR hook（最早信号）
// ============================================================

function injectFetchHook() {
  // 注入到页面主上下文以拦截 fetch
  const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);

  // 接收 inject.js 通过 window.postMessage 发来的 API 响应
  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.data?.source !== 'glm-snipe-inject') return;
    if (e.data.kind === 'inventory_response') {
      console.log('[GLM Snipe] inventory API hit', e.data.payload);
      // 收到库存 API 响应 → 立即扫描
      debouncedScan();
    }
  });
}

// ============================================================
// 声音播放 — SW 不能播，只能在 content
// ============================================================

function playNotifySound() {
  try {
    const audio = new Audio(chrome.runtime.getURL('notify.wav'));
    audio.volume = 0.7;
    audio.play().catch(() => {
      // 浏览器自动播放策略：失败时用 beep
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.2;
      osc.start();
      setTimeout(() => osc.stop(), 600);
    });
  } catch (e) {
    console.warn('play sound failed', e);
  }
}

// ============================================================
// 启动
// ============================================================

async function init() {
  // 拉取配置
  try {
    const resp = await chrome.runtime.sendMessage({ type: MSG.GET_STATE });
    if (resp?.ok) STATE.config = resp.config;
  } catch (e) {
    console.warn('init getState failed', e);
  }

  startObserver();
  startHeartbeat();
  injectFetchHook();

  // 立即扫描一次
  setTimeout(() => debouncedScan(), 500);

  console.log('[GLM Snipe Content] initialized', STATE.config);
}

// 接收 SW 消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message?.type) {
    case MSG.UPDATE_CONFIG:
      STATE.config = message.config;
      sendResponse({ ok: true });
      break;
    case MSG.TRIGGER_SCAN:
      debouncedScan();
      sendResponse({ ok: true });
      break;
    case MSG.TRIGGER_REFRESH:
      // 谨慎：Cloudflare 阈值
      console.log('[GLM Snipe] reload triggered');
      window.location.reload();
      sendResponse({ ok: true });
      break;
    case 'play_sound':
      playNotifySound();
      sendResponse({ ok: true });
      break;
    default:
      sendResponse({ ok: false });
  }
  return true;
});

// document_idle 时已经可以执行
init();
