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

interface SupportedVersion {
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
  const [installationGuide, setInstallationGuide] = useState('')
  const [dependencies, setDependencies] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [supportedSoftware, setSupportedSoftware] = useState('FORGE')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedGameModes, setSelectedGameModes] = useState<string[]>([])
  const [selectedSupportedVersions, setSelectedSupportedVersions] = useState<string[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [price, setPrice] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Available options
  const [categories, setCategories] = useState<Category[]>([])
  const [gameModes, setGameModes] = useState<GameMode[]>([])
  const [supportedVersions, setSupportedVersions] = useState<SupportedVersion[]>([])

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
          fetch('/api/supported-versions')
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
        setInstallationGuide(config.installationGuide || '')
        setDependencies(config.dependencies || '')
        setCategoryId(config.category.id)
        setSupportedSoftware(config.supportedSoftware)
        setSelectedTags(config.tags ? config.tags.map((t: Tag) => t.name) : [])
        setSelectedGameModes(config.gameModes ? config.gameModes.map((gm: GameMode) => gm.id) : [])
        setSelectedSupportedVersions(config.supportedVersions ? config.supportedVersions.map((v: SupportedVersion) => v.id) : [])
        setIsPremium(config.isPremium)
        setPrice(config.price?.toString() || '')
        setExistingImageUrl(config.imageUrl)
        setImagePreview(config.imageUrl)
        setExistingFileUrl(config.fileUrl)
        setFileUrl(config.fileUrl)

        // Set available options
        setCategories(categoriesData.categories || [])
        setGameModes(gameModesData.gameModes || [])
        setSupportedVersions(versionsData.versions || [])

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
      if (selectedSupportedVersions.length === 0) throw new Error('Please select at least one supported version')
      if (isPremium && (!price || parseFloat(price) < 0.99)) {
        throw new Error('Premium configs must have a price of at least $0.99')
      }

      // Prepare payload
      const payload = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        installationGuide: installationGuide.trim() || null,
        dependencies: dependencies.trim() || null,
        categoryId,
        supportedSoftware,
        tags: selectedTags,
        gameModeIds: selectedGameModes,
        supportedVersionIds: selectedSupportedVersions,
        isPremium,
        price: isPremium ? parseFloat(price) : null,
        imageUrl: removeImage ? null : (imagePreview || existingImageUrl),
        fileUrl: fileUrl || existingFileUrl // Use new file if uploaded, otherwise keep existing
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
                    Supported Software *
                  </label>
                  <select
                    value={supportedSoftware}
                    onChange={(e) => setSupportedSoftware(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    required
                  >
                    <option value="BUKKIT">Bukkit</option>
                    <option value="SPIGOT">Spigot</option>
                    <option value="PAPER">Paper</option>
                    <option value="SPONGE">Sponge</option>
                    <option value="BUNGEE">BungeeCord</option>
                    <option value="FOLIA">Folia</option>
                    <option value="VELOCITY">Velocity</option>
                    <option value="MINESTOM">Minestom</option>
                    <option value="PURPUR">Purpur</option>
                    <option value="MOHIST">Mohist</option>
                    <option value="ARCLIGHT">Arclight</option>
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

          {/* File Upload */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Config File</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Upload a new config file to replace the existing one (Optional)
            </p>

            {(fileUrl || existingFileUrl) && (
              <div className="mb-4 p-4 bg-[var(--surface-light)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {selectedFile ? selectedFile.name : 'Current file'}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                      </p>
                    </div>
                  </div>
                  {selectedFile && (
                    <span className="text-xs text-green-500">✓ New file uploaded</span>
                  )}
                </div>
              </div>
            )}

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
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploadingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-primary)]">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-[var(--text-secondary)] mb-2">Click to upload new config file</p>
                    <p className="text-xs text-[var(--text-muted)]">.zip, .cfg, .json, .toml, etc. (max 10MB)</p>
                  </>
                )}
              </label>
            </div>
          </Card>

          {/* Supported Versions */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Supported Versions *</h2>
            <div className="flex flex-wrap gap-2">
              {supportedVersions.map((version) => (
                <label
                  key={version.id}
                  className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${
                    selectedSupportedVersions.includes(version.id)
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSupportedVersions.includes(version.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSupportedVersions([...selectedSupportedVersions, version.id])
                      } else {
                        setSelectedSupportedVersions(selectedSupportedVersions.filter(id => id !== version.id))
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Additional Information
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                  placeholder="Any extra details about your config..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Installation Guide
                </label>
                <textarea
                  value={installationGuide}
                  onChange={(e) => setInstallationGuide(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                  placeholder="Step-by-step installation instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Dependencies
                </label>
                <textarea
                  value={dependencies}
                  onChange={(e) => setDependencies(e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                  placeholder="List any required mods, plugins, or other dependencies..."
                />
              </div>
            </div>
          </Card>

          {/* Version Management */}
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Version Management</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Upload a new version of your config. This will be added to the version history.
            </p>

            <div className="bg-[var(--surface-light)] p-4 rounded-lg mb-4">
              <p className="text-sm text-[var(--text-muted)] mb-2">
                💡 <strong>Tip:</strong> When you upload a new version, users who downloaded previous versions can see what's changed and download the update.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/config/${params.id}/versions`)}
            >
              📦 Manage Versions
            </Button>
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
