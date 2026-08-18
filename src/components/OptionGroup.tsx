import type { ReactNode } from 'react'
import { CheckCard, OptionCard } from './OptionCard'

export interface Choice {
  readonly id: string
  readonly label: string
  readonly hint?: string
  readonly swatch?: ReactNode
}

interface OptionGroupProps {
  name: string
  legend: string
  description?: string
  value: string
  onChange: (value: string) => void
  choices: readonly Choice[]
  columns?: 1 | 2 | 3
  error?: string
}

const COLUMN_CLASS: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

/** Kumpulan pilihan tunggal sebagai radiogroup sebenar (NFR-004). */
export function OptionGroup({
  name,
  legend,
  description,
  value,
  onChange,
  choices,
  columns = 2,
  error,
}: OptionGroupProps) {
  const errorId = error ? `${name}-error` : undefined

  return (
    <fieldset aria-describedby={errorId} aria-invalid={error ? true : undefined}>
      <legend className="pp-label mb-1">{legend}</legend>
      {description && <p className="mb-2 text-xs leading-relaxed text-ink-500">{description}</p>}
      <div className={`grid gap-2 ${COLUMN_CLASS[columns]}`}>
        {choices.map((choice) => (
          <OptionCard
            key={choice.id}
            name={name}
            value={choice.id}
            checked={value === choice.id}
            onChange={onChange}
            label={choice.label}
            hint={choice.hint}
            swatch={choice.swatch}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-xs font-medium text-[var(--color-danger-500)]">
          {error}
        </p>
      )}
    </fieldset>
  )
}

interface CheckGroupProps {
  name: string
  legend: string
  description?: string
  values: readonly string[]
  onChange: (values: string[]) => void
  choices: readonly Choice[]
  columns?: 1 | 2 | 3
  error?: string
}

/** Kumpulan pilihan berbilang, digunakan untuk zon aset. */
export function CheckGroup({
  name,
  legend,
  description,
  values,
  onChange,
  choices,
  columns = 2,
  error,
}: CheckGroupProps) {
  const errorId = error ? `${name}-error` : undefined

  return (
    <fieldset aria-describedby={errorId} aria-invalid={error ? true : undefined}>
      <legend className="pp-label mb-1">{legend}</legend>
      {description && <p className="mb-2 text-xs leading-relaxed text-ink-500">{description}</p>}
      <div className={`grid gap-2 ${COLUMN_CLASS[columns]}`}>
        {choices.map((choice) => (
          <CheckCard
            key={choice.id}
            id={`${name}-${choice.id}`}
            checked={values.includes(choice.id)}
            onChange={(checked) =>
              onChange(
                checked
                  ? [...values, choice.id]
                  : values.filter((current) => current !== choice.id),
              )
            }
            label={choice.label}
            hint={choice.hint}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-xs font-medium text-[var(--color-danger-500)]">
          {error}
        </p>
      )}
    </fieldset>
  )
}

/** Tukar katalog preset kepada senarai pilihan UI. */
export function toChoices<T extends { id: string; label: { ms: string }; hint?: { ms: string } }>(
  presets: readonly T[],
): Choice[] {
  return presets.map((preset) => ({
    id: preset.id,
    label: preset.label.ms,
    hint: preset.hint?.ms,
  }))
}
