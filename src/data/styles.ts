/**
 * Katalog gaya, mood, komposisi, tipografi, subjek dan zon — SDD §6.3.
 * Setiap entri membawa label BM untuk UI dan deskriptor dwibahasa untuk prompt.
 */
import type { Bilingual, PresetOption } from './types'

/* ------------------------------------------------------------------ gaya */

export type StyleId =
  | 'corporate'
  | 'minimalist'
  | 'premium'
  | 'elegant'
  | 'modern'
  | 'futuristic'
  | 'islamic_geometric'
  | 'traditional_malay'
  | 'cultural'
  | 'cinematic'
  | 'editorial'
  | 'youth'

export interface StylePreset extends PresetOption<StyleId> {
  /**
   * Gaya yang secara semula jadi bersifat berhias. Digunakan oleh peraturan
   * negative prompt supaya larangan "excessive ornamentation" tidak
   * bercanggah dengan gaya utama (§7.7 peraturan kelima).
   */
  readonly ornamental: boolean
  /** Gaya yang mengutamakan ruang kosong; asas amaran konflik §10.3. */
  readonly minimal: boolean
}

export const STYLES: readonly StylePreset[] = [
  {
    id: 'corporate',
    label: { ms: 'Korporat', en: 'Corporate' },
    hint: { ms: 'Rasmi, kemas dan institusi.', en: 'Formal, tidy, institutional.' },
    prompt: {
      ms: 'gaya korporat institusi yang kemas dengan struktur jelas',
      en: 'clean institutional corporate style with clear structure',
    },
    ornamental: false,
    minimal: false,
  },
  {
    id: 'minimalist',
    label: { ms: 'Minimalis', en: 'Minimalist' },
    hint: { ms: 'Ruang kosong luas, elemen sedikit.', en: 'Generous whitespace, few elements.' },
    prompt: {
      ms: 'gaya minimalis dengan ruang kosong luas dan elemen paling sedikit',
      en: 'minimalist style with generous negative space and very few elements',
    },
    ornamental: false,
    minimal: true,
  },
  {
    id: 'premium',
    label: { ms: 'Premium', en: 'Premium' },
    hint: { ms: 'Mewah, kontras tinggi, aksen logam.', en: 'Luxurious, high contrast, metallic accents.' },
    prompt: {
      ms: 'gaya premium mewah dengan aksen halus bernada logam dan kontras tinggi',
      en: 'premium luxury style with subtle metallic accents and high contrast',
    },
    ornamental: true,
    minimal: false,
  },
  {
    id: 'elegant',
    label: { ms: 'Elegan', en: 'Elegant' },
    hint: { ms: 'Halus, seimbang, tenang.', en: 'Refined, balanced, calm.' },
    prompt: {
      ms: 'gaya elegan yang halus dan seimbang',
      en: 'elegant refined style with balanced proportions',
    },
    ornamental: true,
    minimal: false,
  },
  {
    id: 'modern',
    label: { ms: 'Moden', en: 'Modern' },
    hint: { ms: 'Bentuk geometri bersih dan segar.', en: 'Clean geometric shapes, fresh.' },
    prompt: {
      ms: 'gaya moden dengan bentuk geometri bersih',
      en: 'modern style with clean geometric shapes',
    },
    ornamental: false,
    minimal: false,
  },
  {
    id: 'futuristic',
    label: { ms: 'Futuristik', en: 'Futuristic' },
    hint: { ms: 'Teknologi, cahaya dan gradien.', en: 'Tech, light and gradients.' },
    prompt: {
      ms: 'gaya futuristik bertenaga teknologi dengan gradien dan kesan cahaya terkawal',
      en: 'futuristic technology-driven style with gradients and controlled light effects',
    },
    ornamental: true,
    minimal: false,
  },
  {
    id: 'islamic_geometric',
    label: { ms: 'Islamik geometri', en: 'Islamic geometric' },
    hint: { ms: 'Corak geometri Islam yang beradab.', en: 'Modest Islamic geometric patterns.' },
    prompt: {
      ms: 'gaya Islamik dengan corak geometri yang beradab dan tidak menggambarkan imej terlarang',
      en: 'Islamic style with modest geometric patterning and no prohibited imagery',
    },
    ornamental: true,
    minimal: false,
  },
  {
    id: 'traditional_malay',
    label: { ms: 'Tradisional Melayu', en: 'Traditional Malay' },
    hint: { ms: 'Motif songket dan ukiran Melayu.', en: 'Songket and Malay carving motifs.' },
    prompt: {
      ms: 'gaya tradisional Melayu dengan motif songket dan ukiran halus',
      en: 'traditional Malay style with songket and fine carving motifs',
    },
    ornamental: true,
    minimal: false,
  },
  {
    id: 'cultural',
    label: { ms: 'Kebudayaan', en: 'Cultural' },
    hint: { ms: 'Ekspresif, berwarna, meraikan.', en: 'Expressive, colourful, celebratory.' },
    prompt: {
      ms: 'gaya kebudayaan yang ekspresif dan meraikan',
      en: 'expressive celebratory cultural style',
    },
    ornamental: true,
    minimal: false,
  },
  {
    id: 'cinematic',
    label: { ms: 'Sinematik', en: 'Cinematic' },
    hint: { ms: 'Pencahayaan dramatik seperti filem.', en: 'Dramatic film-like lighting.' },
    prompt: {
      ms: 'gaya sinematik dengan pencahayaan dramatik dan kedalaman ruang',
      en: 'cinematic style with dramatic lighting and spatial depth',
    },
    ornamental: false,
    minimal: false,
  },
  {
    id: 'editorial',
    label: { ms: 'Editorial', en: 'Editorial' },
    hint: { ms: 'Susunan majalah dengan grid ketat.', en: 'Magazine layout with a strict grid.' },
    prompt: {
      ms: 'gaya editorial majalah dengan grid ketat dan tipografi menonjol',
      en: 'editorial magazine style with a strict grid and prominent typography',
    },
    ornamental: false,
    minimal: false,
  },
  {
    id: 'youth',
    label: { ms: 'Belia', en: 'Youth' },
    hint: { ms: 'Tenaga tinggi, warna berani.', en: 'High energy, bold colour.' },
    prompt: {
      ms: 'gaya belia bertenaga tinggi dengan warna berani',
      en: 'high-energy youth style with bold colour',
    },
    ornamental: true,
    minimal: false,
  },
] as const

