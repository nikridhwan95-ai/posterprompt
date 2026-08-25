import { Controller, useFormContext } from 'react-hook-form'
import {
  CANVAS_PRESETS,
  MAX_DIMENSION,
  MIN_DIMENSION,
  ORIENTATION_LABELS,
  getCanvasPreset,
  orientationOf,
  simplifyRatio,
} from '@/data/canvas'
import { OptionGroup } from '@/components/OptionGroup'
import { TextField } from '@/components/TextField'
import { RatioThumb } from '../swatches'
import type { PosterProject } from '@/schemas/project'

/** Langkah 2: saiz kanvas, orientasi dan destinasi penerbitan (FR-005). */
export function StepCanvas() {
  const { control, register, setValue, watch, formState } = useFormContext<PosterProject>()
  const preset = watch('canvas.preset')
  const width = watch('canvas.width')
  const height = watch('canvas.height')
  const errors = formState.errors.canvas

  const isCustom = preset === 'custom'
  const validDimensions =
    Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
  const ratio = validDimensions
    ? isCustom
      ? simplifyRatio(width, height)
      : getCanvasPreset(preset).ratio
    : '—'
  const orientation = validDimensions ? ORIENTATION_LABELS[orientationOf(width, height)].ms : '—'

  return (
    <div className="flex flex-col gap-8">
      <Controller
        control={control}
        name="canvas.preset"
        render={({ field }) => (
          <OptionGroup
            name="canvas-preset"
            legend="Saiz kanvas"
            description="Pilih preset penerbitan atau tetapkan dimensi tersuai anda sendiri."
            value={field.value}
            columns={2}
            onChange={(value) => {
              field.onChange(value)
              if (value !== 'custom') {
                const next = getCanvasPreset(value)
                setValue('canvas.width', next.width, { shouldValidate: true })
                setValue('canvas.height', next.height, { shouldValidate: true })
              }
            }}
            choices={CANVAS_PRESETS.map((item) => ({
              id: item.id,
              label: item.label.ms,
              hint:
                item.id === 'custom'
                  ? `Antara ${MIN_DIMENSION} dan ${MAX_DIMENSION} px setiap sisi`
                  : `${item.width} × ${item.height} px · ${item.ratio}`,
              swatch: (
                <RatioThumb
                  width={item.width}
                  height={item.height}
                  custom={item.id === 'custom'}
                />
              ),
            }))}
            error={errors?.preset?.message}
          />
        )}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-ink-900">Dimensi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="canvas-width"
            label="Lebar (px)"
            required
            type="number"
            inputMode="numeric"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            step={1}
            readOnly={!isCustom}
            error={errors?.width?.message}
            {...register('canvas.width', { valueAsNumber: true })}
          />
          <TextField
            id="canvas-height"
            label="Tinggi (px)"
            required
            type="number"
            inputMode="numeric"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            step={1}
            readOnly={!isCustom}
            error={errors?.height?.message}
            {...register('canvas.height', { valueAsNumber: true })}
          />
        </div>

        {!isCustom && (
          <p className="text-xs text-ink-500">
            Dimensi dikunci oleh preset. Pilih “Tersuai” untuk menetapkan saiz sendiri.
          </p>
        )}

        <dl className="flex flex-wrap gap-x-8 gap-y-2 rounded-xl border border-ink-200 bg-white p-4 text-sm">
          <div className="flex gap-2">
            <dt className="text-ink-500">Nisbah</dt>
            <dd className="font-semibold text-ink-900">{ratio}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-500">Orientasi</dt>
            <dd className="font-semibold text-ink-900">{orientation}</dd>
          </div>
        </dl>
      </section>

      <TextField
        id="canvas-destination"
        label="Destinasi penerbitan"
        hint="Contoh: Instagram, papan tanda digital, cetakan A4. Dinyatakan dalam prompt supaya model memahami konteks paparan."
        maxLength={120}
        placeholder={getCanvasPreset(preset).destination.ms}
        error={errors?.destination?.message}
        {...register('canvas.destination')}
      />
    </div>
  )
}
