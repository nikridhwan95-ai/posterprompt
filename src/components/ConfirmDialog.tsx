import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Dialog pengesahan untuk tindakan yang memadam data (FR-021).
 * Menggunakan <dialog> asli supaya perangkap fokus dan Escape dikendalikan
 * oleh pelayar (NFR-004).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Batal',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  // Dua dialog boleh wujud serentak dalam satu pokok; id tetap akan
  // menyebabkan tajuk yang salah dibaca oleh pembaca skrin.
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      // Sandaran untuk persekitaran tanpa sokongan dialog modal: dialog tetap
      // dipaparkan walaupun tanpa lapisan atas dan perangkap fokus asli.
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClose={onCancel}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 p-0 backdrop:bg-ink-900/40"
    >
      <div className="flex flex-col gap-3 p-5">
        <h2 id={titleId} className="text-lg font-bold text-ink-900">
          {title}
        </h2>
        <p id={descriptionId} className="text-sm leading-relaxed text-ink-600">
          {description}
        </p>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
