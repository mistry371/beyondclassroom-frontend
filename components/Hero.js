'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, GraduationCap, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import api from '@/utils/api'
import PremiumButton from '@/components/marketing/PremiumButton'
import { brand, trustBadges } from '@/data/marketingContent'
import Link from 'next/link'

const classGrades = [
  { label: 'Class 1', href: '/courses?grade=1' },
  { label: 'Class 2', href: '/courses?grade=2' },
  { label: 'Class 3', href: '/courses?grade=3' },
  { label: 'Class 4', href: '/courses?grade=4' },
  { label: 'Class 5', href: '/courses?grade=5' },
  { label: 'Class 6', href: '/courses?grade=6' },
  { label: 'Class 7', href: '/courses?grade=7' },
  { label: 'Class 8', href: '/courses?grade=8' },
]

export default function Hero() {
  const ref = useRef(null)
  const [content, setContent] = useState({
    heroTitle: 'Beyond Classroom',
    heroSubtitle: 'Premium Mathematics practice for Class 1–8 with structured content, expert educators, and personalized learning paths.',
  })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  useEffect(() => {
    api.get('/admin/content')
      .then((res) => {
        const c = res.data.content
        if (c?.heroTitle) setContent((prev) => ({ ...prev, heroTitle: c.heroTitle }))
        if (c?.heroSubtitle) setContent((prev) => ({ ...prev, heroSubtitle: c.heroSubtitle }))
      })
      .catch(() => { })
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden bg-academic">
      {/* Background blobs */}
      <div className="absolute inset-0 hero-grid opacity-70" />
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[8%] top-24 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute right-[9%] top-16 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brandPink/10 blur-3xl" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24 space-y-10">

        {/* ── Row 1: Headline + subtitle + CTAs + trust badges ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >









        </motion.div>

        {/* ── Row 2: Beyond Classroom — horizontal left/right ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="rounded-2xl border border-primary/10 bg-white shadow-premium overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: label + icon + heading */}
            <div className="flex items-center gap-5 px-8 py-8 border-b lg:border-b-0 lg:border-r border-primary/10">
              <div className="rounded-2xl bg-brand-gradient p-4 text-white shadow-glow flex-shrink-0">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">
                  Who We Are
                </p>
                <h2 className="text-3xl font-black text-navy leading-tight">
                  Beyond Classroom
                </h2>
              </div>
            </div>

            {/* Right: description paragraphs */}
            <div className="px-8 py-8 bg-gradient-to-br from-[#F8FAFC] via-white to-[#EFFFF6]">
              <p className="text-base leading-7 text-muted">
                Beyond Classroom is a dedicated platform for high-quality mathematics practice, created to
                support students from{' '}
                <span className="font-semibold text-ink">Grade 1 to Grade 8</span>. Our focus is simple:
                provide structured, reliable, and flexible practice resources that make learning mathematics
                more effective and consistent.
              </p>
              <p className="mt-4 text-base leading-7 text-muted">
                We recognize that strong mathematical skills are built through regular practice and clear
                understanding. At Beyond Classroom, every practice paper is{' '}
                <span className="font-semibold text-ink">
                  thoughtfully designed by experienced educators
                </span>{' '}
                to ensure a meaningful and effective learning experience.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Row 3: Select Your Class ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="rounded-2xl border border-primary/10 bg-white shadow-premium overflow-hidden"
        >
          <div className="px-6 pt-6 pb-2 text-center">
            
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-3">
              {classGrades.map((grade) => (
                <Link
                  key={grade.label}
                  href={grade.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-primary/10 bg-academic hover:bg-brand-gradient hover:border-transparent p-3 transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img
                      src={`/class_images/${grade.label}.png`}
                      alt={grade.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-primary group-hover:text-white transition-colors">
                    {grade.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
