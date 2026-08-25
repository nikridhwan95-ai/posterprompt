import { STEP_IDS, STEP_LABELS, type StepId } from '@/schemas/project'

interface WizardStepperProps {
  current: StepId
  furthest: StepId
  onSelect: (step: StepId) => void
}

/** Stepper lima langkah dengan kemajuan yang boleh dinavigasi (§5.3). */
export function WizardStepper({ current, furthest, onSelect }: WizardStepperProps) {
  const currentIndex = STEP_IDS.indexOf(current)
  const furthestIndex = STEP_IDS.indexOf(furthest)

  return (
    <nav aria-label="Kemajuan wizard" className="pp-no-print">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {STEP_IDS.map((stepId, index) => {
          const label = STEP_LABELS[stepId]
          const isCurrent = stepId === current
          const isDone = index < currentIndex
          const reachable = index <= furthestIndex

          return (
            <li key={stepId} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => reachable && onSelect(stepId)}
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                // Nama boleh akses ditetapkan secara eksplisit; teks tersembunyi
                // yang digabungkan menghasilkan sebutan "Langkah 1:Kandungan"
                // tanpa jeda pada pembaca skrin.
                aria-label={`Langkah ${index + 1}: ${label.title}`}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  isCurrent
                    ? 'bg-magenta-50 text-magenta-800'
                    : reachable
                      ? 'text-ink-600 hover:bg-magenta-50 hover:text-magenta-700'
                      : 'cursor-not-allowed text-ink-500'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'bg-magenta-500 text-white'
                      : isDone
                        ? 'bg-magenta-700 text-white'
                        : 'bg-ink-200 text-ink-600'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </span>
                <span aria-hidden="true" className="text-sm font-semibold whitespace-nowrap">
                  {label.title}
                </span>
              </button>
              {index < STEP_IDS.length - 1 && (
                <span aria-hidden="true" className="hidden h-px w-4 bg-ink-300 sm:block" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
