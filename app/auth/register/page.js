'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
const PhoneInput = dynamic(() => import('@/components/ui/PhoneInputWrapper'), { ssr: false, loading: () => <div className="w-full h-[46px] bg-gray-100 rounded-xl animate-pulse" /> })
import { Mail, Lock, User, ArrowLeft, AlertCircle, Eye, EyeOff, Phone } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/utils/api'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { register, handleSubmit, control, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref.toUpperCase())
      sessionStorage.setItem('referralCode', ref.toUpperCase())
    } else {
      const stored = sessionStorage.getItem('referralCode')
      if (stored) setReferralCode(stored)
    }
  }, [searchParams])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      const payload = {
        ...data,
        phone: data.phone?.trim(),
        email: data.email?.toLowerCase().trim() || '',
      }
      if (referralCode) payload.referralCode = referralCode

      const response = await api.post('/auth/register', payload, { timeout: 30000 })
      sessionStorage.removeItem('referralCode')
      const payloadRes = response.data
      dispatch(setCredentials({
        token: payloadRes.token,
        user: { ...payloadRes.user, _id: payloadRes.user?.id || payloadRes.user?._id },
      }))

      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect')

      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        const userRole = payloadRes.user?.role
        if (userRole === 'admin' || userRole === 'super_admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is starting up. Please wait 30 seconds and try again.')
      } else {
        setError(err.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-primary via-navy to-secondary p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-secondary/30 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="relative z-10 text-white mt-12 mb-auto pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white mb-6 backdrop-blur-md">
              ✨ Welcome to Beyond Classroom
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-[1.1] tracking-tight">
              Start Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Learning Journey</span> <br/>
              Today.
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed font-medium">
              Join thousands of students and access premium educational content, live classes, and expert guidance.
            </p>
            
            <div className="space-y-5">
              {[
                'Unlimited Access to Premium Courses',
                'Live Doubt Clearing Sessions',
                'Certificates of Completion'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 text-white/90">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                     <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 text-white/50 text-sm font-medium">
          © {new Date().getFullYear()} Beyond Classroom. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Mobile Back Button */}
          <div className="md:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100/80">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-navy mb-2 tracking-tight">Create Account</h2>
              <p className="text-gray-500 font-medium">Please enter your details to sign up.</p>
            </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            theme="light"
            icon={User}
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Mobile Number</label>
            <div className="relative">
              <Controller
                name="phone"
                control={control}
                rules={{ 
                  required: 'Mobile number is required',
                  minLength: { value: 10, message: 'Invalid mobile number' }
                }}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    country={'in'}
                    value={value}
                    onChange={onChange}
                    inputClass="!w-full !py-3 !pl-[50px] !pr-4 !bg-white !border !border-gray-200 !text-navy !rounded-xl !shadow-sm focus:!ring-2 focus:!ring-primary focus:!border-transparent !transition-all"
                    containerClass="w-full"
                    buttonClass="!border-gray-200 !bg-transparent !rounded-l-xl !pl-1"
                    dropdownClass="!rounded-xl !shadow-xl !border-gray-100"
                  />
                )}
              />
            </div>
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <Input
            label="Email (Optional)"
            theme="light"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address'
              }
            })}
          />

          <div>
            <label className="text-sm font-semibold text-ink mb-2 block">Password</label>
            <div className="relative">
              <Input
                theme="light"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[14px] text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full py-4 mt-2">
            {!loading && <User className="h-5 w-5" />}
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8 font-medium">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:text-secondary font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  </div>
</div>
  )
}

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>}>
      <RegisterContent />
    </Suspense>
  )
}
