'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { ArrowRight, BookOpen, Clock, Filter, Search, SlidersHorizontal, Star, Users, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import { cachedGet } from '@/utils/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton'
import { CLASS_GRADES } from '@/lib/constants'
import { useSelector } from 'react-redux'

import { useSearchParams } from 'next/navigation'

function CoursesContent() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const initialGradeParam = searchParams.get('grade')
  const initialGrade = initialGradeParam ? `Class ${initialGradeParam}` : 'all'
  const [gradeFilter, setGradeFilter] = useState(initialGrade)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    cachedGet('/courses', 120000)
      .then((response) => setCourses(response.data.courses || []))
      .catch((error) => console.error('Fetch courses failed:', error))
      .finally(() => setLoading(false))
  }, [])

  const filteredCourses = useMemo(() => {
    const getGradeNumber = (course) => {
      const gradeMatch = (course.grade || '').match(/\d+/)
      if (gradeMatch) return parseInt(gradeMatch[0], 10)
      const titleMatch = (course.title || '').match(/\d+/)
      if (titleMatch) return parseInt(titleMatch[0], 10)
      return 9999
    }

    return courses.filter((course) => {
      const matchesGrade = gradeFilter === 'all' || (course.grade && course.grade === gradeFilter) || (course.title && course.title.toLowerCase().includes(gradeFilter.toLowerCase()))
      const title = course.title || ''
      const description = course.description || ''
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesGrade && matchesSearch
    }).sort((a, b) => getGradeNumber(a) - getGradeNumber(b) || (a.title || '').localeCompare(b.title || ''))
  }, [courses, gradeFilter, searchQuery])

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm">
              <BookOpen className="h-4 w-4" /> Course & Content
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-navy sm:text-6xl">
              Structured Mathematics content for Class 1 to Class 8.
            </h1>

          </motion.div>

          {/* Class Grade Filter Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">

            {CLASS_GRADES.map((grade) => (
              <button
                key={grade}
                onClick={() => setGradeFilter(grade)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border ${gradeFilter === grade ? 'bg-brand-gradient text-white border-transparent shadow-sm' : 'bg-white text-ink border-primary/10 hover:border-primary/30'}`}
              >
                {grade}
              </button>
            ))}
          </div>


        </div>
      </section>


      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">


        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-primary/10 bg-white py-20 text-center shadow-premium">
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-primary/50" />
            <p className="text-xl font-bold text-ink">No courses found</p>
            <p className="mt-2 text-muted">Try a different class or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <motion.article
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-premium transition hover:-translate-y-1"
              >
                <div className="h-2 bg-brand-gradient" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{course.category || 'Mathematics'}</span>
                    {course.grade && (
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{course.grade}</span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-xl font-black text-navy transition group-hover:text-primary">{course.title}</h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted">{course.description}</p>

                  <div className="mt-5 flex items-center justify-between border-t border-primary/10 pt-5 gap-2">
                    <Link href={`/courses/${course._id}`} className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-4 py-2.5 text-xs font-bold text-primary shadow-sm hover:bg-primary/5 transition-all">
                      Preview
                    </Link>
                    {course.isFree || course.isDemo ? (
                      <Link href={`/courses/${course._id}`} className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95">
                        Free Access <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <Link href={`/courses/${course._id}?buy=true`} className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95">
                        Buy Now <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <MarketingShell />
    </div>
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-academic flex items-center justify-center">Loading...</div>}>
      <CoursesContent />
    </Suspense>
  )
}
