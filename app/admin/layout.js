'use client'

import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminLayout({ children }) {
  const { authReady, loading } = useAdminAuth()

  if (loading || !authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        
        <div className="w-full max-w-4xl p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-1/4"></div>
          <div className="h-32 bg-primary/5 rounded-2xl w-full"></div>
          <div className="space-y-3">
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="admin-panel">
      {children}
    </div>
  )
}
