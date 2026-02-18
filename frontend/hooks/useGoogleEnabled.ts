'use client'

import { useState, useEffect } from 'react'
import { getProviders } from 'next-auth/react'

export function useGoogleEnabled() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    getProviders().then((providers) => {
      setEnabled(!!providers?.google)
    })
  }, [])

  return enabled
}
