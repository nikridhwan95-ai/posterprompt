/**
 * Komposisi prompt — SDD §7.3.
 *
 *   validated  = validate(project)
 *   normalized = normalize(validated)
 *   density    = scoreContentDensity(normalized.content)
 *   fragments  = [...]
 *   basePrompt = joinNonEmpty(fragments)
 *   adapted    = platformAdapter(normalized.platform, basePrompt)
 *   audit      = qualityAudit(adapted, normalized, density)
 *
 * Fungsi ini tulen (NFR-008): tiada cap masa, tiada rawak, tiada I/O. Input
 * yang sama sentiasa menghasilkan output yang sama.
 */
import { integerRatio, orientationOf } from '@/data/canvas'
import { effectiveColors } from '@/data/palettes'
import { getPlatform } from '@/data/platforms'
import { labelFor, getCategory } from '@/data/categories'
import { canvasMeta, posterProjectSchema, type PosterProject } from '@/schemas/project'
import { SCHEMA_VERSION, TEMPLATE_VERSION } from '@/data/version'
import { getAdapter, universalAdapter } from './adapters'
import { runQualityAudit } from './audit'
import { detectConflicts } from './conflicts'
import { isCrowded, scoreContentDensity } from './density'
import { collectExactCopy, exactCopyBlock, unusedFields } from './exactCopy'
import {
  canvasFragment,
  categoryTemplate,
  constraintsFragment,
  exactCopyFragment,
  layoutFragment,
  qualityFragment,
  subjectFragment,
  typographyFragment,
  visualFragment,
} from './fragments'
import { planZones } from './layoutPlan'
import { buildNegativePrompt } from './negative'
import { normalizeProject } from './normalize'
import { HEADLINE_WARN_LENGTH } from '@/schemas/project'
import type {
  GeneratedOutput,
  LayoutNote,
  PromptContext,
  PromptSection,
  QualityWarning,
} from './types'

export class ValidationError extends Error {
  readonly issues: readonly { path: string; message: string }[]

  constructor(issues: readonly { path: string; message: string }[]) {
    super('Projek tidak sah')
    this.name = 'ValidationError'
    this.issues = issues
  }
}

function joinNonEmpty(sections: readonly (PromptSection | null)[]): PromptSection[] {
  return sections.filter(
    (section): section is PromptSection =>
      section !== null && section.lines.some((line) => line.trim().length > 0),
  )
}

function buildContext(project: PosterProject): PromptContext {
  const meta = canvasMeta(project.canvas)
  return {
    project,
    language: project.platform.promptLanguage,
    ratio: meta.ratio,
    integerRatio: integerRatio(project.canvas.width, project.canvas.height),
    orientation: orientationOf(project.canvas.width, project.canvas.height),
    exactCopy: collectExactCopy(project),
    density: scoreContentDensity(project),
    colors: effectiveColors(project.style.palettePreset, project.style.customColors),
  }
}

/** Amaran kualiti bukan konflik: ketumpatan, tajuk panjang dan medan tersisa. */
function contentWarnings(ctx: PromptContext): QualityWarning[] {
  const warnings: QualityWarning[] = []
  const { project, density } = ctx

  if (isCrowded(density.band)) {
    warnings.push({
      id: 'density',
      severity: density.band === 'terlalu_padat' ? 'amaran' : 'info',
      message:
        density.band === 'terlalu_padat'
          ? `Ketumpatan kandungan ${density.score}/100 (Terlalu Padat). Kurangkan blok teks atau zon aset supaya poster kekal mudah dibaca.`
          : `Ketumpatan kandungan ${density.score}/100 (Padat). Pertimbangkan untuk memendekkan teks sokongan.`,
      field: 'content.mainHeadline',
    })
  }

  if (project.content.mainHeadline.length > HEADLINE_WARN_LENGTH) {
    warnings.push({
      id: 'headline-length',
      severity: 'info',
      message: `Tajuk utama ${project.content.mainHeadline.length} aksara. Tajuk melebihi ${HEADLINE_WARN_LENGTH} aksara biasanya mengecilkan saiz font pada poster.`,
      field: 'content.mainHeadline',
    })
  }

  const category = getCategory(project.category)
  for (const field of unusedFields(project)) {
    warnings.push({
      id: `unused-${field}`,
      severity: 'info',
      message: `Medan "${labelFor(category, field).ms}" berisi tetapi tidak digunakan oleh kategori ${category.label.ms.toLowerCase()}. Teks itu tidak dimasukkan ke dalam prompt.`,
      field: `content.${field}`,
    })
  }

  return warnings
}

