import { effectiveColors } from '@/data/palettes'
import type { PosterProject } from '@/schemas/project'

/**
 * Pratonton rangka berasaskan zon (FR-023).
 *
 * Ini bukan poster generatif — ia hanya menunjukkan kedudukan relatif tajuk,
 * subjek, logo, QR dan footer supaya pengguna nampak kesan pilihan mereka
 * sebelum menjana prompt (§5.5).
 */
export function ZonePreview({ project, size = 220 }: { project: PosterProject; size?: number }) {
  const { width, height } = project.canvas
  const ratio = width / height
  const boxWidth = ratio >= 1 ? size : Math.round(size * ratio)
  const boxHeight = ratio >= 1 ? Math.round(size / ratio) : size

  const colors = effectiveColors(project.style.palettePreset, project.style.customColors)
  const accent = colors[0] ?? '#7A0026'
  const secondary = colors[1] ?? '#C9A227'

  const pad = 8
  const innerW = boxWidth - pad * 2
  const innerH = boxHeight - pad * 2

  const hasLogo = project.layout.logoZone !== 'none'
  const logoBottom = project.layout.logoZone === 'bottom'
  const hasSubject = project.subject.subjectType !== 'none' && project.subject.subjectCount > 0
  const hasQr = project.layout.qrZone !== 'none'
  const hasFooter =
    project.layout.assetZones.includes('footer') ||
    project.layout.assetZones.includes('sponsor') ||
    project.content.footerNotes.trim().length > 0

  const align = project.layout.textAlignment
  const textX = align === 'left' ? pad + 4 : align === 'right' ? boxWidth - pad - 4 : boxWidth / 2
  const textAnchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle'

  const subjectSide =
    project.layout.composition === 'subject_left' ||
    project.subject.subjectPosition === 'left' ||
    project.subject.subjectPosition === 'center_left'
      ? 'left'
      : project.layout.composition === 'subject_right' ||
          project.subject.subjectPosition === 'right' ||
          project.subject.subjectPosition === 'center_right'
        ? 'right'
        : 'center'

  const subjectW = subjectSide === 'center' ? innerW * 0.5 : innerW * 0.42
  const subjectX =
    subjectSide === 'left'
      ? pad + 2
      : subjectSide === 'right'
        ? boxWidth - pad - 2 - subjectW
        : (boxWidth - subjectW) / 2

  const topBand = pad + (hasLogo && !logoBottom ? 22 : 0)

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${boxWidth} ${boxHeight}`}
        width={boxWidth}
        height={boxHeight}
        role="img"
        aria-label={`Rangka susun atur poster ${width} kali ${height} piksel. Zon yang dikhaskan: ${describeZones(project)}.`}
        className="max-w-full rounded-lg border border-ink-300 bg-white shadow-sm"
      >
        <rect x="0" y="0" width={boxWidth} height={boxHeight} fill="#FFFFFF" />
        <rect
          x={pad / 2}
          y={pad / 2}
          width={boxWidth - pad}
          height={boxHeight - pad}
          fill="none"
          stroke="#E4E1EC"
          strokeDasharray="3 3"
        />

        {hasLogo && (
          <rect
            x={logoZoneX(project.layout.logoZone, boxWidth, pad, innerW)}
            y={logoBottom ? boxHeight - pad - 16 : pad}
            width={innerW * 0.34}
            height={16}
            rx={3}
            fill={secondary}
            opacity={0.35}
          />
        )}

        {hasSubject && (
          <rect
            x={subjectX}
            y={topBand + 26}
            width={subjectW}
            height={innerH * 0.42}
            rx={4}
            fill={accent}
            opacity={0.28}
          />
        )}

        <rect
          x={pad + 2}
          y={topBand + 4}
          width={innerW - 4}
          height={14}
          rx={2}
          fill={accent}
          opacity={0.85}
        />
        <text
          x={textX}
          y={topBand + 15}
          textAnchor={textAnchor}
          fontSize="8"
          fill="#FFFFFF"
          fontWeight="700"
        >
          TAJUK
        </text>

        <rect
          x={pad + 2}
          y={boxHeight - pad - (hasFooter ? 40 : 28)}
          width={innerW - 4}
          height={8}
          rx={2}
          fill="#9F98B0"
          opacity={0.5}
        />
        <rect
          x={pad + 2}
          y={boxHeight - pad - (hasFooter ? 28 : 16)}
          width={innerW * 0.6}
          height={6}
          rx={2}
          fill="#9F98B0"
          opacity={0.35}
        />

        {hasFooter && (
          <rect
            x={pad}
            y={boxHeight - pad - 14}
            width={innerW}
            height={12}
            rx={2}
            fill="#CBC6D8"
            opacity={0.6}
          />
        )}

        {hasQr && (
          <rect
            x={
              project.layout.qrZone === 'bottom_left'
                ? pad + 2
                : project.layout.qrZone === 'footer'
                  ? (boxWidth - 14) / 2
                  : boxWidth - pad - 16
            }
            y={boxHeight - pad - 18}
            width={14}
            height={14}
            rx={2}
            fill="#171224"
            opacity={0.7}
          />
        )}
      </svg>
      <figcaption className="text-xs text-ink-500">
        Rangka zon sahaja — bukan pratonton poster sebenar.
      </figcaption>
    </figure>
  )
}

function logoZoneX(zone: string, boxWidth: number, pad: number, innerW: number): number {
  if (zone === 'top_left' || zone === 'bottom') return pad
  if (zone === 'top_right') return boxWidth - pad - innerW * 0.34
  return (boxWidth - innerW * 0.34) / 2
}

function describeZones(project: PosterProject): string {
  const zones: string[] = []
  if (project.layout.logoZone !== 'none') zones.push('ruang logo')
  if (project.subject.subjectType !== 'none') zones.push('subjek visual')
  if (project.layout.qrZone !== 'none') zones.push('kod QR')
  for (const zone of project.layout.assetZones) zones.push(zone)
  return zones.length > 0 ? zones.join(', ') : 'tiada zon tambahan'
}
