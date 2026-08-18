/**
 * Skema PosterProject — SDD §8.1, Lampiran A dan peraturan validasi §10.1.
 *
 * Semua mesej ralat ditulis dalam Bahasa Melayu (NFR-012) dan menerangkan cara
 * membetulkan, bukan sekadar menyatakan kegagalan (§10.2).
 */
import { z } from 'zod'
import { CATEGORY_IDS, getCategory, requiredFieldsFor } from '@/data/categories'
import {
  CANVAS_PRESET_IDS,
  MAX_DIMENSION,
  MIN_DIMENSION,
  getCanvasPreset,
  orientationOf,
  simplifyRatio,
} from '@/data/canvas'
import { HEX_PATTERN, MAX_CUSTOM_COLORS, PALETTE_IDS } from '@/data/palettes'
import { OUTPUT_MODE_IDS, PLATFORM_IDS } from '@/data/platforms'
import { SCHEMA_VERSION, TEMPLATE_VERSION } from '@/data/version'
import {
  ASSET_ZONE_IDS,
  BACKGROUND_IDS,
  COMPOSITION_IDS,
  CROP_IDS,
  FEATHERING_IDS,
  LOGO_ZONE_IDS,
  MAX_ASSET_ZONES,
  MOOD_IDS,
  QR_ZONE_IDS,
  STYLE_IDS,
  SUBJECT_POSITION_IDS,
  SUBJECT_TYPE_IDS,
  TEXT_ALIGNMENT_IDS,
  TEXT_CONTRAST_IDS,
  TYPEFACE_IDS,
} from '@/data/styles'
import { CONTENT_FIELD_NAMES, type ContentFieldName } from '@/data/types'

/** Had panjang setiap blok teks poster (§10.1). */
export const MAX_BLOCK_LENGTH = 500
export const MAX_HEADLINE_LENGTH = 120
export const MIN_HEADLINE_LENGTH = 3
/** Ambang amaran lembut tajuk — bukan ralat (§10.1). */
export const HEADLINE_WARN_LENGTH = 80
export const MAX_CUSTOM_INSTRUCTIONS = 1000
export const MAX_SUBJECT_COUNT = 10

const optionalBlock = z
  .string()
  .max(MAX_BLOCK_LENGTH, {
    error: `Blok teks ini melebihi ${MAX_BLOCK_LENGTH} aksara. Pendekkan teks atau pindahkan sebahagiannya ke medan lain.`,
  })
  .default('')

export const contentSchema = z.object({
  mainHeadline: z
    .string()
    // Trim sebelum semakan panjang: tajuk yang hanya mengandungi ruang adalah
    // tajuk kosong, dan medan wajib tidak boleh lulus dengannya (§10.1, §10.2).
    .trim()
    .min(MIN_HEADLINE_LENGTH, {
      error: `Tajuk utama wajib diisi dan sekurang-kurangnya ${MIN_HEADLINE_LENGTH} aksara.`,
    })
    .max(MAX_HEADLINE_LENGTH, {
      error: `Tajuk utama tidak boleh melebihi ${MAX_HEADLINE_LENGTH} aksara. Pindahkan butiran lanjut ke subtajuk.`,
    }),
  subHeadline: optionalBlock,
  personName: optionalBlock,
  position: optionalBlock,
  programName: optionalBlock,
  achievement: optionalBlock,
  date: optionalBlock,
  time: optionalBlock,
  venue: optionalBlock,
  organizer: optionalBlock,
  callToAction: optionalBlock,
  footerNotes: optionalBlock,
})

export const canvasSchema = z.object({
  preset: z.enum(CANVAS_PRESET_IDS),
  width: z
    .number({ error: 'Lebar wajib diisi dengan nombor.' })
    .int({ error: 'Lebar mesti nombor bulat dalam piksel.' })
    .min(MIN_DIMENSION, { error: `Lebar minimum ialah ${MIN_DIMENSION} px.` })
    .max(MAX_DIMENSION, { error: `Lebar maksimum ialah ${MAX_DIMENSION} px.` }),
  height: z
    .number({ error: 'Tinggi wajib diisi dengan nombor.' })
    .int({ error: 'Tinggi mesti nombor bulat dalam piksel.' })
    .min(MIN_DIMENSION, { error: `Tinggi minimum ialah ${MIN_DIMENSION} px.` })
    .max(MAX_DIMENSION, { error: `Tinggi maksimum ialah ${MAX_DIMENSION} px.` }),
  destination: z.string().max(120).default(''),
})

