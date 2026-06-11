'use client'

import { useEffect } from 'react'

export default function SecurityGuard() {
  useEffect(() => {
    // Only apply in production or when explicitly testing
    // To ensure admin can still work, we might not want to block entirely, but the user requested it for the whole platform.
    const blockInteractions = (e) => {
      // Prevent Right Click
      if (e.type === 'contextmenu') {
        e.preventDefault()
        return
      }
      
      const key = e.key?.toLowerCase()
      const ctrlOrMeta = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // Prevent F12
      if (key === 'f12') {
        e.preventDefault()
        e.stopPropagation()
      }

      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (ctrlOrMeta && shift && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
      }

      // Prevent Ctrl+U (View Source)
      if (ctrlOrMeta && key === 'u') {
        e.preventDefault()
        e.stopPropagation()
      }

      // Prevent Ctrl+S (Save), Ctrl+P (Print)
      if (ctrlOrMeta && ['s', 'p'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
      }

      // Prevent Copy / Paste globally (except in inputs where it might be needed, but user said no copy paste)
      // We will allow copy/paste if the active element is an input or textarea, so users can still type/paste in forms.
      const activeElement = document.activeElement
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      
      if (!isInput && ctrlOrMeta && ['c', 'v', 'x', 'a'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const preventCopy = (e) => {
      const activeElement = document.activeElement
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      if (!isInput) {
        e.preventDefault()
      }
    }

    // Attach listeners globally
    document.addEventListener('contextmenu', blockInteractions, true)
    document.addEventListener('keydown', blockInteractions, true)
    document.addEventListener('copy', preventCopy, true)
    document.addEventListener('cut', preventCopy, true)

    return () => {
      document.removeEventListener('contextmenu', blockInteractions, true)
      document.removeEventListener('keydown', blockInteractions, true)
      document.removeEventListener('copy', preventCopy, true)
      document.removeEventListener('cut', preventCopy, true)
    }
  }, [])

  // Block dragging elements (like images)
  useEffect(() => {
    const preventDrag = (e) => e.preventDefault()
    document.addEventListener('dragstart', preventDrag, true)
    return () => document.removeEventListener('dragstart', preventDrag, true)
  }, [])

  return null
}
