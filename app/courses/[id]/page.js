'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowRight, Award, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, Lock, PlayCircle, ShieldCheck, ShoppingCart, Sparkles, Star, Target, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PaymentModal from '@/components/PaymentModal'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'
import dynamic from 'next/dynamic'

const PdfPreviewModal = dynamic(() => import('@/components/PdfPreviewModal'), { ssr: false })

const steps = ['Modules', 'Lessons', 'Topics', 'PDFs', 'Preferences', 'Summary']

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

  useEffect(() => {
    fetchCourse()
  }, [params.id, user?._id])

  useEffect(() => {
    const block = (e) => {
      if (e.type === 'contextmenu') e.preventDefault()
      const key = e.key?.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && ['s', 'p', 'u', 'c', 'v', 'a', 'x'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('contextmenu', block, true)
    document.addEventListener('keydown', block, true)
    return () => {
      document.removeEventListener('contextmenu', block, true)
      document.removeEventListener('keydown', block, true)
    }
  }, [])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/courses/${params.id}`)
      const loadedCourse = response.data.course
      setCourse(loadedCourse)

      try {
        let courseIdsToFetch = [params.id]
        if (user && user.purchasedCourses && user.purchasedCourses.length > 0) {
          courseIdsToFetch = user.purchasedCourses
        }
        
        let allModules = []
        for (const cid of courseIdsToFetch) {
          try {
            const cRes = await api.get(`/courses/${cid}`)
            const cTitle = cRes.data.course.title
            const moduleRes = await api.get(`/modules/course/${cid}`).catch(() => ({ data: { modules: [] } }))
            const moduleList = moduleRes.data.modules || []
            const populated = await Promise.all(moduleList.map(async (moduleItem) => {
              const lessonRes = await api.get(`/lessons/module/${moduleItem._id}`).catch(() => ({ data: { lessons: [] } }))
              const lessonList = lessonRes.data.lessons || []
              const lessons = await Promise.all(lessonList.map(async (lesson) => {
                const subtopicRes = await api.get(`/subtopics/lesson/${lesson._id}`).catch(() => ({ data: { subtopics: [] } }))
                return { ...lesson, subtopics: subtopicRes.data.subtopics || [] }
              }))
              return { ...moduleItem, title: `[${cTitle}] ${moduleItem.title}`, lessons }
            }))
            allModules = [...allModules, ...populated]
          } catch (e) {}
        }
        setModules(allModules)
      } catch (err) {
        setModules([])
      }
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
        `Customized content in ${preferences.languagePreference}`,
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

      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">{course.category}</span>
              <span className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary">{course.difficulty}</span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-navy sm:text-6xl">{course.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{course.description}</p>

          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-3xl border border-primary/10 bg-white p-6 shadow-premium">
            <div className="mb-6 flex aspect-video items-center justify-center rounded-2xl bg-brand-gradient text-white">
              <PlayCircle className="h-16 w-16" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-muted">Course package</p>
            <div className="mt-2 text-4xl font-black text-primary">{course.isFree || course.isDemo ? 'FREE' : `Rs.${course.price}`}</div>
            <div className="mt-5 space-y-3 text-sm font-semibold text-ink">
              {['Lifetime access', 'Protected PDF previews', 'Custom course request option', 'Progress-ready structure'].map((item) => (
                <p key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" />{item}</p>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={() => router.push('/packages')} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-4 font-bold text-white">
                View Packages
              </button>
            </div>
          </motion.aside>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className={`grid gap-8 ${user ? 'lg:grid-cols-[0.9fr_1.1fr]' : 'max-w-4xl mx-auto'}`}>
          <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-black text-navy">Protected Course Preview</h2>
                <p className="text-sm text-muted">Everyone can view the course structure. Documents are strictly preview-only.</p>
              </div>
            </div>
            {modules.length === 0 ? (
              <p className="rounded-2xl bg-academic p-5 text-muted">No modules are published for this course yet.</p>
            ) : (
              <div className="max-h-[640px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {modules.map((moduleItem) => (
                  <div key={moduleItem._id} className="rounded-2xl border border-primary/10 bg-academic p-4">
                    <p className="font-black text-navy">{moduleItem.title}</p>
                    <p className="mt-1 text-sm text-muted">{moduleItem.description}</p>
                    {(moduleItem.lessons || []).map((lesson) => (
                      <div key={lesson._id} className="mt-3 rounded-xl bg-white p-3">
                        <p className="font-bold text-ink">{lesson.title}</p>
                        {(lesson.subtopics || []).map((subtopic) => (
                          <div key={subtopic._id} className="mt-2 rounded-lg border border-primary/10 p-3 text-sm text-muted">
                            <p className="font-semibold text-ink">{subtopic.title}</p>
                            {getDocs(subtopic).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {getDocs(subtopic).map((doc, index) => (
                                  <button key={`${subtopic._id}-${index}`} onClick={() => setPreviewDoc(doc)} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                    <FileText className="h-3.5 w-3.5" /> Secure View
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && (
            <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium relative overflow-hidden">
              <div>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-navy">Customize My Course</h2>
                  <p className="text-sm text-muted">Select only what you want. Admin will review, finalize, and assign your package.</p>
                </div>
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{steps[step]}</span>
              </div>

            <div className="mb-6 grid grid-cols-6 gap-2">
              {steps.map((label, index) => (
                <button key={label} onClick={() => setStep(index)} className={`h-2 rounded-full transition ${index <= step ? 'bg-brand-gradient' : 'bg-slate-200'}`} aria-label={label} />
              ))}
            </div>

            {step === 0 && <SelectList title="Select modules" items={modules} selected={selected} onToggle={toggle} idKey="_id" titleKey="title" />}
            {step === 1 && <SelectList title="Select lessons" items={modules.flatMap((m) => (m.lessons || []).map((l) => ({ ...l, helper: m.title })))} selected={selected} onToggle={toggle} idKey="_id" titleKey="title" />}
            {step === 2 && <SelectList title="Select topics and subtopics" items={modules.flatMap((m) => (m.lessons || []).flatMap((l) => (l.subtopics || []).map((s) => ({ ...s, helper: `${m.title} / ${l.title}` }))))} selected={selected} onToggle={toggle} idKey="_id" titleKey="title" />}
            {step === 3 && (
              <SelectList
                title="Select PDFs"
                items={modules.flatMap((m) => (m.lessons || []).flatMap((l) => (l.subtopics || []).flatMap((s) => getDocs(s).map((doc, index) => ({ _id: `${s._id}:pdf:${index}`, title: doc?.name || `PDF ${index + 1}`, helper: s.title })))))}
                selected={selected}
                onToggle={toggle}
                idKey="_id"
                titleKey="title"
              />
            )}
            {step === 4 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-ink">Selected Course</span>
                  <input type="text" value={course?.title || ''} readOnly className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none opacity-70 cursor-not-allowed" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-ink">Language Preference</span>
                  <select value={preferences.languagePreference} onChange={(e) => setPreferences((prev) => ({ ...prev, languagePreference: e.target.value }))} className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none">
                    {['English', 'Hindi', 'English + Hindi'].map((option) => <option key={option}>{option}</option>)}
                  </select>
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
            {step === 5 && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <SummaryCard label="Modules" value={selection.selectedModules.length} />
                  <SummaryCard label="Lessons" value={selection.selectedLessons.length} />
                  <SummaryCard label="Subtopics" value={selection.selectedSubtopics.length} />
                  <SummaryCard label="PDFs" value={selection.selectedPdfs.length} />
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
      )}
        </section>
      </main>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} course={course} onSuccess={() => router.push('/dashboard')} />

      {previewDoc && (
        <PdfPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
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

