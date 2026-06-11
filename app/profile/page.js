'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { User, Mail, BookOpen, Award, Edit2, Save, X, LogOut } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import { logout, setCredentials } from '@/store/slices/authSlice'

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user: authUser, isAuthenticated } = useSelector(state => state.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchProfile()
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile')
      setProfile(response.data.user)
      setFormData({ name: response.data.user.name || '', email: response.data.user.email || '' })
      // Fetch certificates count
      try {
        const certRes = await api.get('/admin/certificates').catch(() => null)
        if (certRes?.data?.certificates) {
          const userCerts = certRes.data.certificates.filter(c => c.userId === response.data.user._id)
          setCertificates(userCerts)
        }
      } catch {}
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/auth/login')
        return
      }
      console.error('Fetch profile failed:', error)
      setError('Failed to load profile. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await api.put('/profile', formData)
      setProfile(res.data.user)
      dispatch(setCredentials({ token: localStorage.getItem('token'), user: { ...authUser, name: formData.name } }))
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-64 bg-primary/5 border border-primary/10 rounded-2xl mb-6"></div>
          <div className="h-96 bg-primary/5 border border-primary/10 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-navy text-3xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xl font-bold"
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary w-full"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-slate-800">{profile?.name}</h1>
                    <p className="text-slate-500 flex items-center gap-2 mt-2">
                      <Mail className="h-4 w-4" />
                      {profile?.email}
                    </p>
                    <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      profile?.role === 'admin' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                    }`}>
                      {profile?.role || 'Student'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setFormData({ name: profile.name, email: profile.email }) }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-black text-slate-800">{profile?.purchasedCourses?.length || 0}</p>
              <p className="text-slate-500 text-sm mt-1">Enrolled Courses</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <div className="p-3 bg-secondary/10 rounded-xl w-fit mx-auto mb-2">
                <Award className="h-8 w-8 text-secondary" />
              </div>
              <p className="text-3xl font-black text-slate-800">{certificates.length}</p>
              <p className="text-slate-500 text-sm mt-1">Certificates</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-2">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xl font-black text-slate-800 capitalize">{profile?.status || 'Active'}</p>
              <p className="text-slate-500 text-sm mt-1">Account Status</p>
            </div>
          </div>
        </motion.div>

        {/* My Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">My Courses</h2>
          {profile?.purchasedCourses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.purchasedCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => router.push(`/learn/${course._id}/advanced`)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-primary text-3xl font-bold">{course.title?.charAt(0)}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-slate-500 text-sm">{course.instructor}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No courses enrolled yet</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
              >
                Browse Courses
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
