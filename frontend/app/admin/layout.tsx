'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Skeleton } from '@/app/components/ui/Skeleton'

// サイドバーナビゲーション項目
const navItems = [
  {
    href: '/admin',
    label: 'ダッシュボード',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/parts',
    label: 'パーツ管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    href: '/admin/presets',
    label: 'プリセット管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'ユーザー管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
]

function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  // ページ遷移時にモバイルサイドバーを閉じる
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  return (
    <>
      {/* モバイルオーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:min-h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">管理者メニュー</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white lg:hidden"
              aria-label="メニューを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

function AdminHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="text-gray-600 hover:text-gray-900 lg:hidden"
            aria-label="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-600 hidden sm:inline">
            {session?.user?.name || session?.user?.email}
          </span>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            サイトに戻る
          </Link>
        </div>
      </div>
    </header>
  )
}

function LoadingSkeleton() {
  return (
    <div className="lg:flex min-h-screen">
      <div className="hidden lg:block w-64 bg-gray-800">
        <div className="p-4">
          <Skeleton className="h-8 w-32 mb-6 bg-gray-700" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-gray-700" />
            <Skeleton className="h-12 w-full bg-gray-700" />
            <Skeleton className="h-12 w-full bg-gray-700" />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="p-4 sm:p-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

function AccessDenied() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <svg
          className="w-16 h-16 mx-auto text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          アクセス権限がありません
        </h2>
        <p className="text-gray-600 mb-6">
          このページは管理者のみアクセスできます。
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          トップページに戻る
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), [])

  useEffect(() => {
    // 未ログインの場合はサインインページにリダイレクト
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/admin')
    }
  }, [status, router])

  // ローディング中
  if (status === 'loading') {
    return <LoadingSkeleton />
  }

  // 未ログイン
  if (status === 'unauthenticated') {
    return <LoadingSkeleton />
  }

  // 管理者でない場合
  if (session?.user?.role !== 'admin') {
    return <AccessDenied />
  }

  // 管理者の場合
  return (
    <div data-theme="light" className="lg:flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuToggle={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
