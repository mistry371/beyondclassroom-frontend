'use client'

import Navbar from '@/components/Navbar'
import BannerImage from '@/components/BannerImage'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Layers, Lightbulb, Target, Users, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const whatWeDo = [
  {
    title: 'Curated Practice Paper Library',
    desc: 'A comprehensive collection of ready-to-use practice papers covering key topics across Class 1–8, aligned with school curricula.',
  },
  {
    title: 'Customizable Practice Resources',
    desc: 'Create tailored practice papers by selecting topics, formats, and difficulty levels to match specific learning goals.',
  },
  {
    title: 'Structured Progression',
    desc: 'Content organized by class and concept to ensure a smooth and logical learning journey.',
  },
  {
    title: 'Assessment-Ready Materials',
    desc: 'Suitable for classwork, homework, revision, and testing purposes.',
  },
]

const ourApproach = [
  'Concept clarity and step-by-step learning',
  'Balanced difficulty levels',
  'Consistent practice for mastery',
  'Alignment with classroom expectations',
  'Human-crafted content for a thoughtful, personalized touch',
]

const whyChoose = [
  'Professionally designed and curriculum-aligned content',
  'Practice papers created with human insight and educational expertise',
  'Flexible practice paper creation tailored to individual needs',
  'Saves valuable time for educators and parents',
  'Encourages independent and confident learning',
  'Suitable for a wide range of learning environments',
]

const approachIcons = [Lightbulb, BookOpen, Zap, Target, Users]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pb-20 md:pb-0 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <Navbar />
      <BannerImage />
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/60 backdrop-blur-3xl border border-white p-10 md:p-16 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Image src="/full-logo.png" alt="Beyond Classroom" width={240} height={60} className="mx-auto mb-8 drop-shadow-xl hover:scale-105 transition-transform duration-300 object-contain" />
            <p className="text-primary font-black uppercase tracking-[0.2em] text-sm mb-4">The Platform</p>
            <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary mb-8 leading-tight">About Beyond Classroom</h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Beyond Classroom is a dedicated platform for high-quality mathematics practice, created to support students from Class 1 to Class 8. Our focus is simple: provide structured, reliable, and flexible practice resources that make learning mathematics more effective and consistent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card premium-card p-10 text-center"
          >
            <p className="text-xl text-muted leading-relaxed">
              We recognize that strong mathematical skills are built through regular practice and clear understanding. At Beyond Classroom, every practice paper is thoughtfully designed by experienced educators to ensure a meaningful and effective learning experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800">What We Do</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {whatWeDo.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-primary/5 p-8 rounded-[2rem] flex gap-6 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white/40 backdrop-blur-2xl border-y border-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-black uppercase tracking-widest text-sm mb-3 block">Our Approach</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 max-w-3xl mx-auto">Our materials are developed with a focus on:</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {ourApproach.map((item, i) => {
              const Icon = approachIcons[i % approachIcons.length]
              return (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2rem] p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{item}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Beyond Classroom */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800">Why Choose Us</h2>
            <p className="text-lg text-slate-500 font-medium mt-4">Trusted by students, educators, and parents across the Globe.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="bg-emerald-100/50 p-2 rounded-full shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-slate-700 font-bold leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Meaningful Learning <br/> Through Human Understanding</h2>
          <p className="text-white/90 mb-10 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Our practice papers are crafted with care — bringing a personal, thoughtful approach to mathematics practice for every Class 1–8 student.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/packages" className="px-10 py-5 rounded-2xl bg-white text-primary font-black uppercase tracking-wider hover:scale-105 transition-all shadow-xl shadow-black/10">
              View Our Packages
            </Link>
            <Link href="/courses" className="px-10 py-5 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white font-black uppercase tracking-wider hover:bg-white/20 transition-all">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
