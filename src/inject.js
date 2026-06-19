// inject.js — 注入到页面主上下文（MAIN world）
// hook fetch 拦截库存 API 响应，第一时间通知 content script

(function() {
  const origFetch = window.fetch;

  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

    const res = await origFetch.apply(this, args);

    // 只拦截库存相关 API
    if (url.includes('/api/biz/pay/preview') || url.includes('/api/biz/pay/check')) {
      const clone = res.clone();
      try {
        const body = await clone.text();
        window.postMessage({
          source: 'glm-snipe-inject',
          kind: 'inventory_response',
          url: url.slice(0, 200),
          payload: body.slice(0, 2000)
        }, '*');
      } catch (e) {}
    }

    return res;
  };

  // 也 hook XHR
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._glmUrl = typeof url === 'string' ? url : (url?.href || '');
    return origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('load', function() {
      if (this._glmUrl && (this._glmUrl.includes('/api/biz/pay/preview') || this._glmUrl.includes('/api/biz/pay/check'))) {
        window.postMessage({
          source: 'glm-snipe-inject',
          kind: 'inventory_response',
          url: this._glmUrl,
          payload: (this.responseText || '').slice(0, 2000)
        }, '*');
      }
    });
    return origSend.apply(this, args);
  };

  console.log('[GLM Snipe Inject] fetch/XHR hook installed');
})();
