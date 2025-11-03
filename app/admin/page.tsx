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
  _count: { configs: number }
}

interface GameMode {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  _count: { configs: number }
}

interface SupportedVersion {
  id: string
  version: string
  _count: { configs: number }
}

interface Tag {
  id: string
  name: string
  slug: string
  _count: { configs: number }
}

type TabType = 'categories' | 'game-modes' | 'versions' | 'tags'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('categories')

  const [categories, setCategories] = useState<Category[]>([])
  const [gameModes, setGameModes] = useState<GameMode[]>([])
  const [versions, setVersions] = useState<SupportedVersion[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    version: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAll()
    }
  }, [session])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([
      fetchCategories(),
      fetchGameModes(),
      fetchVersions(),
      fetchTags()
    ])
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.status === 403) { router.push('/dashboard'); return }
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchGameModes = async () => {
    try {
      const res = await fetch('/api/admin/game-modes')
      if (res.ok) {
        const data = await res.json()
        setGameModes(data.gameModes || [])
      }
    } catch (error) {
      console.error('Error fetching game modes:', error)
    }
  }

  const fetchVersions = async () => {
    try {
      const res = await fetch('/api/admin/supported-versions')
      if (res.ok) {
        const data = await res.json()
        setVersions(data.versions || [])
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    let url = ''
    let method = editingItem ? 'PATCH' : 'POST'
    let body: any = {}

    switch (activeTab) {
      case 'categories':
        url = editingItem ? `/api/admin/categories/${editingItem.id}` : '/api/admin/categories'
        body = { name: formData.name, slug: formData.slug, description: formData.description, icon: formData.icon }
        break
      case 'game-modes':
        url = editingItem ? `/api/admin/game-modes/${editingItem.id}` : '/api/admin/game-modes'
        body = { name: formData.name, slug: formData.slug, description: formData.description, icon: formData.icon }
        break
      case 'versions':
        url = '/api/admin/supported-versions'
        body = { version: formData.version }
        break
      case 'tags':
        url = editingItem ? `/api/admin/tags/${editingItem.id}` : '/api/admin/tags'
        body = { name: formData.name, slug: formData.slug }
        break
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(`${activeTab.replace('-', ' ')} ${editingItem ? 'updated' : 'created'} successfully!`)
        closeModal()
        fetchAll()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving:', error)
      setMessage('Error saving item')
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    if (activeTab === 'versions') {
      setFormData({ ...formData, version: item.version })
    } else {
      setFormData({
        name: item.name || '',
        slug: item.slug || '',
        description: item.description || '',
        icon: item.icon || '',
        version: ''
      })
    }
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    let url = ''
    switch (activeTab) {
      case 'categories': url = `/api/admin/categories/${id}`; break
      case 'game-modes': url = `/api/admin/game-modes/${id}`; break
      case 'versions': url = `/api/admin/supported-versions/${id}`; break
      case 'tags': url = `/api/admin/tags/${id}`; break
    }

    try {
      const res = await fetch(url, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        setMessage('Deleted successfully!')
        fetchAll()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      setMessage('Error deleting item')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({ name: '', slug: '', description: '', icon: '', version: '' })
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

  const renderItems = () => {
    let items: any[] = []
    switch (activeTab) {
      case 'categories': items = categories; break
      case 'game-modes': items = gameModes; break
      case 'versions': items = versions; break
      case 'tags': items = tags; break
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          No {activeTab.replace('-', ' ')} yet. Create one to get started!
        </div>
      )
    }

    return items.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between p-4 bg-[var(--surface-light)] rounded-lg"
      >
        <div className="flex items-center gap-4">
          {(activeTab === 'categories' || activeTab === 'game-modes') && (
            <div className="text-3xl">{item.icon || '📦'}</div>
          )}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              {item.name || item.version}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {activeTab === 'versions' ? (
                `${item._count.configs} configs`
              ) : (
                `Slug: ${item.slug} • ${item._count.configs} configs`
              )}
            </p>
            {item.description && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">{item.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab !== 'versions' && (
            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(item.id)}
            className="text-red-500"
          >
            Delete
          </Button>
        </div>
      </div>
    ))
  }

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

        {/* Tabs */}
        <div className="border-b border-[var(--border)] mb-8">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'categories', label: '📁 Categories' },
              { id: 'game-modes', label: '🎮 Game Modes' },
              { id: 'versions', label: '📦 Supported Versions' },
              { id: 'tags', label: '🏷️ Tags' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-3 px-1 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Add {activeTab === 'versions' ? 'Version' : activeTab.slice(0, -1).replace('-', ' ')}
            </Button>
          </div>

          <div className="space-y-3">
            {renderItems()}
          </div>
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'versions' ? 'Supported Version' : activeTab.slice(0, -1).replace('-', ' ')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'versions' ? (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Version *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                      placeholder="e.g., 1.21.9"
                    />
                  </div>
                ) : (
                  <>
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
                        placeholder={activeTab === 'tags' ? 'Optimization' : 'Performance'}
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
                        placeholder={activeTab === 'tags' ? 'optimization' : 'performance'}
                      />
                    </div>

                    {activeTab !== 'tags' && (
                      <>
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
                            placeholder="Description..."
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingItem ? 'Update' : 'Create'}
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