export const styleSchema = z.object({
  stylePreset: z.enum(STYLE_IDS),
  mood: z.enum(MOOD_IDS),
  palettePreset: z.enum(PALETTE_IDS),
  customColors: z
    .array(
      z.string().regex(HEX_PATTERN, {
        error: 'Gunakan format warna #RRGGBB, contohnya #7A0026.',
      }),
    )
    .max(MAX_CUSTOM_COLORS, {
      error: `Maksimum ${MAX_CUSTOM_COLORS} warna tersuai sahaja.`,
    })
    .default([]),
  /** §7.7 peraturan keempat: larang warna di luar palet apabila palet ketat. */
  strictPalette: z.boolean().default(false),
  background: z.enum(BACKGROUND_IDS),
})

export const layoutSchema = z.object({
  composition: z.enum(COMPOSITION_IDS),
  textAlignment: z.enum(TEXT_ALIGNMENT_IDS),
  logoZone: z.enum(LOGO_ZONE_IDS),
  qrZone: z.enum(QR_ZONE_IDS),
  assetZones: z.array(z.enum(ASSET_ZONE_IDS)).default([]),
})

export const subjectSchema = z.object({
  subjectType: z.enum(SUBJECT_TYPE_IDS),
  subjectCount: z
    .number({ error: 'Bilangan subjek mesti nombor.' })
    .int({ error: 'Bilangan subjek mesti nombor bulat.' })
    .min(0, { error: 'Bilangan subjek tidak boleh negatif.' })
    .max(MAX_SUBJECT_COUNT, { error: `Bilangan subjek maksimum ialah ${MAX_SUBJECT_COUNT}.` }),
  subjectPosition: z.enum(SUBJECT_POSITION_IDS),
  crop: z.enum(CROP_IDS),
  feathering: z.enum(FEATHERING_IDS),
  preserveFace: z.boolean(),
  preserveClothing: z.boolean(),
})

export const typographySchema = z.object({
  titleTypeface: z.enum(TYPEFACE_IDS),
  bodyTypeface: z.enum(TYPEFACE_IDS),
  textContrast: z.enum(TEXT_CONTRAST_IDS),
})

export const platformSchema = z.object({
  targetPlatform: z.enum(PLATFORM_IDS),
  promptLanguage: z.enum(['ms', 'en']),
  outputMode: z.enum(OUTPUT_MODE_IDS),
  customInstructions: z
    .string()
    .max(MAX_CUSTOM_INSTRUCTIONS, {
      error: `Arahan tambahan tidak boleh melebihi ${MAX_CUSTOM_INSTRUCTIONS} aksara.`,
    })
    .default(''),
})

/** Bentuk asas tanpa peraturan silang medan — kekalkan `.shape` untuk UI. */
export const posterProjectBaseSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  templateVersion: z.string(),
  category: z.enum(CATEGORY_IDS),
  language: z.enum(['ms', 'en', 'bilingual']),
  content: contentSchema,
  canvas: canvasSchema,
  style: styleSchema,
  layout: layoutSchema,
  subject: subjectSchema,
  typography: typographySchema,
  platform: platformSchema,
  preferences: z.object({ saveDraft: z.boolean() }),
  updatedAt: z.string(),
})

export type PosterProject = z.infer<typeof posterProjectBaseSchema>
export type PosterContent = z.infer<typeof contentSchema>
export type CanvasConfig = z.infer<typeof canvasSchema>
export type StyleConfig = z.infer<typeof styleSchema>
export type LayoutConfig = z.infer<typeof layoutSchema>
export type SubjectConfig = z.infer<typeof subjectSchema>
export type TypographyConfig = z.infer<typeof typographySchema>
export type PlatformConfig = z.infer<typeof platformSchema>

