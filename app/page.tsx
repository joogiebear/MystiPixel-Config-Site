'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Config {
  id: string
  title: string
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
  downloadCount: number
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  configCount: number
}

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalConfigs: 0,
    totalUsers: 0,
    totalDownloads: 0,
    premiumCreators: 0
  })
  const [featuredConfigs, setFeaturedConfigs] = useState<Config[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch stats and featured configs
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
      .then(([statsData, categoriesData]) => {
        if (statsData.stats) setStats(statsData.stats)
        if (statsData.featuredConfigs) setFeaturedConfigs(statsData.featuredConfigs)
        if (categoriesData.categories) setCategories(categoriesData.categories)
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false))
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`
    return num.toString()
  }

  const displayStats = [
    { label: 'Total Configs', value: formatNumber(stats.totalConfigs) },
    { label: 'Active Users', value: formatNumber(stats.totalUsers) },
    { label: 'Downloads', value: formatNumber(stats.totalDownloads) },
    { label: 'Premium Creators', value: formatNumber(stats.premiumCreators) }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[var(--secondary)]/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6">
              Minecraft Config
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent"> Hub</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Discover, share, and monetize Minecraft configurations. From performance tweaks to complete modpack setups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button variant="primary" size="lg">
                  Browse Configs
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="outline" size="lg">
                  Upload Your Config
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {displayStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-2">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Configs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Featured Configs</h2>
          <Link href="/browse" className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading configs...</p>
          </div>
        ) : featuredConfigs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)] mb-4">No configs yet. Be the first to upload one!</p>
            <Link href="/upload">
              <Button variant="primary">Upload Config</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredConfigs.map((config) => (
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

                <div className="flex gap-2 mb-4">
                  <Badge variant="primary">{config.modLoader}</Badge>
                  <Badge variant="secondary">{config.mcVersion}</Badge>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                      <span>⭐ {config.averageRating > 0 ? config.averageRating.toFixed(1) : 'N/A'}</span>
                      <span>⬇️ {config.downloadCount.toLocaleString()}</span>
                    </div>
                    {config.isPremium && config.price && (
                      <span className="text-[var(--accent)] font-semibold">${config.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-[var(--surface)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Browse by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.slug}`}
                className="group"
              >
                <Card hover className="text-center h-full">
                  <div className="text-4xl mb-3">{category.icon || '📦'}</div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {category.configCount} configs
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Creators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border-[var(--primary)]/20">
          <div className="max-w-3xl mx-auto text-center py-8">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Become a Creator
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Share your configurations with thousands of players and earn 80% revenue share on premium configs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button variant="primary" size="lg">
                  Upload Your First Config
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg">
                  Learn About Premium
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
