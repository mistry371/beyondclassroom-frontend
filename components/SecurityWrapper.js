'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// Light, site-wide security guard (#3). Discourages casual inspection/copying
// without harming UX for legitimate users: blocks right-click and common
// devtools/view-source/save shortcuts, and warns when devtools appears to be
// open. Heavier anti-selection/screenshot protection stays on /learn/* only
// (see ScreenProtection). NOTE: browser-side measures only deter casual misuse;
// real protection is the server-side authorization added for premium content.
export default function SecurityWrapper() {
  const pathname = usePathname()
  const [devtoolsWarn, setDevtoolsWarn] = useState(false)

  // Never interfere with the admin panel (admins need devtools).
  const disabled = pathname?.startsWith('/admin')

  useEffect(() => {
    if (disabled) return

    const inField = (el) => {
      const tag = el?.tagName?.toLowerCase()
      return tag === 'input' || tag === 'textarea' || el?.isContentEditable
    }

    const onContextMenu = (e) => { if (!inField(e.target)) e.preventDefault() }

    const onKeyDown = (e) => {
      const k = (e.key || '').toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      // F12 devtools
      if (k === 'f12') { e.preventDefault(); return }
      // Ctrl/Cmd+Shift+I/J/C/K (inspect/console)
      if (ctrl && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) { e.preventDefault(); return }
      // Ctrl/Cmd+U (view source), Ctrl/Cmd+S (save page) — skip inside inputs
      if (ctrl && ['u', 's'].includes(k) && !inField(e.target)) { e.preventDefault(); return }
    }

    // Devtools-open heuristic: a large gap between outer and inner size usually
    // means a docked devtools panel. Warn (don't hard-lock) to avoid false
    // positives from zoom / narrow windows.
    const THRESHOLD = 170
    let raf = null
    const checkDevtools = () => {
      const widthGap = window.outerWidth - window.innerWidth
      const heightGap = window.outerHeight - window.innerHeight
      const open = widthGap > THRESHOLD || heightGap > THRESHOLD
      setDevtoolsWarn(open)
    }
    const onResize = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(checkDevtools) }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', onResize)
    const poll = setInterval(checkDevtools, 2000)
    checkDevtools()

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', onResize)
      clearInterval(poll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [disabled])

  if (disabled || !devtoolsWarn) return null

  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2147483647, background: '#111827', color: '#fff', padding: '10px 18px',
      borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 8, maxWidth: '90vw',
    }}>
      <span aria-hidden>🔒</span> Developer tools detected. This content is protected.
    </div>
  )
}
