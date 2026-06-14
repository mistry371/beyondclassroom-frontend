'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MarketingShell from '@/components/marketing/MarketingShell'
import { motion } from 'framer-motion'
import LiveStatsBar from '@/components/marketing/LiveStatsBar'
import TestimonialSlider from '@/components/marketing/TestimonialSlider'
import RecentPurchasesPopup from '@/components/marketing/RecentPurchasesPopup'

export default function Home() {
  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />
      <LiveStatsBar />
      <Hero />
      <RecentPurchasesPopup />

      <TestimonialSlider />

      <MarketingShell />
    </div>
  )
}
