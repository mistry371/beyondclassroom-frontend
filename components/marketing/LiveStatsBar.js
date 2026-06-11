'use client'

import { usePathname } from 'next/navigation'

export default function LiveStatsBar() {
  const pathname = usePathname()

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/promoter') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/learn')
  ) return null

  return (
    <div className="bg-navy/95 border-b border-white/10 py-2.5 overflow-hidden" role="status">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .marquee-text {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 18s linear infinite;
        }
        .marquee-text:hover {
          animation-play-state: paused;
        }
      `}</style>
      <p className="marquee-text text-white text-sm font-medium">
        Where mathematics meets personalization!
      </p>
    </div>
  )
}
