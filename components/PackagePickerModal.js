'use client'

import { useEffect, useState } from 'react'
import { X, Check, Award, Tag, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'

export default function PackagePickerModal({ isOpen, onClose, courseId, onSelectPackage }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPkgId, setSelectedPkgId] = useState(null)

  useEffect(() => {
    if (isOpen && courseId) {
      fetchPackages()
    }
  }, [isOpen, courseId])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const res = await api.get('/packages')
      const allPkgs = res.data.packages || []
      // Filter packages that contain this course in their courseIds
      const filtered = allPkgs.filter(pkg => 
        pkg.active !== false && 
        Array.isArray(pkg.courseIds) && 
        pkg.courseIds.includes(courseId)
      )
      setPackages(filtered)
      if (filtered.length > 0) {
        setSelectedPkgId(filtered[0]._id || filtered[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch packages for picker', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    const selectedPkg = packages.find(p => (p._id || p.id) === selectedPkgId)
    if (selectedPkg) {
      onSelectPackage(selectedPkg)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl border border-primary/10 p-6 sm:p-8 max-w-lg w-full shadow-premium pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-navy flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    Select a Package
                  </h2>
                  <p className="text-muted text-xs font-medium mt-1">This class is part of the following packages. Select one to continue.</p>
                </div>
                <button onClick={onClose} className="text-muted hover:text-ink transition-colors p-1.5 hover:bg-slate-100 rounded-full">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-primary" />
                  <p className="text-sm text-muted font-bold">Loading packages...</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-ink font-bold">No packages available</p>
                  <p className="text-muted text-sm mt-1">This course is currently not linked to any active package.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {packages.map((pkg) => {
                    const id = pkg._id || pkg.id
                    const isSelected = selectedPkgId === id
                    return (
                      <div
                        key={id}
                        onClick={() => setSelectedPkgId(id)}
                        className={`relative rounded-2xl border p-5 cursor-pointer transition-all flex flex-col ${
                          isSelected 
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                            : 'border-primary/10 bg-white hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-navy text-lg">{pkg.name}</h3>
                              {pkg.popular && (
                                <span className="bg-accent/15 text-accent text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-muted text-xs leading-relaxed mt-1 font-medium">{pkg.description}</p>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 ml-3">
                            <span className="text-2xl font-black text-primary">₹{pkg.priceINR || pkg.inr}</span>
                            <span className="text-[10px] text-muted font-bold">valid for {pkg.validity || '1 year'}</span>
                          </div>
                        </div>

                        {/* Selection check */}
                        <div className="absolute top-4 right-4 pointer-events-none">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-primary border-primary' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                        {/* Features preview */}
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1.5">
                            {pkg.features.slice(0, 3).map((feat, idx) => (
                              <span key={idx} className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {typeof feat === 'object' ? feat.label : feat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-ink rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3.5 bg-brand-gradient text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:opacity-95 shadow-md shadow-primary/10"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
