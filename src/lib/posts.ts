import type { Post } from '@/types/post'

// 通过 Vite 的 import.meta.glob 在构建时把所有 Markdown 作为原始字符串读入
const postModules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const aboutModule = import.meta.glob('../content/about.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

interface Frontmatter {
  data: Record<string, unknown>
  content: string
}

function parseFrontmatter(raw: string): Frontmatter {
  // 归一化换行：部分文件因 Windows 文本模式写回带 CRLF，正则需统一为 LF
  const text = raw.replace(/\r\n?/g, '\n')
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: text }

  const data: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!m) continue
    const key = m[1].trim()
    let val = m[2].trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = val.replace(/^["']|["']$/g, '')
    }
  }
  return { data, content: match[2] }
}

// 渐进式阅读顺序（由浅入深）：
// 总览 → 面试网站大全(资源导航) → 面试场景(全流程/HR谈薪/英文) → 计算机基础（基础/并发/网络/MySQL·Redis）
// → Java/Spring → 算法 → MQ → RPC/微服务治理 → 分布式事务（系统设计基石）
// → 支付体系（跨境设计/全链路/架构全景/渠道路由/账务/清结算/对账/风控/高频题）→ 技术补漏(安全/OS/设计模式/云原生/可观测/分库分表)
// → 项目深挖（亮点/4段经历/高可用容灾）→ 项目管理 → 团队管理 → AI/LLM·RAG → 术语考点
// 未列出的文章按日期兜底排在最后。
const ORDER: string[] = [
  '准备-复习总览与进度看板',
  '准备-Java面试网站大全（50+）',
  '准备-面试全流程场景准备（从笔试到入职）',
  '准备-HR面与薪酬谈判实战（含Offer选择）',
  '准备-英文面试与技术英语表达',
  '准备-程序员面试基础知识大全',
  '准备-并发编程与JMM深挖',
  '准备-线程池深度调优与高并发实践',
  '准备-网络TCP与RPC实践',
  '准备-MySQL与Redis高频面试',
  '准备-MySQL索引原理与查询优化实战',
  '准备-MySQL事务锁机制与MVCC深度解析',
  '准备-MySQL性能调优与高可用架构',
  '准备-Redis核心原理与数据结构深度解析',
  '准备-Redis高可用与集群架构实战',
  '准备-Redis缓存设计与分布式锁实战',
  '准备-Java与Spring深度准备',
  '准备-GC深度调优与ZGC实战',
  '准备-Java 2026面试新增考点与风向变化',
  '准备-算法刷题路线',
  '准备-算法面试高频题型拆解与频率优先级（基于公开面经统计）',
  '准备-LeetCode热题Top100题解索引与攻坚路线',
  '准备-消息队列MQ面试准备',
  '准备-RPC框架与微服务治理',
  '准备-分布式事务与一致性',
  '准备-事务一致性全景：MySQL本地事务·Spring声明式事务·分布式事务（XTransfer实战）',
  '准备-分布式共识协议Raft与Paxos深度解析',
  '准备-分布式集群架构与一致性哈希',
  '准备-DDD领域驱动设计实战指南',
  '准备-架构建模方法论（从事件风暴到C4：10年架构师的建模心法）',
  '准备-架构图绘制方法论（C4模型与架构师的视觉表达）',
  '准备-2026系统设计面试演进（AI基础设施+全球化高并发）',
  '准备-高可用跨境支付系统设计',
  '准备-支付系统全链路架构',
  '准备-支付系统架构与核心链路全景',
  '准备-支付渠道路由设计',
  '准备-账务账户体系与复式记账',
  '准备-清结算体系',
  '准备-支付对账体系与差错处理',
  '准备-支付风控与反欺诈体系',
  '准备-支付系统高频面试题集',
  '准备-大厂后端高频面试题汇总（2026）',
  '准备-资深后端开放式场景设计题（10年+）',
  '准备-架构师高频面试题深度解析（10年+思维版）',
  '准备-架构师软硬实力全景（15项能力深度拆解+自问自答+未来演进）',
  '准备-资损防控与极端场景应急（事前中后）',
  '准备-后端技术补漏（Web安全·OS·设计模式·云原生·可观测）',
  '准备-单元测试实战与架构师视角（FIRST·测试替身·可测试性·覆盖率）',
  '准备-支付项目亮点沉淀',
  '准备-XTransfer跨境支付收款平台深度复盘',
  '准备-哈啰工单与薪资系统实战',
  '准备-欧凡海外直播电商系统实战',
  '准备-携程数据化运营平台实战',
  '准备-高可用容灾与稳定性',
  '准备-项目管理与工程实践',
  '准备-团队管理与技术领导力',
  '准备-AI与LLM工程落地探索',
  '准备-向量检索与RAG实践',
  '准备-AI认知与未来（是什么·能做什么·问题·未来工作与生活）',
  '准备-AI未来发展方向深度展望（趋势研判与架构师视角）',
  '准备-面试核心术语详解',
  '准备-面试高频考点深度追问',
]

