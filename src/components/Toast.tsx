import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

interface ToastMessage {
  id: number
  message: string
  tone: ToastTone
}

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-[var(--color-ok-500)] bg-[var(--color-ok-50)] text-[var(--color-ok-500)]',
  error: 'border-[var(--color-danger-500)] bg-[var(--color-danger-50)] text-[var(--color-danger-500)]',
  info: 'border-blue-600 bg-blue-50 text-blue-700',
}

/**
 * Toast yang boleh dibaca pembaca skrin (§5.5). Kawasan live sentiasa berada
 * dalam DOM supaya teknologi bantuan mendaftarkannya sebelum mesej muncul.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const counter = useRef(0)

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    counter.current += 1
    const id = counter.current
    setToasts((current) => [...current, { id, message, tone }])
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pp-no-print pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${TONE_STYLES[toast.tone]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast mesti digunakan di dalam ToastProvider')
  }
  return context
}
