'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Clock, CheckCircle, XCircle, MessageSquare, Briefcase, Calendar, DollarSign, Edit } from 'lucide-react'
import api, { API_URL } from '@/utils/api'
import { motion } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_URL.replace('/api', '') + (url.startsWith('/') ? url : '/' + url);
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
}

export default function AdminCustomRequests() {
  const router = useRouter()
  const { user } = useSelector(s => s.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ status:'', adminNote:'', finalDuration:'', finalRoadmap:'', assignedToUserId:'', deliveryTitle:'', deliveryType:'question_paper', deliveryUrl:'', deliveryNote:'' })
  const [pdfFile, setPdfFile] = useState(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    api.get('/custom-requests/admin').then(r => setRequests(r.data.requests || [])).catch(e => { console.error(e); showError('Failed to load requests'); }).finally(() => setLoading(false))
  }, [user])

  const openEdit = (req) => { setSelected(req); setPdfFile(null); setForm({ status: req.status, adminNote: req.adminNote || '', finalDuration: req.finalDuration || req.estimatedDuration || '', finalRoadmap: req.finalRoadmap || '', assignedToUserId: req.assignedToUserId || req.userId || '', deliveryTitle:'', deliveryType:'question_paper', deliveryUrl:'', deliveryNote:'' }) }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = { status: form.status, adminNote: form.adminNote, finalDuration: form.finalDuration, finalRoadmap: form.finalRoadmap, assignedToUserId: form.assignedToUserId }
      if (form.deliveryUrl && form.deliveryTitle) {
        payload.deliveryItems = [
          ...(selected.deliveryItems || []),
          { title: form.deliveryTitle, type: form.deliveryType, url: form.deliveryUrl, note: form.deliveryNote }
        ]
      }
      await api.put('/custom-requests/admin/' + selected._id, payload)
      setSelected(null)
      showSuccess('Request updated')
      const r = await api.get('/custom-requests/admin')
      setRequests(r.data.requests || [])
    } catch (err) { showError('Update failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return
    try {
      await api.delete('/custom-requests/admin/' + id)
      setRequests(prev => prev.filter(r => r._id !== id))
      showSuccess('Deleted')
    } catch (e) {
      showError('Failed to delete')
    }
  }

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploadingPdf(true)
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setPdfFile(res.data.fileUrl)
      showSuccess('PDF uploaded successfully')
    } catch (err) {
      showError('PDF upload failed')
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleAssignPdf = async () => {
    if (!pdfFile) {
      showError('Please upload a PDF first')
      return
    }
    try {
      await api.put('/custom-requests/admin/' + selected._id + '/assign-pdf', { assignedPdf: pdfFile })
      setSelected(null)
      setPdfFile(null)
      showSuccess('PDF Assigned and Request Completed')
      const r = await api.get('/custom-requests/admin')
      setRequests(r.data.requests || [])
    } catch (err) {
      showError('Failed to assign PDF')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-5xl p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
        <div className="space-y-3">
          <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
          <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-600"/>
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Customized Requests</h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">{requests.length} total request{requests.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {requests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4"/>
            <p className="text-slate-600 text-lg font-medium">No customized requests yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4">Request Info</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Deliverable</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req, i) => (
                    <motion.tr 
                      key={req._id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Request Info */}
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{req.title}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Student Info */}
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-semibold text-slate-800">{req.userName}</p>
                        <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{req.userEmail}</p>
                        {req.userUsage && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 border border-slate-200">
                            {req.userUsage.hasUnlimited 
                              ? 'Unlimited Requests'
                              : `Used: ${req.userUsage.used}/${req.userUsage.limit}`
                            }
                          </span>
                        )}
                      </td>

                      {/* Deliverable Info */}
                      <td className="px-6 py-4 align-top">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold capitalize border border-slate-200">
                          <Briefcase className="w-3.5 h-3.5" />
                          {(req.deliverable || 'custom').replace('_', ' ')}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-2 max-w-[200px]">
                          {(req.selectedTopics || req.selectedModules || []).slice(0, 2).map(t => <span key={t.moduleId} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[100px]">{t.moduleTitle}</span>)}
                          {(req.selectedTopics || req.selectedModules || []).length > 2 && <span className="text-[10px] text-slate-400">+{req.selectedModules.length - 2} more</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-1.5 ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(req)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" /> Review
                          </button>
                          <button 
                            onClick={() => handleDelete(req._id)} 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Manage Request</h3>
              <button onClick={() => setSelected(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><XCircle className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                <p className="text-sm font-bold text-slate-800 mb-1">{selected.title}</p>
                <p className="text-xs text-slate-500">From: {selected.userName} ({selected.userEmail})</p>
                {selected.marks && <p className="text-xs text-slate-500 mt-1">Marks Requested: <span className="font-bold text-slate-800">{selected.marks}</span></p>}
                {selected.studentAttachedFile && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-bold">Reference Material:</span>
                    <button type="button" onClick={() => {
                      const u = getFullUrl(selected.studentAttachedFile);
                      setPreviewUrl(u + (u.toLowerCase().includes('.pdf') ? '#toolbar=0' : ''));
                    }} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors">
                      View File
                    </button>
                    <button type="button" onClick={async () => {
                      try {
                        const url = getFullUrl(selected.studentAttachedFile);
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = `Reference_Document_${selected._id}.${url.split('.').pop() || 'pdf'}`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(a);
                      } catch(e) {
                        showError('Download failed');
                      }
                    }} className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-300 transition-colors">
                      Download File
                    </button>
                  </div>
                )}
                {selected.assignedPdf && (
                  <p className="text-xs text-green-600 font-bold mt-2">Assigned PDF: <button type="button" onClick={() => {
                    const u = getFullUrl(selected.assignedPdf);
                    setPreviewUrl(u + (u.toLowerCase().includes('.pdf') ? '#toolbar=0' : ''));
                  }} className="hover:underline">View File</button></p>
                )}
              </div>

              <form id="edit-form" onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">Current Status</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="completed">Completed / Assigned</option>
                    <option value="rejected">Rejected / Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">Deliverable Notes / Roadmap</label>
                  <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm" rows={3}
                    value={form.finalRoadmap} onChange={e => setForm(f => ({...f, finalRoadmap: e.target.value}))} placeholder="List out what will be delivered..."/>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                  <p className="text-slate-800 text-sm font-bold mb-4">Attach Delivery Link (Optional)</p>
                  <div className="space-y-3">
                    <input className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm shadow-sm" value={form.deliveryTitle} onChange={e => setForm(f => ({...f, deliveryTitle: e.target.value}))} placeholder="Attachment Title e.g. Merged Paper Set 1"/>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm shadow-sm sm:col-span-1" value={form.deliveryType} onChange={e => setForm(f => ({...f, deliveryType: e.target.value}))}>
                        <option value="question_paper">Question Paper</option>
                        <option value="notes">Notes</option>
                        <option value="worksheet">Worksheet</option>
                        <option value="other">Other</option>
                      </select>
                      <input className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm shadow-sm sm:col-span-2" value={form.deliveryUrl} onChange={e => setForm(f => ({...f, deliveryUrl: e.target.value}))} placeholder="https://drive.google.com/..."/>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                  <p className="text-slate-800 text-sm font-bold mb-4">Assign Generated PDF (Completes Request)</p>
                  <div className="space-y-3">
                    <input type="file" onChange={handlePdfUpload} disabled={uploadingPdf} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm shadow-sm" accept=".pdf" />
                    {uploadingPdf && <span className="text-sm text-slate-500">Uploading PDF...</span>}
                    {pdfFile && <span className="text-sm text-green-600 block">PDF uploaded successfully</span>}
                    <button type="button" onClick={handleAssignPdf} disabled={!pdfFile || uploadingPdf} className="w-full py-3 bg-primary !text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50">Assign PDF & Complete</button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">Private Note to Student</label>
                  <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm" rows={2}
                    value={form.adminNote} onChange={e => setForm(f => ({...f, adminNote: e.target.value}))} placeholder="Any message to send back to the student..."/>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50 rounded-b-3xl">
              <button type="button" onClick={() => setSelected(null)} className="flex-1 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="edit-form" className="flex-1 py-3 bg-primary !text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md shadow-primary/20">Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6" onClick={() => setPreviewUrl(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-0 w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Document Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><XCircle className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 bg-slate-100 rounded-b-3xl overflow-hidden relative">
              <iframe src={previewUrl} className="w-full h-full border-0" title="Document Preview" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
