'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { BookOpen, TrendingUp, Award, Clock, PlayCircle, Lock, AlertTriangle, ShoppingCart, User, Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { cachedGet } from '@/utils/api'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [purchasedCourses, setPurchasedCourses] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [trialStatus, setTrialStatus] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      const profileRes = await cachedGet('/profile', 30 * 1000)
      const userCourses = profileRes.data.user.purchasedCourses || []

      const courses = await Promise.all(
        userCourses.map(async (item) => {
          if (item && typeof item === 'object' && item._id) return item
          try {
            const res = await cachedGet(`/courses/${item}`, 60 * 1000)
            return res.data.course
          } catch { return null }
        })
      )
      const validCourses = courses.filter(Boolean)
      setPurchasedCourses(validCourses)

      const progressResults = await Promise.all(
        validCourses.map(course =>
          cachedGet(`/progress/course/${course._id}`, 20 * 1000).catch(() => null)
        )
      )
      setProgress(progressResults.filter(r => r !== null).map(r => r.data.progress))

      // Fetch trial status
      try {
        const trialRes = await cachedGet('/trial/status', 20 * 1000)
        setTrialStatus(trialRes.data)
      } catch {}
    } catch (error) {
      setFetchError(error.userMessage || 'Could not load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const getCourseProgress = (courseId) => {
    const courseProgress = progress.find(p => p?.courseId === courseId)
    return courseProgress?.completionPercentage || 0
  }

  const avgProgress = useMemo(() => {
    if (progress.length === 0) return 0
    return Math.round(progress.reduce((sum, p) => sum + (p?.completionPercentage || 0), 0) / progress.length)
  }, [progress])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-slate-500 text-lg">Continue your learning journey</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex justify-between items-center gap-4 flex-wrap">
            <span>{fetchError}</span>
            <button type="button" onClick={() => { setLoading(true); fetchDashboardData() }} className="font-semibold underline text-red-700">Retry</button>
          </div>
        )}

        {/* Trial Banner */}
        {trialStatus && !trialStatus.hasPurchasedCourses && (
          trialStatus.trialExpired ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl"><Lock className="h-5 w-5 text-red-600" /></div>
                <div>
                  <p className="text-red-700 font-bold">Your free trial has expired</p>
                  <p className="text-slate-500 text-sm">Purchase a course to continue learning and unlock all content.</p>
                </div>
              </div>
              <button onClick={() => router.push('/courses')}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 flex-shrink-0"
              >
                <ShoppingCart className="h-4 w-4" /> Browse Courses
              </button>
            </motion.div>
          ) : trialStatus.trialActive ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-6 border rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap ${
                trialStatus.daysLeft === 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${trialStatus.daysLeft === 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <AlertTriangle className={`h-5 w-5 ${trialStatus.daysLeft === 0 ? 'text-red-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <p className={`font-bold ${trialStatus.daysLeft === 0 ? 'text-red-700' : 'text-amber-800'}`}>
                    {trialStatus.daysLeft === 0
                      ? `Free trial expires in ${trialStatus.hoursLeft} hour${trialStatus.hoursLeft !== 1 ? 's' : ''}`
                      : `Free trial: ${trialStatus.daysLeft} day${trialStatus.daysLeft !== 1 ? 's' : ''} remaining`}
                  </p>
                  <p className="text-slate-500 text-sm">You have limited access. Purchase a course for full access.</p>
                </div>
              </div>
              <button onClick={() => router.push('/courses')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
                  trialStatus.daysLeft === 0
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                <ShoppingCart className="h-4 w-4" /> Upgrade Now
              </button>
            </motion.div>
          ) : null
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Enrolled Courses</p>
                <p className="text-3xl font-black text-slate-800">{purchasedCourses.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Avg. Progress</p>
                <p className="text-3xl font-black text-slate-800">{avgProgress}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Completed</p>
                <p className="text-3xl font-black text-slate-800">
                  {progress.filter(p => p?.completionPercentage === 100).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            My Courses
          </h2>

          {purchasedCourses.length === 0 ? (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
              <Lock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Courses Yet</h3>
              <p className="text-slate-500 mb-6">Start your learning journey by enrolling in a course</p>
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-2">{course.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-primary font-semibold">{getCourseProgress(course._id)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getCourseProgress(course._id)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                      <span className="mx-2">•</span>
                      <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs">
                        {course.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/learn/${course._id}/advanced`)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <PlayCircle className="h-5 w-5" />
                      Continue Learning
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/courses')}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-primary/40 hover:shadow-md transition-all"
          >
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Browse Courses</h3>
            <p className="text-slate-500 text-sm">Explore our catalog and find your next course</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/profile')}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-secondary/40 hover:shadow-md transition-all"
          >
            <User className="h-8 w-8 text-secondary mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Profile</h3>
            <p className="text-slate-500 text-sm">View and update your profile details</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/packages')}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-primary/40 hover:shadow-md transition-all"
          >
            <Package className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Our Packages</h3>
            <p className="text-slate-500 text-sm">Browse our learning packages and plans</p>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
