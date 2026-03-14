'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, TrendingUp, Search, Download } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminProgress() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchProgress()
  }, [user])

  const fetchProgress = async () => {
    try {
      const res = await api.get('/admin/progress')
      setProgress(res.data.progress || [])
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProgress = progress.filter(p =>
    p.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Progress Tracking
                </h1>
                <p className="text-gray-400 mt-1">Monitor student learning progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student or course..."
              className="w-full pl-10 pr-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredProgress.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.user?.name}</h3>
                  <p className="text-gray-400 text-sm">{item.course?.title}</p>
                </div>
                <span className="text-2xl font-bold text-primary">{item.completionPercentage || 0}%</span>
              </div>

              <div className="w-full bg-dark-200 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
                  style={{ width: `${item.completionPercentage || 0}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Lessons Completed</p>
                  <p className="text-white font-bold">{item.lessonsCompleted || 0}/{item.totalLessons || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Quizzes Passed</p>
                  <p className="text-white font-bold">{item.quizzesPassed || 0}/{item.totalQuizzes || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Avg. Score</p>
                  <p className="text-white font-bold">{item.avgScore || 0}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProgress.length === 0 && (
          <div className="text-center py-20">
            <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No progress data found</p>
          </div>
        )}
      </div>
    </div>
  )
}
