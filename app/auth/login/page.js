'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Lock, LogIn, Home, ArrowLeft, AlertCircle, Eye, EyeOff, Phone } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/utils/api'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForceLoginPrompt, setShowForceLoginPrompt] = useState(false)
  const [pendingLoginData, setPendingLoginData] = useState(null)

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      const loginId = (data.loginId || '').trim()
      const isEmail = loginId.includes('@')
      const response = await api.post('/auth/login', {
        phone: isEmail ? '' : loginId,
        email: isEmail ? loginId.toLowerCase() : '',
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
      const loginId = (pendingLoginData.loginId || '').trim()
      const isEmail = loginId.includes('@')
      const response = await api.post('/auth/login', {
        phone: isEmail ? '' : loginId,
        email: isEmail ? loginId.toLowerCase() : '',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 relative overflow-clip">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl" />
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl text-navy hover:bg-gray-50 transition-all group shadow-sm">
        <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline font-medium">Home</span>
      </Link>
      <Link href="/courses" className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl text-navy hover:bg-gray-50 transition-all group shadow-sm">
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline font-medium">Courses</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <LogIn className="h-8 w-8 text-navy" />
          </motion.div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">Sign in to Beyond Classroom</p>
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
          <Input
            label="Mobile Number or Email"
            theme="light"
            icon={Phone}
            placeholder="9876543210"
            error={errors.loginId?.message}
            {...register('loginId', { required: 'Mobile number or email is required' })}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-ink">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-secondary transition-colors">
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

          <Button type="submit" loading={loading} className="w-full py-4">
            {!loading && <LogIn className="h-5 w-5" />}
            Sign In
          </Button>

          <p className="text-center text-gray-500 text-sm pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:text-secondary font-bold transition-colors">Sign Up Free</Link>
          </p>
        </form>
      </motion.div>

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
