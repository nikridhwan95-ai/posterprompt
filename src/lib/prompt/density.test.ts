import { describe, expect, it } from 'vitest'
import { bandFor, scoreContentDensity } from './density'
import { denseProject, makeProject, minimalProject } from '@/tests/fixtures'

describe('bandFor (§7.5)', () => {
  it('memetakan sempadan band dengan tepat', () => {
    expect(bandFor(0)).toBe('rendah')
    expect(bandFor(34)).toBe('rendah')
    expect(bandFor(35)).toBe('sesuai')
    expect(bandFor(64)).toBe('sesuai')
    expect(bandFor(65)).toBe('padat')
    expect(bandFor(79)).toBe('padat')
    expect(bandFor(80)).toBe('terlalu_padat')
    expect(bandFor(100)).toBe('terlalu_padat')
  })
})

describe('scoreContentDensity (§7.5)', () => {
  it('mengira formula SDD secara tepat', () => {
    // 1 blok teks 450 aksara, tiada zon, tiada subjek:
    // min(450/450,1)*45 + min(1/8,1)*25 + 0 + 0 = 45 + 3.125 = 48.125 -> 48
    const project = makeProject({
      content: { mainHeadline: 'A'.repeat(120), subHeadline: 'B'.repeat(330) },
      layout: { logoZone: 'none', qrZone: 'none', assetZones: [] },
    })
    const result = scoreContentDensity(project)
    expect(result.totalCharacters).toBe(450)
    expect(result.textBlocks).toBe(2)
    // 45 + min(2/8,1)*25 = 45 + 6.25 = 51.25 -> 51
    expect(result.score).toBe(51)
  })

  it('memberi skor rendah bagi input minimum', () => {
    const result = scoreContentDensity(minimalProject)
    expect(result.band).toBe('rendah')
    expect(result.score).toBeLessThan(35)
  })

  it('memberi skor terlalu padat bagi input padat', () => {
    const result = scoreContentDensity(denseProject)
    expect(result.band).toBe('terlalu_padat')
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('tidak mengira subjek apabila jenis subjek "tiada"', () => {
    const project = makeProject({
      content: { mainHeadline: 'TAJUK' },
      subject: { subjectType: 'none', subjectCount: 4 },
    })
    expect(scoreContentDensity(project).subjectCount).toBe(0)
  })

  it('mengira zon logo, QR dan zon aset sebagai satu kiraan', () => {
    const project = makeProject({
      content: { mainHeadline: 'TAJUK' },
      layout: { logoZone: 'top', qrZone: 'bottom_right', assetZones: ['sponsor', 'footer'] },
    })
    expect(scoreContentDensity(project).assetZones).toBe(4)
  })

  it('menghadkan setiap komponen pada berat maksimumnya', () => {
    const project = makeProject({
      content: { mainHeadline: 'A'.repeat(120), subHeadline: 'B'.repeat(500) },
      layout: { logoZone: 'top', qrZone: 'footer', assetZones: ['sponsor', 'cta', 'footer'] },
      subject: { subjectType: 'group', subjectCount: 10 },
    })
    // Semua komponen tepu kecuali blok teks: 45 + min(2/8,1)*25 + 15 + 15 = 81.25 -> 81
    expect(scoreContentDensity(project).score).toBe(81)
  })
})
