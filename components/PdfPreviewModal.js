'use client'

import { useEffect, useState, useRef } from 'react'
import { FileText, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'

// Set worker url
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export default function PdfPreviewModal({ doc, onClose, isPurchased = false, user = null, onRequireLogin = () => {}, onRequirePurchase = () => {} }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!doc) return
    try {
      if (doc.data) {
        const byteChars = atob(doc.data)
        const byteNums = new Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNums)
        // Pass unit8 array directly to react-pdf to avoid creating blob URLs that can be downloaded
        setFile({ data: byteArray })
      } else if (doc.url) {
        setFile(doc.url)
      }
    } catch (e) {
      console.error('PDF preview error:', e)
      setError(true)
    }
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
    } else if (doc.data) {
      const byteString = atob(doc.data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