/* ------------------------------------------------------------------ mood */

export type MoodId =
  | 'formal'
  | 'uplifting'
  | 'celebratory'
  | 'calm'
  | 'dramatic'
  | 'energetic'
  | 'reverent'
  | 'premium'

export const MOODS: readonly PresetOption<MoodId>[] = [
  {
    id: 'formal',
    label: { ms: 'Formal', en: 'Formal' },
    prompt: { ms: 'nada formal dan berwibawa', en: 'a formal, authoritative tone' },
  },
  {
    id: 'uplifting',
    label: { ms: 'Memberangsangkan', en: 'Uplifting' },
    prompt: { ms: 'nada memberangsangkan dan positif', en: 'an uplifting, positive tone' },
  },
  {
    id: 'celebratory',
    label: { ms: 'Meraikan', en: 'Celebratory' },
    prompt: { ms: 'nada meraikan dan gembira', en: 'a celebratory, joyful tone' },
  },
  {
    id: 'calm',
    label: { ms: 'Tenang', en: 'Calm' },
    prompt: { ms: 'nada tenang dan lapang', en: 'a calm, spacious tone' },
  },
  {
    id: 'dramatic',
    label: { ms: 'Dramatik', en: 'Dramatic' },
    prompt: { ms: 'nada dramatik dengan kontras kuat', en: 'a dramatic tone with strong contrast' },
  },
  {
    id: 'energetic',
    label: { ms: 'Bertenaga', en: 'Energetic' },
    prompt: { ms: 'nada bertenaga dan pantas', en: 'an energetic, fast-moving tone' },
  },
  {
    id: 'reverent',
    label: { ms: 'Khusyuk', en: 'Reverent' },
    prompt: { ms: 'nada khusyuk dan penuh hormat', en: 'a reverent, respectful tone' },
  },
  {
    id: 'premium',
    label: { ms: 'Eksklusif', en: 'Premium' },
    prompt: { ms: 'nada eksklusif dan berprestij', en: 'an exclusive, prestigious tone' },
  },
] as const

