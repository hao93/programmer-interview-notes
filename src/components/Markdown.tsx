import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { Children, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mermaid } from './Mermaid'
import { remarkAutolink } from '@/lib/remarkAutolink'

export function Markdown({ content }: { content: string }) {
  const navigate = useNavigate()

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkAutolink]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a({ href, children, ...props }) {
            const url = href ?? ''

            // 站内路由（/post/xxx、/tag/xxx、/about 等）——走 HashRouter，不整页刷新
            if (url.startsWith('/')) {
              return (
                <a
                  href={`#${url}`}
                  onClick={(e) => {
                    // 允许新标签页/中键打开
                    if (e.metaKey || e.ctrlKey || e.button === 1) return
                    e.preventDefault()
                    navigate(url)
                    window.scrollTo({ top: 0 })
                  }}
                  {...props}
                >
                  {children}
                </a>
              )
            }

            // 页内锚点（目录跳转）——平滑滚动到对应标题
            if (url.startsWith('#')) {
              return (
                <a
                  href={url}
                  onClick={(e) => {
                    e.preventDefault()
                    const id = decodeURIComponent(url.slice(1))
                    const el =
                      document.getElementById(id) ||
                      document.getElementById(encodeURIComponent(id))
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  {...props}
                >
                  {children}
                </a>
              )
            }

            // 站外地址——新标签页打开
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            )
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const lang = match?.[1]
            if (lang === 'mermaid') {
              const code = String(children).replace(/\n$/, '')
              return <Mermaid chart={code} />
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          pre({ children }) {
            const arr = Children.toArray(children)
            const first = arr[0] as ReactElement | undefined
            if (first && first.type === Mermaid) {
              return <>{children}</>
            }
            return <pre>{children}</pre>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
