import { Link, NavLink } from 'react-router-dom'
import { MODULES, getPostsByModule } from '@/lib/posts'
import { cn } from '@/lib/utils'
import {
  Terminal,
  Home as HomeIcon,
  Tags as TagsIcon,
  User,
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

const navItems = [
  { to: '/', label: '首页', icon: HomeIcon, end: true },
  { to: '/tags', label: '标签', icon: TagsIcon, end: false },
  { to: '/about', label: '关于', icon: User, end: false },
]

// 各模块文章数（一次性计算）
const moduleCounts: Record<string, number> = {}
MODULES.forEach((m) => {
  moduleCounts[m.id] = getPostsByModule(m.id).length
})

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* 站点标识 */}
      <Link
        to="/"
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-100 px-5 transition hover:bg-slate-50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
          <Terminal className="h-5 w-5" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold tracking-tight text-slate-900">程序员面试手记</span>
          <span className="text-[11px] text-slate-400">面试前准备知识库</span>
        </span>
      </Link>

      {/* 导航区 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* 模块列表 */}
        <div className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          知识模块
        </div>
        <div className="space-y-0.5">
          {MODULES.map(({ id, title }) => {
            const Icon = ICONS[id] ?? ClipboardList
            const count = moduleCounts[id] ?? 0
            return (
              <NavLink
                key={id}
                to={`/module/${id}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                    isActive
                      ? 'bg-indigo-50 font-medium text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-500" />
                <span className="flex-1 truncate">{title}</span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 group-hover:bg-white">
                  {count}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* 底部 */}
      <div className="shrink-0 border-t border-slate-100 px-5 py-3.5 text-[11px] leading-5 text-slate-400">
        © {new Date().getFullYear()} 程序员面试手记
        <br />
        内容基于多个一线互联网公司真实项目
      </div>
    </div>
  )
}
