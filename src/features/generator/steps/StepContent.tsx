import { Controller, useFormContext } from 'react-hook-form'
import {
  CATEGORIES,
  getCategory,
  labelFor,
  requiredFieldsFor,
  visibleFieldsFor,
} from '@/data/categories'
import { subjectPositionForComposition } from '@/data/styles'
import type { ContentFieldName } from '@/data/types'
import { OptionGroup } from '@/components/OptionGroup'
import { TextAreaField, TextField } from '@/components/TextField'
import {
  HEADLINE_WARN_LENGTH,
  MAX_BLOCK_LENGTH,
  MAX_HEADLINE_LENGTH,
  type PosterProject,
} from '@/schemas/project'

/** Medan yang mungkin mengandungi beberapa baris teks. */
const MULTILINE: readonly ContentFieldName[] = [
  'subHeadline',
  'programName',
  'achievement',
  'callToAction',
  'footerNotes',
]

const LANGUAGE_CHOICES = [
  {
    id: 'ms',
    label: 'Bahasa Melayu',
    hint: 'Teks poster dalam Bahasa Melayu sepenuhnya.',
  },
  {
    id: 'en',
    label: 'Bahasa Inggeris',
    hint: 'Teks poster dalam Bahasa Inggeris sepenuhnya.',
  },
  {
    id: 'bilingual',
    label: 'Dwibahasa',
    hint: 'Campuran BM dan BI seperti yang anda taip.',
  },
]

/** Langkah 1: kategori, bahasa dan teks rasmi poster (FR-001 hingga FR-004). */
export function StepContent() {
  const { control, register, setValue, formState, watch } = useFormContext<PosterProject>()
  const categoryId = watch('category')
  const category = getCategory(categoryId)
  const visible = visibleFieldsFor(category)
  const required = new Set(requiredFieldsFor(category))
  const errors = formState.errors

  return (
    <div className="flex flex-col gap-8">
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <OptionGroup
            name="category"
            legend="Kategori poster"
            description="Kategori menentukan medan yang dipaparkan dan cadangan susun atur asas."
            value={field.value}
            columns={3}
            onChange={(value) => {
              field.onChange(value)
              // Cadangan default kategori (§6.1) digunakan sebagai titik mula
              // yang masih boleh diubah pengguna pada langkah susun atur.
              const next = getCategory(value)
              setValue('layout.composition', next.defaultComposition as never)
              setValue('subject.subjectType', next.defaultSubjectType as never)
              setValue('subject.subjectCount', next.defaultSubjectType === 'none' ? 0 : 1)
              // Selaraskan kedudukan subjek dengan komposisi supaya bahagian
              // COMPOSITION dan SUBJECT tidak memberi arahan bercanggah.
              const side = subjectPositionForComposition(next.defaultComposition)
              if (side) setValue('subject.subjectPosition', side as never)
            }}
            choices={CATEGORIES.map((item) => ({
              id: item.id,
              label: item.label.ms,
              hint: item.hint.ms,
            }))}
            error={errors.category?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="language"
        render={({ field }) => (
          <OptionGroup
            name="language"
            legend="Bahasa teks poster"
            description="Teks yang anda taip tidak akan diterjemah. Pilihan ini memaklumkan model supaya ejaan dikekalkan."
            value={field.value}
            columns={3}
            onChange={field.onChange}
            choices={LANGUAGE_CHOICES}
            error={errors.language?.message}
          />
        )}
      />

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-bold text-ink-900">Teks rasmi poster</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Semua teks di bawah disalin ke dalam blok teks tepat tanpa sebarang pembetulan ejaan
            atau parafrasa. Semak ejaan, tarikh dan nama sebelum menjana.
          </p>
        </div>

        {visible.map((fieldName) => {
          const label = labelFor(category, fieldName).ms
          const isHeadline = fieldName === 'mainHeadline'
          const value = watch(`content.${fieldName}`) ?? ''
          const limit = isHeadline ? MAX_HEADLINE_LENGTH : MAX_BLOCK_LENGTH
          // Amaran kaunter: ambang lembut tajuk (§10.1) atau 80% daripada had
          // medan — pada tahap ini kaunter kekal kelihatan walaupun tanpa fokus.
          const warn =
            (isHeadline && value.length > HEADLINE_WARN_LENGTH) || value.length >= limit * 0.8
          const error = errors.content?.[fieldName]?.message
          const placeholder = category.fieldPlaceholders?.[fieldName]
          const shared = {
            id: `content-${fieldName}`,
            label,
            required: required.has(fieldName),
            error,
            counter: `${value.length} / ${limit}`,
            counterWarning: warn,
            placeholder,
            maxLength: limit,
          }

          return MULTILINE.includes(fieldName) ? (
            <TextAreaField
              key={fieldName}
              {...shared}
              rows={2}
              {...register(`content.${fieldName}`)}
            />
          ) : (
            <TextField
              key={fieldName}
              {...shared}
              hint={
                isHeadline
                  ? `Tajuk melebihi ${HEADLINE_WARN_LENGTH} aksara biasanya mengecilkan saiz font pada poster.`
                  : undefined
              }
              {...register(`content.${fieldName}`)}
            />
          )
        })}
      </section>
    </div>
  )
}
