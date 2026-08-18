import { useFormContext, useWatch } from 'react-hook-form'
import { getCategory } from '@/data/categories'
import { ORIENTATION_LABELS, orientationOf } from '@/data/canvas'
import { getPalette } from '@/data/palettes'
import { getPlatform } from '@/data/platforms'
import { COMPOSITIONS, STYLES, SUBJECT_TYPES } from '@/data/styles'
import { findPreset } from '@/data/types'
import { scoreContentDensity } from '@/lib/prompt/density'
import { canvasMeta, type PosterProject } from '@/schemas/project'
import { DensityMeter } from './DensityMeter'
import { ZonePreview } from './ZonePreview'

interface SummaryRow {
  label: string
  value: string
}

/**
 * Ringkasan projek yang melekat di sebelah kanan pada desktop (§5.4).
 *
 * Komponen ini melanggan borang secara langsung supaya hanya panel ini yang
 * di-render semula semasa pengguna menaip, bukan keseluruhan wizard.
 */
export function ProjectSummary() {
  const { control } = useFormContext<PosterProject>()
  const project = useWatch({ control }) as PosterProject
  const category = getCategory(project.category)
  const meta = canvasMeta(project.canvas)
  const style = findPreset(STYLES, project.style.stylePreset)
  const composition = findPreset(COMPOSITIONS, project.layout.composition)
  const subject = findPreset(SUBJECT_TYPES, project.subject.subjectType)
  const palette = getPalette(project.style.palettePreset)
  const platform = getPlatform(project.platform.targetPlatform)
  const density = scoreContentDensity(project)

  const validDimensions = Number.isFinite(project.canvas.width) && Number.isFinite(project.canvas.height)

  const rows: SummaryRow[] = [
    { label: 'Kategori', value: category.label.ms },
    {
      label: 'Kanvas',
      value: validDimensions
        ? `${project.canvas.width} × ${project.canvas.height} px · ${meta.ratio}`
        : 'Belum lengkap',
    },
    {
      label: 'Orientasi',
      value: validDimensions
        ? ORIENTATION_LABELS[orientationOf(project.canvas.width, project.canvas.height)].ms
        : '—',
    },
    { label: 'Gaya', value: style?.label.ms ?? '—' },
    {
      label: 'Palet',
      value:
        project.style.customColors.length > 0
          ? `${project.style.customColors.length} warna tersuai`
          : palette.label.ms,
    },
    { label: 'Komposisi', value: composition?.label.ms ?? '—' },
    {
      label: 'Subjek',
      value:
        project.subject.subjectType === 'none'
          ? 'Tiada subjek'
          : `${project.subject.subjectCount} × ${subject?.label.ms ?? ''}`,
    },
    { label: 'Platform', value: platform.label.ms },
  ]

  const colors =
    project.style.customColors.length > 0 ? project.style.customColors : palette.colors

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-bold text-ink-900">Ringkasan projek</h2>
        <p className="mt-1 text-xs text-ink-500">Dikemas kini secara langsung semasa anda menaip.</p>
      </div>

      <ZonePreview project={project} />

      <dl className="flex flex-col divide-y divide-ink-200 border-y border-ink-200 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="shrink-0 text-ink-500">{row.label}</dt>
            <dd className="text-right font-medium text-ink-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      {colors.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-700">Warna</span>
          <ul className="flex flex-wrap gap-1.5">
            {colors.map((color) => (
              <li key={color} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-4 rounded border border-ink-300"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-[11px] text-ink-600">{color}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DensityMeter density={density} />
    </div>
  )
}
