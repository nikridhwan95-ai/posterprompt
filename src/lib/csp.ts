/**
 * Content Security Policy asas — SDD §11.3 dan §13.4.
 *
 * Dasar ini dikuatkuasakan dua kali supaya ia berkuat kuasa tanpa mengira
 * hosting: sebagai tag <meta> yang disuntik ke dalam binaan production oleh
 * plugin Vite, dan sebagai pengepala HTTP sebenar melalui vercel.json dan
 * public/_headers. Pengepala HTTP lebih kuat (ia boleh membawa frame-ancestors),
 * jadi tag meta hanyalah jaring keselamatan bagi hos statik biasa.
 *
 * Nota tentang 'unsafe-inline' untuk style: aplikasi menetapkan warna palet
 * pengguna melalui atribut style pada pratonton zon dan cip warna. Atribut
 * style memerlukan 'unsafe-inline' di bawah style-src; ia tidak membenarkan
 * sebarang skrip. Tiada 'unsafe-inline' dibenarkan untuk script-src.
 */
export const CSP_DIRECTIVES: readonly string[] = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  // Tiada panggilan rangkaian selepas aset dimuatkan (FR-024, NFR-009).
  "connect-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  'upgrade-insecure-requests',
]

export const CSP_VALUE = CSP_DIRECTIVES.join('; ')

/** Pengepala keselamatan tambahan yang dinamakan dalam §11.3 dan §13.4. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': CSP_VALUE,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

/**
 * Direktif yang sah dalam tag <meta http-equiv>.
 * `frame-ancestors` dan `upgrade-insecure-requests` diabaikan dalam meta, jadi
 * ia ditinggalkan di sana dan dikuatkuasakan melalui pengepala HTTP sahaja.
 */
export const CSP_META_VALUE = CSP_DIRECTIVES.filter(
  (directive) =>
    !directive.startsWith('frame-ancestors') && directive !== 'upgrade-insecure-requests',
).join('; ')
