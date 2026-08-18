/**
 * Katalog kategori poster — SDD §6.1 dan FR-001/FR-004.
 * Setiap kategori menentukan medan wajib, medan pilihan, label khusus konteks
 * dan default susun atur. Medan `mainHeadline` sentiasa wajib (Lampiran A).
 */
import type { Bilingual, ContentFieldName } from './types'

export type CategoryId =
  | 'general_event'
  | 'ucapan_tahniah'
  | 'selamat_maju_jaya'
  | 'jemputan_rasmi'
  | 'bengkel_seminar'
  | 'pertandingan'
  | 'keagamaan'
  | 'kebudayaan'
  | 'korporat'

export interface CategoryPreset {
  readonly id: CategoryId
  readonly label: Bilingual
  readonly hint: Bilingual
  /** Medan yang mesti diisi selain mainHeadline (FR-004). */
  readonly requiredFields: readonly ContentFieldName[]
  /** Medan yang dipaparkan tetapi tidak wajib. */
  readonly optionalFields: readonly ContentFieldName[]
  /** Label khusus kategori; jika tiada, label lalai medan digunakan. */
  readonly fieldLabels?: Partial<Record<ContentFieldName, Bilingual>>
  readonly fieldPlaceholders?: Partial<Record<ContentFieldName, string>>
  /** Cadangan default apabila kategori dipilih (§6.1 "Default layout"). */
  readonly defaultComposition: string
  readonly defaultSubjectType: string
  readonly layoutHint: Bilingual
  /** Ayat DESIGN TASK bagi kategori ini (§7.1). */
  readonly task: Bilingual
}

