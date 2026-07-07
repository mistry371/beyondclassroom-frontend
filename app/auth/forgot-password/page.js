'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/utils/api'
import { showSuccess, showError } from '@/components/ui/Toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) return showError('Please enter your email')
    
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      showSuccess(res.data.message || 'OTP sent successfully!')
      setStep(2)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return showError('Please enter a valid 6-digit OTP')

    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email, otp })
      showSuccess(res.data.message || 'OTP verified!')
      setStep(3)
    } catch (err) {
      showError(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return showError('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return showError('Passwords do not match')

    setLoading(true)
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword })
      showSuccess(res.data.message || 'Password reset successful!')
      router.push('/auth/login')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-academic flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 text-primary hover:text-secondary font-bold flex items-center gap-2 transition-colors z-10">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-primary/10 mb-6">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-navy tracking-tight">Forgot Password</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new secure password"}
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 shadow-premium sm:rounded-3xl sm:px-10 border border-primary/10">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP} 
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700">Email Address</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-6"
              >
                <div>
                  <label htmlFor="otp" className="block text-sm font-bold text-slate-700 text-center">Enter 6-Digit OTP</label>
                  <div className="mt-2 text-center">
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                      required
                      className="block w-full text-center tracking-[0.5em] font-mono text-2xl py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50"
                      placeholder="000000"
                    />
                  </div>
                  <p className="text-xs text-center text-slate-500 mt-3">We sent a code to <span className="font-bold text-primary">{email}</span></p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  {!loading && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="text-center mt-4">
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-primary font-bold hover:underline">
                    Use a different email
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword} 
                className="space-y-6"
              >
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-bold text-slate-700">New Password</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700">Confirm Password</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Remember your password?{' '}
                <Link href="/auth/login" className="font-bold text-primary hover:text-secondary transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
