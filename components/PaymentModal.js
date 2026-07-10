'use client'

import { useState } from 'react'
import { X, CreditCard, Lock, CheckCircle, ShoppingBag, Tag, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'
import { invalidateCache } from '@/lib/apiCache'

export default function PaymentModal({ isOpen, onClose, course, item, isPackage, onSuccess, customAmount, selectedCourseIds }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(null) // { discountPercent, discountAmount, finalAmount }
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  // Use item if provided, otherwise fallback to course for backwards compatibility
  const currentItem = item || course
  const originalAmount = customAmount !== undefined ? customAmount : (isPackage ? (currentItem?.priceINR || 0) : (currentItem?.price || 0))
  const finalAmount = promoApplied ? promoApplied.finalAmount : originalAmount

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoApplied(null)
    try {
      const res = await api.post('/promo-codes/validate', {
        code: promoCode.trim(),
        amount: originalAmount,
      })
      if (res.data.success) {
        setPromoApplied(res.data)
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoApplied(null)
    setPromoCode('')
    setPromoError('')
  }

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    if (!currentItem?._id) return
    setLoading(true)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert('Payment gateway failed to load. Please check your internet connection and try again.')
        setLoading(false)
        return
      }

      // Create Razorpay order with final (discounted) amount
      let orderData
      try {
        const payload = {
          amount: finalAmount,
          promoCode: promoApplied ? promoCode.trim() : undefined,
        }
        if (isPackage) {
          payload.packageId = currentItem._id
          if (selectedCourseIds && selectedCourseIds.length > 0) {
            payload.selectedCourseIds = selectedCourseIds
          }
        } else {
          payload.courseId = currentItem._id
        }

        const res = await api.post('/payment/create-order', payload)
        orderData = res.data
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to initiate payment. Please try again.')
        setLoading(false)
        return
      }

      const { order, keyId } = orderData
      const resolvedKey = keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      if (!resolvedKey || !order?.id) {
        alert('Payment configuration error. Please contact support.')
        setLoading(false)
        return
      }

      if (order.id.startsWith('order_mock_') || resolvedKey === 'your_razorpay_key_id') {
        // Bypass Razorpay for mock orders (local development)
        try {
          const verifyPayload = {
            razorpay_order_id: order.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_signature',
          }
          if (isPackage) {
            verifyPayload.packageId = currentItem._id
            if (selectedCourseIds && selectedCourseIds.length > 0) {
              verifyPayload.selectedCourseIds = selectedCourseIds
            }
          } else {
            verifyPayload.courseId = currentItem._id
          }
          const verifyRes = await api.post('/payment/verify', verifyPayload)
            if (verifyRes.data.success) {
              if (promoApplied && promoCode) {
                try {
                  await api.post('/promo-codes/apply', { code: promoCode.trim() })
                } catch (_) {}
              }
              invalidateCache('GET:/profile/dashboard-summary')
              invalidateCache('GET:/courses')
              invalidateCache('GET:/profile')
              setDone(true)
              setTimeout(() => { setDone(false); onSuccess(); onClose() }, 1500)
            }
        } catch {
          alert('Mock payment verification failed. Please contact support.')
        }
        setLoading(false)
        return
      }

      const options = {
        key: resolvedKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Beyond Classroom',
        description: currentItem.title || currentItem.name,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }
            if (isPackage) {
              verifyPayload.packageId = currentItem._id
              if (selectedCourseIds && selectedCourseIds.length > 0) {
                verifyPayload.selectedCourseIds = selectedCourseIds
              }
            } else {
              verifyPayload.courseId = currentItem._id
            }

            const verifyRes = await api.post('/payment/verify', verifyPayload)
            if (verifyRes.data.success) {
              // Record promo code usage
              if (promoApplied && promoCode) {
                try {
                  await api.post('/promo-codes/apply', { code: promoCode.trim() })
                } catch (_) {}
              }
              invalidateCache('GET:/profile/dashboard-summary')
              invalidateCache('GET:/courses')
              invalidateCache('GET:/profile')
              setDone(true)
              setTimeout(() => { setDone(false); onSuccess(); onClose() }, 1500)
            }
          } catch {
            alert('Payment verification failed. Please contact support.')
          }
        },
        theme: { color: '#D4AF37' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl border border-primary/10 p-6 sm:p-8 max-w-md w-full shadow-premium max-h-[90vh] overflow-y-auto custom-scrollbar pointer-events-auto">
              {done ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-navy mb-2">Purchase Successful!</h2>
                  <p className="text-muted font-medium">You now have full access.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-navy">Complete Purchase</h2>
                    <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="bg-academic rounded-2xl p-6 mb-5 border border-primary/5">
                    <h3 className="text-lg font-black text-ink mb-1">{currentItem?.title || currentItem?.name}</h3>
                    <p className="text-muted text-sm mb-4 line-clamp-2 leading-relaxed">{currentItem?.description}</p>
                    <div className="space-y-3 pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between">
                        <span className="text-muted font-bold text-sm uppercase tracking-wide">Original Price</span>
                        <span className={`font-black ${promoApplied ? 'line-through text-gray-400' : 'text-ink'}`}>
                          ₹{originalAmount}
                        </span>
                      </div>
                      {promoApplied && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-green-400 text-sm flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5" /> {promoApplied.discountPercent}% off ({promoCode.toUpperCase()})
                            </span>
                            <span className="text-green-400 font-semibold">−₹{promoApplied.discountAmount}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                            <span className="text-navy font-black">Total</span>
                            <span className="text-3xl font-black text-primary">₹{promoApplied.finalAmount}</span>
                          </div>
                        </>
                      )}
                      {!promoApplied && (
                        <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                          <span className="text-navy font-black">Total Amount</span>
                          <span className="text-3xl font-black text-primary">₹{originalAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-4">
                    {promoApplied ? (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm">{promoCode.toUpperCase()} applied</span>
                          <span className="text-green-300 text-xs">({promoApplied.discountPercent}% off)</span>
                        </div>
                        <button onClick={handleRemovePromo} className="text-muted hover:text-ink">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                          placeholder="Promo code (optional)"
                          className="flex-1 px-4 py-3 bg-academic border border-primary/10 rounded-xl text-ink font-bold placeholder-muted text-sm focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim() || promoLoading}
                          className="px-5 py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all disabled:opacity-40 flex items-center gap-1"
                        >
                          {promoLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary" /> : <>Apply <ChevronRight className="h-4 w-4" /></>}
                        </button>
                      </div>
                    )}
                    {promoError && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{promoError}</p>}
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading || !currentItem}
                    className="w-full bg-brand-gradient text-white py-4 rounded-xl font-black hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />Processing...</>
                    ) : (
                      <><ShoppingBag className="h-5 w-5" />Enroll Now — ₹{finalAmount}</>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-5 text-muted font-bold text-xs uppercase tracking-wider">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Secure payment · Instant access</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
