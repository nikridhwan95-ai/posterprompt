import { CheckCard, OptionCard } from './OptionCard'
import type { Choice } from './choices'

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

/**
 * Kumpulkan pilihan mengikut label kumpulan, mengekalkan turutan kemunculan
 * pertama. Senarai tanpa kumpulan memulangkan satu bahagian tanpa label.
 */
function sections(choices: readonly Choice[]): { label?: string; items: Choice[] }[] {
  if (!choices.some((choice) => choice.group)) return [{ items: [...choices] }]
  const order: string[] = []
  const byGroup = new Map<string, Choice[]>()
  for (const choice of choices) {
    const key = choice.group ?? ''
    if (!byGroup.has(key)) {
      byGroup.set(key, [])
      order.push(key)
    }
    byGroup.get(key)?.push(choice)
  }
  return order.map((key) => ({ label: key || undefined, items: byGroup.get(key) ?? [] }))
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
      {/*
        Fieldset bersarang bagi setiap kumpulan: radio berkongsi atribut `name`
        yang sama, jadi pemilihan dan navigasi anak panah kekal merentas
        keseluruhan senarai, sementara pembaca skrin mengumumkan kumpulan
        semasa pengguna memasukinya (NFR-004).
      */}
      {sections(choices).map((section, index) => {
        const cards = (
          <div className={`grid gap-2 ${COLUMN_CLASS[columns]}`}>
            {section.items.map((choice) => (
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
        )

        if (!section.label) return <div key="all">{cards}</div>

        return (
          <fieldset key={section.label} className={index === 0 ? '' : 'mt-5'}>
            <legend className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
              {section.label}
            </legend>
            {cards}
          </fieldset>
        )
      })}
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
