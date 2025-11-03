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
  imageUrl: string | null
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
  supportedSoftware: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
  isPremium: boolean
  price: number | null
  downloads: number
  averageRating: number
  totalRatings: number
  downloadCount: number
  tags: Array<{ id: string; name: string; slug: string }>
  gameModes: Array<{ id: string; name: string; slug: string; icon: string | null }>
  supportedVersions: Array<{ id: string; version: string }>
}

interface Tag {
  id: string
  name: string
  slug: string
  usageCount?: number
}

interface GameMode {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface SupportedVersion {
  id: string
  version: string
}

interface SupportedSoftware {
  id: string
  name: string
  slug: string
  icon: string | null
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
  const [selectedSupportedSoftware, setSelectedSupportedSoftware] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [configs, setConfigs] = useState<Config[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [gameModes, setGameModes] = useState<GameMode[]>([])
  const [supportedVersions, setSupportedVersions] = useState<SupportedVersion[]>([])
  const [supportedSoftwareList, setSupportedSoftwareList] = useState<SupportedSoftware[]>([])

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedGameModes, setSelectedGameModes] = useState<string[]>([])
  const [selectedSupportedVersions, setSelectedSupportedVersions] = useState<string[]>([])

  // Fetch categories, tags, game modes, supported versions, and supported software
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/tags').then(res => res.json()),
      fetch('/api/game-modes').then(res => res.json()),
      fetch('/api/supported-versions').then(res => res.json()),
      fetch('/api/supported-software').then(res => res.json())
    ])
      .then(([categoriesData, tagsData, gameModesData, versionsData, softwareData]) => {
        setCategories(categoriesData.categories || [])
        setTags(tagsData.tags || [])
        setGameModes(gameModesData.gameModes || [])
        setSupportedVersions(versionsData.versions || [])
        setSupportedSoftwareList(softwareData.supportedSoftware || [])
      })
      .catch(err => console.error('Failed to load data:', err))
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
      if (selectedSupportedSoftware !== 'all') params.append('supportedSoftware', selectedSupportedSoftware)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))
      if (selectedGameModes.length > 0) params.append('gameModes', selectedGameModes.join(','))
      if (selectedSupportedVersions.length > 0) params.append('supportedVersions', selectedSupportedVersions.join(','))

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
  }, [searchQuery, selectedSupportedSoftware, selectedCategory, sortBy, currentPage, selectedTags, selectedGameModes, selectedSupportedVersions])

  // Get top 10 popular tags
  const popularTags = tags.slice(0, 10).filter(tag => tag.usageCount && tag.usageCount > 0)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Browse Configs</h1>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mb-8 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">🔥 Popular Tags</h2>
              <p className="text-sm text-[var(--text-secondary)]">Click to filter</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, index) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (selectedTags.includes(tag.slug)) {
                      setSelectedTags(selectedTags.filter(slug => slug !== tag.slug))
                    } else {
                      setSelectedTags([...selectedTags, tag.slug])
                      setShowAdvancedFilters(true)
                    }
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    selectedTags.includes(tag.slug)
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                      : 'bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]'
                  }`}
                >
                  {index === 0 && '👑'} {tag.name}
                  <span className={`ml-2 text-xs ${selectedTags.includes(tag.slug) ? 'opacity-80' : 'opacity-60'}`}>
                    {tag.usageCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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

          {/* Basic Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Supported Software Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Supported Software
              </label>
              <select
                value={selectedSupportedSoftware}
                onChange={(e) => {
                  setSelectedSupportedSoftware(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="all">All</option>
                {supportedSoftwareList.map((software) => (
                  <option key={software.id} value={software.slug}>
                    {software.icon && `${software.icon} `}{software.name}
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

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-2"
          >
            {showAdvancedFilters ? '▼' : '▶'} Advanced Filters
            {(selectedTags.length > 0 || selectedGameModes.length > 0 || selectedSupportedVersions.length > 0) && (
              <Badge variant="primary" className="ml-1">
                {selectedTags.length + selectedGameModes.length + selectedSupportedVersions.length}
              </Badge>
            )}
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="space-y-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
              {/* Supported Versions */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                  Supported Versions
                </label>
                <div className="flex flex-wrap gap-2">
                  {supportedVersions.map((version) => (
                    <label
                      key={version.id}
                      className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                        selectedSupportedVersions.includes(version.id)
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSupportedVersions.includes(version.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSupportedVersions([...selectedSupportedVersions, version.id])
                          } else {
                            setSelectedSupportedVersions(selectedSupportedVersions.filter(id => id !== version.id))
                          }
                          setCurrentPage(1)
                        }}
                        className="hidden"
                      />
                      {version.version}
                    </label>
                  ))}
                </div>
              </div>

              {/* Game Modes */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                  Game Modes
                </label>
                <div className="flex flex-wrap gap-2">
                  {gameModes.map((mode) => (
                    <label
                      key={mode.id}
                      className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all flex items-center gap-1.5 ${
                        selectedGameModes.includes(mode.slug)
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGameModes.includes(mode.slug)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGameModes([...selectedGameModes, mode.slug])
                          } else {
                            setSelectedGameModes(selectedGameModes.filter(slug => slug !== mode.slug))
                          }
                          setCurrentPage(1)
                        }}
                        className="hidden"
                      />
                      {mode.icon && <span>{mode.icon}</span>}
                      {mode.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                  Tags (sorted by popularity)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                        selectedTags.includes(tag.slug)
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.slug)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.slug])
                          } else {
                            setSelectedTags(selectedTags.filter(slug => slug !== tag.slug))
                          }
                          setCurrentPage(1)
                        }}
                        className="hidden"
                      />
                      {tag.name}
                      {tag.usageCount !== undefined && tag.usageCount > 0 && (
                        <span className={`ml-1.5 text-xs ${selectedTags.includes(tag.slug) ? 'opacity-80' : 'opacity-60'}`}>
                          ({tag.usageCount})
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedTags.length > 0 || selectedGameModes.length > 0 || selectedSupportedVersions.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTags([])
                    setSelectedGameModes([])
                    setSelectedSupportedVersions([])
                    setCurrentPage(1)
                  }}
                >
                  Clear Advanced Filters
                </Button>
              )}
            </div>
          )}
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
                className="flex flex-col cursor-pointer overflow-hidden"
                onClick={() => router.push(`/config/${config.id}`)}
              >
                {/* Config Image */}
                {config.imageUrl ? (
                  <div className="w-full h-48 mb-4 -mt-6 -mx-6 overflow-hidden">
                    <img
                      src={config.imageUrl}
                      alt={config.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 mb-4 -mt-6 -mx-6 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 flex items-center justify-center">
                    <span className="text-6xl opacity-30">🖼️</span>
                  </div>
                )}

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

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary">{config.supportedSoftware.icon && `${config.supportedSoftware.icon} `}{config.supportedSoftware.name}</Badge>
                  {config.supportedVersions && config.supportedVersions.slice(0, 2).map((version) => (
                    <Badge key={version.id} variant="secondary">{version.version}</Badge>
                  ))}
                  {config.supportedVersions && config.supportedVersions.length > 2 && (
                    <Badge variant="secondary">+{config.supportedVersions.length - 2}</Badge>
                  )}
                  {config.gameModes && config.gameModes.slice(0, 2).map((mode) => (
                    <Badge key={mode.id} variant="accent">{mode.icon || ''} {mode.name}</Badge>
                  ))}
                  {config.gameModes && config.gameModes.length > 2 && (
                    <Badge variant="accent">+{config.gameModes.length - 2}</Badge>
                  )}
                </div>

                {config.tags && config.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {config.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="text-xs px-2 py-1 bg-[var(--surface-light)] text-[var(--text-secondary)] rounded">
                        {tag.name}
                      </span>
                    ))}
                    {config.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-[var(--surface-light)] text-[var(--text-secondary)] rounded">
                        +{config.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

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
