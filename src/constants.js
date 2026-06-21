export const STORAGE_KEYS = {
  CONFIG: 'glm_snipe_config',
  STATE: 'glm_snipe_state',
  LOG: 'glm_snipe_log'
};

export const DEFAULT_CONFIG = {
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

export const PLAN_INDEX = { lite: 1, pro: 2, max: 3 };

export const PLAN_NAMES = {
  lite: 'GLM Coding Lite',
  pro: 'GLM Coding Pro',
  max: 'GLM Coding Max',
  team_standard: 'GLM Coding 团队标准版',
  team_premium: 'GLM Coding 团队高级版'
};

export const TEAM_PLAN_MATCHERS = {
  team_standard: '标准版',
  team_premium: '高级版'
};

export const SELECTORS = {
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

export const BUTTON_STATUS = {
  SOLD_OUT_RE: /售罄|补货|暂时/,
  BUSY_RE: /抢购人数过多|请刷新/,
  PURCHASABLE_TEXTS: ['特惠订阅', '立即订阅', '立即购买', '购买']
};

export const RESTOCK_RE = /(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/;

export const RATE_LIMIT_TEXT = '当前购买人数较多';

export const MSG = {
  TOGGLE_ENABLED: 'toggle_enabled',
  UPDATE_CONFIG: 'update_config',
  GET_STATE: 'get_state',
  PLAN_STATE_CHANGED: 'plan_state_changed',
  PURCHASE_TRIGGERED: 'purchase_triggered',
  TRIGGER_REFRESH: 'trigger_refresh',
  TRIGGER_SCAN: 'trigger_scan',
  STATE_BROADCAST: 'state_broadcast'
};

export const ALARMS = {
  HEARTBEAT: 'glm_heartbeat',
  REFILL_PREP: 'glm_refill_prep'
};

export const API = {
  PRODUCT_INFO: '/api/biz/tokenResPack/productIdInfo',
  TOKEN_MAGNITUDE: '/api/biz/customer/getTokenMagnitude',
  PREVIEW: '/api/biz/pay/preview',
  CHECK: '/api/biz/pay/check'
};

export const WATCHED_API_RE = /\/api\/biz\/(tokenResPack\/productIdInfo|customer\/getTokenMagnitude|pay\/(preview|check))/;

export const PRODUCTS = {
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

export const VERIFY_SELECTORS = [
  '[class*="verify"]', '[class*="captcha"]', '[class*="geetest"]',
  '[class*="tcaptcha"]', '[class*="yidun"]',
  '[id*="verify"]', '[id*="captcha"]', '[id*="geetest"]',
  '.geetest_panel', '.yidun_panel'
];

export const VERIFY_TEXT_KEYWORDS = [
  '安全验证', '安全检测', '请完成验证', '滑动验证', '拖动滑块',
  '图形验证', '人机验证', '点击验证', '请验证', '验证码',
  '请拖动', '按住滑块', '向右滑动'
];

export const CONFIRM_TEXTS = ['确认支付', '同意并继续', '确认购买', '确认订阅', '已知悉，继续订阅', '继续订阅', '立即支付', '去支付', '提交订单', '下一步', '继续', '确认', '确定', '同意'];

export const CONFIRM_NEGATIVE = ['取消', '放弃', '返回', '关闭', '退出', '拒绝', '不同意', '稍后', '暂不'];

export const AGREEMENT_HINT = ['同意', '协议', '已阅读'];

export const BALANCE_PAY_TEXTS = ['账户余额', '余额支付', '余额付款', '账户支付', '余额'];

export const FINAL_PAY_TEXTS = ['确认支付', '立即支付', '确认付款', '去支付'];

export const PAY_DIALOG_SELECTORS = ['.pay-dialog', '.el-dialog__wrapper', '.el-dialog', '[role="dialog"]', '[class*="dialog"]', '[class*="modal"]'];

export const PAY_SUCCESS_SELECTORS = ['.pay-success-dialog-box'];

export const PURCHASE_RESULT = {
  SUCCESS: ['支付成功', '购买成功', '开通成功', '订阅成功', '订单成功', '感谢购买'],
  FAILURE: ['支付失败', '购买失败', '已售罄', '库存不足', '抢购人数过多', '余额不足', '订单失败', '抢购失败', '名额已满']
};
