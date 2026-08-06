'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookMarked, Plus, Edit, Trash2, ArrowLeft, Paperclip, X, FileText } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_DOC_BYTES = 5 * 1024 * 1024
const MAX_DOC_COUNT = 30

function AdminSubtopicsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSelector(state => state.auth)

  const [subtopics, setSubtopics] = useState([])
  const [lessons, setLessons] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState(searchParams.get('moduleId') || '')
  const [showModal, setShowModal] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState(null)
  const [docError, setDocError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [packages, setPackages] = useState([])
  const [formData, setFormData] = useState({ title: '', content: '', lessonId: '', moduleId: '', courseId: '', order: 1, isPublished: true, documents: [], packageIds: [] })

  useEffect(() => { fetchModulesAndLessons() }, [user])
  useEffect(() => { if (selectedModule) fetchSubtopics() }, [selectedModule])

  const fetchModulesAndLessons = async () => {
    try {
      const modRes = await api.get('/modules')
      const allModules = modRes.data.modules || []
      setModules(allModules)

      const lessonPromises = allModules.map(m => api.get(`/lessons/module/${m._id}`))
      const lessonResults = await Promise.all(lessonPromises)
      const allLessons = lessonResults.flatMap(r => r.data.lessons || [])
      setLessons(allLessons)

      // Resolve which module to select. Priority: explicit ?moduleId, else the
      // module owning the ?lessonId (when opened from a Chapter's "Subtopics"
      // button), else the first module. Without this, opening from a Chapter
      // silently defaulted to the first GLOBAL module and mis-linked subtopics.
      if (!selectedModule) {
        const lessonParam = searchParams.get('lessonId')
        const lessonMatch = lessonParam ? allLessons.find(l => l._id === lessonParam) : null
        if (lessonMatch) setSelectedModule(lessonMatch.moduleId)
        else if (allModules.length > 0) setSelectedModule(allModules[0]._id)
      }

      try {
        const pkgRes = await api.get('/packages/admin')
        setPackages(pkgRes.data.packages || [])
      } catch (err) {
        console.error('Failed to fetch packages:', err)
      }
    } finally { setLoading(false) }
  }

  const fetchSubtopics = async () => {
    const res = await api.get(`/subtopics/module/${selectedModule}`)
    setSubtopics(res.data.subtopics || [])
  }

  const handleCreate = () => {
    setSelectedSubtopic(null)
    setDocError('')
    const foundModule = modules.find(m => m._id === selectedModule)
    // If opened from a Chapter (?lessonId), pre-select that chapter — but only
    // if it belongs to the currently selected module.
    const lessonParam = searchParams.get('lessonId') || ''
    const presetLessonId = lessonParam && lessons.some(l => l._id === lessonParam && l.moduleId === foundModule?._id)
      ? lessonParam
      : ''
    setFormData({
      title: '',
      content: '',
      lessonId: presetLessonId, // Optional; pre-filled when creating under a Chapter
      moduleId: foundModule?._id || '',
      courseId: foundModule?.courseId || '',
      order: subtopics.length + 1,
      isPublished: true,
      documents: [],
      packageIds: []
    })
    setShowModal(true)
  }

  const handleEdit = (subtopic) => {
    setSelectedSubtopic(subtopic)
    setDocError('')
    const docs = Array.isArray(subtopic.documents) ? subtopic.documents : (subtopic.document ? [subtopic.document] : [])
    setFormData({ 
      title: subtopic.title, 
      content: subtopic.content || '', 
      lessonId: subtopic.lessonId || '', 
      moduleId: subtopic.moduleId || '', 
      courseId: subtopic.courseId || '', 
      order: subtopic.order, 
      isPublished: subtopic.isPublished !== false, 
      documents: docs,
      packageIds: subtopic.packageIds || []
    })
    setShowModal(true)
  }

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setDocError('')
    if ((formData.documents.length + files.length) > MAX_DOC_COUNT) { setDocError(`Maximum ${MAX_DOC_COUNT} files allowed`); return }
    const tooLarge = files.find(f => f.size > MAX_DOC_BYTES)
    if (tooLarge) { setDocError('Each file must be 5 MB or smaller'); return }

    setUploading(true)
    try {
      // Upload each file to S3 via /api/upload; store ONLY the URL + metadata in
      // MongoDB (files → S3, text/metadata → Mongo). No more base64 in the DB.
      const uploaded = await Promise.all(files.map(async (file) => {
        const fd = new FormData()
        fd.append('file', file)
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        if (!res.data?.fileUrl) throw new Error('Upload failed')
        return { name: file.name, size: file.size, type: file.type, url: res.data.fileUrl }
      }))
      setFormData(prev => {
        // Re-uploading a file with the same name REPLACES the existing entry.
        const byName = new Map(prev.documents.map(d => [d.name, d]))
        uploaded.forEach(d => byName.set(d.name, d))
        return { ...prev, documents: Array.from(byName.values()) }
      })
    } catch (err) {
      setDocError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeDocument = (idx) => setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }))
  const formatFileSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (docError) return
    setUploading(true)
    setUploadProgress(0)
    
    const config = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percentCompleted)
      }
    }

    try {
      if (selectedSubtopic) await api.put(`/subtopics/${selectedSubtopic._id}`, formData, config)
      else await api.post('/subtopics', formData, config)
      setShowModal(false)
      fetchSubtopics()
    } catch (err) {
      setDocError(err.response?.data?.message || 'Failed to save subtopic')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (subtopicId) => {
    if (!confirm('Delete this subtopic?')) return
    await api.delete(`/subtopics/${subtopicId}`)
    fetchSubtopics()
  }

  if (loading) return (
    <div className="min-h-screen bg-academic flex items-center justify-center">
      <div className="w-full max-w-4xl p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-primary/10 rounded w-1/4"></div>
        <div className="h-32 bg-primary/5 rounded-2xl w-full"></div>
        <div className="space-y-3">
          <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
          <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
          <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-academic">
      <div className="bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin/modules')} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-muted" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-navy">Subtopic Management</h1>
                <p className="text-muted mt-1">{subtopics.length} subtopics</p>
              </div>
            </div>
            <button onClick={handleCreate} disabled={!selectedModule} className="px-4 py-2 bg-brand-gradient text-white font-bold shadow-premium rounded-lg disabled:opacity-50">
              Add Subtopic
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-sm font-bold text-navy mb-2">Select Module</label>
          <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink font-semibold">
            {modules.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {subtopics.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white shadow-premium rounded-2xl border border-primary/10 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-navy">{s.title}</h3>
                  <div className="flex gap-3 mt-2 text-sm text-muted">
                    <span>{s.lessonId ? `Under Chapter: ${lessons.find(l => l._id === s.lessonId)?.title || 'Unknown'}` : 'Direct Subtopic'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(s)} className="px-3 py-2 bg-primary/10 font-bold text-primary rounded-lg">Edit</button>
                  <button onClick={() => handleDelete(s._id)} className="px-3 py-2 bg-red-500/10 font-bold text-red-500 rounded-lg">Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {subtopics.length === 0 && (
            <div className="text-center p-12 bg-white rounded-2xl border border-primary/10">
              <p className="text-muted">No subtopics found for this module. Create one to get started.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-academic rounded-2xl border border-primary/10 shadow-premium p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl text-navy font-bold mb-5">{selectedSubtopic ? 'Edit Subtopic' : 'Create Subtopic'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Title *</label>
                  <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink" placeholder="Subtopic Title" required />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Optional Chapter (Lesson)</label>
                  <select 
                    value={formData.lessonId || ''} 
                    onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink"
                  >
                    <option value="">-- No Chapter (Directly under Module) --</option>
                    {lessons.filter(l => l.moduleId === formData.moduleId).map(l => (
                      <option key={l._id} value={l._id}>{l.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Content (Math Supported)</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink" rows="5" placeholder="Enter content or math equations..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Restrict to Packages (Optional)</label>
                  <p className="text-xs text-muted mb-3">If no packages are selected, this content is visible to everyone in the course. Select packages to make it exclusive to those packages.</p>
                  <div className="max-h-40 overflow-y-auto border border-primary/10 rounded-lg p-3 bg-white space-y-2">
                    {packages.map(pkg => (
                      <label key={pkg._id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-primary/5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.packageIds.includes(pkg._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, packageIds: [...formData.packageIds, pkg._id] })
                            } else {
                              setFormData({ ...formData, packageIds: formData.packageIds.filter(id => id !== pkg._id) })
                            }
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-semibold text-navy">{pkg.name}</span>
                      </label>
                    ))}
                    {packages.length === 0 && <p className="text-xs text-muted">No packages found.</p>}
                  </div>
                </div>

                <label className="flex items-center gap-3 px-4 py-4 bg-white border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors rounded-xl cursor-pointer">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <span className="text-ink font-semibold">Add files ({formData.documents.length}/{MAX_DOC_COUNT})</span>
                  <input type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleDocumentUpload} className="hidden" disabled={uploading} />
                </label>
                
                {uploading && (
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" /> 
                    Encoding & Uploading...
                  </div>
                )}
                
                {docError && <p className="text-red-500 font-bold text-sm">{docError}</p>}
                
                <div className="space-y-2">
                  {formData.documents.map((doc, idx) => (
                    <div key={`${doc.name}-${idx}`} className="flex items-center justify-between px-3 py-2 bg-white shadow-sm border border-primary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-ink font-semibold text-sm">{doc.name} ({formatFileSize(doc.size)})</span>
                      </div>
                      <button type="button" onClick={() => removeDocument(idx)} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {uploadProgress > 0 && (
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                    <div className="bg-brand-gradient h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    <p className="text-sm text-primary font-bold mt-1 text-center">Saving... {uploadProgress}%</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 px-4 py-3 bg-brand-gradient text-white font-bold rounded-xl disabled:opacity-50">
                    {selectedSubtopic ? 'Update' : 'Create'}
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

export default function AdminSubtopics() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-academic flex items-center justify-center">
        <div className="w-full max-w-4xl p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-1/4"></div>
          <div className="h-32 bg-primary/5 rounded-2xl w-full"></div>
        </div>
      </div>
    }>
      <AdminSubtopicsContent />
    </Suspense>
  )
}
