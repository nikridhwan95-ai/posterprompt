import type { DensityResult } from '@/lib/prompt/types'

const BAND_STYLES: Record<DensityResult['band'], { bar: string; text: string; note: string }> = {
  rendah: {
    bar: 'bg-blue-500',
    text: 'text-blue-700',
    note: 'Ruang masih banyak. Anda boleh menambah maklumat penting.',
  },
  sesuai: {
    bar: 'bg-[var(--color-ok-500)]',
    text: 'text-[var(--color-ok-500)]',
    note: 'Beban kandungan seimbang untuk satu poster.',
  },
  padat: {
    bar: 'bg-yellow-400',
    text: 'text-yellow-700',
    note: 'Poster mula padat. Pertimbangkan untuk memendekkan teks sokongan.',
  },
  terlalu_padat: {
    bar: 'bg-[var(--color-danger-500)]',
    text: 'text-[var(--color-danger-500)]',
    note: 'Terlalu banyak elemen. Kurangkan blok teks atau zon aset.',
  },
}

/** Meter ketumpatan dengan status Rendah, Sesuai, Padat atau Terlalu Padat (§5.5). */
export function DensityMeter({ density }: { density: DensityResult }) {
  const style = BAND_STYLES[density.band]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-ink-700">Ketumpatan kandungan</span>
        <span className={`text-xs font-bold tabular-nums ${style.text}`}>
          {density.label} · {density.score}/100
        </span>
      </div>

      <div
        role="meter"
        aria-valuenow={density.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Skor ketumpatan kandungan"
        aria-valuetext={`${density.score} daripada 100, ${density.label}`}
        className="h-2 w-full overflow-hidden rounded-full bg-ink-200"
      >
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${Math.max(2, density.score)}%` }}
        />
      </div>

      <p className="text-xs leading-relaxed text-ink-500">{style.note}</p>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink-500">
        <div className="flex justify-between gap-2">
          <dt>Aksara</dt>
          <dd className="tabular-nums text-ink-700">{density.totalCharacters}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Blok teks</dt>
          <dd className="tabular-nums text-ink-700">{density.textBlocks}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Zon aset</dt>
          <dd className="tabular-nums text-ink-700">{density.assetZones}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Subjek</dt>
          <dd className="tabular-nums text-ink-700">{density.subjectCount}</dd>
        </div>
      </dl>
    </div>
  )
}
