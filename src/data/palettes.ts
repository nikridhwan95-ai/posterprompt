/**
 * Preset palet warna — FR-007 dan Lampiran A (default `maroon_gold`).
 * Setiap preset membawa senarai HEX untuk pratonton UI dan deskriptor
 * dwibahasa untuk bahagian VISUAL DIRECTION prompt.
 */
import type { PresetOption } from './types'

export type PaletteId =
  | 'maroon_gold'
  | 'corporate_blue'
  | 'royal_purple'
  | 'emerald_gold'
  | 'monochrome_ink'
  | 'sunset_warm'
  | 'teal_fresh'
  | 'crimson_black'
  | 'pastel_soft'
  | 'vibrant_youth'
  | 'earth_natural'
  | 'night_neon'
  | 'custom'

export interface PalettePreset extends PresetOption<PaletteId> {
  readonly colors: readonly string[]
  /** Palet cerah — asas amaran "palet cerah + teks cerah" (§10.3). */
  readonly light: boolean
}

export const PALETTES: readonly PalettePreset[] = [
  {
    id: 'maroon_gold',
    label: { ms: 'Maroon dan emas', en: 'Maroon and gold' },
    colors: ['#7A0026', '#C9A227', '#FFFFFF', '#1A1A1A'],
    prompt: { ms: 'palet maroon, emas dan putih', en: 'a maroon, gold and white palette' },
    light: false,
  },
  {
    id: 'corporate_blue',
    label: { ms: 'Biru korporat', en: 'Corporate blue' },
    colors: ['#0B3C8C', '#1B9AAA', '#F2F5FA', '#101828'],
    prompt: {
      ms: 'palet biru korporat dengan aksen biru kehijauan',
      en: 'a corporate blue palette with teal accents',
    },
    light: false,
  },
  {
    id: 'royal_purple',
    label: { ms: 'Ungu diraja', en: 'Royal purple' },
    colors: ['#3B0764', '#7C3AED', '#E9D5FF', '#F5F3FF'],
    prompt: {
      ms: 'palet ungu diraja dengan aksen keemasan lembut',
      en: 'a royal purple palette with soft gilded accents',
    },
    light: false,
  },
  {
    id: 'emerald_gold',
    label: { ms: 'Zamrud dan emas', en: 'Emerald and gold' },
    colors: ['#064E3B', '#0F9D6E', '#D4AF37', '#FFFFFF'],
    prompt: { ms: 'palet hijau zamrud dan emas', en: 'an emerald green and gold palette' },
    light: false,
  },
  {
    id: 'monochrome_ink',
    label: { ms: 'Monokrom dakwat', en: 'Monochrome ink' },
    colors: ['#111111', '#4B4B4B', '#B0B0B0', '#FFFFFF'],
    prompt: {
      ms: 'palet monokrom hitam putih dengan kelabu berperingkat',
      en: 'a monochrome black-and-white palette with graded greys',
    },
    light: false,
  },
  {
    id: 'sunset_warm',
    label: { ms: 'Senja hangat', en: 'Warm sunset' },
    colors: ['#7C2D12', '#EA580C', '#FBBF24', '#FFF7ED'],
    prompt: {
      ms: 'palet senja hangat oren, jingga dan kuning',
      en: 'a warm sunset palette of orange, amber and gold',
    },
    light: true,
  },
  {
    id: 'teal_fresh',
    label: { ms: 'Teal segar', en: 'Fresh teal' },
    colors: ['#0F766E', '#2DD4BF', '#CCFBF1', '#F8FAFC'],
    prompt: { ms: 'palet teal segar dan lapang', en: 'a fresh, airy teal palette' },
    light: true,
  },
  {
    id: 'crimson_black',
    label: { ms: 'Merah dan hitam', en: 'Crimson and black' },
    colors: ['#7F1D1D', '#DC2626', '#111111', '#F5F5F5'],
    prompt: {
      ms: 'palet merah crimson dan hitam berkontras tinggi',
      en: 'a high-contrast crimson and black palette',
    },
    light: false,
  },
  {
    id: 'pastel_soft',
    label: { ms: 'Pastel lembut', en: 'Soft pastel' },
    colors: ['#FBCFE8', '#BFDBFE', '#FEF3C7', '#FFFFFF'],
    prompt: { ms: 'palet pastel lembut dan tenang', en: 'a soft, calm pastel palette' },
    light: true,
  },
  {
    id: 'vibrant_youth',
    label: { ms: 'Belia berani', en: 'Bold youth' },
    colors: ['#D6008C', '#2B4EF0', '#FFC800', '#111111'],
    prompt: {
      ms: 'palet berani magenta, biru elektrik dan kuning',
      en: 'a bold magenta, electric blue and yellow palette',
    },
    light: false,
  },
  {
    id: 'earth_natural',
    label: { ms: 'Bumi semula jadi', en: 'Natural earth' },
    colors: ['#44403C', '#A8A29E', '#D6C7B0', '#FAF7F2'],
    prompt: {
      ms: 'palet bumi semula jadi bernada tanah dan krim',
      en: 'a natural earth palette of soil and cream tones',
    },
    light: true,
  },
  {
    id: 'night_neon',
    label: { ms: 'Neon malam', en: 'Night neon' },
    colors: ['#0B1020', '#22D3EE', '#A855F7', '#F0ABFC'],
    prompt: {
      ms: 'palet gelap dengan aksen neon sian dan ungu',
      en: 'a dark palette with cyan and violet neon accents',
    },
    light: false,
  },
  {
    id: 'custom',
    label: { ms: 'Warna tersuai', en: 'Custom colours' },
    colors: [],
    prompt: { ms: 'palet warna tersuai', en: 'a custom colour palette' },
    light: false,
  },
] as const

export const PALETTE_IDS = PALETTES.map((p) => p.id) as [PaletteId, ...PaletteId[]]

/** Maksimum warna HEX tersuai (§10.1). */
export const MAX_CUSTOM_COLORS = 4

export const HEX_PATTERN = /^#[0-9A-F]{6}$/

export function getPalette(id: string): PalettePreset {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}

/** Warna berkesan: HEX tersuai mengatasi preset apabila diberikan. */
export function effectiveColors(paletteId: string, customColors: readonly string[]): string[] {
  if (customColors.length > 0) return [...customColors]
  return [...getPalette(paletteId).colors]
}

/** Luminans relatif WCAG bagi satu HEX #RRGGBB. */
export function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

/** Palet dianggap cerah apabila majoriti warnanya berluminans tinggi (§10.3). */
export function isLightPalette(colors: readonly string[]): boolean {
  const valid = colors.filter((c) => HEX_PATTERN.test(c.toUpperCase()))
  if (valid.length === 0) return false
  const lightCount = valid.filter((c) => relativeLuminance(c.toUpperCase()) > 0.55).length
  return lightCount / valid.length >= 0.5
}

/** Warna paling gelap dalam palet — dicadangkan sebagai warna teks kontras. */
export function darkestColor(colors: readonly string[]): string | undefined {
  const valid = colors.filter((c) => HEX_PATTERN.test(c.toUpperCase()))
  if (valid.length === 0) return undefined
  return valid.reduce((darkest, current) =>
    relativeLuminance(current.toUpperCase()) < relativeLuminance(darkest.toUpperCase())
      ? current
      : darkest,
  )
}
