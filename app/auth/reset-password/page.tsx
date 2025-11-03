'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      verifyToken(tokenParam)
    } else {
      setVerifying(false)
      setError('Invalid reset link')
    }
  }, [searchParams])

  const verifyToken = async (tokenValue: string) => {
    try {
      const res = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue }),
      })

      if (res.ok) {
        setValidToken(true)
      } else {
        setError('Invalid or expired reset link')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Verifying...</h1>
          <p className="text-[var(--text-secondary)]">Please wait while we verify your reset link</p>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Password Reset!</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Button onClick={() => router.push('/auth/signin')} variant="primary" size="lg">
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Invalid Link</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error || 'This password reset link is invalid or has expired.'}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/auth/forgot-password')} variant="outline">
              Request New Link
            </Button>
            <Button onClick={() => router.push('/auth/signin')} variant="primary">
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Reset Your Password</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="Enter new password"
              required
              minLength={8}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">At least 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Loading...</h1>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
