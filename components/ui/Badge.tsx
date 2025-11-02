import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  className?: string
}

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30',
    secondary: 'bg-[var(--secondary)]/20 text-[var(--secondary)] border-[var(--secondary)]/30',
    accent: 'bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30',
    success: 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30',
    warning: 'bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/30',
    error: 'bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)]/30'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
