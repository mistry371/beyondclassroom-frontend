'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookOpen, Plus, CreditCard, CheckCircle, RefreshCw, PackageCheck, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api, { API_URL } from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'
import PdfPreviewModal from '@/components/PdfPreviewModal'

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
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [purchasedCourses, setPurchasedCourses] = useState([])
  const [showCourseSelector, setShowCourseSelector] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/dashboard/custom-requests'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const reqRes = await api.get('/custom-requests/my')
      setRequests(reqRes.data.requests || [])
      setUsage(reqRes.data.usage || null)
      
      const profileRes = await api.get('/profile')
      const userCourses = profileRes.data.user?.purchasedCourses || []
      
      const coursesData = await Promise.all(
        userCourses.map(async (item) => {
          if (item && typeof item === 'object' && item._id) return item
          try {
            const res = await api.get(`/courses/${item}`)
            return res.data.course
          } catch { return null }
        })
      )
      setPurchasedCourses(coursesData.filter(Boolean))
    } catch (e) { 
      console.error(e)
      showError('Failed to load custom requests. Please try again.')
    } finally { 
      setLoading(false) 
    }
  }

  if (loading) return <div className="min-h-screen bg-academic flex items-center justify-center"><Navbar/><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  const handleNewRequest = () => {
    if (purchasedCourses.length === 0) {
      router.push('/packages')
    } else if (purchasedCourses.length === 1) {
      router.push(`/courses/${purchasedCourses[0]._id}`)
    } else {
      setShowCourseSelector(true)
    }
  }

  return (
    <div className="min-h-screen bg-academic">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-navy">Custom Study Requests</h1>
            <p className="text-muted mt-1">Select topics from any course and request a custom question paper or study notes</p>
          </div>
          <button onClick={handleNewRequest} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 flex items-center gap-2 shadow-premium transition-transform hover:scale-105">
            <Plus className="h-4 w-4"/> New Request
          </button>
        </div>

        {/* Stats Header */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-bold uppercase tracking-wider">Total Sent</p>
                <p className="text-3xl font-black text-navy mt-1">{requests.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><BookOpen className="w-6 h-6"/></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-bold uppercase tracking-wider">Pending / Review</p>
                <p className="text-3xl font-black text-navy mt-1">{requests.filter(r => ['pending', 'reviewing'].includes(r.status)).length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl text-blue-700"><RefreshCw className="w-6 h-6"/></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-bold uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-black text-navy mt-1">{requests.filter(r => r.status === 'completed').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl text-green-700"><PackageCheck className="w-6 h-6"/></div>
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
                      <button 
                        onClick={() => {
                          const fullUrl = req.assignedPdf.startsWith('http') 
                            ? req.assignedPdf 
                            : `${API_URL.replace('/api', '')}${req.assignedPdf.startsWith('/') ? '' : '/'}${req.assignedPdf}`;
                          setSelectedPdf({ url: fullUrl, title: req.title + ' Package' })
                        }} 
                        className="px-6 py-3 bg-brand-gradient text-white rounded-2xl text-sm font-bold w-fit hover:scale-105 transition-transform shadow-premium inline-flex items-center gap-2"
                      >
                        <BookOpen className="h-4 w-4"/> View Delivered Material
                      </button>
                    )}
                  </div>
                )}
                <p className="text-muted text-xs mt-3">{new Date(req.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfPreviewModal
          doc={selectedPdf}
          onClose={() => setSelectedPdf(null)}
          isPurchased={true}
          user={user}
        />
      )}

      {/* Course Selector Modal */}
      {showCourseSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setShowCourseSelector(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-navy">Select a Course</h2>
              <button onClick={() => setShowCourseSelector(false)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <p className="text-muted text-sm mb-4">Choose which course you want to request customized material for.</p>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {purchasedCourses.map(course => (
                <button
                  key={course._id}
                  onClick={() => router.push(`/courses/${course._id}`)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group flex items-center gap-3 shadow-sm"
                >
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <BookOpen className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="font-bold text-navy group-hover:text-primary transition-colors">{course.title}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{course.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