/* ------------------------------------------------------------ komposisi */

export type CompositionId =
  | 'centered'
  | 'symmetry'
  | 'split'
  | 'subject_left'
  | 'subject_right'
  | 'hero_full'
  | 'editorial_grid'

export interface CompositionPreset extends PresetOption<CompositionId> {
  /** Kedudukan subjek yang tersirat, digunakan untuk pengesanan konflik §10.3. */
  readonly implicitSubjectSide?: 'left' | 'right'
}

export const COMPOSITIONS: readonly CompositionPreset[] = [
  {
    id: 'centered',
    label: { ms: 'Berpusat', en: 'Centered' },
    hint: { ms: 'Semua elemen pada paksi tengah.', en: 'Everything on the centre axis.' },
    prompt: {
      ms: 'komposisi berpusat dengan semua elemen utama pada paksi tengah',
      en: 'centered composition with all key elements on the central axis',
    },
  },
  {
    id: 'symmetry',
    label: { ms: 'Simetri', en: 'Symmetry' },
    hint: { ms: 'Seimbang kiri dan kanan.', en: 'Balanced left and right.' },
    prompt: {
      ms: 'komposisi simetri yang seimbang antara kiri dan kanan',
      en: 'symmetrical composition balanced between left and right',
    },
  },
  {
    id: 'split',
    label: { ms: 'Split', en: 'Split' },
    hint: { ms: 'Dua bahagian: visual dan maklumat.', en: 'Two panels: visual and information.' },
    prompt: {
      ms: 'komposisi split dua bahagian: satu bahagian visual dan satu bahagian maklumat',
      en: 'split composition with one visual panel and one information panel',
    },
  },
  {
    id: 'subject_left',
    label: { ms: 'Subjek di kiri', en: 'Subject left' },
    hint: { ms: 'Subjek kiri, teks kanan.', en: 'Subject left, text right.' },
    prompt: {
      ms: 'subjek diletakkan di sebelah kiri dengan teks pada bahagian kanan',
      en: 'subject placed on the left with text occupying the right side',
    },
    implicitSubjectSide: 'left',
  },
  {
    id: 'subject_right',
    label: { ms: 'Subjek di kanan', en: 'Subject right' },
    hint: { ms: 'Subjek kanan, teks kiri.', en: 'Subject right, text left.' },
    prompt: {
      ms: 'subjek diletakkan di sebelah kanan dengan teks pada bahagian kiri',
      en: 'subject placed on the right with text occupying the left side',
    },
    implicitSubjectSide: 'right',
  },
  {
    id: 'hero_full',
    label: { ms: 'Hero penuh', en: 'Full hero' },
    hint: { ms: 'Visual penuh dengan teks bertindih.', en: 'Full-bleed visual with overlaid text.' },
    prompt: {
      ms: 'komposisi hero penuh dengan visual memenuhi kanvas dan teks bertindih secara terkawal',
      en: 'full-bleed hero composition with the visual filling the canvas and controlled text overlay',
    },
  },
  {
    id: 'editorial_grid',
    label: { ms: 'Grid editorial', en: 'Editorial grid' },
    hint: { ms: 'Blok maklumat tersusun rapi.', en: 'Neatly ordered information blocks.' },
    prompt: {
      ms: 'komposisi grid editorial dengan blok maklumat tersusun rapi',
      en: 'editorial grid composition with neatly ordered information blocks',
    },
  },
] as const

/* ------------------------------------------------------------- tipografi */

/**
 * Kedudukan subjek yang sepadan dengan komposisi yang mempunyai sisi tersirat.
 * Digunakan untuk menyelaraskan pilihan supaya bahagian COMPOSITION dan
 * SUBJECT dalam prompt tidak memberi arahan yang bercanggah.
 */
export function subjectPositionForComposition(compositionId: string): string | null {
  const composition = COMPOSITIONS.find((item) => item.id === compositionId)
  if (!composition?.implicitSubjectSide) return null
  return composition.implicitSubjectSide === 'left' ? 'center_left' : 'center_right'
}

