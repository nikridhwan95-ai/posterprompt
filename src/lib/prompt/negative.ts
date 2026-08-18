/**
 * Peraturan negative prompt — SDD §7.7.
 *
 * 1. Sentiasa larang teks tidak jelas, ejaan salah, logo rawak, watermark dan
 *    elemen tidak diminta.
 * 2. Larangan anatomi hanya apabila subjek manusia dipilih.
 * 3. Larangan latar sesak apabila ketumpatan Padat atau Terlalu Padat.
 * 4. Larangan warna di luar palet apabila pengguna memilih palet ketat.
 * 5. Jangan masukkan larangan yang bercanggah dengan gaya utama.
 */
import { STYLES, SUBJECT_TYPES } from '@/data/styles'
import { findPreset, type PromptLanguage } from '@/data/types'
import type { PosterProject } from '@/schemas/project'
import { isCrowded } from './density'
import type { DensityResult } from './types'

interface NegativeRule {
  readonly id: string
  readonly ms: string
  readonly en: string
  /** Gaya yang bercanggah dengan larangan ini (peraturan kelima). */
  readonly conflictsWithOrnamental?: boolean
}

const ALWAYS: readonly NegativeRule[] = [
  { id: 'illegible', ms: 'tipografi tidak jelas', en: 'illegible typography' },
  { id: 'misspelled', ms: 'ejaan salah', en: 'misspelled words' },
  { id: 'gibberish', ms: 'teks karut atau huruf rawak', en: 'gibberish or random lettering' },
  { id: 'random_logo', ms: 'logo rawak', en: 'random logos' },
  { id: 'watermark', ms: 'watermark', en: 'watermarks' },
  { id: 'extra_elements', ms: 'elemen yang tidak diminta', en: 'unrequested elements' },
  { id: 'low_contrast', ms: 'kontras rendah', en: 'low contrast' },
  { id: 'cropped_text', ms: 'teks terpotong di tepi', en: 'text cropped at the edges' },
]

const HUMAN: readonly NegativeRule[] = [
  { id: 'distorted_anatomy', ms: 'anatomi cacat', en: 'distorted anatomy' },
  { id: 'altered_face', ms: 'wajah terubah', en: 'altered facial features' },
  { id: 'extra_limbs', ms: 'anggota badan berlebihan', en: 'extra limbs or fingers' },
  { id: 'duplicated_people', ms: 'orang berganda', en: 'duplicated people' },
]

const CROWDED: readonly NegativeRule[] = [
  { id: 'busy_background', ms: 'latar sesak', en: 'crowded background' },
  {
    id: 'excessive_ornament',
    ms: 'hiasan berlebihan',
    en: 'excessive ornamentation',
    conflictsWithOrnamental: true,
  },
  { id: 'overlapping_text', ms: 'teks bertindih', en: 'overlapping text blocks' },
]

const STRICT_PALETTE: readonly NegativeRule[] = [
  {
    id: 'off_palette',
    ms: 'warna di luar palet yang ditetapkan',
    en: 'colours outside the specified palette',
  },
]

const MALAY_SPELLING: NegativeRule = {
  id: 'malay_spelling',
  ms: 'ejaan Bahasa Melayu yang diubah',
  en: 'altered Malay spelling',
}

/**
 * Bina senarai larangan. Memulangkan tatasusunan supaya boleh diuji satu demi
 * satu, dan `toNegativePrompt` menggabungkannya menjadi satu ayat.
 */
export function negativeRules(
  project: PosterProject,
  density: DensityResult,
  language: PromptLanguage,
): { id: string; text: string }[] {
  const style = findPreset(STYLES, project.style.stylePreset)
  const subjectType = findPreset(SUBJECT_TYPES, project.subject.subjectType)
  const hasHumanSubject =
    !!subjectType && subjectType.human && project.subject.subjectCount > 0

  const selected: NegativeRule[] = [...ALWAYS]

  if (hasHumanSubject) selected.push(...HUMAN)

  if (isCrowded(density.band)) selected.push(...CROWDED)

  if (project.style.strictPalette) selected.push(...STRICT_PALETTE)

  if (project.language === 'ms' || project.language === 'bilingual') {
    selected.push(MALAY_SPELLING)
  }

  // Peraturan kelima: buang larangan yang bercanggah dengan gaya utama.
  const filtered = selected.filter(
    (rule) => !(rule.conflictsWithOrnamental && style?.ornamental),
  )

  return filtered.map((rule) => ({
    id: rule.id,
    text: language === 'ms' ? rule.ms : rule.en,
  }))
}

export function buildNegativePrompt(
  project: PosterProject,
  density: DensityResult,
  language: PromptLanguage,
): string {
  const rules = negativeRules(project, density, language)
  if (rules.length === 0) return ''
  const list = rules.map((rule) => rule.text).join(', ')
  return language === 'ms' ? `Elakkan ${list}.` : `Avoid ${list}.`
}
