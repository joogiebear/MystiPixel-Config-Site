'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Verifying Email...</h1>
            <p className="text-[var(--text-secondary)]">Please wait while we verify your email address</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Email Verified!</h1>
            <p className="text-[var(--text-secondary)] mb-6">{message}</p>
            <Button onClick={() => router.push('/auth/signin')} variant="primary" size="lg">
              Sign In
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Verification Failed</h1>
            <p className="text-[var(--text-secondary)] mb-6">{message}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/auth/signup')} variant="outline">
                Sign Up Again
              </Button>
              <Button onClick={() => router.push('/auth/signin')} variant="primary">
                Sign In
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Loading...</h1>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
