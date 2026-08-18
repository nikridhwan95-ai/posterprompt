/**
 * Simpanan draf tempatan — SDD §8.3, §8.4, §8.5 dan FR-020/FR-021.
 *
 * Prinsip privasi (§11.1): tiada apa-apa ditulis sehingga pengguna memberi
 * persetujuan, dan pilihan itu boleh ditarik balik pada bila-bila masa.
 * Semua operasi dibungkus try/catch kerana localStorage boleh melontar ralat
 * dalam mod peribadi atau apabila kuota penuh.
 */
import { SCHEMA_VERSION } from '@/data/version'
import {
  defaultProject,
  posterProjectSchema,
  type PosterProject,
  type StepId,
} from '@/schemas/project'

export const STORAGE_KEYS = {
  draft: 'posterprompt:draft:v1',
  consent: 'posterprompt:consent:v1',
  ui: 'posterprompt:ui:v1',
} as const

export const DRAFT_DEBOUNCE_MS = 500

export interface UiState {
  readonly lastStep?: StepId
  readonly summaryOpen?: boolean
}

export type DraftLoadResult =
  | { status: 'none' }
  /** Draf sah dan sepadan dengan versi skema semasa. */
  | { status: 'ok'; project: PosterProject }
  /** Draf berjaya dimigrasi daripada versi lama. */
  | { status: 'migrated'; project: PosterProject; from: string }
  /**
   * Draf wujud tetapi tidak boleh dimigrasi dengan selamat. Kandungan mentah
   * dikembalikan supaya pengguna boleh memuat turunnya sebelum memadam (§8.5).
   */
  | { status: 'incompatible'; raw: string; from: string }

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* tiada tindakan — ketiadaan storan tidak boleh merosakkan aplikasi */
  }
}

/* ------------------------------------------------------------- consent */

export function readConsent(): boolean {
  return safeGet(STORAGE_KEYS.consent) === 'true'
}

export function writeConsent(value: boolean): void {
  if (value) {
    safeSet(STORAGE_KEYS.consent, 'true')
  } else {
    // Menarik balik persetujuan turut memadam draf yang telah disimpan.
    safeRemove(STORAGE_KEYS.consent)
    safeRemove(STORAGE_KEYS.draft)
  }
}

/* --------------------------------------------------------------- draf */

export function saveDraft(project: PosterProject): boolean {
  if (!readConsent()) return false
  return safeSet(STORAGE_KEYS.draft, JSON.stringify(project))
}

/**
 * Migrasi skema yang diketahui (§8.5). Setiap kekunci ialah versi sumber.
 * Kosong pada V1 kerana belum ada versi terdahulu; struktur ini wujud supaya
 * keluaran akan datang tidak perlu mengubah pemanggil.
 */
const MIGRATIONS: Record<string, (raw: Record<string, unknown>) => Record<string, unknown>> = {}

export function loadDraft(): DraftLoadResult {
  const raw = safeGet(STORAGE_KEYS.draft)
  if (!raw) return { status: 'none' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { status: 'incompatible', raw, from: 'tidak diketahui' }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { status: 'incompatible', raw, from: 'tidak diketahui' }
  }

  const record = parsed as Record<string, unknown>
  const version = typeof record.schemaVersion === 'string' ? record.schemaVersion : 'tidak diketahui'

  let candidate = record
  let migrated = false

  if (version !== SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version]
    if (!migrate) {
      return { status: 'incompatible', raw, from: version }
    }
    candidate = migrate(record)
    migrated = true
  }

  const result = posterProjectSchema.safeParse(candidate)
  if (!result.success) {
    // Draf separuh siap adalah normal: pengguna mungkin menyimpan sebelum
    // melengkapkan medan wajib. Ia dipulihkan sebagai draf biasa selagi
    // bentuknya betul; validasi penuh berlaku semasa penjanaan.
    if (looksLikeProject(candidate)) {
      const project = withDefaults(candidate)
      return migrated
        ? { status: 'migrated', project, from: version }
        : { status: 'ok', project }
    }
    return { status: 'incompatible', raw, from: version }
  }

  return migrated
    ? { status: 'migrated', project: result.data as PosterProject, from: version }
    : { status: 'ok', project: result.data as PosterProject }
}

function isSection(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Isi bahagian yang hilang daripada draf separuh siap dengan nilai lalai.
 *
 * Draf yang lulus `looksLikeProject` boleh tetap kehilangan keseluruhan
 * bahagian seperti `style` atau `subject`. Borang dan ringkasan projek membaca
 * bahagian itu secara langsung, jadi memulihkannya tanpa lalai akan
 * meruntuhkan wizard sebaik ia dipapar. Nilai pengguna sentiasa mengatasi
 * nilai lalai; tiada apa-apa yang ditulis semula.
 */
function withDefaults(candidate: Record<string, unknown>): PosterProject {
  const base = defaultProject() as unknown as Record<string, unknown>
  const merged: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(candidate)) {
    const fallback = base[key]
    merged[key] = isSection(fallback) && isSection(value) ? { ...fallback, ...value } : value
  }
  return merged as unknown as PosterProject
}

/** Semakan bentuk minimum sebelum draf separuh siap dipulihkan. */
function looksLikeProject(value: Record<string, unknown>): boolean {
  return (
    value.schemaVersion === SCHEMA_VERSION &&
    typeof value.category === 'string' &&
    typeof value.content === 'object' &&
    value.content !== null &&
    typeof value.canvas === 'object' &&
    value.canvas !== null
  )
}

export function clearDraft(): void {
  safeRemove(STORAGE_KEYS.draft)
}

/** Padam semua data PosterPrompt daripada pelayar (halaman privasi, FR-021). */
export function clearAllStorage(): void {
  safeRemove(STORAGE_KEYS.draft)
  safeRemove(STORAGE_KEYS.consent)
  safeRemove(STORAGE_KEYS.ui)
}

export function hasStoredDraft(): boolean {
  return safeGet(STORAGE_KEYS.draft) !== null
}

/* ----------------------------------------------------------- keadaan UI */

export function readUiState(): UiState {
  const raw = safeGet(STORAGE_KEYS.ui)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as UiState) : {}
  } catch {
    return {}
  }
}

export function writeUiState(state: UiState): void {
  safeSet(STORAGE_KEYS.ui, JSON.stringify(state))
}

/* ---------------------------------------------------------- debounce */

/**
 * Penyimpan tertunda 500 ms (§8.4). Memulangkan fungsi simpan dan fungsi
 * pembatal untuk dipanggil semasa komponen dilupuskan.
 */
export function createDebouncedSaver(delayMs = DRAFT_DEBOUNCE_MS) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const save = (project: PosterProject, onSaved?: (written: boolean) => void) => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      const written = saveDraft(project)
      onSaved?.(written)
    }, delayMs)
  }

  const cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  const flush = (project: PosterProject) => {
    cancel()
    saveDraft(project)
  }

  return { save, cancel, flush }
}

/** Teks draf untuk dimuat turun apabila migrasi tidak selamat (§8.5). */
export function draftAsDownloadableText(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}
