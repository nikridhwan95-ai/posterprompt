/**
 * Pelan zon susun atur — satu sumber kebenaran untuk bahagian COMPOSITION
 * dalam prompt, nota susun atur (FR-016) dan pratonton zon (FR-023).
 *
 * Peta zon mengikut Lampiran B: Atas, Upper third, Tengah, Lower third, Footer.
 */
import { getCategory } from '@/data/categories'
import { LOGO_ZONES, QR_ZONES, SUBJECT_TYPES } from '@/data/styles'
import { findPreset, pick, type PromptLanguage } from '@/data/types'
import type { PosterProject } from '@/schemas/project'

export type ZoneKey = 'top' | 'upper_third' | 'middle' | 'lower_third' | 'footer'

export interface ZoneSlot {
  readonly key: ZoneKey
  /** Label BM untuk nota dan pratonton. */
  readonly label: string
  /** Kandungan yang diletakkan di zon ini (BM, untuk pengguna). */
  readonly items: readonly string[]
  /** Arahan penuh dalam BM untuk blok "Nota susun atur". */
  readonly note: string
}

const ZONE_LABELS: Record<ZoneKey, string> = {
  top: 'Atas',
  upper_third: 'Upper third',
  middle: 'Tengah',
  lower_third: 'Lower third',
  footer: 'Footer',
}

const ZONE_PROMPT_LABELS: Record<ZoneKey, { ms: string; en: string }> = {
  top: { ms: 'jalur atas', en: 'the top strip' },
  upper_third: { ms: 'satu pertiga atas', en: 'the upper third' },
  middle: { ms: 'kawasan tengah', en: 'the middle area' },
  lower_third: { ms: 'satu pertiga bawah', en: 'the lower third' },
  footer: { ms: 'footer', en: 'the footer' },
}

interface PlanItem {
  readonly zone: ZoneKey
  readonly ms: string
  readonly en: string
}

/**
 * Susun kandungan pengguna ke dalam zon. Hanya medan yang benar-benar diisi
 * menghasilkan arahan, supaya prompt tidak merujuk elemen yang tidak wujud.
 */
