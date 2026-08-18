/**
 * Katalog platform sasaran — SDD §7.6 dan FR-012.
 * Metadata di sini memandu UI; kelakuan sebenar setiap adapter berada dalam
 * src/lib/prompt/adapters/. `adapterVersion` direkod dalam output (FR-022) dan
 * disemak oleh QA-06 (§7.8).
 *
 * Nota tadbir urus (§11.4): nama platform di sini tidak menjanjikan ketepatan
 * atau ciri yang tidak dikawal oleh PosterPrompt.
 */
import type { Bilingual } from './types'

export type PlatformId =
  | 'universal'
  | 'chatgpt_image'
  | 'gemini_image'
  | 'midjourney'
  | 'canva'
  | 'adobe'

export interface PlatformPreset {
  readonly id: PlatformId
  readonly label: Bilingual
  readonly hint: Bilingual
  readonly adapterVersion: string
  /** Adapter yang lemah menghasilkan teks panjang dalam imej (§10.3). */
  readonly weakTextRendering: boolean
  /** Adapter yang menerima sintaks nisbah seperti `--ar`. */
  readonly usesRatioFlag: boolean
  /** Nota ringkas yang dipaparkan dalam UI sebelum jana. */
  readonly uiNote: Bilingual
}

export const PLATFORMS: readonly PlatformPreset[] = [
  {
    id: 'universal',
    label: { ms: 'Universal', en: 'Universal' },
    hint: {
      ms: 'Prompt berlabel lengkap tanpa sintaks khusus mana-mana platform.',
      en: 'Fully labelled prompt with no platform-specific syntax.',
    },
    adapterVersion: '1.0.0',
    weakTextRendering: false,
    usesRatioFlag: false,
    uiNote: {
      ms: 'Sesuai disalin ke mana-mana alat AI atau diserahkan kepada pereka.',
      en: 'Suitable for any AI tool or for handing to a designer.',
    },
  },
  {
    id: 'chatgpt_image',
    label: { ms: 'ChatGPT Image', en: 'ChatGPT Image' },
    hint: {
      ms: 'Arahan naratif lengkap dengan penekanan pada ketepatan teks.',
      en: 'Complete narrative instruction emphasising text accuracy.',
    },
    adapterVersion: '1.0.0',
    weakTextRendering: false,
    usesRatioFlag: false,
    uiNote: {
      ms: 'Lampirkan gambar rujukan dalam sembang jika anda mahu wajah dikekalkan.',
      en: 'Attach a reference image in chat if a face must be preserved.',
    },
  },
  {
    id: 'gemini_image',
    label: { ms: 'Gemini Image', en: 'Gemini Image' },
    hint: {
      ms: 'Arahan visual dan teks berstruktur ringkas dengan kekangan ketepatan.',
      en: 'Concise structured visual and text instruction with accuracy constraints.',
    },
    adapterVersion: '1.0.0',
    weakTextRendering: false,
    usesRatioFlag: false,
    uiNote: {
      ms: 'Semak semula ejaan hasil kerana model boleh mengubah teks panjang.',
      en: 'Re-check spelling in the result; long text can be altered by the model.',
    },
  },
  {
    id: 'midjourney',
    label: { ms: 'Midjourney', en: 'Midjourney' },
    hint: {
      ms: 'Fokus visual dan komposisi. Teks poster dipisahkan ke blok berasingan.',
      en: 'Visual and composition focus. Poster text is split into a separate block.',
    },
    adapterVersion: '1.0.0',
    weakTextRendering: true,
    usesRatioFlag: true,
    uiNote: {
      ms: 'Midjourney lemah menulis teks panjang. Tambah teks melalui editor selepas imej siap.',
      en: 'Midjourney renders long text poorly. Add text in an editor afterwards.',
    },
  },
  {
    id: 'canva',
    label: { ms: 'Canva', en: 'Canva' },
    hint: {
      ms: 'Brief reka bentuk lebih pendek dan berorientasikan templat.',
      en: 'Shorter, template-oriented design brief.',
    },
    adapterVersion: '1.0.0',
    weakTextRendering: false,
    usesRatioFlag: false,
    uiNote: {
      ms: 'Teks tepat boleh terus ditaip ke dalam templat Canva.',
      en: 'Exact copy can be typed straight into the Canva template.',
    },
  },
  {
    id: 'adobe',
    label: { ms: 'Adobe', en: 'Adobe' },
    hint: {
      ms: 'Arahan visual dan latar, dengan cadangan menambah teks melalui editor.',
      en: 'Visual and background instruction, with text added in the editor.',
    },
    adapterVersion: '1.0.0',
    weakTextRendering: true,
    usesRatioFlag: false,
    uiNote: {
      ms: 'Jana latar dan visual dahulu, kemudian susun teks dalam Express atau Photoshop.',
      en: 'Generate the visual first, then set the text in Express or Photoshop.',
    },
  },
] as const

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id) as [PlatformId, ...PlatformId[]]

export function getPlatform(id: string): PlatformPreset {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0]
}

export type OutputMode = 'complete' | 'concise'

export const OUTPUT_MODES: readonly { id: OutputMode; label: Bilingual; hint: Bilingual }[] = [
  {
    id: 'complete',
    label: { ms: 'Lengkap', en: 'Complete' },
    hint: {
      ms: 'Semua bahagian arahan disertakan.',
      en: 'Every instruction section is included.',
    },
  },
  {
    id: 'concise',
    label: { ms: 'Ringkas', en: 'Concise' },
    hint: {
      ms: 'Bahagian kualiti dan nota digabungkan supaya prompt lebih pendek.',
      en: 'Quality and notes sections are merged for a shorter prompt.',
    },
  },
] as const

export const OUTPUT_MODE_IDS = OUTPUT_MODES.map((m) => m.id) as [OutputMode, ...OutputMode[]]
