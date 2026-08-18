/**
 * Konflik reka bentuk — SDD §10.3.
 *
 * Konflik menghasilkan amaran, bukan sekatan (§10.2): pengguna tetap boleh
 * menjana output. Setiap amaran membawa laluan medan supaya panel hasil boleh
 * memaut terus ke langkah berkaitan (FR-019).
 */
import { getPlatform } from '@/data/platforms'
import { darkestColor, isLightPalette } from '@/data/palettes'
import { COMPOSITIONS, STYLES } from '@/data/styles'
import { findPreset } from '@/data/types'
import { countZones, type PosterProject } from '@/schemas/project'
import { isCrowded } from './density'
import type { DensityResult, QualityWarning } from './types'

/** Ambang teks panjang bagi platform yang lemah menulis teks (§10.3). */
export const LONG_TEXT_THRESHOLD = 180

export function detectConflicts(
  project: PosterProject,
  density: DensityResult,
  colors: readonly string[],
): QualityWarning[] {
  const warnings: QualityWarning[] = []
  const style = findPreset(STYLES, project.style.stylePreset)
  const platform = getPlatform(project.platform.targetPlatform)

  // Minimalis + terlalu banyak elemen.
  if (style?.minimal && (isCrowded(density.band) || countZones(project.layout) >= 4)) {
    warnings.push({
      id: 'conflict-minimalist-dense',
      severity: 'amaran',
      message:
        'Gaya minimalis dipilih tetapi poster mengandungi banyak elemen. Kurangkan blok teks atau zon aset supaya hasil kekal lapang.',
      field: 'style.stylePreset',
    })
  }

  // Subjek kanan + QR kanan.
  const subjectOnRight =
    project.subject.subjectType !== 'none' &&
    (project.subject.subjectPosition === 'right' ||
      project.subject.subjectPosition === 'center_right' ||
      project.layout.composition === 'subject_right')
  if (subjectOnRight && project.layout.qrZone === 'bottom_right') {
    warnings.push({
      id: 'conflict-subject-qr-right',
      severity: 'amaran',
      message:
        'Subjek dan kod QR sama-sama berada di sebelah kanan. Pindahkan kod QR ke kiri atau ke dalam footer.',
      field: 'layout.qrZone',
    })
  }

  // Palet cerah + teks kontras rendah.
  if (isLightPalette(colors) && project.typography.textContrast !== 'high') {
    const suggestion = darkestColor(colors)
    warnings.push({
      id: 'conflict-light-palette',
      severity: 'amaran',
      message: suggestion
        ? `Palet ini cerah. Tetapkan kontras teks kepada tinggi atau gunakan ${suggestion} sebagai warna teks supaya kekal terbaca.`
        : 'Palet ini cerah. Tetapkan kontras teks kepada tinggi supaya teks kekal terbaca.',
      field: 'typography.textContrast',
    })
  }

  // Teks panjang + platform lemah teks (Midjourney, Adobe).
  if (platform.weakTextRendering && density.totalCharacters > LONG_TEXT_THRESHOLD) {
    warnings.push({
      id: 'conflict-long-text-platform',
      severity: 'amaran',
      message: `${platform.label.ms} sukar menulis teks panjang dengan tepat. Prompt visual dan blok teks dipisahkan; tambah teks melalui editor selepas imej dijana.`,
      field: 'platform.targetPlatform',
    })
  }

  // Komposisi menetapkan satu sisi tetapi subjek diletakkan di sisi lain.
  // Tanpa semakan ini, bahagian COMPOSITION dan SUBJECT dalam prompt boleh
  // memberi arahan yang bercanggah kepada model.
  const composition = findPreset(COMPOSITIONS, project.layout.composition)
  if (
    composition?.implicitSubjectSide &&
    project.subject.subjectType !== 'none' &&
    project.subject.subjectCount > 0
  ) {
    const side = composition.implicitSubjectSide
    const position = project.subject.subjectPosition
    const matches =
      side === 'left'
        ? position === 'left' || position === 'center_left'
        : position === 'right' || position === 'center_right'
    if (!matches) {
      warnings.push({
        id: 'conflict-composition-subject',
        severity: 'amaran',
        message: `Komposisi "${composition.label.ms}" meletakkan subjek di sebelah ${
          side === 'left' ? 'kiri' : 'kanan'
        } tetapi kedudukan subjek ditetapkan lain. Selaraskan kedua-duanya supaya prompt tidak bercanggah.`,
        field: 'subject.subjectPosition',
      })
    }
  }

  // Logo atas + tajuk pada upper third.
  if (
    (project.layout.logoZone === 'top' ||
      project.layout.logoZone === 'top_left' ||
      project.layout.logoZone === 'top_right') &&
    project.content.mainHeadline.trim().length > 0
  ) {
    warnings.push({
      id: 'conflict-logo-headline',
      severity: 'info',
      message:
        'Ruang logo dan tajuk utama berkongsi bahagian atas. Nota susun atur menambah safe area dan jarak minimum antara keduanya.',
      field: 'layout.logoZone',
    })
  }

  return warnings
}
