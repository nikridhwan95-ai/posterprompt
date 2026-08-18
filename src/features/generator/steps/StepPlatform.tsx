import { Controller, useFormContext } from 'react-hook-form'
import { OUTPUT_MODES, PLATFORMS, getPlatform } from '@/data/platforms'
import { OptionGroup } from '@/components/OptionGroup'
import { Toggle } from '@/components/OptionCard'
import { TextAreaField } from '@/components/TextField'
import { MAX_CUSTOM_INSTRUCTIONS, type PosterProject } from '@/schemas/project'
import { useGenerator } from '../context'

const PROMPT_LANGUAGE_CHOICES = [
  {
    id: 'en',
    label: 'Bahasa Inggeris',
    hint: 'Arahan reka bentuk dalam BI. Kebanyakan model imej lebih tepat dengan BI.',
  },
  {
    id: 'ms',
    label: 'Bahasa Melayu',
    hint: 'Arahan reka bentuk dalam BM. Teks tepat anda kekal asal dalam kedua-dua pilihan.',
  },
]

/** Langkah 5: adapter platform, bahasa prompt dan arahan tambahan (FR-012). */
export function StepPlatform() {
  const { control, register, watch, formState } = useFormContext<PosterProject>()
  const { consent, setConsent } = useGenerator()
  const errors = formState.errors.platform
  const targetPlatform = watch('platform.targetPlatform')
  const customInstructions = watch('platform.customInstructions') ?? ''
  const platform = getPlatform(targetPlatform)

  return (
    <div className="flex flex-col gap-8">
      <Controller
        control={control}
        name="platform.targetPlatform"
        render={({ field }) => (
          <OptionGroup
            name="platform-target"
            legend="Platform sasaran"
            description="Struktur dan nota prompt berubah mengikut platform yang anda pilih."
            value={field.value}
            columns={2}
            onChange={field.onChange}
            choices={PLATFORMS.map((item) => ({
              id: item.id,
              label: item.label.ms,
              hint: item.hint.ms,
            }))}
            error={errors?.targetPlatform?.message}
          />
        )}
      />

      <aside className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <span aria-hidden="true" className="mt-0.5 text-blue-700">
          ℹ
        </span>
        <p className="text-sm leading-relaxed text-blue-900">
          <strong className="font-semibold">{platform.label.ms}:</strong> {platform.uiNote.ms}
        </p>
      </aside>

      <Controller
        control={control}
        name="platform.promptLanguage"
        render={({ field }) => (
          <OptionGroup
            name="platform-language"
            legend="Bahasa arahan visual"
            value={field.value}
            columns={2}
            onChange={field.onChange}
            choices={PROMPT_LANGUAGE_CHOICES}
            error={errors?.promptLanguage?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="platform.outputMode"
        render={({ field }) => (
          <OptionGroup
            name="platform-output-mode"
            legend="Mod output"
            value={field.value}
            columns={2}
            onChange={field.onChange}
            choices={OUTPUT_MODES.map((mode) => ({
              id: mode.id,
              label: mode.label.ms,
              hint: mode.hint.ms,
            }))}
            error={errors?.outputMode?.message}
          />
        )}
      />

      <TextAreaField
        id="platform-custom-instructions"
        label="Arahan tambahan"
        hint="Arahan bebas yang ditambah ke bahagian CONSTRAINTS. Dipaparkan sebagai teks biasa, bukan kod."
        rows={4}
        maxLength={MAX_CUSTOM_INSTRUCTIONS}
        counter={`${customInstructions.length} / ${MAX_CUSTOM_INSTRUCTIONS}`}
        error={errors?.customInstructions?.message}
        placeholder="Contoh: Kekalkan ruang kosong di bahagian kiri untuk tampalan logo penaja."
        {...register('platform.customInstructions')}
      />

      {/*
        §11.2 (risiko "Logo atau wajah tanpa kebenaran"): peringatan penggunaan
        aset yang sah mesti dipaparkan sebelum hasil, bukan diselitkan pada
        halaman privasi sahaja.
      */}
      <aside className="flex gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
        <span aria-hidden="true" className="mt-0.5 text-yellow-700">
          ⚠
        </span>
        <div className="text-sm leading-relaxed text-yellow-900">
          <p className="font-semibold">Peringatan penggunaan aset</p>
          <p className="mt-1">
            Pastikan anda mempunyai kebenaran untuk menggunakan nama, gambar wajah dan logo yang
            dimasukkan ke dalam poster ini. PosterPrompt tidak menyemak hak penggunaan aset dan
            tidak menjana logo atau wajah sebenar.
          </p>
        </div>
      </aside>

      <section className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4">
        <h2 className="text-sm font-bold text-ink-900">Simpanan draf</h2>
        <Toggle
          id="preferences-save-draft"
          checked={consent}
          onChange={setConsent}
          label="Simpan draf dalam pelayar ini"
          hint="Draf disimpan dalam localStorage peranti ini sahaja dan tidak dihantar ke mana-mana pelayan. Anda boleh mematikannya bila-bila masa."
        />
      </section>
    </div>
  )
}
