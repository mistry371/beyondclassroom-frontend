'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import promoterApi from '@/utils/promoterApi'
import PasswordInput from '@/components/ui/PasswordInput'

export default function PromoterForgotPassword() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const field = 'w-full px-4 py-3 bg-academic border border-primary/10 rounded-xl text-ink focus:ring-2 focus:ring-primary outline-none transition'

  const requestOtp = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setInfo('')
    try {
      const res = await promoterApi.post('/promoters/forgot-password', { email: email.trim().toLowerCase() })
      if (res.data.success) { setInfo('If that email is registered, an OTP has been sent. Check your inbox.'); setStep(2) }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Please try again.')
    } finally { setLoading(false) }
  }

  const reset = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setInfo('')
    try {
      const res = await promoterApi.post('/promoters/reset-password', { email: email.trim().toLowerCase(), otp: otp.trim(), newPassword })
      if (res.data.success) {
        setInfo('Password reset! Redirecting to login…')
        setTimeout(() => router.push('/promoter/login'), 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Check your OTP and try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-academic flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-primary/10 shadow-premium">
          <div className="text-center mb-8">
            <Image src="/full-logo.png" alt="Beyond Classroom" width={170} height={42} className="mx-auto mb-6 object-contain" />
            <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <KeyRound className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-navy">Reset Password</h1>
            <p className="text-muted text-sm mt-2">{step === 1 ? 'Enter your registered email to receive an OTP.' : 'Enter the OTP and your new password.'}</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex gap-2"><AlertCircle className="h-5 w-5 flex-shrink-0" />{error}</div>}
          {info && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl mb-4 text-sm flex gap-2"><CheckCircle2 className="h-5 w-5 flex-shrink-0" />{info}</div>}

          {step === 1 ? (
            <form onSubmit={requestOtp} className="space-y-5">
              <div>
                <label className="text-ink text-sm font-medium mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className={`${field} pl-12`} placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={reset} className="space-y-5">
              <div>
                <label className="text-ink text-sm font-medium mb-2 block">6-digit OTP</label>
                <input inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required
                  className={`${field} tracking-widest text-center text-lg`} placeholder="123456" />
              </div>
              <div>
                <label className="text-ink text-sm font-medium mb-2 block">New Password</label>
                <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                  className={field} placeholder="At least 6 characters" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-muted text-sm hover:text-ink">Use a different email</button>
            </form>
          )}

          <p className="text-center mt-6">
            <Link href="/promoter/login" className="text-slate-400 text-sm hover:text-ink transition-colors inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
