'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  usageCount?: number
}

interface GameMode {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

interface MinecraftVersion {
  id: string
  version: string
}

export default function UploadPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [gameModes, setGameModes] = useState<GameMode[]>([])
  const [minecraftVersions, setMinecraftVersions] = useState<MinecraftVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    modLoader: '',
    isPremium: false,
    price: '',
    content: '', // Additional notes/installation instructions
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([]) // Array of tag names
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [selectedGameModeIds, setSelectedGameModeIds] = useState<string[]>([])
  const [selectedMinecraftVersionIds, setSelectedMinecraftVersionIds] = useState<string[]>([])

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const modLoaders = ['FORGE', 'FABRIC', 'NEOFORGE', 'QUILT', 'VANILLA']

  // Tag handling functions
  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag])
    }
    setTagInput('')
    setShowTagSuggestions(false)
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && tagInput === '' && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1])
    }
  }

  // Filter tag suggestions based on input
  const tagSuggestions = tags
    .filter(tag =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(tag.name)
    )
    .slice(0, 5)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/upload')
    }
  }, [status, router])

  // Fetch categories, tags, game modes, and minecraft versions
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/tags').then(res => res.json()),
      fetch('/api/game-modes').then(res => res.json()),
      fetch('/api/minecraft-versions').then(res => res.json())
    ])
      .then(([categoriesData, tagsData, gameModesData, versionsData]) => {
        setCategories(categoriesData.categories || [])
        setTags(tagsData.tags || [])
        setGameModes(gameModesData.gameModes || [])
        setMinecraftVersions(versionsData.versions || [])
      })
      .catch(err => console.error('Failed to load data:', err))
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)

      // Auto-upload file
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setUploadingFile(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upload file')
      }

      const data = await res.json()
      setFileUrl(data.fileUrl)
    } catch (err: any) {
      setError(err.message)
      setSelectedFile(null)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!fileUrl) {
        throw new Error('Please upload a config file')
      }

      if (selectedMinecraftVersionIds.length === 0) {
        throw new Error('Please select at least one Minecraft version')
      }

      if (formData.isPremium && (!formData.price || parseFloat(formData.price) < 0.99)) {
        throw new Error('Premium configs must have a price of at least $0.99')
      }

      // Create config
      const payload = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        categoryId: formData.categoryId,
        modLoader: formData.modLoader,
        tags: selectedTags, // Send tag names, API will auto-create if needed
        gameModeIds: selectedGameModeIds,
        minecraftVersionIds: selectedMinecraftVersionIds,
        isPremium: formData.isPremium,
        price: formData.isPremium ? parseFloat(formData.price) : null,
        fileUrl: fileUrl
      }

      const res = await fetch('/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create config')
      }

      const config = await res.json()

      // Redirect to the new config
      router.push(`/config/${config.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Upload Config</h1>
          <p className="text-[var(--text-secondary)]">
            Share your Minecraft configuration with the community
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="e.g., Ultimate Performance Pack"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                    placeholder="Describe your configuration and what it does..."
                  />
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {formData.description.length} / 1000 characters
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
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
                      required
                      value={formData.modLoader}
                      onChange={(e) => setFormData({ ...formData, modLoader: e.target.value })}
                      className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    >
                      <option value="">Select mod loader</option>
                      {modLoaders.map((loader) => (
                        <option key={loader} value={loader}>
                          {loader.charAt(0) + loader.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                    Minecraft Versions * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg">
                    {minecraftVersions.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)] col-span-full">Loading versions...</p>
                    ) : (
                      minecraftVersions.map((version) => (
                        <label
                          key={version.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-[var(--surface)] p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMinecraftVersionIds.includes(version.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMinecraftVersionIds([...selectedMinecraftVersionIds, version.id])
                              } else {
                                setSelectedMinecraftVersionIds(selectedMinecraftVersionIds.filter(id => id !== version.id))
                              }
                            }}
                            className="w-4 h-4 bg-[var(--surface-light)] border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--text-primary)]">{version.version}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedMinecraftVersionIds.length > 0 && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      {selectedMinecraftVersionIds.length} version(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                    Game Modes (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {gameModes.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)]">Loading game modes...</p>
                    ) : (
                      gameModes.map((mode) => (
                        <label
                          key={mode.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--surface-light)] p-3 rounded-lg border border-[var(--border)] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGameModeIds.includes(mode.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGameModeIds([...selectedGameModeIds, mode.id])
                              } else {
                                setSelectedGameModeIds(selectedGameModeIds.filter(id => id !== mode.id))
                              }
                            }}
                            className="w-4 h-4 bg-[var(--surface-light)] border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--primary)]"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {mode.icon && <span className="text-xl">{mode.icon}</span>}
                            <div>
                              <span className="text-sm font-medium text-[var(--text-primary)]">{mode.name}</span>
                              {mode.description && (
                                <p className="text-xs text-[var(--text-secondary)]">{mode.description}</p>
                              )}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedGameModeIds.length > 0 && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      {selectedGameModeIds.length} game mode(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Tags (Optional)
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Type tags and press Enter or comma. Start typing for suggestions.
                  </p>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-white rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tag Input with Autocomplete */}
                  <div className="relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value)
                        setShowTagSuggestions(e.target.value.length > 0)
                      }}
                      onKeyDown={handleTagInputKeyDown}
                      onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                      onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                      className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                      placeholder="e.g., Performance, PvP, Lightweight (press Enter or comma)"
                    />

                    {/* Autocomplete Suggestions */}
                    {showTagSuggestions && tagSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {tagSuggestions.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag.name)}
                            className="w-full text-left px-4 py-2 hover:bg-[var(--surface-light)] text-[var(--text-primary)] transition-colors"
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedTags.length > 0 && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      {selectedTags.length} tag(s) added
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* File Upload */}
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Config Files</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Upload Config File(s) *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  uploadingFile
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--border)] hover:border-[var(--primary)]'
                }`}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".zip,.cfg,.conf,.json,.toml,.txt,.yml,.yaml"
                    disabled={uploadingFile}
                  />
                  <label htmlFor="file-upload" className={uploadingFile ? '' : 'cursor-pointer'}>
                    {uploadingFile ? (
                      <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-2"></div>
                        <p className="text-[var(--text-primary)] font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">{fileUrl ? '✅' : '📁'}</div>
                        <p className="text-[var(--text-primary)] font-medium mb-1">
                          {selectedFile
                            ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
                            : 'Click to upload or drag and drop'
                          }
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          ZIP, CFG, CONF, JSON, TOML, TXT, YML, or YAML files (max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {fileUrl && (
                  <p className="text-sm text-green-500 mt-2">✓ File uploaded successfully!</p>
                )}
              </div>
            </Card>

            {/* Additional Details */}
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Additional Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Installation Instructions & Notes
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                    placeholder="Provide installation instructions, compatibility notes, or any other important information..."
                  />
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pricing</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="premium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="w-5 h-5 bg-[var(--surface-light)] border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="premium" className="text-[var(--text-primary)] font-medium">
                    Make this a premium config
                  </label>
                  <Badge variant="accent">Premium</Badge>
                </div>

                {formData.isPremium && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-[var(--text-secondary)]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.99"
                        required={formData.isPremium}
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg pl-8 pr-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                        placeholder="4.99"
                      />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      You'll receive 80% of the sale price (${formData.price ? (parseFloat(formData.price) * 0.8).toFixed(2) : '0.00'}) after platform fees
                    </p>
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
                className="flex-1"
                disabled={loading || uploadingFile || !fileUrl}
              >
                {loading ? 'Publishing...' : 'Publish Config'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
