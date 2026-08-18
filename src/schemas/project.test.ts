import { describe, expect, it } from 'vitest'
import {
  MAX_BLOCK_LENGTH,
  STEP_FIELDS,
  STEP_IDS,
  canvasMeta,
  countZones,
  defaultProject,
  posterProjectSchema,
  stepForField,
} from './project'
import { CATEGORIES, requiredFieldsFor } from '@/data/categories'
import { makeProject, maximalProject } from '@/tests/fixtures'

function issuesFor(project: unknown): string[] {
  const result = posterProjectSchema.safeParse(project)
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('nilai lalai (Lampiran A)', () => {
  it('sepadan dengan default yang disenaraikan dalam SDD', () => {
    const project = defaultProject()
    expect(project.category).toBe('general_event')
    expect(project.language).toBe('ms')
    expect(project.canvas.preset).toBe('ig_portrait')
    expect(project.canvas.width).toBe(1080)
    expect(project.canvas.height).toBe(1350)
    expect(project.style.stylePreset).toBe('corporate')
    expect(project.style.mood).toBe('formal')
    expect(project.style.palettePreset).toBe('maroon_gold')
    expect(project.layout.composition).toBe('centered')
    expect(project.layout.textAlignment).toBe('center')
    expect(project.layout.logoZone).toBe('top')
    expect(project.layout.qrZone).toBe('none')
    expect(project.subject.subjectType).toBe('none')
    expect(project.subject.subjectCount).toBe(0)
    expect(project.subject.crop).toBe('half_body')
    expect(project.subject.feathering).toBe('subtle')
    expect(project.subject.preserveFace).toBe(true)
    expect(project.subject.preserveClothing).toBe(true)
    expect(project.typography.titleTypeface).toBe('bold_condensed')
    expect(project.typography.bodyTypeface).toBe('corporate_sans')
    expect(project.platform.targetPlatform).toBe('universal')
    expect(project.platform.promptLanguage).toBe('en')
    expect(project.preferences.saveDraft).toBe(false)
    expect(project.schemaVersion).toBe('1.0')
  })
})

describe('validasi medan (§10.1)', () => {
  it('menolak tajuk kurang daripada tiga aksara', () => {
    expect(issuesFor(makeProject({ content: { mainHeadline: 'AB' } }))).toContain(
      'content.mainHeadline',
    )
  })

  it('menolak tajuk yang hanya mengandungi ruang kosong', () => {
    expect(issuesFor(makeProject({ content: { mainHeadline: '     ' } }))).toContain(
      'content.mainHeadline',
    )
    expect(issuesFor(makeProject({ content: { mainHeadline: '\n\t  ' } }))).toContain(
      'content.mainHeadline',
    )
  })

  it('menolak tajuk melebihi 120 aksara', () => {
    expect(issuesFor(makeProject({ content: { mainHeadline: 'A'.repeat(121) } }))).toContain(
      'content.mainHeadline',
    )
  })

  it('menerima tajuk tepat pada had 120 aksara', () => {
    const project = makeProject({
      content: { mainHeadline: 'A'.repeat(120), programName: 'Program', date: '1 Mac' },
    })
    expect(issuesFor(project)).not.toContain('content.mainHeadline')
  })

  it('menolak blok teks melebihi 500 aksara', () => {
    const project = makeProject({
      content: {
        mainHeadline: 'TAJUK',
        programName: 'Program',
        date: '1 Mac',
        subHeadline: 'A'.repeat(MAX_BLOCK_LENGTH + 1),
      },
    })
    expect(issuesFor(project)).toContain('content.subHeadline')
  })

  it('menolak dimensi di luar julat 320-8000', () => {
    expect(issuesFor(makeProject({ canvas: { width: 319, height: 1350 } }))).toContain(
      'canvas.width',
    )
    expect(issuesFor(makeProject({ canvas: { width: 1080, height: 8001 } }))).toContain(
      'canvas.height',
    )
  })

  it('menolak dimensi bukan integer', () => {
    expect(issuesFor(makeProject({ canvas: { width: 1080.5, height: 1350 } }))).toContain(
      'canvas.width',
    )
  })

  it('menolak warna HEX yang tidak sah', () => {
    expect(
      issuesFor(makeProject({ style: { palettePreset: 'custom', customColors: ['merah'] } })),
    ).toContain('style.customColors.0')
  })

  it('menolak lebih daripada empat warna tersuai', () => {
    const project = makeProject({
      style: {
        palettePreset: 'custom',
        customColors: ['#111111', '#222222', '#333333', '#444444', '#555555'],
      },
    })
    expect(issuesFor(project)).toContain('style.customColors')
  })

  it('menolak palet tersuai tanpa sebarang warna', () => {
    expect(
      issuesFor(makeProject({ style: { palettePreset: 'custom', customColors: [] } })),
    ).toContain('style.customColors')
  })

  it('menolak bilangan subjek melebihi sepuluh', () => {
    const project = makeProject({ subject: { subjectType: 'group', subjectCount: 11 } })
    expect(issuesFor(project)).toContain('subject.subjectCount')
  })

  it('mewajibkan bilangan subjek apabila jenis subjek dipilih', () => {
    const project = makeProject({ subject: { subjectType: 'person', subjectCount: 0 } })
    expect(issuesFor(project)).toContain('subject.subjectCount')
  })

  it('menolak lebih daripada lima zon aset', () => {
    const project = makeProject({
      layout: {
        logoZone: 'top',
        qrZone: 'bottom_right',
        assetZones: ['sponsor', 'cta', 'footer', 'whitespace'],
      },
    })
    expect(issuesFor(project)).toContain('layout.assetZones')
  })

  it('menolak arahan tersuai melebihi 1000 aksara', () => {
    const project = makeProject({ platform: { customInstructions: 'X'.repeat(1001) } })
    expect(issuesFor(project)).toContain('platform.customInstructions')
  })

  it('menerima input pada had maksimum yang dibenarkan', () => {
    expect(issuesFor(maximalProject)).toEqual([])
  })
})

describe('medan wajib bersyarat mengikut kategori (FR-004)', () => {
  it.each(CATEGORIES.map((category) => [category.id, category] as const))(
    'kategori %s mewajibkan medannya sendiri',
    (_id, category) => {
      const project = makeProject({ category: category.id, content: { mainHeadline: 'TAJUK' } })
      const issues = issuesFor(project)
      for (const field of requiredFieldsFor(category)) {
        if (field === 'mainHeadline') continue
        expect(issues).toContain(`content.${field}`)
      }
    },
  )

  it('menerima projek apabila semua medan wajib kategori diisi', () => {
    for (const category of CATEGORIES) {
      const content: Record<string, string> = { mainHeadline: 'TAJUK UJIAN' }
      for (const field of category.requiredFields) content[field] = 'Nilai'
      const project = makeProject({ category: category.id, content })
      expect(issuesFor(project)).toEqual([])
    }
  })
})

describe('pembantu langkah wizard', () => {
  it('meliputi lima langkah', () => {
    expect(STEP_IDS).toHaveLength(5)
    expect(Object.keys(STEP_FIELDS)).toHaveLength(5)
  })

  it('memetakan setiap medan kembali kepada langkahnya (FR-019)', () => {
    expect(stepForField('content.mainHeadline')).toBe('kandungan')
    expect(stepForField('category')).toBe('kandungan')
    expect(stepForField('canvas.width')).toBe('kanvas')
    expect(stepForField('style.palettePreset')).toBe('gaya')
    expect(stepForField('typography.titleTypeface')).toBe('gaya')
    expect(stepForField('layout.qrZone')).toBe('susun_atur')
    expect(stepForField('subject.subjectCount')).toBe('susun_atur')
    expect(stepForField('platform.targetPlatform')).toBe('platform')
  })
})

describe('metadata kanvas', () => {
  it('menggunakan nisbah rasmi preset', () => {
    expect(canvasMeta(defaultProject().canvas).ratio).toBe('4:5')
  })

  it('mengira nisbah bagi dimensi tersuai', () => {
    const meta = canvasMeta({ preset: 'custom', width: 1600, height: 900, destination: '' })
    expect(meta.ratio).toBe('16:9')
    expect(meta.orientation).toBe('landscape')
  })

  it('mengira zon aktif', () => {
    expect(
      countZones({ logoZone: 'top', qrZone: 'bottom_right', assetZones: ['sponsor'] }),
    ).toBe(3)
    expect(countZones({ logoZone: 'none', qrZone: 'none', assetZones: [] })).toBe(0)
  })
})
