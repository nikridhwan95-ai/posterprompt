import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/data/categories'
import { PLATFORMS } from '@/data/platforms'

const STEPS = [
  { title: 'Kandungan', body: 'Pilih kategori dan masukkan teks rasmi poster anda.' },
  { title: 'Kanvas', body: 'Tetapkan saiz, orientasi dan destinasi penerbitan.' },
  { title: 'Gaya', body: 'Pilih gaya visual, mood, palet dan tipografi.' },
  { title: 'Susun atur', body: 'Tetapkan komposisi, subjek dan zon logo, QR serta footer.' },
  { title: 'Platform', body: 'Pilih platform AI sasaran dan jana prompt anda.' },
]

const OUTPUTS = [
  {
    title: 'Prompt utama',
    body: 'Arahan lengkap sepuluh bahagian yang boleh terus disalin ke platform AI.',
  },
  {
    title: 'Blok teks tepat',
    body: 'Teks poster anda tanpa parafrasa, supaya ejaan dan tarikh mudah disemak.',
  },
  {
    title: 'Negative prompt',
    body: 'Larangan visual seperti teks tidak jelas, logo rawak dan komposisi sesak.',
  },
  {
    title: 'Nota susun atur',
    body: 'Panduan kedudukan tajuk, subjek, logo, kod QR dan footer.',
  },
  {
    title: 'Amaran kualiti',
    body: 'Maklum balas tentang panjang teks, konflik gaya dan risiko tipografi.',
  },
]

/** Halaman pendaratan: nilai produk, cara berfungsi dan CTA mula (§5.1). */
export function Landing() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <section className="flex flex-col gap-6">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
          Tanpa akaun · Tanpa API · Semua dalam pelayar
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          Tukar maklumat acara anda kepada{' '}
          <span className="text-magenta-600">prompt poster yang tersusun</span>
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-600">
          PosterPrompt menghasilkan arahan reka bentuk yang lengkap untuk ChatGPT, Gemini,
          Midjourney, Canva dan Adobe. Anda tidak perlu memahami istilah seperti{' '}
          <em>hierarchy</em>, <em>composition</em> atau <em>aspect ratio</em> — borang lima langkah
          menterjemahkannya untuk anda, sambil mengekalkan teks rasmi anda tepat seperti ditaip.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/generator"
            className="inline-flex items-center rounded-lg border border-magenta-500 bg-magenta-500 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-magenta-600"
          >
            Mula jana prompt
          </Link>
          <Link
            to="/privasi"
            className="inline-flex items-center rounded-lg border border-[var(--color-control)] bg-white px-5 py-3 text-base font-semibold text-ink-800 transition-colors hover:border-magenta-500 hover:text-magenta-700"
          >
            Bagaimana data saya dikendalikan?
          </Link>
        </div>
      </section>

      <section aria-labelledby="cara-tajuk" className="mt-16 flex flex-col gap-6">
        <h2 id="cara-tajuk" className="text-2xl font-bold tracking-tight text-ink-900">
          Lima langkah sahaja
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="pp-card flex flex-col gap-2 p-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <h3 className="text-sm font-bold text-ink-900">{step.title}</h3>
              <p className="text-xs leading-relaxed text-ink-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="output-tajuk" className="mt-16 flex flex-col gap-6">
        <h2 id="output-tajuk" className="text-2xl font-bold tracking-tight text-ink-900">
          Apa yang anda dapat
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTPUTS.map((item) => (
            <article key={item.title} className="pp-card flex flex-col gap-2 p-5">
              <h3 className="text-sm font-bold text-magenta-700">{item.title}</h3>
              <p className="text-sm leading-relaxed text-ink-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sokongan-tajuk" className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 id="sokongan-tajuk" className="text-lg font-bold text-ink-900">
            {CATEGORIES.length} kategori poster
          </h2>
          <ul className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <li
                key={category.id}
                className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700"
              >
                {category.label.ms}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink-900">{PLATFORMS.length} adapter platform</h2>
          <ul className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <li
                key={platform.id}
                className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700"
              >
                {platform.label.ms}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">
            Nama platform disenaraikan sebagai sasaran output sahaja. PosterPrompt tidak berhubung
            dengan mana-mana perkhidmatan tersebut dan tidak menjamin hasil akhir model.
          </p>
        </div>
      </section>
    </div>
  )
}