export type TypefaceId =
  | 'corporate_sans'
  | 'bold_condensed'
  | 'elegant_serif'
  | 'modern_geometric'
  | 'rounded_friendly'
  | 'editorial'
  | 'futuristic'

export const TYPEFACES: readonly PresetOption<TypefaceId>[] = [
  {
    id: 'corporate_sans',
    label: { ms: 'Corporate sans', en: 'Corporate sans' },
    prompt: {
      ms: 'sans-serif korporat yang bersih dan neutral',
      en: 'a clean, neutral corporate sans-serif',
    },
  },
  {
    id: 'bold_condensed',
    label: { ms: 'Bold condensed', en: 'Bold condensed' },
    prompt: {
      ms: 'sans-serif tebal dan mampat untuk kesan kuat',
      en: 'a bold condensed sans-serif for strong impact',
    },
  },
  {
    id: 'elegant_serif',
    label: { ms: 'Elegant serif', en: 'Elegant serif' },
    prompt: { ms: 'serif elegan berkontras halus', en: 'an elegant serif with refined contrast' },
  },
  {
    id: 'modern_geometric',
    label: { ms: 'Modern geometric', en: 'Modern geometric' },
    prompt: {
      ms: 'sans-serif geometri moden',
      en: 'a modern geometric sans-serif',
    },
  },
  {
    id: 'rounded_friendly',
    label: { ms: 'Rounded friendly', en: 'Rounded friendly' },
    prompt: { ms: 'sans-serif bucu bulat yang mesra', en: 'a friendly rounded sans-serif' },
  },
  {
    id: 'editorial',
    label: { ms: 'Editorial', en: 'Editorial' },
    prompt: {
      ms: 'gabungan tipografi editorial bergaya majalah',
      en: 'an editorial magazine-style type pairing',
    },
  },
  {
    id: 'futuristic',
    label: { ms: 'Futuristic', en: 'Futuristic' },
    prompt: {
      ms: 'tipografi futuristik dengan bentuk teknikal',
      en: 'futuristic typography with technical letterforms',
    },
  },
] as const

export type TextContrastId = 'high' | 'balanced'

export const TEXT_CONTRASTS: readonly PresetOption<TextContrastId>[] = [
  {
    id: 'high',
    label: { ms: 'Kontras tinggi', en: 'High contrast' },
    hint: { ms: 'Paling mudah dibaca pada skrin kecil.', en: 'Most readable on small screens.' },
    prompt: {
      ms: 'kontras teks yang tinggi supaya mudah dibaca pada skrin kecil',
      en: 'high text contrast so the poster stays readable on small screens',
    },
  },
  {
    id: 'balanced',
    label: { ms: 'Kontras seimbang', en: 'Balanced contrast' },
    hint: { ms: 'Lembut tetapi masih jelas.', en: 'Softer but still legible.' },
    prompt: {
      ms: 'kontras teks yang seimbang tetapi masih jelas dibaca',
      en: 'balanced text contrast that remains clearly legible',
    },
  },
] as const

/* ---------------------------------------------------------------- subjek */

export type SubjectTypeId = 'none' | 'person' | 'group' | 'product' | 'object' | 'illustration'

export interface SubjectTypePreset extends PresetOption<SubjectTypeId> {
  /** Subjek manusia mencetuskan larangan anatomi dalam negative prompt (§7.7). */
  readonly human: boolean
}

export const SUBJECT_TYPES: readonly SubjectTypePreset[] = [
  {
    id: 'none',
    label: { ms: 'Tiada subjek', en: 'No subject' },
    prompt: { ms: 'tiada subjek utama', en: 'no primary subject' },
    human: false,
  },
  {
    id: 'person',
    label: { ms: 'Individu', en: 'Person' },
    prompt: { ms: 'potret seorang individu', en: 'a portrait of one person' },
    human: true,
  },
  {
    id: 'group',
    label: { ms: 'Kumpulan', en: 'Group' },
    prompt: { ms: 'kumpulan orang', en: 'a group of people' },
    human: true,
  },
  {
    id: 'product',
    label: { ms: 'Produk', en: 'Product' },
    prompt: { ms: 'produk sebagai subjek utama', en: 'a product as the main subject' },
    human: false,
  },
  {
    id: 'object',
    label: { ms: 'Objek atau lokasi', en: 'Object or place' },
    prompt: { ms: 'objek atau lokasi sebagai subjek utama', en: 'an object or location as the main subject' },
    human: false,
  },
  {
    id: 'illustration',
    label: { ms: 'Ilustrasi', en: 'Illustration' },
    prompt: { ms: 'ilustrasi grafik sebagai subjek utama', en: 'a graphic illustration as the main subject' },
    human: false,
  },
] as const

