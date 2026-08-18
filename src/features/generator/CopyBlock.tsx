import { useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { useToast } from '@/components/Toast'
import { copyText } from '@/lib/clipboard'

interface CopyBlockProps {
  id: string
  title: string
  description?: string
  text: string
  emptyMessage?: string
}

/**
 * Blok output dengan tindakan salin dan maklum balas kejayaan atau kegagalan
 * (FR-018). Apabila clipboard ditolak, teks dipaparkan dalam textarea yang
 * telah dipilih sepenuhnya supaya pengguna boleh menyalin secara manual
 * (§5.6, UAT-12).
 */
export function CopyBlock({ id, title, description, text, emptyMessage }: CopyBlockProps) {
  const toast = useToast()
  const [manual, setManual] = useState(false)
  const manualRef = useRef<HTMLTextAreaElement>(null)

  const isEmpty = text.trim().length === 0

  const handleCopy = async () => {
    const result = await copyText(text)
    if (result === 'clipboard' || result === 'fallback') {
      toast.show(`${title} telah disalin ke papan klip.`, 'success')
      setManual(false)
      return
    }
    setManual(true)
    toast.show(
      'Pelayar menolak akses papan klip. Teks telah dipilih untuk anda — tekan Ctrl+C atau Cmd+C.',
      'error',
    )
    // Tunggu textarea dipasang sebelum memilih kandungannya.
    requestAnimationFrame(() => {
      const node = manualRef.current
      if (!node) return
      node.focus()
      node.select()
    })
  }

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-sm font-bold text-ink-900">
            {title}
          </h2>
          {description && <p className="mt-1 text-xs leading-relaxed text-ink-500">{description}</p>}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => void handleCopy()}
          disabled={isEmpty}
          className="pp-no-print shrink-0"
        >
          Salin {title.toLowerCase()}
        </Button>
      </div>

      {isEmpty ? (
        <p className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-4 text-sm text-ink-500">
          {emptyMessage ?? 'Tiada kandungan untuk bahagian ini.'}
        </p>
      ) : (
        <pre className="max-h-[26rem] overflow-auto rounded-xl border border-ink-200 bg-white p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-ink-800">
          {text}
        </pre>
      )}

      {manual && !isEmpty && (
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-warn-500)] bg-[var(--color-warn-50)] p-3">
          <label htmlFor={`${id}-manual`} className="text-xs font-semibold text-[var(--color-warn-500)]">
            Salin manual: teks di bawah telah dipilih. Tekan Ctrl+C (Windows) atau Cmd+C (Mac).
          </label>
          <textarea
            id={`${id}-manual`}
            ref={manualRef}
            readOnly
            value={text}
            rows={6}
            className="pp-input font-mono text-xs"
          />
        </div>
      )}
    </section>
  )
}
