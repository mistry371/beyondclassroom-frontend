'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Wrench, Eye, EyeOff } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminTools() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchTools()
  }, [user])

  const fetchTools = async () => {
    try {
      const res = await api.get('/admin/tools')
      setTools(res.data.tools || [])
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTool = async (toolId, currentStatus) => {
    try {
      await api.put(`/admin/tools/${toolId}`, { enabled: !currentStatus })
      fetchTools()
    } catch (error) {
      alert('Update failed')
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
                  Tool Management
                </h1>
                <p className="text-gray-400 mt-1">{tools.length} tools available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tool.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {tool.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
              <button
                onClick={() => toggleTool(tool._id, tool.enabled)}
                className={`w-full px-4 py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2 ${
                  tool.enabled
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {tool.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {tool.enabled ? 'Disable' : 'Enable'}
              </button>
            </motion.div>
          ))}
        </div>

        {tools.length === 0 && (
          <div className="text-center py-20">
            <Wrench className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No tools found</p>
          </div>
        )}
      </div>
    </div>
  )
}