function toLayoutNotes(project: PosterProject): LayoutNote[] {
  return planZones(project).map((slot) => ({ zone: slot.label, instruction: slot.note }))
}

function layoutNotesToText(notes: readonly LayoutNote[]): string {
  return notes.map((note) => `${note.zone}: ${note.instruction}`).join('\n')
}

/**
 * Jana keseluruhan set output daripada satu projek.
 * @throws {ValidationError} apabila projek gagal validasi skema (§10.2).
 */
export function generatePrompt(project: PosterProject): GeneratedOutput {
  const parsed = posterProjectSchema.safeParse(project)
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  const normalized = normalizeProject(parsed.data as PosterProject)
  const ctx = buildContext(normalized)

  const sections = joinNonEmpty([
    categoryTemplate(ctx),
    canvasFragment(ctx),
    visualFragment(ctx),
    layoutFragment(ctx),
    subjectFragment(ctx),
    typographyFragment(ctx),
    exactCopyFragment(ctx),
    constraintsFragment(ctx),
    qualityFragment(ctx),
  ])

  const platform = getPlatform(normalized.platform.targetPlatform)
  const adapterWarnings: QualityWarning[] = []

  // NFR-010: kegagalan satu adapter tidak boleh merosakkan keseluruhan output.
  let adapter = getAdapter(normalized.platform.targetPlatform) ?? universalAdapter
  let adapted
  try {
    adapted = adapter.transform(sections, ctx)
  } catch {
    adapter = universalAdapter
    adapted = universalAdapter.transform(sections, ctx)
    adapterWarnings.push({
      id: 'adapter-fallback',
      severity: 'amaran',
      message: `Adapter ${platform.label.ms} gagal dijalankan. Output Universal digunakan sebagai gantian; kandungan anda tidak hilang.`,
      field: 'platform.targetPlatform',
    })
  }

  const exactCopyText = exactCopyBlock(ctx.exactCopy)
  const negativePrompt = buildNegativePrompt(normalized, ctx.density, ctx.language)
  const layoutNotes = toLayoutNotes(normalized)

  const audit = runQualityAudit({
    project: normalized,
    // Apabila adapter memisahkan teks, blok teks tepat berada dalam output
    // berasingan; kedua-duanya disemak supaya QA-02 tetap bermakna.
    mainPrompt: adapted.textSeparated
      ? `${adapted.prompt}\n${exactCopyText}`
      : adapted.prompt,
    exactCopy: ctx.exactCopy,
    ratio: ctx.ratio,
    adapterVersion: adapter.version,
  })

  const warnings: QualityWarning[] = [
    ...contentWarnings(ctx),
    ...detectConflicts(normalized, ctx.density, ctx.colors),
    ...adapted.warnings,
    ...adapterWarnings,
    ...audit
      .filter((check) => !check.passed)
      .map((check) => ({
        id: `audit-${check.id}`,
        severity: 'amaran' as const,
        message: `${check.id}: ${check.label} — ${check.detail ?? 'semakan gagal'}`,
      })),
  ]

  return {
    mainPrompt: adapted.prompt,
    exactCopyText,
    exactCopy: ctx.exactCopy,
    negativePrompt,
    layoutNotes,
    layoutNotesText: layoutNotesToText(layoutNotes),
    warnings: dedupeWarnings(warnings),
    audit,
    density: ctx.density,
    sections: adapted.sections,
    platformId: adapter.id,
    adapterVersion: adapter.version,
    templateVersion: normalized.templateVersion || TEMPLATE_VERSION,
    schemaVersion: normalized.schemaVersion || SCHEMA_VERSION,
  }
}

function dedupeWarnings(warnings: readonly QualityWarning[]): QualityWarning[] {
  const seen = new Set<string>()
  const result: QualityWarning[] = []
  for (const warning of warnings) {
    if (seen.has(warning.id)) continue
    seen.add(warning.id)
    result.push(warning)
  }
  return result
}

/** Ringkasan ketumpatan sahaja, untuk meter langsung dalam wizard. */
export { scoreContentDensity } from './density'
