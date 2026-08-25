import { useFormContext, useWatch } from 'react-hook-form'
import { getCategory, labelFor } from '@/data/categories'
import type { PosterProject } from '@/schemas/project'
import { useGenerator } from './context'
import { unresolvedSamples } from './randomize'

/**
 * Amaran bahawa sebahagian teks poster masih teks contoh (§11.2).
 *
 * "Kejutkan saya" mengisi tarikh, nama dan tempat rekaan supaya pengguna boleh
 * melihat hasil dengan pantas. Ia berguna untuk mencuba, tetapi teks itu tidak
 * boleh masuk ke poster sebenar tanpa disemak — jadi amaran ini mengikut
 * pengguna sehingga ke halaman hasil dan hilang sendiri sebaik medan disunting.
 *
 * Langganan borang dibuat di sini dan bukan dalam GeneratorLayout supaya
 * menaip hanya me-render semula amaran ini, bukan keseluruhan wizard
 * (NFR-001, NFR-002).
 */
export function SampleNotice() {
  const { sampleValues } = useGenerator()
  const { control } = useFormContext<PosterProject>()
  const content = useWatch({ control, name: 'content' })
  const category = useWatch({ control, name: 'category' })

  const pending = unresolvedSamples(
    { content } as PosterProject,
    sampleValues,
  )
  if (pending.length === 0) return null

  const names = pending.map((field) => labelFor(getCategory(category), field).ms)

  return (
    <div
      role="status"
      className="flex flex-col gap-1 rounded-xl border border-[var(--color-warn-500)] bg-[var(--color-warn-50)] p-4"
    >
      <p className="text-sm font-bold text-[var(--color-warn-500)]">
        {names.length === 1
          ? 'Satu medan masih menggunakan teks contoh'
          : `${names.length} medan masih menggunakan teks contoh`}
      </p>
      <p className="text-xs leading-relaxed text-ink-700">
        {names.join(', ')} diisi oleh &ldquo;Kejutkan saya&rdquo;. Tarikh, nama dan tempat itu
        rekaan semata-mata. Gantikan dengan maklumat sebenar sebelum menyiarkan poster.
      </p>
    </div>
  )
}
