import { useEffect, useRef, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')
  const visible = useRef<Set<string>>(new Set())

  useEffect(() => {
    // 从已渲染的 DOM 读取标题（rehype-slug 已生成 id，避免复现 slug 算法）
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('.markdown-body h2, .markdown-body h3')
    )
    const items: Heading[] = els
      .map((el) => ({
        id: el.id,
        text: (el.textContent ?? '').replace(/[¶#]/g, '').trim(),
        level: (el.tagName === 'H2' ? 2 : 3) as 2 | 3,
      }))
      .filter((h) => h.id && h.text)
    setHeadings(items)
    if (items.length === 0) return

    // 高亮当前可视章节
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.current.add(e.target.id)
          else visible.current.delete(e.target.id)
        })
        const firstVisible = items.find((h) => visible.current.has(h.id))
        if (firstVisible) setActiveId(firstVisible.id)
      },
      { rootMargin: '-88px 0px -70% 0px', threshold: 0 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <nav className="toc sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto text-sm">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        本页目录
      </div>
      <ul className="space-y-0.5 border-l border-slate-200">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={[
                'block border-l-2 py-1 transition',
                h.level === 3 ? 'pl-7 -ml-px' : 'pl-4 -ml-px',
                activeId === h.id
                  ? 'border-indigo-500 font-medium text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
              ].join(' ')}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
