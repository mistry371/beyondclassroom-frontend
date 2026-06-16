'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Users, Plus, Edit, Trash2, ArrowLeft, Upload, CheckCircle, XCircle } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) {
    const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  return url;
};

export default function AdminTeam() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    photo: '',
    degree: '',
    experience: '',
    expertise: '',
    isActive: true,
    order: 1
  })

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const res = await api.get('/team')
      setTeam(res.data.team || [])
    } catch (error) {
      console.error('Failed to fetch team:', error)
      showError('Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedMember(null)
    setFormData({
      name: '',
      role: '',
      photo: '',
      degree: '',
      experience: '',
      expertise: '',
      isActive: true,
      order: team.length + 1
    })
    setShowModal(true)
  }

  const handleEdit = (member) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      photo: member.photo || '',
      degree: member.degree,
      experience: member.experience,
      expertise: Array.isArray(member.expertise) ? member.expertise.join(', ') : member.expertise,
      isActive: member.isActive,
      order: member.order
    })
    setShowModal(true)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.success && res.data.fileUrl) {
        setFormData(prev => ({ ...prev, photo: res.data.fileUrl }))
        showSuccess('Photo uploaded successfully')
      }
    } catch (error) {
      showError('Failed to upload photo')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedMember) {
        await api.put(`/team/${selectedMember._id}`, formData)
        showSuccess('Team member updated')
      } else {
        await api.post('/team', formData)
        showSuccess('Team member added')
      }
      setShowModal(false)
      fetchTeam()
    } catch (error) {
      showError(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return
    
    try {
      await api.delete(`/team/${id}`)
      showSuccess('Team member deleted')
      fetchTeam()
    } catch (error) {
      showError(error.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic flex items-center justify-center">
        <div className="w-full max-w-4xl p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-1/4"></div>
          <div className="h-32 bg-primary/5 rounded-2xl w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic pb-12">
      <div className="bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-muted" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-navy">
                  Team Management
                </h1>
                <p className="text-muted mt-1">{team.length} members in the team</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-brand-gradient text-white font-bold shadow-premium rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-primary/10 shadow-sm">
              <Users className="h-16 w-16 text-muted mx-auto mb-4 opacity-50" />
              <p className="text-navy font-bold text-xl">No team members found</p>
              <p className="text-muted mt-2">Add your first team member to show them on the public page.</p>
            </div>
          ) : (
            team.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white shadow-premium rounded-2xl border border-primary/10 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-primary/10 flex items-center justify-center">
                      {member.photo ? (
                        <img src={getImageUrl(member.photo)} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary">{member.initials}</span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-navy">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mb-3">{member.role}</p>
                  
                  <div className="space-y-2 mt-4 text-sm">
                    <div className="flex gap-2 text-slate-600">
                      <span className="font-semibold text-ink min-w-[80px]">Degree:</span>
                      <span className="line-clamp-2">{member.degree}</span>
                    </div>
                    <div className="flex gap-2 text-slate-600">
                      <span className="font-semibold text-ink min-w-[80px]">Experience:</span>
                      <span>{member.experience}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 border-t border-primary/10 p-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="flex-1 py-2 bg-white border border-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/5 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="flex-1 py-2 bg-white border border-red-200 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-academic rounded-2xl border border-primary/10 shadow-premium p-6 max-w-2xl w-full my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-navy">
                  {selectedMember ? 'Edit Team Member' : 'Add Team Member'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-muted hover:text-red-500 transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                      placeholder="e.g. Vishal H. Shah"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                      placeholder="e.g. Founder & Academic Director"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Photo</label>
                  <div className="flex items-center gap-4">
                    {formData.photo && (
                      <img src={getImageUrl(formData.photo)} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-primary/20" />
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 text-navy font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 border border-slate-200"
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-primary/10 shadow-sm rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Or enter image URL (e.g. /team/vishal.jpeg)"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Degree & University</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. MSc Management with International Business, University of Huddersfield"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Experience</label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 10+ years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Expertise (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-primary/10 shadow-sm rounded-lg text-ink font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Education Management, Mathematics Foundations, Curriculum Design"
                  />
                </div>

                <div className="flex items-center gap-3 py-2 border-t border-primary/10 mt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-navy font-bold cursor-pointer">
                    Active / Publicly Visible
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-brand-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-premium"
                  >
                    {selectedMember ? 'Update Member' : 'Add Member'}
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
