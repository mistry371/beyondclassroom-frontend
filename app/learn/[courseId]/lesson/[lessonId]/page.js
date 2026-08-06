'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, CheckCircle, ArrowLeft, ArrowRight, Target, Clock, Award, PlayCircle, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MathRenderer from '@/components/MathRenderer'
import TrialGuard from '@/components/TrialGuard'
import dynamic from 'next/dynamic'

const PdfPreviewModal = dynamic(() => import('@/components/PdfPreviewModal'), { ssr: false })
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState(null)
  const [subtopics, setSubtopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    fetchLessonData()
  }, [params.lessonId])

  const fetchLessonData = async () => {
    try {
      const lessonRes = await api.get(`/lessons/${params.lessonId}`)
      setLesson(lessonRes.data.lesson)

      const subtopicsRes = await api.get(`/subtopics/lesson/${params.lessonId}`).catch(() => ({ data: { subtopics: [] } }))
      
      setSubtopics(subtopicsRes.data.subtopics || [])
    } catch (error) {
      console.error('Failed to fetch lesson:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleCompleteLesson = async () => {
    setCompleting(true)
    try {
      await api.put(`/progress/course/${params.courseId}/lesson/${params.lessonId}`)
      router.push(`/learn/${params.courseId}`)
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic flex items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-navy text-xl">Lesson not found</p>
        </div>
      </div>
    )
  }


  return (
    <TrialGuard courseId={params.courseId}>
    <div className="min-h-screen bg-academic">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/learn/${params.courseId}`)}
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Course
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-premium rounded-2xl border border-primary/10 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl">
                  <BookOpen className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-navy">{lesson.title}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.duration}
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                      {lesson.type || 'Lesson'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Concept Explanation */}
              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold text-navy mb-4">📚 Concept Explanation</h2>
                <div className="text-ink leading-relaxed">
                  <MathRenderer content={
                    typeof lesson.content === 'string' ? lesson.content :
                    typeof lesson.content?.concept === 'string' ? lesson.content.concept :
                    typeof lesson.description === 'string' ? lesson.description : ''
                  } />
                </div>
              </div>

              {/* Examples */}
              {lesson.content?.examples && lesson.content.examples.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-navy mb-4">💡 Examples</h2>
                  <div className="space-y-4">
                    {lesson.content.examples.map((example, index) => (
                      <div
                        key={index}
                        className="bg-academic border border-primary/10 rounded-xl p-6"
                      >
                        <h3 className="text-lg font-semibold text-primary mb-3">
                          Example {index + 1}
                        </h3>
                        <div className="text-ink">
                          <MathRenderer content={example} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtopics and PDFs */}
              {subtopics.length > 0 && (
                <div className="mb-8 space-y-6">
                  {subtopics.map((subtopic) => {
                    const docs = subtopic.documents || (subtopic.document ? [subtopic.document] : [])
                    return (
                      <div key={subtopic._id} className="bg-academic border border-primary/10 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-navy mb-3">{subtopic.title}</h3>
                        {subtopic.content && (
                          <div className="text-ink mb-4 prose max-w-none">
                            <MathRenderer content={subtopic.content} />
                          </div>
                        )}
                        {docs.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-primary/10">
                            <h4 className="text-lg font-bold text-navy flex items-center gap-2 mb-4">
                              <FileText className="h-5 w-5 text-primary" />
                              Study Materials & PDFs
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                              {docs.map((doc, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setPreviewDoc(doc)}
                                  className="group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg transition-all text-left"
                                >
                                  <div className="bg-slate-50 p-3 rounded-xl text-primary border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors shrink-0 shadow-sm">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0 py-0.5">
                                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                                      {doc.name || 'Study Material'}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.4)]"></span>
                                      Document File
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Video */}
              {lesson.videoUrl && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-navy mb-4">🎥 Video Lesson</h2>
                  <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-primary/10">
                    <PlayCircle className="h-16 w-16 text-primary" />
                    <p className="text-muted ml-4">Video player coming soon</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Complete Lesson Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={handleCompleteLesson}
                  disabled={completing}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {completing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Complete Lesson
                    </>
                  )}
                </button>
              </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-premium rounded-2xl border border-primary/10 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-navy mb-4">Lesson Progress</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-academic rounded-lg">
                  <span className="text-muted">Duration</span>
                  <span className="text-navy font-semibold">{lesson.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {previewDoc && (
      <PdfPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} isPurchased={true} />
    )}
    </TrialGuard>
  )
}