function orderIndex(slug: string): number {
  const i = ORDER.indexOf(slug)
  return i === -1 ? ORDER.length : i
}

export const posts: Post[] = Object.entries(postModules)
  .map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const { data, content } = parseFrontmatter(raw)
    return {
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || '',
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      excerpt: (data.excerpt as string) || '',
      content,
    } as Post
  })
  .sort((a, b) => {
    const oa = orderIndex(a.slug)
    const ob = orderIndex(b.slug)
    if (oa !== ob) return oa - ob
    return a.date < b.date ? 1 : -1
  })

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getAllTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>()
  for (const p of posts) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export function getPostsByTag(tag: string): Post[] {
  return posts.filter((p) => p.tags.includes(tag))
}

// 模块浏览：每个模块聚合一组标签（一篇文章可同时属于多个模块，与复习规划一致）
export interface BlogModule {
  id: string
  title: string
  desc: string
  tags: string[]
}

export const MODULES: BlogModule[] = [
  {
    id: 'review',
    title: '① 复习规划',
    desc: '总览、节奏、进度看板；50+ Java 面试网站导航；面试全流程场景（笔试→各轮→入职）、HR 面与谈薪实战、英文面试表达。',
    tags: ['复习规划'],
  },
  {
    id: 'cs',
    title: '② 计算机基础',
    desc: '基础大全、并发/JMM、网络、MySQL 与 Redis 高频；MySQL 专项（索引/事务/调优）、Redis 专项（原理/集群/缓存锁）。',
    tags: ['计算机基础'],
  },
  {
    id: 'java',
    title: '③ Java 与 Spring',
    desc: 'JVM、Java 并发、Spring 全家桶与 MyBatis 深度。',
    tags: ['Java与Spring'],
  },
  {
    id: 'algo',
    title: '④ 算法与数据结构',
    desc: '按题型建错题本，映射到支付场景（含 LeetCode 链接）。',
    tags: ['算法'],
  },
  {
    id: 'mq',
    title: '⑤ 消息队列 MQ',
    desc: '面试准备路径 + Kafka/RocketMQ 高频题集（可靠性/顺序/幂等/积压/事务）。',
    tags: ['MQ消息队列'],
  },
  {
    id: 'design',
    title: '⑥ 系统设计与支付',
    desc: '分布式事务与一致性、共识与集群、高可用跨境支付架构、支付全链路/对账/风控、渠道路由、账务与清结算、DDD、后端技术补漏、开放式场景题。',
    tags: ['系统设计'],
  },
  {
    id: 'project',
    title: '⑦ 项目深挖',
    desc: '支付项目亮点沉淀、高可用与容灾、4 段真实经历复盘。',
    tags: ['项目深挖'],
  },
  {
    id: 'pm',
    title: '⑧ 项目管理',
    desc: '研发流程、需求排期、风险进度、工作中真实问题复盘。',
    tags: ['项目管理'],
  },
  {
    id: 'team',
    title: '⑨ 团队管理',
    desc: '招聘培养、激励绩效、冲突处理、技术领导力与转型。',
    tags: ['团队管理'],
  },
  {
    id: 'ai',
    title: '⑩ AI / 新技术探索',
    desc: 'LLM 落地、向量检索与 RAG 实践。',
    tags: ['AI探索'],
  },
  {
    id: 'terms',
    title: '⑪ 术语与考点',
    desc: '核心术语详解、基础知识点与面试深度追问。',
    tags: ['术语考点'],
  },
]

export function getModule(id: string): BlogModule | undefined {
  return MODULES.find((m) => m.id === id)
}

export function getPostsByModule(id: string): Post[] {
  const mod = getModule(id)
  if (!mod) return []
  const set = new Set(mod.tags)
  return posts.filter((p) => p.tags.some((t) => set.has(t)))
}

export function getAboutContent(): string {
  const key = Object.keys(aboutModule)[0]
  if (!key) return ''
  return parseFrontmatter(aboutModule[key]).content
}

export function formatDate(date: string): string {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`
}
