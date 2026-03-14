'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Home, ArrowLeft } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/utils/api'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      const response = await api.post('/auth/login', data)
      dispatch(setCredentials(response.data))
      
      // Check for redirect parameter
      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
        return
      }
      
      // Redirect based on role
      const userRole = response.data.user?.role
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.post('/auth/guest')
      dispatch(setCredentials(response.data))
      router.push('/dashboard')
    } catch (err) {
      setError('Guest login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-100 to-dark-200 p-4 relative">
      {/* Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all group"
      >
        <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline font-medium">Home</span>
      </Link>

      {/* Back to Courses */}
      <Link
        href="/courses"
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline font-medium">Courses</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to Beyond Classroom</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠</span> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-100 text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full border-2 border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Continue as Guest
          </button>

          <div className="text-center space-y-3 pt-4">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:text-secondary font-bold transition-colors">
                Sign Up Free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