export type SubjectPositionId =
  | 'left'
  | 'center'
  | 'right'
  | 'center_left'
  | 'center_right'
  | 'bottom'

export const SUBJECT_POSITIONS: readonly PresetOption<SubjectPositionId>[] = [
  {
    id: 'left',
    label: { ms: 'Kiri', en: 'Left' },
    prompt: { ms: 'di sebelah kiri', en: 'on the left' },
  },
  {
    id: 'center_left',
    label: { ms: 'Tengah kiri', en: 'Centre-left' },
    prompt: { ms: 'di tengah agak ke kiri', en: 'at the centre-left' },
  },
  {
    id: 'center',
    label: { ms: 'Tengah', en: 'Centre' },
    prompt: { ms: 'di tengah', en: 'at the centre' },
  },
  {
    id: 'center_right',
    label: { ms: 'Tengah kanan', en: 'Centre-right' },
    prompt: { ms: 'di tengah agak ke kanan', en: 'at the centre-right' },
  },
  {
    id: 'right',
    label: { ms: 'Kanan', en: 'Right' },
    prompt: { ms: 'di sebelah kanan', en: 'on the right' },
  },
  {
    id: 'bottom',
    label: { ms: 'Bawah', en: 'Bottom' },
    prompt: { ms: 'di bahagian bawah', en: 'along the bottom' },
  },
] as const

export type CropId = 'head_shoulders' | 'half_body' | 'three_quarter' | 'full_body' | 'wide'

export const CROPS: readonly PresetOption<CropId>[] = [
  {
    id: 'head_shoulders',
    label: { ms: 'Kepala dan bahu', en: 'Head and shoulders' },
    prompt: { ms: 'crop kepala dan bahu', en: 'head-and-shoulders crop' },
  },
  {
    id: 'half_body',
    label: { ms: 'Separuh badan', en: 'Half body' },
    prompt: { ms: 'crop separuh badan', en: 'half-body crop' },
  },
  {
    id: 'three_quarter',
    label: { ms: 'Tiga suku', en: 'Three quarter' },
    prompt: { ms: 'crop tiga suku badan', en: 'three-quarter crop' },
  },
  {
    id: 'full_body',
    label: { ms: 'Seluruh badan', en: 'Full body' },
    prompt: { ms: 'crop seluruh badan', en: 'full-body crop' },
  },
  {
    id: 'wide',
    label: { ms: 'Wide shot', en: 'Wide shot' },
    prompt: {
      ms: 'framing luas berserta ruang persekitaran',
      en: 'wide framing that includes the surrounding space',
    },
  },
] as const

export type FeatheringId = 'none' | 'subtle' | 'strong'

export const FEATHERINGS: readonly PresetOption<FeatheringId>[] = [
  {
    id: 'none',
    label: { ms: 'Tiada', en: 'None' },
    prompt: { ms: 'tepi subjek kekal tajam', en: 'keep the subject edge crisp' },
  },
  {
    id: 'subtle',
    label: { ms: 'Halus', en: 'Subtle' },
    prompt: {
      ms: 'feathering halus pada tepi bawah subjek',
      en: 'subtle feathering along the lower edge of the subject',
    },
  },
  {
    id: 'strong',
    label: { ms: 'Kuat', en: 'Strong' },
    prompt: {
      ms: 'feathering kuat supaya subjek larut ke dalam latar',
      en: 'strong feathering so the subject dissolves into the background',
    },
  },
] as const

/* ------------------------------------------------------------------- zon */

export type LogoZoneId = 'none' | 'top' | 'top_left' | 'top_right' | 'bottom'

