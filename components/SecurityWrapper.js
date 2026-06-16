'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'

export default function SecurityWrapper() {
  const [isFocused, setIsFocused] = useState(true)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard?.writeText('')?.catch(() => {})
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Block copying, saving, printing
      if (isCmdOrCtrl) {
        if (
          e.key === 'p' || e.key === 'P' || 
          e.key === 's' || e.key === 'S' || 
          e.key === 'c' || e.key === 'C' || 
          e.key === 'x' || e.key === 'X'
        ) {
          e.preventDefault()
          e.stopPropagation()
        }
      }

      // Block DevTools
      if (
        e.key === 'F12' ||
        (isCmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (isCmdOrCtrl && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard?.writeText('')?.catch(() => {})
      }
    }

    const preventDefaultAction = (e) => {
      e.preventDefault()
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    // Capture events in the capture phase to intercept them before they reach elements
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    document.addEventListener('keyup', handleKeyUp, { capture: true })
    document.addEventListener('contextmenu', preventDefaultAction, { capture: true })
    document.addEventListener('copy', preventDefaultAction, { capture: true })
    document.addEventListener('cut', preventDefaultAction, { capture: true })
    document.addEventListener('dragstart', preventDefaultAction, { capture: true })

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('keyup', handleKeyUp, { capture: true })
      document.removeEventListener('contextmenu', preventDefaultAction, { capture: true })
      document.removeEventListener('copy', preventDefaultAction, { capture: true })
      document.removeEventListener('cut', preventDefaultAction, { capture: true })
      document.removeEventListener('dragstart', preventDefaultAction, { capture: true })
      
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  if (isFocused) return null

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl text-white select-none">
      <ShieldAlert className="h-24 w-24 text-red-500 mb-6 animate-pulse" />
      <h2 className="text-4xl font-black mb-4">Security Alert</h2>
      <p className="text-xl text-slate-300 max-w-lg text-center font-medium">
        Screenshots, screen recording, and copying content are strictly prohibited on Beyond Classroom.
      </p>
      <p className="text-sm text-slate-500 mt-8">
        Please return focus to this window to continue your learning.
      </p>
    </div>
  )
}
