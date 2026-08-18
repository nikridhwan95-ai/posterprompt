/**
 * Skor ketumpatan kandungan — SDD §7.5.
 *
 *   densityScore = min(totalCharacters / 450, 1.0) * 45
 *                + min(textBlocks / 8, 1.0)       * 25
 *                + min(assetZones / 5, 1.0)       * 15
 *                + min(subjectCount / 4, 1.0)     * 15
 *
 *   0-34 Rendah · 35-64 Sesuai · 65-79 Padat · 80-100 Terlalu Padat
 *
 * Skor ini heuristik UX, bukan ukuran tipografi mutlak. Tujuannya memberi
 * amaran sebelum pengguna menghantar prompt kepada model luar.
 */
import { CONTENT_FIELD_NAMES } from '@/data/types'
import { countZones, type PosterProject } from '@/schemas/project'
import type { DensityBand, DensityResult } from './types'

export const DENSITY_WEIGHTS = {
  characters: 45,
  blocks: 25,
  zones: 15,
  subjects: 15,
} as const

export const DENSITY_DIVISORS = {
  characters: 450,
  blocks: 8,
  zones: 5,
  subjects: 4,
} as const

export const DENSITY_LABELS: Record<DensityBand, string> = {
  rendah: 'Rendah',
  sesuai: 'Sesuai',
  padat: 'Padat',
  terlalu_padat: 'Terlalu Padat',
}

export function bandFor(score: number): DensityBand {
  if (score < 35) return 'rendah'
  if (score < 65) return 'sesuai'
  if (score < 80) return 'padat'
  return 'terlalu_padat'
}

/** Band yang dianggap terlalu penuh untuk poster (§7.7 peraturan ketiga). */
export function isCrowded(band: DensityBand): boolean {
  return band === 'padat' || band === 'terlalu_padat'
}

export function scoreContentDensity(project: PosterProject): DensityResult {
  const values = CONTENT_FIELD_NAMES.map((field) => (project.content[field] ?? '').trim()).filter(
    (value) => value.length > 0,
  )

  const totalCharacters = values.reduce((sum, value) => sum + value.length, 0)
  const textBlocks = values.length
  const assetZones = countZones(project.layout)
  const subjectCount = project.subject.subjectType === 'none' ? 0 : project.subject.subjectCount

  const raw =
    Math.min(totalCharacters / DENSITY_DIVISORS.characters, 1) * DENSITY_WEIGHTS.characters +
    Math.min(textBlocks / DENSITY_DIVISORS.blocks, 1) * DENSITY_WEIGHTS.blocks +
    Math.min(assetZones / DENSITY_DIVISORS.zones, 1) * DENSITY_WEIGHTS.zones +
    Math.min(subjectCount / DENSITY_DIVISORS.subjects, 1) * DENSITY_WEIGHTS.subjects

  const score = Math.round(raw)
  const band = bandFor(score)

  return {
    score,
    band,
    label: DENSITY_LABELS[band],
    totalCharacters,
    textBlocks,
    assetZones,
    subjectCount,
  }
}
