/**
 * Preset kanvas — SDD §6.2 dan FR-005.
 * Nisbah preset diberi secara eksplisit kerana beberapa saiz (A4/A3) tidak
 * menghasilkan nisbah integer yang berguna. Dimensi tersuai mengira nisbah
 * sendiri melalui GCD (§7.4 "kira nisbah dipermudah untuk adapter").
 */
import type { Bilingual } from './types'

export type CanvasPresetId =
  | 'ig_portrait'
  | 'ig_extended'
  | 'ig_square'
  | 'story'
  | 'signage'
  | 'a4_portrait'
  | 'a3_portrait'
  | 'custom'

export type Orientation = 'portrait' | 'landscape' | 'square'

export interface CanvasPreset {
  readonly id: CanvasPresetId
  readonly label: Bilingual
  readonly width: number
  readonly height: number
  /** Nisbah rasmi seperti dalam SDD §6.2. */
  readonly ratio: string
  readonly destination: Bilingual
}

export const MIN_DIMENSION = 320
export const MAX_DIMENSION = 8000

export const CANVAS_PRESETS: readonly CanvasPreset[] = [
  {
    id: 'ig_portrait',
    label: { ms: 'Instagram Portrait', en: 'Instagram Portrait' },
    width: 1080,
    height: 1350,
    ratio: '4:5',
    destination: { ms: 'Feed Instagram', en: 'Instagram feed' },
  },
  {
    id: 'ig_extended',
    label: { ms: 'Instagram Extended', en: 'Instagram Extended' },
    width: 1080,
    height: 1440,
    ratio: '3:4',
    destination: { ms: 'Feed Instagram panjang', en: 'Extended Instagram feed' },
  },
  {
    id: 'ig_square',
    label: { ms: 'Instagram Square', en: 'Instagram Square' },
    width: 1080,
    height: 1080,
    ratio: '1:1',
    destination: { ms: 'Feed segi empat sama', en: 'Square feed' },
  },
  {
    id: 'story',
    label: { ms: 'Story / Reels Cover', en: 'Story / Reels cover' },
    width: 1080,
    height: 1920,
    ratio: '9:16',
    destination: { ms: 'Story dan Reels', en: 'Stories and Reels' },
  },
  {
    id: 'signage',
    label: { ms: 'Digital Signage', en: 'Digital signage' },
    width: 1920,
    height: 1080,
    ratio: '16:9',
    destination: { ms: 'Skrin digital dan slaid', en: 'Digital screens and slides' },
  },
  {
    id: 'a4_portrait',
    label: { ms: 'A4 Portrait', en: 'A4 portrait' },
    width: 2480,
    height: 3508,
    ratio: '1:1.414',
    destination: { ms: 'Cetakan A4 300 dpi', en: 'A4 print at 300 dpi' },
  },
  {
    id: 'a3_portrait',
    label: { ms: 'A3 Portrait', en: 'A3 portrait' },
    width: 3508,
    height: 4961,
    ratio: '1:1.414',
    destination: { ms: 'Cetakan A3 300 dpi', en: 'A3 print at 300 dpi' },
  },
  {
    id: 'custom',
    label: { ms: 'Tersuai', en: 'Custom' },
    width: 1080,
    height: 1350,
    ratio: '',
    destination: { ms: 'Ditentukan pengguna', en: 'User defined' },
  },
] as const

export const CANVAS_PRESET_IDS = CANVAS_PRESETS.map((p) => p.id) as [
  CanvasPresetId,
  ...CanvasPresetId[],
]

export function getCanvasPreset(id: string): CanvasPreset {
  return CANVAS_PRESETS.find((p) => p.id === id) ?? CANVAS_PRESETS[0]
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * Nisbah dipermudah bagi sebarang dimensi.
 * Jika sebutan integer menjadi terlalu besar untuk dibaca (cth. 620:877),
 * nisbah desimal 1:n digunakan supaya adapter dan pengguna faham.
 */
export function simplifyRatio(width: number, height: number): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return ''
  }
  const w = Math.round(width)
  const h = Math.round(height)
  const divisor = gcd(w, h) || 1
  const rw = w / divisor
  const rh = h / divisor
  if (rw <= 32 && rh <= 32) return `${rw}:${rh}`
  return w >= h
    ? `${(w / h).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}:1`
    : `1:${(h / w).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}`
}

/** Nisbah integer untuk adapter yang memerlukan sintaks seperti Midjourney --ar. */
export function integerRatio(width: number, height: number): string {
  if (width <= 0 || height <= 0) return '1:1'
  const divisor = gcd(Math.round(width), Math.round(height)) || 1
  let rw = Math.round(width) / divisor
  let rh = Math.round(height) / divisor
  // Midjourney menerima nombor bulat kecil; kecilkan lagi jika perlu.
  while (rw > 99 || rh > 99) {
    const scale = Math.max(rw, rh) / 99
    rw = Math.max(1, Math.round(rw / scale))
    rh = Math.max(1, Math.round(rh / scale))
    if (rw <= 99 && rh <= 99) break
  }
  return `${rw}:${rh}`
}

export function orientationOf(width: number, height: number): Orientation {
  if (width === height) return 'square'
  return height > width ? 'portrait' : 'landscape'
}

export const ORIENTATION_LABELS: Record<Orientation, Bilingual> = {
  portrait: { ms: 'Potret', en: 'Portrait' },
  landscape: { ms: 'Landskap', en: 'Landscape' },
  square: { ms: 'Segi empat sama', en: 'Square' },
}
