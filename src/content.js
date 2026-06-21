import { STORAGE_KEYS, DEFAULT_CONFIG, MSG, PLAN_INDEX, PLAN_NAMES, SELECTORS, BUTTON_STATUS, RESTOCK_RE, RATE_LIMIT_TEXT, API, VERIFY_SELECTORS, VERIFY_TEXT_KEYWORDS, CONFIRM_TEXTS, AGREEMENT_HINT, PURCHASE_RESULT } from './constants.js';
import { randomDelay, debounce } from './utils.js';

const STATE = {
  config: { ...DEFAULT_CONFIG },
  cards: new Map(),
  triggeredKeys: new Set(),
  observer: null,
  heartbeatTimer: null,
  pollTimer: null,
  verifyPaused: false,
  paused: false
};

const HIGHLIGHT_STYLE_ID = 'glm-snipe-highlight-style';
const HIGHLIGHT_CLASS = 'glm-snipe-watching';

function injectHighlightStyle() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      position: relative !important;
      border-radius: 14px !important;
      box-shadow: 0 0 0 2.5px #6366F1, 0 8px 28px rgba(99, 102, 241, 0.28) !important;
      transition: box-shadow 0.3s ease !important;
      animation: glmSnipePulse 2.4s ease-in-out infinite !important;
    }
    .${HIGHLIGHT_CLASS}::after {
      content: '⚡ 监控中';
      position: absolute;
      top: -11px;
      left: 14px;
      z-index: 50;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0.3px;
      color: #fff;
      background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
      border-radius: 999px;
      box-shadow: 0 3px 10px rgba(99, 102, 241, 0.4);
      pointer-events: none;
      white-space: nowrap;
    }
    @keyframes glmSnipePulse {
      0%, 100% { box-shadow: 0 0 0 2.5px #6366F1, 0 8px 28px rgba(99, 102, 241, 0.28); }
      50% { box-shadow: 0 0 0 2.5px #8B5CF6, 0 8px 34px rgba(139, 92, 246, 0.42); }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function updateCardHighlights() {
  injectHighlightStyle();
  for (const [planKey, idx] of Object.entries(PLAN_INDEX)) {
    const cardEl = document.querySelector(SELECTORS.CARD(idx));
    if (!cardEl) continue;
    const watching = STATE.config.enabled && STATE.config.targets?.[planKey] === true;
    if (watching) {
      cardEl.classList.add(HIGHLIGHT_CLASS);
    } else {
      cardEl.classList.remove(HIGHLIGHT_CLASS);
    }
  }
}

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
  let anyButton = false;
  for (const [planKey, idx] of Object.entries(PLAN_INDEX)) {
    const btn = document.querySelector(SELECTORS.BUTTON(idx));
    if (!btn) continue;
    anyButton = true;
    const cls = classifyButton(btn);
    if (cls.status === 'unknown') continue;
    const cardEl = document.querySelector(SELECTORS.CARD(idx));
    const restockText = extractRestock(btn.textContent || '');
    found.set(planKey, { planKey, cardEl, buttonEl: btn, status: cls.status, buttonText: cls.text, restockText });
  }
  if (!anyButton && !document.querySelector(SELECTORS.PACKAGE_LIST)) {
    chrome.runtime.sendMessage({
      type: MSG.PLAN_STATE_CHANGED,
      planKey: '_page_state',
      status: 'no_cards_found',
      buttonText: location.href,
      restockText: null
    }).catch(() => {});
  }
  return found;
}

// ============================================================
// 安全验证（CAPTCHA）检测 + 确认弹窗 + 结果检测
// ============================================================

function speak(text) {
  try {
    if (!STATE.config.sound) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

function isVisible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 30 && r.height > 30 && getComputedStyle(el).display !== 'none';
}

function detectSecurityPopup() {
  for (const sel of VERIFY_SELECTORS) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 80) continue;
      const txt = el.textContent || '';
      if (VERIFY_TEXT_KEYWORDS.some(k => txt.includes(k)) && getComputedStyle(el).display !== 'none') {
        return true;
      }
    }
  }
  const modals = document.querySelectorAll('[class*="dialog"], [class*="modal"], [role="dialog"]');
  for (const m of modals) {
    if (!isVisible(m)) continue;
    const txt = m.textContent || '';
    if (VERIFY_TEXT_KEYWORDS.some(k => txt.includes(k))) return true;
  }
  if (document.querySelector('iframe[src*="captcha"], iframe[src*="verify"], iframe[src*="geetest"], iframe[src*="tcaptcha"]')) {
    return true;
  }
  return false;
}

function checkSecurityGate() {
  const verifying = detectSecurityPopup();
  if (verifying && !STATE.verifyPaused) {
    STATE.verifyPaused = true;
    speak('注意，检测到安全验证弹窗，请手动完成验证');
    chrome.runtime.sendMessage({ type: MSG.PLAN_STATE_CHANGED, planKey: '_verify', status: 'verifying', buttonText: '检测到安全验证，已暂停', restockText: null }).catch(() => {});
  } else if (!verifying && STATE.verifyPaused) {
    STATE.verifyPaused = false;
    speak('验证已通过，恢复抢购监控');
    chrome.runtime.sendMessage({ type: MSG.PLAN_STATE_CHANGED, planKey: '_verify', status: 'verify_cleared', buttonText: '验证已通过，恢复监控', restockText: null }).catch(() => {});
  }
  return verifying;
}

