#!/bin/bash
# GLM 抢购助手 — 启动专用浏览器
# 每次都打开同一个 Chrome 实例，登录态、扩展常驻

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="${PROJECT_DIR}/dist"
PROFILE_DIR="${HOME}/glm-snipe-browser"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LOCK_FILE="${PROFILE_DIR}/SingletonLock"

if [[ ! -d "${EXT_DIR}" || ! -f "${EXT_DIR}/manifest.json" ]]; then
  echo "❌ 扩展未打包。先运行: node build.js"
  exit 1
fi

if [[ ! -x "${CHROME}" ]]; then
  echo "❌ 找不到 Chrome: ${CHROME}"
  exit 1
fi

mkdir -p "${PROFILE_DIR}"

if [[ -f "${LOCK_FILE}" ]]; then
  if pgrep -f "user-data-dir=${PROFILE_DIR}" > /dev/null; then
    echo "✅ 浏览器已经在运行"
    echo "   profile: ${PROFILE_DIR}"
    echo "   提示：直接切到那个 Chrome 窗口即可"
    exit 0
  else
    echo "🧹 清理失效的 SingletonLock"
    rm -f "${LOCK_FILE}" "${PROFILE_DIR}/SingletonCookie" "${PROFILE_DIR}/SingletonSocket"
  fi
fi

echo "🚀 启动 GLM 抢购浏览器"
echo "   profile: ${PROFILE_DIR}"
echo "   扩展:    ${EXT_DIR}"
echo ""

FIRST_RUN=0
if [[ ! -d "${PROFILE_DIR}/Default/Extensions" ]] && [[ -z "$(ls -A ${PROFILE_DIR} 2>/dev/null | grep -v '^\.')" || ! -f "${PROFILE_DIR}/Default/Preferences" ]]; then
  FIRST_RUN=1
fi

START_URL="https://bigmodel.cn/glm-coding?plantype=personal"
if [[ "${FIRST_RUN}" == "1" ]] || [[ "$1" == "--install" ]]; then
  START_URL="chrome://extensions/"
fi

"${CHROME}" \
  --user-data-dir="${PROFILE_DIR}" \
  --load-extension="${EXT_DIR}" \
  --disable-extensions-except="${EXT_DIR}" \
  --no-first-run \
  --no-default-browser-check \
  --remote-debugging-port=9222 \
  "${START_URL}" \
  > /tmp/glm-snipe-browser.log 2>&1 &

BROWSER_PID=$!
echo "✅ 已启动 (PID: ${BROWSER_PID})"

if [[ "${START_URL}" == "chrome://extensions/" ]]; then
  echo ""
  echo "⚠️  首次安装：请在打开的 chrome://extensions 页面手动操作 3 步："
  echo ""
  echo "    1. 打开右上角【开发者模式】开关"
  echo "    2. 点【加载已解压的扩展程序】(Load unpacked)"
  echo "    3. 选择目录: ${EXT_DIR}"
  echo ""
  echo "    搞定后扩展就常驻了，下次 ./start.sh 自动加载，无需再装。"
else
  echo ""
  echo "下一步：在打开的 Chrome 里登录 bigmodel.cn（如未登录）"
  echo "   登录态保存在 ${PROFILE_DIR}，下次自动恢复"
fi
echo ""
echo "重装扩展：./start.sh --install"
echo "停止：    ./stop.sh"
echo "日志：    tail -f /tmp/glm-snipe-browser.log"
