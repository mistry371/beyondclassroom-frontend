'use client'

import { useEffect, useState, useRef } from 'react'
import { FileText, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import api from '@/utils/api'

// Set worker url
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export default function PdfPreviewModal({ doc, onClose, isPurchased = false, user = null, onRequireLogin = () => {}, onRequirePurchase = () => {} }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(false)
  const containerRef = useRef(null)

  const [loadingFile, setLoadingFile] = useState(false)

  const isPdf = doc?.name ? doc.name.toLowerCase().endsWith('.pdf') : true;

  useEffect(() => {
    if (!doc) return
    const loadFile = async () => {
      setLoadingFile(true)
      try {
        if (doc.data) {
          const byteChars = atob(doc.data)
          const byteNums = new Array(byteChars.length)
          for (let i = 0; i < byteChars.length; i++) {
            byteNums[i] = byteChars.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNums)
          setFile({ data: byteArray, base64: doc.data })
        } else if (doc.url) {
          setFile(doc.url)
        } else if (doc.subtopicId) {
          const res = await api.get(`/subtopics/${doc.subtopicId}`)
          const fetchedSubtopic = res.data.subtopic
          let matchingDoc = null;
          if (fetchedSubtopic.documents && fetchedSubtopic.documents.length > 0) {
             matchingDoc = fetchedSubtopic.documents.find(d => d.name === doc.name)
          } else if (fetchedSubtopic.document) {
             matchingDoc = fetchedSubtopic.document
          }
          
          if (matchingDoc && matchingDoc.data) {
            const byteChars = atob(matchingDoc.data)
            const byteNums = new Array(byteChars.length)
            for (let i = 0; i < byteChars.length; i++) {
              byteNums[i] = byteChars.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNums)
            setFile({ data: byteArray, base64: matchingDoc.data })
          } else {
            onClose()
            if (!user) {
              onRequireLogin()
            } else {
              onRequirePurchase()
            }
          }
        } else {
          onClose()
          alert("Sorry, the file for this document has not been uploaded yet.")
        }
      } catch (e) {
        console.error('PDF preview error:', e)
        setError(true)
      } finally {
        setLoadingFile(false)
      }
    }
    loadFile()
  }, [doc])

  const handleDownload = () => {
    if (!user) {
      onRequireLogin();
      return;
    }
    if (!isPurchased) {
      onRequirePurchase();
      return;
    }

    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (file && file.base64) {
      const byteChars = atob(file.base64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNums);
      
      let mimeType = 'application/pdf';
      if (doc.name) {
        const lowerName = doc.name.toLowerCase();
        if (lowerName.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (lowerName.endsWith('.doc')) mimeType = 'application/msword';
        else if (lowerName.endsWith('.pptx')) mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        else if (lowerName.endsWith('.xlsx')) mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        else if (lowerName.endsWith('.png')) mimeType = 'image/png';
        else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';
      }
      
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative h-[90vh] w-full max-w-5xl flex flex-col overflow-hidden rounded-2xl bg-academic shadow-premium"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-primary/10 bg-white px-5 py-3 flex-shrink-0 z-20">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FileText className="h-5 w-5 text-primary" />
            <p className="font-bold text-navy truncate max-w-xs sm:max-w-md">{doc?.name || 'PDF Document'}</p>
            <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full font-bold uppercase tracking-wide">
              Secure View
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
            {numPages && (
              <div className="flex items-center gap-2 bg-academic rounded-lg px-2 py-1">
                <button 
                  disabled={pageNumber <= 1} 
                  onClick={() => setPageNumber(p => p - 1)}
                  className="p-1 text-muted hover:text-primary disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-navy w-16 text-center">
                  {pageNumber} / {numPages}
                </span>
                <button 
                  disabled={pageNumber >= numPages} 
                  onClick={() => setPageNumber(p => p + 1)}
                  className="p-1 text-muted hover:text-primary disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 bg-academic rounded-lg px-1 py-1">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1 text-muted hover:text-primary"><ZoomOut className="h-4 w-4" /></button>
              <span className="text-xs font-bold text-navy w-10 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-1 text-muted hover:text-primary"><ZoomIn className="h-4 w-4" /></button>
            </div>

            <button onClick={handleDownload} className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ml-2">
              <Download className="h-4 w-4" /> Download
            </button>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted hover:bg-academic hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Canvas Container */}
        <div 
          className="flex-1 overflow-auto relative bg-academic/50 select-none custom-scrollbar flex justify-center p-4"
          ref={containerRef}
        >
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted m-auto">
              <FileText className="h-16 w-16 text-primary/30" />
              <p className="font-semibold text-lg">Unable to load document</p>
            </div>
          ) : !isPdf ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted m-auto p-8 text-center max-w-md">
              <FileText className="h-16 w-16 text-primary/30" />
              <p className="font-semibold text-lg text-navy">Preview Not Available</p>
              <p className="text-sm">
                This document is a {doc?.name?.split('.').pop()?.toUpperCase()} file. Browser previews are only supported for PDF files. 
                {isPurchased ? " Please use the download button to view it locally." : " Please sign up or unlock the course to download and view this file."}
              </p>
            </div>
          ) : !file ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 m-auto">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              <p className="text-sm font-bold text-muted animate-pulse">Decrypting secure document...</p>
            </div>
          ) : (
            <div className="relative shadow-xl">
              {/* Overlay Watermark over the canvas */}
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden mix-blend-overlay opacity-40">
                <p className="rotate-[-35deg] text-4xl sm:text-7xl font-black text-gray-500 whitespace-nowrap select-none">
                  {isPurchased ? 'Beyond Classroom — Licensed Copy' : 'Beyond Classroom — Preview Only'}
                </p>
              </div>

              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                  </div>
                }
                error={
                  <div className="text-red-500 font-bold p-10 bg-white rounded-lg">Failed to load PDF.</div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false} 
                  className="bg-white rounded-lg overflow-hidden"
                />
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
