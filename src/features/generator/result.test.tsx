import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '@/tests/renderApp'
import { STORAGE_KEYS, writeConsent, writeUiState } from '@/lib/storage/draft'
import { appendixBProject, makeProject, unicodeProject } from '@/tests/fixtures'
import type { PosterProject } from '@/schemas/project'

/**
 * Sediakan draf tersimpan supaya ujian boleh bermula terus pada langkah akhir
 * tanpa menaip keseluruhan borang.
 */
function seedDraft(project: PosterProject, lastStep: 'kandungan' | 'platform' = 'platform') {
  writeConsent(true)
  localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(project))
  writeUiState({ lastStep })
}

/**
 * Pasang tiruan papan klip.
 *
 * Mesti dipanggil selepas renderApp kerana `userEvent.setup()` memasang
 * stub papan klipnya sendiri pada navigator dan akan menimpa tiruan ini.
 */
function mockClipboard(impl: (text: string) => Promise<void>) {
  const writeText = vi.fn<(text: string) => Promise<void>>(impl)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  })
  return writeText
}

async function generate(user: ReturnType<typeof renderApp>['user']) {
  await user.click(screen.getAllByRole('button', { name: 'Jana prompt' })[0])
  return screen.findByRole('heading', { level: 1, name: /^Prompt untuk/ })
}

beforeEach(() => {
  localStorage.clear()
})

describe('pemulihan draf (UAT-08, FR-020)', () => {
  it('memulihkan draf terakhir dan memaklumkan pengguna', async () => {
    seedDraft(appendixBProject, 'kandungan')
    renderApp()

    expect(await screen.findByRole('status')).toHaveTextContent(/draf terakhir anda/i)
    expect(screen.getByLabelText(/^Tajuk utama/)).toHaveValue('SELAMAT MAJU JAYA')
    expect(screen.getByLabelText(/^Nama individu/)).toHaveValue('CIK NICK EZZANNY')
  })

  it('memadam draf apabila pengguna memilih buang (UAT-09)', async () => {
    seedDraft(appendixBProject, 'kandungan')
    const { user } = renderApp()

    await user.click(await screen.findByRole('button', { name: 'Padam draf' }))
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
  })

  it('tidak memulihkan draf yang tidak serasi dan menawarkan muat turun (§8.5)', async () => {
    writeConsent(true)
    localStorage.setItem(
      STORAGE_KEYS.draft,
      JSON.stringify({ ...appendixBProject, schemaVersion: '0.9' }),
    )
    renderApp()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/tidak serasi/i)
    expect(within(alert).getByRole('button', { name: 'Muat turun teks draf' })).toBeInTheDocument()
    // Kandungan tidak dipulihkan secara senyap.
    expect(screen.getByLabelText(/^Tajuk utama/)).toHaveValue('')
  })
})

describe('peringatan dan penunjuk pada langkah akhir', () => {
  it('memaparkan peringatan penggunaan aset sebelum hasil (§11.2)', () => {
    seedDraft(appendixBProject)
    renderApp()
    expect(screen.getByText('Peringatan penggunaan aset')).toBeInTheDocument()
    expect(screen.getByText(/kebenaran untuk menggunakan nama, gambar wajah dan logo/i)).toBeInTheDocument()
  })

  it('memaparkan penunjuk auto-save apabila simpanan draf aktif (§5.6)', async () => {
    seedDraft(appendixBProject)
    renderApp()
    expect(await screen.findByText(/Simpanan draf aktif|Draf disimpan dalam pelayar ini/)).toBeInTheDocument()
  })

  it('menyatakan dengan jelas apabila draf tidak disimpan', () => {
    renderApp()
    expect(screen.getByText(/Draf tidak disimpan/)).toBeInTheDocument()
  })

  it('set semula projek boleh dicapai pada semua lebar (NFR-003)', () => {
    renderApp()
    const reset = screen.getByRole('button', { name: 'Set semula projek' })
    // Bekas butang tidak boleh disembunyikan di bawah titik putus desktop.
    expect(reset.parentElement?.className ?? '').not.toMatch(/(^|\s)hidden(\s|$)/)
  })
})

