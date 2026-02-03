'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
}

function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-custom-blue text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-custom-blue text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  )
}

export function Header() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated' && !!session
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-custom-blue">RigLab</span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/builder">Builder</NavLink>
            <NavLink href="/configurator">Configurator</NavLink>
            {isLoggedIn ? (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <span className="text-sm text-gray-600">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <NavLink href="/signin">ログイン</NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <MobileNavLink href="/builder" onClick={closeMenu}>
              Builder
            </MobileNavLink>
            <MobileNavLink href="/configurator" onClick={closeMenu}>
              Configurator
            </MobileNavLink>
            {isLoggedIn ? (
              <>
                <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
                  {session?.user?.name || session?.user?.email}
                </div>
                <MobileNavLink href="/dashboard" onClick={closeMenu}>
                  Dashboard
                </MobileNavLink>
                <button
                  onClick={() => {
                    closeMenu()
                    signOut({ callbackUrl: '/' })
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <MobileNavLink href="/signin" onClick={closeMenu}>
                ログイン
              </MobileNavLink>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
