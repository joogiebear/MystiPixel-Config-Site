'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  configCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Browse Categories
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Find the perfect Minecraft configuration for your needs
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
              <p className="text-[var(--text-secondary)]">Loading categories...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Categories Yet</h2>
            <p className="text-[var(--text-secondary)]">Check back soon for organized config categories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.slug}`}
                className="group"
              >
                <Card hover className="text-center h-full flex flex-col">
                  {/* Icon */}
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {category.icon || '📦'}
                  </div>

                  {/* Category Name */}
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                    {category.name}
                  </h3>

                  {/* Description */}
                  {category.description && (
                    <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">
                      {category.description}
                    </p>
                  )}

                  {/* Config Count */}
                  <div className="mt-auto pt-4 border-t border-[var(--border)]">
                    <p className="text-sm font-medium text-[var(--primary)]">
                      {category.configCount} {category.configCount === 1 ? 'config' : 'configs'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {!loading && categories.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border-[var(--primary)]/20">
              <div className="py-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  Can't find what you're looking for?
                </h2>
                <p className="text-[var(--text-secondary)] mb-6">
                  Browse all configs or create your own!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/browse">
                    <button className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg transition-all">
                      Browse All Configs
                    </button>
                  </Link>
                  <Link href="/upload">
                    <button className="px-6 py-3 border-2 border-[var(--border-light)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-secondary)] font-medium rounded-lg transition-all">
                      Upload Your Own
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
