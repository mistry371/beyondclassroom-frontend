'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Wrench, Eye, EyeOff, Search } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

export default function AdminTools() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
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
      setTools(prev => prev.map(t => t._id === toolId ? { ...t, enabled: !currentStatus } : t))
    } catch {
      showError('Update failed')
    }
  }

  const categories = ['All', ...Array.from(new Set(tools.map(t => t.category)))]

  const filtered = tools.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'All' || t.category === categoryFilter
    return matchSearch && matchCat
  })

  const enabledCount = tools.filter(t => t.enabled).length

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
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
              <ArrowLeft className="h-5 w-5 text-muted" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tool Management
              </h1>
              <p className="text-muted mt-1">{enabledCount} of {tools.length} tools enabled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-white/10 rounded-lg text-navy focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-white text-muted hover:bg-dark-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool, index) => (
            <motion.div
              key={tool._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={`bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-xl border p-5 transition-all ${
                tool.enabled ? 'border-white/10' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-navy truncate">{tool.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded mt-1 inline-block">
                    {tool.category}
                  </span>
                </div>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  tool.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-muted'
                }`}>
                  {tool.enabled ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-muted text-xs mb-4 line-clamp-2">{tool.description}</p>
              <button
                onClick={() => toggleTool(tool._id, tool.enabled)}
                className={`w-full px-3 py-2 rounded-lg transition-all text-xs font-medium flex items-center justify-center gap-2 ${
                  tool.enabled
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {tool.enabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {tool.enabled ? 'Disable' : 'Enable'}
              </button>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Wrench className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-muted text-xl">No tools match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
