'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  Users, BookOpen, DollarSign, TrendingUp, Activity,
  ShoppingCart, Award, Bell, Settings, BarChart3,
  Package, Tag, Layers, FileText, ListTree, HelpCircle,
  MessageSquare, CheckSquare, Image, Shield, Star,
  Wallet, ShieldCheck, ArrowRight
} from 'lucide-react'
import api from '@/utils/api'
import { cachedGet } from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const { authReady, user } = useAdminAuth()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    if (!authReady) return
    fetchDashboardStats()
  }, [authReady])

  const fetchDashboardStats = async () => {
    setStatsLoading(true)
    setFetchError('')
    try {
      const res = await cachedGet('/admin/dashboard/stats', 30 * 1000)
      setStats(res.data.stats || {})
    } catch (error) {
      setFetchError(error.userMessage || 'Stats could not load. You can still use the menu below.')
      setStats({})
    } finally {
      setStatsLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-blue-50 text-blue-600', change: stats?.userGrowth?.percentage || 0 },
    { title: 'Total Courses', value: stats?.totalCourses ?? '—', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600', change: 0 },
    { title: 'Total Revenue', value: stats?.totalRevenue != null ? `₹${Number(stats.totalRevenue).toFixed(2)}` : '—', icon: DollarSign, color: 'bg-green-50 text-green-600', change: 0 },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions ?? '—', icon: Award, color: 'bg-orange-50 text-orange-600', change: 0 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 mt-1">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/analytics" className="hidden sm:inline-flex px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-medium items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
              <Link href="/" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                Back to Site
              </Link>
            </div>
          </div>

          {/* Quick actions — one click to the most frequent operations (#4) */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { href: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
              { href: '/admin/promo-codes', label: 'New Promo Code', icon: Tag },
              { href: '/admin/kyc', label: 'Review KYC', icon: ShieldCheck },
              { href: '/admin/promoters', label: 'Payouts', icon: Wallet },
              { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
              { href: '/admin/notifications', label: 'Send Notice', icon: Bell },
            ].map((q) => (
              <Link key={q.href} href={q.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-primary/40 hover:text-primary transition-all">
                <q.icon className="h-4 w-4" /> {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetchError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex flex-wrap justify-between items-center gap-3">
            <span>{fetchError}</span>
            <button type="button" onClick={fetchDashboardStats} className="font-semibold underline text-amber-800">
              Retry stats
            </button>
          </div>
        )}

        {!statsLoading && stats?.pendingActions && (() => {
          const pa = stats.pendingActions
          const items = [
            { key: 'withdrawals', label: 'Withdrawal requests', count: pa.withdrawals || 0, href: '/admin/promoters', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
            { key: 'kyc', label: 'KYC to review', count: pa.kyc || 0, href: '/admin/kyc', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50' },
            { key: 'customRequests', label: 'Custom requests', count: pa.customRequests || 0, href: '/admin/custom-requests', icon: MessageSquare, color: 'text-rose-600 bg-rose-50' },
          ]
          const totalPending = items.reduce((s, i) => s + i.count, 0)
          if (totalPending === 0) return null
          return (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> Pending Actions
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{totalPending}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.filter((i) => i.count > 0).map((i) => (
                  <Link key={i.key} href={i.href}
                    className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${i.color}`}><i.icon className="h-6 w-6" /></div>
                      <div>
                        <p className="text-3xl font-black text-slate-800 leading-none">{i.count}</p>
                        <p className="text-slate-500 text-sm mt-1">{i.label}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${statsLoading ? 'opacity-60' : ''}`}>
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
            >
              <div className={`p-3 rounded-xl ${stat.color} w-fit mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-slate-500 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-black text-slate-800">{statsLoading ? '...' : stat.value}</p>
            </motion.div>
          ))}
        </div>

        <AdminSection title="Content Management">
          <QuickActionCard href="/admin/packages" title="Packages" description="Create & manage learning packages" icon={Package} color="bg-teal-50 text-teal-600" />
          <QuickActionCard href="/admin/promo-codes" title="Promo Codes" description="Monthly promo codes & discounts" icon={Tag} color="bg-amber-50 text-amber-600" />
          <QuickActionCard href="/admin/modules" title="Modules" description="Manage course modules" icon={Layers} color="bg-indigo-50 text-indigo-600" />
          <QuickActionCard href="/admin/lessons" title="Lessons" description="Create and edit lessons" icon={FileText} color="bg-blue-50 text-blue-600" />
          <QuickActionCard href="/admin/subtopics" title="Subtopics" description="Manage lesson subtopics" icon={ListTree} color="bg-cyan-50 text-cyan-600" />
          <QuickActionCard href="/admin/quizzes" title="Quizzes" description="Manage quizzes and questions" icon={HelpCircle} color="bg-purple-50 text-purple-600" />
          <QuickActionCard href="/admin/testimonials" title="Testimonials" description="Manage student success stories" icon={Star} color="bg-yellow-50 text-yellow-600" />
          <QuickActionCard href="/admin/custom-requests" title="Custom Requests" description="Manage student custom requests" icon={MessageSquare} color="bg-rose-50 text-rose-600" />
          <QuickActionCard href="/admin/promoters" title="Promoters" description="Referrals, commissions & payouts" icon={Users} color="bg-emerald-50 text-emerald-600" />
          <QuickActionCard href="/admin/kyc" title="KYC Management" description="Verify promoter documents" icon={ShieldCheck} color="bg-indigo-50 text-indigo-600" />
          <QuickActionCard href="/admin/exams" title="Examinations" description="Create & manage full exams" icon={CheckSquare} color="bg-red-50 text-red-600" />
          <QuickActionCard href="/admin/media" title="Media Library" description="Upload and manage media" icon={Image} color="bg-pink-50 text-pink-600" />
        </AdminSection>

        <AdminSection title="Analytics & Reports">
          <QuickActionCard href="/admin/analytics" title="Analytics" description="View platform analytics" icon={BarChart3} color="bg-emerald-50 text-emerald-600" />
          <QuickActionCard href="/admin/progress" title="Progress Tracking" description="Monitor student progress" icon={TrendingUp} color="bg-cyan-50 text-cyan-600" />
          <QuickActionCard href="/admin/logs" title="Activity Logs" description="View system activity" icon={Activity} color="bg-slate-100 text-slate-600" />
          <QuickActionCard href="/admin/orders" title="Orders" description="Manage orders and payments" icon={ShoppingCart} color="bg-orange-50 text-orange-600" />
        </AdminSection>

        <AdminSection title="Communication">
          <QuickActionCard href="/admin/notifications" title="Notifications" description="Send notifications" icon={Bell} color="bg-amber-50 text-amber-600" />
          <QuickActionCard href="/admin/emails" title="Emails" description="Manage email campaigns" icon={MessageSquare} color="bg-indigo-50 text-indigo-600" />
          <QuickActionCard href="/admin/announcements" title="Announcements" description="Platform announcements" icon={Bell} color="bg-rose-50 text-rose-600" />
          <QuickActionCard href="/admin/certificates" title="Certificates" description="Manage certificates" icon={Award} color="bg-yellow-50 text-yellow-600" />
        </AdminSection>

        <AdminSection title="Platform Management">
          <QuickActionCard href="/admin/users" title="Users" description="Manage all users" icon={Users} color="bg-blue-50 text-blue-600" />
          <QuickActionCard href="/admin/team" title="Team & Faculty" description="Manage team members" icon={Users} color="bg-indigo-50 text-indigo-600" />
          <QuickActionCard href="/admin/courses" title="Courses" description="Manage courses" icon={BookOpen} color="bg-emerald-50 text-emerald-600" />
          <QuickActionCard href="/admin/content" title="Content" description="Edit website content" icon={FileText} color="bg-teal-50 text-teal-600" />
          <QuickActionCard href="/admin/badges" title="Badges" description="Create achievement badges" icon={Award} color="bg-purple-50 text-purple-600" />
        </AdminSection>

        <AdminSection title="Security & Tools">
          <QuickActionCard href="/admin/security" title="Security" description="Monitor security" icon={Shield} color="bg-rose-50 text-rose-600" />
          <QuickActionCard href="/admin/tools" title="Tools" description="Manage learning tools" icon={Settings} color="bg-blue-50 text-blue-600" />
          <QuickActionCard href="/admin/settings" title="Settings" description="Platform settings" icon={Settings} color="bg-emerald-50 text-emerald-600" />
          <QuickActionCard href="/admin/live" title="Live Classes" description="Schedule & manage live sessions" icon={Activity} color="bg-red-50 text-red-600" />
        </AdminSection>

        {!statsLoading && stats?.recentUsers?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Recent Users
              </h2>
              <div className="space-y-3">
                {stats.recentUsers.slice(0, 5).map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-slate-800 font-medium">{u.name}</p>
                      <p className="text-slate-500 text-sm">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminSection({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-700 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  )
}

function QuickActionCard({ href, title, description, icon: Icon, color }) {
  return (
    <Link
      href={href}
      className="block bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left hover:border-primary/40 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer relative z-10"
    >
      <div className={`p-3 rounded-xl ${color} w-fit mb-4`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
    </Link>
  )
}
