'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import BannerImage from '@/components/BannerImage'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronDown, Star, Zap, Shield, Trophy } from 'lucide-react'
import Link from 'next/link'
import { cachedGet } from '@/utils/api'
import { packages as staticPackages, faqs } from '@/data/marketingContent'

export default function PackagesPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [packages, setPackages] = useState(staticPackages)

  useEffect(() => {
    cachedGet('/packages', 60000)
      .then((res) => { if (res.data?.packages?.length) setPackages(res.data.packages) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />
      <BannerImage />

      {/* Hero */}
    

      {/* Package Cards */}
      <section className="py-16 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-6">
            {packages.slice(0, 3).map((pkg, i) => (
              <PackageCard key={pkg.id || i} pkg={pkg} index={i} />
            ))}
          </div>

          {/* Row 2: 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">
            {packages.slice(3).map((pkg, i) => (
              <PackageCard key={pkg.id || i} pkg={pkg} index={i + 3} />
            ))}
          </div>

          {/* Trust row */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-muted">
            {[
              { icon: Shield, text: 'Secure Payments' },
              { icon: CheckCircle, text: 'All Boards Supported' },
              { icon: Star, text: '4.9 Parent Rating' },
              { icon: Trophy, text: 'Trusted by Teachers' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-secondary" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
     

      <MarketingShell />
    </div>
  )
}

function PackageCard({ pkg, index }) {
  const isPopular = pkg.popular

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`relative rounded-3xl overflow-hidden flex flex-col border ${
        isPopular
          ? 'border-[#c9a84c] ring-2 ring-[#c9a84c]/50'
          : 'border-[#c9a84c]/25'
      }`}
      style={{ background: 'linear-gradient(160deg, #0b1d40 0%, #0e2d52 60%, #0b1d40 100%)' }}
    >
      {/* Most Popular ribbon */}
      {isPopular && (
        <div className="bg-gradient-to-r from-[#c9a84c] to-[#f0c060] py-1.5 text-center">
          <span className="text-navy text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Star className="h-3 w-3 fill-navy" /> Most Popular
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5 text-center border-b border-white/10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
          <Star className="h-6 w-6 fill-[#c9a84c] text-[#c9a84c]" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-wide leading-tight">
          {pkg.name}
        </h3>
        {pkg.nameExtra && (
          <p className="text-[#a0c4ff] text-xs font-semibold mt-0.5">{pkg.nameExtra}</p>
        )}
        <div className="mt-2 px-4 py-1 rounded-full inline-block bg-[#1a5c2e]">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest">PACKAGE</span>
        </div>
        {pkg.tagline && (
          <p className="mt-2.5 text-[#a0c4ff] text-xs leading-relaxed">
            <span className="text-[#c9a84c]">★</span> {pkg.tagline} <span className="text-[#c9a84c]">★</span>
          </p>
        )}
      </div>

      {/* ── Price ── */}
      <div className="mx-5 mt-5 rounded-2xl border border-[#c9a84c]/35 bg-[#07122a] p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Star className="h-3 w-3 fill-[#c9a84c] text-[#c9a84c]" />
          <span className="text-[#c9a84c] text-[11px] font-black uppercase tracking-widest">Special Price</span>
          <Star className="h-3 w-3 fill-[#c9a84c] text-[#c9a84c]" />
        </div>
        <p className="text-3xl font-black leading-none">
          <span className="text-[#c9a84c]">₹{pkg.inr?.toLocaleString('en-IN')}</span>
          <span className="text-white/30 mx-2 text-2xl">/</span>
          <span className="text-white">${pkg.usd}</span>
        </p>
        <p className="text-white/35 text-xs mt-1.5">Valid for {pkg.validity}</p>
      </div>

      {/* ── Features ── */}
      <div className="mx-5 mt-4 bg-[#0d2044]/40 rounded-2xl p-4 flex-1">
        <ul className="space-y-3">
          {(pkg.features || []).map((f, fi) => {
            const label = typeof f === 'object' ? f.label : f
            const detail = typeof f === 'object' ? f.detail : null
            return (
              <li key={fi} className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white text-sm font-semibold leading-snug block">{label}</span>
                  {detail && (
                    <span className="text-white/45 text-xs leading-snug block mt-0.5">{detail}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── CTA ── */}
      <div className="px-5 py-5 mt-auto">
        <Link
          href="/auth/register"
          className={`block text-center py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all ${
            isPopular
              ? 'bg-gradient-to-r from-[#c9a84c] to-[#f0c060] text-navy hover:opacity-90'
              : 'bg-white text-navy hover:bg-[#c9a84c] hover:text-white'
          }`}
        >
          BUY NOW
        </Link>
      </div>
    </motion.div>
  )
}
