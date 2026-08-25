/**
 * Pengisi rawak untuk butang "Kejutkan saya" (§5.3).
 *
 * Modul ini sengaja berada di lapisan UI dan **bukan** di bawah `lib/prompt/`:
 * enjin prompt mesti kekal tulen (NFR-008), jadi satu-satunya sumber rawak
 * dalam aplikasi tinggal di sini, dipicu oleh tindakan pengguna yang eksplisit.
 * `rng` boleh disuntik supaya ujian menjadi deterministik.
 *
 * Dua peraturan yang menentukan reka bentuknya:
 *
 * 1. **Teks yang sudah ditaip tidak pernah ditimpa.** Hanya medan wajib yang
 *    masih kosong diisi teks contoh — kerja pengguna terlalu mahal untuk
 *    dibuang, manakala pilihan reka bentuk hanya satu klik untuk ditukar
 *    semula, jadi pilihan reka bentuk sentiasa dirawakkan.
 * 2. **Kejutan mesti sah.** Kombinasi dipilih supaya ia tidak terus melanggar
 *    peraturan konflik §10.3 (palet cerah + kontras rendah, zon bertindih,
 *    gaya minimalis yang sesak) — pengguna sepatutnya mendapat titik mula
 *    yang berguna, bukan senarai amaran.
 */
import { getCategory, requiredFieldsFor } from '@/data/categories'
import { PALETTES, effectiveColors, isLightPalette } from '@/data/palettes'
import { samplesFor } from '@/data/samples'
import {
  ASSET_ZONES,
  BACKGROUNDS,
  COMPOSITIONS,
  CROPS,
  FEATHERINGS,
  LOGO_ZONES,
  MOODS,
  QR_ZONES,
  STYLES,
  SUBJECT_TYPES,
  TEXT_ALIGNMENTS,
  TYPEFACES,
  subjectPositionForComposition,
  type AssetZoneId,
  type LogoZoneId,
  type QrZoneId,
} from '@/data/styles'
import type { ContentFieldName } from '@/data/types'
import type { PosterProject } from '@/schemas/project'

export type Rng = () => number

/** Nilai contoh yang diisi, mengikut medan. */
export type SampleValues = Partial<Record<ContentFieldName, string>>

export interface RandomiseResult {
  readonly project: PosterProject
  /** Medan wajib yang kosong dan kini berisi teks contoh. */
  readonly filled: SampleValues
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))]
}

function pickSome<T>(items: readonly T[], max: number, rng: Rng): T[] {
  const count = Math.floor(rng() * (max + 1))
  const pool = [...items]
  const chosen: T[] = []
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = Math.min(pool.length - 1, Math.floor(rng() * pool.length))
    chosen.push(pool[index])
    pool.splice(index, 1)
  }
  return chosen
}

function isBlank(value: string | undefined): boolean {
  return (value ?? '').trim().length === 0
}

/**
 * Isi medan wajib yang kosong dengan teks contoh dan rawakkan pilihan gaya
 * serta susun atur. Kanvas, kategori, bahasa dan platform tidak disentuh:
 * itu keputusan penerbitan pengguna, bukan rasa reka bentuk.
 */
export function randomiseProject(project: PosterProject, rng: Rng = Math.random): RandomiseResult {
  const category = getCategory(project.category)

  /* ------------------------------------------------ teks contoh */

  const filled: SampleValues = {}
  const content = { ...project.content }
  for (const field of requiredFieldsFor(category)) {
    if (!isBlank(content[field])) continue
    const options = samplesFor(category.id, field)
    if (options.length === 0) continue
    const value = pick(options, rng)
    content[field] = value
    filled[field] = value
  }

  /* --------------------------------------------- pilihan visual */

  const style = pick(STYLES, rng)
  // Palet "custom" bukan palet sebenar — ia penanda bahawa warna tersuai
  // digunakan, jadi ia tidak boleh dipilih secara rawak.
  const palette = pick(
    PALETTES.filter((item) => item.id !== 'custom' && item.colors.length > 0),
    rng,
  )
  const composition = pick(COMPOSITIONS, rng)
  const subjectType = pick(SUBJECT_TYPES, rng)
  const hasSubject = subjectType.id !== 'none'

  // Palet cerah menuntut kontras tinggi, jika tidak §10.3 terus mengamarkan.
  const colors = effectiveColors(palette.id, project.style.customColors)
  const textContrast = isLightPalette(colors) ? 'high' : pick(['high', 'balanced'] as const, rng)

  /* -------------------------------------------------- zon aset */

  // Gaya minimalis hidup dengan ruang kosong; memberinya empat zon bermakna
  // mencipta konflik "minimalis tetapi sesak" pada klik pertama.
  const zoneBudget = style.minimal ? 1 : 2
  let assetZones = pickSome(ASSET_ZONES, zoneBudget, rng).map((zone) => zone.id) as AssetZoneId[]
  let logoZone = pick(LOGO_ZONES, rng).id as LogoZoneId
  let qrZone = pick(QR_ZONES, rng).id as QrZoneId

  // QA-05: logo bawah bertindih dengan jalur penaja atau footer.
  if (logoZone === 'bottom' && (assetZones.includes('sponsor') || assetZones.includes('footer'))) {
    logoZone = 'top'
  }
  // QA-05: footer tidak boleh menampung QR, penaja dan nota serentak.
  if (qrZone === 'footer' && assetZones.includes('footer') && assetZones.includes('sponsor')) {
    assetZones = assetZones.filter((zone) => zone !== 'sponsor')
  }

  const subjectPosition =
    subjectPositionForComposition(composition.id) ?? (hasSubject ? 'center' : 'center')

  return {
    project: {
      ...project,
      content,
      style: {
        ...project.style,
        stylePreset: style.id,
        mood: pick(MOODS, rng).id,
        palettePreset: palette.id,
        background: pick(BACKGROUNDS, rng).id,
      },
      layout: {
        ...project.layout,
        composition: composition.id,
        textAlignment: pick(TEXT_ALIGNMENTS, rng).id,
        logoZone,
        qrZone,
        assetZones,
      },
      subject: {
        ...project.subject,
        subjectType: subjectType.id,
        subjectCount: hasSubject ? 1 + Math.floor(rng() * 3) : 0,
        subjectPosition: subjectPosition as PosterProject['subject']['subjectPosition'],
        crop: pick(CROPS, rng).id,
        feathering: pick(FEATHERINGS, rng).id,
      },
      typography: {
        ...project.typography,
        titleTypeface: pick(TYPEFACES, rng).id,
        bodyTypeface: pick(TYPEFACES, rng).id,
        textContrast,
      },
    },
    filled,
  }
}

/**
 * Medan yang masih mengandungi teks contoh yang belum diganti.
 *
 * Perbandingan dibuat terhadap nilai yang benar-benar diisi, jadi sebaik
 * pengguna menyunting medan itu ia hilang daripada senarai amaran dengan
 * sendirinya.
 */
export function unresolvedSamples(
  project: PosterProject,
  filled: SampleValues,
): ContentFieldName[] {
  return (Object.keys(filled) as ContentFieldName[]).filter(
    (field) => (project.content[field] ?? '') === filled[field] && !isBlank(filled[field]),
  )
}
