'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Edit, Eye, EyeOff, Plus, Tag, Trash2, X } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

const emptyForm = {
  code: '',
  discountPercent: '',
  expiryDate: '',
  usageLimit: '',
  active: true,
  assignedTo: '', // promoter ID or name (optional)
}

export default function AdminPromoCodes() {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState([])
  const [promoters, setPromoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCode, setSelectedCode] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPromoCodes()
    fetchPromoters()
  }, [])

  const fetchPromoters = async () => {
    try {
      const res = await api.get('/promoters/admin/list')
      setPromoters(res.data.promoters || [])
    } catch {
      console.error('Failed to fetch promoters')
    }
  }

  const fetchPromoCodes = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/promo-codes')
      setPromoCodes(res.data.promoCodes || [])
    } catch {
      setPromoCodes([])
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelectedCode(null)
    setFormData(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (code) => {
    setSelectedCode(code)
    setFormData({
      code: code.code || '',
      discountPercent: code.discountPercent || '',
      expiryDate: code.expiryDate ? code.expiryDate.split('T')[0] : '',
      usageLimit: code.usageLimit || '',
      active: code.active !== false,
      assignedTo: code.assignedTo || '',
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...formData,
        discountPercent: Number(formData.discountPercent),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      }
      if (selectedCode) {
        await api.put(`/admin/promo-codes/${selectedCode._id}`, payload)
      } else {
        await api.post('/admin/promo-codes', payload)
      }
      setShowModal(false)
      fetchPromoCodes()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this promo code?')) return
    try {
      await api.delete(`/admin/promo-codes/${id}`)
      fetchPromoCodes()
    } catch {
      showError('Delete failed')
    }
  }

  const handleToggleActive = async (code) => {
    try {
      await api.patch(`/admin/promo-codes/${code._id}/toggle`)
      fetchPromoCodes()
    } catch {
      showError('Toggle failed')
    }
  }

  const isExpired = (date) => date && new Date(date) < new Date()

  return (
    <div className="min-h-screen bg-academic">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-muted" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Promo Code Management
                </h1>
                <p className="text-muted mt-1">{promoCodes.length} promo codes</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Promo Code
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            
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
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-muted text-xl font-semibold">No promo codes yet</p>
            <p className="text-muted mt-2 mb-6">Create monthly promo codes for students and promoters.</p>
            <button onClick={openCreate} className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold">
              Create First Code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 text-muted font-semibold text-sm px-2">Code</th>
                  <th className="pb-3 text-muted font-semibold text-sm px-2">Discount</th>
                  <th className="pb-3 text-muted font-semibold text-sm px-2">Expiry</th>
                  <th className="pb-3 text-muted font-semibold text-sm px-2">Usage</th>
                  <th className="pb-3 text-muted font-semibold text-sm px-2">Assigned To</th>
                  <th className="pb-3 text-muted font-semibold text-sm px-2">Status</th>
                  <th className="pb-3 text-muted font-semibold text-sm px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((code, idx) => (
                  <motion.tr
                    key={code._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-2">
                      <span className="font-mono font-bold text-navy bg-academic px-3 py-1 rounded-lg text-sm">
                        {code.code}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-secondary font-bold">{code.discountPercent}%</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`text-sm ${isExpired(code.expiryDate) ? 'text-red-400' : 'text-ink'}`}>
                        {code.expiryDate ? new Date(code.expiryDate).toLocaleDateString('en-IN') : '—'}
                        {isExpired(code.expiryDate) && <span className="ml-1 text-xs">(expired)</span>}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-ink text-sm">
                        {code.usedCount || 0}{code.usageLimit ? ` / ${code.usageLimit}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-muted text-sm">
                        {(() => {
                          if (!code.assignedTo) return '—'
                          const p = promoters.find(p => p.id === code.assignedTo)
                          return p ? p.name : code.assignedTo
                        })()}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isExpired(code.expiryDate)
                          ? 'bg-red-500/20 text-red-400'
                          : code.active !== false
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-muted'
                      }`}>
                        {isExpired(code.expiryDate) ? 'Expired' : code.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(code)}
                          className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(code)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          title={code.active !== false ? 'Deactivate' : 'Activate'}
                        >
                          {code.active !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(code._id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Cards */}
        {promoCodes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Codes', value: promoCodes.length },
              { label: 'Active Codes', value: promoCodes.filter((c) => c.active !== false && !isExpired(c.expiryDate)).length },
              { label: 'Total Uses', value: promoCodes.reduce((sum, c) => sum + (c.usedCount || 0), 0) },
              { label: 'Expired', value: promoCodes.filter((c) => isExpired(c.expiryDate)).length },
            ].map((stat) => (
              <div key={stat.label} className="bg-gradient-to-br from-dark-100/80 to-dark/80 rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-navy">{stat.value}</p>
                <p className="text-muted text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-white/10 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-navy">
                  {selectedCode ? 'Edit Promo Code' : 'Create Promo Code'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-ink text-sm font-medium mb-1">Promo Code *</label>
                  <input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-academic border border-white/10 rounded-lg text-navy font-mono focus:outline-none focus:border-primary"
                    placeholder="e.g. JUNE2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ink text-sm font-medium mb-1">Discount % *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      className="w-full px-4 py-2 bg-academic border border-white/10 rounded-lg text-navy focus:outline-none focus:border-primary"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-ink text-sm font-medium mb-1">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-4 py-2 bg-academic border border-white/10 rounded-lg text-navy focus:outline-none focus:border-primary"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ink text-sm font-medium mb-1">Expiry Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 bg-academic border border-white/10 rounded-lg text-navy focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-ink text-sm font-medium mb-1">Assigned To (Promoter, optional)</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 bg-academic border border-white/10 rounded-lg text-navy focus:outline-none focus:border-primary"
                  >
                    <option value="">None</option>
                    {promoters.filter(p => p.status === 'active').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.referralCode})
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-ink text-sm">Active (usable by students)</span>
                </label>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-academic text-navy rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : selectedCode ? 'Update Code' : 'Create Code'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
