'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          Something went wrong!
        </h1>
        <p className="text-[var(--text-secondary)] mb-2">
          We're sorry, but something unexpected happened.
        </p>
        {error.message && (
          <p className="text-sm text-red-500 mb-8 font-mono bg-red-500/10 p-3 rounded">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => reset()}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
