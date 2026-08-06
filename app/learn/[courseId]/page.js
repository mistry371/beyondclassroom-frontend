'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, CheckCircle, PlayCircle, Lock, Award, Clock, Target, TrendingUp, ChevronRight, ChevronDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState(null)
  const [expandedModules, setExpandedModules] = useState([0])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [params.courseId])

  const fetchCourseData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/courses/${params.courseId}`),
        api.get(`/modules/course/${params.courseId}`),
      ])

      const courseData = courseRes.data.course
      setCourse(courseData)

      const freeCourse = courseData?.isFree || courseData?.isDemo

      // Try to get profile — may fail if not logged in (guest/unauthenticated)
      let purchasedIds = []
      let userRole = 'user'
      try {
        const profileRes = await api.get('/profile')
        purchasedIds = (profileRes.data?.user?.purchasedCourses || []).map((c) => c?._id || c)
        userRole = profileRes.data?.user?.role || 'user'
        // purchasedIds hold composite "courseId_packageId" entries (plus bare
        // package ids); match on the base course id, not an exact string.
        const baseParam = params.courseId.includes('_') ? params.courseId.split('_')[0] : params.courseId
        const owns = purchasedIds.some((id) => {
          const entry = String(id)
          const base = entry.includes('_') ? entry.split('_')[0] : entry
          return base === baseParam || entry === params.courseId
        })
        setHasAccess(freeCourse || owns)
      } catch (_) {
        // Not logged in — only free/demo courses accessible
        setHasAccess(!!freeCourse)
      }

      // Filter restricted subtopics based on user packages. purchasedIds holds
      // composite "courseId_pkgId" entries AND bare package ids, while st.packageIds
      // holds BARE package ids — so match on either form (a bare id OR the "_pkg"
      // suffix of a composite entry), else package-restricted content is wrongly hidden.
      const ownsPackage = (pkgId) => purchasedIds.some(id => {
        const s = String(id)
        return s === pkgId || s.endsWith(`_${pkgId}`)
      })
      const filterSubtopics = (subtopicsList) => {
        if (userRole === 'admin' || userRole === 'super_admin') return subtopicsList;
        return subtopicsList.filter(st => {
          if (!st.packageIds || st.packageIds.length === 0) return true;
          return st.packageIds.some(pkgId => ownsPackage(pkgId));
        });
      };

      const filteredModules = (modulesRes.data.modules || []).map(m => ({
        ...m,
        directSubtopics: filterSubtopics(m.directSubtopics || [])
      }))
      
      setModules(filteredModules)

      try {
        const progressRes = await api.get(`/progress/course/${params.courseId}`)
        setProgress(progressRes.data.progress)
      } catch (_) {
        // No progress yet — not an error
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error)
      // Don't leave blank — show course not found
      setCourse(null)
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (index) => {
    setExpandedModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const isLessonCompleted = (lessonId) => {
    return progress?.lessonsCompleted?.includes(lessonId) || false
  }

  const isModuleCompleted = (module) => {
    if (!module.lessons || module.lessons.length === 0) return false
    return module.lessons.every(lesson => isLessonCompleted(lesson._id))
  }

  const getModuleProgress = (module) => {
    if (!module.lessons || module.lessons.length === 0) return 0
    const completed = module.lessons.filter(lesson => isLessonCompleted(lesson._id)).length
    return Math.round((completed / module.lessons.length) * 100)
  }

  const isModuleUnlocked = (moduleIndex) => {
    if (moduleIndex === 0) return true // First module always unlocked
    // Previous module must be completed
    const prevModule = modules[moduleIndex - 1]
    return isModuleCompleted(prevModule)
  }

  const handleStartLesson = (lessonId, moduleIndex) => {
    if (!hasAccess) return
    if (!isModuleUnlocked(moduleIndex)) return
    router.push(`/learn/${params.courseId}/lesson/${lessonId}`)
  }

  const handleStartSubtopic = (subtopicId, moduleIndex, isPreview = false) => {
    if (!hasAccess && !isPreview) return // preview topics are viewable without access
    if (!isModuleUnlocked(moduleIndex)) return
    router.push(`/learn/${params.courseId}/subtopic/${subtopicId}`)
  }

  const handleStartQuiz = (quizId, moduleIndex) => {
    if (!hasAccess) return
    if (!isModuleUnlocked(moduleIndex)) return
    router.push(`/learn/${params.courseId}/quiz/${quizId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-40 bg-primary/5 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-24 bg-primary/5 rounded-xl"></div>
              <div className="h-24 bg-primary/5 rounded-xl"></div>
              <div className="h-24 bg-primary/5 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-primary/5 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-navy text-xl">Course not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic">
      <Navbar />

      {/* Course Header */}
      <div className="bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/dashboard')}>Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-navy">{course.title}</span>
            </div>
            
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-[300px]">
                <h1 className="text-4xl font-bold text-navy mb-3">{course.title}</h1>
                <p className="text-muted text-lg mb-4">{course.description}</p>
                
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-ink">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <span>{modules.length} Modules</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink">
                    <Target className="h-5 w-5 text-accent" />
                    <span>{course.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 p-6 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-ink font-medium">Course Progress</span>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-5xl font-bold text-navy mb-3">
                  {progress?.completionPercentage || 0}%
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress?.completionPercentage || 0}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{progress?.lessonsCompleted?.length || 0} lessons</span>
                  {progress?.expiryDate && (
                    <span className="text-yellow-600">
                      {Math.ceil((new Date(progress.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {!hasAccess && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-navy mb-2">Purchase to Unlock</h3>
              <p className="text-muted mb-4">You can preview structure, but lessons and quizzes are locked until purchase.</p>
              <button onClick={() => router.push(`/packages`)} className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold">Purchase a Package</button>
            </div>
          )}
          {modules.length === 0 ? (
            <div className="bg-white shadow-premium rounded-2xl border border-primary/10 p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-navy mb-2">No Modules Available</h3>
              <p className="text-muted">Course content is being prepared</p>
            </div>
          ) : (
            modules.map((module, moduleIndex) => (
              <motion.div
                key={module._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
                className="bg-white shadow-premium rounded-2xl border border-primary/10 overflow-hidden"
              >
                {/* Module Header */}
                <button
                  onClick={() => isModuleUnlocked(moduleIndex) && toggleModule(moduleIndex)}
                  className={`w-full p-6 flex items-center justify-between transition-all ${(isModuleUnlocked(moduleIndex) && hasAccess) ? 'hover:bg-slate-50' : 'cursor-not-allowed opacity-70'}`}
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      isModuleCompleted(module)
                        ? 'bg-green-500/20 text-green-400'
                        : !isModuleUnlocked(moduleIndex)
                        ? 'bg-gray-500/20 text-muted'
                        : 'bg-gradient-to-r from-primary to-secondary text-white'
                    }`}>
                      {isModuleCompleted(module) ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : !isModuleUnlocked(moduleIndex) ? (
                        <Lock className="h-6 w-6" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-navy mb-1">{module.title}</h3>
                      <p className="text-muted text-sm line-clamp-2">{module.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <BookOpen className="h-4 w-4" />
                          <span>{module.lessons?.length || 0} Lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration}</span>
                        </div>
                        {module.quiz && (
                          <div className="flex items-center gap-2 text-sm text-yellow-400">
                            <Award className="h-4 w-4" />
                            <span>Quiz</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {getModuleProgress(module)}%
                      </div>
                      <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${getModuleProgress(module)}%` }}
                        />
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-6 w-6 text-muted transition-transform flex-shrink-0 ${
                        expandedModules.includes(moduleIndex) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {!isModuleUnlocked(moduleIndex) && (
                  <div className="px-6 pb-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                      <Lock className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      <p className="text-yellow-400 text-sm">Complete <strong>{modules[moduleIndex - 1]?.title}</strong> to unlock this module.</p>
                    </div>
                  </div>
                )}

                {/* Module Content */}
                <AnimatePresence>
                  {expandedModules.includes(moduleIndex) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-primary/10"
                    >
                      <div className="p-6 space-y-3">
                        {/* Direct Subtopics */}
                        {module.directSubtopics?.map((subtopic, subtopicIndex) => (
                          <motion.div
                            key={subtopic._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subtopicIndex * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all relative bg-academic border border-primary/10 hover:border-primary/30`}
                          >
                            {!hasAccess && !subtopic.isPreview && <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30 rounded-xl" />}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <PlayCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-navy font-semibold truncate">{subtopic.title}</h4>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded">
                                    Topic
                                  </span>
                                  {!hasAccess && subtopic.isPreview && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">Free Preview</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartSubtopic(subtopic._id, moduleIndex, subtopic.isPreview)}
                              disabled={!isModuleUnlocked(moduleIndex)}
                              className={`px-6 py-2 rounded-lg font-medium transition-all flex-shrink-0 ml-4 relative z-10 ${
                                !isModuleUnlocked(moduleIndex)
                                  ? 'bg-gray-500/20 text-muted cursor-not-allowed'
                                  : (!hasAccess && !subtopic.isPreview)
                                  ? 'bg-gray-500/20 text-muted'
                                  : 'bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90'
                              }`}
                            >
                              {!isModuleUnlocked(moduleIndex) ? (
                                <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Locked</span>
                              ) : (!hasAccess && !subtopic.isPreview) ? (
                                <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Locked</span>
                              ) : (!hasAccess && subtopic.isPreview) ? 'Preview' : 'View Topic'}
                            </button>
                          </motion.div>
                        ))}

                        {/* Lessons */}
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lesson._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lessonIndex * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all relative ${
                              isLessonCompleted(lesson._id)
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'bg-academic border border-primary/10 hover:border-primary/30'
                            }`}
                          >
                            {!hasAccess && <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30 rounded-xl" />}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {isLessonCompleted(lesson._id) ? (
                                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              )}
                              
                              <div className="min-w-0 flex-1">
                                <h4 className="text-navy font-semibold truncate">{lesson.title}</h4>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-sm text-muted">{lesson.duration}</span>
                                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                                    {lesson.type || 'Lesson'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartLesson(lesson._id, moduleIndex)}
                              disabled={!isModuleUnlocked(moduleIndex)}
                              className={`px-6 py-2 rounded-lg font-medium transition-all flex-shrink-0 ml-4 ${
                                !isModuleUnlocked(moduleIndex)
                                  ? 'bg-gray-500/20 text-muted cursor-not-allowed'
                                  : isLessonCompleted(lesson._id)
                                  ? 'bg-slate-100 text-navy hover:bg-slate-200'
                                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                              }`}
                            >
                              {!isModuleUnlocked(moduleIndex) ? (
                                <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Locked</span>
                              ) : isLessonCompleted(lesson._id) ? 'Review' : 'Start'}
                            </button>
                          </motion.div>
                        ))}

                        {/* Module Quiz */}
                        {module.quiz && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (module.lessons?.length || 0) * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 mt-4"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <Award className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                              
                              <div className="min-w-0 flex-1">
                                <h4 className="text-navy font-semibold">Module Quiz</h4>
                                <p className="text-sm text-muted">
                                  Test your knowledge • {module.quiz.questions?.length || 0} questions
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartQuiz(module.quiz._id, moduleIndex)}
                              disabled={getModuleProgress(module) < 100 || !isModuleUnlocked(moduleIndex)}
                              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-4"
                            >
                              {getModuleProgress(module) < 100 ? (
                                <span className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  Locked
                                </span>
                              ) : (
                                'Take Quiz'
                              )}
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
