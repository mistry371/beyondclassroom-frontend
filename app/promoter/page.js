'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import promoterApi from '@/utils/promoterApi'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import PremiumButton from '@/components/marketing/PremiumButton'
import AnimatedCounter from '@/components/marketing/AnimatedCounter'
import { motion } from 'framer-motion'
import {
  promoterBenefits, promoterTestimonials, promoterLeaderboard,
} from '@/data/marketingContent'
import {
  TrendingUp, Link2, QrCode, Share2, Calculator, Trophy, Zap, Gift,
} from 'lucide-react'
import Link from 'next/link'

export default function PromoterLandingPage() {
  const [referrals, setReferrals] = useState(10)
  const [avgPackage, setAvgPackage] = useState(7999)
  const [leaderboard, setLeaderboard] = useState(promoterLeaderboard)
  const commission = 0.2
  const estimated = Math.round(referrals * avgPackage * commission)

  useEffect(() => {
    promoterApi.get('/promoters/leaderboard?limit=5')
      .then((res) => {
        if (res.data.success && res.data.leaderboard?.length) {
          setLeaderboard(res.data.leaderboard)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-cyan-50 pb-20 md:pb-0 relative overflow-clip">
      <Navbar />

      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <section className="relative py-24 overflow-hidden premium-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20 shadow-sm">
                Promoter Program
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-navy mb-6 leading-tight tracking-tight">
                Earn While You <span className="text-primary bg-clip-text">Empower</span> Learners
              </h1>
              <p className="text-muted text-xl mb-8 leading-relaxed max-w-lg">
                Join our promoter ecosystem. Share Beyond Classroom, refer students, and build a rewarding income stream.
              </p>
              <div className="flex flex-wrap gap-4">
                <PremiumButton href="/promoter/register" variant="primary">Become a Promoter</PremiumButton>
                <PremiumButton href="/promoter/login" variant="outline">Promoter Login</PremiumButton>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-primary/10 shadow-premium relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-primary/5 rounded-2xl p-6 text-center border border-primary/10">
                  <div className="text-4xl font-black text-primary mb-1"><AnimatedCounter value={25} suffix="%" /></div>
                  <p className="text-muted text-sm font-semibold">Max Commission</p>
                </div>
                <div className="bg-secondary/5 rounded-2xl p-6 text-center border border-secondary/10">
                  <div className="text-4xl font-black text-secondary mb-1">₹<AnimatedCounter value={62000} /></div>
                  <p className="text-muted text-sm font-semibold">Top Monthly Earn</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/20 relative z-10">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-primary/10">
                  <Trophy className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <p className="text-navy font-bold text-lg">Gamified Leaderboard</p>
                  <p className="text-muted text-sm">Badges, streaks & milestone bonuses</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Benefits" title="Why Promote Beyond Classroom?" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promoterBenefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-6 premium-card">
                <Gift className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold text-ink mb-2">{b.title}</h3>
                <p className="text-muted text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="How It Works" title="Your Journey to Success" center={true} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {[
              { icon: Link2, step: '1', title: 'Sign Up & Get Link', desc: 'Register as a promoter and receive your unique tracking link.' },
              { icon: Share2, step: '2', title: 'Share & Invite', desc: 'Share your link via WhatsApp, social media, or local groups.' },
              { icon: TrendingUp, step: '3', title: 'Track & Earn', desc: 'Monitor signups live in your dashboard and earn commissions.' },
              { icon: QrCode, step: '4', title: 'Withdraw Funds', desc: 'Request fast payouts directly to your bank account anytime.' },
            ].map((item, i) => (
              <motion.div 
                key={item.step} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }} 
                viewport={{ once: true }} 
                className="bg-white/80 backdrop-blur-xl p-8 pt-10 rounded-3xl border border-primary/10 shadow-premium relative group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30 transform group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div className="mt-2 mb-2">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-navy text-xl mb-3">{item.title}</h4>
                  <p className="text-muted leading-relaxed text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Stories" title="Promoter Success Stories" />
          <div className="grid md:grid-cols-3 gap-8">
            {promoterTestimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-8 premium-card">
                <p className="text-muted italic mb-6">&ldquo;{t.text}&rdquo;</p>
                <p className="font-bold text-ink">{t.name}</p>
                <p className="text-secondary font-semibold">{t.earnings}</p>
                <p className="text-sm text-muted mt-1">{t.referrals} referrals</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-[3rem] p-12 text-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            <Zap className="h-16 w-16 text-white/90 mx-auto mb-6 relative z-10" />
            <h2 className="text-4xl font-black text-white mb-6 relative z-10">Start Earning Today</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg relative z-10">Join hundreds of promoters who are already earning by empowering students with premium education.</p>
            <div className="relative z-10">
              <PremiumButton href="/promoter/register" variant="white">Join Promoter Program</PremiumButton>
            </div>
          </div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
