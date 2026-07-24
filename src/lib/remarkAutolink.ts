/**
 * remark 插件：把正文文本里的「裸地址」自动转成可点击链接。
 * - 支持带协议的完整 URL（https://... / http://...）
 * - 支持不带协议的裸域名（如 nowcoder.com、leetcode.cn/problems）
 * 安全策略：只处理 text 节点，且不进入已有的 link 节点，避免二次包裹或破坏
 * 行内代码 / 代码块 / 已有 Markdown 链接。TLD 采用白名单，避免把 posts.ts、
 * index.css、pom.xml 等文件名误判成域名。
 */

// 常见 TLD 白名单（小写）。刻意不含 js/ts/css/md/xml/yml 等，避免误伤文件名。
const TLD =
  'com|cn|org|io|net|dev|me|co|edu|gov|info|tech|cc|ai|top|xyz|tv|app|pro|so|fun|site|online|vip'

// 终止字符集：空白 + 常见中英文标点/括号/引号，避免把后面的标点吞进链接。
const STOP = '\\s，。、；：！？（）()【】\\[\\]「」『』《》“”‘’"\'`|<>'

const URL_RE = new RegExp(
  // 1) 完整 URL
  `(https?:\\/\\/[^${STOP}]+)` +
    // 2) 裸域名（可带路径），域名标签为小写字母/数字/连字符
    `|((?:[a-z0-9-]+\\.)+(?:${TLD})(?:\\/[^${STOP}]*)?)`,
  'gi',
)

// 去掉链接尾部可能误吞的收尾标点
function trimTrailing(raw: string): string {
  return raw.replace(/[.,;:!?)】」』”’"'>]+$/u, '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function splitText(node: any): any[] | null {
  const value: string = node.value
  URL_RE.lastIndex = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = []
  let last = 0
  let found = false
  let match: RegExpExecArray | null
  while ((match = URL_RE.exec(value))) {
    let raw = match[0]
    const start = match.index
    // 修正被吞的尾部标点
    const trimmed = trimTrailing(raw)
    if (trimmed.length === 0) continue
    raw = trimmed
    if (start > last) out.push({ type: 'text', value: value.slice(last, start) })
    const url = raw.startsWith('http') ? raw : `https://${raw}`
    out.push({
      type: 'link',
      url,
      title: null,
      children: [{ type: 'text', value: raw }],
    })
    last = start + raw.length
    found = true
    // 因为 trim 可能缩短 raw，需要把正则游标回退到实际结束位置
    URL_RE.lastIndex = last
  }
  if (!found) return null
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) })
  return out
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function walk(node: any): void {
  if (!node || !Array.isArray(node.children)) return
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (!child) continue
    if (child.type === 'link' || child.type === 'linkReference') continue // 不进入已有链接
    if (child.type === 'inlineCode' || child.type === 'code') continue // 不动代码
    if (child.type === 'text') {
      const replaced = splitText(child)
      if (replaced) {
        node.children.splice(i, 1, ...replaced)
        i += replaced.length - 1
      }
    } else if (Array.isArray(child.children)) {
      walk(child)
    }
  }
}

export function remarkAutolink() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    walk(tree)
  }
}

export default remarkAutolink
