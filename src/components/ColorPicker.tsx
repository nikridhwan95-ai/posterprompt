import { useId, useState } from 'react'
import { MAX_CUSTOM_COLORS, PALETTES } from '@/data/palettes'
import { normalizeHex } from '@/lib/prompt/normalize'
import { Button } from './Button'

interface ColorPickerProps {
  colors: string[]
  onChange: (colors: string[]) => void
  error?: string
}

/**
 * Pemilih warna dengan input HEX dan preset palet satu klik (§5.5, FR-007).
 * Nilai yang tidak sah ditolak dengan mesej, bukan diteka (§7.4).
 */
export function ColorPicker({ colors, onChange, error }: ColorPickerProps) {
  const inputId = useId()
  const [draft, setDraft] = useState('#')
  const [localError, setLocalError] = useState<string | null>(null)
  const full = colors.length >= MAX_CUSTOM_COLORS

  const add = () => {
    const hex = normalizeHex(draft)
    if (!hex) {
      setLocalError('Gunakan format #RRGGBB, contohnya #7A0026.')
      return
    }
    if (colors.includes(hex)) {
      setLocalError('Warna itu sudah ada dalam senarai.')
      return
    }
    if (full) {
      setLocalError(`Maksimum ${MAX_CUSTOM_COLORS} warna tersuai.`)
      return
    }
    setLocalError(null)
    setDraft('#')
    onChange([...colors, hex])
  }

  const remove = (hex: string) => onChange(colors.filter((color) => color !== hex))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="pp-label">
            Kod warna HEX
          </label>
          <div className="flex items-center gap-2">
            <input
              id={inputId}
              type="color"
              aria-label="Pilih warna secara visual"
              value={normalizeHex(draft) ?? '#000000'}
              onChange={(event) => {
                setDraft(event.target.value.toUpperCase())
                setLocalError(null)
              }}
              className="size-10 shrink-0 cursor-pointer rounded-lg border border-[var(--color-control)] bg-white p-1"
            />
            <input
              type="text"
              inputMode="text"
              maxLength={7}
              value={draft}
              aria-label="Kod HEX warna tersuai"
              aria-invalid={localError ? true : undefined}
              onChange={(event) => {
                setDraft(event.target.value.toUpperCase())
                setLocalError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  add()
                }
              }}
              placeholder="#7A0026"
              className="pp-input w-32 font-mono uppercase"
            />
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={add} disabled={full}>
          Tambah warna
        </Button>
      </div>

      {(localError || error) && (
        <p className="text-xs font-medium text-[var(--color-danger-500)]">{localError ?? error}</p>
      )}

      {colors.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <li key={color}>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pr-1 pl-2">
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-ink-300"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-xs text-ink-700">{color}</span>
                <button
                  type="button"
                  onClick={() => remove(color)}
                  className="flex size-5 items-center justify-center rounded-full text-ink-500 hover:bg-[var(--color-danger-50)] hover:text-[var(--color-danger-500)]"
                >
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Buang warna {color}</span>
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-ink-500">
          Belum ada warna tersuai. Preset palet di atas akan digunakan.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-ink-700">Ambil warna daripada preset</p>
        <div className="flex flex-wrap gap-2">
          {PALETTES.filter((palette) => palette.colors.length > 0).map((palette) => (
            <button
              key={palette.id}
              type="button"
              onClick={() => {
                setLocalError(null)
                onChange(palette.colors.slice(0, MAX_CUSTOM_COLORS))
              }}
              className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-700 hover:border-magenta-400 hover:text-magenta-700"
            >
              <span aria-hidden="true" className="flex overflow-hidden rounded border border-ink-300">
                {palette.colors.map((color) => (
                  <span key={color} className="size-3.5" style={{ backgroundColor: color }} />
                ))}
              </span>
              {palette.label.ms}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
