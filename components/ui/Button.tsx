import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white',
    secondary: 'bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] text-white',
    accent: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white',
    outline: 'border-2 border-[var(--border-light)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-secondary)]',
    ghost: 'hover:bg-[var(--surface-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
