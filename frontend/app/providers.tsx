'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/app/components/ui/Toast'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Global providers wrapper for the application.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
