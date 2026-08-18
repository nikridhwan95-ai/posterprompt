/**
 * Penyalinan teks dengan rantaian fallback (FR-018, UAT-12).
 *
 * 1. Clipboard API moden.
 * 2. Textarea tersembunyi + document.execCommand('copy') untuk pelayar lama.
 * 3. Gagal sepenuhnya — pemanggil memaparkan arahan salin manual.
 */
export type CopyResult = 'clipboard' | 'fallback' | 'failed'

export async function copyText(text: string): Promise<CopyResult> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return 'clipboard'
    } catch {
      // Kebenaran ditolak atau konteks tidak selamat — cuba fallback.
    }
  }

  return legacyCopy(text)
}

function legacyCopy(text: string): CopyResult {
  if (typeof document === 'undefined') return 'failed'

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '-1000px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)

  try {
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    const ok = document.execCommand?.('copy') ?? false
    return ok ? 'fallback' : 'failed'
  } catch {
    return 'failed'
  } finally {
    document.body.removeChild(textarea)
  }
}
