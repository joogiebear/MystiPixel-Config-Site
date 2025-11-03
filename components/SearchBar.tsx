'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  configs: Array<{
    id: string
    title: string
    description: string
    category: { name: string }
    downloadCount: number
  }>
  tags: Array<{
    id: string
    name: string
    slug: string
    _count: { configs: number }
  }>
  users: Array<{
    id: string
    name: string
    image: string | null
    _count: { configs: number }
  }>
}

export default function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults(null)
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/browse?search=${encodeURIComponent(query)}`)
      setShowResults(false)
    }
  }

  const hasResults = results && (
    results.configs.length > 0 ||
    results.tags.length > 0 ||
    results.users.length > 0
  )

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results) setShowResults(true)
            }}
            placeholder="Search configs, tags, or authors..."
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Configs */}
          {results.configs.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-[var(--text-secondary)] px-2 py-1">CONFIGS</div>
              {results.configs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => {
                    router.push(`/config/${config.id}`)
                    setShowResults(false)
                    setQuery('')
                  }}
                  className="w-full text-left px-2 py-2 hover:bg-[var(--surface-light)] rounded flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--text-primary)] truncate">{config.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">{config.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-muted)]">{config.category.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">• {config.downloadCount} downloads</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <div className="p-2 border-t border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text-secondary)] px-2 py-1">TAGS</div>
              <div className="flex flex-wrap gap-2 px-2">
                {results.tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      router.push(`/browse?tags=${tag.slug}`)
                      setShowResults(false)
                      setQuery('')
                    }}
                    className="px-3 py-1 bg-[var(--surface-light)] hover:bg-[var(--primary)] hover:text-white rounded-full text-sm text-[var(--text-primary)] transition-colors"
                  >
                    {tag.name} <span className="text-xs opacity-70">({tag._count.configs})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <div className="p-2 border-t border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text-secondary)] px-2 py-1">AUTHORS</div>
              {results.users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    router.push(`/profile/${user.id}`)
                    setShowResults(false)
                    setQuery('')
                  }}
                  className="w-full text-left px-2 py-2 hover:bg-[var(--surface-light)] rounded flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text-primary)]">{user.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{user._count.configs} configs</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* View All Results */}
          <div className="p-2 border-t border-[var(--border)]">
            <button
              onClick={() => {
                router.push(`/browse?search=${encodeURIComponent(query)}`)
                setShowResults(false)
              }}
              className="w-full text-center py-2 text-sm text-[var(--primary)] hover:underline"
            >
              View all results for "{query}"
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && !loading && results && !hasResults && debouncedQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-4 text-center z-50">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-[var(--text-secondary)]">No results found for "{debouncedQuery}"</p>
        </div>
      )}
    </div>
  )
}
