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


const STATE = {
  config: { ...DEFAULT_CONFIG },
  cards: new Map(),
  triggeredKeys: new Set(),
  observer: null,
  heartbeatTimer: null,
  pollTimer: null,
  verifyPaused: false,
  paused: false,
  // 团队详情页专用：标记是否已触发购买
  teamPurchaseTriggered: false
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
  console.log('[GLM Snipe DBG] updateCardHighlights, enabled:', STATE.config.enabled, 'targets:', JSON.stringify(STATE.config.targets), 'hasMax:', STATE.config.targets?.max);
  for (const [planKey, idx] of Object.entries(PLAN_INDEX)) {
    const cardEl = document.querySelector(SELECTORS.CARD(idx));
    console.log('[GLM Snipe DBG] personal plan:', planKey, 'idx:', idx, 'cardEl:', !!cardEl, 'CARD selector:', SELECTORS.CARD(idx));
    if (!cardEl) continue;
    const watching = STATE.config.enabled && STATE.config.targets?.[planKey] === true;
    console.log('[GLM Snipe DBG] planKey:', planKey, 'watching:', watching, 'target value:', STATE.config.targets?.[planKey]);
    cardEl.classList.toggle(HIGHLIGHT_CLASS, watching);
  }
  const teamCards = document.querySelectorAll(SELECTORS.TEAM_CARD);
  console.log('[GLM Snipe DBG] teamCards found:', teamCards.length);
  for (const card of teamCards) {
    const planKey = teamPlanKeyOf(card);
    if (!planKey) continue;
    const watching = STATE.config.enabled && STATE.config.targets?.[planKey] === true;
    console.log('[GLM Snipe DBG] team card:', planKey, 'watching:', watching);
    card.classList.toggle(HIGHLIGHT_CLASS, watching);
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

function teamPlanKeyOf(card) {
  const titleEl = card.querySelector('.package-card-title, [class*="title"], h2, h3');
  const title = (titleEl?.textContent || '').trim();
  if (title.includes('高级版')) return 'team_premium';
  if (title.includes('标准版')) return 'team_standard';
  const text = card.textContent || '';
  if (text.includes('高级版')) return 'team_premium';
  if (text.includes('标准版')) return 'team_standard';
  return null;
}

function scanTeamCards(found) {
  const cards = document.querySelectorAll(SELECTORS.TEAM_CARD);
  if (!cards.length) return false;
  for (const card of cards) {
    const planKey = teamPlanKeyOf(card);
    if (!planKey) continue;
    const btn = card.querySelector(SELECTORS.TEAM_BUY_BTN) || card.querySelector('button');
    if (!btn) continue;
    const cls = classifyButton(btn);
    if (cls.status === 'unknown') continue;
    found.set(planKey, { planKey, cardEl: card, buttonEl: btn, status: cls.status, buttonText: cls.text, restockText: extractRestock(btn.textContent || '') });
  }
  return true;
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
  const hasTeam = scanTeamCards(found);
  if (!anyButton && !hasTeam && !document.querySelector(SELECTORS.PACKAGE_LIST) && !document.querySelector(SELECTORS.TEAM_PACKAGE_LIST)) {
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
    if (VERIFY_TEXT_KEYWORDS.some(k => (m.textContent || '').includes(k))) continue;
    const checkboxes = m.querySelectorAll('input[type="checkbox"]:not(:checked), .el-checkbox__input:not(.is-checked)');
    for (const cb of checkboxes) {
      const around = (cb.closest('label')?.textContent || cb.parentElement?.textContent || '');
      if (AGREEMENT_HINT.some(h => around.includes(h)) || checkboxes.length === 1) {
        await clickReal(cb);
        await randomDelay(120, 260);
      }
    }
    const buttons = m.querySelectorAll('button, [role="button"], a, .el-button');
    for (const b of buttons) {
      const t = (b.textContent || '').trim();
      if (t.includes('协议') || t.includes('条款')) continue;
      if (CONFIRM_NEGATIVE.some(n => t.includes(n))) continue;
      if (CONFIRM_TEXTS.some(c => t === c || t.includes(c)) && isVisible(b) && !b.disabled) {
        await clickReal(b);
        return true;
      }
    }
  }
  return false;
}

async function selectBalancePayment() {
  const modals = document.querySelectorAll('.pay-dialog, [class*="dialog"], [class*="modal"], [role="dialog"]');
  for (const m of modals) {
    if (!isVisible(m)) continue;
    const options = m.querySelectorAll('label, [class*="payment"], [class*="pay-method"], [class*="pay-item"], .el-radio, [role="radio"], li, div');
    for (const opt of options) {
      const t = (opt.textContent || '').trim();
      if (t.length > 30) continue;
      if (BALANCE_PAY_TEXTS.some(b => t.includes(b))) {
        const r = opt.getBoundingClientRect();
        if (r.width < 20 || r.height < 10) continue;
        const radio = opt.querySelector('input[type="radio"], .el-radio__input') || opt;
        await clickReal(radio);
        await randomDelay(150, 300);
        return true;
      }
    }
  }
  return false;
}

async function handlePayDialog() {
  const payDialog = document.querySelector('.pay-dialog');
  if (!payDialog || !isVisible(payDialog)) return false;

  await selectBalancePayment();

  const checkboxes = payDialog.querySelectorAll('input[type="checkbox"]:not(:checked), .el-checkbox__input:not(.is-checked)');
  for (const cb of checkboxes) {
    await clickReal(cb);
    await randomDelay(120, 240);
  }

  const buttons = payDialog.querySelectorAll('button, [role="button"], .el-button');
  for (const b of buttons) {
    const t = (b.textContent || '').trim();
    if (t.includes('协议') || t.includes('条款')) continue;
    if (CONFIRM_NEGATIVE.some(n => t.includes(n))) continue;
    if (FINAL_PAY_TEXTS.some(c => t === c || t.includes(c)) && isVisible(b) && !b.disabled) {
      await clickReal(b);
      return true;
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
// 团队套餐详情页处理（team-coding-detail）
// ============================================================

function isTeamDetailPage() {
  return TEAM_DETAIL_PAGE_RE.test(location.href);
}

function findTeamDetailBalanceOption() {
  const candidates = document.querySelectorAll('label, div, span, li, [role="radio"], .el-radio, [class*="pay-method"]');
  for (const el of candidates) {
    if (el.offsetWidth < 20) continue;
    const t = (el.textContent || '').trim();
    if (t.length > 40) continue;
    if (TEAM_DETAIL_BALANCE_TEXTS.some(k => t.includes(k))) {
      const radio = el.querySelector('input[type="radio"], .el-radio__input, input[type="checkbox"]') || el;
      return radio;
    }
  }
  return null;
}

async function handleTeamDetailPurchase() {
  if (STATE.teamPurchaseTriggered || STATE.paused) return;
  const hasTeamTarget = STATE.config.targets?.team_standard || STATE.config.targets?.team_premium;
  if (!hasTeamTarget || !STATE.config.enabled || !STATE.config.autoClick) return;

  STATE.teamPurchaseTriggered = true;
  STATE.paused = true;

  const targetPlan = STATE.config.targets?.team_standard ? 'team_standard' : 'team_premium';
  const targetName = targetPlan === 'team_standard' ? '团队标准版' : '团队高级版';

  try {
    // 1. 选择套餐类型
    const planItems = document.querySelectorAll(TEAM_DETAIL_SELECTORS.PLAN_TYPE_ITEM);
    for (const item of planItems) {
      const title = item.querySelector(TEAM_DETAIL_SELECTORS.PLAN_TYPE_TITLE);
      if (title && title.textContent.trim().includes(targetName)) {
        if (!item.classList.contains('is-active')) {
          console.log('[GLM Snipe] 选择套餐:', targetName);
          await clickReal(item);
          await randomDelay(250, 500);
        }
        break;
      }
    }

    // 2. 勾选余额支付
    const balanceOpt = findTeamDetailBalanceOption();
    if (balanceOpt) {
      const cb = balanceOpt.querySelector('input[type="checkbox"]:not(:checked)');
      if (cb) {
        console.log('[GLM Snipe] 勾选余额支付');
        await clickReal(cb);
        await randomDelay(150, 300);
      } else {
        await clickReal(balanceOpt);
        await randomDelay(150, 300);
      }
    }

    // 3. 勾选协议
    const uncheckedCbs = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
    for (const cb of uncheckedCbs) {
      const parentText = (cb.closest('label')?.textContent || cb.parentElement?.textContent || '');
      if (parentText.includes('余额') || parentText.includes('协议') || parentText.includes('同意') || uncheckedCbs.length === 1) {
        await clickReal(cb);
        await randomDelay(120, 250);
      }
    }

    // 4. 点击立即购买
    const payBtn = document.querySelector(TEAM_DETAIL_SELECTORS.PAY_BTN);
    if (payBtn && !payBtn.disabled && isVisible(payBtn)) {
      console.log('[GLM Snipe] 点击立即购买');
      await clickReal(payBtn);

      chrome.runtime.sendMessage({
        type: MSG.PURCHASE_TRIGGERED,
        planKey: targetPlan,
        planName: PLAN_NAMES[targetPlan] || targetPlan
      }).catch(() => {});

      // 5. 等待确认弹窗 / 支付结果
      for (let i = 0; i < 10; i++) {
        await randomDelay(600, 1000);
        if (checkSecurityGate()) break;
        const handled = await handleConfirmDialog();
        if (!handled) await handlePayDialog();
        const result = detectPurchaseResult();
        if (result) {
          chrome.runtime.sendMessage({
            type: MSG.PLAN_STATE_CHANGED,
            planKey: targetPlan,
            status: result === 'success' ? 'purchased' : 'purchase_failed',
            buttonText: result === 'success' ? '购买成功' : '购买失败',
            restockText: null
          }).catch(() => {});
          if (result === 'success') speak(`${PLAN_NAMES[targetPlan] || ''} 已进入支付，请尽快完成`);
          break;
        }
      }
    }
  } catch (e) {
    console.error('[GLM Snipe] team detail purchase error', e);
  } finally {
    setTimeout(() => { STATE.paused = false; }, 3000);
  }
}

function startTeamDetailLoop() {
  if (STATE.heartbeatTimer) return;
  console.log('[GLM Snipe] 启动团队详情页扫描');
  STATE.heartbeatTimer = setInterval(() => {
    if (STATE.paused) return;
    // 等待安全验证通过后再触发购买
    if (checkSecurityGate()) return;
    handleTeamDetailPurchase();
  }, 1200);
}

// ============================================================
// 第一层：MutationObserver
// ============================================================

function scanNow() {
  updateCardHighlights();
  if (STATE.paused) return;
  const verifying = checkSecurityGate();
  // 团队套餐列表页：允许跳过安全验证继续扫描团队卡片
  // 个人套餐页：安全验证正常阻塞
  if (verifying && !location.href.includes('plantype=team')) return;
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
  // 先检测页面类型 — 避免 SW 未就绪时 sendMessage 阻塞
  if (isTeamDetailPage()) {
    try {
      const resp = await chrome.runtime.sendMessage({ type: MSG.GET_STATE });
      if (resp?.ok) STATE.config = resp.config;
    } catch (e) {
      console.warn('init getState failed', e);
    }
    console.log('[GLM Snipe] 检测到团队详情页, 启动详情页处理');
    startObserver();
    startTeamDetailLoop();
    setTimeout(() => { debouncedScan(); updateCardHighlights(); }, 500);
    return;
  }

  // 拉取配置
  try {
    const resp = await chrome.runtime.sendMessage({ type: MSG.GET_STATE });
    console.log('[GLM Snipe DBG] init getState response:', resp?.ok, 'config:', JSON.stringify(resp?.config));
    if (resp?.ok) STATE.config = resp.config;
  } catch (e) {
    console.warn('init getState failed', e);
  }

  startObserver();
  startHeartbeat();
  listenInjectMessages();

  setTimeout(() => { debouncedScan(); updateCardHighlights(); }, 500);

  console.log('[GLM Snipe Content] initialized', JSON.stringify(STATE.config));
}

// 接收 SW 消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message?.type) {
    case MSG.UPDATE_CONFIG:
      console.log('[GLM Snipe DBG] received UPDATE_CONFIG:', JSON.stringify(message.config));
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
