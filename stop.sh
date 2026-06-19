#!/bin/bash
# 关闭 GLM 抢购浏览器

PROFILE_DIR="${HOME}/glm-snipe-browser"

PIDS=$(pgrep -f "user-data-dir=${PROFILE_DIR}" || true)
if [[ -z "${PIDS}" ]]; then
  echo "✅ 浏览器没在运行"
  exit 0
fi

echo "🛑 关闭浏览器 (PIDs: ${PIDS})"
kill ${PIDS} 2>/dev/null || true
sleep 1
pgrep -f "user-data-dir=${PROFILE_DIR}" > /dev/null && {
  echo "   强制关闭"
  pkill -9 -f "user-data-dir=${PROFILE_DIR}"
}

rm -f "${PROFILE_DIR}/SingletonLock" "${PROFILE_DIR}/SingletonCookie" "${PROFILE_DIR}/SingletonSocket"
echo "✅ 已关闭"
