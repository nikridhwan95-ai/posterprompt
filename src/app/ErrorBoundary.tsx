import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Sempadan ralat aplikasi (§4.1, §10.2).
 *
 * Ralat tidak dijangka dipintas di sini tanpa memadam draf aktif. Mesej ralat
 * teknikal tidak memaparkan kandungan poster pengguna (NFR-014).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hanya jejak teknikal direkod — tiada nilai medan pengguna (NFR-009).
    console.error('PosterPrompt error boundary', error.message, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16">
        <h1 className="text-2xl font-bold text-ink-900">Maaf, berlaku ralat tidak dijangka</h1>
        <p className="text-sm leading-relaxed text-ink-600">
          Draf anda dalam pelayar ini tidak dipadam. Muat semula halaman untuk meneruskan kerja.
          Jika ralat berulang, padam draf melalui halaman notis privasi.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-magenta-500 bg-magenta-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-magenta-600"
          >
            Muat semula halaman
          </button>
          <a
            href="/privasi"
            className="rounded-lg border border-[var(--color-control)] bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 hover:border-blue-600 hover:text-blue-700"
          >
            Notis privasi
          </a>
        </div>
        <p className="font-mono text-xs text-ink-500">{this.state.error.message}</p>
      </div>
    )
  }
}
