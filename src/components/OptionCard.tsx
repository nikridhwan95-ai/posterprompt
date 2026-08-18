import type { ReactNode } from 'react'

interface OptionCardProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: string
  hint?: string
  /** Contoh warna atau ikon kecil di sebelah kiri label. */
  swatch?: ReactNode
  disabled?: boolean
}

/**
 * Kad pilihan visual dengan keadaan dipilih yang jelas (§5.5).
 * Dibina di atas radio sebenar supaya navigasi anak panah papan kekunci dan
 * pengumuman pembaca skrin berfungsi tanpa kod tambahan (NFR-004).
 */
export function OptionCard({
  name,
  value,
  checked,
  onChange,
  label,
  hint,
  swatch,
  disabled,
}: OptionCardProps) {
  return (
    <label
      className={`group relative flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
        checked
          ? 'border-magenta-500 bg-magenta-50 ring-1 ring-magenta-500'
          : 'border-ink-200 bg-white hover:border-blue-400 hover:bg-blue-50/40'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''} has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-600`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />

      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? 'border-magenta-500' : 'border-[var(--color-control)] group-hover:border-blue-400'
        }`}
      >
        {checked && <span className="size-2 rounded-full bg-magenta-500" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {swatch}
          <span
            className={`text-sm font-semibold ${checked ? 'text-magenta-800' : 'text-ink-800'}`}
          >
            {label}
          </span>
        </span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{hint}</span>}
      </span>
    </label>
  )
}

interface CheckCardProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
}

/** Varian pilihan berbilang untuk zon aset. */
export function CheckCard({ id, checked, onChange, label, hint, disabled }: CheckCardProps) {
  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
        checked
          ? 'border-magenta-500 bg-magenta-50 ring-1 ring-magenta-500'
          : 'border-ink-200 bg-white hover:border-blue-400 hover:bg-blue-50/40'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''} has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-600`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border-2 ${
          checked
            ? 'border-magenta-500 bg-magenta-500 text-white'
            : 'border-[var(--color-control)] group-hover:border-blue-400'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 6.5 4.5 9 10 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`text-sm font-semibold ${checked ? 'text-magenta-800' : 'text-ink-800'}`}>
          {label}
        </span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{hint}</span>}
      </span>
    </label>
  )
}

interface ToggleProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
}

/**
 * Suis on/off. Butang tidak boleh dilabel oleh elemen <label> (butang bukan
 * elemen yang boleh dilabel), jadi nama boleh capai diberi melalui
 * aria-labelledby dan teks label menjadi sasaran klik kedua (NFR-004).
 */
export function Toggle({ id, checked, onChange, label, hint }: ToggleProps) {
  const labelId = `${id}-label`
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={hintId}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-magenta-500' : 'bg-[var(--color-control)]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <div className="min-w-0">
        <span
          id={labelId}
          onClick={() => onChange(!checked)}
          className="block cursor-pointer text-sm font-semibold text-ink-800"
        >
          {label}
        </span>
        {hint && (
          <span id={hintId} className="mt-0.5 block text-xs leading-relaxed text-ink-500">
            {hint}
          </span>
        )}
      </div>
    </div>
  )
}
