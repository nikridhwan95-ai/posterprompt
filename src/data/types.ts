/**
 * Jenis asas untuk katalog preset (SDD §6.3, §8.2).
 * Fail ini tidak boleh mengimport apa-apa modul lain supaya katalog kekal
 * bebas daripada skema dan komponen UI (NFR-007).
 */

export type PromptLanguage = 'ms' | 'en'

/** Teks yang wujud dalam dua bahasa: BM untuk UI, EN/BM untuk prompt. */
export type Bilingual = { readonly ms: string; readonly en: string }

/**
 * Satu pilihan preset.
 * - `label`  : dipaparkan dalam antara muka (sentiasa BM di UI)
 * - `hint`   : penerangan ringkas pada kad pilihan
 * - `prompt` : deskriptor yang disuntik ke dalam prompt, mengikut promptLanguage
 */
export interface PresetOption<Id extends string = string> {
  readonly id: Id
  readonly label: Bilingual
  readonly hint?: Bilingual
  readonly prompt: Bilingual
}

/** Medan kandungan teks poster (Lampiran A). */
export type ContentFieldName =
  | 'mainHeadline'
  | 'subHeadline'
  | 'personName'
  | 'position'
  | 'programName'
  | 'achievement'
  | 'date'
  | 'time'
  | 'venue'
  | 'organizer'
  | 'callToAction'
  | 'footerNotes'

export const CONTENT_FIELD_NAMES: readonly ContentFieldName[] = [
  'mainHeadline',
  'subHeadline',
  'personName',
  'position',
  'programName',
  'achievement',
  'date',
  'time',
  'venue',
  'organizer',
  'callToAction',
  'footerNotes',
] as const

/** Ambil teks mengikut bahasa prompt yang dipilih. */
export function pick(text: Bilingual, language: PromptLanguage): string {
  return language === 'ms' ? text.ms : text.en
}

/** Cari satu entri katalog mengikut id; memulangkan undefined jika tiada. */
export function findPreset<T extends { id: string }>(
  catalog: readonly T[],
  id: string | undefined,
): T | undefined {
  if (!id) return undefined
  return catalog.find((entry) => entry.id === id)
}
