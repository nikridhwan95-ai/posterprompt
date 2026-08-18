/**
 * Pembina fragmen prompt — SDD §7.1 dan §7.3.
 *
 * Setiap fungsi memulangkan satu bahagian prompt atau `null` apabila tiada
 * kandungan berkaitan. Nama fungsi sengaja dikekalkan sama seperti pseudokod
 * §7.3 supaya kebolehkesanan antara dokumen dan kod kekal jelas.
 */
import { getCategory } from '@/data/categories'
import { getPalette } from '@/data/palettes'
import {
  BACKGROUNDS,
  COMPOSITIONS,
  CROPS,
  FEATHERINGS,
  LOGO_ZONES,
  MOODS,
  QR_ZONES,
  ASSET_ZONES,
  STYLES,
  SUBJECT_POSITIONS,
  SUBJECT_TYPES,
  TEXT_ALIGNMENTS,
  TEXT_CONTRASTS,
  TYPEFACES,
} from '@/data/styles'
import { findPreset, pick } from '@/data/types'
import { ORIENTATION_LABELS } from '@/data/canvas'
import { hierarchyLines } from './layoutPlan'
import { exactCopyValues } from './exactCopy'
import type { PromptContext, PromptSection } from './types'

function sentence(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length === 0) return ''
  const capitalised = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  return /[.!?]$/.test(capitalised) ? capitalised : `${capitalised}.`
}

function joinList(parts: readonly string[], language: 'ms' | 'en'): string {
  const clean = parts.filter((part) => part.trim().length > 0)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean[0]
  const last = clean[clean.length - 1]
  const rest = clean.slice(0, -1).join(', ')
  return language === 'ms' ? `${rest} dan ${last}` : `${rest} and ${last}`
}

/* ------------------------------------------------------- DESIGN TASK */

export function categoryTemplate(ctx: PromptContext): PromptSection | null {
  const { project, language } = ctx
  const category = getCategory(project.category)
  const mood = findPreset(MOODS, project.style.mood)
  const style = findPreset(STYLES, project.style.stylePreset)

  const lines = [sentence(pick(category.task, language))]

  if (mood) {
    lines.push(
      sentence(
        language === 'ms'
          ? `Nada keseluruhan hendaklah ${pick(mood.prompt, language)}`
          : `The overall tone should be ${pick(mood.prompt, language)}`,
      ),
    )
  }

  // Gaya utama sengaja tidak diulang di sini kerana ia sudah dinyatakan
  // sepenuhnya dalam bahagian VISUAL DIRECTION.
  void style

  return { section: 'DESIGN TASK', lines }
}

/* ------------------------------------------------------------ CANVAS */

export function canvasFragment(ctx: PromptContext): PromptSection | null {
  const { project, language, ratio, orientation } = ctx
  const { width, height, destination } = project.canvas
  const orientationLabel = pick(ORIENTATION_LABELS[orientation], language).toLowerCase()

  const base =
    language === 'ms'
      ? `Format ${orientationLabel}, ${width} × ${height} px, nisbah ${ratio}`
      : `${orientationLabel.charAt(0).toUpperCase()}${orientationLabel.slice(1)} format, ${width} × ${height} px, ${ratio} aspect ratio`

  const withDestination = destination
    ? language === 'ms'
      ? `${base}, dioptimumkan untuk ${destination}`
      : `${base}, optimised for ${destination}`
    : base

  return { section: 'CANVAS', lines: [sentence(withDestination)] }
}

/* -------------------------------------------------- VISUAL DIRECTION */

export function visualFragment(ctx: PromptContext): PromptSection | null {
  const { project, language, colors } = ctx
  const style = findPreset(STYLES, project.style.stylePreset)
  const palette = getPalette(project.style.palettePreset)
  const background = findPreset(BACKGROUNDS, project.style.background)

  const lines: string[] = []

  const paletteText =
    project.style.customColors.length > 0
      ? language === 'ms'
        ? 'palet warna tersuai'
        : 'a custom colour palette'
      : pick(palette.prompt, language)

  if (style) {
    lines.push(
      sentence(
        language === 'ms'
          ? `Gunakan ${pick(style.prompt, language)}`
          : `Use ${pick(style.prompt, language)}`,
      ),
    )
  }

  lines.push(
    sentence(language === 'ms' ? `Terapkan ${paletteText}` : `Apply ${paletteText}`),
  )

  if (colors.length > 0) {
    lines.push(
      language === 'ms'
        ? `Warna palet: ${colors.join(', ')}.`
        : `Palette colours: ${colors.join(', ')}.`,
    )
  }

  if (background) {
    lines.push(sentence(pick(background.prompt, language)))
  }

  if (project.style.strictPalette && colors.length > 0) {
    lines.push(
      language === 'ms'
        ? 'Hadkan keseluruhan reka bentuk kepada warna palet ini sahaja.'
        : 'Restrict the entire design to these palette colours only.',
    )
  }

  return lines.length > 0 ? { section: 'VISUAL DIRECTION', lines } : null
}

