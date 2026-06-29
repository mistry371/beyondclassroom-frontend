'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Activity, Search, Download } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminLogs() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [user, filter])

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/admin/logs?type=${filter}`)
      setLogs(res.data.logs || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-academic flex items-center justify-center">
        
        <div className="w-full max-w-4xl p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-1/4"></div>
          <div className="h-32 bg-primary/5 rounded-2xl w-full"></div>
          <div className="space-y-3">
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic">
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-muted" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Activity Logs
                </h1>
                <p className="text-muted mt-1">{logs.length} log entries</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const rows = filteredLogs.map(l => [
                l.type, `"${l.action}"`, l.user?.name || 'System', new Date(l.timestamp || l.createdAt).toLocaleString()
              ])
              const csv = ['Type,Action,User,Timestamp', ...rows.map(r => r.join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'activity-logs.csv'; a.click()
              URL.revokeObjectURL(url)
            }}
            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-white/10 rounded-lg text-navy focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-white/10 rounded-lg text-navy focus:outline-none focus:border-primary"
          >
            <option value="all">All Logs</option>
            <option value="user">User Actions</option>
            <option value="admin">Admin Actions</option>
            <option value="system">System Events</option>
            <option value="security">Security Events</option>
          </select>
        </div>

        <div className="space-y-2">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-lg border border-white/10 p-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.type === 'security' ? 'bg-red-500/20 text-red-400' :
                    log.type === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                    log.type === 'system' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-muted'
                  }`}>
                    {log.type}
                  </span>
                  <p className="text-navy text-sm">{log.action}</p>
                  <p className="text-muted text-sm">by {log.user?.name || 'System'}</p>
                </div>
                <span className="text-muted text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-20">
            <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-muted text-xl">No logs found</p>
          </div>
        )}
      </div>
    </div>
  )
}