export const LOGO_ZONES: readonly PresetOption<LogoZoneId>[] = [
  {
    id: 'none',
    label: { ms: 'Tiada ruang logo', en: 'No logo zone' },
    prompt: { ms: 'tiada ruang logo dikhaskan', en: 'no dedicated logo zone' },
  },
  {
    id: 'top',
    label: { ms: 'Atas (tengah)', en: 'Top (centre)' },
    prompt: {
      ms: 'ruang logo bersih merentasi bahagian atas',
      en: 'a clean logo zone across the top',
    },
  },
  {
    id: 'top_left',
    label: { ms: 'Atas kiri', en: 'Top left' },
    prompt: { ms: 'ruang logo di bucu atas kiri', en: 'a logo zone in the top-left corner' },
  },
  {
    id: 'top_right',
    label: { ms: 'Atas kanan', en: 'Top right' },
    prompt: { ms: 'ruang logo di bucu atas kanan', en: 'a logo zone in the top-right corner' },
  },
  {
    id: 'bottom',
    label: { ms: 'Bawah', en: 'Bottom' },
    prompt: { ms: 'ruang logo pada jalur bawah', en: 'a logo zone along the bottom strip' },
  },
] as const

export type QrZoneId = 'none' | 'bottom_left' | 'bottom_right' | 'footer'

export const QR_ZONES: readonly PresetOption<QrZoneId>[] = [
  {
    id: 'none',
    label: { ms: 'Tiada kod QR', en: 'No QR code' },
    prompt: { ms: 'tiada ruang kod QR', en: 'no QR code zone' },
  },
  {
    id: 'bottom_left',
    label: { ms: 'Bawah kiri', en: 'Bottom left' },
    prompt: {
      ms: 'ruang kod QR di bucu bawah kiri',
      en: 'a QR code zone in the bottom-left corner',
    },
  },
  {
    id: 'bottom_right',
    label: { ms: 'Bawah kanan', en: 'Bottom right' },
    prompt: {
      ms: 'ruang kod QR di bucu bawah kanan',
      en: 'a QR code zone in the bottom-right corner',
    },
  },
  {
    id: 'footer',
    label: { ms: 'Dalam footer', en: 'Inside footer' },
    prompt: { ms: 'ruang kod QR di dalam jalur footer', en: 'a QR code zone inside the footer strip' },
  },
] as const

export type AssetZoneId = 'sponsor' | 'cta' | 'footer' | 'whitespace'

export const ASSET_ZONES: readonly PresetOption<AssetZoneId>[] = [
  {
    id: 'sponsor',
    label: { ms: 'Jalur penaja', en: 'Sponsor strip' },
    prompt: {
      ms: 'jalur penaja yang bersih di bahagian bawah',
      en: 'a clean sponsor strip along the lower area',
    },
  },
  {
    id: 'cta',
    label: { ms: 'Blok seruan tindakan', en: 'Call-to-action block' },
    prompt: {
      ms: 'blok seruan tindakan yang menonjol',
      en: 'a prominent call-to-action block',
    },
  },
  {
    id: 'footer',
    label: { ms: 'Jalur footer', en: 'Footer strip' },
    prompt: {
      ms: 'jalur footer untuk maklumat hubungan',
      en: 'a footer strip for contact information',
    },
  },
  {
    id: 'whitespace',
    label: { ms: 'Ruang kosong tersuai', en: 'Reserved whitespace' },
    prompt: {
      ms: 'ruang kosong tambahan yang dikhaskan dan tidak diisi elemen',
      en: 'additional reserved whitespace kept free of elements',
    },
  },
] as const

/** Had jumlah zon aset serentak (§10.1). */
export const MAX_ASSET_ZONES = 5

/* ---------------------------------------------------------------- lain-lain */

export type TextAlignmentId = 'left' | 'center' | 'right'

export const TEXT_ALIGNMENTS: readonly PresetOption<TextAlignmentId>[] = [
  {
    id: 'left',
    label: { ms: 'Kiri', en: 'Left' },
    prompt: { ms: 'teks dijajarkan ke kiri', en: 'text aligned left' },
  },
  {
    id: 'center',
    label: { ms: 'Tengah', en: 'Centre' },
    prompt: { ms: 'teks dijajarkan ke tengah', en: 'text aligned centre' },
  },
  {
    id: 'right',
    label: { ms: 'Kanan', en: 'Right' },
    prompt: { ms: 'teks dijajarkan ke kanan', en: 'text aligned right' },
  },
] as const

