'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('featured')

  const premiumConfigs = [
    {
      id: 1,
      title: 'Ultimate Performance Pack',
      author: 'ConfigMaster',
      price: 4.99,
      sales: 1250,
      rating: 4.9,
      revenue: 6250,
      thumbnail: '⚡',
      category: 'Performance'
    },
    {
      id: 2,
      title: 'PvP Pro Settings',
      author: 'CompetitiveGamer',
      price: 2.99,
      sales: 980,
      rating: 4.7,
      revenue: 2930,
      thumbnail: '⚔️',
      category: 'PvP'
    },
    {
      id: 3,
      title: 'Modpack Builder Base',
      author: 'PackCreator',
      price: 5.99,
      sales: 730,
      rating: 4.6,
      revenue: 4372,
      thumbnail: '📦',
      category: 'Modpacks'
    }
  ]

  const topCreators = [
    { name: 'ConfigMaster', earnings: '$12,450', sales: 2480, rank: 1 },
    { name: 'ServerPro', earnings: '$8,920', sales: 1784, rank: 2 },
    { name: 'PackCreator', earnings: '$6,340', sales: 1268, rank: 3 },
    { name: 'BudgetGamer', earnings: '$5,120', sales: 1024, rank: 4 }
  ]

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
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">850+</div>
            <div className="text-sm text-[var(--text-secondary)]">Premium Creators</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">$125K</div>
            <div className="text-sm text-[var(--text-secondary)]">Creator Earnings</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">🛒</div>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">45K+</div>
            <div className="text-sm text-[var(--text-secondary)]">Premium Sales</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">4.8</div>
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

            <div className="space-y-4">
              {premiumConfigs.map((config) => (
                <Card key={config.id} hover className="flex items-start gap-6">
                  <div className="text-6xl">{config.thumbnail}</div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                          {config.title}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">by {config.author}</p>
                      </div>
                      <Badge variant="accent" className="text-lg px-3 py-1">
                        ${config.price}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-4">
                      <span>⭐ {config.rating}</span>
                      <span>•</span>
                      <span>{config.sales} sales</span>
                      <span>•</span>
                      <span>{config.category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-[var(--text-secondary)]">Total Revenue: </span>
                        <span className="text-[var(--accent)] font-semibold">${config.revenue.toLocaleString()}</span>
                      </div>
                      <Button variant="primary" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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

              <div className="space-y-3">
                {topCreators.map((creator) => (
                  <div
                    key={creator.name}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold text-sm">
                        {creator.rank}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{creator.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{creator.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-[var(--accent)] font-semibold">
                      {creator.earnings}
                    </div>
                  </div>
                ))}
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
