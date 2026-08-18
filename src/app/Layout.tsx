import { NavLink, Outlet } from 'react-router-dom'
import { APP_VERSION, SCHEMA_VERSION, TEMPLATE_VERSION } from '@/data/version'

const NAV = [
  { to: '/', label: 'Laman utama', end: true },
  { to: '/generator', label: 'Generator', end: false },
  { to: '/hasil', label: 'Hasil', end: false },
  { to: '/privasi', label: 'Privasi', end: false },
]

/** Shell aplikasi: header, navigasi, footer dan pautan langkau (§4.1). */
export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#kandungan-utama" className="pp-skip-link">
        Langkau ke kandungan utama
      </a>

      <header className="pp-no-print sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-ink-900"
            >
              <span className="size-3.5 rounded-sm bg-magenta-500" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-ink-900">PosterPrompt</span>
              <span className="text-[11px] text-ink-500">Generator prompt poster berstruktur</span>
            </span>
          </NavLink>

          <nav aria-label="Navigasi utama">
            <ul className="flex flex-wrap items-center gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-magenta-50 text-magenta-800'
                          : 'text-ink-600 hover:bg-blue-50 hover:text-blue-700'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/*
        Landmark <main> tunggal untuk semua laluan, dan sasaran pautan langkau.
        tabIndex -1 diperlukan kerana elemen bukan interaktif tidak menerima
        fokus daripada pautan langkau pada sesetengah pelayar (NFR-004).
      */}
      <main id="kandungan-utama" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>

      <footer className="pp-no-print border-t border-ink-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-xs text-ink-500 sm:px-6">
          <p>
            PosterPrompt v{APP_VERSION} · skema {SCHEMA_VERSION} · templat {TEMPLATE_VERSION}
          </p>
          <p>
            Semua pemprosesan berlaku dalam pelayar anda. Tiada kandungan poster dihantar ke
            pelayan.
          </p>
        </div>
      </footer>
    </div>
  )
}
