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

      <div className="w-full relative z-10 block bg-white border-b border-primary/10">
        <img
          src="/main-header.png"
          alt="Beyond Classroom: Where Mathematics Meets Personalization"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24 space-y-10 z-10">

        {/* ── Row 1: Headline + subtitle + CTAs + trust badges ── */}
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="h-5 w-5 text-secondary animate-pulse relative z-10" />
              <span className="font-black text-sm md:text-base tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-navy via-primary to-secondary relative z-10">
                Mathematics Education
              </span>
            </motion.div>
            
            <div className="flex items-center justify-center pt-6 mt-8">
              <Link
                href="/courses"
                className="relative group inline-flex items-center justify-center gap-3 px-12 py-5 rounded-[2rem] overflow-hidden font-black text-lg md:text-xl text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_25px_50px_rgba(var(--primary-rgb),0.4)]"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-navy via-primary to-secondary bg-[length:200%_auto] animate-gradient" />
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 mix-blend-overlay" />
                
                <span className="relative z-10 tracking-wide">Explore Courses</span>
                <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

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
        <div className="text-center mt-20 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">Begin Your Journey</span>
            <h3 className="text-4xl md:text-5xl font-black text-navy mb-4">Select Your Class</h3>
            <p className="text-xl text-muted">Start your personalized mathematics learning experience.</p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
        >
          {classGrades.map((grade) => (
            <Link
              key={grade.label}
              href={grade.href}
              className="flex flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-primary/10 bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Subtle hover glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] border-4 border-slate-50 group-hover:border-white transition-all duration-300 relative z-10 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
                <img
                  src={`/class_images/${grade.label}.png`}
                  alt={grade.label}
                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
              <span className="text-xl md:text-2xl font-bold text-navy group-hover:text-primary transition-colors relative z-10">
                {grade.label}
              </span>
            </Link>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
