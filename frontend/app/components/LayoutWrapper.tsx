'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    // 管理者ページは独自のレイアウトを使用（Header/Footerなし）
    return <>{children}</>
  }

  // 通常ページはHeader/Footerを表示
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  )
}
