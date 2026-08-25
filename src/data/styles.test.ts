import { describe, expect, it } from 'vitest'
import { STYLES, STYLE_GROUPS, STYLE_IDS, styleGroupLabel, type StyleId } from './styles'

/**
 * Gaya yang mesti ada dalam katalog. Senarai ini ialah kontrak dengan langkah
 * Gaya: menanggalkan mana-mana daripadanya mengubah pilihan yang pernah
 * disimpan dalam draf pengguna, jadi ia memerlukan laluan migrasi.
 */
const REQUIRED_STYLES: readonly StyleId[] = [
  'minimalist',
  'maximalist',
  'futuristic',
  'vector_art',
  'collage_art',
  'cyberpunk',
  'pop_art',
  'glassmorphism',
  'clay',
  'pixel_art',
  'editorial',
  'y2k',
  'swiss',
  'surrealism',
  'bohemian',
  'victorian',
  'graffiti',
  'aurora',
  'handwritten',
]

describe('katalog gaya (§6.3)', () => {
  it('mengandungi setiap gaya yang disokong', () => {
    for (const id of REQUIRED_STYLES) {
      expect(STYLE_IDS).toContain(id)
    }
  })

  it('tidak mempunyai id berganda', () => {
    expect(new Set(STYLE_IDS).size).toBe(STYLES.length)
  })

  it('membawa label, petunjuk dan deskriptor prompt dalam kedua-dua bahasa', () => {
    for (const style of STYLES) {
      for (const text of [style.label, style.hint, style.prompt]) {
        expect(text?.ms.trim().length, `${style.id} (ms)`).toBeGreaterThan(0)
        expect(text?.en.trim().length, `${style.id} (en)`).toBeGreaterThan(0)
      }
    }
  })

  it('menamakan gaya dalam deskriptor prompt supaya arahan tidak samar', () => {
    for (const style of STYLES) {
      // Deskriptor ialah frasa yang disisip terus ke VISUAL DIRECTION; ia mesti
      // menerangkan gaya, bukan sekadar menyebut satu perkataan.
      expect(style.prompt.ms.split(' ').length, style.id).toBeGreaterThan(3)
      expect(style.prompt.en.split(' ').length, style.id).toBeGreaterThan(3)
    }
  })

  it('meletakkan setiap gaya dalam kumpulan paparan yang diisytiharkan', () => {
    const groupIds = STYLE_GROUPS.map((group) => group.id)
    for (const style of STYLES) {
      expect(groupIds, style.id).toContain(style.group)
    }
  })

  it('tidak meninggalkan kumpulan kosong dalam wizard', () => {
    for (const group of STYLE_GROUPS) {
      expect(STYLES.some((style) => style.group === group.id), group.id).toBe(true)
    }
  })

  it('menyusun katalog mengikut kumpulan supaya turutan wizard kekal koheren', () => {
    const order = STYLE_GROUPS.map((group) => group.id)
    const seen = STYLES.map((style) => order.indexOf(style.group))
    expect(seen).toEqual([...seen].sort((a, b) => a - b))
  })

  it('tidak menandakan gaya yang sama sebagai minimalis dan berhias', () => {
    // Kedua-dua bendera memandu peraturan yang bercanggah: §10.3 mengamarkan
    // gaya minimalis yang padat, §7.7 menggugurkan larangan hiasan.
    for (const style of STYLES) {
      expect(style.minimal && style.ornamental, style.id).toBe(false)
    }
  })

  it('memulangkan label kumpulan dwibahasa', () => {
    expect(styleGroupLabel('digital').ms).toBe('Digital dan futuristik')
    expect(styleGroupLabel('digital').en).toBe('Digital and futuristic')
  })
})