/** Jumlah zon aset aktif — digunakan oleh skor ketumpatan dan had §10.1. */
export function countZones(layout: Pick<LayoutConfig, 'logoZone' | 'qrZone' | 'assetZones'>): number {
  return (
    (layout.logoZone !== 'none' ? 1 : 0) +
    (layout.qrZone !== 'none' ? 1 : 0) +
    layout.assetZones.length
  )
}

/**
 * Skema penuh dengan peraturan silang medan.
 * Peraturan bersyarat kategori (FR-004) dipacu oleh katalog, bukan senarai
 * keras di sini, supaya menambah kategori baharu tidak menyentuh skema.
 */
export const posterProjectSchema = posterProjectBaseSchema.superRefine((project, ctx) => {
  // FR-004: medan wajib berubah mengikut kategori.
  const category = getCategory(project.category)
  for (const field of requiredFieldsFor(category)) {
    if (field === 'mainHeadline') continue // dikendalikan oleh contentSchema
    const value = project.content[field]
    if (!value || value.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['content', field],
        message: `Medan ini wajib diisi untuk kategori ${category.label.ms.toLowerCase()}.`,
      })
    }
  }

  // §10.1: kedudukan dan bilangan subjek.
  if (project.subject.subjectType !== 'none' && project.subject.subjectCount < 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['subject', 'subjectCount'],
      message: 'Nyatakan sekurang-kurangnya satu subjek atau tukar jenis subjek kepada "Tiada subjek".',
    })
  }
  if (project.subject.subjectType === 'none' && project.subject.subjectCount > 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['subject', 'subjectCount'],
      message: 'Pilih jenis subjek terlebih dahulu sebelum menetapkan bilangan.',
    })
  }

  // §10.1: maksimum lima zon aset serentak.
  const zoneCount = countZones(project.layout)
  if (zoneCount > MAX_ASSET_ZONES) {
    ctx.addIssue({
      code: 'custom',
      path: ['layout', 'assetZones'],
      message: `Maksimum ${MAX_ASSET_ZONES} zon aset. Buang ${zoneCount - MAX_ASSET_ZONES} zon sebelum meneruskan.`,
    })
  }

  // FR-007: palet tersuai memerlukan sekurang-kurangnya satu warna.
  if (project.style.palettePreset === 'custom' && project.style.customColors.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['style', 'customColors'],
      message: 'Tambah sekurang-kurangnya satu warna HEX atau pilih preset palet.',
    })
  }

  // §10.1: lebar dan tinggi wajib bersama bagi dimensi tersuai.
  if (project.canvas.preset === 'custom') {
    if (!Number.isFinite(project.canvas.width) || !Number.isFinite(project.canvas.height)) {
      ctx.addIssue({
        code: 'custom',
        path: ['canvas', 'width'],
        message: 'Lebar dan tinggi wajib diisi bersama untuk dimensi tersuai.',
      })
    }
  }
})

/* ------------------------------------------------------ langkah wizard */

export type StepId = 'kandungan' | 'kanvas' | 'gaya' | 'susun_atur' | 'platform'

export const STEP_IDS: readonly StepId[] = [
  'kandungan',
  'kanvas',
  'gaya',
  'susun_atur',
  'platform',
]

/** Nama medan RHF bagi setiap langkah, untuk `trigger()` per langkah (§10.2). */
export const STEP_FIELDS: Record<StepId, readonly string[]> = {
  kandungan: ['category', 'language', ...CONTENT_FIELD_NAMES.map((f) => `content.${f}`)],
  kanvas: ['canvas.preset', 'canvas.width', 'canvas.height', 'canvas.destination'],
  gaya: [
    'style.stylePreset',
    'style.mood',
    'style.palettePreset',
    'style.customColors',
    'style.strictPalette',
    'style.background',
    'typography.titleTypeface',
    'typography.bodyTypeface',
    'typography.textContrast',
  ],
  susun_atur: [
    'layout.composition',
    'layout.textAlignment',
    'layout.logoZone',
    'layout.qrZone',
    'layout.assetZones',
    'subject.subjectType',
    'subject.subjectCount',
    'subject.subjectPosition',
    'subject.crop',
    'subject.feathering',
    'subject.preserveFace',
    'subject.preserveClothing',
  ],
  platform: [
    'platform.targetPlatform',
    'platform.promptLanguage',
    'platform.outputMode',
    'platform.customInstructions',
  ],
}

