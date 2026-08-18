/**
 * Antara muka dan pembantu bersama bagi semua adapter platform (SDD §7.6).
 */
import type { PlatformId } from '@/data/platforms'
import type { PromptContext, PromptSection, QualityWarning, SectionKey } from '../types'

export interface AdapterResult {
  /** Bahagian selepas transformasi — dipapar dalam UI sebagai struktur. */
  readonly sections: readonly PromptSection[]
  /** Teks prompt akhir yang disalin pengguna. */
  readonly prompt: string
  /** Nota khusus platform (bahagian MODEL NOTES). */
  readonly modelNotes: readonly string[]
  readonly warnings: readonly QualityWarning[]
  /** Benar apabila blok teks tepat dikeluarkan daripada prompt utama. */
  readonly textSeparated: boolean
}

export interface PlatformAdapter {
  readonly id: PlatformId
  readonly version: string
  transform(sections: readonly PromptSection[], ctx: PromptContext): AdapterResult
}

export function headingOf(section: PromptSection): string {
  return section.heading ?? section.section
}

/** Gabung bahagian menjadi blok berlabel, seperti Lampiran B. */
export function renderLabelled(sections: readonly PromptSection[]): string {
  return sections
    .filter((section) => section.lines.some((line) => line.trim().length > 0))
    .map((section) => `${headingOf(section)}\n${section.lines.join('\n')}`)
    .join('\n\n')
}

/** Gabung bahagian menjadi perenggan mengalir tanpa tajuk. */
export function renderProse(sections: readonly PromptSection[]): string {
  return sections
    .filter((section) => section.lines.some((line) => line.trim().length > 0))
    .map((section) => section.lines.join(' '))
    .join(' ')
}

/** Satu baris ringkas setiap bahagian: `Tajuk: kandungan`. */
export function renderCompact(sections: readonly PromptSection[]): string {
  return sections
    .filter((section) => section.lines.some((line) => line.trim().length > 0))
    .map((section) => `${toTitleCase(headingOf(section))}: ${section.lines.join(' ')}`)
    .join('\n')
}

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

export function pickSections(
  sections: readonly PromptSection[],
  keys: readonly SectionKey[],
): PromptSection[] {
  return keys
    .map((key) => sections.find((section) => section.section === key))
    .filter((section): section is PromptSection => section !== undefined)
}

export function withoutSection(
  sections: readonly PromptSection[],
  key: SectionKey,
): PromptSection[] {
  return sections.filter((section) => section.section !== key)
}

export function modelNotesSection(notes: readonly string[]): PromptSection | null {
  const lines = notes.filter((note) => note.trim().length > 0)
  return lines.length > 0 ? { section: 'MODEL NOTES', lines } : null
}

/** Teks bilingual ringkas untuk nota adapter. */
export function note(ctx: PromptContext, ms: string, en: string): string {
  return ctx.language === 'ms' ? ms : en
}
