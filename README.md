# GLM 套餐抢购助手

一个用于监听 `bigmodel.cn` GLM Coding 套餐补货状态的 Chrome 扩展。扩展可以在目标套餐按钮变为可购买时提醒用户，并按配置触发点击流程。

> 适用场景：GLM Coding 套餐经常短时间补货、售罄，用户希望减少手动刷新和错过补货窗口的情况。

## 功能特性

- 支持监听 Lite / Pro / Max 目标套餐
- 通过 `fetch` / `XMLHttpRequest` hook 捕获库存相关接口响应
- 通过 `MutationObserver` 监听页面 DOM 变化
- 每 1 秒执行一次心跳扫描，兜底检查套餐卡片状态
- 可配置自动点击购买按钮
- 支持 Chrome 桌面通知和声音提示
- Popup 弹窗展示当前状态、目标套餐、配置项和实时日志

## 安全说明

本项目公开仓库只包含源码和静态资源，不包含：

- Chrome 扩展打包私钥 `*.pem`
- 已打包的 `dist/` 目录
- `.crx` 安装包
- 浏览器登录态或本地 profile

请不要将自己的账号信息、Cookie、支付信息、Chrome profile 或私钥提交到仓库。

## 目录结构

```text
.
├── manifest.json           # Chrome MV3 manifest
├── build.js                # 简易打包脚本，生成 dist/
├── src/
│   ├── background.js       # service worker，状态/日志/通知
│   ├── content.js          # 页面扫描、DOM 监听、点击流程
│   ├── inject.js           # fetch/XHR hook
│   ├── popup.html          # 扩展弹窗
│   ├── popup.css
│   ├── popup.js
│   ├── constants.js
│   ├── utils.js
│   └── notify.wav
├── icons/                  # 扩展图标
├── test/                   # 逻辑测试和 fixture
├── start.sh                # macOS 下启动带扩展的 Chrome
└── stop.sh                 # 停止专用 Chrome profile
```

## 安装依赖

```bash
npm install
```

## 运行测试

```bash
npm test
```

测试覆盖核心纯逻辑：

- 按钮状态分类 `sold_out` / `available` / `busy` / `unknown`
- 补货时间解析
- 套餐卡片扫描

## 构建扩展

```bash
npm run build
```

构建后会生成：

```text
dist/
├── manifest.json
├── background.js
├── content.js
├── inject.js
├── popup.html
├── popup.css
├── popup.js
├── notify.wav
└── icons/
```

## 在 Chrome 中加载

### 方式一：手动加载

1. 执行构建：

   ```bash
   npm run build
   ```

2. 打开 Chrome：

   ```text
   chrome://extensions/
   ```

3. 打开右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本项目生成的 `dist/` 目录

### 方式二：macOS 启动脚本

```bash
npm run build
npm run start
```

脚本会使用独立 Chrome profile：

```text
~/glm-snipe-browser
```

停止：

```bash
npm run stop
```

## 使用方法

1. 构建并加载扩展
2. 打开 `https://bigmodel.cn/glm-coding?plantype=personal`
3. 点击 Chrome 工具栏中的扩展图标
4. 在 Popup 中选择目标套餐 Lite / Pro / Max
5. 根据需要开启自动点击、通知、声音提示
6. 保持页面打开，扩展会持续监听套餐状态

## 工作原理

扩展使用三路机制提高补货感知速度：

1. **接口响应捕获**：`inject.js` hook `fetch` 和 `XMLHttpRequest`，观察库存相关 API 响应。
2. **DOM 变化监听**：`content.js` 使用 `MutationObserver`，页面套餐按钮变化后立即重新扫描。
3. **心跳兜底扫描**：定时执行 `scanCards()`，避免漏掉未触发明显 DOM 变化的状态更新。

当目标套餐按钮从售罄状态变为可购买状态时，扩展会根据配置执行提醒或点击流程。

## 免责声明

本项目仅用于学习 Chrome Extension、页面状态监听和自动化提醒机制。请遵守目标网站服务条款，谨慎使用自动点击功能。任何账号、支付、订单相关操作都应由用户自行确认并承担责任。

## License

MIT
