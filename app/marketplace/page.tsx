'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface PremiumConfig {
  id: string
  title: string
  author: {
    id: string
    name: string
  }
  price: number
  downloads: number
  averageRating: number
  category: {
    name: string
  }
}

interface MarketplaceStats {
  totalPremiumCreators: number
  totalCreatorEarnings: number
  totalPremiumSales: number
  averagePremiumRating: number
}

export default function MarketplacePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('featured')
  const [premiumConfigs, setPremiumConfigs] = useState<PremiumConfig[]>([])
  const [stats, setStats] = useState<MarketplaceStats>({
    totalPremiumCreators: 0,
    totalCreatorEarnings: 0,
    totalPremiumSales: 0,
    averagePremiumRating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        // Fetch premium configs
        const configRes = await fetch('/api/configs?isPremium=true&limit=10&sort=popular')
        const configData = await configRes.json()
        setPremiumConfigs(configData.configs || [])

        // Fetch marketplace stats
        const statsRes = await fetch('/api/stats')
        const statsData = await statsRes.json()
        if (statsData.stats) {
          setStats({
            totalPremiumCreators: statsData.stats.premiumCreators || 0,
            totalCreatorEarnings: statsData.stats.totalEarnings || 0,
            totalPremiumSales: statsData.stats.totalPremiumDownloads || 0,
            averagePremiumRating: statsData.stats.averagePremiumRating || 0
          })
        }
      } catch (error) {
        console.error('Error fetching marketplace data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketplaceData()
  }, [])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Premium Marketplace
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Discover premium configs from top creators and start earning from your work
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <div className="text-3xl mb-2">💎</div>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">
              {loading ? '...' : stats.totalPremiumCreators || '0'}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Premium Creators</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">
              {loading ? '...' : `$${(stats.totalCreatorEarnings || 0).toLocaleString()}`}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Creator Earnings</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">🛒</div>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">
              {loading ? '...' : (stats.totalPremiumSales || 0).toLocaleString()}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Premium Sales</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">
              {loading ? '...' : (stats.averagePremiumRating || 0).toFixed(1)}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Average Rating</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border)] mb-8">
          <div className="flex gap-6">
            {['featured', 'top-selling', 'new-releases'].map((tab) => (
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Premium Configs */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Premium Configs</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                <p className="text-[var(--text-secondary)]">Loading premium configs...</p>
              </div>
            ) : premiumConfigs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💎</div>
                <p className="text-[var(--text-secondary)] mb-4">No premium configs yet</p>
                <p className="text-sm text-[var(--text-muted)]">Be the first to create a premium config!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {premiumConfigs.map((config) => (
                  <Card
                    key={config.id}
                    hover
                    className="flex items-start gap-6 cursor-pointer"
                    onClick={() => router.push(`/config/${config.id}`)}
                  >
                    <div className="text-6xl">💎</div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                            {config.title}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">by {config.author.name}</p>
                        </div>
                        <Badge variant="accent" className="text-lg px-3 py-1">
                          ${config.price?.toFixed(2)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-4">
                        <span>⭐ {config.averageRating > 0 ? config.averageRating.toFixed(1) : 'N/A'}</span>
                        <span>•</span>
                        <span>{config.downloads} downloads</span>
                        <span>•</span>
                        <span>{config.category.name}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-[var(--text-secondary)]">Total Revenue: </span>
                          <span className="text-[var(--accent)] font-semibold">
                            ${((config.price || 0) * config.downloads).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/config/${config.id}`)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Become a Creator */}
            <Card className="mb-6 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border-[var(--primary)]/30">
              <div className="text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Become a Creator
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Start earning from your Minecraft configurations
                </p>
                <Button variant="primary" size="lg" className="w-full mb-2">
                  Start Selling
                </Button>
                <ul className="text-xs text-left text-[var(--text-secondary)] space-y-1 mt-4">
                  <li>✓ Keep 80% of all sales</li>
                  <li>✓ No upfront costs</li>
                  <li>✓ Built-in payment processing</li>
                  <li>✓ Analytics dashboard</li>
                </ul>
              </div>
            </Card>

            {/* Top Creators */}
            <Card>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Top Creators</h3>

              <div className="text-center py-8 text-[var(--text-secondary)]">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm">Leaderboard coming soon!</p>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Banner */}
        <Card className="mt-12 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 border-[var(--accent)]/30">
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Ready to Monetize Your Skills?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
              Join hundreds of creators earning passive income from their Minecraft configurations.
              Upload once, earn forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg">
                Start Earning Today
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
