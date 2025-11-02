'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDistanceToNow } from 'date-fns'

interface ConfigData {
  id: string
  title: string
  description: string
  content: string
  imageUrl: string | null
  author: {
    id: string
    name: string
    image: string | null
    bio: string | null
    createdAt: string
    _count: {
      configs: number
    }
  }
  category: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  gameModes: Array<{
    id: string
    name: string
    slug: string
    icon: string | null
  }>
  minecraftVersions: Array<{
    id: string
    version: string
  }>
  modLoader: string
  isPremium: boolean
  price: number | null
  downloads: number
  views: number
  averageRating: number
  totalRatings: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  ratings: Array<{
    id: string
    rating: number
    review: string | null
    user: {
      id: string
      name: string
      image: string | null
    }
    createdAt: string
  }>
  comments: Array<{
    id: string
    content: string
    user: {
      id: string
      name: string
      image: string | null
    }
    createdAt: string
  }>
  downloadCount: number
  favoriteCount: number
  commentCount: number
  fileUrl: string | null
  createdAt: string
  updatedAt: string
}

export default function ConfigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  // Rating form state
  const [userRating, setUserRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [userExistingRating, setUserExistingRating] = useState<any>(null)

  // Fetch config data
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/configs/${params.id}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('Config not found')
          throw new Error('Failed to load config')
        }
        const data = await res.json()
        setConfig(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchConfig()
  }, [params.id])

  // Check if favorited
  useEffect(() => {
    if (!session || !params.id) return

    fetch(`/api/favorites/${params.id}`)
      .then(res => res.json())
      .then(data => setIsFavorited(data.isFavorited))
      .catch(err => console.error('Failed to check favorite:', err))
  }, [session, params.id])

  // Check if user can edit (is author or admin)
  useEffect(() => {
    if (!session || !config) return

    const checkEditPermission = async () => {
      // Check if user is the author
      if (config.author.id === session.user?.id) {
        setCanEdit(true)
        return
      }

      // Check if user is admin
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const userData = await res.json()
          if (userData.isAdmin) {
            setCanEdit(true)
          }
        }
      } catch (err) {
        console.error('Failed to check admin status:', err)
      }
    }

    checkEditPermission()
  }, [session, config])

  // Check if user has already rated this config
  useEffect(() => {
    if (!session || !config) return

    const checkExistingRating = async () => {
      try {
        const existingRating = config.ratings.find((r: any) => r.user.id === session.user?.id)
        if (existingRating) {
          setUserExistingRating(existingRating)
          setUserRating(existingRating.rating)
          setReviewText(existingRating.review || '')
        }
      } catch (err) {
        console.error('Failed to check existing rating:', err)
      }
    }

    checkExistingRating()
  }, [session, config])

  const handleDownload = async () => {
    if (!config) return

    setDownloading(true)
    try {
      const response = await fetch(`/api/configs/${config.id}/download`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Download failed')

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${config.title}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Refresh config to update download count
      const res = await fetch(`/api/configs/${config.id}`)
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (err) {
      alert('Failed to download config. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    try {
      if (isFavorited) {
        await fetch(`/api/favorites?configId=${params.id}`, {
          method: 'DELETE'
        })
        setIsFavorited(false)
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ configId: params.id })
        })
        setIsFavorited(true)
      }
    } catch (err) {
      alert('Failed to update favorites')
    }
  }

  const handleSubmitRating = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (userRating === 0) {
      alert('Please select a star rating')
      return
    }

    setSubmittingRating(true)

    try {
      const res = await fetch(`/api/configs/${params.id}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: userRating,
          review: reviewText.trim() || null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit rating')
      }

      // Refresh config to show updated rating
      const configRes = await fetch(`/api/configs/${params.id}`)
      if (configRes.ok) {
        const data = await configRes.json()
        setConfig(data)
        setUserExistingRating(data.ratings.find((r: any) => r.user.id === session.user?.id))
      }

      alert(userExistingRating ? 'Rating updated successfully!' : 'Rating submitted successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading config...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            {error === 'Config not found' ? '404' : 'Error'}
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">{error || 'Config not found'}</p>
          <Button onClick={() => router.push('/browse')}>Browse Configs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      {config.imageUrl && (
        <div className="w-full h-80 overflow-hidden relative">
          <img
            src={config.imageUrl}
            alt={config.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
                    {config.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    {config.author.image ? (
                      <img
                        src={config.author.image}
                        alt={config.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                    <div>
                      <p className="text-[var(--text-secondary)]">
                        by{' '}
                        <button
                          onClick={() => router.push(`/profile/${config.author.id}`)}
                          className="text-[var(--primary)] font-medium hover:underline"
                        >
                          {config.author.name}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                {config.isPremium && (
                  <Badge variant="accent" className="text-lg px-4 py-1">Premium</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary">{config.modLoader}</Badge>
                <Badge>{config.category.name}</Badge>
                {config.minecraftVersions && config.minecraftVersions.slice(0, 3).map((version) => (
                  <Badge key={version.id} variant="secondary">{version.version}</Badge>
                ))}
                {config.minecraftVersions && config.minecraftVersions.length > 3 && (
                  <Badge variant="secondary">+{config.minecraftVersions.length - 3} more</Badge>
                )}
                {config.gameModes && config.gameModes.slice(0, 2).map((mode) => (
                  <Badge key={mode.id} variant="accent">{mode.icon || ''} {mode.name}</Badge>
                ))}
                {config.gameModes && config.gameModes.length > 2 && (
                  <Badge variant="accent">+{config.gameModes.length - 2} more</Badge>
                )}
              </div>

              <div className="flex items-center gap-6 text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                  ⭐ {config.averageRating > 0 ? config.averageRating.toFixed(1) : 'N/A'} ({config.totalRatings} reviews)
                </span>
                <span>⬇️ {config.downloadCount.toLocaleString()} downloads</span>
                <span>👁️ {config.views.toLocaleString()} views</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--border)] mb-6">
              <div className="flex gap-6">
                {['overview', 'installation', 'changelog', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <Card>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Description</h2>
                    <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{config.description}</p>
                  </div>

                  {config.tags && config.tags.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {config.tags.map((tag) => (
                          <Badge key={tag.id}>{tag.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.gameModes && config.gameModes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Game Modes</h3>
                      <div className="flex flex-wrap gap-2">
                        {config.gameModes.map((mode) => (
                          <Badge key={mode.id} variant="accent">
                            {mode.icon && <span className="mr-1">{mode.icon}</span>}
                            {mode.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.minecraftVersions && config.minecraftVersions.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Supported Minecraft Versions</h3>
                      <div className="flex flex-wrap gap-2">
                        {config.minecraftVersions.map((version) => (
                          <Badge key={version.id} variant="secondary">{version.version}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Details</h3>
                    <div className="bg-[var(--surface-light)] p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Uploaded</span>
                        <span className="text-[var(--text-primary)]">
                          {formatDistanceToNow(new Date(config.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Last Updated</span>
                        <span className="text-[var(--text-primary)]">
                          {formatDistanceToNow(new Date(config.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Favorites</span>
                        <span className="text-[var(--text-primary)]">{config.favoriteCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'installation' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Installation Guide</h2>
                  <div className="bg-[var(--surface-light)] p-4 rounded-lg">
                    <ol className="list-decimal list-inside space-y-2 text-[var(--text-secondary)]">
                      <li>Download the config file using the button on the right</li>
                      <li>Navigate to your .minecraft folder</li>
                      <li>Extract the contents into the appropriate folder (usually /config)</li>
                      <li>Restart Minecraft</li>
                      <li>Enjoy your new configuration!</li>
                    </ol>
                  </div>
                  {config.content && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Additional Notes</h3>
                      <pre className="bg-[var(--surface-light)] p-4 rounded-lg text-[var(--text-secondary)] whitespace-pre-wrap text-sm">
                        {config.content}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'changelog' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Changelog</h2>
                  <div className="space-y-4">
                    <div className="border-l-2 border-[var(--primary)] pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary">Latest</Badge>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {formatDistanceToNow(new Date(config.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)]">
                        Current version - Supports {config.minecraftVersions && config.minecraftVersions.map(v => v.version).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Reviews</h2>

                    {/* Rating Submission Form */}
                    {session && (
                      <div className="mb-6 p-6 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                          {userExistingRating ? 'Update Your Review' : 'Write a Review'}
                        </h3>

                        {/* Star Rating Selector */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Your Rating *
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setUserRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-4xl transition-opacity hover:opacity-80 focus:outline-none cursor-pointer"
                                disabled={submittingRating}
                              >
                                {(hoverRating || userRating) >= star ? '⭐' : '☆'}
                              </button>
                            ))}
                            {userRating > 0 && (
                              <span className="ml-3 text-sm text-[var(--text-secondary)] self-center">
                                {userRating} {userRating === 1 ? 'star' : 'stars'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Review Text */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Review (Optional)
                          </label>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                            placeholder="Share your thoughts about this config..."
                            disabled={submittingRating}
                          />
                        </div>

                        {/* Submit Button */}
                        <Button
                          variant="primary"
                          onClick={handleSubmitRating}
                          disabled={submittingRating || userRating === 0}
                        >
                          {submittingRating ? 'Submitting...' : userExistingRating ? 'Update Review' : 'Submit Review'}
                        </Button>

                        {userExistingRating && (
                          <p className="mt-2 text-xs text-[var(--text-secondary)]">
                            You reviewed this config {formatDistanceToNow(new Date(userExistingRating.createdAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}

                    {!session && (
                      <div className="mb-6 p-4 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg text-center">
                        <p className="text-[var(--text-secondary)] mb-3">Sign in to leave a review</p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push('/auth/signin')}
                        >
                          Sign In
                        </Button>
                      </div>
                    )}

                    {/* Rating Distribution */}
                    {config.totalRatings > 0 && (
                      <div className="mb-6 p-4 bg-[var(--surface-light)] rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-[var(--text-primary)]">
                              {config.averageRating.toFixed(1)}
                            </div>
                            <div className="text-[var(--text-secondary)] text-sm">
                              out of 5
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            {[5, 4, 3, 2, 1].map((stars) => {
                              const count = config.ratingDistribution[stars as keyof typeof config.ratingDistribution] || 0
                              const percentage = config.totalRatings > 0 ? (count / config.totalRatings) * 100 : 0
                              return (
                                <div key={stars} className="flex items-center gap-2 text-sm">
                                  <span className="w-16 text-[var(--text-secondary)]">{stars} stars</span>
                                  <div className="flex-1 bg-[var(--surface)] rounded-full h-2">
                                    <div
                                      className="bg-[var(--accent)] h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="w-12 text-right text-[var(--text-secondary)]">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    {config.ratings.length === 0 ? (
                      <p className="text-center text-[var(--text-secondary)] py-8">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      config.ratings.map((rating) => (
                        <div key={rating.id} className="border-b border-[var(--border)] pb-4 mb-4 last:border-0">
                          <div className="flex items-start gap-3">
                            {rating.user.image ? (
                              <img
                                src={rating.user.image}
                                alt={rating.user.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <span className="text-2xl">👤</span>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-[var(--text-primary)]">
                                    {rating.user.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <span>{'⭐'.repeat(rating.rating)}</span>
                                    <span>•</span>
                                    <span>
                                      {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {rating.review && (
                                <p className="text-[var(--text-secondary)]">{rating.review}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <div className="space-y-4">
                {config.isPremium && config.price && (
                  <div className="text-center py-4 border-b border-[var(--border)]">
                    <div className="text-4xl font-bold text-[var(--accent)] mb-2">
                      ${config.price.toFixed(2)}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">One-time purchase</p>
                  </div>
                )}

                <Button
                  variant={config.isPremium ? 'accent' : 'primary'}
                  size="lg"
                  className="w-full"
                  onClick={handleDownload}
                  disabled={downloading || !config.fileUrl}
                >
                  {downloading ? 'Downloading...' : config.isPremium ? 'Purchase Config' : 'Download Free'}
                </Button>

                {canEdit && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push(`/config/${config.id}/edit`)}
                  >
                    ✏️ Edit Config
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleToggleFavorite}
                >
                  {isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </Button>

                <div className="pt-4 border-t border-[var(--border)] space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Category</span>
                    <span className="text-[var(--text-primary)] font-medium">{config.category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Mod Loader</span>
                    <span className="text-[var(--text-primary)] font-medium">{config.modLoader}</span>
                  </div>
                  {config.minecraftVersions && config.minecraftVersions.length > 0 && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[var(--text-secondary)]">MC Versions</span>
                        <span className="text-[var(--text-primary)] font-medium">{config.minecraftVersions.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {config.minecraftVersions.slice(0, 4).map((version) => (
                          <span key={version.id} className="text-xs bg-[var(--surface-light)] px-2 py-0.5 rounded">
                            {version.version}
                          </span>
                        ))}
                        {config.minecraftVersions.length > 4 && (
                          <span className="text-xs text-[var(--text-secondary)]">
                            +{config.minecraftVersions.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {config.gameModes && config.gameModes.length > 0 && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[var(--text-secondary)]">Game Modes</span>
                        <span className="text-[var(--text-primary)] font-medium">{config.gameModes.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {config.gameModes.map((mode) => (
                          <span key={mode.id} className="text-xs bg-[var(--surface-light)] px-2 py-0.5 rounded">
                            {mode.icon} {mode.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Downloads</span>
                    <span className="text-[var(--text-primary)] font-medium">{config.downloadCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Rating</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      ⭐ {config.averageRating > 0 ? config.averageRating.toFixed(1) : 'N/A'}/5
                    </span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">About the Author</h3>
                  <div className="flex items-center gap-3 mb-2">
                    {config.author.image ? (
                      <img
                        src={config.author.image}
                        alt={config.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{config.author.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {config.author._count.configs} configs
                      </p>
                    </div>
                  </div>
                  {config.author.bio && (
                    <p className="text-sm text-[var(--text-secondary)] mb-3">{config.author.bio}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/profile/${config.author.id}`)}
                  >
                    View Profile
                  </Button>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <Button variant="ghost" size="sm" className="w-full">
                    Report Issue
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
