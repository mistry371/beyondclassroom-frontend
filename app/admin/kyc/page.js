'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { ShieldCheck, Clock, AlertCircle, ArrowLeft, X, FileText, Check, RotateCcw, History, Eye, Download } from 'lucide-react'
import { showSuccess, showError } from '@/components/ui/Toast'
import DocPreviewModal, { resolveDocUrl } from '@/components/admin/DocPreviewModal'

const BADGE = {
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-700', icon: ShieldCheck },
  submitted: { label: 'Pending review', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: AlertCircle },
  resubmit: { label: 'Re-submission requested', cls: 'bg-orange-100 text-orange-700', icon: RotateCcw },
  pending: { label: 'Not submitted', cls: 'bg-slate-100 text-slate-600', icon: AlertCircle },
}
const FILTERS = ['submitted', 'resubmit', 'verified', 'rejected', 'all']

export default function AdminKyc() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdminAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('submitted')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) { router.replace('/auth/login?redirect=%2Fadmin%2Fkyc'); return }
    load()
  }, [isAdmin, authLoading, filter])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/promoters/admin/kyc?status=${filter}`)
      setItems(res.data.kyc || [])
    } catch { setItems([]) } finally { setLoading(false) }
  }

  const review = async (promoterId, status) => {
    let reason
    if (status !== 'verified') {
      reason = window.prompt(status === 'resubmit' ? 'Message to the promoter (what to re-upload):' : 'Reason for rejection (shown to promoter):', status === 'resubmit' ? 'Please re-upload clearer documents' : 'Documents could not be verified')
      if (reason === null) return
    }
    try {
      await api.put(`/promoters/admin/${promoterId}/kyc`, { status, reason })
      showSuccess(`KYC ${status}`)
      setSelected(null)
      load()
    } catch (e) { showError(e.response?.data?.message || 'Update failed') }
  }

  return (
    <div className="min-h-screen bg-academic p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/admin')} className="text-muted hover:text-primary mb-6 flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back to Admin</button>
        <h1 className="text-3xl font-bold text-navy mb-2 flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-primary" /> KYC Management</h1>
        <p className="text-muted mb-6">Review and verify promoter identity documents.</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-primary !text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f === 'submitted' ? 'Pending' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <ShieldCheck className="h-14 w-14 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No KYC submissions {filter !== 'all' ? `(${filter})` : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => {
              const b = BADGE[it.kyc?.status] || BADGE.pending
              return (
                <div key={it.promoterId} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy">{it.name}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${b.cls}`}><b.icon className="h-3 w-3" /> {b.label}</span>
                    </div>
                    <p className="text-muted text-sm">{it.email} · {it.referralCode}</p>
                  </div>
                  <button onClick={() => setSelected(it)} className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm font-medium">Review</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selected && <KycReviewModal item={selected} onClose={() => setSelected(null)} onReview={review} />}
    </div>
  )
}

function DocRow({ label, url, onView }) {
  const downloadDoc = async () => {
    try {
      const res = await fetch(resolveDocUrl(url))
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      const clean = String(url).split('#')[0].split('?')[0]
      const ext = (clean.match(/\.([a-z0-9]+)$/i) || [])[1] || (blob.type || '').split('/').pop() || 'pdf'
      a.download = `${label.replace(/\s+/g, '_')}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000)
    } catch (e) {
      showError('Download failed. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className={`h-4 w-4 shrink-0 ${url ? 'text-primary' : 'text-slate-300'}`} />
        <span className="text-sm text-slate-700 truncate">{label}</span>
      </div>
      {url ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => onView({ url, title: label })} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-white transition-colors">
            <Eye className="h-3.5 w-3.5" /> View
          </button>
          <button onClick={downloadDoc} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      ) : (
        <span className="text-xs text-slate-400 shrink-0">Not uploaded</span>
      )}
    </div>
  )
}

function KycReviewModal({ item, onClose, onReview }) {
  const k = item.kyc || {}
  const b = BADGE[k.status] || BADGE.pending
  const [docPreview, setDocPreview] = useState(null)
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">KYC Review — {item.name}</h2>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${b.cls}`}><b.icon className="h-3 w-3" /> {b.label}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">PAN Number</span><span className="font-medium text-slate-800">{k.panNumber || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Aadhaar Number</span><span className="font-medium text-slate-800">{k.aadhaarNumber || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bank</span><span className="font-medium text-slate-800">{item.bankDetails?.bankName || '—'} {item.bankDetails?.accountNumber ? `· ${item.bankDetails.accountNumber}` : ''}</span></div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Documents</p>
            <DocRow label="PAN Card" url={k.panDocUrl} onView={setDocPreview} />
            <DocRow label="Aadhaar Card" url={k.aadhaarDocUrl} onView={setDocPreview} />
            <DocRow label="Passbook / Cheque" url={k.passbookDocUrl} onView={setDocPreview} />
          </div>

          {k.status === 'rejected' && k.rejectionReason && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2">Last note: {k.rejectionReason}</div>
          )}

          {(k.history || []).length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><History className="h-4 w-4" /> History</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...k.history].reverse().map((h, i) => (
                  <div key={i} className="text-xs text-slate-600 border-l-2 border-slate-200 pl-3">
                    <span className="font-medium capitalize">{h.status}</span> · {h.by} · {new Date(h.at).toLocaleString('en-IN')}
                    {h.note ? <div className="text-slate-400">{h.note}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {k.status !== 'verified' && (
          <div className="flex flex-wrap gap-2 px-6 py-4 border-t border-slate-100">
            <button onClick={() => onReview(item.promoterId, 'resubmit')} className="flex-1 min-w-[130px] py-2.5 px-3 bg-orange-500 !text-white rounded-xl font-semibold hover:bg-orange-600 text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"><RotateCcw className="h-4 w-4 shrink-0" /> Request re-submit</button>
            <button onClick={() => onReview(item.promoterId, 'rejected')} className="flex-1 min-w-[100px] py-2.5 px-3 bg-red-500 !text-white rounded-xl font-semibold hover:bg-red-600 text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"><X className="h-4 w-4 shrink-0" /> Reject</button>
            <button onClick={() => onReview(item.promoterId, 'verified')} className="flex-1 min-w-[100px] py-2.5 px-3 bg-green-600 !text-white rounded-xl font-semibold hover:bg-green-500 text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"><Check className="h-4 w-4 shrink-0" /> Verify</button>
          </div>
        )}

        {docPreview && (
          <DocPreviewModal url={docPreview.url} title={docPreview.title} onClose={() => setDocPreview(null)} />
        )}
      </div>
    </div>
  )
}
