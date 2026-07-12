'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, CheckCircle, PlayCircle, FileText, Lock, Clock, Award, TrendingUp, AlertCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

const PdfPreviewModal = dynamic(() => import('@/components/PdfPreviewModal'), { ssr: false })

export default function AdvancedLearnPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    fetchCourseData()
  }, [params.courseId])

  const fetchCourseData = async () => {
    try {
      // Fetch course with populate=true to get modules -> lessons -> subtopics -> documents
      const courseRes = await api.get(`/courses/${params.courseId}?populate=true`)
      const fetchedCourse = courseRes.data.course
      setCourse(fetchedCourse)
      
      const courseModules = fetchedCourse.modules || []
      setModules(courseModules)
      
      // Fetch progress (optional - may fail if not logged in)
      try {
        const progressRes = await api.get(`/progress/course/${params.courseId}`)
        setProgress(progressRes.data.progress)
      } catch (err) {
        console.log('Progress not available (not logged in)')
        setProgress({ completionPercentage: 0, lessonsCompleted: [], daysRemaining: null })
      }
      
      // Select first module if available
      if (courseModules.length > 0) {
        selectModule(courseModules[0])
      }
    } catch (error) {
      console.error('Fetch failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectModule = (module) => {
    setActiveModule(module)
    // Combine real lessons with directSubtopics treated as lessons
    const fetchedLessons = [...(module.lessons || [])]
    const directTopics = (module.directSubtopics || []).map(topic => ({
      _id: topic._id,
      title: topic.title,
      type: 'subtopic',
      duration: 'N/A',
      isLocked: false,
      subtopics: [topic], // Wrap the subtopic itself so the UI renders its content
    }))
    const combined = [...fetchedLessons, ...directTopics]
    setLessons(combined)
    if (combined.length > 0) {
      setActiveLesson(combined[0])
    } else {
      setActiveLesson(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic">
      <Navbar />

      {/* Course Header */}
      <div className="bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">{course?.title}</h1>
              <p className="text-ink">{course?.instructor}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">{progress?.completionPercentage || 0}%</span>
              </div>
              <p className="text-muted text-sm">Course Progress</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-academic rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress?.completionPercentage || 0}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>

          {/* Expiry Warning */}
          {progress?.daysRemaining && progress.daysRemaining < 30 && (
            <div className="mt-4 bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <span className="text-orange-300">
                Course expires in {progress.daysRemaining} days
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Modules */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-primary/10 p-5 sticky top-24 shadow-premium">
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Modules
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {modules.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted mb-2">No modules available yet</p>
                    <p className="text-muted text-sm">This course is being prepared</p>
                  </div>
                ) : (
                  modules.map((module, index) => (
                    <motion.button
                      key={module._id}
                      onClick={() => selectModule(module)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-300 ${
                        activeModule?._id === module._id
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                          : 'bg-slate-50 text-ink hover:bg-slate-100 border border-primary/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {progress?.lessonsCompleted?.some(l => lessons.find(lesson => lesson._id === l && lesson.moduleId === module._id)) ? (
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            activeModule?._id === module._id 
                              ? 'bg-white/20' 
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        <span className="text-sm font-semibold leading-tight">{module.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-80 ml-10">
                        <Clock className="h-3 w-3" />
                        {module.duration}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Custom Request Promo in Sidebar */}
              <div className="mt-8 pt-6 border-t border-primary/10">
                <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-5 text-white shadow-md shadow-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <h3 className="font-bold text-lg mb-2 relative z-10">Need a Custom Package?</h3>
                  <p className="text-sm text-white/90 mb-4 relative z-10 font-medium">Request personalized practice papers and notes from the admin.</p>
                  <button 
                    onClick={() => router.push(`/courses/${params.courseId}`)}
                    className="w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors relative z-10 shadow-sm"
                  >
                    Request Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Lessons Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-secondary/20 p-4 shadow-premium">
                  <h3 className="text-md font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4">Lessons</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {lessons.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-muted text-sm">No lessons yet</p>
                      </div>
                    ) : (
                      lessons.map((lesson) => (
                        <motion.button
                          key={lesson._id}
                          onClick={() => setActiveLesson(lesson)}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                            activeLesson?._id === lesson._id
                              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                              : 'bg-slate-50 text-ink hover:bg-slate-100 border border-primary/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {progress?.lessonsCompleted?.includes(lesson._id) ? (
                              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            ) : lesson.isLocked ? (
                              <Lock className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="text-xs leading-tight">{lesson.title}</span>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {activeLesson && (
                    <motion.div
                      key={activeLesson._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl border border-primary/10 p-8 shadow-premium"
                    >
                      {/* Lesson Content Wrapper */}
                      <div className="w-full">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                            {activeLesson.title}
                          </h1>
                          <p className="text-ink mb-6 text-lg">
                            {typeof activeLesson.description === 'string' ? activeLesson.description : ''}
                          </p>

                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2 text-muted">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{activeLesson.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted">
                              <BookOpen className="h-4 w-4" />
                              <span className="text-sm capitalize">{activeLesson.type}</span>
                            </div>
                          </div>

                          {activeLesson.videoUrl && (
                            <div className="mb-8 bg-black rounded-xl aspect-video flex items-center justify-center border border-white/10 overflow-hidden">
                              <PlayCircle className="h-16 w-16 text-primary" />
                            </div>
                          )}

                          {/* Subtopics Content */}
                          <div className="lesson-content space-y-8">
                            <style jsx global>{`
                              .lesson-content h2 {
                                font-size: 1.75rem;
                                font-weight: 700;
                                color: var(--primary);
                                margin-top: 2rem;
                                margin-bottom: 1rem;
                                padding-bottom: 0.5rem;
                                border-bottom: 2px solid rgba(var(--primary-rgb), 0.2);
                              }
                              .lesson-content h3 {
                                font-size: 1.35rem;
                                font-weight: 600;
                                color: var(--secondary);
                                margin-top: 1.5rem;
                                margin-bottom: 0.75rem;
                              }
                              .lesson-content p {
                                color: #475569;
                                line-height: 1.8;
                                margin-bottom: 1rem;
                                font-size: 1.05rem;
                              }
                              .lesson-content ul, .lesson-content ol {
                                color: #475569;
                                margin-left: 1.5rem;
                                margin-bottom: 1rem;
                                line-height: 1.8;
                              }
                              .lesson-content li {
                                margin-bottom: 0.5rem;
                                padding-left: 0.5rem;
                              }
                              .lesson-content ul li {
                                list-style-type: none;
                                position: relative;
                              }
                              .lesson-content ul li:before {
                                content: "▹";
                                color: var(--primary);
                                font-weight: bold;
                                position: absolute;
                                left: -1.25rem;
                              }
                              .lesson-content ol li {
                                list-style-type: decimal;
                                color: #475569;
                              }
                              .lesson-content strong {
                                color: var(--primary);
                                font-weight: 600;
                              }
                              .lesson-content code {
                                background: rgba(var(--primary-rgb), 0.1);
                                color: var(--primary);
                                padding: 0.2rem 0.5rem;
                                border-radius: 0.25rem;
                                font-family: 'Courier New', monospace;
                                font-size: 0.95rem;
                              }
                            `}</style>

                            {(activeLesson.subtopics || []).map((subtopic) => (
                              <div key={subtopic._id} className="bg-academic rounded-xl p-6 border border-primary/10">
                                <h2 className="text-2xl font-bold text-navy mb-4">{subtopic.title}</h2>
                                {subtopic.content && (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: subtopic.content
                                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                        .replace(/on\w+="[^"]*"/gi, '')
                                        .replace(/javascript:/gi, '')
                                    }}
                                  />
                                )}
                                
                                {/* Documents / PDFs Section for Subtopic */}
                                {(() => {
                                  const docs = subtopic.documents || (subtopic.document ? [subtopic.document] : []);
                                  if (!docs || docs.length === 0) return null;
                                  return (
                                    <div className="mt-6 pt-6 border-t border-primary/10">
                                      <h3 className="text-lg font-bold text-navy flex items-center gap-2 mb-4">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Study Materials & PDFs
                                      </h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        {docs.map((doc, idx) => {
                                          return (
                                            <button
                                              key={idx}
                                              onClick={() => setPreviewDoc({...doc, subtopicId: subtopic._id})}
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
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ))}
                            {(activeLesson.subtopics || []).length === 0 && (
                              <p className="text-muted text-center py-6">No content available</p>
                            )}
                          </div>

                          {/* Summary Section */}
                          {activeLesson.content?.summary && typeof activeLesson.content.summary === 'string' && (
                            <div className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Key Takeaways
                              </h3>
                              <p className="text-ink leading-relaxed">{activeLesson.content.summary}</p>
                            </div>
                          )}

                          {/* Navigation Buttons */}
                          <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                            <button
                              onClick={() => {
                                const currentIndex = lessons.findIndex(l => l._id === activeLesson._id)
                                if (currentIndex > 0) setActiveLesson(lessons[currentIndex - 1])
                              }}
                              disabled={lessons.findIndex(l => l._id === activeLesson._id) === 0}
                              className="px-6 py-3 bg-academic text-navy rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/progress/course/${params.courseId}/lesson/${activeLesson._id}`)
                                  // Update progress state locally instead of full re-fetch
                                  setProgress(prev => {
                                    const completed = prev?.lessonsCompleted || []
                                    if (!completed.includes(activeLesson._id)) {
                                      const newCompleted = [...completed, activeLesson._id]
                                      // Count ALL learnable items: lessons + direct subtopics across
                                      // every module (subtopic-based courses have empty m.lessons).
                                      const totalLessons = modules.reduce((acc, m) => {
                                        return acc + (m.lessons?.length || 0) + (m.directSubtopics?.length || 0)
                                      }, 0)
                                      return {
                                        ...prev,
                                        lessonsCompleted: newCompleted,
                                        completionPercentage: totalLessons > 0
                                          ? Math.min(100, Math.round((newCompleted.length / totalLessons) * 100))
                                          : 0
                                      }
                                    }
                                    return prev
                                  })
                                  const currentIndex = lessons.findIndex(l => l._id === activeLesson._id)
                                  if (currentIndex < lessons.length - 1) {
                                    setActiveLesson(lessons[currentIndex + 1])
                                  } else {
                                    // Move to next module
                                    const currentModuleIndex = modules.findIndex(m => m._id === activeModule?._id)
                                    if (currentModuleIndex >= 0 && currentModuleIndex < modules.length - 1) {
                                      const nextModule = modules[currentModuleIndex + 1]
                                      selectModule(nextModule)
                                    } else {
                                      alert("Congratulations! You have completed all lessons in this course.")
                                    }
                                  }
                                } catch (err) {
                                  console.log('Progress update failed:', err)
                                  // Still navigate even if progress update fails
                                  const currentIndex = lessons.findIndex(l => l._id === activeLesson._id)
                                  if (currentIndex < lessons.length - 1) {
                                    setActiveLesson(lessons[currentIndex + 1])
                                  } else {
                                    // Move to next module
                                    const currentModuleIndex = modules.findIndex(m => m._id === activeModule?._id)
                                    if (currentModuleIndex >= 0 && currentModuleIndex < modules.length - 1) {
                                      const nextModule = modules[currentModuleIndex + 1]
                                      selectModule(nextModule)
                                    } else {
                                      alert("Congratulations! You have completed all lessons in this course.")
                                    }
                                  }
                                }
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg shadow-primary/20"
                            >
                              Complete & Next
                            </button>
                          </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      {previewDoc && (
        <PdfPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} isPurchased={true} user={{ _id: 'dummy' }} />
      )}
    </div>
  )
}
