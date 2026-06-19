// test.js — 检测逻辑单元测试
// 在 Node 中运行: node test/test.js
// 测试 classifyButton + extractRestock + scanCards 纯逻辑

const fs = require('fs');
const path = require('path');

// 从 content.js 提取纯逻辑（不依赖 chrome API）
const BUTTON_STATUS = {
  SOLD_OUT_RE: /售罄|补货|暂时/,
  BUSY_RE: /抢购人数过多|请刷新/,
  PURCHASABLE_TEXTS: ['特惠订阅', '立即订阅', '立即购买', '购买']
};
const RESTOCK_RE = /(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/;
const PLAN_INDEX = { lite: 1, pro: 2, max: 3 };
const SELECTORS = {
  BUTTON: (n) => `.glm-coding-package-list > div:nth-child(${n}) > div > .package-card-btn-box > button`,
  CARD: (n) => `.glm-coding-package-list > div:nth-child(${n})`
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

function scanCards(doc) {
  const found = {};
  for (const [planKey, idx] of Object.entries(PLAN_INDEX)) {
    const btn = doc.querySelector(SELECTORS.BUTTON(idx));
    if (!btn) continue;
    const cls = classifyButton(btn);
    if (cls.status === 'unknown') continue;
    const cardEl = doc.querySelector(SELECTORS.CARD(idx));
    const restockText = extractRestock(btn.textContent || '');
    found[planKey] = { planKey, status: cls.status, buttonText: cls.text, restockText };
  }
  return found;
}

// ============================================================
// 测试
// ============================================================

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg}`);
    failed++;
  }
}

// 加载 fixture HTML
const html = fs.readFileSync(path.join(__dirname, 'fixture.html'), 'utf-8');

// 用 JSDOM 解析
let dom;
try {
  const { JSDOM } = require('jsdom');
  dom = new JSDOM(html);
} catch (e) {
  // 没有 jsdom，用简单 HTML 解析器测试
  console.log('⚠ jsdom not available, running basic logic tests only');
}

// ============================================================
// 测试 1: classifyButton
// ============================================================
console.log('\n📋 Test 1: classifyButton()');

if (dom) {
  const buttons = dom.window.document.querySelectorAll('.package-card-btn-box button');
  assert(buttons.length === 3, '找到 3 个按钮');

  // Lite: disabled + "暂时售罄" → sold_out
  const liteBtn = buttons[0];
  const liteCls = classifyButton(liteBtn);
  assert(liteCls.status === 'sold_out', `Lite 状态应为 sold_out，实际: ${liteCls.status}`);
  assert(liteCls.text.includes('暂时售罄'), `Lite 文本包含售罄`);

  // Pro: "特惠订阅" + 未禁用 → available
  const proBtn = buttons[1];
  const proCls = classifyButton(proBtn);
  assert(proCls.status === 'available', `Pro 状态应为 available，实际: ${proCls.status}`);
  assert(proCls.text === '特惠订阅', `Pro 文本应为特惠订阅`);

  // Max: is-disabled class + "暂时售罄" → sold_out
  const maxBtn = buttons[2];
  const maxCls = classifyButton(maxBtn);
  assert(maxCls.status === 'sold_out', `Max 状态应为 sold_out，实际: ${maxCls.status}`);
}

// ============================================================
// 测试 2: extractRestock
// ============================================================
console.log('\n📋 Test 2: extractRestock()');

assert(extractRestock('暂时售罄 · 06月19日 10:00') === '6月19日 10:00', '解析 06月19日 10:00');
assert(extractRestock('6月1日 8:00补货') === '6月1日 8:00', '解析 6月1日 8:00');
assert(extractRestock('今日 10:00 补货') !== null, '解析今日补货');
assert(extractRestock('特惠订阅') === null, '可购买按钮无补货时间');
assert(extractRestock('') === null, '空文本返回 null');

// ============================================================
// 测试 3: scanCards（完整集成）
// ============================================================
console.log('\n📋 Test 3: scanCards()');

if (dom) {
  const cards = scanCards(dom.window.document);
  const keys = Object.keys(cards);
  assert(keys.length === 3, `找到 3 个套餐卡片，实际: ${keys.length}`);
  assert(cards.lite.status === 'sold_out', 'Lite 售罄');
  assert(cards.pro.status === 'available', 'Pro 可购买');
  assert(cards.max.status === 'sold_out', 'Max 售罄');
  assert(cards.lite.restockText === '6月19日 10:00', 'Lite 补货时间');
  assert(cards.max.restockText === '6月20日 10:00', 'Max 补货时间');
}

// ============================================================
// 测试 4: 边界情况
// ============================================================
console.log('\n📋 Test 4: 边界情况');

assert(classifyButton(null).status === 'unknown', 'null 按钮返回 unknown');
assert(classifyButton({ textContent: '', disabled: false, classList: { contains: () => false } }).status === 'unknown', '空文本返回 unknown');

const busyBtn = { textContent: '抢购人数过多', disabled: false, classList: { contains: () => false } };
assert(classifyButton(busyBtn).status === 'busy', '繁忙状态检测');

// ============================================================
// 结果
// ============================================================
console.log(`\n${'='.repeat(40)}`);
console.log(`结果: ${passed} 通过, ${failed} 失败`);
console.log(`${'='.repeat(40)}`);

process.exit(failed > 0 ? 1 : 0);
