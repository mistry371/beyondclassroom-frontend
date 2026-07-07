'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { BookOpen, TrendingUp, Award, Clock, PlayCircle, Lock, AlertTriangle, ShoppingCart, User, Package, Bell, Info } from 'lucide-react'
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
  const [customRequestsStats, setCustomRequestsStats] = useState({ total: 0, completed: 0 })
  const [announcements, setAnnouncements] = useState([])

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

      // Fetch custom requests for stats
      try {
        const reqRes = await cachedGet('/custom-requests/my', 60 * 1000)
        const reqs = reqRes.data.requests || []
        setCustomRequestsStats({
          total: reqs.length,
          completed: reqs.filter(r => r.status === 'completed').length
        })
      } catch {}

      // Fetch active announcements
      try {
        const annRes = await cachedGet('/announcements', 5 * 60 * 1000)
        setAnnouncements(annRes.data.announcements || [])
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
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-primary/10 rounded w-1/4 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-primary/5 rounded-2xl"></div>
            <div className="h-32 bg-primary/5 rounded-2xl"></div>
            <div className="h-32 bg-primary/5 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-primary/5 rounded-2xl"></div>
            <div className="h-64 bg-primary/5 rounded-2xl"></div>
            <div className="h-64 bg-primary/5 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
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

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5 px-1">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Bell className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy">Announcements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {announcements.map((ann, idx) => (
                <motion.div 
                  key={ann._id} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.1 }}
                  className={`relative overflow-hidden p-6 rounded-3xl border transition-all hover:shadow-md ${
                    ann.priority === 'high' 
                      ? 'bg-gradient-to-br from-red-50/80 to-rose-50/80 border-red-100' 
                      : ann.priority === 'medium'
                        ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-100'
                        : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 ${
                    ann.priority === 'high' ? 'bg-red-400/20' : ann.priority === 'medium' ? 'bg-blue-400/20' : 'bg-slate-300/20'
                  }`}></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`shrink-0 p-2.5 rounded-xl mt-0.5 ${
                         ann.priority === 'high' ? 'bg-red-100 text-red-600' : ann.priority === 'medium' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ann.priority === 'high' ? <AlertTriangle className="w-5 h-5" /> : ann.priority === 'medium' ? <Info className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-navy text-[17px] leading-tight mb-1">{ann.title}</h3>
                        {ann.priority === 'high' && <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">Important</span>}
                      </div>
                    </div>
                    {ann.message && (
                      <p className="text-slate-600 text-sm leading-relaxed mt-2 pl-14 flex-grow">{ann.message}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex justify-between items-center gap-4 flex-wrap">
            <span>{fetchError}</span>
            <button type="button" onClick={() => { setLoading(true); fetchDashboardData() }} className="font-semibold underline text-red-700">Retry</button>
          </div>
        )}


        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Enrolled</p>
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
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow"
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

          <motion.div
            onClick={() => router.push('/dashboard/custom-requests')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Custom Requests</p>
                <p className="text-3xl font-black text-slate-800">
                  {customRequestsStats.completed} <span className="text-lg text-slate-400 font-semibold">/ {customRequestsStats.total}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/courses')}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <BookOpen className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Browse Courses</h3>
            <p className="text-slate-500 text-sm">Explore our catalog and find your next course</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/profile')}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-secondary/40 hover:shadow-md transition-all group"
          >
            <User className="h-8 w-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Profile</h3>
            <p className="text-slate-500 text-sm">View and update your profile details</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/purchases')}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-green-500/40 hover:shadow-md transition-all group"
          >
            <ShoppingCart className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Billing & Purchases</h3>
            <p className="text-slate-500 text-sm">View your purchase and billing history</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/custom-requests')}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-orange-500/40 hover:shadow-md transition-all group"
          >
            <Package className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Custom Requests</h3>
            <p className="text-slate-500 text-sm">Track your custom study materials</p>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
