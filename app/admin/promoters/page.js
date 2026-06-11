'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Trophy, Wallet, Users, Check, X } from 'lucide-react'
import { showSuccess, showError } from '@/components/ui/Toast'

export default function AdminPromotersPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdminAuth()
  const [promoters, setPromoters] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

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

  const processPayout = async (id, status) => {
    try {
      await api.put(`/promoters/admin/payouts/${id}`, { status })
      await loadData()
    } catch (e) {
      showError(e.response?.data?.message || 'Failed')
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
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/admin')} className="text-muted hover:text-primary mb-6">
          ← Back to Admin
        </button>
        <h1 className="text-3xl font-bold text-navy mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" /> Promoter Management
        </h1>

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
                  <tr key={p.id} className="border-b border-primary/5 text-ink">
                    <td className="p-4">{p.name}</td>
                    <td className="p-4">{p.email}</td>
                    <td className="p-4 font-mono text-primary">{p.referralCode}</td>
                    <td className="p-4 text-center">{p.referrals}</td>
                    <td className="p-4 text-right text-secondary">₹{p.earnings?.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">₹{p.pendingPayout?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Payout Requests
          </h2>
          <div className="space-y-4">
            {payouts.filter((p) => p.status === 'pending').length === 0 && (
              <p className="text-muted">No pending payouts</p>
            )}
            {payouts.filter((p) => p.status === 'pending').map((p) => (
              <div key={p._id} className="bg-white rounded-xl p-4 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-navy font-semibold">{p.promoterName}</p>
                  <p className="text-muted text-sm">{p.promoterEmail}</p>
                  <p className="text-primary font-bold mt-1">₹{p.amount?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => processPayout(p._id, 'paid')}
                    className="px-4 py-2 bg-green-600 text-navy rounded-lg flex items-center gap-1 hover:bg-green-500"
                  >
                    <Check className="h-4 w-4" /> Approve & Pay
                  </button>
                  <button onClick={() => processPayout(p._id, 'rejected')}
                    className="px-4 py-2 bg-red-600/80 text-navy rounded-lg flex items-center gap-1 hover:bg-red-500"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