export type BackgroundId =
  | 'clean'
  | 'gradient'
  | 'geometric'
  | 'photographic'
  | 'texture'
  | 'bokeh'

export interface BackgroundPreset extends PresetOption<BackgroundId> {
  /** Latar yang cenderung sibuk; asas amaran ketumpatan (§7.7 peraturan ketiga). */
  readonly busy: boolean
}

export const BACKGROUNDS: readonly BackgroundPreset[] = [
  {
    id: 'clean',
    label: { ms: 'Latar bersih', en: 'Clean background' },
    prompt: {
      ms: 'latar bersih dengan ruang kosong mencukupi',
      en: 'a clean background with sufficient negative space',
    },
    busy: false,
  },
  {
    id: 'gradient',
    label: { ms: 'Gradien lembut', en: 'Soft gradient' },
    prompt: { ms: 'latar gradien lembut', en: 'a soft gradient background' },
    busy: false,
  },
  {
    id: 'geometric',
    label: { ms: 'Aksen geometri', en: 'Geometric accents' },
    prompt: {
      ms: 'latar dengan aksen geometri halus',
      en: 'a background with subtle geometric accents',
    },
    busy: false,
  },
  {
    id: 'photographic',
    label: { ms: 'Fotografi', en: 'Photographic' },
    prompt: {
      ms: 'latar fotografi dengan lapisan gelap supaya teks kekal terbaca',
      en: 'a photographic background with a darkening layer so text stays readable',
    },
    busy: true,
  },
  {
    id: 'texture',
    label: { ms: 'Tekstur bercorak', en: 'Patterned texture' },
    prompt: { ms: 'latar bertekstur bercorak', en: 'a patterned textured background' },
    busy: true,
  },
  {
    id: 'bokeh',
    label: { ms: 'Bokeh', en: 'Bokeh' },
    prompt: { ms: 'latar bokeh kabur', en: 'a blurred bokeh background' },
    busy: true,
  },
] as const

export const STYLE_IDS = STYLES.map((s) => s.id) as [StyleId, ...StyleId[]]
export const MOOD_IDS = MOODS.map((m) => m.id) as [MoodId, ...MoodId[]]
export const COMPOSITION_IDS = COMPOSITIONS.map((c) => c.id) as [CompositionId, ...CompositionId[]]
export const TYPEFACE_IDS = TYPEFACES.map((t) => t.id) as [TypefaceId, ...TypefaceId[]]
export const TEXT_CONTRAST_IDS = TEXT_CONTRASTS.map((t) => t.id) as [
  TextContrastId,
  ...TextContrastId[],
]
export const SUBJECT_TYPE_IDS = SUBJECT_TYPES.map((s) => s.id) as [SubjectTypeId, ...SubjectTypeId[]]
export const SUBJECT_POSITION_IDS = SUBJECT_POSITIONS.map((s) => s.id) as [
  SubjectPositionId,
  ...SubjectPositionId[],
]
export const CROP_IDS = CROPS.map((c) => c.id) as [CropId, ...CropId[]]
export const FEATHERING_IDS = FEATHERINGS.map((f) => f.id) as [FeatheringId, ...FeatheringId[]]
export const LOGO_ZONE_IDS = LOGO_ZONES.map((z) => z.id) as [LogoZoneId, ...LogoZoneId[]]
export const QR_ZONE_IDS = QR_ZONES.map((z) => z.id) as [QrZoneId, ...QrZoneId[]]
export const ASSET_ZONE_IDS = ASSET_ZONES.map((z) => z.id) as [AssetZoneId, ...AssetZoneId[]]
export const TEXT_ALIGNMENT_IDS = TEXT_ALIGNMENTS.map((a) => a.id) as [
  TextAlignmentId,
  ...TextAlignmentId[],
]
export const BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id) as [BackgroundId, ...BackgroundId[]]

export const SUBJECT_LABELS: Record<SubjectTypeId, Bilingual> = SUBJECT_TYPES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<SubjectTypeId, Bilingual>,
)
