/**
 * Fixtures regression — SDD §12.3.
 * Satu fixture bagi setiap kategori, setiap adapter platform, serta input
 * minimum, biasa, padat dan had maksimum.
 */
import { CATEGORIES, type CategoryId } from '@/data/categories'
import { PLATFORMS, type PlatformId } from '@/data/platforms'
import { defaultProject, type PosterProject } from '@/schemas/project'
import type { ContentFieldName } from '@/data/types'

export function makeProject(overrides: DeepPartial<PosterProject> = {}): PosterProject {
  const base = defaultProject('2026-08-13T00:00:00.000Z')
  return {
    ...base,
    ...overrides,
    content: { ...base.content, ...overrides.content },
    canvas: { ...base.canvas, ...overrides.canvas },
    style: { ...base.style, ...overrides.style },
    layout: { ...base.layout, ...overrides.layout },
    subject: { ...base.subject, ...overrides.subject },
    typography: { ...base.typography, ...overrides.typography },
    platform: { ...base.platform, ...overrides.platform },
    preferences: { ...base.preferences, ...overrides.preferences },
  } as PosterProject
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K]
}

/** Contoh rasmi daripada Lampiran B SDD. */
export const appendixBProject: PosterProject = makeProject({
  category: 'selamat_maju_jaya',
  language: 'ms',
  content: {
    mainHeadline: 'SELAMAT MAJU JAYA',
    personName: 'CIK NICK EZZANNY',
    position: 'FELO KOLEJ TAN SRI AISHAH GHANI',
    programName:
      'KEJOHANAN SUKAN STAF ANTARA UNIVERSITI MALAYSIA (SUKUM) KE-46 TAHUN 2026',
    venue: 'UNISZA, KUALA TERENGGANU',
    date: '6 HINGGA 15 OGOS 2026',
  },
  canvas: { preset: 'ig_extended', width: 1080, height: 1440, destination: 'Instagram' },
  style: {
    stylePreset: 'corporate',
    mood: 'formal',
    palettePreset: 'maroon_gold',
    background: 'clean',
  },
  layout: {
    composition: 'subject_right',
    textAlignment: 'center',
    logoZone: 'top',
    qrZone: 'none',
    assetZones: [],
  },
  subject: {
    subjectType: 'person',
    subjectCount: 1,
    subjectPosition: 'center_right',
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
})

/** Input minimum yang masih sah: hanya medan wajib kategori. */
export const minimalProject: PosterProject = makeProject({
  category: 'general_event',
  content: {
    mainHeadline: 'HARI TERBUKA 2026',
    programName: 'Hari Terbuka Kampus',
    date: '12 Mac 2026',
  },
})

/** Input biasa: kandungan sederhana dengan beberapa zon. */
export const typicalProject: PosterProject = makeProject({
  category: 'bengkel_seminar',
  content: {
    mainHeadline: 'BENGKEL PENULISAN GERAN PENYELIDIKAN',
    subHeadline: 'Siri Pembangunan Penyelidik Muda',
    personName: 'Prof. Madya Dr. Siti Aminah',
    position: 'Fakulti Sains Komputer',
    date: '18 September 2026',
    time: '9.00 pagi hingga 1.00 petang',
    venue: 'Dewan Seminar, Bangunan Utama',
    organizer: 'Pusat Pengurusan Penyelidikan',
    callToAction: 'Daftar di bit.ly/bengkel-geran',
  },
  layout: { composition: 'split', logoZone: 'top', qrZone: 'bottom_right', assetZones: ['footer'] },
})

/** Input padat: banyak teks dan zon, mencetuskan amaran ketumpatan. */
export const denseProject: PosterProject = makeProject({
  category: 'pertandingan',
  content: {
    mainHeadline: 'PERTANDINGAN REKA CIPTA POSTER DIGITAL PERINGKAT KEBANGSAAN 2026',
    subHeadline: 'Kategori Sekolah Menengah, Institusi Pengajian Tinggi dan Terbuka',
    programName: 'Pertandingan Reka Cipta Poster Digital Kebangsaan 2026',
    achievement:
      'Hadiah utama wang tunai RM5,000, piala pusingan, sijil penghargaan dan peluang latihan industri selama tiga bulan',
    date: 'Tarikh tutup penyertaan 30 September 2026 jam 11.59 malam',
    time: 'Majlis penyampaian hadiah 15 Oktober 2026, 8.30 malam',
    venue: 'Dewan Besar Kompleks Kebudayaan Negara, Kuala Lumpur',
    organizer: 'Kementerian Pendidikan dengan kerjasama Majlis Rekabentuk Negara',
    callToAction: 'Muat turun borang penyertaan dan syarat pertandingan di portal rasmi kami',
    footerNotes: 'Pertanyaan: 03-1234 5678 atau e-mel pertandingan@contoh.gov.my',
  },
  layout: {
    composition: 'editorial_grid',
    logoZone: 'top',
    qrZone: 'bottom_right',
    assetZones: ['sponsor', 'cta', 'footer'],
  },
  subject: {
    subjectType: 'group',
    subjectCount: 4,
    subjectPosition: 'center',
    crop: 'full_body',
    feathering: 'subtle',
    preserveFace: true,
    preserveClothing: true,
  },
})

/** Had maksimum: setiap medan pada panjang maksimum yang dibenarkan. */
export const maximalProject: PosterProject = makeProject({
  category: 'korporat',
  content: {
    mainHeadline: 'T'.repeat(120),
    subHeadline: 'S'.repeat(500),
    programName: 'P'.repeat(500),
    organizer: 'O'.repeat(500),
    date: 'D'.repeat(500),
    footerNotes: 'F'.repeat(500),
  },
  canvas: { preset: 'custom', width: 8000, height: 8000, destination: '' },
  style: {
    palettePreset: 'custom',
    customColors: ['#111111', '#222222', '#333333', '#444444'],
    strictPalette: true,
  },
  platform: { customInstructions: 'X'.repeat(1000) },
})

/** Satu fixture bagi setiap kategori (§12.3). */
export const categoryFixtures: Record<CategoryId, PosterProject> = Object.fromEntries(
  CATEGORIES.map((category) => {
    const content: Partial<Record<ContentFieldName, string>> = {
      mainHeadline: `POSTER ${category.label.ms.toUpperCase()}`,
    }
    for (const field of category.requiredFields) {
      content[field] = `Nilai ujian ${field}`
    }
    return [
      category.id,
      makeProject({
        category: category.id,
        content,
        layout: { composition: category.defaultComposition as never },
        subject:
          category.defaultSubjectType === 'none'
            ? {}
            : { subjectType: category.defaultSubjectType as never, subjectCount: 1 },
      }),
    ]
  }),
) as Record<CategoryId, PosterProject>

/** Satu fixture bagi setiap adapter platform (§12.3). */
export const platformFixtures: Record<PlatformId, PosterProject> = Object.fromEntries(
  PLATFORMS.map((platform) => [
    platform.id,
    makeProject({
      ...typicalProject,
      platform: { ...typicalProject.platform, targetPlatform: platform.id },
    }),
  ]),
) as Record<PlatformId, PosterProject>

/** Teks Unicode campuran untuk UAT-11. */
export const unicodeProject: PosterProject = makeProject({
  category: 'keagamaan',
  content: {
    mainHeadline: 'MAJLIS TAZKIRAH PERDANA',
    programName: 'Tazkirah Maulidur Rasul ﷺ',
    subHeadline: 'بسم الله الرحمن الرحيم',
    personName: 'Ustaz Ahmad Faiz bin Hassan',
    date: '12 Rabiulawal 1448H',
    venue: 'Masjid Al-Hidayah, Serdang',
  },
})
