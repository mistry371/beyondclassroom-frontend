'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, ArrowLeft, FileText, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MathRenderer from '@/components/MathRenderer'
import TrialGuard from '@/components/TrialGuard'
import dynamic from 'next/dynamic'
import api from '@/utils/api'
import { motion } from 'framer-motion'

const PdfPreviewModal = dynamic(() => import('@/components/PdfPreviewModal'), { ssr: false })

export default function SubtopicPage() {
  const params = useParams()
  const router = useRouter()
  const [subtopic, setSubtopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    fetchSubtopicData()
  }, [params.subtopicId])

  const fetchSubtopicData = async () => {
    try {
      const res = await api.get(`/subtopics/${params.subtopicId}`)
      setSubtopic(res.data.subtopic)
    } catch (error) {
      console.error('Failed to fetch subtopic:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic flex items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!subtopic) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-navy text-xl">Topic not found</p>
        </div>
      </div>
    )
  }

  const docs = subtopic.documents || (subtopic.document ? [subtopic.document] : [])

  return (
    <TrialGuard courseId={params.courseId}>
      <div className="min-h-screen bg-academic">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/learn/${params.courseId}`)}
            className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Course
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-premium rounded-2xl border border-primary/10 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-secondary to-primary rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-navy">{subtopic.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary font-semibold rounded">
                    Topic
                  </span>
                </div>
              </div>
            </div>

            {/* Concept Explanation */}
            {subtopic.content && (
              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold text-navy mb-4">📚 Explanation</h2>
                <div className="text-ink leading-relaxed">
                  <MathRenderer content={subtopic.content} />
                </div>
              </div>
            )}

            {/* Documents / PDFs */}
            {docs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy mb-4">📄 Attached Materials</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                  {docs.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewDoc(doc)}
                      className="inline-flex items-center gap-2 bg-brand-gradient text-white px-5 py-3 rounded-xl font-semibold shadow-premium hover:opacity-90 transition-opacity"
                    >
                      <FileText className="h-5 w-5" />
                      {doc?.name ? `View ${doc.name}` : 'Secure View PDF'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Button */}
            <div className="pt-8 border-t border-primary/10">
              <button
                onClick={() => router.push(`/learn/${params.courseId}`)}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Finish Topic & Return
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {previewDoc && (
        <PdfPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} isPurchased={true} />
      )}
    </TrialGuard>
  )
}
