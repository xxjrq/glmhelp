// 共享工具函数：日期解析、随机延迟、日志、消息封装

/**
 * 解析中文日期字符串如 "06月19日 10:00" → Date 对象
 * 自动推断年份（如果月日早于今天则用明年）
 * 处理时区：浏览器本地时区
 */
export function parseChineseDate(str, now = new Date()) {
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
export function randomDelay(min = 200, max = 600) {
  return new Promise(resolve => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(resolve, ms);
  });
}

/**
 * 节流：在指定窗口内最多触发一次
 */
export function throttle(fn, wait) {
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
export function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * 简单日志环（保存最近 N 条）— 便于 popup 显示
 */
export function appendLog(log, entry, max = 100) {
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
export function fmtTime(ts) {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(x => String(x).padStart(2, '0'))
    .join(':');
}

/**
 * 等待页面出现某元素，超时返回 null
 */
export function waitForElement(selector, timeout = 5000, root = document) {
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
