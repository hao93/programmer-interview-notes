#!/usr/bin/env bash
#
# deploy-gh-pages.sh — 《程序员面试手记》一键部署到 GitHub Pages
#
# 用法（在 Git Bash 中执行其一）：
#   bash app/scripts/deploy-gh-pages.sh
#   ./app/scripts/deploy-gh-pages.sh        # 需先 chmod +x
#
# 会依次完成：校验 gh 登录 → npm run build → 把 dist 推到 gh-pages 分支
#             → 幂等启用 Pages → 校验站点可访问。
#
# 设计要点（踩坑后的加固）：
#   1. 绝不用 /tmp 做 worktree（Windows Git Bash 下 /tmp 会落到 C:/tmp，
#      而 cd /tmp 解析到别处，导致切目录失败、误删主工作区）。
#   2. ★ 用【相对路径】的 worktree（../.ghpages_wt），彻底规避 Git for Windows
#      把 /c/... 或 C:/... 误写成 C:/c/... 的"双重前缀"bug（会让 worktree 建在空中、
#      并残留删除不掉的幻影）。
#   3. 脚本顶部用 git worktree list --porcelain + tail -n +2 枚举并强制移除
#      所有【非主】worktree（跳过首个主工作区，避免误删源码），清掉历史幻影。
#   4. set -euo pipefail + && 串联，任一步失败立即中止。
#   5. gh-pages 用 orphan 分支，每次重建，干净无历史包袱；Pages 配置幂等 PUT。
#
set -euo pipefail

# ---------- 路径解析（基于脚本自身位置，跨机器稳定） ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"           # .../app
WS_DIR="$(dirname "$APP_DIR")"               # workspace 根（含 .tools）
GH_EXE="$WS_DIR/.tools/gh/bin/gh.exe"

# ---------- 定位 gh ----------
if command -v gh >/dev/null 2>&1; then
  GH="gh"
elif [ -x "$GH_EXE" ]; then
  GH="$GH_EXE"
else
  echo "❌ 未找到 gh CLI。请先运行 '$GH_EXE auth login --web' 或安装 gh。" >&2
  exit 1
fi
export PATH="$(dirname "$GH"):$PATH"
echo "ℹ️  使用 gh: $GH"

# ---------- 校验登录 ----------
"$GH" auth setup-git 2>/dev/null || true
if ! "$GH" auth status >/dev/null 2>&1; then
  echo "❌ gh 未登录。请先运行: $GH auth login --web" >&2
  exit 1
fi
REPO="$("$GH" repo view --json nameWithOwner -q .nameWithOwner)"
echo "ℹ️  目标仓库: $REPO"

# ---------- 进入 app，确认干净并构建 ----------
cd "$APP_DIR"
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  警告：main 分支有未提交改动，将按当前磁盘内容部署（github 源码不会自动提交）。" >&2
fi
echo "🔧 构建站点 (npm run build) ..."
npm run build

# ---------- 整站加密（生成仅含密文的外壳 index.html，无密码看不到正文） ----------
if [ -z "${SITE_PASSWORD:-}" ]; then
  read -s -r -p "🔐 请输入站点访问密码（不会保存，仅本次加密使用）: " SITE_PASSWORD
  echo
fi
if [ -z "$SITE_PASSWORD" ]; then
  echo "❌ 未提供密码，中止部署以免泄露明文。" >&2
  exit 1
fi
export SITE_PASSWORD
# 注意：已 cd 到 APP_DIR，这里必须用相对路径调用 node。
# 否则 Git Bash 的 /c/... 形式路径会被 Windows node 误解成 C:\c\...（双重前缀）。
node scripts/encrypt-site.mjs
unset SITE_PASSWORD
# 清理产物中可能存在的无关残留文件，避免公开无关内容
rm -f dist/java面试网站书签.html

# ---------- 发布 gh-pages（相对路径的 orphan worktree，规避 Windows 盘符双重前缀） ----------
# 第一步：清掉所有历史残留/幻影 worktree（跳过首个=主工作区，绝不误删源码）
echo "🧹 清理历史残留 worktree ..."
git worktree list --porcelain | awk '/^worktree /{print $2}' | tail -n +2 | while read -r wt; do
  git worktree remove --force "$wt" 2>/dev/null || true
done
git worktree prune 2>/dev/null || true
git branch -D gh-pages 2>/dev/null || true     # 删本地旧分支，orphan 重建
rm -rf "$APP_DIR/../.ghpages_wt"               # 保险：删掉可能残留的目录

# 第二步：相对路径 worktree（cwd=app，../.ghpages_wt 落在 workspace 根，无盘符歧义）
WT_REL="../.ghpages_wt"
echo "📦 准备 gh-pages 分支 (worktree 相对于 app: $WT_REL) ..."
git worktree add --orphan -b gh-pages "$WT_REL"   # 失败会由 set -e 立即中止

cd "$WT_REL"
cp -r "$APP_DIR/dist/." .
touch .nojekyll
git add -A
if git diff --cached --quiet; then
  echo "ℹ️  内容无变化，跳过提交（仍确保远端为最新）。"
else
  git commit -q -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "✅ 已提交 gh-pages"
fi

echo "🚀 推送到 origin/gh-pages ..."
git push -u origin gh-pages --force

# ---------- 启用 Pages（幂等 PUT） ----------
echo "⚙️  确保 GitHub Pages 已启用 (gh-pages /) ..."
"$GH" api -X PUT "repos/$REPO/pages" \
  -f "source[branch]=gh-pages" \
  -f "source[path]=/" >/dev/null 2>&1 || true

# ---------- 清理 worktree，回到 main ----------
cd "$APP_DIR"
git worktree remove --force "$WT_REL" 2>/dev/null || true
git worktree prune 2>/dev/null || true

# ---------- 验证可访问 ----------
sleep 6
OWNER_LOWER="$(echo "$REPO" | tr '[:upper:]' '[:lower:]')"
SLUG="${OWNER_LOWER#*/}"
CNAME="$("$GH" api "repos/$REPO/pages" -q .cname 2>/dev/null || true)"

# 优先验证自定义域名（若有），它是账号下 Pages 的真实可达地址
if [ -n "$CNAME" ]; then
  CUST="http://${CNAME}/${SLUG}/"
  echo "🔗 自定义域名: $CUST"
  CCODE="$(curl -s -m 30 -o /dev/null -w '%{http_code}' -L "$CUST" || true)"
  echo "🌐 自定义域名 HTTP $CCODE"
fi

# github.io 默认地址（若账号配了自定义域名，会 301 跳转到自定义域名，可能偶发 000）
URL="https://${OWNER_LOWER%/*}.github.io/${SLUG}/"
echo "🔗 默认地址: $URL"
CODE="$(curl -s -m 30 -o /dev/null -w '%{http_code}' -L "$URL" || true)"
echo "🌐 默认地址 HTTP $CODE"
if [ "$CODE" = "000" ]; then
  echo "   （000 = 默认域名已跳转自定义域名，属正常；以自定义域名为准）"
fi

echo ""
echo "✅ 部署完成。"
