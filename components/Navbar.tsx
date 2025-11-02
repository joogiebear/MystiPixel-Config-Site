'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Button from './ui/Button'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <nav className="sticky top-0 z-50 bg-[var(--surface)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">MystiPixel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
              Browse
            </Link>
            <Link href="/categories" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
              Categories
            </Link>
            <Link href="/marketplace" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
              Marketplace
            </Link>
            <Link href="/docs" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
              Docs
            </Link>
          </div>

          {/* Right side - Auth buttons or User menu */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-[var(--surface-light)] animate-pulse"></div>
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 focus:outline-none hover:opacity-80 transition-opacity"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="text-[var(--text-primary)] font-medium">{session.user?.name || 'User'}</span>
                  <svg className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl py-2 z-50">
                    <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-light)] transition-colors">
                      📊 Dashboard
                    </Link>
                    <Link href={`/profile/${session.user?.id}`} onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-light)] transition-colors">
                      👤 My Profile
                    </Link>
                    <Link href="/upload" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-light)] transition-colors">
                      ⬆️ Upload Config
                    </Link>
                    <div className="border-t border-[var(--border)] my-2"></div>
                    <Link href="/dashboard?tab=settings" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-light)] transition-colors">
                      ⚙️ Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="w-full text-left px-4 py-2 text-[var(--error)] hover:bg-[var(--surface-light)] transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/browse" className="block px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-light)] rounded-md">
              Browse
            </Link>
            <Link href="/categories" className="block px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-light)] rounded-md">
              Categories
            </Link>
            <Link href="/marketplace" className="block px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-light)] rounded-md">
              Marketplace
            </Link>
            <Link href="/docs" className="block px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-light)] rounded-md">
              Docs
            </Link>

            {session ? (
              <div className="px-3 py-2 space-y-2 border-t border-[var(--border)] mt-2 pt-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-medium overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{session.user?.name || 'User'}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{session.user?.email}</div>
                  </div>
                </div>
                <Link href="/dashboard" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    📊 Dashboard
                  </Button>
                </Link>
                <Link href={`/profile/${session.user?.id}`} className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    👤 My Profile
                  </Button>
                </Link>
                <Link href="/upload" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    ⬆️ Upload Config
                  </Button>
                </Link>
                <Link href="/dashboard?tab=settings" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    ⚙️ Settings
                  </Button>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full"
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start text-[var(--error)]">
                    🚪 Sign Out
                  </Button>
                </button>
              </div>
            ) : (
              <div className="px-3 py-2 space-y-2">
                <Link href="/auth/signin" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
