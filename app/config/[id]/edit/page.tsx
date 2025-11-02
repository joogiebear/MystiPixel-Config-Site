'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface GameMode {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface MinecraftVersion {
  id: string
  version: string
}

export default function EditConfigPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [modLoader, setModLoader] = useState('FORGE')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedGameModes, setSelectedGameModes] = useState<string[]>([])
  const [selectedMinecraftVersions, setSelectedMinecraftVersions] = useState<string[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [price, setPrice] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  // Available options
  const [categories, setCategories] = useState<Category[]>([])
  const [gameModes, setGameModes] = useState<GameMode[]>([])
  const [minecraftVersions, setMinecraftVersions] = useState<MinecraftVersion[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch config data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, categoriesRes, gameModesRes, versionsRes] = await Promise.all([
          fetch(`/api/configs/${params.id}`),
          fetch('/api/categories'),
          fetch('/api/game-modes'),
          fetch('/api/minecraft-versions')
        ])

        if (!configRes.ok) {
          if (configRes.status === 404) throw new Error('Config not found')
          throw new Error('Failed to load config')
        }

        const config = await configRes.json()
        const categoriesData = await categoriesRes.json()
        const gameModesData = await gameModesRes.json()
        const versionsData = await versionsRes.json()

        // Check authorization
        if (config.author.id !== session?.user?.id) {
          // Check if user is admin
          const userRes = await fetch('/api/user/profile')
          const userData = await userRes.json()
          if (!userData.isAdmin) {
            router.push(`/config/${params.id}`)
            return
          }
        }

        // Populate form
        setTitle(config.title)
        setDescription(config.description)
        setContent(config.content || '')
        setCategoryId(config.category.id)
        setModLoader(config.modLoader)
        setSelectedTags(config.tags ? config.tags.map((t: Tag) => t.name) : [])
        setSelectedGameModes(config.gameModes ? config.gameModes.map((gm: GameMode) => gm.id) : [])
        setSelectedMinecraftVersions(config.minecraftVersions ? config.minecraftVersions.map((v: MinecraftVersion) => v.id) : [])
        setIsPremium(config.isPremium)
        setPrice(config.price?.toString() || '')
        setExistingImageUrl(config.imageUrl)
        setImagePreview(config.imageUrl)

        // Set available options
        setCategories(categoriesData.categories || [])
        setGameModes(gameModesData.gameModes || [])
        setMinecraftVersions(versionsData.versions || [])

        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    if (session && params.id) {
      fetchData()
    }
  }, [session, params.id, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }

      setSelectedImage(file)
      setRemoveImage(false)
      setError(null)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setRemoveImage(true)
  }

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName))
    } else {
      setSelectedTags([...selectedTags, tagName])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      // Validation
      if (!title.trim()) throw new Error('Title is required')
      if (!description.trim()) throw new Error('Description is required')
      if (!categoryId) throw new Error('Please select a category')
      if (selectedMinecraftVersions.length === 0) throw new Error('Please select at least one Minecraft version')
      if (isPremium && (!price || parseFloat(price) < 0.99)) {
        throw new Error('Premium configs must have a price of at least $0.99')
      }

      // Prepare payload
      const payload = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        categoryId,
        modLoader,
        tags: selectedTags,
        gameModeIds: selectedGameModes,
        minecraftVersionIds: selectedMinecraftVersions,
        isPremium,
        price: isPremium ? parseFloat(price) : null,
        imageUrl: removeImage ? null : (imagePreview || existingImageUrl),
        fileUrl: undefined // Keep existing file
      }

      const res = await fetch(`/api/configs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update config')
      }

      // Redirect to config page
      router.push(`/config/${params.id}`)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Error</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <Button onClick={() => router.push('/browse')}>Browse Configs</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Edit Config</h1>
          <p className="text-[var(--text-secondary)]">Update your Minecraft configuration</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="e.g., Optimized Survival Settings"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                  placeholder="Describe your config..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Mod Loader *
                  </label>
                  <select
                    value={modLoader}
                    onChange={(e) => setModLoader(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    required
                  >
                    <option value="FORGE">Forge</option>
                    <option value="FABRIC">Fabric</option>
                    <option value="NEOFORGE">NeoForge</option>
                    <option value="QUILT">Quilt</option>
                    <option value="VANILLA">Vanilla</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Image Upload */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Preview Image</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Update the preview image for your config (Optional)
            </p>

            {imagePreview && !removeImage ? (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-[var(--text-secondary)] mb-2">Click to upload new image</p>
                  <p className="text-xs text-[var(--text-muted)]">PNG, JPG up to 5MB</p>
                </label>
              </div>
            )}
          </Card>

          {/* Minecraft Versions */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Minecraft Versions *</h2>
            <div className="flex flex-wrap gap-2">
              {minecraftVersions.map((version) => (
                <label
                  key={version.id}
                  className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${
                    selectedMinecraftVersions.includes(version.id)
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMinecraftVersions.includes(version.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMinecraftVersions([...selectedMinecraftVersions, version.id])
                      } else {
                        setSelectedMinecraftVersions(selectedMinecraftVersions.filter(id => id !== version.id))
                      }
                    }}
                    className="hidden"
                  />
                  {version.version}
                </label>
              ))}
            </div>
          </Card>

          {/* Game Modes */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Game Modes</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Select the game modes this config is designed for</p>
            <div className="flex flex-wrap gap-2">
              {gameModes.map((mode) => (
                <label
                  key={mode.id}
                  className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${
                    selectedGameModes.includes(mode.id)
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGameModes.includes(mode.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGameModes([...selectedGameModes, mode.id])
                      } else {
                        setSelectedGameModes(selectedGameModes.filter(id => id !== mode.id))
                      }
                    }}
                    className="hidden"
                  />
                  {mode.icon && <span className="mr-2">{mode.icon}</span>}
                  {mode.name}
                </label>
              ))}
            </div>
          </Card>

          {/* Tags */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Tags</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Add tags to help users find your config. Type and press Enter.
            </p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Type a tag and press Enter..."
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.currentTarget
                    const value = input.value.trim()
                    if (value && !selectedTags.includes(value)) {
                      setSelectedTags([...selectedTags, value])
                      input.value = ''
                    }
                  }
                }}
              />
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className="inline-block"
                  >
                    <Badge className="cursor-pointer hover:opacity-80">
                      {tag} ✕
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Additional Details */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Additional Details</h2>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Installation Notes / Additional Information
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                placeholder="Any special installation instructions or additional information..."
              />
            </div>
          </Card>

          {/* Premium Settings */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Premium Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-[var(--text-primary)]">Make this a premium config</span>
              </label>

              {isPremium && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="0.99"
                    required={isPremium}
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Minimum price: $0.99</p>
                </div>
              )}
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Updating...' : 'Update Config'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push(`/config/${params.id}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
