'use client'

import { useState } from 'react'
import { X, CreditCard, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'

export default function PaymentModal({ isOpen, onClose, course, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!course || !course._id) {
      alert('Course information is missing. Please try again.')
      return
    }

    setLoading(true)

    try {
      // Load Razorpay script
      const res = await loadRazorpayScript()
      if (!res) {
        alert('Razorpay SDK failed to load. Please check your internet connection.')
        setLoading(false)
        return
      }

      // Create order
      const orderResponse = await api.post('/payment/create-order', {
        courseId: course._id,
        amount: course.price
      })

      const { order, keyId } = orderResponse.data

      // Razorpay options
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Beyond Classroom',
        description: course.title,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id
            })

            if (verifyResponse.data.success) {
              onSuccess()
              onClose()
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#D4AF37'
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl border border-primary/20 p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">{course?.title || 'Course'}</h3>
                <p className="text-gray-400 text-sm mb-4">{course?.description || 'Course description'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-3xl font-bold text-primary">₹{course?.price || 0}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !course}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay ₹{course?.price || 0}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-sm">
                <Lock className="h-4 w-4" />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
