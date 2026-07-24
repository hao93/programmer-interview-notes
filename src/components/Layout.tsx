import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* 桌面端：左侧固定侧边栏 */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 shadow-[1px_0_0_rgba(0,0,0,0.02)] lg:block">
        <Sidebar />
      </div>

      {/* 移动端：抽屉式侧边栏 */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="animate-drawer-in absolute inset-y-0 left-0 w-72 max-w-[82%] border-r border-slate-200 shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* 右侧内容区 */}
      <div className="lg:pl-72">
        {/* 移动端顶栏 */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="打开菜单"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">
            程序员面试手记
          </span>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-7 lg:px-10 lg:py-10">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-[13px] text-slate-400 lg:px-10">
          © {new Date().getFullYear()} 程序员面试手记 · 面试前准备知识库
        </footer>
      </div>
    </div>
  )
}