export const STEP_LABELS: Record<StepId, { title: string; description: string }> = {
  kandungan: {
    title: 'Kandungan',
    description: 'Kategori, bahasa dan teks rasmi poster.',
  },
  kanvas: {
    title: 'Kanvas',
    description: 'Saiz, orientasi dan destinasi penerbitan.',
  },
  gaya: {
    title: 'Gaya',
    description: 'Gaya visual, mood, palet dan tipografi.',
  },
  susun_atur: {
    title: 'Susun atur',
    description: 'Komposisi, subjek dan zon aset.',
  },
  platform: {
    title: 'Platform',
    description: 'Adapter sasaran, semakan dan penjanaan.',
  },
}

/** Langkah yang memiliki medan tertentu — untuk pautan "Sunting" (FR-019). */
export function stepForField(path: string): StepId {
  if (path.startsWith('content') || path === 'category' || path === 'language') return 'kandungan'
  if (path.startsWith('canvas')) return 'kanvas'
  if (path.startsWith('style') || path.startsWith('typography')) return 'gaya'
  if (path.startsWith('layout') || path.startsWith('subject')) return 'susun_atur'
  return 'platform'
}

/* ---------------------------------------------------------- nilai lalai */

/** Nilai lalai tepat seperti Lampiran A. */
export function defaultProject(updatedAt = ''): PosterProject {
  const preset = getCanvasPreset('ig_portrait')
  return {
    schemaVersion: SCHEMA_VERSION,
    templateVersion: TEMPLATE_VERSION,
    category: 'general_event',
    language: 'ms',
    content: {
      mainHeadline: '',
      subHeadline: '',
      personName: '',
      position: '',
      programName: '',
      achievement: '',
      date: '',
      time: '',
      venue: '',
      organizer: '',
      callToAction: '',
      footerNotes: '',
    },
    canvas: {
      preset: 'ig_portrait',
      width: preset.width,
      height: preset.height,
      destination: '',
    },
    style: {
      stylePreset: 'corporate',
      mood: 'formal',
      palettePreset: 'maroon_gold',
      customColors: [],
      strictPalette: false,
      background: 'clean',
    },
    layout: {
      composition: 'centered',
      textAlignment: 'center',
      logoZone: 'top',
      qrZone: 'none',
      assetZones: [],
    },
    subject: {
      subjectType: 'none',
      subjectCount: 0,
      subjectPosition: 'center',
      crop: 'half_body',
      feathering: 'subtle',
      preserveFace: true,
      preserveClothing: true,
    },
    typography: {
      titleTypeface: 'bold_condensed',
      bodyTypeface: 'corporate_sans',
      textContrast: 'high',
    },
    platform: {
      targetPlatform: 'universal',
      promptLanguage: 'en',
      outputMode: 'complete',
      customInstructions: '',
    },
    preferences: { saveDraft: false },
    updatedAt,
  }
}

/** Metadata kanvas terbitan — dikira, tidak disimpan (§7.4). */
export function canvasMeta(canvas: CanvasConfig) {
  const presetInfo = getCanvasPreset(canvas.preset)
  const ratio =
    canvas.preset !== 'custom' && presetInfo.ratio
      ? presetInfo.ratio
      : simplifyRatio(canvas.width, canvas.height)
  return {
    ratio,
    orientation: orientationOf(canvas.width, canvas.height),
    presetLabel: presetInfo.label,
    destination: canvas.destination || presetInfo.destination.ms,
  }
}

export const CONTENT_FIELDS = CONTENT_FIELD_NAMES
export type { ContentFieldName }
