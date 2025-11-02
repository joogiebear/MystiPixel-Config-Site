'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch user's configs
  useEffect(() => {
    if (session?.user?.id) {
      fetchConfigs()
    }
  }, [session])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/configs?authorId=${session?.user?.id}`)
      const data = await response.json()
      setConfigs(data.configs || [])
    } catch (error) {
      console.error('Error fetching configs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!session) {
    return null
  }

  // User data from session
  const user = {
    name: session.user?.name || 'User',
    email: session.user?.email || '',
    totalConfigs: configs.length,
    totalDownloads: configs.reduce((sum, c) => sum + (c.downloads || 0), 0),
  }

  // Handle delete config
  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this config? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/configs/${configId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from local state
        setConfigs(configs.filter(c => c.id !== configId))
      } else {
        alert('Failed to delete config. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting config:', error)
      alert('Failed to delete config. Please try again.')
    }
  }

  // Handle edit config
  const handleEdit = (configId: string) => {
    router.push(`/config/${configId}/edit`)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
            <p className="text-[var(--text-secondary)]">Welcome back, {user.name}!</p>
          </div>
          <Button variant="primary" onClick={() => router.push('/upload')}>
            Upload New Config
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border)] mb-8">
          <div className="flex gap-6">
            {['overview', 'my-configs', 'analytics', 'earnings', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Total Configs</div>
                <div className="text-3xl font-bold text-[var(--primary)]">{user.totalConfigs}</div>
              </Card>
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Total Downloads</div>
                <div className="text-3xl font-bold text-[var(--primary)]">{user.totalDownloads.toLocaleString()}</div>
              </Card>
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Total Views</div>
                <div className="text-3xl font-bold text-[var(--primary)]">{configs.reduce((sum, c) => sum + (c.views || 0), 0).toLocaleString()}</div>
              </Card>
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Avg Rating</div>
                <div className="text-3xl font-bold text-[var(--primary)]">
                  {configs.length > 0 ? (configs.reduce((sum, c) => sum + (c.averageRating || 0), 0) / configs.length).toFixed(1) : '0.0'}
                </div>
              </Card>
            </div>

            {/* Getting Started / Empty State */}
            {configs.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome to MystiPixel!</h2>
                  <p className="text-[var(--text-secondary)] mb-6">
                    You haven't uploaded any configs yet. Get started by uploading your first Minecraft configuration!
                  </p>
                  <Button variant="primary" onClick={() => router.push('/upload')}>
                    Upload Your First Config
                  </Button>
                </div>
              </Card>
            ) : (
              <Card>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Your Configs</h2>
                <div className="space-y-3">
                  {configs.slice(0, 5).map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-3 bg-[var(--surface-light)] rounded-lg">
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{config.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {config.downloads || 0} downloads • {config.views || 0} views
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/config/${config.id}`)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
                {configs.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="ghost" onClick={() => setActiveTab('my-configs')}>
                      View All {configs.length} Configs
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* My Configs Tab */}
        {activeTab === 'my-configs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Configs</h2>
              <Button variant="primary" onClick={() => router.push('/upload')}>Upload New Config</Button>
            </div>

            {loading ? (
              <Card>
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
                  <p className="mt-4 text-[var(--text-secondary)]">Loading your configs...</p>
                </div>
              </Card>
            ) : configs.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No configs yet</h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Upload your first Minecraft configuration to get started!
                  </p>
                  <Button variant="primary" onClick={() => router.push('/upload')}>
                    Upload Config
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                <Card key={config.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                        {config.title}
                      </h3>
                      {config.isPremium && <Badge variant="accent">Premium ${config.price}</Badge>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-secondary)]">Downloads: </span>
                        <span className="text-[var(--text-primary)] font-medium">{(config.downloads || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">Views: </span>
                        <span className="text-[var(--text-primary)] font-medium">{(config.views || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">Comments: </span>
                        <span className="text-[var(--text-primary)] font-medium">{config.commentCount || 0}</span>
                      </div>
                      {config.averageRating > 0 && (
                        <div>
                          <span className="text-[var(--text-secondary)]">Rating: </span>
                          <span className="text-[var(--text-primary)] font-medium">⭐ {config.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(config.id)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(config.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h2>
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <div className="text-6xl mb-4">📊</div>
              <p>Detailed analytics coming soon!</p>
              <p className="text-sm mt-2">Track views, conversions, and user engagement</p>
            </div>
          </Card>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Earnings</h2>
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <div className="text-6xl mb-4">💰</div>
              <p className="mb-2">Premium features coming soon!</p>
              <p className="text-sm">Upload premium configs and start earning from your creations</p>
            </div>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Profile Settings</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                    placeholder="Tell the community about yourself..."
                  />
                </div>
                <Button variant="primary">Save Changes</Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payment Settings</h2>
              <div className="space-y-4 max-w-2xl">
                <p className="text-[var(--text-secondary)]">Configure your payment method to receive earnings</p>
                <Button variant="outline">Connect PayPal</Button>
                <Button variant="outline">Connect Stripe</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
