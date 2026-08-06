'use client'

import { useEffect, useState } from 'react'
import { X, Download, FileText, AlertCircle } from 'lucide-react'
import api from '@/utils/api'
import { showError } from '@/components/ui/Toast'

// Resolve a stored doc value to a loadable URL. Handles legacy inline base64
// `data:` URIs (returned as-is — never prefixed), absolute http(s) urls, and
// S3-backed `/uploads/<key>` paths (streamed by the backend proxy on its origin).
export const resolveDocUrl = (u) => {
  if (!u) return ''
  if (u.startsWith('data:') || u.startsWith('http')) return u
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''
  let url = `${base}${u.startsWith('/') ? '' : '/'}${u}`
  // The /uploads proxy now requires a session for documents (BC-011). Pass the
  // token via query param since <iframe>/<img> src can't send headers.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('promoterToken')
    if (token) url += (url.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token)
  }
  return url
}

const extOf = (u = '') => {
  const clean = String(u).split('#')[0].split('?')[0].toLowerCase()
  const m = clean.match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

// A self-contained document viewer. It first fetches the file so it can (a) tell
// the difference between "loaded" and "missing" (showing a clean message instead
// of the backend's raw "Cannot GET" page) and (b) render PDFs/images from a
// same-origin blob URL, which is more reliable cross-origin. Office docs fall back
// to Google Docs Viewer. A blob Download is always offered. z-[60] layers it above
// the admin modals (z-50) that open it.
export default function DocPreviewModal({ url, title = 'Document', onClose }) {
  const resolved = resolveDocUrl(url)
  const isData = resolved.startsWith('data:')
  const ext = extOf(url)
  const inlineViewable = isData || ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)

  const [status, setStatus] = useState('loading') // 'loading' | 'ok' | 'error'
  const [blobUrl, setBlobUrl] = useState('')
  const [blob, setBlob] = useState(null)

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false
    ;(async () => {
      setStatus('loading')
      try {
        const res = await fetch(resolved)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const b = await res.blob()
        if (cancelled) return
        setBlob(b)
        if (inlineViewable) {
          objectUrl = window.URL.createObjectURL(b)
          setBlobUrl(objectUrl)
        }
        setStatus('ok')
      } catch (e) {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => { cancelled = true; if (objectUrl) window.URL.revokeObjectURL(objectUrl) }
  }, [resolved, inlineViewable])

  const download = async () => {
    try {
      const b = blob || (await (await fetch(resolved)).blob())
      const dlUrl = window.URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = dlUrl
      const mimeExt = (b.type || '').split('/').pop()
      const safeExt = ext || (mimeExt && mimeExt.length <= 5 ? mimeExt : 'pdf')
      a.download = `${String(title).replace(/\s+/g, '_')}.${safeExt}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => window.URL.revokeObjectURL(dlUrl), 1000)
    } catch (e) {
      showError('Download failed — the file could not be retrieved from storage.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">{title}</span>
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={download} disabled={status !== 'ok'} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary !text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100 min-h-0">
          {status === 'loading' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              <p className="text-sm font-medium">Loading document…</p>
            </div>
          ) : status === 'error' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-8">
              <AlertCircle className="h-14 w-14 text-amber-500" />
              <p className="text-lg font-bold text-slate-800">This document could not be loaded</p>
              <p className="text-sm text-slate-500 max-w-md">
                The file was not found in storage. It may have been uploaded before cloud storage was
                configured (and not persisted), or removed. Ask the promoter to re-upload the document.
              </p>
            </div>
          ) : inlineViewable ? (
            <iframe src={blobUrl} className="w-full h-full border-0" title={title} />
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="bg-blue-50 border-b border-blue-200 p-3 text-sm text-blue-900 text-center shrink-0">
                Previewing via Google Docs Viewer. If the preview is blank, use the Download button above.
              </div>
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(resolved)}&embedded=true`}
                className="w-full flex-1 border-0"
                title={title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
