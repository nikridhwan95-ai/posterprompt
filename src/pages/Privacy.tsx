import { useState } from 'react'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { STORAGE_KEYS, clearAllStorage, hasStoredDraft, readConsent } from '@/lib/storage/draft'

const KEYS = [
  {
    key: STORAGE_KEYS.draft,
    value: 'Objek projek anda dalam format JSON',
    life: 'Sehingga anda set semula projek, matikan simpanan draf atau bersihkan cache pelayar.',
  },
  {
    key: STORAGE_KEYS.consent,
    value: 'Nilai benar atau palsu',
    life: 'Sehingga anda mengubah pilihan privasi.',
  },
  {
    key: STORAGE_KEYS.ui,
    value: 'Langkah terakhir dan pilihan paparan',
    life: 'Pilihan sahaja; boleh dibuang tanpa menjejaskan kandungan poster.',
  },
]

/** Notis privasi (§5.1, §11.1). */
export function Privacy() {
  const toast = useToast()
  const [confirmClear, setConfirmClear] = useState(false)
  const [consent, setConsent] = useState(() => readConsent())
  const [stored, setStored] = useState(() => hasStoredDraft())

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Notis privasi</h1>
          <p className="text-sm leading-relaxed text-ink-600">
            PosterPrompt memproses kandungan anda sepenuhnya di dalam pelayar. Tiada teks poster,
            nama, tarikh atau warna yang anda masukkan dihantar ke pelayan, perkhidmatan analitik
            atau mana-mana model AI oleh aplikasi ini.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink-900">Apa yang berlaku kepada input anda</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-ink-600">
            <li>
              Semasa anda menaip, input berada dalam memori halaman sahaja. Menutup tab tanpa
              mengaktifkan simpanan draf akan membuang semuanya.
            </li>
            <li>
              Jika anda mengaktifkan “Simpan draf dalam pelayar ini”, satu draf ditulis ke{' '}
              <code className="font-mono text-xs">localStorage</code> peranti ini selepas jeda 500
              milisaat. Ia tidak disegerakkan merentas peranti.
            </li>
            <li>
              Penjanaan prompt berlaku secara tempatan. Selepas aplikasi dimuatkan, tiada panggilan
              rangkaian diperlukan untuk menjana output.
            </li>
            <li>
              Apabila anda menyalin prompt dan menampalnya ke platform AI luar, dasar privasi
              platform tersebut terpakai. PosterPrompt tidak mengawal perkara itu.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink-900">Data yang disimpan dalam pelayar</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink-300">
                  <th scope="col" className="py-2 pr-4 font-semibold text-ink-800">
                    Kunci
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold text-ink-800">
                    Nilai
                  </th>
                  <th scope="col" className="py-2 font-semibold text-ink-800">
                    Hayat
                  </th>
                </tr>
              </thead>
              <tbody>
                {KEYS.map((row) => (
                  <tr key={row.key} className="border-b border-ink-200 align-top">
                    <td className="py-2 pr-4 font-mono text-xs text-ink-700">{row.key}</td>
                    <td className="py-2 pr-4 text-ink-600">{row.value}</td>
                    <td className="py-2 text-ink-600">{row.life}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink-900">Komputer yang dikongsi</h2>
          <p className="text-sm leading-relaxed text-ink-600">
            Draf yang disimpan kekal dalam pelayar sehingga dipadam. Pada komputer awam atau
            berkongsi, matikan simpanan draf atau tekan butang di bawah sebelum meninggalkan
            peranti.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink-900">Penggunaan aset yang sah</h2>
          <p className="text-sm leading-relaxed text-ink-600">
            Pastikan anda mempunyai kebenaran untuk menggunakan logo, gambar wajah dan nama yang
            dimasukkan ke dalam poster. PosterPrompt tidak menyemak hak penggunaan aset dan tidak
            menjana logo atau wajah sebenar.
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-5">
          <h2 className="text-lg font-bold text-ink-900">Kawalan anda</h2>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Simpanan draf</dt>
              <dd className="font-semibold text-ink-900">{consent ? 'Aktif' : 'Tidak aktif'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Draf tersimpan</dt>
              <dd className="font-semibold text-ink-900">{stored ? 'Ada' : 'Tiada'}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="danger" onClick={() => setConfirmClear(true)}>
              Padam semua data PosterPrompt
            </Button>
          </div>
        </section>
      </article>

      <ConfirmDialog
        open={confirmClear}
        title="Padam semua data PosterPrompt?"
        description="Draf tersimpan, pilihan persetujuan dan keadaan paparan akan dibuang daripada pelayar ini. Tindakan ini tidak boleh dibatalkan."
        confirmLabel="Ya, padam semua"
        onConfirm={() => {
          clearAllStorage()
          setConsent(false)
          setStored(false)
          setConfirmClear(false)
          toast.show('Semua data PosterPrompt telah dipadam daripada pelayar ini.', 'success')
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
