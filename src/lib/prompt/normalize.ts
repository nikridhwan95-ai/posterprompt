/**
 * Normalisasi input — SDD §7.4.
 *
 * Peraturan paling penting: enjin tidak menulis semula fakta (§7). Fungsi di
 * sini hanya mengemas ruang, menyeragamkan format teknikal (HEX, dimensi) dan
 * tidak sekali-kali mentafsir atau membetulkan tarikh, ejaan atau nama.
 */
import { MAX_DIMENSION, MIN_DIMENSION } from '@/data/canvas'
import { CONTENT_FIELD_NAMES } from '@/data/types'
import type { PosterProject } from '@/schemas/project'

/**
 * Buang ruang di awal dan akhir, seragamkan line ending kepada \n dan hadkan
 * kepada maksimum dua baris kosong berturutan. Pecahan baris dalam teks
 * dikekalkan kerana ia sebahagian daripada teks tepat.
 */
export function normalizeText(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Teks satu baris (tajuk, nama, tarikh) — pecahan baris menjadi ruang. */
export function normalizeSingleLine(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

/** HEX kepada huruf besar; nilai tidak sah dibuang, bukan diteka (§7.4). */
export function normalizeHex(input: string): string | null {
  const trimmed = input.trim().toUpperCase()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return /^#[0-9A-F]{6}$/.test(withHash) ? withHash : null
}

export function normalizeColors(colors: readonly string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const color of colors) {
    const hex = normalizeHex(color)
    if (hex && !seen.has(hex)) {
      seen.add(hex)
      result.push(hex)
    }
  }
  return result
}

/** Dimensi kepada integer dalam julat yang sah. */
export function normalizeDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_DIMENSION
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, Math.round(value)))
}

/**
 * Escape tanda petik ketika membina JSON; paparan manusia kekal asal (§7.4).
 * Digunakan hanya oleh adapter yang menghasilkan struktur berbentuk JSON.
 */
export function escapeForJson(input: string): string {
  return JSON.stringify(input).slice(1, -1)
}

/**
 * Normalisasi keseluruhan projek. Tulen: memulangkan objek baharu dan tidak
 * mengubah input (NFR-008).
 */
export function normalizeProject(project: PosterProject): PosterProject {
  const content = { ...project.content }
  for (const field of CONTENT_FIELD_NAMES) {
    const value = content[field] ?? ''
    // Tajuk utama dijadikan satu baris; medan lain boleh mengandungi
    // pecahan baris yang disengajakan oleh pengguna.
    content[field] = field === 'mainHeadline' ? normalizeSingleLine(value) : normalizeText(value)
  }

  return {
    ...project,
    content,
    canvas: {
      ...project.canvas,
      width: normalizeDimension(project.canvas.width),
      height: normalizeDimension(project.canvas.height),
      destination: normalizeSingleLine(project.canvas.destination ?? ''),
    },
    style: {
      ...project.style,
      customColors: normalizeColors(project.style.customColors),
    },
    platform: {
      ...project.platform,
      customInstructions: normalizeText(project.platform.customInstructions ?? ''),
    },
  }
}
