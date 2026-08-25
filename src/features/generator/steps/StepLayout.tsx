import { Controller, useFormContext, useWatch } from 'react-hook-form'
import {
  ASSET_ZONES,
  COMPOSITIONS,
  CROPS,
  FEATHERINGS,
  LOGO_ZONES,
  MAX_ASSET_ZONES,
  QR_ZONES,
  SUBJECT_POSITIONS,
  SUBJECT_TYPES,
  TEXT_ALIGNMENTS,
  subjectPositionForComposition,
} from '@/data/styles'
import { CheckGroup, OptionGroup } from '@/components/OptionGroup'
import { toChoices } from '@/components/choices'
import { Toggle } from '@/components/OptionCard'
import { TextField } from '@/components/TextField'
import { ZonePreview } from '../ZonePreview'
import { AlignGlyph, CompositionGlyph } from '../swatches'
import { MAX_SUBJECT_COUNT, countZones, type PosterProject } from '@/schemas/project'

/** Langkah 4: komposisi, subjek dan zon aset (FR-009 hingga FR-011). */
export function StepLayout() {
  const { control, register, setValue, watch, formState } = useFormContext<PosterProject>()
  const errors = formState.errors
  const subjectType = watch('subject.subjectType')
  const layout = watch('layout')
  const hasSubject = subjectType !== 'none'
  const zoneCount = countZones(layout)
  // Pratonton zon melanggan keseluruhan projek supaya setiap klik komposisi,
  // subjek atau zon terus kelihatan kesannya di tempat keputusan dibuat.
  const project = useWatch({ control }) as PosterProject

  return (
    <div className="flex flex-col gap-8">
      {/*
        Pilihan komposisi dan pratonton zon dipasangkan sebelah-menyebelah:
        rangka zon ialah maklum balas terpantas terhadap setiap keputusan
        susun atur, jadi ia diletakkan di tempat keputusan itu dibuat (FR-023).
      */}
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="flex flex-col gap-8">
          <Controller
            control={control}
            name="layout.composition"
            render={({ field }) => (
              <OptionGroup
                name="layout-composition"
                legend="Komposisi"
                value={field.value}
                columns={2}
                onChange={(value) => {
                  field.onChange(value)
                  // Komposisi yang menetapkan sisi subjek turut memindahkan
                  // kedudukan subjek supaya prompt kekal konsisten.
                  const side = subjectPositionForComposition(value)
                  if (side) setValue('subject.subjectPosition', side as never)
                }}
                choices={toChoices(
                  COMPOSITIONS,
                  undefined,
                  (composition) => <CompositionGlyph id={composition.id} />,
                )}
                error={errors.layout?.composition?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="layout.textAlignment"
            render={({ field }) => (
              <OptionGroup
                name="layout-alignment"
                legend="Penjajaran teks"
                value={field.value}
                columns={3}
                onChange={field.onChange}
                choices={toChoices(
                  TEXT_ALIGNMENTS,
                  undefined,
                  (alignment) => <AlignGlyph id={alignment.id} />,
                )}
                error={errors.layout?.textAlignment?.message}
              />
            )}
          />
        </div>

        <aside className="pp-card flex flex-col items-center gap-2 p-4 md:sticky md:top-20">
          <h2 className="self-start text-xs font-bold text-ink-900">Pratonton zon</h2>
          <ZonePreview project={project} size={200} />
        </aside>
      </div>

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-bold text-ink-900">Subjek visual</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            PosterPrompt tidak memuat naik gambar. Pilihan di sini menjadi arahan kepada model
            atau pereka mengenai ruang dan pengendalian subjek.
          </p>
        </div>

        <Controller
          control={control}
          name="subject.subjectType"
          render={({ field }) => (
            <OptionGroup
              name="subject-type"
              legend="Jenis subjek"
              value={field.value}
              columns={3}
              onChange={field.onChange}
              choices={toChoices(SUBJECT_TYPES)}
              error={errors.subject?.subjectType?.message}
            />
          )}
        />

        {hasSubject && (
          <>
            <TextField
              id="subject-count"
              label="Bilangan subjek"
              required
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_SUBJECT_COUNT}
              step={1}
              error={errors.subject?.subjectCount?.message}
              {...register('subject.subjectCount', { valueAsNumber: true })}
            />

            <Controller
              control={control}
              name="subject.subjectPosition"
              render={({ field }) => (
                <OptionGroup
                  name="subject-position"
                  legend="Kedudukan subjek"
                  value={field.value}
                  columns={3}
                  onChange={field.onChange}
                  choices={toChoices(SUBJECT_POSITIONS)}
                  error={errors.subject?.subjectPosition?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="subject.crop"
              render={({ field }) => (
                <OptionGroup
                  name="subject-crop"
                  legend="Crop subjek"
                  value={field.value}
                  columns={3}
                  onChange={field.onChange}
                  choices={toChoices(CROPS)}
                  error={errors.subject?.crop?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="subject.feathering"
              render={({ field }) => (
                <OptionGroup
                  name="subject-feathering"
                  legend="Feathering tepi bawah"
                  value={field.value}
                  columns={3}
                  onChange={field.onChange}
                  choices={toChoices(FEATHERINGS)}
                  error={errors.subject?.feathering?.message}
                />
              )}
            />

            <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4">
              <Controller
                control={control}
                name="subject.preserveFace"
                render={({ field }) => (
                  <Toggle
                    id="subject-preserve-face"
                    checked={field.value}
                    onChange={field.onChange}
                    label="Kekalkan ciri wajah"
                    hint="Arahan supaya model tidak mengubah wajah dalam gambar rujukan."
                  />
                )}
              />
              <Controller
                control={control}
                name="subject.preserveClothing"
                render={({ field }) => (
                  <Toggle
                    id="subject-preserve-clothing"
                    checked={field.value}
                    onChange={field.onChange}
                    label="Kekalkan pakaian"
                    hint="Berguna untuk pakaian rasmi, jubah akademik atau uniform."
                  />
                )}
              />
            </div>
          </>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-ink-900">Zon aset</h2>
          <span
            className={`text-xs font-semibold tabular-nums ${
              zoneCount > MAX_ASSET_ZONES ? 'text-[var(--color-danger-500)]' : 'text-ink-500'
            }`}
          >
            {zoneCount} / {MAX_ASSET_ZONES} zon digunakan
          </span>
        </div>

        <Controller
          control={control}
          name="layout.logoZone"
          render={({ field }) => (
            <OptionGroup
              name="layout-logo"
              legend="Ruang logo"
              value={field.value}
              columns={3}
              onChange={field.onChange}
              choices={toChoices(LOGO_ZONES)}
              error={errors.layout?.logoZone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="layout.qrZone"
          render={({ field }) => (
            <OptionGroup
              name="layout-qr"
              legend="Ruang kod QR"
              value={field.value}
              columns={2}
              onChange={field.onChange}
              choices={toChoices(QR_ZONES)}
              error={errors.layout?.qrZone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="layout.assetZones"
          render={({ field }) => (
            <CheckGroup
              name="layout-asset-zones"
              legend="Zon tambahan"
              description="Ruang yang dikhaskan supaya elemen sebenar boleh ditambah kemudian."
              values={field.value ?? []}
              onChange={field.onChange}
              choices={toChoices(ASSET_ZONES)}
              columns={2}
              error={errors.layout?.assetZones?.message}
            />
          )}
        />
      </section>
    </div>
  )
}
