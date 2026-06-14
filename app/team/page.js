'use client'

import Navbar from '@/components/Navbar'
import BannerImage from '@/components/BannerImage'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import { motion } from 'framer-motion'
import { team } from '@/data/marketingContent'
import { GraduationCap } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function TeamPage() {
  const trackRef = useRef(null)
  // Duplicate cards for seamless infinite loop
  const items = [...team, ...team]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animFrame
    let pos = 0
    // Each card is w-80 (320px) + gap-8 (32px) = 352px
    const cardWidth = 352
    const halfWidth = team.length * cardWidth

    const step = () => {
      pos += 0.5 // px per frame — adjust for speed
      if (pos >= halfWidth) pos = 0
      track.style.transform = `translateX(-${pos}px)`
      animFrame = requestAnimationFrame(step)
    }

    animFrame = requestAnimationFrame(step)

    // Pause on hover
    const pause = () => cancelAnimationFrame(animFrame)
    const resume = () => { animFrame = requestAnimationFrame(step) }
    track.addEventListener('mouseenter', pause)
    track.addEventListener('mouseleave', resume)

    return () => {
      cancelAnimationFrame(animFrame)
      track.removeEventListener('mouseenter', pause)
      track.removeEventListener('mouseleave', resume)
    }
  }, [])

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />
      <BannerImage />

      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <SectionHeader
            badge="Faculty"
            title="Our Expert Team"
            subtitle="Verified educators with decades of combined experience."
          />
        </div>

        {/* Auto-scrolling carousel */}
        <div className="relative w-full overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#f8fafc] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#f8fafc] to-transparent" />

          <div
            ref={trackRef}
            className="flex gap-8 w-max py-4 px-4"
            style={{ willChange: 'transform' }}
          >
            {items.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className="flex-shrink-0 w-80 p-[2px] rounded-[2.5rem] bg-gradient-to-b from-slate-100 to-white hover:from-primary/30 hover:to-secondary/30 transition-all duration-700 group relative"
              >
                <div className="bg-white rounded-[2.4rem] p-8 h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center relative overflow-hidden">
                  
                  {/* Decorative glowing blobs */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gradient opacity-5 blur-[40px] rounded-full group-hover:opacity-20 group-hover:scale-150 transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 blur-[40px] rounded-full group-hover:opacity-30 group-hover:scale-150 transition-all duration-700" />
                  
                  {/* Avatar Container with Gradient Ring */}
                  <div className="w-32 h-32 rounded-full mb-8 relative z-10 p-1 bg-gradient-to-br from-slate-200 to-slate-100 group-hover:from-primary group-hover:to-secondary transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border-[3px] border-white relative">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-400 to-slate-300 group-hover:from-navy group-hover:to-primary transition-all duration-500">
                          {member.initials}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="relative z-10 w-full flex-grow flex flex-col">
                    <h3 className="text-2xl font-black text-navy mb-1 group-hover:text-primary transition-colors duration-300">{member.name}</h3>
                    <p className="text-secondary font-bold text-xs tracking-widest uppercase mb-6 opacity-80">{member.role}</p>
                    
                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6 group-hover:via-primary/30 transition-colors duration-500" />
                    
                    {/* Info Badges */}
                    <div className="space-y-3 w-full mt-auto">
                      <div className="flex items-center justify-center gap-2 text-slate-600 bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-2xl py-2.5 px-4 group-hover:bg-primary/5 group-hover:border-primary/10 group-hover:text-primary transition-all duration-300">
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-xs font-semibold leading-tight">{member.degree}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-slate-600 bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-2xl py-2.5 px-4 group-hover:bg-secondary/5 group-hover:border-secondary/10 group-hover:text-secondary transition-all duration-300">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold leading-tight">{member.experience} experience</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
