'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { cachedGet } from '@/utils/api'
import Link from 'next/link'
import { ArrowRight, BookOpen, Clock, Star, Package } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PackageDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [pkg, setPkg] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackageAndCourses()
  }, [params.id])

  const fetchPackageAndCourses = async () => {
    try {
      setLoading(true)
      const res = await cachedGet('/packages', 60000)
      const packages = res.data.packages || []
      const currentPkg = packages.find(p => p._id === params.id || p.id === params.id)
      
      if (currentPkg) {
        setPkg(currentPkg)
        if (currentPkg.courseIds && currentPkg.courseIds.length > 0) {
          const coursesRes = await cachedGet('/courses', 60000)
          const allCourses = coursesRes.data.courses || []
          setCourses(allCourses.filter(c => currentPkg.courseIds.includes(c._id)))
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh] text-xl font-bold text-navy">
          Package not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic pb-20">
      <Navbar />
      
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-primary/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
              <Package className="h-4 w-4" /> Package details
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-navy mb-4">{pkg.name}</h1>
            <p className="text-muted text-lg max-w-2xl">{pkg.description}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-navy">Select a Course</h2>
          <p className="text-muted">Choose a course from this package to view its modules and customize your package.</p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-primary/10 p-8 text-center shadow-sm">
            <BookOpen className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy mb-2">No Courses Available</h3>
            <p className="text-muted">This package does not have any courses assigned to it yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-primary/10 overflow-hidden shadow-premium hover:-translate-y-1 hover:shadow-glow transition-all"
              >
                <div className="h-40 bg-brand-gradient relative">
                  {course.image && (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-navy">
                    {course.difficulty}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">{course.category}</span>
                  <h3 className="text-xl font-black text-navy mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-muted text-sm mb-5 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-muted mb-6">
                    <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration || 'Self-paced'}</div>
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-secondary" /> {course.rating || 4.8}</div>
                  </div>

                  <Link href={`/courses/${course._id}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/10 text-primary py-3 font-bold hover:bg-primary hover:text-white transition-colors">
                    View & Customize <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
