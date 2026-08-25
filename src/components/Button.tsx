import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-magenta-500 text-white border border-magenta-500 hover:bg-magenta-600 hover:border-magenta-600 active:bg-magenta-700',
  secondary:
    'bg-white text-ink-800 border border-[var(--color-control)] hover:border-magenta-500 hover:text-magenta-700 active:bg-magenta-50',
  ghost: 'bg-transparent text-magenta-700 border border-transparent hover:bg-magenta-50',
  danger:
    'bg-white text-[var(--color-danger-500)] border border-[var(--color-danger-500)] hover:bg-[var(--color-danger-50)]',
}

const SIZES: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3 gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  )
}
