'use client'

import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Lock, ShoppingCart, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrialGuard({ children, courseId }) {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  const hasAccess = user?.purchasedCourses?.some(pc => (pc._id || pc) === courseId)

  // No access — show paywall
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-academic flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-primary/10 p-10 max-w-lg w-full text-center shadow-premium"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
            <Lock className="h-10 w-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-black text-navy mb-3">Premium Content</h1>
          <p className="text-muted mb-8 leading-relaxed">
            You need to purchase a package containing this class to access its modules, lessons, and practice materials.
          </p>

          <div className="bg-slate-50 border border-primary/5 rounded-2xl p-5 mb-8 text-left space-y-3">
            {[
              'Full access to all course modules',
              'Unlimited lessons and practice problems',
              'Module quizzes and certificates',
              'Live class access',
              'AI Tutor support',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-ink text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/packages')}
              className="w-full px-6 py-4 bg-brand-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg shadow-md"
            >
              <ShoppingCart className="h-5 w-5" />
              Purchase a Package to Unlock
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-academic text-navy rounded-xl font-medium hover:bg-slate-200 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Purchased — show content
  return <>{children}</>
}
