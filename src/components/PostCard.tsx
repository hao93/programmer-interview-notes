import { Link } from 'react-router-dom'
import type { Post } from '@/types/post'
import { tagClass } from '@/lib/tagColor'
import { formatDate } from '@/lib/posts'

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <Link
            key={t}
            to={`/tag/${encodeURIComponent(t)}`}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tagClass(t)}`}
          >
            {t}
          </Link>
        ))}
      </div>
      <div className="mb-1 text-xs text-slate-400">{formatDate(post.date)}</div>
      <h3 className="text-lg font-semibold text-slate-900">
        <Link to={`/post/${post.slug}`} className="transition hover:text-indigo-600">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
      <Link
        to={`/post/${post.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600"
      >
        阅读全文
        <span className="transition group-hover:translate-x-0.5">→</span>
      </Link>
    </article>
  )
}