export function planZones(project: PosterProject): ZoneSlot[] {
  const c = project.content
  const category = getCategory(project.category)
  const items: PlanItem[] = []

  const has = (value: string | undefined): value is string => !!value && value.trim().length > 0

  // Zon atas: logo.
  if (project.layout.logoZone !== 'none') {
    const zone = findPreset(LOGO_ZONES, project.layout.logoZone)
    items.push({
      zone: 'top',
      ms:
        project.layout.logoZone === 'bottom'
          ? 'Ruang logo dikhaskan pada jalur bawah'
          : 'Ruang bersih untuk logo, tidak bertindih dengan tajuk',
      en: zone ? `keep ${zone.prompt.en} free of other elements` : 'keep the logo zone clear',
    })
  }

  // Upper third: tajuk utama sebagai focal point.
  if (has(c.mainHeadline)) {
    items.push({
      zone: 'upper_third',
      ms: `${c.mainHeadline} sebagai focal point`,
      en: 'the main headline as the focal point',
    })
  }
  if (has(c.subHeadline)) {
    items.push({
      zone: 'upper_third',
      ms: 'Subtajuk tepat di bawah tajuk utama',
      en: 'the subheadline directly beneath the main headline',
    })
  }

  // Tengah: subjek, nama dan jawatan.
  const subjectType = findPreset(SUBJECT_TYPES, project.subject.subjectType)
  if (subjectType && subjectType.id !== 'none') {
    items.push({
      zone: 'middle',
      ms: 'Subjek visual dengan kontras yang jelas terhadap latar',
      en: 'the visual subject with clear contrast against the background',
    })
  }
  if (has(c.personName)) {
    items.push({
      zone: 'middle',
      ms: has(c.position) ? 'Nama dan jawatan dengan kontras tinggi' : 'Nama dengan kontras tinggi',
      en: has(c.position)
        ? 'the name and role in high contrast'
        : 'the name in high contrast',
    })
  }
  if (has(c.achievement)) {
    items.push({
      zone: 'middle',
      ms: 'Pencapaian sebagai maklumat sokongan utama',
      en: 'the achievement as the primary supporting information',
    })
  }

  // Lower third: program, tempat, tarikh dan masa.
  const lowerParts: string[] = []
  const lowerPartsEn: string[] = []
  if (has(c.programName)) {
    lowerParts.push('nama program')
    lowerPartsEn.push('the programme name')
  }
  if (has(c.venue)) {
    lowerParts.push('lokasi')
    lowerPartsEn.push('the venue')
  }
  if (has(c.date)) {
    lowerParts.push('tarikh')
    lowerPartsEn.push('the date')
  }
  if (has(c.time)) {
    lowerParts.push('masa')
    lowerPartsEn.push('the time')
  }
  if (lowerParts.length > 0) {
    items.push({
      zone: 'lower_third',
      ms: `Susun ${lowerParts.join(', ')} dalam satu kelompok maklumat`,
      en: `group ${lowerPartsEn.join(', ')} into a single information cluster`,
    })
  }

  // Footer: penganjur, CTA, nota, penaja dan QR.
  if (has(c.callToAction)) {
    items.push({
      zone: 'footer',
      ms: 'Seruan tindakan yang mudah dibaca',
      en: 'a legible call to action',
    })
  }
  if (has(c.organizer)) {
    items.push({
      zone: 'footer',
      ms: 'Nama penganjur',
      en: 'the organiser name',
    })
  }
  if (has(c.footerNotes)) {
    items.push({
      zone: 'footer',
      ms: 'Nota hubungan pada jalur footer',
      en: 'contact notes along the footer strip',
    })
  }
  if (project.layout.qrZone !== 'none') {
    const zone = findPreset(QR_ZONES, project.layout.qrZone)
    items.push({
      zone: 'footer',
      ms: `Kod QR: ${zone ? zone.label.ms.toLowerCase() : 'ruang dikhaskan'}`,
      en: zone ? zone.prompt.en : 'a reserved QR code zone',
    })
  }
  if (project.layout.assetZones.includes('sponsor')) {
    items.push({
      zone: 'footer',
      ms: 'Jalur penaja dengan jarak seragam',
      en: 'a sponsor strip with even spacing',
    })
  }

  // Safe margin sentiasa disebut supaya elemen tidak terpotong.
  items.push({
    zone: 'footer',
    ms: 'Safe margin di semua tepi dan ruang tambahan jika perlu',
    en: 'safe margins on every edge with extra breathing room where needed',
  })

  const order: ZoneKey[] = ['top', 'upper_third', 'middle', 'lower_third', 'footer']
  const slots: ZoneSlot[] = []

  for (const key of order) {
    const zoneItems = items.filter((item) => item.zone === key)
    if (zoneItems.length === 0) continue
    const ms = zoneItems.map((item) => item.ms)
    slots.push({
      key,
      label: ZONE_LABELS[key],
      items: ms,
      note: `${ms.join('. ')}.`,
    })
  }

  // Petunjuk default kategori dijadikan baris terakhir supaya pengguna nampak
  // asal cadangan susun atur.
  slots.push({
    key: 'footer',
    label: 'Rujukan kategori',
    items: [category.layoutHint.ms],
    note: `Cadangan susun atur asas kategori ini: ${category.layoutHint.ms.toLowerCase()}.`,
  })

  return slots
}

/** Baris hierarki untuk bahagian COMPOSITION dalam prompt. */
export function hierarchyLines(project: PosterProject, language: PromptLanguage): string[] {
  const c = project.content
  const has = (value: string | undefined): value is string => !!value && value.trim().length > 0
  const parts: string[] = []

  const zoneWord = (key: ZoneKey) => pick(ZONE_PROMPT_LABELS[key], language)

  if (has(c.mainHeadline)) {
    parts.push(
      language === 'ms'
        ? `Gunakan ${zoneWord('upper_third')} untuk tajuk utama`
        : `Use ${zoneWord('upper_third')} for the main headline`,
    )
  }
  if (has(c.personName) || project.subject.subjectType !== 'none') {
    parts.push(
      language === 'ms'
        ? `${zoneWord('middle')} untuk subjek serta nama dan jawatan`
        : `${zoneWord('middle')} for the subject, name and role`,
    )
  }
  if (has(c.programName) || has(c.venue) || has(c.date)) {
    parts.push(
      language === 'ms'
        ? `${zoneWord('lower_third')} untuk program, lokasi dan tarikh`
        : `${zoneWord('lower_third')} for the programme, venue and date`,
    )
  }
  if (has(c.callToAction) || has(c.organizer) || has(c.footerNotes)) {
    parts.push(
      language === 'ms'
        ? `${zoneWord('footer')} untuk seruan tindakan dan maklumat penganjur`
        : `${zoneWord('footer')} for the call to action and organiser details`,
    )
  }

  if (parts.length === 0) return []
  return [`${parts.join(', ')}.`]
}
