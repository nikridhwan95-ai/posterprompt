/**
 * Pengekstrakan teks tepat — FR-003 dan QA-02.
 *
 * Teks pengguna disalin tanpa sebarang parafrasa, pembetulan ejaan atau
 * penukaran huruf. Hanya medan yang dipaparkan bagi kategori semasa digunakan;
 * medan tersembunyi yang masih berisi dilaporkan sebagai amaran supaya tiada
 * kandungan hilang secara senyap.
 */
import { EXACT_COPY_ORDER, getCategory, labelFor, visibleFieldsFor } from '@/data/categories'
import { CONTENT_FIELD_NAMES, type ContentFieldName } from '@/data/types'
import type { PosterProject } from '@/schemas/project'
import type { ExactCopyLine } from './types'

export function collectExactCopy(project: PosterProject): ExactCopyLine[] {
  const category = getCategory(project.category)
  const visible = new Set(visibleFieldsFor(category))
  const lines: ExactCopyLine[] = []

  for (const field of EXACT_COPY_ORDER) {
    if (!visible.has(field)) continue
    const value = project.content[field] ?? ''
    if (value.trim().length === 0) continue
    lines.push({
      field,
      label: labelFor(category, field).ms,
      value,
    })
  }

  return lines
}

/** Medan berisi yang tidak dipaparkan untuk kategori semasa. */
export function unusedFields(project: PosterProject): ContentFieldName[] {
  const visible = new Set(visibleFieldsFor(getCategory(project.category)))
  return CONTENT_FIELD_NAMES.filter(
    (field) => !visible.has(field) && (project.content[field] ?? '').trim().length > 0,
  )
}

/** Blok teks tepat untuk tab "Teks Tepat" — label membantu semakan ejaan. */
export function exactCopyBlock(lines: readonly ExactCopyLine[]): string {
  return lines.map((line) => `${line.label}:\n${line.value}`).join('\n\n')
}

/** Nilai mentah sahaja, seperti Lampiran B, untuk disisip ke dalam prompt. */
export function exactCopyValues(lines: readonly ExactCopyLine[]): string[] {
  return lines.map((line) => line.value)
}
