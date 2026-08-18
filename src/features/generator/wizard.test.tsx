import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '@/tests/renderApp'

/** Isi medan teks mengikut label yang kelihatan. */
async function fill(user: ReturnType<typeof renderApp>['user'], label: RegExp, value: string) {
  const field = screen.getByLabelText(label)
  await user.clear(field)
  await user.type(field, value)
}

async function nextStep(user: ReturnType<typeof renderApp>['user']) {
  await user.click(screen.getAllByRole('button', { name: 'Seterusnya' })[0])
}

describe('wizard — medan dinamik mengikut kategori (UAT-02, FR-004)', () => {
  it('kategori acara umum mewajibkan nama program dan tarikh', () => {
    renderApp()
    expect(screen.getByLabelText(/^Nama program/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Nama individu/)).not.toBeInTheDocument()
  })

  it('menukar kepada ucapan tahniah menjadikan nama dan pencapaian wajib', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('radio', { name: /Ucapan tahniah/ }))

    const name = screen.getByLabelText(/^Nama individu/)
    const achievement = screen.getByLabelText(/^Pencapaian atau anugerah/)
    expect(name).toBeInTheDocument()
    expect(achievement).toBeInTheDocument()

    // Penanda wajib dipaparkan untuk kedua-dua medan baharu.
    expect(screen.getByText('Nama individu').textContent).toContain('*')
    expect(screen.getByText('Pencapaian atau anugerah').textContent).toContain('*')
  })

  it('menyekat langkah seterusnya apabila medan wajib kategori kosong', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('radio', { name: /Ucapan tahniah/ }))
    await fill(user, /^Tajuk utama/, 'TAHNIAH')
    await nextStep(user)

    const summary = await screen.findByRole('alert')
    expect(summary).toHaveTextContent(/perlu dibetulkan sebelum meneruskan/)
    expect(
      within(summary).getAllByText(/wajib diisi untuk kategori ucapan tahniah/i).length,
    ).toBeGreaterThanOrEqual(2)
    // Masih berada pada langkah 1.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kandungan')
  })

  it('meneruskan ke langkah seterusnya apabila medan wajib lengkap', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('radio', { name: /Ucapan tahniah/ }))
    await fill(user, /^Tajuk utama/, 'TAHNIAH')
    await fill(user, /^Nama individu/, 'Dr. Nurul Aina')
    await fill(user, /^Pencapaian atau anugerah/, 'Johan Anugerah Inovasi')
    await nextStep(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'Kanvas' })).toBeInTheDocument()
  })
})

describe('wizard — dimensi tersuai tidak sah (UAT-03, FR-005)', () => {
  it('menyekat penjanaan dan memaparkan mesej khusus', async () => {
    const { user } = renderApp()
    await fill(user, /^Tajuk utama/, 'HARI TERBUKA 2026')
    await fill(user, /^Nama program/, 'Hari Terbuka Kampus')
    await fill(user, /^Tarikh/, '12 Mac 2026')
    await nextStep(user)

    await user.click(await screen.findByRole('radio', { name: /Tersuai/ }))
    await fill(user, /^Lebar/, '100')
    await fill(user, /^Tinggi/, '50')
    await nextStep(user)

    const summary = await screen.findByRole('alert')
    expect(summary).toHaveTextContent(/Lebar minimum ialah 320 px/)
    expect(summary).toHaveTextContent(/Tinggi minimum ialah 320 px/)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kanvas')
  })

  it('membenarkan dimensi tersuai yang sah', async () => {
    const { user } = renderApp()
    await fill(user, /^Tajuk utama/, 'HARI TERBUKA 2026')
    await fill(user, /^Nama program/, 'Hari Terbuka Kampus')
    await fill(user, /^Tarikh/, '12 Mac 2026')
    await nextStep(user)

    await user.click(await screen.findByRole('radio', { name: /Tersuai/ }))
    await fill(user, /^Lebar/, '1600')
    await fill(user, /^Tinggi/, '900')
    await nextStep(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'Gaya' })).toBeInTheDocument()
  })
})

describe('wizard — kembali menyunting tanpa kehilangan input (UAT-07, FR-019)', () => {
  it('mengekalkan teks apabila pengguna kembali ke langkah sebelumnya', async () => {
    const { user } = renderApp()
    await fill(user, /^Tajuk utama/, 'MAJLIS PERASMIAN')
    await fill(user, /^Nama program/, 'Program Mesra Siswa')
    await fill(user, /^Tarikh/, '1 September 2026')
    await nextStep(user)

    await screen.findByRole('heading', { level: 1, name: 'Kanvas' })
    await user.click(screen.getAllByRole('button', { name: 'Kembali' })[0])

    expect(await screen.findByLabelText(/^Tajuk utama/)).toHaveValue('MAJLIS PERASMIAN')
    expect(screen.getByLabelText(/^Nama program/)).toHaveValue('Program Mesra Siswa')
    expect(screen.getByLabelText(/^Tarikh/)).toHaveValue('1 September 2026')
  })

  it('membenarkan lompatan terus melalui stepper ke langkah yang telah dilawati', async () => {
    const { user } = renderApp()
    await fill(user, /^Tajuk utama/, 'MAJLIS PERASMIAN')
    await fill(user, /^Nama program/, 'Program Mesra Siswa')
    await fill(user, /^Tarikh/, '1 September 2026')
    await nextStep(user)
    await screen.findByRole('heading', { level: 1, name: 'Kanvas' })

    await user.click(screen.getByRole('button', { name: /Langkah 1: Kandungan/ }))
    expect(await screen.findByLabelText(/^Tajuk utama/)).toHaveValue('MAJLIS PERASMIAN')
  })
})

describe('wizard — meter ketumpatan (FR-017)', () => {
  it('mengemas kini skor ketumpatan semasa pengguna menaip', async () => {
    const { user } = renderApp()
    await fill(user, /^Tajuk utama/, 'A'.repeat(60))

    const meters = screen.getAllByRole('meter', { name: /ketumpatan/i })
    expect(meters.length).toBeGreaterThan(0)
    expect(Number(meters[0].getAttribute('aria-valuenow'))).toBeGreaterThan(0)
  })
})
