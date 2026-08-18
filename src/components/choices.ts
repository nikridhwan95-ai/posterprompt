import type { ReactNode } from 'react'

/** Satu pilihan yang dipapar oleh OptionGroup atau CheckGroup. */
export interface Choice {
  readonly id: string
  readonly label: string
  readonly hint?: string
  readonly swatch?: ReactNode
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
