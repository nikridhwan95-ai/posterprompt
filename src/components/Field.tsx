import type { ReactNode } from 'react'

interface FieldProps {
  id: string
  label: string
  hint?: string
  required?: boolean
  error?: string
  /** Kiraan aksara "42 / 120" yang dipaparkan di sebelah kanan label. */
  counter?: string
  counterWarning?: boolean
  children: ReactNode
}

/**
 * Pembungkus medan borang yang mengikat label, bantuan dan mesej ralat kepada
 * kawalan melalui aria-describedby (NFR-004, §10.2).
 */
export function Field({
  id,
  label,
  hint,
  required,
  error,
  counter,
  counterWarning,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="pp-label">
          {label}
          {required && (
            <span className="ml-1 text-magenta-600" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (wajib)</span>}
        </label>
        {counter && (
          <span
            className={`shrink-0 text-xs tabular-nums ${
              counterWarning ? 'font-semibold text-[var(--color-warn-500)]' : 'text-ink-500'
            }`}
          >
            {counter}
          </span>
        )}
      </div>

      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-ink-500">
          {hint}
        </p>
      )}

      <div
        // Kawalan di dalam menerima id, aria-invalid dan aria-describedby
        // daripada pemanggil supaya pembungkus ini kekal generik.
        data-field={id}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      >
        {children}
      </div>

      {error && (
        <p id={errorId} className="text-xs font-medium text-[var(--color-danger-500)]">
          {error}
        </p>
      )}
    </div>
  )
}
