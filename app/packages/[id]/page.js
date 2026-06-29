'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowRight, CheckCircle, ChevronLeft, Lock, Star, ShieldCheck, PlayCircle, Clock, BookOpen, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import PaymentModal from '@/components/PaymentModal'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [selectedCourses, setSelectedCourses] = useState([])

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  useEffect(() => {
    fetchPackageData()
  }, [params.id])

  useEffect(() => {
    if (pkg && user) {
      const stored = localStorage.getItem('pendingPackagePurchase')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.packageId === pkg._id && Array.isArray(parsed.selectedCourseIds) && parsed.selectedCourseIds.length > 0) {
            setSelectedCourses(parsed.selectedCourseIds)
            setShowPaymentModal(true)
            localStorage.removeItem('pendingPackagePurchase')
          }
        } catch (e) {
          console.error('Failed to parse pendingPackagePurchase', e)
        }
      }
    }
  }, [pkg, user])

  const fetchPackageData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/packages/${params.id}`)
      setPkg(res.data.package)
      
      const pkgCourseIds = res.data.package.courseIds || []
      
      // Fetch modules, lessons, and subtopics for each matched course directly
      let matchedCourses = await Promise.all(pkgCourseIds.map(async (courseId) => {
        try {
          const courseRes = await api.get(`/courses/${courseId}?populate=true`)
          return courseRes.data.course
        } catch (err) {
          return null
        }
      }))
      
      setCourses(matchedCourses.filter(Boolean))
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
        <div className="relative mx-auto max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
            <div className="mb-6 flex flex-wrap justify-center gap-3">
              <Link href="/packages" className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-muted border border-primary/10 hover:border-primary/30 transition">
                <ChevronLeft className="h-4 w-4" /> All Packages
              </Link>
              <span className="rounded-full bg-primary/10 px-5 py-1.5 text-sm font-bold text-primary uppercase tracking-wider">PACKAGE</span>
              {pkg.popular && (
                <span className="rounded-full bg-accent/10 px-5 py-1.5 text-sm font-bold text-accent flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent" /> Most Popular
                </span>
              )}
            </div>
            
            <h1 className="text-5xl font-black leading-tight text-navy sm:text-7xl uppercase">{pkg.name}</h1>
            <p className="mt-4 text-2xl font-semibold text-secondary max-w-3xl">{pkg.description}</p>
            
            {/* Features List */}
            <div className="mt-12 grid w-full sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {(pkg.features || []).map((f, i) => {
                const label = typeof f === 'object' ? f.label : f
                const detail = typeof f === 'object' ? f.detail : null
                return (
                  <div key={i} className="flex items-start gap-4 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <CheckCircle className="h-6 w-6 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-lg font-bold text-ink leading-snug">{label}</p>
                      {detail && <p className="text-base text-muted mt-2 leading-snug">{detail}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
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
                className={`overflow-hidden rounded-3xl border ${selectedCourses.includes(course._id) ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-primary/10 bg-white'} shadow-premium cursor-pointer transition-all`}
                onClick={() => toggleCourseSelection(course._id)}
              >
                <div className="h-2 bg-brand-gradient" />
                <div className="p-6 sm:p-8">
                  <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex gap-3 items-center">
                      <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${selectedCourses.includes(course._id) ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`}>
                        {selectedCourses.includes(course._id) && <CheckCircle className="h-4 w-4 text-white" />}
                      </div>
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
                    <Link 
                      href={`/courses/${course._id}?packageId=${pkg._id}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-primary/20 px-6 py-3 text-sm font-bold text-primary shadow-sm transition hover:bg-primary/5"
                    >
                      Preview Class Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedCourses.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[72px] md:bottom-0 left-0 right-0 z-40 p-4 pointer-events-none"
          >
            <div className="mx-auto max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto border border-primary/10">
              <div className="flex flex-col">
                <p className="text-sm text-muted font-bold tracking-wide uppercase">{selectedCourses.length} Class{selectedCourses.length > 1 ? 'es' : ''} Selected</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-3xl sm:text-4xl font-black text-ink">₹{((pkg.priceINR || 0) * selectedCourses.length).toLocaleString('en-IN')}</p>
                  <p className="text-sm font-medium text-muted mb-1.5">Total Payable</p>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) {
                    localStorage.setItem('pendingPackagePurchase', JSON.stringify({
                      packageId: pkg._id,
                      selectedCourseIds: selectedCourses
                    }))
                    router.push(`/auth/login?redirect=${encodeURIComponent(`/packages/${pkg._id}`)}`)
                  } else {
                    setShowPaymentModal(true)
                  }
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              >
                Buy Selected Classes <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        item={pkg} 
        isPackage={true}
        customAmount={(pkg.priceINR || 0) * selectedCourses.length}
        selectedCourseIds={selectedCourses}
        onSuccess={() => router.push('/dashboard')} 
      />

      <MarketingShell />
    </div>
  )
}
