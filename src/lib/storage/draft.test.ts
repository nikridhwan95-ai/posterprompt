// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  STORAGE_KEYS,
  clearAllStorage,
  clearDraft,
  createDebouncedSaver,
  draftAsDownloadableText,
  hasStoredDraft,
  loadDraft,
  readConsent,
  readUiState,
  saveDraft,
  writeConsent,
  writeUiState,
} from './draft'
import { appendixBProject } from '@/tests/fixtures'
import { defaultProject } from '@/schemas/project'

beforeEach(() => {
  localStorage.clear()
})

describe('persetujuan simpan draf (§11.1)', () => {
  it('tidak aktif secara lalai', () => {
    expect(readConsent()).toBe(false)
  })

  it('tidak menulis apa-apa tanpa persetujuan (FR-020)', () => {
    expect(saveDraft(appendixBProject)).toBe(false)
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
  })

  it('menulis draf selepas persetujuan diberi', () => {
    writeConsent(true)
    expect(saveDraft(appendixBProject)).toBe(true)
    expect(hasStoredDraft()).toBe(true)
  })

  it('menarik balik persetujuan turut memadam draf', () => {
    writeConsent(true)
    saveDraft(appendixBProject)
    writeConsent(false)
    expect(readConsent()).toBe(false)
    expect(hasStoredDraft()).toBe(false)
  })
})

describe('pemulihan draf (UAT-08)', () => {
  it('memulangkan status none apabila tiada draf', () => {
    expect(loadDraft()).toEqual({ status: 'none' })
  })

  it('memulihkan draf tanpa kehilangan teks', () => {
    writeConsent(true)
    saveDraft(appendixBProject)
    const result = loadDraft()
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') throw new Error('draf sepatutnya dipulihkan')
    expect(result.project.content.mainHeadline).toBe('SELAMAT MAJU JAYA')
    expect(result.project.content.programName).toBe(appendixBProject.content.programName)
  })

  it('memulihkan draf separuh siap yang belum lengkap medan wajibnya', () => {
    writeConsent(true)
    saveDraft({ ...appendixBProject, content: { ...appendixBProject.content, personName: '' } })
    const result = loadDraft()
    expect(result.status).toBe('ok')
  })

  it('melengkapkan bahagian yang hilang daripada draf separuh siap', () => {
    // Draf lama boleh kehilangan keseluruhan bahagian. Memulihkannya tanpa
    // lalai akan meruntuhkan wizard yang membaca project.style secara terus.
    const partial: Record<string, unknown> = { ...appendixBProject }
    delete partial.style
    delete partial.subject
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(partial))

    const result = loadDraft()
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') throw new Error('draf sepatutnya dipulihkan')
    expect(result.project.style.stylePreset).toBe(defaultProject().style.stylePreset)
    expect(result.project.subject.subjectType).toBe(defaultProject().subject.subjectType)
    // Kandungan pengguna tetap diutamakan berbanding lalai.
    expect(result.project.content.mainHeadline).toBe(appendixBProject.content.mainHeadline)
  })

  it('mengekalkan nilai pengguna dalam bahagian yang tidak lengkap', () => {
    localStorage.setItem(
      STORAGE_KEYS.draft,
      JSON.stringify({ ...appendixBProject, canvas: { preset: 'a4_portrait' } }),
    )

    const result = loadDraft()
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') throw new Error('draf sepatutnya dipulihkan')
    expect(result.project.canvas.preset).toBe('a4_portrait')
    expect(result.project.canvas.width).toBe(defaultProject().canvas.width)
  })

  it('menandakan draf rosak sebagai tidak serasi, bukan membuangnya senyap (§8.5)', () => {
    localStorage.setItem(STORAGE_KEYS.draft, '{bukan json')
    const result = loadDraft()
    expect(result.status).toBe('incompatible')
    if (result.status !== 'incompatible') throw new Error('sepatutnya tidak serasi')
    expect(result.raw).toBe('{bukan json')
  })

  it('menandakan versi skema yang tidak diketahui sebagai tidak serasi', () => {
    localStorage.setItem(
      STORAGE_KEYS.draft,
      JSON.stringify({ ...appendixBProject, schemaVersion: '0.9' }),
    )
    const result = loadDraft()
    expect(result.status).toBe('incompatible')
    if (result.status !== 'incompatible') throw new Error('sepatutnya tidak serasi')
    expect(result.from).toBe('0.9')
  })

  it('menyediakan teks draf yang boleh dimuat turun', () => {
    const text = draftAsDownloadableText(JSON.stringify({ a: 1 }))
    expect(text).toContain('"a": 1')
  })
})

describe('padam draf (UAT-09)', () => {
  it('membersihkan kunci draf sahaja', () => {
    writeConsent(true)
    saveDraft(appendixBProject)
    clearDraft()
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.consent)).toBe('true')
  })

  it('membersihkan semua kunci PosterPrompt', () => {
    writeConsent(true)
    saveDraft(appendixBProject)
    writeUiState({ lastStep: 'gaya' })
    clearAllStorage()
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.consent)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.ui)).toBeNull()
  })
})

describe('keadaan UI', () => {
  it('menyimpan dan membaca langkah terakhir', () => {
    writeUiState({ lastStep: 'susun_atur', summaryOpen: true })
    expect(readUiState()).toEqual({ lastStep: 'susun_atur', summaryOpen: true })
  })

  it('memulangkan objek kosong apabila nilai rosak', () => {
    localStorage.setItem(STORAGE_KEYS.ui, 'bukan json')
    expect(readUiState()).toEqual({})
  })
})

describe('penyimpan tertunda (§8.4)', () => {
  it('menulis sekali sahaja selepas 500 ms', () => {
    vi.useFakeTimers()
    writeConsent(true)
    const saver = createDebouncedSaver()

    saver.save(appendixBProject)
    saver.save(appendixBProject)
    saver.save(appendixBProject)
    expect(hasStoredDraft()).toBe(false)

    vi.advanceTimersByTime(500)
    expect(hasStoredDraft()).toBe(true)
    vi.useRealTimers()
  })

  it('membatalkan tulisan yang belum berlaku', () => {
    vi.useFakeTimers()
    writeConsent(true)
    const saver = createDebouncedSaver()
    saver.save(appendixBProject)
    saver.cancel()
    vi.advanceTimersByTime(1000)
    expect(hasStoredDraft()).toBe(false)
    vi.useRealTimers()
  })
})

describe('ketahanan storan (NFR-010)', () => {
  it('tidak melontar ralat apabila localStorage tidak tersedia', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    writeConsent(true)
    expect(() => saveDraft(appendixBProject)).not.toThrow()
    spy.mockRestore()
  })
})
