'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowRight, Award, BookOpen, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, FileText, Lock, PlayCircle, ShieldCheck, ShoppingCart, Sparkles, Star, Target, X, Download, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PaymentModal from '@/components/PaymentModal'
import PackagePickerModal from '@/components/PackagePickerModal'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'
import dynamic from 'next/dynamic'

const PdfPreviewModal = dynamic(() => import('@/components/PdfPreviewModal'), { ssr: false })

const steps = ['Modules', 'Preferences', 'Summary']

const defaultPreferences = {
  level: 'Standard',
  learningSpeed: 'Balanced',
  worksheetFrequency: 'Weekly',
  testFrequency: 'Bi-weekly',
  languagePreference: 'English',
  revisionMode: 'Smart revision',
}

function getDocs(subtopic) {
  return subtopic?.documents || (subtopic?.document ? [subtopic.document] : [])
}

function CourseDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get('packageId')
  
  const { user } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [modules, setModules] = useState([])
  const [selected, setSelected] = useState({})
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState(0)
  const [requestLoading, setRequestLoading] = useState(false)
  const [usageLimit, setUsageLimit] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [marks, setMarks] = useState('')
  const [studentAttachedFile, setStudentAttachedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [expandedModules, setExpandedModules] = useState({})
  const [expandedChapters, setExpandedChapters] = useState({})

  const toggleModule = (id) => setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleChapter = (id) => setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }))

  const [showPackagePicker, setShowPackagePicker] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [matchingPackages, setMatchingPackages] = useState([])
  const [checkingPackages, setCheckingPackages] = useState(true)

  useEffect(() => {
    fetchCourse()
  }, [params.id, user?._id])

  useEffect(() => {
    if (course?._id) {
      setCheckingPackages(true)
      api.get('/packages')
        .then(res => {
          const allPkgs = res.data.packages || []
          const filtered = allPkgs.filter(pkg => 
            pkg.active !== false && 
            Array.isArray(pkg.courseIds) && 
            pkg.courseIds.includes(course._id)
          )
          setMatchingPackages(filtered)
        })
        .catch(err => console.error('Failed to load matching packages', err))
        .finally(() => setCheckingPackages(false))
    }
  }, [course?._id])

  useEffect(() => {
    if (course && user) {
      const stored = localStorage.getItem('pendingPackagePurchase')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.packageId && Array.isArray(parsed.selectedCourseIds) && parsed.selectedCourseIds.includes(course._id)) {
            // Fetch package details
            api.get(`/packages/${parsed.packageId}`)
              .then(res => {
                if (res.data.package) {
                  setSelectedPackage(res.data.package)
                  setShowPaymentModal(true)
                  localStorage.removeItem('pendingPackagePurchase')
                }
              })
              .catch(err => console.error(err))
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [course, user])

  useEffect(() => {
    if (course && searchParams.get('buy') === 'true') {
      setShowPackagePicker(true)
    }
  }, [course, searchParams])

  // Copy/paste restrictions temporarily removed

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/courses/${params.id}?populate=true`)
      const loadedCourse = response.data.course
      setCourse(loadedCourse)
      setModules(loadedCourse.modules || [])
    } catch (error) {
      console.error('Fetch course failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      api.get('/custom-requests/my/limits')
        .then(res => setUsageLimit(res.data.usage))
        .catch(err => console.error('Failed to fetch usage limits', err))
    }
  }, [user])

  const selection = useMemo(() => {
    const selectedModules = []
    const selectedLessons = []
    const selectedSubtopics = []
    const selectedPdfs = []

    modules.forEach((moduleItem) => {
      if (selected[moduleItem._id]) selectedModules.push({ moduleId: moduleItem._id, moduleTitle: moduleItem.title })
      ;(moduleItem.directSubtopics || []).forEach((subtopic) => {
        if (selected[subtopic._id]) selectedSubtopics.push({ moduleId: moduleItem._id, lessonId: null, subtopicId: subtopic._id, subtopicTitle: subtopic.title })
        getDocs(subtopic).forEach((doc, index) => {
          const id = `${subtopic._id}:pdf:${index}`
          if (selected[id]) selectedPdfs.push({ subtopicId: subtopic._id, subtopicTitle: subtopic.title, name: doc?.name || `PDF ${index + 1}`, type: doc?.type || 'application/pdf' })
        })
      })
      ;(moduleItem.lessons || []).forEach((lesson) => {
        if (selected[lesson._id]) selectedLessons.push({ moduleId: moduleItem._id, moduleTitle: moduleItem.title, lessonId: lesson._id, lessonTitle: lesson.title })
        ;(lesson.subtopics || []).forEach((subtopic) => {
          if (selected[subtopic._id]) selectedSubtopics.push({ moduleId: moduleItem._id, lessonId: lesson._id, subtopicId: subtopic._id, subtopicTitle: subtopic.title })
          getDocs(subtopic).forEach((doc, index) => {
            const id = `${subtopic._id}:pdf:${index}`
            if (selected[id]) selectedPdfs.push({ subtopicId: subtopic._id, subtopicTitle: subtopic.title, name: doc?.name || `PDF ${index + 1}`, type: doc?.type || 'application/pdf' })
          })
        })
      })
    })

    return { selectedModules, selectedLessons, selectedSubtopics, selectedPdfs }
  }, [modules, selected])

  const roadmap = useMemo(() => {
    return {
      duration: `48 hours`,
      lines: [
        `Start with ${selection.selectedModules.length || 'selected'} module foundation review`,
      ],
    }
  }, [preferences, selection])

  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  const requireLogin = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent('/courses/' + params.id)}`)
  }

  const submitCustomization = async () => {
    if (!user) return requireLogin()
    if (!selection.selectedModules.length && !selection.selectedLessons.length && !selection.selectedSubtopics.length && !selection.selectedPdfs.length) {
      showError('Please select at least one module, lesson, topic, subtopic, or PDF.')
      return
    }
    if (usageLimit && !usageLimit.hasUnlimited && usageLimit.used >= usageLimit.limit) {
      showError(`You have used all ${usageLimit.limit} of your custom requests. Please upgrade your package to request more.`)
      return
    }

    try {
      setRequestLoading(true)
      await api.post('/custom-requests', {
        title: `Custom Package - ${course.title}`,
        description: notes || `Personalized package request for ${course.title}`,
        deliverable: 'custom_course_package',
        budget: roadmap.price,
        selectedTopics: selection.selectedModules,
        selectedModules: selection.selectedModules,
        selectedLessons: selection.selectedLessons,
        selectedSubtopics: selection.selectedSubtopics,
        selectedPdfs: selection.selectedPdfs,
        preferences,
        roadmap: roadmap.lines,
        estimatedDuration: roadmap.duration,
        packageSummary: `${selection.selectedModules.length} modules, ${selection.selectedLessons.length} lessons, ${selection.selectedSubtopics.length} subtopics, ${selection.selectedPdfs.length} PDFs`,
        status: 'pending',
        packageId,
        marks: marks ? Number(marks) : undefined,
        studentAttachedFile,
      })
      showSuccess('Customization request sent to admin. You can track it from your dashboard.')
      router.push('/dashboard/custom-requests')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit customization request')
    } finally {
      setRequestLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStudentAttachedFile(res.data.fileUrl)
      showSuccess('File uploaded successfully')
    } catch (err) {
      showError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) return requireLogin()
    try {
      await api.post('/cart', { courseId: course._id })
      router.push('/cart')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add to cart. Please try again.')
    }
  }

  const handleEnroll = async () => {
    if (!user) return requireLogin()
    if (course.isFree || course.isDemo) {
      try {
        await api.post('/cart', { courseId: course._id }).catch(() => {})
        await api.post('/orders')
        router.push(`/learn/${course._id}`)
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to enroll. Please try again.')
      }
      return
    }
    setShowPaymentModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center text-xl font-bold text-navy">Course not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic pb-16 select-none">
      <Navbar />

      <section className="relative overflow-hidden premium-section border-b border-primary/10 bg-gradient-to-b from-white/40 to-transparent">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-5 py-2 text-sm font-bold text-primary border border-primary/20 backdrop-blur-md shadow-sm">
                <BookOpen className="h-4 w-4" /> {course.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-5 py-2 text-sm font-bold text-secondary border border-secondary/20 backdrop-blur-md shadow-sm">
                <Target className="h-4 w-4" /> {course.difficulty}
              </span>
            </div>
            <h1 className="text-5xl font-black leading-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-br from-navy via-primary to-secondary drop-shadow-sm pb-2">
              {course.grade || (course.title.match(/Class\s*\d+/i) ? course.title.match(/Class\s*\d+/i)[0] : course.title)}
            </h1>
            <p className="mt-8 max-w-3xl text-xl leading-relaxed text-muted font-medium">
              {course.description}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1fr_420px] items-start">
          <div className="rounded-3xl border border-primary/10 bg-white p-8 shadow-premium">

            {modules.length === 0 ? (
              <p className="rounded-2xl bg-academic p-6 text-muted font-medium text-lg text-center">No modules are published for this course yet.</p>
            ) : (
              <div className="space-y-5">
                {modules.map((moduleItem) => (
                  <div key={moduleItem._id} className="rounded-2xl border border-primary/10 bg-academic overflow-hidden shadow-sm transition-all duration-300">
                    <button 
                      onClick={() => toggleModule(moduleItem._id)}
                      className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-black text-navy text-lg">{moduleItem.title}</p>
                        {moduleItem.description && <p className="mt-1 text-sm text-muted">{moduleItem.description}</p>}
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted transition-transform duration-300 ${expandedModules[moduleItem._id] ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedModules[moduleItem._id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-primary/10 bg-slate-50/50"
                        >
                          <div className="p-5">
                            {(moduleItem.lessons || []).length === 0 && (moduleItem.directSubtopics || []).length === 0 ? (
                              <div className="flex items-center gap-3 text-muted bg-white p-4 rounded-xl border border-primary/10 border-dashed shadow-sm">
                                <BookOpen className="h-5 w-5 opacity-50" />
                                <p className="text-sm font-medium">Content is being prepared for this module.</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                
                                {/* Direct Subtopics */}
                                {(moduleItem.directSubtopics || []).length > 0 && (
                                  <div className="relative pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-primary/20 space-y-4">
                                    {(moduleItem.directSubtopics || []).map((subtopic) => (
                                      <div key={subtopic._id} className="relative">
                                        <div className="absolute top-4 -left-6 w-3 h-3 rounded-full border-2 border-white bg-primary ring-4 ring-primary/10 z-10" />
                                        <div className="bg-white rounded-xl border border-primary/10 p-4 shadow-sm hover:shadow-md transition-shadow">
                                          <p className="font-bold text-navy text-base">{subtopic.title}</p>
                                          {getDocs(subtopic).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                              {getDocs(subtopic).map((doc, index) => (
                                                <button key={`${subtopic._id}-${index}`} onClick={() => setPreviewDoc(doc)} className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                                  <FileText className="h-4 w-4" /> 
                                                  <span className="truncate max-w-[200px]">{doc?.name || `Document ${index + 1}`}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Chapters / Lessons */}
                                {(moduleItem.lessons || []).length > 0 && (
                                  <div className="space-y-4">
                                    {(moduleItem.lessons || []).map((lesson, lIdx) => (
                                      <div key={lesson._id} className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
                                        <button
                                          onClick={() => toggleChapter(lesson._id)}
                                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors group"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                                              {lIdx + 1}
                                            </div>
                                            <p className="font-bold text-navy text-md group-hover:text-primary transition-colors">{lesson.title}</p>
                                          </div>
                                          <ChevronDown className={`h-5 w-5 text-muted transition-transform duration-300 ${expandedChapters[lesson._id] ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                          {expandedChapters[lesson._id] && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="px-4 pb-4 bg-slate-50"
                                            >
                                              {(lesson.subtopics || []).length === 0 ? (
                                                <div className="mt-2 flex items-center gap-2 text-muted text-sm italic px-4 py-3 bg-white rounded-xl border border-slate-100 border-dashed shadow-sm">
                                                  <p>No topics available yet.</p>
                                                </div>
                                              ) : (
                                                <div className="relative pl-6 mt-4 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-secondary/30 space-y-4">
                                                  {(lesson.subtopics || []).map((subtopic) => (
                                                    <div key={subtopic._id} className="relative">
                                                      <div className="absolute top-4 -left-6 w-3 h-3 rounded-full border-2 border-white bg-secondary ring-4 ring-secondary/20 z-10" />
                                                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-secondary/30 transition-colors">
                                                        <p className="font-bold text-slate-800 text-sm">{subtopic.title}</p>
                                                        {getDocs(subtopic).length > 0 && (
                                                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                                            {getDocs(subtopic).map((doc, index) => (
                                                              <button key={`${subtopic._id}-${index}`} onClick={() => setPreviewDoc(doc)} className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-secondary hover:text-white hover:border-secondary transition-all">
                                                                <FileText className="h-4 w-4" /> 
                                                                <span className="truncate max-w-[200px]">{doc?.name || `Document ${index + 1}`}</span>
                                                              </button>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    ))}
                                  </div>
                                )}

                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          {(() => {
            const isAlreadyPurchased = !!(user && user.purchasedCourses && user.purchasedCourses.includes(course._id))
            const isFreeOrDemo = course.isFree || course.isDemo

            if (isAlreadyPurchased || isFreeOrDemo) {
              if (user) {
                // Show Customization Flow
                return (
                  <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium relative overflow-hidden">
                    <div>
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-black text-navy">Customize My Course</h2>
                          <p className="text-sm text-muted">Select only what you want. Admin will review, finalize, and assign your package.</p>
                        </div>
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{steps[step]}</span>
                      </div>

                      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {steps.map((label, index) => (
                          <button key={label} onClick={() => setStep(index)} className={`h-2 rounded-full transition ${index <= step ? 'bg-brand-gradient' : 'bg-slate-200'}`} aria-label={label} />
                        ))}
                      </div>

                      {step === 0 && <SelectList title="Select modules" items={modules} selected={selected} onToggle={toggle} idKey="_id" titleKey="title" />}
                      {step === 1 && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block sm:col-span-2">
                            <span className="mb-2 block text-sm font-bold text-ink">Selected Course</span>
                            <input type="text" value={course?.title || ''} readOnly className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none opacity-70 cursor-not-allowed" />
                          </label>
                          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="sm:col-span-2 rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none" rows={4} placeholder="Tell admin what you want merged, customized, or prepared..." />
                          
                          <label className="block sm:col-span-2">
                            <span className="mb-2 block text-sm font-bold text-ink">Requested Marks (Optional)</span>
                            <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none" placeholder="e.g. 50" />
                          </label>
                          
                          <label className="block sm:col-span-2">
                            <span className="mb-2 block text-sm font-bold text-ink">Upload Reference Material (Optional)</span>
                            <input type="file" onChange={handleFileUpload} disabled={uploading} className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none" />
                            {uploading && <span className="text-sm text-green-600 mt-1 block">File attached successfully</span>}
                            {studentAttachedFile && !uploading && <span className="text-sm text-green-600 mt-1 block">File attached successfully</span>}
                          </label>
                        </div>
                      )}
                      {step === 2 && (
                        <div className="space-y-5">
                          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            <SummaryCard label="Modules Selected" value={selection.selectedModules.length} />
                          </div>
                          <div className="rounded-2xl bg-academic p-5">
                            <p className="font-black text-navy">Personalized roadmap</p>
                            <ul className="mt-3 space-y-2 text-sm text-muted">
                              {roadmap.lines.map((line) => <li key={line} className="flex gap-2"><Sparkles className="h-4 w-4 flex-shrink-0 text-accent" />{line}</li>)}
                            </ul>
                            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Estimated Delivery: {roadmap.duration}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/10 px-5 py-3 font-bold text-primary disabled:opacity-40">
                          <ChevronLeft className="h-5 w-5" /> Back
                        </button>
                        {step < steps.length - 1 ? (
                          <button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 font-bold text-white">
                            Next <ChevronRight className="h-5 w-5" />
                          </button>
                        ) : (
                          <div className="flex flex-col items-center sm:items-end">
                            <button 
                              onClick={submitCustomization} 
                              disabled={requestLoading || (usageLimit && !usageLimit.hasUnlimited && usageLimit.used >= usageLimit.limit)} 
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed">
                              {requestLoading ? 'Submitting...' : 
                               (usageLimit && !usageLimit.hasUnlimited && usageLimit.used >= usageLimit.limit) ? 'Package Limit Reached' : 
                               'Send Request to Admin'} <ArrowRight className="h-5 w-5" />
                            </button>
                            {usageLimit && !usageLimit.hasUnlimited && usageLimit.used >= usageLimit.limit && (
                              <p className="text-red-500 text-xs font-bold mt-2">You have exhausted the {usageLimit.limit} requests in your package.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              } else {
                // Free course, guest user -> Show "Start Learning for Free" card
                return (
                  <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Award className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Free Access</span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-navy leading-tight">Start Learning for Free</h3>
                      <p className="text-sm text-muted mt-2 leading-relaxed font-medium">
                        This is a free preview course. Register an account to track your progress, take practice tests, and view full worksheets!
                      </p>
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6">
                      <button 
                        onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(`/courses/${course._id}`)}`)}
                        className="w-full py-4 bg-brand-gradient text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:opacity-95 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        Sign Up to Learn <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              }
            } else {
              // Paid course, not purchased yet -> Show "Unlock Full Course" card
              return (
                <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">Premium Access</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-navy leading-tight">Unlock Full Course Benefits</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed font-medium">
                      Gain unlimited access to worksheets, solved examples, subjective chapter tests, study resources, and direct downloads.
                    </p>

                    <div className="mt-6 space-y-3.5">
                      <div className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-700">Complete curriculum coverage</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-700">Downloadable PDF practice sheets</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-700">Interactive chapter quizzes</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowPackagePicker(true); }}
                      className="w-full py-4 bg-brand-gradient text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:opacity-95 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" /> Buy this Course
                    </button>
                    <p className="text-center text-[10px] text-muted font-bold uppercase tracking-wider mt-3">
                      Secure payments via Razorpay
                    </p>
                  </div>
                </div>
              )
            }
          })()}
        </section>
      </main>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedPackage(null)
        }} 
        course={selectedPackage ? undefined : course} 
        item={selectedPackage}
        isPackage={!!selectedPackage}
        customAmount={selectedPackage ? (selectedPackage.priceINR || selectedPackage.inr) : undefined}
        selectedCourseIds={selectedPackage ? [course._id] : undefined}
        onSuccess={() => router.push('/dashboard')} 
      />

      <PackagePickerModal
        isOpen={showPackagePicker}
        onClose={() => setShowPackagePicker(false)}
        courseId={course._id}
        onSelectPackage={(selectedPkg) => {
          setSelectedPackage(selectedPkg)
          setShowPackagePicker(false)
          if (!user) {
            localStorage.setItem('pendingPackagePurchase', JSON.stringify({
              packageId: selectedPkg._id || selectedPkg.id,
              selectedCourseIds: [course._id]
            }))
            router.push(`/auth/login?redirect=${encodeURIComponent(`/courses/${course._id}`)}`)
          } else {
            setShowPaymentModal(true)
          }
        }}
      />

      {previewDoc && (
        <PdfPreviewModal 
          doc={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
          user={user}
          isPurchased={user && user.purchasedCourses && user.purchasedCourses.includes(course._id)}
          onRequireLogin={() => {
            setPreviewDoc(null);
            showError("Please login or register to download materials.");
            router.push(`/auth/login?redirect=${encodeURIComponent('/courses/' + params.id)}`);
          }}
          onRequirePurchase={() => {
            setPreviewDoc(null);
            setShowPaymentModal(true);
          }}
        />
      )}
    </div>
  )
}

function SelectList({ title, items, selected, onToggle, idKey, titleKey }) {
  return (
    <div>
      <p className="mb-4 font-black text-navy">{title}</p>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-academic p-5 text-sm text-muted">Nothing available for this step yet.</p>
      ) : (
        <div className="max-h-[380px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <label key={item[idKey]} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selected[item[idKey]] ? 'border-primary bg-primary/5' : 'border-primary/10 bg-academic hover:border-primary/30'}`}>
              <input type="checkbox" checked={!!selected[item[idKey]]} onChange={() => onToggle(item[idKey])} className="mt-1 accent-primary" />
              <span>
                <span className="block font-bold text-ink">{item[titleKey]}</span>
                {item.helper && <span className="mt-1 block text-xs text-muted">{item.helper}</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-4 text-center shadow-sm">
      <p className="text-3xl font-black text-primary">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  )
}

export default function CourseDetails() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-academic flex items-center justify-center"><div className="h-14 w-14 animate-spin rounded-full border-b-2 border-t-2 border-primary" /></div>}>
      <CourseDetailsContent />
    </Suspense>
  )
}

