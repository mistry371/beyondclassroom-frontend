'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Phone, TrendingUp, AlertCircle, Eye, EyeOff } from 'lucide-react'
import promoterApi, { savePromoterSession } from '@/utils/promoterApi'

export default function PromoterRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      const res = await promoterApi.post('/promoters/register', form)
      if (res.data.success) {
        savePromoterSession(res.data.token, res.data.promoter)
        router.push('/promoter/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-academic flex items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-primary/10 shadow-premium">
          <div className="text-center mb-8">
            <Image src="/full-logo.png" alt="Beyond Classroom" width={180} height={45} className="mx-auto mb-6 interactive drop-shadow-sm object-contain" />
            <h1 className="text-2xl font-black text-navy">Become a Promoter</h1>
            <p className="text-muted text-sm mt-2">Start earning with referrals</p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex gap-2">
              <AlertCircle className="h-5 w-5" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', icon: User, label: 'Full Name', type: 'text', required: true },
              { key: 'phone', icon: Phone, label: 'Mobile Number', type: 'tel', required: true },
              { key: 'email', icon: Mail, label: 'Email (Optional)', type: 'email', required: false },
            ].map(({ key, icon: Icon, label, type, required }) => (
              <div key={key}>
                <label className="text-ink text-sm mb-1 block font-medium">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                  <input type={type} required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-academic border border-primary/10 rounded-xl text-ink focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="text-ink text-sm mb-1 block font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-academic border border-primary/10 rounded-xl text-ink focus:ring-2 focus:ring-primary outline-none transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <TrendingUp className="h-5 w-5" />
              {loading ? 'Creating...' : 'Create Promoter Account'}
            </button>
          </form>
          <p className="text-center text-muted text-sm mt-6">
            Have an account? <Link href="/promoter/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
