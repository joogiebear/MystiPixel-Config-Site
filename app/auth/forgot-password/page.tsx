'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Check Your Email</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            If an account exists for {email}, we've sent password reset instructions to that email address.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
          <Button onClick={() => router.push('/auth/signin')} variant="outline">
            Back to Sign In
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Forgot Password?</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="your@email.com"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/auth/signin')}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
