'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

// Dummy data to simulate recent purchases
const purchases = [
  { name: 'Aarav S.', location: 'Delhi', package: 'Class 6 Complete Mathematics', time: 'Just now' },
  { name: 'Priya M.', location: 'Mumbai', package: 'Class 4 Foundation Math', time: '2 minutes ago' },
  { name: 'Rahul V.', location: 'Bangalore', package: 'Class 8 Advanced Series', time: '5 minutes ago' },
  { name: 'Neha G.', location: 'Pune', package: 'Class 5 Mathematics Package', time: 'Just now' },
  { name: 'Rohan K.', location: 'Hyderabad', package: 'Class 7 Math Mastery', time: '3 minutes ago' },
]

export default function RecentPurchasesPopup() {
  const [currentPurchase, setCurrentPurchase] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Start showing popups after a short delay
    const initialDelay = setTimeout(() => {
      showNextPurchase()
    }, 5000)

    return () => clearTimeout(initialDelay)
  }, [])

  const showNextPurchase = () => {
    // Pick a random purchase
    const randomIndex = Math.floor(Math.random() * purchases.length)
    setCurrentPurchase(purchases[randomIndex])
    setIsVisible(true)

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false)
      
      // Wait for a random interval between 10 to 25 seconds before showing the next one
      const nextDelay = Math.floor(Math.random() * 15000) + 10000
      setTimeout(() => {
        showNextPurchase()
      }, nextDelay)
      
    }, 5000)
  }

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 w-80 rounded-2xl bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-primary/10 overflow-hidden"
        >
          {/* Subtle animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 opacity-50" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 leading-tight mb-1">
                <span className="font-bold text-navy">{currentPurchase.name}</span> from {currentPurchase.location} just purchased
              </p>
              <p className="text-sm font-black text-primary leading-tight">
                {currentPurchase.package}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {currentPurchase.time}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
