'use client'

import { useEffect, useRef } from 'react'

/**
 * Calls `callback` every `intervalMs` to keep data fresh without manual reload (#2).
 * - Pauses while the tab is hidden (no wasted requests / battery).
 * - Fires an immediate refresh when the tab becomes visible again.
 * - Does NOT call on mount (the page's own initial fetch handles that).
 *
 * @param {() => (void|Promise<void>)} callback  re-callable fetch function
 * @param {number} intervalMs  poll interval (default 30s)
 * @param {boolean} enabled  disable polling (e.g. while a modal is open)
 */
export default function usePolling(callback, intervalMs = 30000, enabled = true) {
  const savedCallback = useRef(callback)
  savedCallback.current = callback

  useEffect(() => {
    if (!enabled) return
    let timer = null

    const tick = () => {
      // Skip while hidden; the visibility handler refreshes on return.
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      try { savedCallback.current?.() } catch (_) {}
    }

    const start = () => {
      stop()
      timer = setInterval(tick, intervalMs)
    }
    const stop = () => { if (timer) { clearInterval(timer); timer = null } }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        try { savedCallback.current?.() } catch (_) {} // refresh immediately on return
        start()
      } else {
        stop()
      }
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility) }
  }, [intervalMs, enabled])
}