async function handleConfirmDialog() {
  const modals = document.querySelectorAll('[class*="dialog"], [class*="modal"], [role="dialog"]');
  for (const m of modals) {
    if (!isVisible(m)) continue;
    const checkboxes = m.querySelectorAll('input[type="checkbox"]:not(:checked)');
    for (const cb of checkboxes) {
      const around = (cb.closest('label')?.textContent || cb.parentElement?.textContent || '');
      if (AGREEMENT_HINT.some(h => around.includes(h)) || checkboxes.length === 1) {
        cb.click();
        await randomDelay(120, 260);
      }
    }
    const buttons = m.querySelectorAll('button, [role="button"], a');
    for (const b of buttons) {
      const t = (b.textContent || '').trim();
      if (CONFIRM_TEXTS.some(c => t === c || t.includes(c)) && isVisible(b) && !b.disabled) {
        await clickReal(b);
        return true;
      }
    }
  }
  return false;
}

function detectPurchaseResult() {
  const body = document.body.textContent || '';
  if (PURCHASE_RESULT.SUCCESS.some(k => body.includes(k))) return 'success';
  if (PURCHASE_RESULT.FAILURE.some(k => body.includes(k))) return 'failure';
  return null;
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

async function clickReal(btn) {
  if (!btn || !document.body.contains(btn)) return;
  btn.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
  await randomDelay(50, 150);
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width * (0.3 + Math.random() * 0.4);
  const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);
  const opts = { view: window, bubbles: true, cancelable: true, composed: true, buttons: 1, button: 0, clientX: x, clientY: y };
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
  if (typeof btn.click === 'function') {
    try { btn.click(); } catch (e) {}
  }
}

async function triggerPurchase(card) {
  STATE.paused = true;
  try {
    await randomDelay(STATE.config.clickDelay.min, STATE.config.clickDelay.max);

    const btn = card.buttonEl;
    if (!btn || !document.body.contains(btn)) {
      console.warn('[GLM Snipe] 按钮已脱离 DOM');
      return;
    }

    await clickReal(btn);

    chrome.runtime.sendMessage({
      type: MSG.PURCHASE_TRIGGERED,
      planKey: card.planKey,
      planName: PLAN_NAMES[card.planKey] || card.planKey
    }).catch(() => {});

    console.log(`[GLM Snipe] ✅ 已触发购买: ${card.planKey}`);

    for (let i = 0; i < 6; i++) {
      await randomDelay(400, 700);
      if (checkSecurityGate()) break;
      const handled = await handleConfirmDialog();
      const result = detectPurchaseResult();
      if (result) {
        chrome.runtime.sendMessage({
          type: MSG.PLAN_STATE_CHANGED,
          planKey: card.planKey,
          status: result === 'success' ? 'purchased' : 'purchase_failed',
          buttonText: result === 'success' ? '购买成功' : '购买失败',
          restockText: null
        }).catch(() => {});
        if (result === 'success') speak(`${PLAN_NAMES[card.planKey] || ''} 已进入支付，请尽快完成`);
        break;
      }
      if (!handled) continue;
    }
  } catch (e) {
    console.error('[GLM Snipe] triggerPurchase error', e);
  } finally {
    setTimeout(() => { STATE.paused = false; }, 2000);
  }
}

// ============================================================
// 第一层：MutationObserver
// ============================================================

function scanNow() {
  updateCardHighlights();
  if (STATE.paused) return;
  if (checkSecurityGate()) return;
  const cards = scanCards();
  for (const card of cards.values()) {
    processCard(card);
  }
}

const debouncedScan = debounce(scanNow, 150);

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
  if (!STATE.pollTimer) {
    STATE.pollTimer = setInterval(() => {
      pollInventoryAPI();
    }, 30000);
  }
}

function stopHeartbeat() {
  if (STATE.heartbeatTimer) {
    clearInterval(STATE.heartbeatTimer);
    STATE.heartbeatTimer = null;
  }
  if (STATE.pollTimer) {
    clearInterval(STATE.pollTimer);
    STATE.pollTimer = null;
  }
}

async function pollInventoryAPI() {
  if (STATE.paused || STATE.verifyPaused) return;
  try {
    const resp = await fetch(API.PRODUCT_INFO, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (resp.ok) {
      await resp.text().catch(() => '');
      debouncedScan();
    }
  } catch (e) {}
}

// ============================================================
// 第三层：fetch/XHR hook（最早信号）
// ============================================================

function listenInjectMessages() {
  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.data?.source !== 'glm-snipe-inject') return;
    if (e.data.kind === 'inventory_response') {
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
  listenInjectMessages();

  setTimeout(() => { debouncedScan(); updateCardHighlights(); }, 500);

  console.log('[GLM Snipe Content] initialized', STATE.config);
}

// 接收 SW 消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message?.type) {
    case MSG.UPDATE_CONFIG:
      STATE.config = message.config;
      if (STATE.config.enabled) {
        STATE.triggeredKeys.clear();
        STATE.cards.clear();
      }
      scanNow();
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
