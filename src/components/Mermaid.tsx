import { useEffect, useId, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  fontFamily: 'inherit',
  themeVariables: {
    primaryColor: '#eef2ff',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#6366f1',
    lineColor: '#475569',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#fff7ed',
  },
})

export function Mermaid({ chart }: { chart: string }) {
  const rawId = useId()
  const id = 'm' + rawId.replace(/[^a-zA-Z0-9]/g, '')
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    let active = true
    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (active) setSvg(svg)
      })
      .catch((e) => {
        if (active) setErr(String(e))
      })
    return () => {
      active = false
    }
  }, [chart, id])

  if (err) {
    return (
      <div className="mermaid-error my-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <pre className="whitespace-pre-wrap text-xs text-slate-600">{chart}</pre>
        <p className="mt-2 text-xs text-red-500">⚠️ 图表渲染失败：{err}</p>
      </div>
    )
  }

  return (
    <div
      className="mermaid-block"
      ref={ref}
      role="img"
      aria-label="架构/原理图"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
