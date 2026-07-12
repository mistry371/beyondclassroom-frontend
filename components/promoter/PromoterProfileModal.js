'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Building2, ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import promoterApi from '@/utils/promoterApi'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'bank', label: 'Bank Details', icon: Building2 },
  { id: 'kyc', label: 'KYC', icon: ShieldCheck },
]

const KYC_BADGE = {
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  submitted: { label: 'Under review', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: AlertCircle },
  pending: { label: 'Not submitted', cls: 'bg-slate-100 text-slate-600', icon: AlertCircle },
}

export default function PromoterProfileModal({ open, onClose, promoter, onUpdated }) {
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null) // { type, text }

  const [profile, setProfile] = useState({
    name: promoter?.name || '', email: promoter?.email || '', phone: promoter?.phone || '',
    address: promoter?.address || '', city: promoter?.city || '', state: promoter?.state || '', pincode: promoter?.pincode || '',
  })
  const [bank, setBank] = useState({
    accountHolderName: promoter?.bankDetails?.accountHolderName || '',
    accountNumber: promoter?.bankDetails?.accountNumber || '',
    ifsc: promoter?.bankDetails?.ifsc || '',
    bankName: promoter?.bankDetails?.bankName || '',
    upiId: promoter?.bankDetails?.upiId || '',
  })
  const [kyc, setKyc] = useState({
    panNumber: promoter?.kyc?.panNumber || '', panDocUrl: promoter?.kyc?.panDocUrl || '',
    aadhaarNumber: promoter?.kyc?.aadhaarNumber || '', aadhaarDocUrl: promoter?.kyc?.aadhaarDocUrl || '',
    passbookDocUrl: promoter?.kyc?.passbookDocUrl || '',
  })
  const [uploading, setUploading] = useState('')

  if (!open) return null

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 5000) }

  const save = async (path, body, okText) => {
    setSaving(true); setMsg(null)
    try {
      const res = await promoterApi.put(path, body)
      if (res.data.success) {
        flash('success', okText)
        if (res.data.promoter) onUpdated?.(res.data.promoter)
      }
    } catch (err) {
      flash('error', err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const uploadDoc = async (field, file) => {
    if (!file) return
    setUploading(field)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await promoterApi.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res.data.success && res.data.fileUrl) {
        setKyc((k) => ({ ...k, [field]: res.data.fileUrl }))
        flash('success', 'Document uploaded')
      }
    } catch {
      flash('error', 'Upload failed')
    } finally { setUploading('') }
  }

  const kycStatus = promoter?.kyc?.status || 'pending'
  const badge = KYC_BADGE[kycStatus] || KYC_BADGE.pending

  const field = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-primary'
  const label = 'block text-slate-600 text-sm font-medium mb-1.5'

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Account &amp; Verification</h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex gap-1 px-4 pt-3 border-b border-slate-100">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                <t.icon className="h-4 w-4" /> {t.label}
                {t.id === 'kyc' && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>}
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto">
            {msg && (
              <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>
            )}

            {tab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Name</label><input className={field} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                  <div><label className={label}>Phone</label><input className={field} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                </div>
                <div><label className={label}>Email</label><input className={field} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                <div><label className={label}>Address</label><input className={field} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={label}>City</label><input className={field} value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></div>
                  <div><label className={label}>State</label><input className={field} value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} /></div>
                  <div><label className={label}>Pincode</label><input className={field} value={profile.pincode} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} /></div>
                </div>
                <button disabled={saving} onClick={() => save('/promoters/profile', profile, 'Profile updated')}
                  className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            )}

            {tab === 'bank' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Payouts are credited to this account after verification.</p>
                <div><label className={label}>Account Holder Name</label><input className={field} value={bank.accountHolderName} onChange={(e) => setBank({ ...bank, accountHolderName: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Account Number</label><input className={field} value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} /></div>
                  <div><label className={label}>IFSC Code</label><input className={field} value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Bank Name</label><input className={field} value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} /></div>
                  <div><label className={label}>UPI ID (optional)</label><input className={field} value={bank.upiId} onChange={(e) => setBank({ ...bank, upiId: e.target.value })} placeholder="name@upi" /></div>
                </div>
                <button disabled={saving} onClick={() => save('/promoters/bank-details', bank, 'Bank details saved')}
                  className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Bank Details'}
                </button>
              </div>
            )}

            {tab === 'kyc' && (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${badge.cls}`}>
                  <badge.icon className="h-4 w-4" /> KYC status: <span className="font-semibold">{badge.label}</span>
                </div>
                {kycStatus === 'rejected' && promoter?.kyc?.rejectionReason && (
                  <p className="text-sm text-red-600">Reason: {promoter.kyc.rejectionReason}</p>
                )}
                <DocRow label="PAN Card" numberLabel="PAN Number" numberVal={kyc.panNumber}
                  onNumber={(v) => setKyc({ ...kyc, panNumber: v.toUpperCase() })} docUrl={kyc.panDocUrl}
                  uploading={uploading === 'panDocUrl'} onFile={(f) => uploadDoc('panDocUrl', f)} field={field} labelCls={label} />
                <DocRow label="Aadhaar Card" numberLabel="Aadhaar Number" numberVal={kyc.aadhaarNumber}
                  onNumber={(v) => setKyc({ ...kyc, aadhaarNumber: v })} docUrl={kyc.aadhaarDocUrl}
                  uploading={uploading === 'aadhaarDocUrl'} onFile={(f) => uploadDoc('aadhaarDocUrl', f)} field={field} labelCls={label} />
                <DocRow label="Bank Passbook / Cancelled Cheque" docUrl={kyc.passbookDocUrl}
                  uploading={uploading === 'passbookDocUrl'} onFile={(f) => uploadDoc('passbookDocUrl', f)} field={field} labelCls={label} />
                <button disabled={saving} onClick={() => save('/promoters/kyc', kyc, 'KYC submitted for verification')}
                  className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Submit for Verification'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DocRow({ label, numberLabel, numberVal, onNumber, docUrl, uploading, onFile, field, labelCls }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3">
      <p className="font-semibold text-slate-700 text-sm">{label}</p>
      {numberLabel && (
        <div><label className={labelCls}>{numberLabel}</label>
          <input className={field} value={numberVal} onChange={(e) => onNumber(e.target.value)} /></div>
      )}
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading…' : docUrl ? 'Replace file' : 'Upload file'}
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {docUrl && <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 className="h-4 w-4" /> Uploaded</span>}
      </div>
    </div>
  )
}
