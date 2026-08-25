import type { CompositionId, StyleId, TextAlignmentId, TypefaceId } from '@/data/styles'

/**
 * Swatch visual kecil untuk kad pilihan wizard (§5.5).
 *
 * Pilihan kanvas, komposisi, penjajaran, tipografi dan gaya semuanya keputusan
 * visual; swatch ini menunjukkannya dan bukan sekadar menerangkannya. Semua
 * grafik dilukis sebagai SVG sebaris atau CSS kerana CSP menghadkan imej
 * kepada 'self' (§11.3) — tiada aset luar boleh digunakan.
 *
 * Setiap swatch adalah hiasan semata-mata (aria-hidden): nama boleh capai kad
 * kekal datang daripada label teksnya, jadi ujian dan pembaca skrin tidak
 * terjejas.
 */

const INK = '#3E3750'
const INK_SOFT = '#9F98B0'
const PAPER = '#FFFFFF'

/* --------------------------------------------------------------- kanvas */

/**
 * Segi empat bernisbah sebenar bagi preset kanvas. Bentuk ialah maklumat
 * utama pilihan ini; nombor 1080 × 1350 hanya butirannya.
 */
export function RatioThumb({ width, height, custom = false }: {
  width: number
  height: number
  custom?: boolean
}) {
  const BOX = 36
  const ratio = width / height
  const w = ratio >= 1 ? BOX : Math.max(12, Math.round(BOX * ratio))
  const h = ratio >= 1 ? Math.max(12, Math.round(BOX / ratio)) : BOX

  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center"
    >
      <span
        className={`block rounded-[3px] border ${
          custom
            ? 'border-dashed border-ink-400 bg-ink-50'
            : 'border-ink-400 bg-ink-100'
        }`}
        style={{ width: `${w}px`, height: `${h}px` }}
      />
    </span>
  )
}

/* ----------------------------------------------------------- komposisi */

/** Rangka mini 28 × 36 bagi setiap komposisi — tajuk gelap, subjek lembut. */
export function CompositionGlyph({ id }: { id: CompositionId }) {
  const parts: Record<CompositionId, React.JSX.Element> = {
    centered: (
      <>
        <rect x="7" y="6" width="14" height="4" rx="1" fill={INK} />
        <rect x="9" y="14" width="10" height="12" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="10" y="29" width="8" height="2" rx="1" fill={INK_SOFT} />
      </>
    ),
    symmetry: (
      <>
        <rect x="4" y="6" width="8" height="4" rx="1" fill={INK} />
        <rect x="16" y="6" width="8" height="4" rx="1" fill={INK} />
        <rect x="4" y="14" width="8" height="14" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="16" y="14" width="8" height="14" rx="1" fill={INK_SOFT} opacity="0.55" />
        <line x1="14" y1="4" x2="14" y2="32" stroke={INK_SOFT} strokeDasharray="2 2" />
      </>
    ),
    split: (
      <>
        <rect x="4" y="4" width="9" height="28" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="16" y="7" width="8" height="3" rx="1" fill={INK} />
        <rect x="16" y="13" width="8" height="2" rx="1" fill={INK_SOFT} />
        <rect x="16" y="17" width="8" height="2" rx="1" fill={INK_SOFT} />
        <rect x="16" y="21" width="6" height="2" rx="1" fill={INK_SOFT} />
      </>
    ),
    subject_left: (
      <>
        <rect x="4" y="8" width="10" height="20" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="17" y="9" width="7" height="3" rx="1" fill={INK} />
        <rect x="17" y="15" width="7" height="2" rx="1" fill={INK_SOFT} />
        <rect x="17" y="19" width="5" height="2" rx="1" fill={INK_SOFT} />
      </>
    ),
    subject_right: (
      <>
        <rect x="14" y="8" width="10" height="20" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="4" y="9" width="7" height="3" rx="1" fill={INK} />
        <rect x="4" y="15" width="7" height="2" rx="1" fill={INK_SOFT} />
        <rect x="4" y="19" width="5" height="2" rx="1" fill={INK_SOFT} />
      </>
    ),
    hero_full: (
      <>
        <rect x="4" y="4" width="20" height="28" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="7" y="20" width="14" height="4" rx="1" fill={INK} />
        <rect x="9" y="26" width="10" height="2" rx="1" fill={PAPER} opacity="0.9" />
      </>
    ),
    editorial_grid: (
      <>
        <rect x="4" y="5" width="20" height="4" rx="1" fill={INK} />
        <rect x="4" y="12" width="9" height="8" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="15" y="12" width="9" height="8" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="4" y="23" width="9" height="8" rx="1" fill={INK_SOFT} opacity="0.55" />
        <rect x="15" y="23" width="9" height="8" rx="1" fill={INK_SOFT} opacity="0.55" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 36"
      className="h-9 w-7 shrink-0 rounded-[3px] border border-ink-300 bg-white"
    >
      {parts[id]}
    </svg>
  )
}

/** Ikon penjajaran universal: tiga garisan rata kiri, tengah atau kanan. */
export function AlignGlyph({ id }: { id: TextAlignmentId }) {
  const x = (len: number): number =>
    id === 'left' ? 3 : id === 'right' ? 21 - len : (24 - len) / 2

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 text-ink-600">
      {[
        { y: 5, len: 18 },
        { y: 11, len: 12 },
        { y: 17, len: 16 },
      ].map(({ y, len }) => (
        <rect key={y} x={x(len)} y={y} width={len} height="2.5" rx="1.25" fill="currentColor" />
      ))}
    </svg>
  )
}

