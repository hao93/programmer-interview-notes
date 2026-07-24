import { useParams, Link } from 'react-router-dom'
import { getModule, getPostsByModule } from '@/lib/posts'
import PostCard from '@/components/PostCard'

export default function Module() {
  const { id } = useParams()
  const mod = id ? getModule(id) : undefined
  const list = id ? getPostsByModule(id) : []

  return (
    <div>
      <Link to="/" className="text-sm text-slate-500 transition hover:text-indigo-600">
        ← 返回首页
      </Link>
      <h1 className="mb-2 mt-3 text-2xl font-bold text-slate-900">
        {mod ? mod.title : '未知模块'}{' '}
        <span className="text-base font-normal text-slate-400">({list.length})</span>
      </h1>
      {mod && <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-600">{mod.desc}</p>}
      {list.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          该模块下还没有文章。
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {list.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </div>
  )
}
