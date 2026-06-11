'use client'

import { useEffect } from 'react'

export default function SecurityGuard() {
  useEffect(() => {
    // Prevent right click
    const preventContextMenu = (e) => {
      e.preventDefault()
    }

    // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+C, Ctrl+V, etc.
    const preventShortcuts = (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
      }
      
      // Control / Meta key combinations
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase()
        if (['s', 'p', 'u', 'c', 'v', 'a'].includes(key)) {
          e.preventDefault()
        }
      }
      
      // Ctrl+Shift combinations (DevTools)
      if (e.ctrlKey && e.shiftKey) {
        const key = e.key.toLowerCase()
        if (['i', 'j', 'c'].includes(key)) {
          e.preventDefault()
        }
      }
    }

    document.addEventListener('contextmenu', preventContextMenu, true)
    document.addEventListener('keydown', preventShortcuts, true)

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu, true)
      document.removeEventListener('keydown', preventShortcuts, true)
    }
  }, [])

  return null
}
