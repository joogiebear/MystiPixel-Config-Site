'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDistanceToNow } from 'date-fns'

interface Version {
  id: string
  version: string
  changelog: string
  fileUrl: string
  downloads: number
  createdAt: string
}

export default function VersionManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(true)
  const [versions, setVersions] = useState<Version[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New version form
  const [versionNumber, setVersionNumber] = useState('')
  const [changelog, setChangelog] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch existing versions
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await fetch(`/api/configs/${params.id}/versions`)
        if (!res.ok) throw new Error('Failed to load versions')

        const data = await res.json()
        setVersions(data.versions || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchVersions()
    }
  }, [params.id])

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
    setError(null)

    if (!versionNumber.trim()) {
      setError('Version number is required')
      return
    }

    if (!fileUrl) {
      setError('Please upload a file')
      return
    }

    setUploading(true)

    try {
      const res = await fetch(`/api/configs/${params.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: versionNumber.trim(),
          changelog: changelog.trim(),
          fileUrl
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create version')
      }

      // Reset form
      setVersionNumber('')
      setChangelog('')
      setSelectedFile(null)
      setFileUrl(null)

      // Refresh versions list
      const versionsRes = await fetch(`/api/configs/${params.id}/versions`)
      const versionsData = await versionsRes.json()
      setVersions(versionsData.versions || [])

      alert('Version created successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return

    try {
      const res = await fetch(`/api/configs/${params.id}/versions/${versionId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete version')
      }

      setVersions(versions.filter(v => v.id !== versionId))
      alert('Version deleted successfully')
    } catch (err: any) {
      alert(err.message)
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

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Version Management</h1>
            <p className="text-[var(--text-secondary)]">Upload and manage versions of your config</p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/config/${params.id}/edit`)}>
            ← Back to Edit
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Upload New Version */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Upload New Version</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Version Number *
              </label>
              <input
                type="text"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                placeholder="e.g., 1.0.0, 1.1.0, 2.0.0"
                required
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">Use semantic versioning (major.minor.patch)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Changelog
              </label>
              <textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                rows={4}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                placeholder="What's new in this version? (e.g., bug fixes, new features, improvements)"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Config File *
              </label>

              {fileUrl ? (
                <div className="p-4 bg-[var(--surface-light)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📦</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {selectedFile?.name || 'File uploaded'}
                        </p>
                        <p className="text-xs text-green-500">✓ Ready to publish</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFileUrl(null); setSelectedFile(null); }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  uploadingFile
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--border)] hover:border-[var(--primary)]'
                }`}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="version-file-upload"
                    accept=".zip,.cfg,.conf,.json,.toml,.txt,.yml,.yaml"
                    disabled={uploadingFile}
                  />
                  <label htmlFor="version-file-upload" className="cursor-pointer">
                    {uploadingFile ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                        <p className="text-[var(--text-primary)]">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-2">📁</div>
                        <p className="text-[var(--text-secondary)] mb-2">Click to upload config file</p>
                        <p className="text-xs text-[var(--text-muted)]">.zip, .cfg, .json, .toml, etc. (max 10MB)</p>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={uploading || uploadingFile || !fileUrl}
              className="w-full"
            >
              {uploading ? 'Creating Version...' : 'Create Version'}
            </Button>
          </form>
        </Card>

        {/* Version History */}
        <Card>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Version History</h2>

          {versions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-[var(--text-secondary)]">No versions yet. Upload your first version above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.id} className="border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Version {version.version}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-[var(--surface-light)] px-2 py-1 rounded">
                        {version.downloads} downloads
                      </span>
                      <button
                        onClick={() => handleDelete(version.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {version.changelog && (
                    <div className="mt-3 p-3 bg-[var(--surface-light)] rounded text-sm text-[var(--text-secondary)]">
                      <pre className="whitespace-pre-wrap font-sans">{version.changelog}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
