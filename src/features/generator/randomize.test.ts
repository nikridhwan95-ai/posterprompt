import { describe, expect, it } from 'vitest'
import { randomiseProject, unresolvedSamples, type Rng } from './randomize'
import { detectConflicts } from '@/lib/prompt/conflicts'
import { scoreContentDensity } from '@/lib/prompt/density'
import { posterProjectSchema } from '@/schemas/project'
import { effectiveColors } from '@/data/palettes'
import { STYLE_IDS } from '@/data/styles'
import { makeProject, typicalProject } from '@/tests/fixtures'

/** Rng deterministik: kitaran nilai tetap supaya ujian tidak berkelip. */
function seeded(values: readonly number[]): Rng {
  let index = 0
  return () => values[index++ % values.length]
}

/** Rng yang meliputi julat 0…1 supaya banyak kombinasi diuji. */
function sweep(step: number): Rng {
  let value = 0
  return () => {
    value = (value + step) % 1
    return value
  }
}

describe('kejutkan saya — teks contoh', () => {
  it('mengisi medan wajib yang kosong sahaja', () => {
    const empty = makeProject({
      category: 'general_event',
      content: { mainHeadline: '', programName: '', date: '' },
    })
    const { project, filled } = randomiseProject(empty, seeded([0.1, 0.4, 0.7]))

    // Acara umum mewajibkan tajuk utama, nama program dan tarikh.
    expect(Object.keys(filled).sort()).toEqual(['date', 'mainHeadline', 'programName'])
    expect(project.content.mainHeadline.length).toBeGreaterThan(0)
    expect(project.content.date.length).toBeGreaterThan(0)
  })

  it('tidak pernah menimpa teks yang sudah ditaip', () => {
    const partial = makeProject({
      category: 'general_event',
      content: { mainHeadline: 'TAJUK SAYA SENDIRI', programName: '', date: '' },
    })
    const { project, filled } = randomiseProject(partial, seeded([0.2, 0.5]))

    expect(project.content.mainHeadline).toBe('TAJUK SAYA SENDIRI')
    expect(filled.mainHeadline).toBeUndefined()
    expect(filled.programName).toBeDefined()
  })

  it('tidak mengisi medan yang tidak wajib bagi kategori itu', () => {
    const empty = makeProject({
      category: 'general_event',
      content: { mainHeadline: '', programName: '', date: '', venue: '', organizer: '' },
    })
    const { project, filled } = randomiseProject(empty, seeded([0.3]))

    // Tempat dan penganjur hanya pilihan bagi acara umum — biar pengguna isi.
    expect(filled.venue).toBeUndefined()
    expect(project.content.venue).toBe('')
    expect(project.content.organizer).toBe('')
  })

  it('tidak mengubah kanvas, kategori, bahasa atau platform', () => {
    const before = typicalProject
    const { project } = randomiseProject(before, seeded([0.15, 0.65, 0.85]))

    expect(project.canvas).toEqual(before.canvas)
    expect(project.category).toBe(before.category)
    expect(project.language).toBe(before.language)
    expect(project.platform).toEqual(before.platform)
  })

  it('menukar pilihan reka bentuk walaupun tiada medan kosong', () => {
    const complete = makeProject({
      ...typicalProject,
      style: { ...typicalProject.style, stylePreset: 'corporate', palettePreset: 'maroon_gold' },
    })
    // Rng yang menuding ke hujung senarai menjamin pilihan berbeza.
    const { project, filled } = randomiseProject(complete, seeded([0.95]))

    expect(Object.keys(filled)).toHaveLength(0)
    expect(project.style.stylePreset).not.toBe('corporate')
  })
})

describe('kejutkan saya — kejutan yang sah', () => {
  it('sentiasa menghasilkan projek yang lulus skema', () => {
    for (let step = 0.07; step < 1; step += 0.11) {
      const { project } = randomiseProject(typicalProject, sweep(step))
      const parsed = posterProjectSchema.safeParse(project)
      expect(parsed.success, `step ${step}`).toBe(true)
    }
  })

  it('memilih setiap id gaya daripada katalog sebenar', () => {
    for (let step = 0.03; step < 1; step += 0.07) {
      const { project } = randomiseProject(typicalProject, sweep(step))
      expect(STYLE_IDS).toContain(project.style.stylePreset)
    }
  })

  it('tidak mencipta konflik zon atau kontras dengan sendirinya', () => {
    for (let step = 0.05; step < 1; step += 0.06) {
      const { project } = randomiseProject(typicalProject, sweep(step))
      const colors = effectiveColors(project.style.palettePreset, project.style.customColors)
      const ids = detectConflicts(project, scoreContentDensity(project), colors).map((w) => w.id)

      // Konflik yang sepenuhnya di bawah kawalan penjana rawak ini.
      expect(ids, `step ${step}`).not.toContain('conflict-light-palette')
      expect(ids, `step ${step}`).not.toContain('conflict-composition-subject')
    }
  })

  it('menyelaraskan bilangan subjek dengan jenis subjek', () => {
    for (let step = 0.04; step < 1; step += 0.05) {
      const { project } = randomiseProject(typicalProject, sweep(step))
      if (project.subject.subjectType === 'none') {
        expect(project.subject.subjectCount).toBe(0)
      } else {
        expect(project.subject.subjectCount).toBeGreaterThan(0)
      }
    }
  })
})

describe('pengesanan teks contoh yang belum diganti', () => {
  it('menyenaraikan medan yang masih memegang teks contoh', () => {
    const empty = makeProject({ content: { mainHeadline: '', programName: '', date: '' } })
    const { project, filled } = randomiseProject(empty, seeded([0.25]))
    expect(unresolvedSamples(project, filled).length).toBeGreaterThan(0)
  })

  it('mengeluarkan medan sebaik pengguna menyuntingnya', () => {
    const empty = makeProject({ content: { mainHeadline: '', programName: '', date: '' } })
    const { project, filled } = randomiseProject(empty, seeded([0.25]))

    const edited = makeProject({
      ...project,
      content: { ...project.content, mainHeadline: 'TAJUK SEBENAR SAYA' },
    })
    expect(unresolvedSamples(edited, filled)).not.toContain('mainHeadline')
  })
})