/* ----------------------------------------------------------- tipografi */

/**
 * Specimen "Ag" menggunakan font stack sistem yang menghampiri setiap kelas.
 * Pratonton jujur tanpa webfont — CSP `font-src 'self'` menghalang sebarang
 * fon luar, dan stack sistem sudah memadai untuk membezakan kelas huruf.
 */
const SPECIMEN_STYLES: Record<TypefaceId, React.CSSProperties> = {
  corporate_sans: { fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", fontWeight: 600 },
  bold_condensed: {
    fontFamily: "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif",
    fontWeight: 800,
    fontStretch: 'condensed',
    letterSpacing: '-0.02em',
  },
  elegant_serif: { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 500 },
  modern_geometric: {
    fontFamily: "'Century Gothic', Futura, 'Trebuchet MS', sans-serif",
    fontWeight: 700,
  },
  rounded_friendly: {
    fontFamily: "'Comic Sans MS', 'Trebuchet MS', Verdana, sans-serif",
    fontWeight: 700,
  },
  editorial: { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 600 },
  futuristic: {
    fontFamily: "'Cascadia Mono', 'JetBrains Mono', Consolas, monospace",
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
}

export function TypefaceSpecimen({ id }: { id: TypefaceId }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-white text-lg leading-none text-ink-800"
      style={SPECIMEN_STYLES[id]}
    >
      Ag
    </span>
  )
}

/* ---------------------------------------------------------------- gaya */

/**
 * Swatch poster mini 28 × 36 bagi setiap gaya utama — lakaran abstrak yang
 * deterministik, cukup untuk membezakan gaya pada imbasan pertama.
 */
export function StyleSwatch({ id }: { id: StyleId }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 36"
      className="h-9 w-7 shrink-0 overflow-hidden rounded-[3px] border border-ink-300"
    >
      {STYLE_ART[id]}
    </svg>
  )
}

