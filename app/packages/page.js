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
      .then((res) => { 
        if (res.data?.packages?.length) {
          const mergedPackages = res.data.packages.map(backendPkg => {
            // Match by name or ID
            const staticPkg = staticPackages.find(sp => sp.name === backendPkg.name || sp.id === backendPkg.id || sp.id === backendPkg._id) || {}
            return {
              ...staticPkg,
              ...backendPkg,
              oldInr: backendPkg.oldInr || staticPkg.oldInr,
              oldUsd: backendPkg.oldUsd || staticPkg.oldUsd
            }
          })
          setPackages(mergedPackages)
        } 
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-cyan-50 pb-20 md:pb-0 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
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
      className={`relative rounded-[2rem] overflow-hidden flex flex-col bg-white/80 backdrop-blur-xl border ${
        isPopular
          ? 'border-primary shadow-[0_0_40px_-10px_rgba(8,31,140,0.3)] ring-4 ring-primary/10 scale-105 z-10'
          : 'border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-1 z-0'
      } transition-all duration-300`}
    >
      {/* Most Popular ribbon */}
      {isPopular && (
        <div className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient py-1.5 text-center">
          <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Star className="h-3 w-3 fill-white" /> Recommended Choice
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-6 pt-8 pb-6 text-center border-b border-gray-100 bg-white/50">
        <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary uppercase tracking-wider leading-tight">
          {pkg.name}
        </h3>
        {pkg.nameExtra && (
          <p className="mt-1 text-sm font-bold text-secondary">{pkg.nameExtra}</p>
        )}
        {pkg.description && (
          <p className="mt-3 text-slate-500 text-sm leading-relaxed max-w-[250px] mx-auto font-medium">
            {pkg.description}
          </p>
        )}
      </div>

      {/* ── Price ── */}
      <div className="mx-6 mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 p-5 text-center border border-indigo-100/50 shadow-inner flex flex-col items-center">
        {pkg.oldInr && (
          <p className="text-xl font-bold text-slate-400 line-through mb-1 flex items-center justify-center gap-2">
            ₹{pkg.oldInr?.toLocaleString('en-IN')} 
            <span className="text-slate-300">/</span> 
            ${pkg.oldUsd}
          </p>
        )}
        <p className="text-5xl font-black leading-none text-slate-800 tracking-tight flex items-baseline justify-center">
          ₹{pkg.priceINR?.toLocaleString('en-IN') || pkg.inr?.toLocaleString('en-IN')}
          <span className="text-slate-400 text-3xl font-black mx-2">/</span>
          <span className="text-4xl">${pkg.priceUSD || pkg.usd}</span>
          <span className="text-slate-400 text-lg font-bold ml-1">/yr</span>
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
            Valid for {pkg.validity}
          </span>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="px-6 mt-8 mb-8 flex-1">
        <ul className="space-y-4">
          {(pkg.features || []).map((f, fi) => {
            const label = typeof f === 'object' ? f.label : f
            const detail = typeof f === 'object' ? f.detail : null
            return (
              <li key={fi} className="flex items-start gap-3">
                <div className="mt-0.5 bg-emerald-100/50 rounded-full p-1 shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-slate-700 text-sm font-bold leading-snug block">{label}</span>
                  {detail && (
                    <span className="text-slate-500 text-xs leading-snug block mt-0.5 font-medium">{detail}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── CTA ── */}
      <div className="px-6 py-6 mt-auto bg-slate-50/50 border-t border-gray-100">
        <Link
          href={`/packages/${pkg._id || pkg.id}`}
          className={`block text-center py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${
            isPopular
              ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
              : 'bg-white text-primary border-2 border-primary/10 hover:border-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-md'
          }`}
        >
          Explore Package
        </Link>
      </div>
    </motion.div>
  )
}
