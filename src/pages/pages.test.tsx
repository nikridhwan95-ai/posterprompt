import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '@/tests/renderApp'
import { STORAGE_KEYS, writeConsent, writeUiState } from '@/lib/storage/draft'
import { appendixBProject } from '@/tests/fixtures'

beforeEach(() => {
  localStorage.clear()
})

describe('halaman pendaratan (§5.1)', () => {
  it('menerangkan produk dan menyediakan CTA mula', async () => {
    const { user } = renderApp('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/prompt poster yang tersusun/i)

    await user.click(screen.getByRole('link', { name: 'Mula jana prompt' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Kandungan' })).toBeInTheDocument()
  })
})

describe('landmark halaman (NFR-004)', () => {
  it.each(['/', '/generator', '/privasi', '/laluan-tiada'])(
    'menyediakan satu landmark utama pada %s',
    (route) => {
      renderApp(route)
      const main = screen.getByRole('main')
      // Pautan langkau menyasarkan landmark ini, jadi id dan fokus mesti ada.
      expect(main).toHaveAttribute('id', 'kandungan-utama')
      expect(main).toHaveAttribute('tabindex', '-1')
    },
  )
})

describe('halaman tidak dijumpai', () => {
  it('memaparkan 404 bagi laluan yang tidak wujud', () => {
    renderApp('/laluan-yang-tiada')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Halaman tidak dijumpai')
  })
})

describe('notis privasi (§11.1)', () => {
  it('menyenaraikan ketiga-tiga kunci simpanan tempatan (§8.3)', () => {
    renderApp('/privasi')
    expect(screen.getByText(STORAGE_KEYS.draft)).toBeInTheDocument()
    expect(screen.getByText(STORAGE_KEYS.consent)).toBeInTheDocument()
    expect(screen.getByText(STORAGE_KEYS.ui)).toBeInTheDocument()
  })

  it('memadam semua data selepas pengesahan', async () => {
    writeConsent(true)
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(appendixBProject))
    writeUiState({ lastStep: 'gaya' })

    const { user } = renderApp('/privasi')
    await user.click(screen.getByRole('button', { name: /Padam semua data PosterPrompt/ }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Ya, padam semua' }))

    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.consent)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.ui)).toBeNull()
  })

  it('tidak memadam apa-apa apabila pengguna membatalkan', async () => {
    writeConsent(true)
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(appendixBProject))

    const { user } = renderApp('/privasi')
    await user.click(screen.getByRole('button', { name: /Padam semua data PosterPrompt/ }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }))

    expect(localStorage.getItem(STORAGE_KEYS.draft)).not.toBeNull()
  })
})

describe('set semula projek (FR-021)', () => {
  it('meminta pengesahan sebelum memadam semua input', async () => {
    writeConsent(true)
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(appendixBProject))

    const { user } = renderApp('/generator')
    expect(await screen.findByLabelText(/^Tajuk utama/)).toHaveValue('SELAMAT MAJU JAYA')

    await user.click(screen.getByRole('button', { name: 'Set semula projek' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(/tidak boleh dibatalkan/i)

    // Membatalkan mengekalkan input.
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }))
    expect(screen.getByLabelText(/^Tajuk utama/)).toHaveValue('SELAMAT MAJU JAYA')

    // Mengesahkan mengosongkan borang dan memadam draf.
    await user.click(screen.getByRole('button', { name: 'Set semula projek' }))
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(within(confirmDialog).getByRole('button', { name: 'Ya, set semula' }))

    expect(await screen.findByLabelText(/^Tajuk utama/)).toHaveValue('')

    // Tunggu melepasi tetingkap debounce 500 ms: set semula pernah membenarkan
    // simpanan tertunda menulis semula draf lalai selepas kunci dipadam.
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
  })
})
