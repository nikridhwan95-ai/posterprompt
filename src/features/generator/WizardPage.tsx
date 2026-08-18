import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { STEP_FIELDS, STEP_IDS, STEP_LABELS, type PosterProject, type StepId } from '@/schemas/project'
import { draftAsDownloadableText } from '@/lib/storage/draft'
import { useGenerator } from './context'
import { DraftBanner } from './DraftBanner'
import { ErrorSummary, type ErrorItem } from './ErrorSummary'
import { ProjectSummary } from './ProjectSummary'
import { SaveIndicator } from './SaveIndicator'
import { WizardStepper } from './WizardStepper'
import { StepCanvas } from './steps/StepCanvas'
import { StepContent } from './steps/StepContent'
import { StepLayout } from './steps/StepLayout'
import { StepPlatform } from './steps/StepPlatform'
import { StepStyle } from './steps/StepStyle'

/** Semua laluan medan merentas kelima-lima langkah, mengikut turutan wizard. */
const ALL_FIELD_PATHS: readonly string[] = STEP_IDS.flatMap((id) => STEP_FIELDS[id])

const STEP_COMPONENTS: Record<StepId, () => React.JSX.Element> = {
  kandungan: StepContent,
  kanvas: StepCanvas,
  gaya: StepStyle,
  susun_atur: StepLayout,
  platform: StepPlatform,
}

