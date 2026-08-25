import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-20 sm:px-6">
      <p className="text-xs font-bold tracking-wide text-magenta-600 uppercase">Ralat 404</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Halaman tidak dijumpai</h1>
      <p className="text-sm leading-relaxed text-ink-600">
        Pautan yang anda ikuti mungkin sudah lapuk. Draf anda dalam pelayar ini tidak terjejas.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/generator"
          className="rounded-lg border border-magenta-500 bg-magenta-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-magenta-600"
        >
          Ke generator
        </Link>
        <Link
          to="/"
          className="rounded-lg border border-[var(--color-control)] bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 hover:border-magenta-500 hover:text-magenta-700"
        >
          Laman utama
        </Link>
      </div>
    </div>
  )
}
