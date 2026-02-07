'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/app/components/ui/Toast'
import type { Session } from 'next-auth'

interface ProvidersProps {
  children: ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
