// Popup — 配置界面逻辑
import { STORAGE_KEYS, DEFAULT_CONFIG, MSG, PLAN_INDEX, PLAN_NAMES } from './constants.js';
import { fmtTime } from './utils.js';

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

  if (st.lastPurchaseTriggered) {
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
  for (const key of Object.keys(PLAN_INDEX)) {
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
fetchState();
