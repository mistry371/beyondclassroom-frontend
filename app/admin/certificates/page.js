'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Award, Plus, Download, Eye } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminCertificates() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchCertificates()
  }, [user])

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/admin/certificates')
      setCertificates(res.data.certificates || [])
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCertificate = async (userId, courseId) => {
    try {
      await api.post('/admin/certificates/generate', { userId, courseId })
      alert('Certificate generated successfully')
      fetchCertificates()
    } catch (error) {
      alert('Generation failed')
    }
  }

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
                  Certificate Management
                </h1>
                <p className="text-gray-400 mt-1">{certificates.length} certificates issued</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-center mb-4">
                <Award className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">{cert.user?.name}</h3>
              <p className="text-gray-400 text-sm text-center mb-4">{cert.course?.title}</p>
              <p className="text-gray-500 text-xs text-center mb-4">
                Issued: {new Date(cert.issuedDate).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {certificates.length === 0 && (
          <div className="text-center py-20">
            <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No certificates issued yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
