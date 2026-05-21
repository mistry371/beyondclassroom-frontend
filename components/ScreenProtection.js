'use client'

import { useEffect, useRef } from 'react'

export default function ScreenProtection() {
  const overlayRef = useRef(null)

  useEffect(() => {
    // 1. CSS: disable selection and drag globally
    const style = document.createElement('style')
    style.id = 'screen-protection-styles'
    style.textContent = [
      '* { -webkit-user-select: none !important; -moz-user-select: none !important;',
      '    -ms-user-select: none !important; user-select: none !important;',
      '    -webkit-touch-callout: none !important; }',
      'img, video, canvas { pointer-events: none !important; -webkit-user-drag: none !important; }'
    ].join(' ')
    document.head.appendChild(style)

    // 2. Print protection
    const printStyle = document.createElement('style')
    printStyle.id = 'print-protection'
    printStyle.textContent = '@media print { body { display: none !important; } }'
    document.head.appendChild(printStyle)

    // Flash black overlay briefly (visual deterrent)
    const flashOverlay = () => {
      if (!overlayRef.current) return
      overlayRef.current.style.display = 'flex'
      setTimeout(() => { if (overlayRef.current) overlayRef.current.style.display = 'none' }, 400)
    }

    // 3. Block right-click
    const blockContextMenu = (e) => e.preventDefault()

    // 4. Block keyboard shortcuts
    const blockKeys = (e) => {
      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // PrintScreen / Print
      if (key === 'printscreen' || key === 'print') {
        e.preventDefault()
        flashOverlay()
        return false
      }

      // Alt+PrintScreen
      if (e.altKey && (key === 'printscreen' || key === 'print')) {
        e.preventDefault()
        flashOverlay()
        return false
      }

      // Windows Snipping Tool: Win+Shift+S
      if (e.metaKey && shift && key === 's') {
        e.preventDefault()
        flashOverlay()
        return false
      }

      // Ctrl/Cmd: C, A, S, P, U, X, V (copy, select-all, save, print, source, cut, paste)
      if (ctrl && ['c','a','s','p','u','x','v'].includes(key)) {
        e.preventDefault()
        return false
      }

      // F12 (DevTools)
      if (key === 'f12') { e.preventDefault(); return false }

      // Ctrl+Shift+I/J/C/K (DevTools)
      if (ctrl && shift && ['i','j','c','k'].includes(key)) {
        e.preventDefault()
        return false
      }
    }

    // 5. Block drag
    const blockDrag = (e) => e.preventDefault()

    // 6. Block print
    const blockPrint = () => { flashOverlay() }

    // 7. Block Screen Capture API (getDisplayMedia)
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async () => {
        flashOverlay()
        throw new DOMException('Screen capture is disabled on this platform.', 'NotAllowedError')
      }
    }

    // 8. Visibility change: show black overlay when tab is hidden
    const handleVisibility = () => {
      if (!overlayRef.current) return
      overlayRef.current.style.display = document.hidden ? 'flex' : 'none'
    }

    // 9. Window blur/focus: show overlay when window loses focus
    const handleBlur = () => { if (overlayRef.current) overlayRef.current.style.display = 'flex' }
    const handleFocus = () => { if (overlayRef.current) overlayRef.current.style.display = 'none' }

    // Attach all listeners
    document.addEventListener('contextmenu', blockContextMenu)
    document.addEventListener('keydown', blockKeys, true)
    document.addEventListener('dragstart', blockDrag)
    window.addEventListener('beforeprint', blockPrint)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu)
      document.removeEventListener('keydown', blockKeys, true)
      document.removeEventListener('dragstart', blockDrag)
      window.removeEventListener('beforeprint', blockPrint)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.getElementById('screen-protection-styles')?.remove()
      document.getElementById('print-protection')?.remove()
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      style={{
        display: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
        Content Protected
      </p>
      <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
        Screenshots and screen recording are not allowed
      </p>
    </div>
  )
}
