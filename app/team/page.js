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
    // Each card is 288px wide + 32px gap = 320px
    const cardWidth = 320
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
                className="flex-shrink-0 w-72 glass-card premium-card overflow-hidden group cursor-default"
              >
                {/* Top gradient band + avatar */}
                <div className="h-44 bg-brand-gradient relative flex items-center justify-center">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-premium border-4 border-white">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center text-3xl font-black text-primary">
                        {member.initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="pt-4 pb-7 px-6 text-center">
                  <h3 className="text-lg font-bold text-ink">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mt-1">{member.role}</p>
                  <p className="text-muted text-xs mt-2 flex items-center justify-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                    {member.degree}
                  </p>
                  <p className="text-muted text-xs mt-1">{member.experience} experience</p>

                  {/* Expertise tags */}
                  {member.expertise?.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {member.expertise.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-semibold border border-primary/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