const STYLE_ART: Record<StyleId, React.JSX.Element> = {
  corporate: (
    <>
      <rect width="28" height="36" fill="#F4F6FA" />
      <rect x="0" y="0" width="28" height="7" fill="#1F3A6E" />
      <rect x="4" y="12" width="20" height="3" rx="1" fill="#1F3A6E" />
      <rect x="4" y="18" width="14" height="2" rx="1" fill="#8A94A8" />
      <rect x="4" y="22" width="16" height="2" rx="1" fill="#8A94A8" />
      <rect x="4" y="30" width="8" height="2" rx="1" fill="#1F3A6E" />
    </>
  ),
  minimalist: (
    <>
      <rect width="28" height="36" fill="#FDFDFC" />
      <rect x="5" y="15" width="12" height="2.5" rx="1" fill="#2A2A2A" />
      <circle cx="21" cy="28" r="2" fill="#2A2A2A" />
    </>
  ),
  swiss: (
    <>
      <rect width="28" height="36" fill="#F2F0EA" />
      <rect x="3" y="4" width="12" height="9" fill="#E02020" />
      <rect x="3" y="17" width="18" height="2.5" fill="#111111" />
      <rect x="3" y="22" width="14" height="1.5" fill="#111111" />
      <rect x="3" y="25.5" width="14" height="1.5" fill="#111111" />
      <line x1="21" y1="2" x2="21" y2="34" stroke="#111111" strokeWidth="0.75" />
    </>
  ),
  modern: (
    <>
      <rect width="28" height="36" fill="#FFFFFF" />
      <circle cx="20" cy="9" r="6" fill="#2F6FED" />
      <rect x="4" y="20" width="13" height="3" rx="1" fill="#111827" />
      <rect x="4" y="26" width="10" height="2" rx="1" fill="#9AA3B2" />
      <path d="M0 36 L10 26 L16 36 Z" fill="#F59E0B" />
    </>
  ),
  editorial: (
    <>
      <rect width="28" height="36" fill="#FFFFFF" />
      <rect x="3" y="4" width="22" height="5" fill="#111111" />
      <line x1="3" y1="12" x2="25" y2="12" stroke="#111111" strokeWidth="0.75" />
      <rect x="3" y="15" width="10" height="17" fill="#D9D4C8" />
      <rect x="15" y="15" width="10" height="1.5" fill="#555555" />
      <rect x="15" y="18.5" width="10" height="1.5" fill="#555555" />
      <rect x="15" y="22" width="10" height="1.5" fill="#555555" />
      <rect x="15" y="25.5" width="7" height="1.5" fill="#555555" />
    </>
  ),
  vector_art: (
    <>
      <rect width="28" height="36" fill="#FFE8D6" />
      <circle cx="14" cy="13" r="7" fill="#FF7A45" />
      <path d="M0 36 L14 22 L28 36 Z" fill="#2A9D8F" />
      <circle cx="22" cy="6" r="2.5" fill="#264653" />
    </>
  ),
  premium: (
    <>
      <rect width="28" height="36" fill="#141414" />
      <rect x="4" y="4" width="20" height="28" fill="none" stroke="#C9A227" strokeWidth="1" />
      <rect x="8" y="15" width="12" height="2.5" fill="#C9A227" />
      <rect x="10" y="21" width="8" height="1.5" fill="#8A7222" />
    </>
  ),
  elegant: (
    <>
      <rect width="28" height="36" fill="#FAF6F0" />
      <path d="M6 8 Q14 2 22 8" fill="none" stroke="#A8894F" strokeWidth="1" />
      <rect x="7" y="16" width="14" height="2" rx="1" fill="#5C4A2E" />
      <rect x="9" y="21" width="10" height="1.5" rx="0.75" fill="#A8894F" />
      <path d="M6 28 Q14 34 22 28" fill="none" stroke="#A8894F" strokeWidth="1" />
    </>
  ),
  victorian: (
    <>
      <rect width="28" height="36" fill="#F3EAD8" />
      <rect x="3" y="3" width="22" height="30" fill="none" stroke="#6B4A2B" strokeWidth="1.5" />
      <rect x="6" y="6" width="16" height="24" fill="none" stroke="#6B4A2B" strokeWidth="0.6" />
      <circle cx="14" cy="12" r="2.5" fill="#6B4A2B" />
      <rect x="8" y="18" width="12" height="1.5" fill="#6B4A2B" />
      <rect x="10" y="22" width="8" height="1.2" fill="#6B4A2B" />
    </>
  ),
  bohemian: (
    <>
      <rect width="28" height="36" fill="#EFE3D0" />
      <circle cx="14" cy="12" r="6" fill="#C67B4B" opacity="0.85" />
      <circle cx="14" cy="12" r="3" fill="#EFE3D0" />
      <path d="M4 28 Q9 23 14 28 T24 28" fill="none" stroke="#7A6248" strokeWidth="1.2" />
      <path d="M4 32 Q9 27 14 32 T24 32" fill="none" stroke="#A98F6C" strokeWidth="1.2" />
    </>
  ),
  cinematic: (
    <>
      <rect width="28" height="36" fill="#0D0F14" />
      <rect x="0" y="0" width="28" height="5" fill="#000000" />
      <rect x="0" y="31" width="28" height="5" fill="#000000" />
      <circle cx="10" cy="18" r="7" fill="#E8B45A" opacity="0.5" />
      <rect x="4" y="24" width="12" height="2" fill="#E8E2D6" />
    </>
  ),
  futuristic: (
    <>
      <rect width="28" height="36" fill="#0A1030" />
      <path d="M0 30 L28 14" stroke="#3FE0F0" strokeWidth="1.2" />
      <path d="M0 34 L28 20" stroke="#7A5CFF" strokeWidth="1.2" />
      <circle cx="20" cy="9" r="3.5" fill="none" stroke="#3FE0F0" strokeWidth="1" />
      <rect x="4" y="6" width="8" height="2" fill="#E8F6FF" />
    </>
  ),
  cyberpunk: (
    <>
      <rect width="28" height="36" fill="#0B0416" />
      <rect x="3" y="20" width="4" height="12" fill="#1E0F3A" />
      <rect x="9" y="14" width="5" height="18" fill="#2A1650" />
      <rect x="16" y="18" width="4" height="14" fill="#1E0F3A" />
      <rect x="22" y="12" width="4" height="20" fill="#2A1650" />
      <rect x="9" y="14" width="5" height="2" fill="#FF2E9A" />
      <rect x="22" y="12" width="4" height="2" fill="#00E5FF" />
      <rect x="4" y="5" width="14" height="2.5" fill="#FF2E9A" />
    </>
  ),
  glassmorphism: (
    <>
      <defs>
        <linearGradient id="pp-glass-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7CA7F5" />
          <stop offset="1" stopColor="#C58BF2" />
        </linearGradient>
      </defs>
      <rect width="28" height="36" fill="url(#pp-glass-bg)" />
      <rect x="5" y="8" width="18" height="20" rx="3" fill="#FFFFFF" opacity="0.35" />
      <rect x="5" y="8" width="18" height="20" rx="3" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
      <rect x="8" y="13" width="12" height="2" rx="1" fill="#FFFFFF" opacity="0.9" />
      <rect x="8" y="18" width="8" height="1.5" rx="0.75" fill="#FFFFFF" opacity="0.7" />
    </>
  ),
  aurora: (
    <>
      <defs>
        <linearGradient id="pp-aurora-bg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#0E1B3A" />
          <stop offset="0.5" stopColor="#1E6E6E" />
          <stop offset="1" stopColor="#7BE0AD" />
        </linearGradient>
      </defs>
      <rect width="28" height="36" fill="url(#pp-aurora-bg)" />
      <path d="M0 26 Q8 18 14 24 T28 20" fill="none" stroke="#9FF5C8" strokeWidth="1.5" opacity="0.8" />
      <path d="M0 30 Q10 24 18 28 T28 26" fill="none" stroke="#6FD1F5" strokeWidth="1.2" opacity="0.6" />
    </>
  ),
  y2k: (
    <>
      <rect width="28" height="36" fill="#DCE9FA" />
      <circle cx="9" cy="11" r="5" fill="#B8C7DE" />
      <circle cx="7.5" cy="9.5" r="1.8" fill="#FFFFFF" />
      <circle cx="20" cy="24" r="6.5" fill="#C4B5F5" />
      <circle cx="18" cy="22" r="2.2" fill="#FFFFFF" opacity="0.9" />
      <path d="M2 32 L26 6" stroke="#FF7AC7" strokeWidth="1.2" />
    </>
  ),
  pixel_art: (
    <>
      <rect width="28" height="36" fill="#2B2B4A" />
      {[
        [8, 8], [12, 8], [16, 8],
        [8, 12], [16, 12],
        [4, 16], [8, 16], [12, 16], [16, 16], [20, 16],
        [4, 20], [20, 20],
        [8, 24], [16, 24],
      ].map(([px, py]) => (
        <rect key={`${px}-${py}`} x={px} y={py} width="4" height="4" fill="#7FE787" />
      ))}
    </>
  ),
  clay: (
    <>
      <rect width="28" height="36" fill="#FBEFE6" />
      <ellipse cx="14" cy="24" rx="9" ry="3" fill="#E3CDBC" />
      <circle cx="14" cy="15" r="7.5" fill="#F2A48C" />
      <circle cx="11.5" cy="12.5" r="2.4" fill="#FBD1BF" />
    </>
  ),
  maximalist: (
    <>
      <rect width="28" height="36" fill="#F5C400" />
      <circle cx="7" cy="8" r="5" fill="#E23A81" />
      <rect x="14" y="3" width="12" height="10" fill="#3A6FE2" />
      <path d="M0 36 L9 22 L18 36 Z" fill="#2AA05A" />
      <circle cx="21" cy="26" r="6" fill="#E2572A" />
      <rect x="3" y="17" width="10" height="3" fill="#171224" />
    </>
  ),
  pop_art: (
    <>
      <rect width="28" height="36" fill="#FFD400" />
      {[4, 10, 16, 22].flatMap((px) =>
        [4, 10, 16].map((py) => (
          <circle key={`${px}-${py}`} cx={px} cy={py} r="1.3" fill="#E02020" />
        )),
      )}
      <rect x="3" y="22" width="22" height="9" fill="#1B5FE0" />
      <rect x="6" y="25" width="12" height="3" fill="#FFFFFF" />
    </>
  ),
  collage_art: (
    <>
      <rect width="28" height="36" fill="#EDE6DA" />
      <rect x="3" y="5" width="12" height="14" fill="#C7B9A5" transform="rotate(-8 9 12)" />
      <rect x="13" y="12" width="12" height="12" fill="#8FA6B8" transform="rotate(6 19 18)" />
      <rect x="6" y="22" width="14" height="9" fill="#D98B7A" transform="rotate(-4 13 26)" />
      <line x1="4" y1="4" x2="24" y2="32" stroke="#171224" strokeWidth="0.7" strokeDasharray="2 2" />
    </>
  ),
  graffiti: (
    <>
      <rect width="28" height="36" fill="#4A4A52" />
      <path d="M3 24 Q9 12 15 20 T26 14" fill="none" stroke="#FF3D8A" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M5 30 Q12 24 20 28" fill="none" stroke="#3DE07C" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="22" cy="7" r="2" fill="#FFD400" />
    </>
  ),
  surrealism: (
    <>
      <rect width="28" height="36" fill="#B8D4E8" />
      <circle cx="9" cy="9" r="4" fill="#F5E9C8" />
      <path d="M4 30 Q14 24 24 30 L24 36 L4 36 Z" fill="#3E6E5A" />
      <path d="M14 30 L14 16 Q20 14 18 8" fill="none" stroke="#2E2E3E" strokeWidth="1.2" />
      <circle cx="18" cy="22" r="2.6" fill="#E06A4A" />
    </>
  ),
  handwritten: (
    <>
      <rect width="28" height="36" fill="#FFFDF6" />
      <path d="M4 12 Q8 8 12 12 T20 12" fill="none" stroke="#2E2E3E" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 20 Q10 17 15 20 T25 19" fill="none" stroke="#2E2E3E" strokeWidth="1" strokeLinecap="round" />
      <path d="M5 26 Q9 23 13 26" fill="none" stroke="#2E2E3E" strokeWidth="1" strokeLinecap="round" />
      <path d="M18 26 L21 29 L26 22" fill="none" stroke="#E06A4A" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  youth: (
    <>
      <rect width="28" height="36" fill="#2AB7CA" />
      <path d="M0 36 L28 22 L28 36 Z" fill="#FED766" />
      <circle cx="8" cy="9" r="4" fill="#FE4A49" />
      <rect x="15" y="6" width="9" height="3" rx="1.5" fill="#FFFFFF" transform="rotate(-6 19 7)" />
    </>
  ),
  islamic_geometric: (
    <>
      <rect width="28" height="36" fill="#0E3B2E" />
      <g fill="none" stroke="#C9A227" strokeWidth="0.9">
        <path d="M14 6 L21 12 L21 22 L14 28 L7 22 L7 12 Z" />
        <path d="M14 10 L18 13.5 L18 20.5 L14 24 L10 20.5 L10 13.5 Z" />
        <circle cx="14" cy="17" r="2.4" />
      </g>
    </>
  ),
  traditional_malay: (
    <>
      <rect width="28" height="36" fill="#3E1224" />
      <g fill="none" stroke="#D9A441" strokeWidth="1">
        <path d="M4 8 Q9 3 14 8 Q19 3 24 8" />
        <path d="M4 28 Q9 33 14 28 Q19 33 24 28" />
      </g>
      <path d="M14 13 L17 17 L14 23 L11 17 Z" fill="#D9A441" />
      <circle cx="14" cy="17.6" r="1.1" fill="#3E1224" />
    </>
  ),
  cultural: (
    <>
      <rect width="28" height="36" fill="#F2542D" />
      <path d="M0 24 Q7 18 14 24 T28 24 L28 36 L0 36 Z" fill="#127475" />
      <circle cx="9" cy="10" r="4.5" fill="#F5DFBB" />
      <circle cx="20" cy="13" r="3" fill="#FFC857" />
    </>
  ),
}
