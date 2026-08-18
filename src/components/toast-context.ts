import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastApi {
  show: (message: string, tone?: ToastTone) => void
}

/**
 * Konteks toast diasingkan daripada komponen penyedia supaya modul komponen
 * hanya mengeksport komponen (fast refresh) dan supaya `useToast` boleh
 * diimport tanpa membawa masuk penanda JSX penyedia.
 */
export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast mesti digunakan di dalam ToastProvider')
  }
  return context
}
