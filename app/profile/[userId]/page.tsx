'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const userId = params.userId as string

  const [user, setUser] = useState<any>(null)
  const [configs, setConfigs] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchProfile()
      fetchConfigs()
      fetchComments()
    }
  }, [userId])

  useEffect(() => {
    if (session?.user?.id && userId) {
      setIsOwnProfile(session.user.id === userId)
    }
  }, [session, userId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConfigs = async () => {
    try {
      const response = await fetch(`/api/configs?authorId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setConfigs(data.configs || [])
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/users/${userId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      const response = await fetch(`/api/users/${userId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">User Not Found</h2>
            <p className="text-[var(--text-secondary)] mb-6">This user doesn't exist.</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const totalDownloads = configs.reduce((sum, c) => sum + (c.downloads || 0), 0)
  const totalViews = configs.reduce((sum, c) => sum + (c.views || 0), 0)
  const avgRating = configs.length > 0
    ? configs.reduce((sum, c) => sum + (c.averageRating || 0), 0) / configs.length
    : 0

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                  {user.name || 'Anonymous User'}
                </h1>
                {user.bio && (
                  <p className="text-[var(--text-secondary)] mb-4 max-w-2xl">{user.bio}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                  <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  <span>📦 {configs.length} Configs</span>
                  <span>💬 {comments.length} Comments</span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <Button variant="outline" onClick={() => router.push('/dashboard?tab=settings')}>
                ✏️ Edit Profile
              </Button>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-sm text-[var(--text-secondary)] mb-1">Total Configs</div>
            <div className="text-3xl font-bold text-[var(--primary)]">{configs.length}</div>
          </Card>
          <Card>
            <div className="text-sm text-[var(--text-secondary)] mb-1">Total Downloads</div>
            <div className="text-3xl font-bold text-[var(--primary)]">{totalDownloads.toLocaleString()}</div>
          </Card>
          <Card>
            <div className="text-sm text-[var(--text-secondary)] mb-1">Total Views</div>
            <div className="text-3xl font-bold text-[var(--primary)]">{totalViews.toLocaleString()}</div>
          </Card>
          <Card>
            <div className="text-sm text-[var(--text-secondary)] mb-1">Avg Rating</div>
            <div className="text-3xl font-bold text-[var(--primary)]">⭐ {avgRating.toFixed(1)}</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {isOwnProfile ? 'My Configs' : `${user.name}'s Configs`}
              </h2>

              {configs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-[var(--text-secondary)]">No configs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      className="p-4 bg-[var(--surface-light)] rounded-lg hover:bg-[var(--surface)] transition-colors cursor-pointer"
                      onClick={() => router.push(`/config/${config.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{config.title}</h3>
                        {config.isPremium && (
                          <Badge variant="accent">Premium ${config.price}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{config.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                        <span>⬇️ {config.downloads || 0}</span>
                        <span>👁️ {config.views || 0}</span>
                        {config.averageRating > 0 && (
                          <span>⭐ {config.averageRating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Comments/Testimonials */}
          <div>
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                💬 Comments
              </h2>

              {/* Post Comment */}
              {!isOwnProfile && session && (
                <form onSubmit={handlePostComment} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment or testimonial..."
                    rows={3}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none mb-2"
                  />
                  <Button type="submit" variant="primary" size="sm" className="w-full">
                    Post Comment
                  </Button>
                </form>
              )}

              {!isOwnProfile && !session && (
                <div className="mb-6 p-4 bg-[var(--surface-light)] rounded-lg text-center">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Sign in to leave a comment</p>
                  <Button variant="primary" size="sm" onClick={() => router.push('/auth/signin')}>
                    Sign In
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[var(--text-secondary)]">No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="pb-4 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-medium text-xs overflow-hidden">
                            {comment.author?.image ? (
                              <img src={comment.author.image} alt={comment.author.name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                              <span>{comment.author?.name?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--text-primary)] text-sm">
                              {comment.author?.name || 'Anonymous'}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {session?.user?.id === comment.authorId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-[var(--error)] hover:opacity-70 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-primary)] pl-10">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
