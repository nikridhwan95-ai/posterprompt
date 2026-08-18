import { Controller, useFormContext } from 'react-hook-form'
import { BACKGROUNDS, MOODS, STYLES, TEXT_CONTRASTS, TYPEFACES } from '@/data/styles'
import { PALETTES } from '@/data/palettes'
import { ColorPicker } from '@/components/ColorPicker'
import { OptionGroup, toChoices } from '@/components/OptionGroup'
import { Toggle } from '@/components/OptionCard'
import type { PosterProject } from '@/schemas/project'

function Swatch({ colors }: { colors: readonly string[] }) {
  if (colors.length === 0) return null
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 overflow-hidden rounded border border-ink-300"
    >
      {colors.map((color) => (
        <span key={color} className="size-3.5" style={{ backgroundColor: color }} />
      ))}
    </span>
  )
}

/** Langkah 3: gaya visual, mood, palet dan tipografi (FR-006 hingga FR-008). */
export function StepStyle() {
  const { control, watch, formState } = useFormContext<PosterProject>()
  const errors = formState.errors
  const customColors = watch('style.customColors') ?? []

  return (
    <div className="flex flex-col gap-8">
      <Controller
        control={control}
        name="style.stylePreset"
        render={({ field }) => (
          <OptionGroup
            name="style-preset"
            legend="Gaya utama"
            description="Satu gaya sahaja boleh dipilih supaya arahan visual tidak bercanggah."
            value={field.value}
            columns={3}
            onChange={field.onChange}
            choices={toChoices(STYLES)}
            error={errors.style?.stylePreset?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="style.mood"
        render={({ field }) => (
          <OptionGroup
            name="style-mood"
            legend="Mood"
            description="Nada keseluruhan yang dibawa poster."
            value={field.value}
            columns={3}
            onChange={field.onChange}
            choices={toChoices(MOODS)}
            error={errors.style?.mood?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="style.palettePreset"
        render={({ field }) => (
          <OptionGroup
            name="style-palette"
            legend="Palet warna"
            value={field.value}
            columns={3}
            onChange={field.onChange}
            choices={PALETTES.map((palette) => ({
              id: palette.id,
              label: palette.label.ms,
              swatch: <Swatch colors={palette.colors} />,
            }))}
            error={errors.style?.palettePreset?.message}
          />
        )}
      />

      <section className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-bold text-ink-900">Warna tersuai</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Sehingga empat warna HEX. Jika diisi, warna ini mengatasi preset palet di atas.
          </p>
        </div>

        <Controller
          control={control}
          name="style.customColors"
          render={({ field }) => (
            <ColorPicker
              colors={field.value ?? []}
              onChange={field.onChange}
              error={errors.style?.customColors?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="style.strictPalette"
          render={({ field }) => (
            <Toggle
              id="style-strict-palette"
              checked={field.value}
              onChange={field.onChange}
              label="Hadkan reka bentuk kepada palet ini sahaja"
              hint="Menambah larangan warna di luar palet ke dalam negative prompt."
            />
          )}
        />

        {customColors.length > 0 && (
          <p className="text-xs text-blue-700">
            {customColors.length} warna tersuai akan digunakan menggantikan preset palet.
          </p>
        )}
      </section>

      <Controller
        control={control}
        name="style.background"
        render={({ field }) => (
          <OptionGroup
            name="style-background"
            legend="Arahan latar"
            value={field.value}
            columns={3}
            onChange={field.onChange}
            choices={toChoices(BACKGROUNDS)}
            error={errors.style?.background?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="typography.titleTypeface"
        render={({ field }) => (
          <OptionGroup
            name="typography-title"
            legend="Karakter tajuk"
            value={field.value}
            columns={3}
            onChange={field.onChange}
            choices={toChoices(TYPEFACES)}
            error={errors.typography?.titleTypeface?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="typography.bodyTypeface"
        render={({ field }) => (
          <OptionGroup
            name="typography-body"
            legend="Karakter teks sokongan"
            value={field.value}
            columns={3}
            onChange={field.onChange}
            choices={toChoices(TYPEFACES)}
            error={errors.typography?.bodyTypeface?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="typography.textContrast"
        render={({ field }) => (
          <OptionGroup
            name="typography-contrast"
            legend="Kontras teks"
            value={field.value}
            columns={2}
            onChange={field.onChange}
            choices={toChoices(TEXT_CONTRASTS)}
            error={errors.typography?.textContrast?.message}
          />
        )}
      />
    </div>
  )
}
