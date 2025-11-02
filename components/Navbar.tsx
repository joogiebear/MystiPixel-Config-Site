'use client'

import Link from 'next/link'
import { useState } from 'react'
import Button from './ui/Button'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[var(--surface)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">ConfigHub</span>
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

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
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
            <div className="px-3 py-2 space-y-2">
              <Button variant="ghost" size="sm" className="w-full">
                Sign In
              </Button>
              <Button variant="primary" size="sm" className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
