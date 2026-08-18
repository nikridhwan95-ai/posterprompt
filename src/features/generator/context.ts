import { createContext, useContext } from 'react'
import type { StepId } from '@/schemas/project'
import type { GeneratedOutput } from '@/lib/prompt/types'

export interface DraftNotice {
  readonly kind: 'restored' | 'migrated' | 'incompatible'
  readonly message: string
  /** Kandungan mentah untuk dimuat turun apabila migrasi tidak selamat (§8.5). */
  readonly raw?: string
  readonly from?: string
}

/**
 * Keadaan penyimpan draf, dipaparkan sebagai penunjuk auto-save (§5.6).
 * `ralat` bermakna localStorage menolak tulisan (kuota penuh atau mod
 * peribadi) — pengguna mesti diberitahu, bukan dibiarkan menyangka kerjanya
 * selamat (§11.1).
 */
export type SaveState = 'idle' | 'saving' | 'saved' | 'ralat'

export interface GeneratorApi {
  readonly step: StepId
  readonly goToStep: (step: StepId) => void
  readonly furthestStep: StepId
  /** Sahkan keseluruhan borang dan jana output (FR-013). */
  readonly generate: () => Promise<boolean>
  readonly output: GeneratedOutput | null
  readonly isGenerating: boolean
  readonly resetProject: () => void
  readonly consent: boolean
  readonly setConsent: (value: boolean) => void
  readonly draftNotice: DraftNotice | null
  readonly dismissDraftNotice: () => void
  readonly discardDraft: () => void
  readonly saveState: SaveState
  /** Cap masa ISO simpanan terakhir yang berjaya, jika ada. */
  readonly lastSavedAt: string | null
}

export const GeneratorContext = createContext<GeneratorApi | null>(null)

export function useGenerator(): GeneratorApi {
  const context = useContext(GeneratorContext)
  if (!context) {
    throw new Error('useGenerator mesti digunakan di dalam GeneratorLayout')
  }
  return context
}