/* ------------------------------------------------------- COMPOSITION */

export function layoutFragment(ctx: PromptContext): PromptSection | null {
  const { project, language } = ctx
  const composition = findPreset(COMPOSITIONS, project.layout.composition)
  const alignment = findPreset(TEXT_ALIGNMENTS, project.layout.textAlignment)
  const logoZone = findPreset(LOGO_ZONES, project.layout.logoZone)
  const qrZone = findPreset(QR_ZONES, project.layout.qrZone)

  const lines: string[] = []

  if (composition) {
    const withAlignment = alignment
      ? `${pick(composition.prompt, language)}, ${pick(alignment.prompt, language)}`
      : pick(composition.prompt, language)
    lines.push(sentence(language === 'ms' ? `Gunakan ${withAlignment}` : `Use a ${withAlignment}`))
  }

  const zoneParts: string[] = []
  if (logoZone && logoZone.id !== 'none') zoneParts.push(pick(logoZone.prompt, language))
  if (qrZone && qrZone.id !== 'none') zoneParts.push(pick(qrZone.prompt, language))
  for (const zoneId of project.layout.assetZones) {
    const zone = findPreset(ASSET_ZONES, zoneId)
    if (zone) zoneParts.push(pick(zone.prompt, language))
  }

  if (zoneParts.length > 0) {
    lines.push(
      sentence(
        language === 'ms'
          ? `Khaskan ${joinList(zoneParts, language)}`
          : `Reserve ${joinList(zoneParts, language)}`,
      ),
    )
  }

  lines.push(...hierarchyLines(project, language).map((line) => sentence(line)))

  return lines.length > 0 ? { section: 'COMPOSITION', lines } : null
}

/* ----------------------------------------------------------- SUBJECT */

export function subjectFragment(ctx: PromptContext): PromptSection | null {
  const { project, language } = ctx
  const subject = project.subject
  if (subject.subjectType === 'none' || subject.subjectCount < 1) return null

  const type = findPreset(SUBJECT_TYPES, subject.subjectType)
  const position = findPreset(SUBJECT_POSITIONS, subject.subjectPosition)
  const crop = findPreset(CROPS, subject.crop)
  const feathering = findPreset(FEATHERINGS, subject.feathering)
  if (!type) return null

  const lines: string[] = []

  const countText =
    subject.subjectCount > 1
      ? language === 'ms'
        ? `${subject.subjectCount} subjek`
        : `${subject.subjectCount} subjects`
      : pick(type.prompt, language)

  const cropText = crop
    ? language === 'ms'
      ? ` dengan ${pick(crop.prompt, language)}`
      : ` with a ${pick(crop.prompt, language)}`
    : ''
  const positionText = position
    ? language === 'ms'
      ? `, diletakkan ${pick(position.prompt, language)}`
      : `, positioned ${pick(position.prompt, language)}`
    : ''

  lines.push(
    sentence(
      language === 'ms'
        ? `Paparkan ${countText}${cropText}${positionText}`
        : `Show ${countText}${cropText}${positionText}`,
    ),
  )

  if (feathering && feathering.id !== 'none') {
    lines.push(sentence(pick(feathering.prompt, language)))
  }

  const preserve: string[] = []
  if (subject.preserveFace) {
    preserve.push(language === 'ms' ? 'ciri wajah' : 'facial features')
  }
  if (subject.preserveClothing) {
    preserve.push(language === 'ms' ? 'pakaian' : 'clothing')
  }
  if (preserve.length > 0 && type.human) {
    lines.push(
      sentence(
        language === 'ms'
          ? `Kekalkan ${joinList(preserve, language)} subjek tanpa perubahan jika gambar rujukan dilampirkan`
          : `Preserve the subject ${joinList(preserve, language)} without alteration if a reference image is supplied`,
      ),
    )
  }

  return { section: 'SUBJECT', lines }
}

/* -------------------------------------------------------- TYPOGRAPHY */

