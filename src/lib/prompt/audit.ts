/**
 * Audit kualiti sebelum output — SDD §7.8 (QA-01 hingga QA-07).
 * Audit dijalankan ke atas prompt yang telah melalui adapter, supaya masalah
 * yang diperkenalkan oleh adapter turut dikesan.
 */
import { getPlatform } from '@/data/platforms'
import { simplifyRatio } from '@/data/canvas'
import { STYLES } from '@/data/styles'
import { findPreset } from '@/data/types'
import { countZones, type PosterProject } from '@/schemas/project'
import type { AuditCheck, ExactCopyLine } from './types'

/** Token placeholder yang tidak boleh tertinggal dalam output (QA-01). */
const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /\[[A-Z_][A-Z0-9_ ]{2,}\]/,
  /\{\{[^}]+\}\}/,
  /<[A-Z_]{3,}>/,
  /\bTODO\b/,
  /\bLOREM IPSUM\b/i,
]

export interface AuditInput {
  readonly project: PosterProject
  readonly mainPrompt: string
  readonly exactCopy: readonly ExactCopyLine[]
  readonly ratio: string
  readonly adapterVersion: string | undefined
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0
  let count = 0
  let index = haystack.indexOf(needle)
  while (index !== -1) {
    count += 1
    index = haystack.indexOf(needle, index + needle.length)
  }
  return count
}

export function runQualityAudit(input: AuditInput): AuditCheck[] {
  const { project, mainPrompt, exactCopy, ratio, adapterVersion } = input
  const checks: AuditCheck[] = []

  // QA-01 — tiada token placeholder tertinggal.
  const placeholder = PLACEHOLDER_PATTERNS.map((pattern) => pattern.exec(mainPrompt)).find(
    (match) => match !== null,
  )
  checks.push({
    id: 'QA-01',
    label: 'Tiada token placeholder tertinggal',
    passed: !placeholder,
    detail: placeholder ? `Token "${placeholder[0]}" masih berada dalam prompt.` : undefined,
  })

  // QA-02 — semua teks tepat muncul tepat sekali dalam prompt.
  const duplicates = exactCopy.filter((line) => {
    const value = line.value.trim()
    if (value.length === 0) return false
    return countOccurrences(mainPrompt, value) !== 1
  })
  checks.push({
    id: 'QA-02',
    label: 'Setiap teks tepat muncul sekali dalam blok EXACT COPY',
    passed: duplicates.length === 0,
    detail:
      duplicates.length > 0
        ? `Semak medan: ${duplicates.map((line) => line.label).join(', ')}.`
        : undefined,
  })

  // QA-03 — dimensi dan nisbah sepadan.
  const computed = simplifyRatio(project.canvas.width, project.canvas.height)
  const ratioMatches = ratio.length > 0 && (ratio === computed || isEquivalentRatio(ratio, computed))
  checks.push({
    id: 'QA-03',
    label: 'Dimensi dan nisbah sepadan',
    passed: ratioMatches,
    detail: ratioMatches
      ? undefined
      : `Nisbah ${ratio || 'kosong'} tidak sepadan dengan ${project.canvas.width} × ${project.canvas.height} px (${computed}).`,
  })

  // QA-04 — hanya satu gaya utama aktif.
  const style = findPreset(STYLES, project.style.stylePreset)
  checks.push({
    id: 'QA-04',
    label: 'Hanya satu gaya utama aktif',
    passed: !!style,
    detail: style ? undefined : 'Gaya utama tidak dikenali dalam katalog.',
  })

  // QA-05 — zon aset tidak bertindih secara logik.
  const overlap = detectZoneOverlap(project)
  checks.push({
    id: 'QA-05',
    label: 'Zon aset tidak bertindih secara logik',
    passed: overlap === null,
    detail: overlap ?? undefined,
  })

  // QA-06 — adapter dan versinya diketahui.
  const platform = getPlatform(project.platform.targetPlatform)
  const versionKnown = !!adapterVersion && adapterVersion.length > 0
  checks.push({
    id: 'QA-06',
    label: 'Adapter dan versinya diketahui',
    passed: versionKnown,
    detail: versionKnown
      ? `${platform.label.ms} v${adapterVersion}`
      : 'Versi adapter tidak direkod.',
  })

  // QA-07 — tiada fakta, nama, tarikh atau logo direka.
  // Enjin tidak pernah menjana fakta; semakan ini mengesahkan bahawa setiap
  // teks dalam blok EXACT COPY benar-benar berasal daripada input pengguna.
  const invented = exactCopy.filter(
    (line) => (project.content[line.field as keyof typeof project.content] ?? '') !== line.value,
  )
  checks.push({
    id: 'QA-07',
    label: 'Tiada fakta, nama, tarikh atau logo direka',
    passed: invented.length === 0,
    detail:
      invented.length > 0
        ? `Teks tidak sepadan dengan input asal: ${invented.map((line) => line.label).join(', ')}.`
        : undefined,
  })

  return checks
}

function isEquivalentRatio(a: string, b: string): boolean {
  const parse = (value: string): number | null => {
    const parts = value.split(':')
    if (parts.length !== 2) return null
    const left = Number.parseFloat(parts[0])
    const right = Number.parseFloat(parts[1])
    if (!Number.isFinite(left) || !Number.isFinite(right) || left === 0) return null
    return right / left
  }
  const left = parse(a)
  const right = parse(b)
  if (left === null || right === null) return false
  return Math.abs(left - right) < 0.01
}

/** Pertindihan zon yang mustahil dipenuhi serentak (QA-05). */
function detectZoneOverlap(project: PosterProject): string | null {
  const { logoZone, qrZone, assetZones } = project.layout

  if (logoZone === 'bottom' && assetZones.includes('sponsor')) {
    return 'Ruang logo bawah bertindih dengan jalur penaja.'
  }
  if (logoZone === 'bottom' && assetZones.includes('footer')) {
    return 'Ruang logo bawah bertindih dengan jalur footer.'
  }
  if (qrZone === 'footer' && assetZones.includes('footer') && assetZones.includes('sponsor')) {
    return 'Footer menampung kod QR, penaja dan nota serentak.'
  }
  if (countZones(project.layout) > 5) {
    return 'Lebih daripada lima zon aset diminta pada satu kanvas.'
  }
  return null
}

export function auditPassed(checks: readonly AuditCheck[]): boolean {
  return checks.every((check) => check.passed)
}