/** Halaman wizard lima langkah (§5.3). */
export function WizardPage() {
  const navigate = useNavigate()
  const methods = useFormContext<PosterProject>()
  const {
    step,
    goToStep,
    furthestStep,
    generate,
    isGenerating,
    resetProject,
    draftNotice,
    dismissDraftNotice,
    discardDraft,
  } = useGenerator()

  const [stepErrors, setStepErrors] = useState<ErrorItem[]>([])
  const [confirmReset, setConfirmReset] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const index = STEP_IDS.indexOf(step)
  const isLast = index === STEP_IDS.length - 1
  const StepComponent = STEP_COMPONENTS[step]
  const label = STEP_LABELS[step]

  useEffect(() => {
    // Fokus dipindahkan ke tajuk langkah supaya pengguna papan kekunci dan
    // pembaca skrin tahu kandungan telah bertukar (NFR-004).
    headingRef.current?.focus()
    setStepErrors([])
  }, [step])

  /** Alihkan fokus ke medan gagal pertama selepas Seterusnya atau Jana (§10.2). */
  const focusField = useCallback((path: string) => {
    const escaped = path.replace(/\./g, '\\.')
    const control = document.querySelector<HTMLElement>(
      `[name="${path}"], #${path.replace(/\./g, '-')}, [data-field="${escaped}"] :is(input,textarea,select)`,
    )
    if (control) {
      control.focus()
      control.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    const group = document.querySelector<HTMLElement>(`[name="${path.split('.').join('-')}"]`)
    group?.focus()
  }, [])

  /**
   * Kumpul ralat semasa terus daripada control.
   *
   * `formState.errors` yang dibaca di dalam callback ialah petikan render
   * terdahulu, jadi ia masih kosong sebaik sahaja `trigger()` selesai.
   * `getFieldState` membaca keadaan langsung, jadi ringkasan ralat sentiasa
   * memaparkan senarai yang betul (§10.2).
   */
  const collectErrors = useCallback(
    (paths: readonly string[]): ErrorItem[] => {
      const items: ErrorItem[] = []
      for (const path of paths) {
        const state = methods.getFieldState(path as FieldPath<PosterProject>)
        const message = state.error?.message
        if (typeof message === 'string' && message.length > 0) {
          items.push({ path, message })
        }
      }
      return items
    },
    [methods],
  )

  const validateStep = useCallback(async () => {
    const fields = STEP_FIELDS[step] as never[]
    const valid = await methods.trigger(fields)
    if (valid) {
      setStepErrors([])
      return true
    }
    const relevant = collectErrors(STEP_FIELDS[step])
    const list = relevant.length > 0 ? relevant : collectErrors(ALL_FIELD_PATHS)
    setStepErrors(list)
    if (list.length > 0) focusField(list[0].path)
    return false
  }, [collectErrors, focusField, methods, step])

  const handleNext = useCallback(async () => {
    if (!(await validateStep())) return
    goToStep(STEP_IDS[Math.min(index + 1, STEP_IDS.length - 1)])
  }, [goToStep, index, validateStep])

  const handleBack = useCallback(() => {
    goToStep(STEP_IDS[Math.max(index - 1, 0)])
  }, [goToStep, index])

  const handleGenerate = useCallback(async () => {
    const ok = await generate()
    if (ok) {
      setStepErrors([])
      navigate('/hasil')
      return
    }
    const all = collectErrors(ALL_FIELD_PATHS)
    setStepErrors(all)
    if (all.length > 0) {
      // Bawa pengguna terus ke langkah yang mengandungi ralat pertama.
      const first = all[0]
      const owner = STEP_IDS.find((candidate) => STEP_FIELDS[candidate].includes(first.path))
      if (owner && owner !== step) goToStep(owner)
      focusField(first.path)
    }
  }, [collectErrors, focusField, generate, goToStep, navigate, step])

  const downloadDraft = useCallback(() => {
    if (!draftNotice?.raw) return
    const blob = new Blob([draftAsDownloadableText(draftNotice.raw)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'posterprompt-draf.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [draftNotice])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:pb-10">
      <div className="flex flex-col gap-6">
        <WizardStepper current={step} furthest={furthestStep} onSelect={goToStep} />

        {draftNotice && (
          <DraftBanner
            notice={draftNotice}
            onDismiss={dismissDraftNotice}
            onDiscard={() => {
              discardDraft()
              dismissDraftNotice()
            }}
            onDownload={draftNotice.raw ? downloadDraft : undefined}
          />
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="flex min-w-0 flex-col gap-6">
            <header className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-wide text-magenta-600 uppercase">
                Langkah {index + 1} daripada {STEP_IDS.length}
              </p>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-bold tracking-tight text-ink-900"
              >
                {label.title}
              </h1>
              <p className="text-sm text-ink-600">{label.description}</p>
              {/* Penunjuk auto-save bagi keadaan "Sedang mengisi" (§5.6). */}
              <SaveIndicator />
            </header>

            <ErrorSummary errors={stepErrors} onSelect={focusField} />

            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                if (isLast) void handleGenerate()
                else void handleNext()
              }}
            >
              <StepComponent />

              {/*
                Baris ini kelihatan pada semua lebar. Butang set semula pernah
                tersembunyi di bawah 1024 px, menjadikan fungsi itu mustahil
                dicapai pada telefon dan tablet (NFR-003, UC-05). Butang
                navigasi kekal desktop sahaja kerana telefon menggunakan bar
                CTA melekat di bawah.
              */}
              <div className="pp-no-print mt-8 flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmReset(true)}
                >
                  Set semula projek
                </Button>
                <div className="hidden flex-wrap gap-2 lg:flex">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                    disabled={index === 0}
                  >
                    Kembali
                  </Button>
                  {isLast ? (
                    <Button type="submit" disabled={isGenerating}>
                      {isGenerating ? 'Menjana…' : 'Jana prompt'}
                    </Button>
                  ) : (
                    <Button type="submit">Seterusnya</Button>
                  )}
                </div>
              </div>
            </form>
          </main>

          <aside className="min-w-0">
            {/* Desktop: ringkasan melekat. Tablet dan telefon: boleh dilipat (§5.4). */}
            <div className="hidden lg:sticky lg:top-20 lg:block">
              <div className="pp-card p-4">
                <ProjectSummary />
              </div>
            </div>
            <details className="pp-card group p-4 lg:hidden" open={summaryOpen}>
              <summary
                onClick={(event) => {
                  event.preventDefault()
                  setSummaryOpen((open) => !open)
                }}
                className="cursor-pointer list-none text-sm font-bold text-ink-900"
              >
                {summaryOpen ? '▾' : '▸'} Ringkasan projek
              </summary>
              {summaryOpen && (
                <div className="mt-4">
                  <ProjectSummary />
                </div>
              )}
            </details>
          </aside>
        </div>
      </div>

      {/* CTA melekat di bawah pada telefon dan tablet (§5.4). */}
      <div className="pp-no-print fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={index === 0}
            className="flex-1"
          >
            Kembali
          </Button>
          {isLast ? (
            <Button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? 'Menjana…' : 'Jana prompt'}
            </Button>
          ) : (
            <Button type="button" onClick={() => void handleNext()} className="flex-1">
              Seterusnya
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Set semula keseluruhan projek?"
        description="Semua medan akan dikembalikan kepada keadaan awal dan draf tersimpan dalam pelayar ini akan dipadam. Tindakan ini tidak boleh dibatalkan."
        confirmLabel="Ya, set semula"
        onConfirm={() => {
          setConfirmReset(false)
          resetProject()
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
