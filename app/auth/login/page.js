'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
const PhoneInput = dynamic(() => import('@/components/ui/PhoneInputWrapper'), { ssr: false, loading: () => <div className="w-full h-[46px] bg-gray-100 rounded-xl animate-pulse" /> })
import { Mail, Lock, LogIn, Home, ArrowLeft, AlertCircle, Eye, EyeOff, Phone } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/utils/api'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { register, handleSubmit, control, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForceLoginPrompt, setShowForceLoginPrompt] = useState(false)
  const [pendingLoginData, setPendingLoginData] = useState(null)
  const [isEmailLogin, setIsEmailLogin] = useState(false)

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      const email = isEmailLogin ? (data.email || '').toLowerCase().trim() : '';
      const phone = !isEmailLogin ? (data.phone || '').trim() : '';
      
      const response = await api.post('/auth/login', {
        phone,
        email,
        password: data.password,
        force: false,
      }, { timeout: 45000 })
      const payload = response.data
      dispatch(setCredentials({
        token: payload.token,
        user: {
          ...payload.user,
          _id: payload.user?.id || payload.user?._id,
        },
      }))

      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
        return
      }

      const userRole = payload.user?.role
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.message === 'already_logged_in') {
        setPendingLoginData(data)
        setShowForceLoginPrompt(true)
        return
      }
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is busy or waking up. Please wait 30-60 seconds and try again.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForceLogin = async () => {
    try {
      setShowForceLoginPrompt(false)
      setLoading(true)
      setError('')
      const email = isEmailLogin ? (pendingLoginData.email || '').toLowerCase().trim() : '';
      const phone = !isEmailLogin ? (pendingLoginData.phone || '').trim() : '';

      const response = await api.post('/auth/login', {
        phone,
        email,
        password: pendingLoginData.password,
        force: true,
      }, { timeout: 45000 })
      const payload = response.data
      dispatch(setCredentials({
        token: payload.token,
        user: { ...payload.user, _id: payload.user?.id || payload.user?._id },
      }))

      const redirect = searchParams.get('redirect')
      if (redirect) return router.push(redirect)
      
      if (payload.user?.role === 'admin' || payload.user?.role === 'super_admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Force login failed.')
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
              👋 Welcome Back
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-[1.1] tracking-tight">
              Continue Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Learning Journey</span> <br/>
              With Us.
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed font-medium">
              Log in to pick up right where you left off. Access your personalized dashboard, live classes, and resources.
            </p>
            
            <div className="space-y-5">
              {[
                'Track your progress effortlessly',
                'Engage with expert educators',
                'Join our global community'
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
              <h2 className="text-3xl font-black text-navy mb-2 tracking-tight">Sign In</h2>
              <p className="text-gray-500 font-medium">Log in to your Beyond Classroom account.</p>
            </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {isEmailLogin ? (
            <div>
              <Input
                label="Email Address"
                theme="light"
                icon={Mail}
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email', { 
                  required: isEmailLogin ? 'Email is required' : false,
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                })}
              />
              <div className="text-right mt-1">
                <button type="button" onClick={() => setIsEmailLogin(false)} className="text-xs text-primary hover:underline font-medium">Use Mobile Number instead</button>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold text-ink mb-2 block">Mobile Number</label>
              <div className="relative">
                <Controller
                  name="phone"
                  control={control}
                  rules={{ 
                    required: !isEmailLogin ? 'Mobile number is required' : false,
                    minLength: { value: 10, message: 'Invalid mobile number' }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      country={'in'}
                      value={value}
                      onChange={onChange}
                      inputClass="!w-full !py-3 !pl-[50px] !pr-4 !bg-white !border !border-gray-200 !text-navy !rounded-xl !shadow-sm focus:!ring-2 focus:!ring-primary focus:!border-transparent !transition-all"
                      containerClass="w-full"
                      buttonClass="!border-gray-200 !bg-transparent !rounded-l-xl !pl-2"
                      dropdownClass="!rounded-xl !shadow-xl !border-gray-100"
                    />
                  )}
                />
              </div>
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
              <div className="text-right mt-1">
                <button type="button" onClick={() => setIsEmailLogin(true)} className="text-xs text-primary hover:underline font-medium">Use Email instead</button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-ink block">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-secondary transition-colors font-medium">
                Forgot password?
              </Link>
            </div>
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
            {!loading && <LogIn className="h-5 w-5" />}
            Sign In
          </Button>

        </form>

        <p className="text-center text-gray-500 text-sm mt-8 font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:text-secondary font-bold transition-colors">Sign Up Free</Link>
        </p>
      </motion.div>
    </div>
  </div>

      {/* Force Login Prompt Modal */}
      {showForceLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-premium relative">
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <AlertCircle className="h-8 w-8" />
              <h2 className="text-xl font-black text-navy">Already Logged In</h2>
            </div>
            <p className="text-gray-600 mb-6 font-medium">
              You are already logged in on another device. Do you want to logout from there and login here?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForceLoginPrompt(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleForceLogin} className="px-5 py-2.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm">
                Yes, Login Here
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
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
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <LoginContent />
    </Suspense>
  )
}
