import { getAboutContent } from '@/lib/posts'
import { Markdown } from '@/components/Markdown'

export default function About() {
  const content = getAboutContent()
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <Markdown content={content} />
    </div>
  )
}
