import { useParams, Link } from 'react-router-dom'
import { posts, getPost } from '@/lib/posts'
import { tagClass } from '@/lib/tagColor'
import { formatDate } from '@/lib/posts'
import { Markdown } from '@/components/Markdown'
import TableOfContents from '@/components/TableOfContents'
import ReadingProgress from '@/components/ReadingProgress'

export default function Post() {
  const { slug } = useParams()
  const post = slug ? getPost(slug) : undefined

  if (!post) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-slate-600">没有找到这篇文章。</p>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-indigo-600">
          ← 返回首页
        </Link>
      </div>
    )
  }

  const idx = posts.findIndex((p) => p.slug === post.slug)
  const prev = posts[idx + 1]
  const next = posts[idx - 1]

  return (
    <>
      <ReadingProgress />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10">
        {/* 正文 */}
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7 lg:p-9">
          <Link
            to="/"
            className="text-sm text-slate-500 transition hover:text-indigo-600"
          >
            ← 返回列表
          </Link>

          {/* 移动端目录：宽屏由右侧 TOC 提供，小屏折叠在正文顶部便于跳转 */}
          <details className="group mb-5 mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-700">
              本页目录
              <span className="text-slate-400 transition-transform group-open:rotate-90">›</span>
            </summary>
            <div className="mt-2">
              <TableOfContents />
            </div>
          </details>

          <div className="mt-4 flex flex-wrap gap-2">
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

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            {post.title}
          </h1>
          <div className="mt-2 text-sm text-slate-400">{formatDate(post.date)}</div>
          <hr className="my-6 border-slate-100" />

          <Markdown content={post.content} />

          <nav className="mt-10 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/post/${prev.slug}`}
                className="group rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300"
              >
                <div className="text-xs text-slate-400">← 上一篇</div>
                <div className="mt-1 font-medium text-slate-800 transition group-hover:text-indigo-600">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/post/${next.slug}`}
                className="group rounded-xl border border-slate-200 p-4 text-right transition hover:border-indigo-300"
              >
                <div className="text-xs text-slate-400">下一篇 →</div>
                <div className="mt-1 font-medium text-slate-800 transition group-hover:text-indigo-600">
                  {next.title}
                </div>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        {/* 右侧目录（宽屏显示） */}
        <aside className="hidden lg:block">
          <TableOfContents />
        </aside>
      </div>
    </>
  )
}
