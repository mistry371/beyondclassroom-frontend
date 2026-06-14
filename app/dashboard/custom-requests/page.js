'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookOpen, Plus, CreditCard, CheckCircle, RefreshCw, PackageCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function CustomRequestsPage() {
  const router = useRouter()
  const { user } = useSelector(s => s.auth)
  const [requests, setRequests] = useState([])
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/dashboard/custom-requests'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const reqRes = await api.get('/custom-requests/my')
      setRequests(reqRes.data.requests || [])
      setUsage(reqRes.data.usage || null)
    } catch (e) { 
      console.error(e)
      showError('Failed to load custom requests. Please try again.')
    } finally { 
      setLoading(false) 
    }
  }

  if (loading) return <div className="min-h-screen bg-academic flex items-center justify-center"><Navbar/><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-academic">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-navy">Custom Study Requests</h1>
            <p className="text-muted mt-1">Select topics from any course and request a custom question paper or study notes</p>
          </div>
          <button onClick={() => router.push('/packages')} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 flex items-center gap-2 shadow-premium transition-transform hover:scale-105">
            <Plus className="h-4 w-4"/> New Request
          </button>
        </div>

        {/* Package Limit Usage Card */}
        {usage && (
          <div className="mb-8 p-6 bg-white rounded-3xl border border-primary/20 shadow-premium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-navy">Package Usage Limit</h2>
              <p className="text-sm text-muted mt-1">Track your personalized custom request limit</p>
            </div>
            <div className="sm:text-right">
              {usage.hasUnlimited ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
                  <PackageCheck className="w-4 h-4"/> Unlimited Requests Available
                </div>
              ) : (
                <div className="flex flex-col sm:items-end">
                  <div className="text-2xl font-black text-navy">{usage.used} <span className="text-base text-muted font-semibold">/ {usage.limit}</span></div>
                  <div className="text-sm text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg mt-1 inline-block">
                    {usage.remaining} Requests Remaining
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Existing requests */}
        {requests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-primary/10 shadow-premium">
            <BookOpen className="h-16 w-16 text-primary/30 mx-auto mb-4"/>
            <p className="text-navy font-bold text-xl">No requests yet</p>
            <p className="text-muted text-sm mt-2">Go to a course page to request a customized package.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, i) => (
              <motion.div key={req._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                className="bg-white rounded-3xl border border-primary/10 p-7 shadow-premium">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-navy font-black text-xl">{req.title}</h3>
                    <p className="text-muted text-sm mt-1 max-w-2xl">{req.description}</p>
                  </div>
                  <span className={"px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide " + (STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600')}>
                    {req.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(req.selectedTopics || req.selectedModules || []).map(t => (
                    <span key={t.moduleId} className="px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-xs">{t.moduleTitle}</span>
                  ))}
                  {(req.selectedLessons || []).map(t => (
                    <span key={t.lessonId} className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-xs">{t.lessonTitle}</span>
                  ))}
                  {(req.selectedSubtopics || []).map(t => (
                    <span key={t.subtopicId} className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-xs">{t.subtopicTitle}</span>
                  ))}
                  {(req.selectedPdfs || []).map(t => (
                    <span key={`${t.subtopicId}-${t.name}`} className="px-3 py-1 bg-orange-100 text-orange-700 font-semibold rounded-full text-xs">{t.name}</span>
                  ))}
                </div>
                <div className="flex gap-5 text-sm font-medium text-muted bg-academic p-4 rounded-2xl border border-primary/5 inline-flex mb-4">
                  <span>Type: <span className="text-navy font-bold capitalize">{(req.deliverable || 'package').replace('_',' ')}</span></span>
                  {req.estimatedDuration && <span>Duration: <span className="text-navy font-bold">{req.estimatedDuration}</span></span>}
                </div>
                {(req.roadmap || []).length > 0 && (
                  <div className="bg-academic border border-primary/10 rounded-2xl p-5 mb-4">
                    <p className="text-navy font-black text-sm flex items-center gap-2 mb-3">Personalized Roadmap</p>
                    <ul className="space-y-2 text-sm text-ink">
                      {req.roadmap.map((item, idx) => <li key={`${item}-${idx}`} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{item}</li>)}
                    </ul>
                  </div>
                )}
                {req.adminNote && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-yellow-800 mb-1">Note from Admin</p>
                    <p className="text-sm text-yellow-900">{req.adminNote}</p>
                  </div>
                )}

                {req.status === 'completed' && (
                  <div className="mt-6 flex flex-col gap-4 border-t border-primary/10 pt-5">
                    <div className="px-4 py-3 rounded-2xl bg-green-50 border border-green-100 text-green-800 text-sm font-bold inline-flex items-center gap-2 w-fit">
                      <PackageCheck className="h-5 w-5 text-green-600"/> Personalized package unlocked
                    </div>
                    {req.assignedPdf && (
                      <a href={req.assignedPdf} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-gradient text-white rounded-2xl text-sm font-bold w-fit hover:scale-105 transition-transform shadow-premium inline-flex items-center gap-2">
                        <BookOpen className="h-4 w-4"/> Download Assigned PDF
                      </a>
                    )}
                  </div>
                )}
                <p className="text-muted text-xs mt-3">{new Date(req.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