describe('panel hasil — empat blok output (FR-014 hingga FR-016)', () => {
  it('memaparkan prompt utama dengan sepuluh bahagian', async () => {
    seedDraft(appendixBProject)
    const { user } = renderApp()
    await generate(user)

    const prompt = screen.getByRole('tabpanel').textContent ?? ''
    for (const section of [
      'DESIGN TASK',
      'CANVAS',
      'VISUAL DIRECTION',
      'COMPOSITION',
      'SUBJECT',
      'TYPOGRAPHY',
      'EXACT COPY',
      'CONSTRAINTS',
      'QUALITY',
      'MODEL NOTES',
    ]) {
      expect(prompt).toContain(section)
    }
  })

  it('menukar tab memaparkan blok yang berbeza', async () => {
    seedDraft(appendixBProject)
    const { user } = renderApp()
    await generate(user)

    await user.click(screen.getByRole('tab', { name: 'Negative Prompt' }))
    expect(screen.getByRole('tabpanel').textContent).toMatch(/Avoid /)

    await user.click(screen.getByRole('tab', { name: 'Nota Layout' }))
    expect(screen.getByRole('tabpanel').textContent).toMatch(/Upper third/)
  })

  it('memaparkan keputusan audit QA-01 hingga QA-07', async () => {
    seedDraft(appendixBProject)
    const { user } = renderApp()
    await generate(user)

    for (const id of ['QA-01', 'QA-02', 'QA-03', 'QA-04', 'QA-05', 'QA-06', 'QA-07']) {
      expect(screen.getByText(id)).toBeInTheDocument()
    }
    expect(screen.getByText(/Ketujuh-tujuh semakan lulus/)).toBeInTheDocument()
  })
})

describe('salin setiap tab (UAT-06, FR-018)', () => {
  it('menyalin kandungan tab yang betul ke papan klip', async () => {
    seedDraft(appendixBProject)
    const { user } = renderApp()
    const writeText = mockClipboard(() => Promise.resolve())
    await generate(user)

    await user.click(screen.getByRole('button', { name: /Salin prompt utama/i }))
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0][0]).toContain('DESIGN TASK')
    expect(await screen.findByText(/telah disalin ke papan klip/i)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Teks Tepat' }))
    await user.click(screen.getByRole('button', { name: /Salin teks tepat/i }))
    expect(writeText).toHaveBeenCalledTimes(2)
    const exactCopy = writeText.mock.calls[1][0]
    expect(exactCopy).toContain('SELAMAT MAJU JAYA')
    expect(exactCopy).not.toContain('DESIGN TASK')
  })
})

describe('clipboard ditolak (UAT-12)', () => {
  it('memaparkan fallback salin manual tanpa kehilangan output', async () => {
    seedDraft(appendixBProject)
    const { user } = renderApp()
    mockClipboard(() => Promise.reject(new Error('NotAllowedError')))
    await generate(user)

    await user.click(screen.getByRole('button', { name: /Salin prompt utama/i }))

    const manual = (await screen.findByLabelText(/Salin manual/i)) as HTMLTextAreaElement
    expect(manual.value).toContain('DESIGN TASK')
    expect(manual.value).toContain('SELAMAT MAJU JAYA')
    expect(await screen.findByText(/Pelayar menolak akses papan klip/i)).toBeInTheDocument()
    // Output asal masih dipaparkan.
    expect(screen.getByRole('tabpanel').textContent).toContain('SELAMAT MAJU JAYA')
  })
})

describe('Unicode Melayu dan Arab (UAT-11, FR-003)', () => {
  it('mengekalkan aksara Unicode dalam blok teks tepat', async () => {
    seedDraft(unicodeProject)
    const { user } = renderApp()
    await generate(user)

    await user.click(screen.getByRole('tab', { name: 'Teks Tepat' }))
    const panel = screen.getByRole('tabpanel').textContent ?? ''
    expect(panel).toContain('بسم الله الرحمن الرحيم')
    expect(panel).toContain('Tazkirah Maulidur Rasul ﷺ')
  })
})

describe('sunting semula daripada halaman hasil (FR-019)', () => {
  it('kembali ke wizard dengan input masih utuh', async () => {
    seedDraft(appendixBProject)
    const { user } = renderApp()
    await generate(user)

    await user.click(screen.getByRole('button', { name: 'Sunting semula' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Platform' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Langkah 1: Kandungan/ }))
    expect(await screen.findByLabelText(/^Tajuk utama/)).toHaveValue('SELAMAT MAJU JAYA')
  })
})

describe('amaran platform Midjourney (UAT-05)', () => {
  it('memberi amaran pemisahan teks dan mengeluarkan teks daripada prompt', async () => {
    seedDraft(
      makeProject({
        ...appendixBProject,
        platform: { ...appendixBProject.platform, targetPlatform: 'midjourney' },
      }),
    )
    const { user } = renderApp()
    await generate(user)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Prompt untuk Midjourney')
    expect(screen.getByText(/Teks poster dipisahkan daripada prompt Midjourney/i)).toBeInTheDocument()

    const prompt = screen.getByRole('tabpanel').textContent ?? ''
    expect(prompt).not.toContain('CIK NICK EZZANNY')
    expect(prompt).toMatch(/--ar \d+:\d+/)

    await user.click(screen.getByRole('tab', { name: 'Teks Tepat' }))
    expect(screen.getByRole('tabpanel').textContent).toContain('CIK NICK EZZANNY')
  })
})
