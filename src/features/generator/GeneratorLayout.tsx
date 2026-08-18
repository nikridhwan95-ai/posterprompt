import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Outlet, useNavigate } from 'react-router-dom'
import { defaultProject, posterProjectSchema, STEP_IDS } from '@/schemas/project'
import type { PosterProject, StepId } from '@/schemas/project'
import { generatePrompt, ValidationError } from '@/lib/prompt/compose'
import type { GeneratedOutput } from '@/lib/prompt/types'
import {
  clearDraft,
  createDebouncedSaver,
  loadDraft,
  readConsent,
  readUiState,
  writeConsent,
  writeUiState,
} from '@/lib/storage/draft'
import { useToast } from '@/components/toast-context'
import {
  GeneratorContext,
  type DraftNotice,
  type GeneratorApi,
  type SaveState,
} from './context'

/**
 * Pemegang keadaan generator.
 *
 * Komponen ini ialah layout route yang memayungi /generator dan /hasil, jadi
 * ia tidak dilupuskan ketika pengguna berulang-alik antara borang dan hasil.
 * Itulah yang memenuhi FR-019: kembali menyunting tidak menghilangkan input.
 */
export function GeneratorLayout() {
  const navigate = useNavigate()
  const toast = useToast()

  const [initial] = useState(() => {
    const result = loadDraft()
    if (result.status === 'ok' || result.status === 'migrated') {
      return { project: result.project, result }
    }
    return { project: defaultProject(), result }
  })

  const methods = useForm<PosterProject>({
    // Skema mempunyai medan ber-default, jadi jenis input Zod berbeza sedikit
    // daripada jenis output. Borang sentiasa dimulakan dengan objek lengkap.
    resolver: zodResolver(posterProjectSchema) as unknown as Resolver<PosterProject>,
    defaultValues: initial.project,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const [step, setStep] = useState<StepId>(() => readUiState().lastStep ?? 'kandungan')
  const [furthestIndex, setFurthestIndex] = useState(() =>
    Math.max(0, STEP_IDS.indexOf(readUiState().lastStep ?? 'kandungan')),
  )
  const [output, setOutput] = useState<GeneratedOutput | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [consent, setConsentState] = useState(() => readConsent())
  const [draftNotice, setDraftNotice] = useState<DraftNotice | null>(() => {
    const result = initial.result
    if (result.status === 'migrated') {
      return {
        kind: 'migrated',
        message: `Draf daripada skema versi ${result.from} telah dikemas kini kepada versi semasa. Semak semula kandungan sebelum menjana.`,
        from: result.from,
      }
    }
    if (result.status === 'incompatible') {
      return {
        kind: 'incompatible',
        message:
          'Draf tersimpan tidak serasi dengan versi aplikasi ini dan tidak dipulihkan. Muat turun salinan teksnya sebelum memadam supaya tiada kandungan hilang.',
        raw: result.raw,
        from: result.from,
      }
    }
    if (result.status === 'ok') {
      return {
        kind: 'restored',
        message: 'Draf terakhir anda dalam pelayar ini telah dipulihkan.',
      }
    }
    return null
  })

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const saverRef = useRef(createDebouncedSaver())
  const consentRef = useRef(consent)
  consentRef.current = consent

  /**
   * §8.4: tulis ke localStorage selepas debounce 500 ms, hanya jika consent.
   *
   * Langganan `watch(callback)` digunakan dan bukan `watch()` tanpa argumen,
   * kerana yang kedua akan me-render semula seluruh halaman pada setiap
   * ketukan kekunci. Ringkasan projek melanggan medannya sendiri melalui
   * useWatch, jadi kemas kini langsung kekal terhad kepada panel itu
   * (NFR-001, NFR-002).
   */
  useEffect(() => {
    const saver = saverRef.current
    const subscription = methods.watch((values) => {
      if (!consentRef.current) {
        saver.cancel()
        setSaveState('idle')
        return
      }
      setSaveState('saving')
      const stamp = new Date().toISOString()
      saver.save({ ...(values as PosterProject), updatedAt: stamp }, (written) => {
        // `written` palsu apabila localStorage menolak tulisan. Menandakan
        // "disimpan" ketika itu adalah pembohongan kepada pengguna (§11.1).
        if (!written) {
          setSaveState('ralat')
          return
        }
        setLastSavedAt(stamp)
        setSaveState('saved')
      })
    })
    return () => {
      subscription.unsubscribe()
      saver.cancel()
    }
  }, [methods])

  useEffect(() => {
    writeUiState({ lastStep: step })
  }, [step])

  const goToStep = useCallback((next: StepId) => {
    setStep(next)
    setFurthestIndex((current) => Math.max(current, STEP_IDS.indexOf(next)))
  }, [])

  const setConsent = useCallback(
    (value: boolean) => {
      setConsentState(value)
      writeConsent(value)
      methods.setValue('preferences.saveDraft', value, { shouldDirty: true })
      if (value) {
        toast.show('Draf akan disimpan dalam pelayar ini sahaja.', 'info')
      } else {
        saverRef.current.cancel()
        setSaveState('idle')
        setLastSavedAt(null)
        toast.show('Simpanan draf dimatikan dan draf tersimpan telah dipadam.', 'info')
      }
    },
    [methods, toast],
  )

  const generate = useCallback(async () => {
    setIsGenerating(true)
    try {
      const valid = await methods.trigger()
      if (!valid) {
        setOutput(null)
        return false
      }
      const project = methods.getValues()
      try {
        setOutput(generatePrompt(project))
        return true
      } catch (error) {
        if (error instanceof ValidationError) {
          for (const issue of error.issues) {
            methods.setError(issue.path as never, { type: 'manual', message: issue.message })
          }
        } else {
          toast.show(
            'Penjanaan gagal disiapkan. Input anda kekal utuh — cuba jana semula.',
            'error',
          )
        }
        setOutput(null)
        return false
      }
    } finally {
      setIsGenerating(false)
    }
  }, [methods, toast])

  const resetProject = useCallback(() => {
    methods.reset(defaultProject())
    setOutput(null)
    setStep('kandungan')
    setFurthestIndex(0)
    // `reset` memicu langganan watch, yang menjadualkan satu simpanan tertunda.
    // Ia mesti dibatalkan dahulu, jika tidak draf lalai ditulis semula 500 ms
    // selepas kunci dipadam dan "draf dipulihkan" muncul pada muat semula
    // berikutnya (§8.4, FR-021).
    saverRef.current.cancel()
    setSaveState('idle')
    setLastSavedAt(null)
    clearDraft()
    setDraftNotice(null)
    toast.show('Semua medan telah dikembalikan kepada keadaan awal.', 'info')
    navigate('/generator')
  }, [methods, navigate, toast])

  const discardDraft = useCallback(() => {
    clearDraft()
    setDraftNotice(null)
    toast.show('Draf tersimpan telah dipadam daripada pelayar ini.', 'info')
  }, [toast])

  const api = useMemo<GeneratorApi>(
    () => ({
      step,
      goToStep,
      furthestStep: STEP_IDS[Math.min(furthestIndex, STEP_IDS.length - 1)],
      generate,
      output,
      isGenerating,
      resetProject,
      consent,
      setConsent,
      draftNotice,
      dismissDraftNotice: () => setDraftNotice(null),
      discardDraft,
      saveState,
      lastSavedAt,
    }),
    [
      step,
      goToStep,
      furthestIndex,
      generate,
      output,
      isGenerating,
      resetProject,
      consent,
      setConsent,
      draftNotice,
      discardDraft,
      saveState,
      lastSavedAt,
    ],
  )

  return (
    <GeneratorContext.Provider value={api}>
      <FormProvider {...methods}>
        <Outlet />
      </FormProvider>
    </GeneratorContext.Provider>
  )
}
