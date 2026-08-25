import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
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

describe('wizard — kejutkan saya (§5.3)', () => {
  it('mengisi medan wajib yang kosong dan mengamarkan teks contoh', async () => {
    const { user } = renderApp()
    expect(screen.getByLabelText(/^Tajuk utama/)).toHaveValue('')

    await user.click(screen.getByRole('button', { name: 'Kejutkan saya' }))

    expect(screen.getByLabelText(/^Tajuk utama/)).not.toHaveValue('')
    expect(screen.getByLabelText(/^Nama program/)).not.toHaveValue('')
    expect(screen.getByLabelText(/^Tarikh/)).not.toHaveValue('')
    // Teks contoh mesti diisytiharkan, bukan diselitkan senyap.
    expect(await screen.findByText(/masih menggunakan teks contoh/)).toBeInTheDocument()
  })

  it('tidak menimpa teks yang telah ditaip pengguna', async () => {
    const { user } = renderApp()
    await fill(user, /^Tajuk utama/, 'TAJUK SAYA SENDIRI')

    await user.click(screen.getByRole('button', { name: 'Kejutkan saya' }))

    expect(screen.getByLabelText(/^Tajuk utama/)).toHaveValue('TAJUK SAYA SENDIRI')
    expect(screen.getByLabelText(/^Tarikh/)).not.toHaveValue('')
  })

  it('menarik balik amaran sebaik medan contoh disunting semula', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: 'Kejutkan saya' }))
    await screen.findByText(/masih menggunakan teks contoh/)

    // Ganti setiap medan contoh dengan teks sebenar.
    await fill(user, /^Tajuk utama/, 'MAJLIS SEBENAR')
    await fill(user, /^Nama program/, 'Program Sebenar')
    await fill(user, /^Tarikh/, '1 Januari 2027')

    await waitFor(() =>
      expect(screen.queryByText(/masih menggunakan teks contoh/)).not.toBeInTheDocument(),
    )
  })
})

describe('wizard — kaunter aksara (§5.5)', () => {
  it('menyembunyikan kaunter sehingga medan difokus', async () => {
    const { user } = renderApp()
    // Sebelum sebarang fokus, tiada "0 / 500" statik memenuhi borang.
    expect(screen.queryByText('0 / 120')).not.toBeInTheDocument()
    expect(screen.queryByText('0 / 500')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/^Tajuk utama/))
    expect(screen.getByText('0 / 120')).toBeInTheDocument()
  })

  it('mengekalkan kaunter tanpa fokus apabila had hampir dicecah', async () => {
    const { user } = renderApp()
    const headline = screen.getByLabelText(/^Tajuk utama/)
    await user.click(headline)
    await user.paste('A'.repeat(100))
    // Alih fokus ke medan lain: kaunter tajuk kekal kerana 100 ≥ 80% × 120.
    await user.click(screen.getByLabelText(/^Nama program/))
    expect(screen.getByText('100 / 120')).toBeInTheDocument()
  })
})

describe('wizard — pratonton zon di langkah susun atur (FR-023)', () => {
  it('memaparkan pratonton zon bersebelahan pilihan komposisi', async () => {
    const { user } = renderApp()
    await fill(user, /^Tajuk utama/, 'MAJLIS PERASMIAN')
    await fill(user, /^Nama program/, 'Program Mesra Siswa')
    await fill(user, /^Tarikh/, '1 September 2026')
    await nextStep(user)
    await screen.findByRole('heading', { name: 'Kanvas' })
    await nextStep(user)
    await screen.findByRole('heading', { name: 'Gaya' })
    await nextStep(user)
    await screen.findByRole('heading', { name: 'Susun atur' })

    expect(screen.getByRole('heading', { name: 'Pratonton zon' })).toBeInTheDocument()
    // Rangka zon dirender sebagai imej boleh akses dengan penerangan zon.
    expect(screen.getAllByRole('img', { name: /Rangka susun atur poster/ }).length).toBeGreaterThan(0)
  })
})

describe('wizard — pemilih gaya (FR-006)', () => {
  async function goToStyleStep(user: ReturnType<typeof renderApp>['user']) {
    await fill(user, /^Tajuk utama/, 'MAJLIS PERASMIAN')
    await fill(user, /^Nama program/, 'Program Mesra Siswa')
    await fill(user, /^Tarikh/, '1 September 2026')
    await nextStep(user)
    await screen.findByRole('heading', { level: 1, name: 'Kanvas' })
    await nextStep(user)
    await screen.findByRole('heading', { level: 1, name: 'Gaya' })
  }

  it('mengumpulkan katalog gaya yang panjang di bawah sub-tajuk', async () => {
    const { user } = renderApp()
    await goToStyleStep(user)

    for (const group of ['Asas dan struktur', 'Digital dan futuristik', 'Warisan tempatan']) {
      expect(screen.getByText(group)).toBeInTheDocument()
    }
  })

  it('membenarkan gaya baharu dipilih sebagai satu-satunya gaya aktif', async () => {
    const { user } = renderApp()
    await goToStyleStep(user)

    const cyberpunk = screen.getByRole('radio', { name: /Cyberpunk/ })
    const corporate = screen.getByRole('radio', { name: /Korporat/ })
    expect(corporate).toBeChecked()

    await user.click(cyberpunk)
    expect(cyberpunk).toBeChecked()
    // Radio berkongsi satu nama, jadi pilihan terdahulu terbatal walaupun ia
    // berada dalam kumpulan paparan yang berlainan (QA-04).
    expect(corporate).not.toBeChecked()
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
