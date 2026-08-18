import { describe, expect, it } from 'vitest'
import {
  normalizeColors,
  normalizeDimension,
  normalizeHex,
  normalizeProject,
  normalizeSingleLine,
  normalizeText,
} from './normalize'
import { makeProject, unicodeProject } from '@/tests/fixtures'

describe('normalizeText (§7.4)', () => {
  it('membuang ruang di awal dan akhir', () => {
    expect(normalizeText('   Majlis Perasmian   ')).toBe('Majlis Perasmian')
  })

  it('mengekalkan pecahan baris yang disengajakan', () => {
    expect(normalizeText('Baris satu\nBaris dua')).toBe('Baris satu\nBaris dua')
  })

  it('menghadkan kepada maksimum dua baris kosong berturutan', () => {
    expect(normalizeText('A\n\n\n\n\nB')).toBe('A\n\nB')
  })

  it('menyeragamkan CRLF kepada LF', () => {
    expect(normalizeText('A\r\nB')).toBe('A\nB')
  })
})

describe('normalizeSingleLine', () => {
  it('menukar pecahan baris kepada satu ruang', () => {
    expect(normalizeSingleLine('SELAMAT\n  MAJU   JAYA')).toBe('SELAMAT MAJU JAYA')
  })
})

describe('normalizeHex (§7.4)', () => {
  it('menukar kepada huruf besar', () => {
    expect(normalizeHex('#7a0026')).toBe('#7A0026')
  })

  it('menambah tanda pagar yang tertinggal', () => {
    expect(normalizeHex('c9a227')).toBe('#C9A227')
  })

  it('menolak nilai yang tidak sah tanpa meneka', () => {
    expect(normalizeHex('#12345')).toBeNull()
    expect(normalizeHex('merah')).toBeNull()
  })

  it('membuang warna berulang', () => {
    expect(normalizeColors(['#AABBCC', '#aabbcc', '#112233'])).toEqual(['#AABBCC', '#112233'])
  })
})

describe('normalizeDimension (§7.4)', () => {
  it('membundarkan kepada integer', () => {
    expect(normalizeDimension(1080.6)).toBe(1081)
  })

  it('mengapit kepada julat yang sah', () => {
    expect(normalizeDimension(10)).toBe(320)
    expect(normalizeDimension(99999)).toBe(8000)
  })
})

describe('normalizeProject', () => {
  it('tidak mengubah objek asal', () => {
    const project = makeProject({ content: { mainHeadline: '  TAJUK  ' } })
    normalizeProject(project)
    expect(project.content.mainHeadline).toBe('  TAJUK  ')
  })

  it('tidak mentafsir atau menukar format tarikh (§7.4)', () => {
    const project = makeProject({ content: { date: '6 HINGGA 15 OGOS 2026' } })
    expect(normalizeProject(project).content.date).toBe('6 HINGGA 15 OGOS 2026')
  })

  it('mengekalkan Unicode Arab dan Melayu (UAT-11)', () => {
    const normalized = normalizeProject(unicodeProject)
    expect(normalized.content.subHeadline).toBe('بسم الله الرحمن الرحيم')
    expect(normalized.content.programName).toBe('Tazkirah Maulidur Rasul ﷺ')
  })
})
