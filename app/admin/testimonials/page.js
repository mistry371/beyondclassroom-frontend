'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, ArrowLeft, Star, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import api from '@/utils/api'
import { showSuccess, showError } from '@/components/ui/Toast'
import Image from 'next/image'

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) {
    const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  return url;
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    image: '',
    content: '',
    rating: 5,
    active: true
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/admin/testimonials')
      if (res.data.success) {
        setTestimonials(res.data.testimonials)
      }
    } catch (error) {
      showError('Failed to load testimonials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingId(testimonial._id)
      setFormData({
        name: testimonial.name,
        grade: testimonial.grade,
        image: testimonial.image,
        content: testimonial.content,
        rating: testimonial.rating || 5,
        active: testimonial.active
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        grade: '',
        image: '',
        content: '',
        rating: 5,
        active: true
      })
    }
    setIsModalOpen(true)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    
    setUploading(true)
    try {
      const res = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.fileUrl) {
        setFormData(prev => ({ ...prev, image: res.data.fileUrl }))
        showSuccess('Image uploaded successfully')
      }
    } catch (error) {
      showError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.content) {
      showError('Name and content are required')
      return
    }

    try {
      if (editingId) {
        const res = await api.put(`/admin/testimonials/${editingId}`, formData)
        if (res.data.success) {
          showSuccess('Testimonial updated')
          setTestimonials(testimonials.map(t => t._id === editingId ? res.data.testimonial : t))
        }
      } else {
        const res = await api.post('/admin/testimonials', formData)
        if (res.data.success) {
          showSuccess('Testimonial created')
          setTestimonials([res.data.testimonial, ...testimonials])
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save testimonial')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const res = await api.delete(`/admin/testimonials/${id}`)
      if (res.data.success) {
        showSuccess('Testimonial deleted')
        setTestimonials(testimonials.filter(t => t._id !== id))
      }
    } catch (error) {
      showError('Failed to delete testimonial')
    }
  }

  const toggleStatus = async (testimonial) => {
    try {
      const res = await api.put(`/admin/testimonials/${testimonial._id}`, { active: !testimonial.active })
      if (res.data.success) {
        showSuccess(`Testimonial ${res.data.testimonial.active ? 'activated' : 'deactivated'}`)
        setTestimonials(testimonials.map(t => t._id === testimonial._id ? res.data.testimonial : t))
      }
    } catch (error) {
      showError('Failed to update status')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-navy">Testimonials</h1>
            <p className="text-slate-500">Manage student success stories</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-[#fff] px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 text-[#fff]" />
            Add Testimonial
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-white rounded-2xl p-6 border ${testimonial.active ? 'border-slate-200' : 'border-red-200 bg-red-50/30'} shadow-sm relative group`}
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(testimonial)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(testimonial._id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                      {testimonial.image ? (
                        <img src={getImageUrl(testimonial.image)} alt={testimonial.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{testimonial.name}</h3>
                      <p className="text-sm text-slate-500">{testimonial.grade}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                    ))}
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-4 italic mb-6">"{testimonial.content}"</p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${testimonial.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {testimonial.active ? 'Active' : 'Hidden'}
                    </span>
                    <button
                      onClick={() => toggleStatus(testimonial)}
                      className={`text-sm font-medium ${testimonial.active ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                      {testimonial.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {testimonials.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">No Testimonials Yet</h3>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto">Add your first student success story to build trust and display social proof on your homepage.</p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-[#fff] px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5 text-[#fff]" />
                    Add Your First Testimonial
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-navy">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Student Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="e.g. Aarav Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Grade / Role</label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="e.g. Grade 6 Student"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="https://... or /testimonials/image.png"
                    />
                    <label className="flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                      ) : (
                        <><UploadCloud className="w-4 h-4 mr-2" /> Upload</>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Leave empty to use initials avatar. Paste a link or upload an image directly.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Testimonial Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="What did they say about the platform?"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({...formData, rating: star})}
                          className={`p-1.5 rounded-lg transition-colors ${formData.rating >= star ? 'bg-yellow-50 text-yellow-500' : 'bg-slate-50 text-slate-300'}`}
                        >
                          <Star className={`w-5 h-5 ${formData.rating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active-toggle"
                      checked={formData.active}
                      onChange={e => setFormData({...formData, active: e.target.checked})}
                      className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="active-toggle" className="text-sm font-medium text-slate-700">Active (Visible)</label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-[#fff] rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-all"
                  >
                    {editingId ? 'Save Changes' : 'Create Testimonial'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
