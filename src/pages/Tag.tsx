import { useParams, Link } from 'react-router-dom'
import { getPostsByTag } from '@/lib/posts'
import PostCard from '@/components/PostCard'

export default function Tag() {
  const { tag } = useParams()
  const decoded = tag ? decodeURIComponent(tag) : ''
  const list = getPostsByTag(decoded)

  return (
    <div>
      <Link to="/tags" className="text-sm text-slate-500 transition hover:text-indigo-600">
        ← 全部标签
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-bold text-slate-900">
        标签：{decoded} <span className="text-base font-normal text-slate-400">({list.length})</span>
      </h1>
      {list.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          该标签下还没有文章。
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
