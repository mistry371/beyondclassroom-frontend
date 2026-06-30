'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import { Receipt, Calendar, CreditCard, Box, BookOpen, AlertCircle, CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'

export default function PurchasesPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payment/history')
      setPayments(res.data.payments || [])
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic pb-20 md:pb-0">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-black text-navy flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            Billing & Purchases
          </h1>
          <p className="text-muted">View all your purchase history, invoices, and transaction details.</p>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-3xl border border-primary/10 bg-white py-20 text-center shadow-premium">
            <CreditCard className="mx-auto mb-4 h-16 w-16 text-primary/30" />
            <h2 className="text-2xl font-bold text-ink">No purchases yet</h2>
            <p className="mt-2 text-muted">You haven't bought any courses or packages.</p>
            <Link href="/packages" className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90">
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {payments.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-premium transition-all hover:shadow-lg"
              >
                <div className="border-b border-primary/10 bg-slate-50/50 p-6 sm:px-8 sm:py-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-ink">{payment.razorpayOrderId || payment._id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Date
                      </p>
                      <p className="text-sm font-semibold text-ink">{formatDate(payment.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Amount</p>
                      <p className="text-lg font-black text-primary">{formatCurrency(payment.amount, payment.currency)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy">Item Purchased</h3>
                    <div>
                      {payment.status === 'success' ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          <CheckCircle className="h-3.5 w-3.5" /> Successful
                        </span>
                      ) : payment.status === 'pending' ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                          <AlertCircle className="h-3.5 w-3.5" /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          <AlertCircle className="h-3.5 w-3.5" /> Failed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/5 bg-slate-50 p-5">
                    {payment.package ? (
                      <div>
                        <div className="flex items-start gap-3">
                          <Package className="h-6 w-6 text-accent mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Package Purchase</p>
                            <p className="text-lg font-bold text-navy">{payment.package.name}</p>
                          </div>
                        </div>
                        
                        {payment.selectedCourses && payment.selectedCourses.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-primary/10 ml-9">
                            <p className="text-sm font-semibold text-muted mb-2">Selected Courses:</p>
                            <ul className="space-y-2">
                              {payment.selectedCourses.map((c, i) => (
                                <li key={i} className="flex items-center gap-2 text-ink font-medium">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  {c.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : payment.course ? (
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-6 w-6 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Single Course Purchase</p>
                          <p className="text-lg font-bold text-navy">{payment.course.title}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted italic">Item details not available</p>
                    )}
                  </div>
                  
                  {payment.promoCode && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 border border-green-200">
                      <span className="font-semibold">Promo Code Used:</span>
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-green-300">{payment.promoCode}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
