'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Config {
  id: string
  title: string
  description: string
  author: {
    id: string
    name: string
    image: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
  modLoader: string
  mcVersion: string
  isPremium: boolean
  price: number | null
  downloads: number
  averageRating: number
  totalRatings: number
  downloadCount: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function BrowsePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModLoader, setSelectedModLoader] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)

  const [configs, setConfigs] = useState<Config[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  // Fetch configs
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy
      })

      if (searchQuery) params.append('search', searchQuery)
      if (selectedModLoader !== 'all') params.append('modLoader', selectedModLoader.toUpperCase())
      if (selectedCategory !== 'all') params.append('category', selectedCategory)

      try {
        const res = await fetch(`/api/configs?${params}`)
        if (!res.ok) throw new Error('Failed to fetch configs')

        const data = await res.json()
        setConfigs(data.configs)
        setPagination(data.pagination)
      } catch (err) {
        setError('Failed to load configs. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(() => {
      fetchConfigs()
    }, searchQuery ? 500 : 0)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedModLoader, selectedCategory, sortBy, currentPage])

  const modLoaders = ['All', 'Forge', 'Fabric', 'NeoForge', 'Quilt', 'Vanilla']

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Browse Configs</h1>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search configs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 pl-10 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Mod Loader Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Mod Loader
              </label>
              <select
                value={selectedModLoader}
                onChange={(e) => {
                  setSelectedModLoader(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              >
                {modLoaders.map((loader) => (
                  <option key={loader} value={loader.toLowerCase()}>
                    {loader}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloads</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-[var(--text-secondary)]">
          {loading ? (
            'Loading...'
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            `Showing ${configs.length} of ${pagination?.total || 0} configs`
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
              <p className="text-[var(--text-secondary)]">Loading configs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && configs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)] text-lg mb-2">No configs found</p>
            <p className="text-[var(--text-muted)]">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Config Grid */}
        {!loading && !error && configs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map((config) => (
              <Card
                key={config.id}
                hover
                className="flex flex-col cursor-pointer"
                onClick={() => router.push(`/config/${config.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                      {config.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">by {config.author.name}</p>
                  </div>
                  {config.isPremium && (
                    <Badge variant="accent">Premium</Badge>
                  )}
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                  {config.description}
                </p>

                <div className="flex gap-2 mb-4">
                  <Badge variant="primary">{config.modLoader}</Badge>
                  <Badge variant="secondary">{config.mcVersion}</Badge>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                      <span>⭐ {config.averageRating > 0 ? config.averageRating.toFixed(1) : 'N/A'}</span>
                      <span>⬇️ {config.downloadCount.toLocaleString()}</span>
                    </div>
                    {config.isPremium && config.price && (
                      <span className="text-[var(--accent)] font-semibold">${config.price.toFixed(2)}</span>
                    )}
                  </div>
                  <Button
                    variant={config.isPremium ? 'accent' : 'primary'}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/config/${config.id}`)
                    }}
                  >
                    {config.isPremium ? 'Purchase' : 'View Details'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number
              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
