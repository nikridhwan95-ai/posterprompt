import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { getPlatform } from '@/data/platforms'
import { getCategory } from '@/data/categories'
import { stepForField, STEP_LABELS, type PosterProject, type StepId } from '@/schemas/project'
import type { QualityWarning } from '@/lib/prompt/types'
import { useGenerator } from './context'
import { CopyBlock } from './CopyBlock'
import { DensityMeter } from './DensityMeter'

type TabId = 'prompt' | 'teks' | 'negative' | 'layout'

const TABS: { id: TabId; label: string }[] = [
  { id: 'prompt', label: 'Prompt Utama' },
  { id: 'teks', label: 'Teks Tepat' },
  { id: 'negative', label: 'Negative Prompt' },
  { id: 'layout', label: 'Nota Layout' },
]

const SEVERITY_STYLES: Record<QualityWarning['severity'], string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  amaran: 'border-[var(--color-warn-500)] bg-[var(--color-warn-50)] text-ink-900',
  ralat: 'border-[var(--color-danger-500)] bg-[var(--color-danger-50)] text-ink-900',
}

const SEVERITY_LABELS: Record<QualityWarning['severity'], string> = {
  info: 'Maklumat',
  amaran: 'Amaran',
  ralat: 'Ralat',
}

/** Panel hasil: empat tab output, amaran dan pautan sunting semula (§5.1). */
export function ResultPage() {
  const navigate = useNavigate()
  const { output, goToStep } = useGenerator()
  const { getValues } = useFormContext<PosterProject>()
  const [tab, setTab] = useState<TabId>('prompt')
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  if (!output) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">Belum ada hasil untuk dipaparkan</h1>
        <p className="text-sm leading-relaxed text-ink-600">
          Lengkapkan wizard dan tekan “Jana prompt” untuk melihat prompt utama, teks tepat,
          negative prompt dan nota susun atur.
        </p>
        <Button type="button" onClick={() => navigate('/generator')}>
          Kembali ke wizard
        </Button>
      </div>
    )
  }

  const platform = getPlatform(output.platformId)
  const failedChecks = output.audit.filter((check) => !check.passed)

  const editStep = (step: StepId) => {
    goToStep(step)
    navigate('/generator')
  }

  /** Navigasi anak panah antara tab mengikut corak tablist WAI-ARIA. */
  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = TABS.length - 1
    let next: number | null = null
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = last
    if (next === null) return
    event.preventDefault()
    const target = TABS[next]
    setTab(target.id)
    tabRefs.current[target.id]?.focus()
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-magenta-600 uppercase">
              Hasil penjanaan
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-bold tracking-tight text-ink-900"
            >
              Prompt untuk {platform.label.ms}
            </h1>
            <p className="mt-1 text-sm text-ink-600">
              Teks rasmi anda dikekalkan sepenuhnya. Semak blok Teks Tepat sebelum menyalin.
            </p>
          </div>
          <div className="pp-no-print flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/generator')}>
              Sunting semula
            </Button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="pp-no-print flex flex-wrap gap-1 border-b border-ink-200" role="tablist" aria-label="Blok output">
              {TABS.map((item, index) => (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[item.id] = node
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={tab === item.id}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={tab === item.id ? 0 : -1}
                  onClick={() => setTab(item.id)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === item.id
                      ? 'border-magenta-500 text-magenta-700'
                      : 'border-transparent text-ink-600 hover:border-blue-400 hover:text-blue-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id={`panel-${tab}`}
              aria-labelledby={`tab-${tab}`}
              tabIndex={0}
              className="rounded-xl"
            >
              {tab === 'prompt' && (
                <CopyBlock
                  id="output-prompt"
                  title="Prompt Utama"
                  description={`Disesuaikan untuk ${platform.label.ms} · adapter v${output.adapterVersion} · templat v${output.templateVersion}`}
                  text={output.mainPrompt}
                />
              )}
              {tab === 'teks' && (
                <CopyBlock
                  id="output-exact"
                  title="Teks Tepat"
                  description="Salinan teks poster anda tanpa sebarang perubahan. Gunakan blok ini untuk menyemak ejaan, tarikh dan nama."
                  text={output.exactCopyText}
                  emptyMessage="Tiada teks poster dimasukkan lagi."
                />
              )}
              {tab === 'negative' && (
                <CopyBlock
                  id="output-negative"
                  title="Negative Prompt"
                  description="Senarai larangan visual. Tampal ke medan negative prompt jika platform anda menyediakannya."
                  text={output.negativePrompt}
                />
              )}
              {tab === 'layout' && (
                <CopyBlock
                  id="output-layout"
                  title="Nota Layout"
                  description="Panduan kedudukan tajuk, subjek, logo, QR dan footer untuk anda atau pereka anda."
                  text={output.layoutNotesText}
                />
              )}
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-5">
            <div className="pp-card p-4">
              <DensityMeter density={output.density} />
            </div>

            <section aria-labelledby="warnings-title" className="pp-card p-4">
              <h2 id="warnings-title" className="text-sm font-bold text-ink-900">
                Amaran kualiti
              </h2>
              {output.warnings.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--color-ok-500)]">
                  Tiada amaran. Semua semakan kualiti lulus.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {output.warnings.map((warning) => (
                    <li
                      key={warning.id}
                      className={`rounded-lg border p-3 text-xs leading-relaxed ${SEVERITY_STYLES[warning.severity]}`}
                    >
                      <span className="mb-1 block text-[11px] font-bold tracking-wide uppercase">
                        {SEVERITY_LABELS[warning.severity]}
                      </span>
                      {warning.message}
                      {warning.field && (
                        <button
                          type="button"
                          onClick={() => editStep(stepForField(warning.field as string))}
                          className="pp-no-print mt-2 block font-semibold text-blue-700 underline underline-offset-2 hover:no-underline"
                        >
                          Sunting langkah {STEP_LABELS[stepForField(warning.field)].title}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="audit-title" className="pp-card p-4">
              <h2 id="audit-title" className="text-sm font-bold text-ink-900">
                Audit kualiti
              </h2>
              <p className="mt-1 text-xs text-ink-500">
                {failedChecks.length === 0
                  ? 'Ketujuh-tujuh semakan lulus.'
                  : `${failedChecks.length} semakan gagal.`}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {output.audit.map((check) => (
                  <li key={check.id} className="flex gap-2 text-xs leading-relaxed">
                    <span
                      aria-hidden="true"
                      className={
                        check.passed ? 'text-[var(--color-ok-500)]' : 'text-[var(--color-danger-500)]'
                      }
                    >
                      {check.passed ? '✓' : '✕'}
                    </span>
                    <span className="text-ink-600">
                      <span className="sr-only">{check.passed ? 'Lulus: ' : 'Gagal: '}</span>
                      <span className="font-mono text-[11px] text-ink-500">{check.id}</span>{' '}
                      {check.label}
                      {!check.passed && check.detail && (
                        <span className="mt-0.5 block text-[var(--color-danger-500)]">
                          {check.detail}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="meta-title" className="pp-card p-4">
              <h2 id="meta-title" className="text-sm font-bold text-ink-900">
                Versi output
              </h2>
              <dl className="mt-2 flex flex-col gap-1 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Skema</dt>
                  <dd className="font-mono text-ink-700">{output.schemaVersion}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Templat</dt>
                  <dd className="font-mono text-ink-700">{output.templateVersion}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Adapter</dt>
                  <dd className="font-mono text-ink-700">
                    {output.platformId} v{output.adapterVersion}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Kategori</dt>
                  <dd className="text-ink-700">{getCategory(getValues('category')).label.ms}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
