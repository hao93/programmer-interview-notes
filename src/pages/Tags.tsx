import { Link } from 'react-router-dom'
import { getAllTags } from '@/lib/posts'
import { tagClass } from '@/lib/tagColor'

export default function Tags() {
  const tags = getAllTags()
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <h1 className="text-2xl font-bold text-slate-900">标签分类</h1>
      <p className="mt-2 text-sm text-slate-500">按主题筛选面试笔记，覆盖准备、实战与选择的各个阶段。</p>
      <div className="mt-6 flex flex-wrap gap-3">
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
    </div>
  )
}