export const CATEGORIES: readonly CategoryPreset[] = [
  {
    id: 'general_event',
    label: { ms: 'Acara umum', en: 'General event' },
    hint: {
      ms: 'Program, majlis atau aktiviti dengan tarikh, masa dan tempat.',
      en: 'Programme or activity with date, time and venue.',
    },
    requiredFields: ['programName', 'date'],
    optionalFields: [
      'subHeadline',
      'time',
      'venue',
      'organizer',
      'callToAction',
      'footerNotes',
    ],
    fieldPlaceholders: {
      mainHeadline: 'MAJLIS PELANCARAN PROGRAM MESRA SISWA',
      programName: 'Program Mesra Siswa 2026',
    },
    defaultComposition: 'hero_full',
    defaultSubjectType: 'none',
    layoutHint: { ms: 'Hero atau centered', en: 'Hero or centered' },
    task: {
      ms: 'Hasilkan poster acara rasmi yang jelas dan mudah dibaca.',
      en: 'Create a clear, readable official event poster.',
    },
  },
  {
    id: 'ucapan_tahniah',
    label: { ms: 'Ucapan tahniah', en: 'Congratulations' },
    hint: {
      ms: 'Meraikan pencapaian individu atau pasukan.',
      en: 'Celebrating an individual or team achievement.',
    },
    requiredFields: ['personName', 'achievement'],
    optionalFields: [
      'subHeadline',
      'position',
      'programName',
      'date',
      'venue',
      'organizer',
      'footerNotes',
    ],
    fieldLabels: {
      programName: { ms: 'Nama pertandingan atau program', en: 'Competition or programme' },
      achievement: { ms: 'Pencapaian atau anugerah', en: 'Achievement or award' },
    },
    fieldPlaceholders: {
      mainHeadline: 'TAHNIAH',
      personName: 'Dr. Nurul Aina binti Rahim',
      achievement: 'Johan Keseluruhan Anugerah Inovasi 2026',
    },
    defaultComposition: 'subject_right',
    defaultSubjectType: 'person',
    layoutHint: { ms: 'Potret dominan', en: 'Portrait dominant' },
    task: {
      ms: 'Hasilkan poster ucapan tahniah yang meraikan pencapaian penerima.',
      en: 'Create a congratulatory poster celebrating the recipient achievement.',
    },
  },
  {
    id: 'selamat_maju_jaya',
    label: { ms: 'Selamat maju jaya', en: 'Good luck' },
    hint: {
      ms: 'Sokongan kepada wakil yang akan bertanding atau bertugas.',
      en: 'Support for a representative heading to an event.',
    },
    requiredFields: ['personName', 'programName'],
    optionalFields: [
      'subHeadline',
      'position',
      'date',
      'time',
      'venue',
      'organizer',
      'footerNotes',
    ],
    fieldLabels: {
      programName: { ms: 'Nama acara atau kejohanan', en: 'Event or championship' },
      venue: { ms: 'Lokasi acara', en: 'Event location' },
    },
    fieldPlaceholders: {
      mainHeadline: 'SELAMAT MAJU JAYA',
      personName: 'Cik Nick Ezzanny',
      position: 'Felo Kolej Tan Sri Aishah Ghani',
      programName:
        'Kejohanan Sukan Staf Antara Universiti Malaysia (SUKUM) Ke-46 Tahun 2026',
      venue: 'UniSZA, Kuala Terengganu',
      date: '6 hingga 15 Ogos 2026',
    },
    defaultComposition: 'subject_right',
    defaultSubjectType: 'person',
    layoutHint: { ms: 'Potret dengan tajuk di atas', en: 'Portrait with headline above' },
    task: {
      ms: 'Hasilkan poster selamat maju jaya yang menyokong dan bersifat institusi.',
      en: 'Create a supportive institutional good-luck poster.',
    },
  },
  {
    id: 'jemputan_rasmi',
    label: { ms: 'Jemputan rasmi', en: 'Formal invitation' },
    hint: {
      ms: 'Jemputan majlis rasmi dengan tetamu kehormat dan RSVP.',
      en: 'Formal invitation with guest of honour and RSVP.',
    },
    requiredFields: ['programName', 'date', 'venue'],
    optionalFields: [
      'subHeadline',
      'personName',
      'position',
      'time',
      'organizer',
      'callToAction',
      'footerNotes',
    ],
    fieldLabels: {
      programName: { ms: 'Nama acara', en: 'Event name' },
      personName: { ms: 'Tetamu kehormat', en: 'Guest of honour' },
      callToAction: { ms: 'Maklumat RSVP', en: 'RSVP details' },
    },
    fieldPlaceholders: {
      mainHeadline: 'JEMPUTAN MAJLIS PERASMIAN',
      callToAction: 'RSVP sebelum 30 Ogos 2026',
    },
    defaultComposition: 'symmetry',
    defaultSubjectType: 'none',
    layoutHint: { ms: 'Formal simetri', en: 'Formal symmetry' },
    task: {
      ms: 'Hasilkan poster jemputan rasmi yang bersopan dan seimbang.',
      en: 'Create a courteous, balanced formal invitation poster.',
    },
  },
  {
    id: 'bengkel_seminar',
    label: { ms: 'Bengkel atau seminar', en: 'Workshop or seminar' },
    hint: {
      ms: 'Sesi ilmiah dengan penceramah dan pendaftaran.',
      en: 'Knowledge session with speakers and registration.',
    },
    requiredFields: ['personName', 'date'],
    optionalFields: [
      'subHeadline',
      'position',
      'programName',
      'time',
      'venue',
      'organizer',
      'callToAction',
      'footerNotes',
    ],
    fieldLabels: {
      personName: { ms: 'Nama penceramah', en: 'Speaker name' },
      venue: { ms: 'Tempat atau platform', en: 'Venue or platform' },
      callToAction: { ms: 'Maklumat pendaftaran', en: 'Registration details' },
    },
    fieldPlaceholders: {
      mainHeadline: 'BENGKEL PENULISAN GERAN PENYELIDIKAN',
      venue: 'Google Meet',
      callToAction: 'Daftar di bit.ly/bengkel2026',
    },
    defaultComposition: 'split',
    defaultSubjectType: 'person',
    layoutHint: { ms: 'Split information', en: 'Split information' },
    task: {
      ms: 'Hasilkan poster bengkel atau seminar yang mengutamakan maklumat pendaftaran.',
      en: 'Create a workshop or seminar poster that foregrounds registration details.',
    },
  },
  {
    id: 'pertandingan',
    label: { ms: 'Pertandingan', en: 'Competition' },
    hint: {
      ms: 'Hebahan pertandingan dengan kategori, hadiah dan tarikh tutup.',
      en: 'Competition announcement with categories, prizes and closing date.',
    },
    requiredFields: ['programName', 'date'],
    optionalFields: [
      'subHeadline',
      'achievement',
      'time',
      'venue',
      'organizer',
      'callToAction',
      'footerNotes',
    ],
    fieldLabels: {
      programName: { ms: 'Nama pertandingan', en: 'Competition name' },
      subHeadline: { ms: 'Kategori penyertaan', en: 'Entry categories' },
      achievement: { ms: 'Hadiah ditawarkan', en: 'Prizes offered' },
      date: { ms: 'Tarikh tutup penyertaan', en: 'Entry closing date' },
    },
    fieldPlaceholders: {
      mainHeadline: 'PERTANDINGAN REKA POSTER DIGITAL',
      achievement: 'Hadiah wang tunai RM3,000',
      date: 'Tutup 20 September 2026',
    },
    defaultComposition: 'editorial_grid',
    defaultSubjectType: 'none',
    layoutHint: { ms: 'Dinamik dengan CTA menonjol', en: 'Dynamic with prominent CTA' },
    task: {
      ms: 'Hasilkan poster pertandingan yang dinamik dengan seruan tindakan yang menonjol.',
      en: 'Create a dynamic competition poster with a prominent call to action.',
    },
  },
  {
    id: 'keagamaan',
    label: { ms: 'Keagamaan', en: 'Religious programme' },
    hint: {
      ms: 'Program ibadah, ceramah atau majlis keagamaan.',
      en: 'Worship, lecture or religious ceremony.',
    },
    requiredFields: ['programName', 'date'],
    optionalFields: [
      'subHeadline',
      'personName',
      'position',
      'time',
      'venue',
      'organizer',
      'footerNotes',
    ],
    fieldLabels: {
      programName: { ms: 'Nama program', en: 'Programme name' },
      personName: { ms: 'Pengisi atau penceramah', en: 'Speaker' },
      subHeadline: { ms: 'Tema program', en: 'Programme theme' },
    },
    fieldPlaceholders: {
      mainHeadline: 'MAJLIS TAZKIRAH PERDANA',
      personName: 'Ustaz Ahmad Faiz bin Hassan',
    },
    defaultComposition: 'symmetry',
    defaultSubjectType: 'none',
    layoutHint: { ms: 'Simetri beradab', en: 'Modest symmetry' },
    task: {
      ms: 'Hasilkan poster program keagamaan yang beradab dan menghormati konteks.',
      en: 'Create a modest, contextually respectful religious programme poster.',
    },
  },
  {
    id: 'kebudayaan',
    label: { ms: 'Kebudayaan', en: 'Cultural programme' },
    hint: {
      ms: 'Persembahan seni, budaya atau festival.',
      en: 'Arts, culture or festival performance.',
    },
    requiredFields: ['programName', 'date'],
    optionalFields: [
      'subHeadline',
      'personName',
      'time',
      'venue',
      'organizer',
      'callToAction',
      'footerNotes',
    ],
    fieldLabels: {
      programName: { ms: 'Nama persembahan', en: 'Performance name' },
      personName: { ms: 'Artis atau kumpulan', en: 'Artist or group' },
      subHeadline: { ms: 'Tema persembahan', en: 'Performance theme' },
    },
    fieldPlaceholders: {
      mainHeadline: 'MALAM SENI BUDAYA NUSANTARA',
    },
    defaultComposition: 'hero_full',
    defaultSubjectType: 'group',
    layoutHint: { ms: 'Visual ekspresif', en: 'Expressive visual' },
    task: {
      ms: 'Hasilkan poster kebudayaan yang ekspresif tanpa menjejaskan kebolehbacaan.',
      en: 'Create an expressive cultural poster without harming readability.',
    },
  },
  {
    id: 'korporat',
    label: { ms: 'Korporat', en: 'Corporate' },
    hint: {
      ms: 'Kenyataan rasmi, hebahan organisasi atau pencapaian institusi.',
      en: 'Official statement or institutional announcement.',
    },
    requiredFields: ['organizer'],
    optionalFields: [
      'subHeadline',
      'programName',
      'date',
      'time',
      'venue',
      'callToAction',
      'footerNotes',
    ],
    fieldLabels: {
      subHeadline: { ms: 'Kenyataan ringkas', en: 'Short statement' },
      organizer: { ms: 'Nama organisasi', en: 'Organisation name' },
      callToAction: { ms: 'Pautan rujukan', en: 'Reference link' },
    },
    fieldPlaceholders: {
      mainHeadline: 'PENCAPAIAN KUALITI MS ISO 9001:2015',
      organizer: 'Bahagian Hal Ehwal Pelajar',
    },
    defaultComposition: 'editorial_grid',
    defaultSubjectType: 'none',
    layoutHint: { ms: 'Grid institusi', en: 'Institutional grid' },
    task: {
      ms: 'Hasilkan poster korporat yang berwibawa dan konsisten dengan identiti organisasi.',
      en: 'Create an authoritative corporate poster consistent with organisational identity.',
    },
  },
] as const

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]]

