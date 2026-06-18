'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookOpen, Plus, Edit, Trash2, ArrowLeft, Search, GripVertical } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

function AdminModules() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSelector(state => state.auth)
  const [modules, setModules] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('courseId') || 'all')
  const [showModal, setShowModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    order: 1,
    duration: '',
    isPublished: true
  })

  useEffect(() => {
  }, [user])

  useEffect(() => {
    fetchCourses()
    fetchModules()
  }, [])

  useEffect(() => {
    fetchModules()
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses')
      setCourses(res.data.courses || [])
      // Don't auto-select — allow "No Course" option if not specified in searchParams
      if (res.data.courses?.length > 0 && !selectedCourse) {
        setSelectedCourse('all')
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = async () => {
    try {
      let res
      if (selectedCourse === 'all' || !selectedCourse) {
        res = await api.get('/modules')
        setModules(res.data.modules || [])
      } else {
        res = await api.get(`/modules/course/${selectedCourse}`)
        setModules(res.data.modules || [])
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  const handleCreate = () => {
    setSelectedModule(null)
    setFormData({
      title: '',
      description: '',
      courseId: selectedCourse === 'all' ? '' : selectedCourse,
      order: modules.length + 1,
      duration: '',
      isPublished: true
    })
    setShowModal(true)
  }

  const handleEdit = (module) => {
    setSelectedModule(module)
    setFormData({
      title: module.title,
      description: module.description,
      courseId: module.courseId,
      order: module.order,
      duration: module.duration,
      isPublished: module.isPublished !== false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedModule) {
        await api.put(`/modules/${selectedModule._id}`, formData)
        showSuccess('Module updated')
      } else {
        await api.post('/modules', formData)
        showSuccess('Module created')
      }
      setShowModal(false)
      fetchModules()
    } catch (error) {
      showError(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (moduleId) => {
    if (!confirm('Are you sure? This will delete all lessons in this module.')) return
    try {
      await api.delete(`/modules/${moduleId}`)
      showSuccess('Module deleted')
      fetchModules()
    } catch (error) {
      showError(error.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-slate-500" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Module Management
                </h1>
                <p className="text-slate-500 mt-1">{modules.length} modules in selected course</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Selector */}
        <div className="mb-6">
          <label className="block text-slate-700 text-sm font-semibold mb-2">Filter by Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          >
            <option value="all">All Modules</option>
            <option value="">— No Course (Standalone) —</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-700 font-bold text-xl">No modules found</p>
              <p className="text-slate-500 mt-2">Create your first module to get started</p>
            </div>
          ) : (
            modules.map((module, index) => (
              <motion.div
                key={module._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                          Module {module.order}: {module.title}
                        </h3>
                        <p className="text-slate-500 text-sm">{module.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        module.isPublished !== false
                          ? 'bg-green-100 text-green-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {module.isPublished !== false ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 font-medium">
                      <span>Duration: {module.duration || 'Not set'}</span>
                      <span>•</span>
                      <span>Lessons: {module.lessonCount || 0}</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/admin/lessons?moduleId=${module._id}`)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold transition-all text-sm"
                      >
                        Manage Lessons
                      </button>
                      <button
                        onClick={() => router.push(`/admin/subtopics?moduleId=${module._id}`)}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-semibold transition-all text-sm"
                      >
                        Manage Subtopics
                      </button>
                      <button
                        onClick={() => handleEdit(module)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold transition-all text-sm flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition-all text-sm flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {selectedModule ? 'Edit Module' : 'Create Module'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Module Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Assign to Course <span className="text-slate-400 font-normal">(optional)</span></label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">— Standalone (no course) —</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 2 weeks"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  <label className="text-slate-700 font-semibold cursor-pointer" onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}>Publish module</label>
                </div>
                <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
                  >
                    {selectedModule ? 'Update Module' : 'Create Module'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminModulesWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>}>
      <AdminModules />
    </Suspense>
  )
}
