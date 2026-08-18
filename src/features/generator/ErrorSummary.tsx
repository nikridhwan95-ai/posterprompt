import { useEffect, useRef } from 'react'

export interface ErrorItem {
  readonly path: string
  readonly message: string
}

interface ErrorSummaryProps {
  errors: readonly ErrorItem[]
  onSelect: (path: string) => void
}

/**
 * Ringkasan ralat di bahagian atas langkah apabila lebih daripada satu medan
 * gagal (§10.2). Fokus dipindahkan ke ringkasan supaya pengguna papan kekunci
 * dan pembaca skrin terus mendengar senarai masalah.
 */
export function ErrorSummary({ errors, onSelect }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const count = errors.length

  useEffect(() => {
    if (count > 0) ref.current?.focus()
  }, [count])

  if (count === 0) return null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-xl border border-[var(--color-danger-500)] bg-[var(--color-danger-50)] p-4"
    >
      <h2 className="text-sm font-bold text-[var(--color-danger-500)]">
        {count === 1
          ? 'Satu medan perlu dibetulkan sebelum meneruskan'
          : `${count} medan perlu dibetulkan sebelum meneruskan`}
      </h2>
      <ul className="mt-2 flex flex-col gap-1">
        {errors.map((error) => (
          <li key={error.path}>
            <button
              type="button"
              onClick={() => onSelect(error.path)}
              className="text-left text-sm text-[var(--color-danger-500)] underline underline-offset-2 hover:no-underline"
            >
              {error.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
