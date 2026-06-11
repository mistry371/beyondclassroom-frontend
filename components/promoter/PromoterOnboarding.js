'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Share2, Wallet, Trophy } from 'lucide-react'

const STEPS = [
  { icon: Link2, title: 'Copy your link', desc: 'Share your unique referral URL with students and parents.' },
  { icon: Share2, title: 'Share everywhere', desc: 'WhatsApp, Instagram, coaching groups — earn on every enrollment.' },
  { icon: Wallet, title: 'Track earnings', desc: 'Real-time dashboard shows referrals, commissions, and payouts.' },
  { icon: Trophy, title: 'Hit milestones', desc: 'Unlock ranks, streaks, and leaderboard rewards as you grow.' },
]

export default function PromoterOnboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(true)

  if (!open) return null

  const finish = () => {
    localStorage.setItem('promoterTourDone', '1')
    setOpen(false)
    onDone?.()
  }

  const Icon = STEPS[step].icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white border border-primary/10 rounded-2xl max-w-md w-full p-8 relative shadow-premium"
        >
          <button onClick={finish} className="absolute top-4 right-4 text-muted hover:text-ink transition-colors" aria-label="Close tour">
            <X className="h-5 w-5" />
          </button>
          <p className="text-primary text-sm font-semibold mb-2">Promoter onboarding · {step + 1}/{STEPS.length}</p>
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 shadow-sm">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">{STEPS[step].title}</h3>
          <p className="text-muted text-sm mb-8">{STEPS[step].desc}</p>
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-xl border border-primary/20 text-ink font-semibold hover:bg-academic transition-colors">
                Back
              </button>
            )}
            <button
              onClick={() => (step < STEPS.length - 1 ? setStep((s) => s + 1) : finish())}
              className="flex-1 py-3 rounded-xl bg-brand-gradient text-white font-bold hover:opacity-90 transition-opacity"
            >
              {step < STEPS.length - 1 ? 'Next' : 'Start earning'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
