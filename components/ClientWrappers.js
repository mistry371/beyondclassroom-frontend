'use client'

import dynamic from 'next/dynamic'

const ClientChrome = dynamic(() => import('@/components/ClientChrome'), { ssr: false, loading: () => null })
const ToastContainer = dynamic(() => import('@/components/ui/Toast'), { ssr: false, loading: () => null })
const SessionGuard = dynamic(() => import('@/components/SessionGuard'), { ssr: false, loading: () => null })
const SecurityGuard = dynamic(() => import('@/components/SecurityGuard'), { ssr: false, loading: () => null })

export default function ClientWrappers() {
  return (
    <>
      <ClientChrome />
      <ToastContainer />
      <SessionGuard />
      <SecurityGuard />
    </>
  )
}
