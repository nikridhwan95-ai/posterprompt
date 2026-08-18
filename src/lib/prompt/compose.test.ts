import { describe, expect, it } from 'vitest'
import { ValidationError, generatePrompt } from './compose'
import { SECTION_ORDER } from './types'
import {
  appendixBProject,
  categoryFixtures,
  denseProject,
  makeProject,
  maximalProject,
  minimalProject,
  platformFixtures,
  typicalProject,
  unicodeProject,
} from '@/tests/fixtures'
import { CATEGORIES } from '@/data/categories'
import { PLATFORMS } from '@/data/platforms'
import { TEMPLATE_VERSION, SCHEMA_VERSION } from '@/data/version'

describe('generatePrompt — determinisme (NFR-008)', () => {
  it('menghasilkan output yang sama bagi input yang sama', () => {
    const first = generatePrompt(appendixBProject)
    const second = generatePrompt(appendixBProject)
    expect(second).toEqual(first)
  })

  it('tidak mengubah objek projek yang dihantar', () => {
    const project = makeProject({
      content: {
        mainHeadline: '  TAJUK UJIAN  ',
        programName: 'Program Ujian',
        date: '1 Mac 2026',
      },
    })
    generatePrompt(project)
    expect(project.content.mainHeadline).toBe('  TAJUK UJIAN  ')
  })
})

describe('generatePrompt — struktur prompt (§7.1)', () => {
  it('menghasilkan bahagian mengikut susunan SDD', () => {
    const output = generatePrompt(appendixBProject)
    const keys = output.sections.map((section) => section.section)
    const indices = keys.map((key) => SECTION_ORDER.indexOf(key))
    const sorted = [...indices].sort((a, b) => a - b)
    expect(indices).toEqual(sorted)
  })

  it('mengandungi sepuluh bahagian teras bagi projek lengkap', () => {
    const output = generatePrompt(appendixBProject)
    const keys = output.sections.map((section) => section.section)
    for (const key of [
      'DESIGN TASK',
      'CANVAS',
      'VISUAL DIRECTION',
      'COMPOSITION',
      'SUBJECT',
      'TYPOGRAPHY',
      'EXACT COPY',
      'CONSTRAINTS',
      'QUALITY',
      'MODEL NOTES',
    ]) {
      expect(keys).toContain(key)
    }
  })

  it('merekod versi skema, templat dan adapter (FR-022, QA-06)', () => {
    const output = generatePrompt(appendixBProject)
    expect(output.schemaVersion).toBe(SCHEMA_VERSION)
    expect(output.templateVersion).toBe(TEMPLATE_VERSION)
    expect(output.adapterVersion).toBe('1.0.0')
  })

  it('meninggalkan bahagian SUBJECT apabila tiada subjek dipilih', () => {
    const output = generatePrompt(minimalProject)
    const keys = output.sections.map((section) => section.section)
    expect(keys).not.toContain('SUBJECT')
  })
})

describe('generatePrompt — teks tepat (FR-003, QA-02, QA-07)', () => {
  it('memelihara setiap teks pengguna aksara demi aksara', () => {
    const output = generatePrompt(appendixBProject)
    for (const line of output.exactCopy) {
      expect(output.mainPrompt).toContain(line.value)
    }
    expect(output.exactCopy.map((line) => line.value)).toEqual([
      'SELAMAT MAJU JAYA',
      'CIK NICK EZZANNY',
      'FELO KOLEJ TAN SRI AISHAH GHANI',
      'KEJOHANAN SUKAN STAF ANTARA UNIVERSITI MALAYSIA (SUKUM) KE-46 TAHUN 2026',
      'UNISZA, KUALA TERENGGANU',
      '6 HINGGA 15 OGOS 2026',
    ])
  })

  it('memelihara Unicode Arab dan Melayu (UAT-11)', () => {
    const output = generatePrompt(unicodeProject)
    expect(output.exactCopyText).toContain('بسم الله الرحمن الرحيم')
    expect(output.exactCopyText).toContain('Tazkirah Maulidur Rasul ﷺ')
    expect(output.mainPrompt).toContain('بسم الله الرحمن الرحيم')
  })

  it('setiap teks tepat muncul tepat sekali dalam prompt (QA-02)', () => {
    const output = generatePrompt(typicalProject)
    const qa02 = output.audit.find((check) => check.id === 'QA-02')
    expect(qa02?.passed).toBe(true)
  })

  it('memberi amaran, bukan membuang senyap, bagi medan yang tidak digunakan kategori', () => {
    const project = makeProject({
      category: 'general_event',
      content: {
        mainHeadline: 'HARI TERBUKA',
        programName: 'Hari Terbuka',
        date: '1 Mac 2026',
        achievement: 'Teks yang tidak berkaitan kategori ini',
      },
    })
    const output = generatePrompt(project)
    expect(output.warnings.some((warning) => warning.id === 'unused-achievement')).toBe(true)
    expect(output.exactCopy.some((line) => line.field === 'achievement')).toBe(false)
  })
})

