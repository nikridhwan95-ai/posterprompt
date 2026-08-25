import type { ReactNode } from 'react'

/** Satu pilihan yang dipapar oleh OptionGroup atau CheckGroup. */
export interface Choice {
  readonly id: string
  readonly label: string
  readonly hint?: string
  readonly swatch?: ReactNode
  /**
   * Label kumpulan pilihan. Apabila ada, OptionGroup mengumpulkan pilihan di
   * bawah sub-tajuk mengikut turutan kemunculan pertama setiap kumpulan.
   */
  readonly group?: string
}

/**
 * Tukar katalog preset kepada senarai pilihan UI.
 * `groupOf` diberikan hanya untuk katalog yang terlalu panjang untuk satu grid
 * rata, contohnya katalog gaya.
 */
export function toChoices<T extends { id: string; label: { ms: string }; hint?: { ms: string } }>(
  presets: readonly T[],
  groupOf?: (preset: T) => string,
): Choice[] {
  return presets.map((preset) => ({
    id: preset.id,
    label: preset.label.ms,
    hint: preset.hint?.ms,
    group: groupOf?.(preset),
  }))
}
