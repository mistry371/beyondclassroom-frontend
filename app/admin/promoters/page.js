'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Trophy, Wallet, Users, Check, X, Eye, ShieldCheck, Clock, AlertCircle, FileText, Download } from 'lucide-react'
import { showSuccess, showError } from '@/components/ui/Toast'
import DocPreviewModal, { resolveDocUrl } from '@/components/admin/DocPreviewModal'

const KYC_BADGE = {
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-700', icon: ShieldCheck },
  submitted: { label: 'Under review', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: AlertCircle },
  pending: { label: 'Not submitted', cls: 'bg-slate-100 text-slate-600', icon: AlertCircle },
}

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function AdminPromotersPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdminAuth()
  const [promoters, setPromoters] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [promoterDetail, setPromoterDetail] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) {
      router.replace('/auth/login?redirect=%2Fadmin%2Fpromoters')
      return
    }
    loadData()
  }, [isAdmin, authLoading, router])

  const loadData = async () => {
    try {
      const [pRes, payRes] = await Promise.all([
        api.get('/promoters/admin/list'),
        api.get('/promoters/admin/payouts'),
      ])
      if (pRes.data.success) setPromoters(pRes.data.promoters || [])
      if (payRes.data.success) setPayouts(payRes.data.payouts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (payoutId) => {
    setDetailLoading(true)
    setDetail({ loading: true })
    try {
      const res = await api.get(`/promoters/admin/payouts/${payoutId}`)
      if (res.data.success) setDetail(res.data.detail)
    } catch (e) {
      showError('Failed to load withdrawal details')
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const openPromoter = async (id) => {
    setPromoterDetail({ loading: true })
    try {
      const res = await api.get(`/promoters/admin/promoter/${id}`)
      if (res.data.success) setPromoterDetail(res.data.detail)
    } catch {
      showError('Failed to load promoter')
      setPromoterDetail(null)
    }
  }

  const processPayout = async (id, status) => {
    try {
      await api.put(`/promoters/admin/payouts/${id}`, { status })
      showSuccess(status === 'rejected' ? 'Withdrawal rejected' : 'Withdrawal approved & marked paid')
      setDetail(null)
      await loadData()
    } catch (e) {
      showError(e.response?.data?.message || 'Failed')
    }
  }

  const reviewKyc = async (promoterId, status) => {
    try {
      let reason
      if (status === 'rejected') {
        reason = window.prompt('Reason for rejecting KYC (shown to promoter):', 'Documents unclear')
        if (reason === null) return
      }
      await api.put(`/promoters/admin/${promoterId}/kyc`, { status, reason })
      showSuccess(`KYC ${status}`)
      if (detail?.payout?._id) await openDetail(detail.payout._id)
      await loadData()
    } catch (e) {
      showError(e.response?.data?.message || 'KYC update failed')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-academic flex items-center justify-center">
        <div className="w-full max-w-4xl p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-1/4"></div>
          <div className="h-32 bg-primary/5 rounded-2xl w-full"></div>
          <div className="space-y-3">
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  const pendingPayouts = payouts.filter((p) => p.status === 'pending')

  return (
    <div className="min-h-screen bg-academic p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/admin')} className="text-muted hover:text-primary mb-6">
          ← Back to Admin
        </button>
        <h1 className="text-3xl font-bold text-navy mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" /> Promoter Management
        </h1>

        <section>
          <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Pending Withdrawal Requests ({pendingPayouts.length})
          </h2>
          <div className="space-y-4 mb-12">
            {pendingPayouts.length === 0 && <p className="text-muted">No pending withdrawal requests</p>}
            {pendingPayouts.map((p) => {
              const badge = KYC_BADGE[p.kycStatus] || KYC_BADGE.pending
              return (
                <div key={p._id} className="bg-white rounded-xl p-4 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-navy font-semibold">{p.promoterName}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${badge.cls}`}>
                        <badge.icon className="h-3 w-3" /> {badge.label}
                      </span>
                    </div>
                    <p className="text-muted text-sm">{p.promoterEmail}</p>
                    <p className="text-primary font-bold mt-1">{money(p.amount)}
                      <span className="text-muted font-normal text-sm"> · balance {money(p.promoterBalance)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openDetail(p._id)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg flex items-center gap-1 hover:bg-primary/20">
                      <Eye className="h-4 w-4" /> Review
                    </button>
                    <button onClick={() => processPayout(p._id, 'paid')}
                      className="px-4 py-2 bg-green-600 !text-white rounded-lg flex items-center gap-1 hover:bg-green-500">
                      <Check className="h-4 w-4" /> Approve &amp; Pay
                    </button>
                    <button onClick={() => processPayout(p._id, 'rejected')}
                      className="px-4 py-2 bg-red-500 !text-white rounded-lg flex items-center gap-1 hover:bg-red-600">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" /> Promoters ({promoters.length})
          </h2>
          <div className="bg-white rounded-xl border border-primary/20 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b border-primary/10">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Code</th>
                  <th className="p-4 text-center">Referrals</th>
                  <th className="p-4 text-right">Earnings</th>
                  <th className="p-4 text-right">Pending</th>
                </tr>
              </thead>
              <tbody>
                {promoters.map((p) => (
                  <tr key={p.id} onClick={() => openPromoter(p.id)} className="border-b border-primary/5 text-ink cursor-pointer hover:bg-primary/5">
                    <td className="p-4 font-medium text-primary">{p.name}</td>
                    <td className="p-4">{p.email}</td>
                    <td className="p-4 font-mono text-primary">{p.referralCode}</td>
                    <td className="p-4 text-center">{p.referrals}</td>
                    <td className="p-4 text-right text-secondary">{money(p.earnings)}</td>
                    <td className="p-4 text-right">{money(p.pendingPayout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {detail && (
        <WithdrawalDetailModal
          detail={detail}
          loading={detailLoading}
          onClose={() => setDetail(null)}
          onProcess={processPayout}
          onReviewKyc={reviewKyc}
        />
      )}

      {promoterDetail && (
        <PromoterDetailModal detail={promoterDetail} onClose={() => setPromoterDetail(null)} />
      )}
    </div>
  )
}

function PromoterDetailModal({ detail, onClose }) {
  if (detail.loading) {
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-white rounded-2xl p-8">Loading…</div></div>
  }
  const { promoter, bankDetails = {}, kyc = {}, promoCodes = [], studentPurchases = [], payoutHistory = [], stats = {} } = detail
  const kb = KYC_BADGE[kyc.status] || KYC_BADGE.pending
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{promoter?.name}</h2>
            <p className="text-sm text-slate-500">{promoter?.email} · {promoter?.referralCode} · {promoter?.phone}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total earnings', value: money(stats.totalEarnings) },
              { label: 'Available', value: money(stats.pendingPayout) },
              { label: 'Paid out', value: money(stats.totalPaidOut) },
              { label: 'Conversion', value: `${stats.conversionRate || 0}%` },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Section title="Performance">
              <Row label="Referrals" value={stats.referrals} />
              <Row label="Students joined" value={stats.studentsJoined} />
              <Row label="Rank" value={stats.rank} />
              <Row label="Commission rate" value={`${Math.round((stats.commissionRate || 0) * 100)}%`} />
              <Row label="Member since" value={stats.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-IN') : '—'} />
            </Section>
            <Section title="KYC & Bank">
              <div className="mb-2"><span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${kb.cls}`}><kb.icon className="h-3.5 w-3.5" /> {kb.label}</span></div>
              <Row label="Bank" value={bankDetails.bankName} />
              <Row label="Account" value={bankDetails.accountNumber} />
              <Row label="IFSC" value={bankDetails.ifsc} />
              <Row label="UPI" value={bankDetails.upiId} />
            </Section>
            <Section title={`Assigned promo codes (${promoCodes.length})`}>
              {promoCodes.length === 0 && <p className="text-sm text-slate-400">None</p>}
              {promoCodes.map((c, i) => (
                <div key={i} className="flex justify-between text-sm py-1"><span className="font-mono text-primary">{c.code}</span><span className="text-slate-500">{c.discountPercent}% · used {c.usedCount}</span></div>
              ))}
            </Section>
            <Section title={`Student purchases (${studentPurchases.length})`}>
              <div className="max-h-36 overflow-y-auto">
                {studentPurchases.length === 0 && <p className="text-sm text-slate-400">No purchases yet</p>}
                {studentPurchases.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm py-1"><span className="text-slate-700">{s.userName}{s.promoCode ? ` · ${s.promoCode}` : ''}</span><span className="text-green-600 font-medium">+{money(s.commissionAmount)}</span></div>
                ))}
              </div>
            </Section>
          </div>
          <Section title={`Withdrawal history (${payoutHistory.length})`}>
            <div className="max-h-36 overflow-y-auto">
              {payoutHistory.length === 0 && <p className="text-sm text-slate-400">No withdrawals</p>}
              {payoutHistory.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1">
                  <span className="text-slate-600">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                  <span className="text-slate-800">{money(p.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'pending' ? 'bg-amber-100 text-amber-700' : p.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <h4 className="font-semibold text-slate-700 mb-2 text-sm">{title}</h4>
      {children}
    </div>
  )
}

// A KYC document row: label + View (opens in-app preview) + Download (blob save).
function DocRow({ label, url, onView }) {
  const downloadDoc = async () => {
    try {
      const resolved = resolveDocUrl(url)
      const res = await fetch(resolved)
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

function WithdrawalDetailModal({ detail, loading, onClose, onProcess, onReviewKyc }) {
  const [docPreview, setDocPreview] = useState(null)
  if (detail.loading || loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8">Loading…</div>
      </div>
    )
  }
  const { payout, promoter, bankDetails = {}, kyc = {}, totalEarnings, totalPaidOut, withdrawalAmount, remainingBalance, payoutHistory = [], studentPurchases = [], performance = {} } = detail
  const badge = KYC_BADGE[kyc.status] || KYC_BADGE.pending
  const isPending = payout?.status === 'pending'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Withdrawal Request</h2>
            <p className="text-sm text-slate-500">{promoter?.name} · {promoter?.referralCode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2 grid grid-cols-3 gap-3">
            <div className="bg-primary/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{money(withdrawalAmount)}</p>
              <p className="text-xs text-slate-500 mt-1">Withdrawal amount</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{money(totalEarnings)}</p>
              <p className="text-xs text-slate-500 mt-1">Total earnings</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{money(remainingBalance)}</p>
              <p className="text-xs text-slate-500 mt-1">Remaining balance</p>
            </div>
          </div>

          <Section title="Promoter Details">
            <Row label="Name" value={promoter?.name} />
            <Row label="Email" value={promoter?.email} />
            <Row label="Phone" value={promoter?.phone} />
            <Row label="Location" value={[promoter?.city, promoter?.state].filter(Boolean).join(', ')} />
            <Row label="Total paid out" value={money(totalPaidOut)} />
          </Section>

          <Section title="Bank Account">
            <Row label="Holder" value={bankDetails.accountHolderName} />
            <Row label="Account No." value={bankDetails.accountNumber} />
            <Row label="IFSC" value={bankDetails.ifsc} />
            <Row label="Bank" value={bankDetails.bankName} />
            <Row label="UPI" value={bankDetails.upiId} />
          </Section>

          <Section title="KYC Verification">
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badge.cls}`}>
                <badge.icon className="h-3.5 w-3.5" /> {badge.label}
              </span>
              {kyc.status !== 'verified' && (
                <div className="flex gap-2">
                  <button onClick={() => onReviewKyc(promoter.id, 'verified')} className="text-xs px-2.5 py-1 bg-green-600 !text-white rounded-lg">Verify</button>
                  <button onClick={() => onReviewKyc(promoter.id, 'rejected')} className="text-xs px-2.5 py-1 bg-red-500 !text-white rounded-lg">Reject</button>
                </div>
              )}
            </div>
            <Row label="PAN" value={kyc.panNumber} />
            <Row label="Aadhaar" value={kyc.aadhaarNumber} />
            <div className="mt-3 space-y-2">
              <DocRow label="PAN Card" url={kyc.panDocUrl} onView={setDocPreview} />
              <DocRow label="Aadhaar Card" url={kyc.aadhaarDocUrl} onView={setDocPreview} />
              <DocRow label="Passbook / Cheque" url={kyc.passbookDocUrl} onView={setDocPreview} />
            </div>
          </Section>

          <Section title="Performance">
            <Row label="Referrals" value={performance.referrals} />
            <Row label="Students joined" value={performance.studentsJoined} />
            <Row label="Commission entries" value={performance.totalCommissionEntries} />
            <Row label="Rank" value={performance.rank} />
            <Row label="Commission rate" value={`${Math.round((performance.commissionRate || 0) * 100)}%`} />
          </Section>

          <Section title={`Student Purchases (${studentPurchases.length})`}>
            <div className="max-h-40 overflow-y-auto">
              {studentPurchases.length === 0 && <p className="text-sm text-slate-400">No purchases yet</p>}
              {studentPurchases.map((s, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">{s.userName}{s.promoCode ? ` · ${s.promoCode}` : ''}</span>
                  <span className="text-green-600 font-medium">+{money(s.commissionAmount)}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title={`Transaction History (${payoutHistory.length})`}>
            <div className="max-h-40 overflow-y-auto">
              {payoutHistory.length === 0 && <p className="text-sm text-slate-400">No withdrawals yet</p>}
              {payoutHistory.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                  <span className="text-slate-800">{money(p.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'pending' ? 'bg-amber-100 text-amber-700' : p.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {isPending && (
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
            <button onClick={() => onProcess(payout._id, 'rejected')} className="flex-1 py-2.5 bg-red-500 !text-white rounded-xl font-semibold hover:bg-red-600">Reject</button>
            <button onClick={() => onProcess(payout._id, 'paid')} className="flex-1 py-2.5 bg-green-600 !text-white rounded-xl font-semibold hover:bg-green-500">Approve &amp; Mark Paid</button>
          </div>
        )}

        {docPreview && (
          <DocPreviewModal url={docPreview.url} title={docPreview.title} onClose={() => setDocPreview(null)} />
        )}
      </div>
    </div>
  )
}
