/**
 * Teks contoh untuk butang "Kejutkan saya" (§5.3).
 *
 * PENTING: teks di sini ialah *contoh*, bukan fakta. Enjin prompt tidak pernah
 * mereka fakta (QA-07) dan katalog ini tidak pernah disentuh oleh
 * `lib/prompt/**` — ia hanya diisi ke dalam borang oleh tindakan pengguna yang
 * eksplisit, dan setiap medan yang diisi ditandakan supaya pengguna tahu ia
 * mesti diganti sebelum poster sebenar dijana.
 *
 * Nama orang sengaja generik dan tidak merujuk individu sebenar.
 */
import type { CategoryId } from './categories'
import type { ContentFieldName } from './types'

type SamplePool = Partial<Record<ContentFieldName, readonly string[]>>

/** Contoh yang dikongsi apabila kategori tidak menyenaraikan medan itu. */
const SHARED: SamplePool = {
  date: ['12 November 2026', '3 Mac 2026', '27 Julai 2026', '19 September 2026'],
  time: ['8.30 malam', '9.00 pagi', '2.30 petang', '10.00 pagi'],
  venue: [
    'Dewan Besar, Bangunan Pentadbiran',
    'Auditorium Fakulti Sains',
    'Dewan Serbaguna Kolej Kediaman',
    'Panggung Percubaan',
  ],
  organizer: [
    'Bahagian Hal Ehwal Pelajar',
    'Majlis Perwakilan Pelajar',
    'Jabatan Komunikasi Korporat',
    'Kelab Kebudayaan Universiti',
  ],
  personName: [
    'Dr. Aisyah binti Rahman',
    'Encik Danial bin Zulkifli',
    'Puan Suriani binti Osman',
    'Dr. Haziq bin Ariffin',
  ],
  position: [
    'Timbalan Naib Canselor (Hal Ehwal Pelajar)',
    'Dekan Fakulti Sains Komputer',
    'Pengarah Program',
  ],
  programName: ['Program Mesra Siswa 2026', 'Siri Wacana Ilmu', 'Karnival Kampus Lestari'],
  achievement: [
    'Anugerah Pelajar Cemerlang 2026',
    'Naib Johan Debat Kebangsaan',
    'Anugerah Perkhidmatan Cemerlang',
  ],
}

/** Contoh khusus kategori; medan yang tiada di sini jatuh balik kepada SHARED. */
const BY_CATEGORY: Record<CategoryId, SamplePool> = {
  general_event: {
    mainHeadline: [
      'MAJLIS PERASMIAN MINGGU MESRA SISWA',
      'KARNIVAL SUKAN STAF 2026',
      'MALAM APRESIASI SUKARELAWAN',
    ],
    programName: [
      'Minggu Mesra Siswa 2026',
      'Karnival Sukan Staf Peringkat Universiti',
      'Program Bakti Siswa Luar Kampus',
    ],
  },
  ucapan_tahniah: {
    mainHeadline: ['SETINGGI-TINGGI TAHNIAH', 'TAHNIAH DIUCAPKAN', 'SYABAS DAN TAHNIAH'],
    achievement: [
      'Anugerah Pensyarah Cemerlang 2026',
      'Johan Pertandingan Inovasi Peringkat Kebangsaan',
      'Anugerah Pelajar Terbaik Fakulti',
    ],
  },
  selamat_maju_jaya: {
    mainHeadline: ['SELAMAT MAJU JAYA', 'SEMOGA BERJAYA', 'SELAMAT BERJUANG'],
    programName: [
      'Kejohanan Bola Jaring MASUM 2026',
      'Pertandingan Robotik Antarabangsa',
      'Debat Piala Naib Canselor',
    ],
  },
  jemputan_rasmi: {
    mainHeadline: ['JEMPUTAN RASMI', 'MAJLIS MAKAN MALAM TAHUNAN', 'MAJLIS PENYAMPAIAN ANUGERAH'],
    programName: [
      'Majlis Makan Malam Anugerah Tahunan',
      'Majlis Konvokesyen Ke-30',
      'Majlis Pelancaran Buku Ilmiah',
    ],
  },
  bengkel_seminar: {
    mainHeadline: [
      'BENGKEL PENULISAN GERAN PENYELIDIKAN',
      'SEMINAR KESIHATAN MENTAL SISWA',
      'BENGKEL KEMAHIRAN INSANIAH',
    ],
  },
  pertandingan: {
    mainHeadline: [
      'PERTANDINGAN INOVASI DIGITAL 2026',
      'KEJOHANAN E-SUKAN ANTARA KOLEJ',
      'PERTANDINGAN FOTOGRAFI KAMPUS',
    ],
    programName: [
      'Pertandingan Inovasi Digital 2026',
      'Kejohanan E-Sukan Antara Kolej Kediaman',
      'Pertandingan Fotografi Kampus Lestari',
    ],
  },
  keagamaan: {
    mainHeadline: [
      'MAJLIS TADARUS AL-QURAN',
      'CERAMAH SEMPENA MAULIDUR RASUL',
      'MAJLIS KHATAM AL-QURAN PERDANA',
    ],
    programName: [
      'Majlis Tadarus Al-Quran Perdana',
      'Program Ihya Ramadan',
      'Ceramah Maulidur Rasul Peringkat Universiti',
    ],
  },
  kebudayaan: {
    mainHeadline: [
      'MALAM KEBUDAYAAN ANTARABANGSA',
      'FESTIVAL SENI WARISAN',
      'PERSEMBAHAN TARIAN TRADISIONAL',
    ],
    programName: [
      'Malam Kebudayaan Antarabangsa 2026',
      'Festival Seni Warisan Nusantara',
      'Pesta Tanglung Kampus',
    ],
  },
  korporat: {
    mainHeadline: [
      'KENYATAAN RASMI PENCAPAIAN 2026',
      'PELANCARAN PELAN STRATEGIK',
      'HEBAHAN PENCAPAIAN INSTITUSI',
    ],
    organizer: [
      'Jabatan Komunikasi Korporat',
      'Pejabat Naib Canselor',
      'Bahagian Perancangan Strategik',
    ],
  },
}

/** Senarai contoh bagi satu medan mengikut kategori, atau kosong jika tiada. */
export function samplesFor(category: CategoryId, field: ContentFieldName): readonly string[] {
  return BY_CATEGORY[category]?.[field] ?? SHARED[field] ?? []
}
