'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Mail, Send, Eye } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminEmails() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [emails, setEmails] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('logs')

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchEmails()
    fetchTemplates()
  }, [user])

  const fetchEmails = async () => {
    try {
      const res = await api.get('/admin/emails/logs')
      setEmails(res.data.emails || [])
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/admin/emails/templates')
      setTemplates(res.data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
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
                  Email Management
                </h1>
                <p className="text-gray-400 mt-1">{emails.length} emails sent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-primary text-white'
                : 'bg-dark-100 text-gray-400 hover:bg-dark-200'
            }`}
          >
            Email Logs
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'templates'
                ? 'bg-primary text-white'
                : 'bg-dark-100 text-gray-400 hover:bg-dark-200'
            }`}
          >
            Templates
          </button>
        </div>

        {activeTab === 'logs' && (
          <div className="space-y-4">
            {emails.map((email, index) => (
              <motion.div
                key={email._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{email.subject}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        email.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                        email.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {email.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">To: {email.to}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(email.sentAt).toLocaleString()}
                    </p>
                  </div>
                  <button className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center justify-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {((activeTab === 'logs' && emails.length === 0) || (activeTab === 'templates' && templates.length === 0)) && (
          <div className="text-center py-20">
            <Mail className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No {activeTab} found</p>
          </div>
        )}
      </div>
    </div>
  )
}
