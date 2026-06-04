'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MarketingShell from '@/components/marketing/MarketingShell'
import LiveStatsBar from '@/components/marketing/LiveStatsBar'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      <LiveStatsBar />

      {/* Top Banner */}
      <div className="w-full flex justify-center items-center py-3 bg-white border-b border-primary/10">
        <Image
          src="/class_images/banner.jpeg"
          alt="Beyond Classroom"
          width={320}
          height={100}
          className="h-auto object-contain"
          priority
        />
      </div>
      <Hero />

      <MarketingShell />
    </div>
  )
}
