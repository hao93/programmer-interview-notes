import { Link } from 'react-router-dom'
import { posts, getAllTags, MODULES, getPostsByModule } from '@/lib/posts'
import { tagClass } from '@/lib/tagColor'
import PostCard from '@/components/PostCard'
import {
  ClipboardList,
  Cpu,
  Code2,
  Network,
  FolderSearch,
  Sparkles,
  Coffee,
  BookOpen,
  KanbanSquare,
  Users,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  review: ClipboardList,
  cs: Cpu,
  java: Coffee,
  algo: Code2,
  mq: MessageSquare,
  design: Network,
  project: FolderSearch,
  pm: KanbanSquare,
  team: Users,
  ai: Sparkles,
  terms: BookOpen,
}

export default function Home() {
  const tags = getAllTags()

  return (
    <div className="space-y-10">
      {/* Hero（文档风欢迎区） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold tracking-wide text-indigo-600">
              INTERVIEW PREP · 知识库
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              面试前准备知识库
            </h1>
            <p className="mt-3 leading-7 text-slate-600">
              以「模块」组织的面试准备文档：从计算机基础、算法、系统设计到项目深挖，
              并结合真实的跨境支付项目深入讲解，覆盖 AI / LLM 等最新技术探索。
            </p>
          </div>
          <div className="flex shrink-0 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{posts.length}</div>
              <div className="text-xs text-slate-400">文档</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{MODULES.length}</div>
              <div className="text-xs text-slate-400">模块</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{tags.length}</div>
              <div className="text-xs text-slate-400">标签</div>
            </div>
          </div>
        </div>
      </section>

      {/* 按模块浏览 */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">按模块浏览</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ id, title, desc }) => {
            const Icon = ICONS[id] ?? ClipboardList
            const count = getPostsByModule(id).length
            return (
              <Link
                key={id}
                to={`/module/${id}`}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{desc}</p>
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {count} 篇
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 文章列表 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-slate-900">全部准备文档</h2>
          <Link to="/tags" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            全部标签 →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </section>

      {/* 标签云 */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">标签云</h2>
        <div className="flex flex-wrap gap-2.5">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              to={`/tag/${encodeURIComponent(tag)}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition hover:opacity-80 ${tagClass(tag)}`}
            >
              {tag} <span className="opacity-70">({count})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
