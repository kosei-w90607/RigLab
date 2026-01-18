'use client'

import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Global providers wrapper for the application.
 * Add SessionProvider, ThemeProvider, etc. here as needed.
 */
export function Providers({ children }: ProvidersProps) {
  return <>{children}</>
}
