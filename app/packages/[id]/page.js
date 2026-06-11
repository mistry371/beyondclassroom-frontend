'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowRight, CheckCircle, ChevronLeft, Lock, Star, ShieldCheck, PlayCircle, Clock, BookOpen, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import PaymentModal from '@/components/PaymentModal'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'
import Link from 'next/link'

export default function PackageDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)
  const [pkg, setPkg] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchPackageData()
  }, [params.id])

  const fetchPackageData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/packages/${params.id}`)
      setPkg(res.data.package)
      
      const coursesRes = await api.get('/courses')
      const allCourses = coursesRes.data.courses || []
      
      const pkgCourseIds = new Set(res.data.package.courseIds || [])
      let matchedCourses = allCourses.filter(c => pkgCourseIds.has(c._id))
      
      // Fetch modules, lessons, and subtopics for each matched course
      matchedCourses = await Promise.all(matchedCourses.map(async (course) => {
        try {
          const moduleRes = await api.get(`/modules/course/${course._id}`)
          const moduleList = moduleRes.data.modules || []
          const populatedModules = await Promise.all(moduleList.map(async (moduleItem) => {
            const lessonRes = await api.get(`/lessons/module/${moduleItem._id}`).catch(() => ({ data: { lessons: [] } }))
            const lessonList = lessonRes.data.lessons || []
            const lessons = await Promise.all(lessonList.map(async (lesson) => {
              const subtopicRes = await api.get(`/subtopics/lesson/${lesson._id}`).catch(() => ({ data: { subtopics: [] } }))
              return { ...lesson, subtopics: subtopicRes.data.subtopics || [] }
            }))
            return { ...moduleItem, lessons }
          }))
          return { ...course, modules: populatedModules }
        } catch (err) {
          return { ...course, modules: [] }
        }
      }))
      
      setCourses(matchedCourses)
    } catch (error) {
      console.error('Failed to fetch package:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic pb-20 md:pb-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="grid lg:grid-cols-[1fr_420px] gap-10">
            <div>
              <div className="h-10 bg-primary/10 rounded-lg w-1/2 mb-4"></div>
              <div className="h-24 bg-primary/5 rounded-lg w-full mb-8"></div>
              <div className="h-64 bg-primary/5 rounded-xl w-full"></div>
            </div>
            <div>
              <div className="h-96 bg-primary/5 rounded-2xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-academic pb-20 md:pb-0">
        <Navbar />
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <p className="text-xl font-bold text-navy mb-4">Package not found</p>
          <Link href="/packages" className="text-primary hover:underline font-semibold flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Packages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 flex flex-wrap gap-3">
              <Link href="/packages" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-bold text-muted border border-primary/10 hover:border-primary/30 transition">
                <ChevronLeft className="h-4 w-4" /> All Packages
              </Link>
              <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary uppercase tracking-wider">PACKAGE</span>
              {pkg.popular && (
                <span className="rounded-full bg-accent/10 px-4 py-2 text-sm font-bold text-accent flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent" /> Most Popular
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-black leading-tight text-navy sm:text-6xl uppercase">{pkg.name}</h1>
            <p className="mt-3 text-xl font-semibold text-secondary">{pkg.description}</p>
            
            {/* Features List */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {(pkg.features || []).map((f, i) => {
                const label = typeof f === 'object' ? f.label : f
                const detail = typeof f === 'object' ? f.detail : null
                return (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
                    <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-ink leading-snug">{label}</p>
                      {detail && <p className="text-sm text-muted mt-1 leading-snug">{detail}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Pricing Aside */}
          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-3xl border border-primary/20 bg-white p-7 shadow-premium self-start">
            <div className="mb-6 flex aspect-video items-center justify-center rounded-2xl bg-gray-50 border border-primary/10 text-primary overflow-hidden relative">
              {pkg.image ? (
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
              ) : (
                <Award className="h-16 w-16 text-[#c9a84c]" />
              )}
            </div>
            
            <div className="rounded-2xl border border-primary/10 bg-gray-50 p-5 text-center">
              <p className="text-primary text-xs font-black uppercase tracking-widest mb-2">Package Price</p>
              <p className="text-4xl font-black leading-none text-ink">
                <span className="text-ink">₹{pkg.priceINR?.toLocaleString('en-IN') || 0}</span>
                <span className="text-muted mx-2 text-2xl">/</span>
                <span className="text-ink">${pkg.priceUSD || 0}</span>
              </p>
              <p className="text-muted text-xs mt-2 font-medium">Valid for {pkg.validity}</p>
            </div>
            
            <div className="mt-6 space-y-3">
              <button onClick={() => {
                if (!user) router.push(`/auth/login?redirect=${encodeURIComponent(`/packages/${pkg._id}`)}`)
                else setShowPaymentModal(true)
              }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-4 font-black text-white uppercase tracking-wide hover:opacity-90 transition shadow-md">
                {user ? 'Buy Package Now' : <><Lock className="h-5 w-5" /> Login to Purchase</>}
              </button>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Courses within this package */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-black text-navy">Courses Included in this Package</p>
              <p className="text-sm text-muted">You can customize or preview the courses below.</p>
            </div>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl border border-primary/10 bg-white py-20 text-center shadow-premium">
            <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-primary/50" />
            <p className="text-xl font-bold text-ink">No courses assigned yet</p>
            <p className="mt-2 text-muted">Check back later or contact support.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {courses.map((course, index) => (
              <motion.article
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-premium"
              >
                <div className="h-2 bg-brand-gradient" />
                <div className="p-6 sm:p-8">
                  <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{course.category || 'Mathematics'}</span>
                      {course.grade && (
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{course.grade}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-muted">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration || 'Self-paced'}</span>
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 text-accent fill-accent" /> {course.rating || 4.8}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-navy">{course.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{course.description}</p>

                  <div className="mt-6 border-t border-primary/10 pt-6">
                    <h4 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" /> Course Content Structure
                    </h4>
                    
                    {!course.modules || course.modules.length === 0 ? (
                      <p className="rounded-2xl bg-academic p-5 text-muted text-sm">No modules published for this course yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {course.modules.map((moduleItem) => (
                          <div key={moduleItem._id} className="rounded-2xl border border-primary/10 bg-academic p-4">
                            <p className="font-black text-navy">{moduleItem.title}</p>
                            <p className="mt-1 text-sm text-muted">{moduleItem.description}</p>
                            {(moduleItem.lessons || []).map((lesson) => (
                              <div key={lesson._id} className="mt-3 rounded-xl bg-white p-3 shadow-sm border border-black/5">
                                <p className="font-bold text-ink">{lesson.title}</p>
                                {(lesson.subtopics || []).map((subtopic) => (
                                  <div key={subtopic._id} className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-primary/10 bg-gray-50/50 p-3 text-sm">
                                    <p className="font-semibold text-muted">{subtopic.title}</p>
                                    <span className="text-xs bg-white border rounded-full px-2 py-1 text-muted font-medium">
                                      {subtopic.documents?.length || (subtopic.document ? 1 : 0)} PDFs available
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-end border-t border-primary/10 pt-6">
                    <Link href={`/courses/${course._id}?packageId=${pkg._id}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95">
                      Open Course & Customization <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        item={pkg} 
        isPackage={true}
        onSuccess={() => router.push('/dashboard')} 
      />

      <MarketingShell />
    </div>
  )
}
