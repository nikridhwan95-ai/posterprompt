import { Button } from '@/components/Button'
import type { DraftNotice } from './context'

interface DraftBannerProps {
  notice: DraftNotice
  onDismiss: () => void
  onDiscard: () => void
  onDownload?: () => void
}

const TONE: Record<DraftNotice['kind'], string> = {
  restored: 'border-blue-200 bg-blue-50 text-blue-900',
  migrated: 'border-yellow-300 bg-yellow-50 text-yellow-900',
  incompatible: 'border-[var(--color-danger-500)] bg-[var(--color-danger-50)] text-ink-900',
}

/**
 * Notis draf (§5.6 "Draf lama").
 * Draf yang tidak serasi tidak sekali-kali dibuang secara senyap — pengguna
 * mesti diberi pilihan memuat turun teksnya dahulu (§8.5).
 */
export function DraftBanner({ notice, onDismiss, onDiscard, onDownload }: DraftBannerProps) {
  return (
    <div
      role={notice.kind === 'incompatible' ? 'alert' : 'status'}
      className={`pp-no-print flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${TONE[notice.kind]}`}
    >
      <p className="text-sm leading-relaxed">{notice.message}</p>
      <div className="flex shrink-0 flex-wrap gap-2">
        {onDownload && (
          <Button type="button" variant="secondary" size="sm" onClick={onDownload}>
            Muat turun teks draf
          </Button>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={onDiscard}>
          Padam draf
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
          Tutup
        </Button>
      </div>
    </div>
  )
}
