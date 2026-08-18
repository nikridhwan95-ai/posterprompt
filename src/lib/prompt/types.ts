/**
 * Jenis bersama enjin prompt — SDD §7.
 */
import type { PosterProject } from '@/schemas/project'
import type { PromptLanguage } from '@/data/types'

/** Sepuluh bahagian prompt standard (§7.1). */
export type SectionKey =
  | 'DESIGN TASK'
  | 'CANVAS'
  | 'VISUAL DIRECTION'
  | 'COMPOSITION'
  | 'SUBJECT'
  | 'TYPOGRAPHY'
  | 'EXACT COPY'
  | 'CONSTRAINTS'
  | 'QUALITY'
  | 'MODEL NOTES'

export const SECTION_ORDER: readonly SectionKey[] = [
  'DESIGN TASK',
  'CANVAS',
  'VISUAL DIRECTION',
  'COMPOSITION',
  'SUBJECT',
  'TYPOGRAPHY',
  'EXACT COPY',
  'CONSTRAINTS',
  'QUALITY',
  'MODEL NOTES',
]

export interface PromptSection {
  readonly section: SectionKey
  /**
   * Tajuk bahagian yang dipapar dalam prompt. Jika kosong, `section` digunakan.
   * Diperlukan oleh EXACT COPY yang membawa penanda tambahan (§7.1, Lampiran B).
   */
  readonly heading?: string
  readonly lines: readonly string[]
}

/** Satu baris teks tepat: label medan + nilai asal pengguna. */
export interface ExactCopyLine {
  readonly field: string
  readonly label: string
  readonly value: string
}

export type DensityBand = 'rendah' | 'sesuai' | 'padat' | 'terlalu_padat'

export interface DensityResult {
  readonly score: number
  readonly band: DensityBand
  readonly label: string
  readonly totalCharacters: number
  readonly textBlocks: number
  readonly assetZones: number
  readonly subjectCount: number
}

export type WarningSeverity = 'info' | 'amaran' | 'ralat'

export interface QualityWarning {
  readonly id: string
  readonly severity: WarningSeverity
  readonly message: string
  /** Laluan medan RHF untuk pautan "Sunting" (FR-019). */
  readonly field?: string
}

export interface AuditCheck {
  readonly id: string
  readonly label: string
  readonly passed: boolean
  readonly detail?: string
}

export interface LayoutNote {
  readonly zone: string
  readonly instruction: string
}

/** Konteks yang dikongsi oleh semua fragmen dan adapter. */
export interface PromptContext {
  readonly project: PosterProject
  readonly language: PromptLanguage
  readonly ratio: string
  readonly integerRatio: string
  readonly orientation: 'portrait' | 'landscape' | 'square'
  readonly exactCopy: readonly ExactCopyLine[]
  readonly density: DensityResult
  readonly colors: readonly string[]
}

export interface GeneratedOutput {
  readonly mainPrompt: string
  readonly exactCopyText: string
  readonly exactCopy: readonly ExactCopyLine[]
  readonly negativePrompt: string
  readonly layoutNotes: readonly LayoutNote[]
  readonly layoutNotesText: string
  readonly warnings: readonly QualityWarning[]
  readonly audit: readonly AuditCheck[]
  readonly density: DensityResult
  readonly sections: readonly PromptSection[]
  readonly platformId: string
  readonly adapterVersion: string
  readonly templateVersion: string
  readonly schemaVersion: string
}