/** Label lalai bagi setiap medan kandungan apabila kategori tidak menetapkannya. */
export const DEFAULT_FIELD_LABELS: Record<ContentFieldName, Bilingual> = {
  mainHeadline: { ms: 'Tajuk utama', en: 'Main headline' },
  subHeadline: { ms: 'Subtajuk atau tema', en: 'Subheadline or theme' },
  personName: { ms: 'Nama individu', en: 'Person name' },
  position: { ms: 'Jawatan atau organisasi', en: 'Position or organisation' },
  programName: { ms: 'Nama program', en: 'Programme name' },
  achievement: { ms: 'Pencapaian atau anugerah', en: 'Achievement or award' },
  date: { ms: 'Tarikh', en: 'Date' },
  time: { ms: 'Masa', en: 'Time' },
  venue: { ms: 'Tempat', en: 'Venue' },
  organizer: { ms: 'Penganjur', en: 'Organiser' },
  callToAction: { ms: 'Seruan tindakan', en: 'Call to action' },
  footerNotes: { ms: 'Nota footer', en: 'Footer notes' },
}

/** Susunan paparan medan dalam Langkah 1 supaya hierarki kekal logik. */
export const FIELD_ORDER: readonly ContentFieldName[] = [
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
]

/**
 * Susunan blok EXACT COPY mengikut Lampiran B: lokasi mendahului tarikh
 * kerana kedua-duanya berada dalam kelompok maklumat lower third yang sama.
 */
export const EXACT_COPY_ORDER: readonly ContentFieldName[] = [
  'mainHeadline',
  'subHeadline',
  'personName',
  'position',
  'programName',
  'achievement',
  'venue',
  'date',
  'time',
  'organizer',
  'callToAction',
  'footerNotes',
]

export function getCategory(id: string): CategoryPreset {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
}

/** Senarai medan yang dipaparkan untuk kategori tertentu, mengikut FIELD_ORDER. */
export function visibleFieldsFor(category: CategoryPreset): readonly ContentFieldName[] {
  const shown = new Set<ContentFieldName>([
    'mainHeadline',
    ...category.requiredFields,
    ...category.optionalFields,
  ])
  return FIELD_ORDER.filter((f) => shown.has(f))
}

/** Medan wajib bagi kategori tertentu (mainHeadline sentiasa termasuk). */
export function requiredFieldsFor(category: CategoryPreset): readonly ContentFieldName[] {
  return ['mainHeadline', ...category.requiredFields]
}

export function labelFor(
  category: CategoryPreset,
  field: ContentFieldName,
): Bilingual {
  return category.fieldLabels?.[field] ?? DEFAULT_FIELD_LABELS[field]
}
