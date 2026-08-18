import { useGenerator } from './context'

/**
 * Penunjuk auto-save bagi keadaan "Sedang mengisi" (§5.6).
 *
 * Hanya bermakna apabila pengguna telah membenarkan simpanan draf; jika tidak,
 * ia menyatakan dengan jelas bahawa tiada apa-apa disimpan supaya pengguna
 * tidak tersalah anggap kerja mereka selamat (§11.1).
 */
export function SaveIndicator() {
  const { consent, saveState, lastSavedAt } = useGenerator()

  if (!consent) {
    return (
      <p className="text-xs text-ink-500">
        <span aria-hidden="true">○</span> Draf tidak disimpan. Aktifkan simpanan draf pada langkah
        Platform jika anda mahu meneruskan kerja ini kemudian.
      </p>
    )
  }

  const time = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <p aria-live="polite" className="text-xs text-ink-500">
      {saveState === 'saving' && (
        <>
          <span aria-hidden="true" className="text-blue-700">
            ⟳
          </span>{' '}
          Menyimpan draf…
        </>
      )}
      {saveState === 'saved' && (
        <>
          <span aria-hidden="true" className="text-[var(--color-ok-500)]">
            ✓
          </span>{' '}
          Draf disimpan dalam pelayar ini{time ? ` pada ${time}` : ''}.
        </>
      )}
      {saveState === 'idle' && (
        <>
          <span aria-hidden="true">○</span> Simpanan draf aktif. Perubahan disimpan secara
          automatik.
        </>
      )}
    </p>
  )
}
