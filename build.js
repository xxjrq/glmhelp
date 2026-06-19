// build.js — 将 ES module 源码打包为 MV3 兼容的单文件
// 用法: node build.js

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');
const ROOT = __dirname;

// 需要打包的文件对: [入口文件, 输出文件]
const BUNDLES = [
  { entry: 'background.js', out: 'background.js' },
  { entry: 'content.js', out: 'content.js' },
  { entry: 'popup.js', out: 'popup.js' }
];

// 共享模块（被 import 的文件）
const SHARED_MODULES = ['constants.js', 'utils.js'];

function resolveImport(source, importerDir) {
  // 解析 import './xxx.js' → 读取文件内容
  const m = source.match(/from\s+['"]\.\/(.+?)['"]/);
  if (!m) return null;
  const resolved = path.resolve(importerDir, m[1]);
  if (!fs.existsSync(resolved)) return null;
  return { path: resolved, content: fs.readFileSync(resolved, 'utf-8') };
}

function bundle(entryFile) {
  let code = fs.readFileSync(entryFile, 'utf-8');
  const dir = path.dirname(entryFile);

  // 替换所有 import 语句 — 内联被引用的模块内容
  code = code.replace(
    /import\s+\{[^}]*\}\s*from\s+['"]\.\/(.+?)['"];/g,
    (match, modulePath) => {
      // 去掉可能有的 .js 后缀，统一处理
      const cleanPath = modulePath.replace(/\.js$/, '');
      const fullPath = path.resolve(dir, cleanPath + '.js');
      if (!fs.existsSync(fullPath)) {
        console.warn(`  ⚠ 未找到模块: ${fullPath}`);
        return match;
      }
      const modCode = fs.readFileSync(fullPath, 'utf-8');
      // 递归去掉模块自己的 import
      const cleaned = modCode.replace(
        /import\s+\{[^}]*\}\s*from\s+['"]\.\/(.+?)['"];/g,
        (m2, mp2) => {
          const cp2 = mp2.replace(/\.js$/, '');
          const fp2 = path.resolve(path.dirname(fullPath), cp2 + '.js');
          if (fs.existsSync(fp2)) {
            const c2 = fs.readFileSync(fp2, 'utf-8');
            return c2.replace(/export\s+(const|function|let|var|class)\s+/g, '$1 ');
          }
          return m2;
        }
      );
      // 去掉 export 关键字
      return cleaned.replace(/export\s+(const|function|let|var|class)\s+/g, '$1 ');
    }
  );

  // 去掉残留的 export
  code = code.replace(/export\s+(const|function|let|var|class)\s+/g, '$1 ');
  code = code.replace(/export\s+\{[^}]*\};?\s*/g, '');

  return code;
}

// 清理并重建 dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 复制静态资源
const STATIC_COPIES = [
  { src: path.join(ROOT, 'manifest.json'), dest: 'manifest.json' },
  { src: path.join(SRC, 'popup.html'), dest: 'popup.html' },
  { src: path.join(SRC, 'popup.css'), dest: 'popup.css' },
  { src: path.join(SRC, 'inject.js'), dest: 'inject.js' },
  { src: path.join(SRC, 'notify.wav'), dest: 'notify.wav' }
];

for (const { src, dest } of STATIC_COPIES) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, dest));
    console.log(`  📄 ${path.basename(src)} → dist/${dest}`);
  }
}

// 打包 JS 文件
for (const { entry, out } of BUNDLES) {
  const entryPath = path.join(SRC, entry);
  if (!fs.existsSync(entryPath)) {
    console.warn(`  ⚠ 入口文件不存在: ${entryPath}`);
    continue;
  }
  const bundled = bundle(entryPath);
  fs.writeFileSync(path.join(DIST, out), bundled, 'utf-8');
  console.log(`  📦 ${entry} → dist/${out} (${bundled.length} bytes)`);
}

// 复制 icons
const ICONS_DIR = path.join(__dirname, 'icons');
if (fs.existsSync(ICONS_DIR)) {
  const iconsDist = path.join(DIST, 'icons');
  fs.mkdirSync(iconsDist, { recursive: true });
  for (const f of fs.readdirSync(ICONS_DIR)) {
    fs.copyFileSync(path.join(ICONS_DIR, f), path.join(iconsDist, f));
  }
  console.log('  🖼 icons/ → dist/icons/');
}

console.log('\n✅ 打包完成');
