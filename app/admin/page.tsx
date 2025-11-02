'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  _count: {
    configs: number
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: ''
  })
  const [message, setMessage] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch categories
  useEffect(() => {
    if (session) {
      fetchCategories()
    }
  }, [session])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.status === 403) {
        router.push('/dashboard')
        return
      }
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setMessage('Error loading categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'

      const response = await fetch(url, {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Category ${editingCategory ? 'updated' : 'created'} successfully!`)
        setShowAddModal(false)
        setEditingCategory(null)
        setFormData({ name: '', slug: '', description: '', icon: '' })
        fetchCategories()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.error || 'Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setMessage('Error saving category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Category deleted successfully!')
        fetchCategories()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      setMessage('Error deleting category')
    }
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', icon: '' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">
            ⚙️ Admin Dashboard
          </h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {message}
          </div>
        )}

        {/* Category Management */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h2>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add Category
            </Button>
          </div>

          <div className="space-y-3">
            {categories.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                No categories yet. Create one to get started!
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-[var(--surface-light)] rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{category.icon || '📦'}</div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{category.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Slug: {category.slug} • {category._count.configs} configs
                      </p>
                      {category.description && (
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-500"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="Performance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Slug * (URL-friendly)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="performance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Icon (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="⚡"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                    placeholder="Performance optimization configs..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