describe('generatePrompt — validasi (§10.2)', () => {
  it('menolak projek tanpa tajuk utama', () => {
    const project = makeProject({ content: { mainHeadline: '' } })
    expect(() => generatePrompt(project)).toThrow(ValidationError)
  })

  it('menolak dimensi tersuai di luar julat (UAT-03)', () => {
    const project = makeProject({
      content: { mainHeadline: 'TAJUK', programName: 'Program', date: '1 Mac' },
      canvas: { preset: 'custom', width: 100, height: 50 },
    })
    try {
      generatePrompt(project)
      expect.unreachable('sepatutnya melontar ValidationError')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
      const issues = (error as ValidationError).issues
      expect(issues.some((issue) => issue.path === 'canvas.width')).toBe(true)
      expect(issues.some((issue) => issue.path === 'canvas.height')).toBe(true)
    }
  })

  it('menolak medan wajib kategori yang kosong (UAT-02)', () => {
    const project = makeProject({
      category: 'ucapan_tahniah',
      content: { mainHeadline: 'TAHNIAH' },
    })
    try {
      generatePrompt(project)
      expect.unreachable('sepatutnya melontar ValidationError')
    } catch (error) {
      const issues = (error as ValidationError).issues
      expect(issues.some((issue) => issue.path === 'content.personName')).toBe(true)
      expect(issues.some((issue) => issue.path === 'content.achievement')).toBe(true)
    }
  })
})

describe('generatePrompt — fixtures regression (§12.3)', () => {
  it.each(CATEGORIES.map((category) => category.id))(
    'menjana output lengkap bagi kategori %s',
    (categoryId) => {
      const output = generatePrompt(categoryFixtures[categoryId])
      expect(output.mainPrompt.length).toBeGreaterThan(80)
      expect(output.negativePrompt.length).toBeGreaterThan(0)
      expect(output.layoutNotes.length).toBeGreaterThan(0)
      expect(output.exactCopy.length).toBeGreaterThan(0)
    },
  )

  it.each(PLATFORMS.map((platform) => platform.id))(
    'menjana output lengkap bagi adapter %s',
    (platformId) => {
      const output = generatePrompt(platformFixtures[platformId])
      expect(output.platformId).toBe(platformId)
      expect(output.mainPrompt.length).toBeGreaterThan(50)
      expect(output.adapterVersion).toBeTruthy()
    },
  )

  it.each([
    ['minimum', minimalProject],
    ['biasa', typicalProject],
    ['padat', denseProject],
    ['maksimum', maximalProject],
  ])('menjana output bagi input %s', (_label, project) => {
    const output = generatePrompt(project)
    expect(output.mainPrompt.length).toBeGreaterThan(50)
  })
})

describe('generatePrompt — amaran kualiti (FR-017)', () => {
  it('memberi amaran ketumpatan tanpa mengubah teks (UAT-04)', () => {
    const output = generatePrompt(denseProject)
    expect(output.density.band).toBe('terlalu_padat')
    expect(output.warnings.some((warning) => warning.id === 'density')).toBe(true)
    expect(output.exactCopy.find((line) => line.field === 'mainHeadline')?.value).toBe(
      denseProject.content.mainHeadline,
    )
  })

  it('memberi amaran tajuk panjang selepas 80 aksara', () => {
    const project = makeProject({
      content: { mainHeadline: 'A'.repeat(90), programName: 'Program', date: '1 Mac' },
    })
    const output = generatePrompt(project)
    expect(output.warnings.some((warning) => warning.id === 'headline-length')).toBe(true)
  })

  it('lulus semua semakan audit bagi projek yang kemas', () => {
    const output = generatePrompt(appendixBProject)
    const failed = output.audit.filter((check) => !check.passed)
    expect(failed).toEqual([])
  })
})