export function typographyFragment(ctx: PromptContext): PromptSection | null {
  const { project, language } = ctx
  const title = findPreset(TYPEFACES, project.typography.titleTypeface)
  const body = findPreset(TYPEFACES, project.typography.bodyTypeface)
  const contrast = findPreset(TEXT_CONTRASTS, project.typography.textContrast)

  const lines: string[] = []

  if (title && body) {
    lines.push(
      sentence(
        language === 'ms'
          ? `Gunakan ${pick(title.prompt, language)} untuk tajuk dan ${pick(body.prompt, language)} untuk maklumat sokongan`
          : `Use ${pick(title.prompt, language)} for the headline and ${pick(body.prompt, language)} for supporting information`,
      ),
    )
  }

  if (contrast) {
    lines.push(
      sentence(
        language === 'ms'
          ? `Kekalkan ${pick(contrast.prompt, language)}, jarak yang lapang dan hierarki maklumat yang tegas`
          : `Maintain ${pick(contrast.prompt, language)}, generous spacing and a firm information hierarchy`,
      ),
    )
  }

  return lines.length > 0 ? { section: 'TYPOGRAPHY', lines } : null
}

/* -------------------------------------------------------- EXACT COPY */

export function exactCopyFragment(ctx: PromptContext): PromptSection | null {
  const { exactCopy, language } = ctx
  if (exactCopy.length === 0) return null

  return {
    section: 'EXACT COPY',
    heading:
      language === 'ms'
        ? 'EXACT COPY - salin tepat seperti tertulis'
        : 'EXACT COPY - reproduce exactly as written',
    lines: exactCopyValues(exactCopy),
  }
}

/* -------------------------------------------------------- CONSTRAINTS */

export function constraintsFragment(ctx: PromptContext): PromptSection | null {
  const { project, language, exactCopy } = ctx
  const lines: string[] = []

  lines.push(
    language === 'ms'
      ? 'Jangan mereka logo, nama, tarikh atau penaja tambahan.'
      : 'Do not invent additional logos, names, dates or sponsors.',
  )

  if (exactCopy.length > 0) {
    lines.push(
      language === 'ms'
        ? 'Paparkan hanya teks dalam blok EXACT COPY dan kekalkan ejaan asal termasuk huruf besar dan tanda baca.'
        : 'Render only the text in the EXACT COPY block and keep the original spelling, capitalisation and punctuation.',
    )
  }

  if (project.subject.subjectType !== 'none' && project.subject.subjectCount > 0) {
    const preserve: string[] = []
    if (project.subject.preserveFace) preserve.push(language === 'ms' ? 'wajah' : 'the face')
    if (project.subject.preserveClothing) {
      preserve.push(language === 'ms' ? 'pakaian' : 'the clothing')
    }
    if (preserve.length > 0) {
      lines.push(
        language === 'ms'
          ? `Jangan ubah ${joinList(preserve, language)} subjek daripada gambar rujukan.`
          : `Do not alter ${joinList(preserve, language)} of the subject from the reference image.`,
      )
    }
  }

  if (project.style.strictPalette) {
    lines.push(
      language === 'ms'
        ? 'Jangan gunakan warna di luar palet yang ditetapkan.'
        : 'Do not use colours outside the specified palette.',
    )
  }

  if (project.layout.logoZone !== 'none') {
    lines.push(
      language === 'ms'
        ? 'Biarkan ruang logo kosong sepenuhnya supaya logo sebenar boleh ditambah kemudian.'
        : 'Leave the logo zone completely empty so the real logo can be added later.',
    )
  }

  if (project.layout.qrZone !== 'none') {
    lines.push(
      language === 'ms'
        ? 'Tunjukkan ruang kod QR sebagai petak kosong, jangan jana kod QR palsu.'
        : 'Show the QR zone as an empty placeholder square; do not generate a fake QR code.',
    )
  }

  if (project.platform.customInstructions.trim().length > 0) {
    lines.push(
      language === 'ms'
        ? `Arahan tambahan pengguna: ${project.platform.customInstructions}`
        : `Additional user instruction: ${project.platform.customInstructions}`,
    )
  }

  return { section: 'CONSTRAINTS', lines }
}

/* ------------------------------------------------------------ QUALITY */

export function qualityFragment(ctx: PromptContext): PromptSection | null {
  const { language, project } = ctx
  if (project.platform.outputMode === 'concise') {
    return {
      section: 'QUALITY',
      lines: [
        language === 'ms'
          ? 'Resolusi tinggi, seimbang, mudah dibaca dan kemas.'
          : 'High resolution, balanced, readable and polished.',
      ],
    }
  }

  return {
    section: 'QUALITY',
    lines: [
      language === 'ms'
        ? 'Hasilkan reka bentuk resolusi tinggi yang seimbang, kemas dan mudah dibaca pada skrin telefon.'
        : 'Produce a high-resolution design that is balanced, polished and readable on a phone screen.',
      language === 'ms'
        ? 'Pastikan jarak antara elemen konsisten dan tiada teks terpotong di tepi kanvas.'
        : 'Keep spacing between elements consistent and ensure no text is cropped at the canvas edge.',
    ],
  }
}
