import { describe, expect, it } from 'vitest'
import { detectConflicts } from './conflicts'
import { scoreContentDensity } from './density'
import { effectiveColors } from '@/data/palettes'
import { denseProject, makeProject, minimalProject, typicalProject } from '@/tests/fixtures'
import type { PosterProject } from '@/schemas/project'

function conflictIds(project: PosterProject): string[] {
  const density = scoreContentDensity(project)
  const colors = effectiveColors(project.style.palettePreset, project.style.customColors)
  return detectConflicts(project, density, colors).map((warning) => warning.id)
}

describe('konflik reka bentuk (§10.3)', () => {
  it('mengesan gaya minimalis dengan terlalu banyak elemen', () => {
    const project = makeProject({
      ...denseProject,
      style: { ...denseProject.style, stylePreset: 'minimalist' },
    })
    expect(conflictIds(project)).toContain('conflict-minimalist-dense')
  })

  it('tidak menandakan gaya minimalis pada poster yang lapang', () => {
    const project = makeProject({
      ...minimalProject,
      style: { ...minimalProject.style, stylePreset: 'minimalist' },
      layout: { ...minimalProject.layout, logoZone: 'top', qrZone: 'none', assetZones: [] },
    })
    expect(conflictIds(project)).not.toContain('conflict-minimalist-dense')
  })

  it('mengesan subjek kanan bertindih dengan kod QR kanan', () => {
    const project = makeProject({
      ...typicalProject,
      subject: { ...typicalProject.subject, subjectType: 'person', subjectCount: 1, subjectPosition: 'right' },
      layout: { ...typicalProject.layout, qrZone: 'bottom_right' },
    })
    expect(conflictIds(project)).toContain('conflict-subject-qr-right')
  })

  it('tidak menandakan konflik apabila kod QR dipindahkan ke kiri', () => {
    const project = makeProject({
      ...typicalProject,
      subject: { ...typicalProject.subject, subjectType: 'person', subjectCount: 1, subjectPosition: 'right' },
      layout: { ...typicalProject.layout, qrZone: 'bottom_left' },
    })
    expect(conflictIds(project)).not.toContain('conflict-subject-qr-right')
  })

  it('mengesan palet cerah dengan kontras teks rendah', () => {
    const project = makeProject({
      ...typicalProject,
      style: { ...typicalProject.style, palettePreset: 'pastel_soft' },
      typography: { ...typicalProject.typography, textContrast: 'balanced' },
    })
    const warnings = detectConflicts(
      project,
      scoreContentDensity(project),
      effectiveColors(project.style.palettePreset, project.style.customColors),
    )
    const warning = warnings.find((w) => w.id === 'conflict-light-palette')
    expect(warning).toBeDefined()
    // Cadangan warna kontras disertakan supaya pengguna tahu tindakan seterusnya.
    expect(warning?.message).toMatch(/#[0-9A-F]{6}|kontras teks kepada tinggi/i)
  })

  it('tidak menandakan palet cerah apabila kontras sudah tinggi', () => {
    const project = makeProject({
      ...typicalProject,
      style: { ...typicalProject.style, palettePreset: 'pastel_soft' },
      typography: { ...typicalProject.typography, textContrast: 'high' },
    })
    expect(conflictIds(project)).not.toContain('conflict-light-palette')
  })

  it('mengesan teks panjang pada platform yang lemah menulis teks', () => {
    const project = makeProject({
      ...typicalProject,
      platform: { ...typicalProject.platform, targetPlatform: 'midjourney' },
    })
    expect(conflictIds(project)).toContain('conflict-long-text-platform')
  })

  it('tidak menandakan teks pendek pada Midjourney', () => {
    const project = makeProject({
      ...minimalProject,
      platform: { ...minimalProject.platform, targetPlatform: 'midjourney' },
    })
    expect(conflictIds(project)).not.toContain('conflict-long-text-platform')
  })

  it('mengesan komposisi yang bercanggah dengan kedudukan subjek', () => {
    const project = makeProject({
      ...typicalProject,
      layout: { ...typicalProject.layout, composition: 'subject_right' },
      subject: {
        ...typicalProject.subject,
        subjectType: 'person',
        subjectCount: 1,
        subjectPosition: 'left',
      },
    })
    expect(conflictIds(project)).toContain('conflict-composition-subject')
  })

  it('tidak menandakan konflik apabila komposisi dan subjek selaras', () => {
    const project = makeProject({
      ...typicalProject,
      layout: { ...typicalProject.layout, composition: 'subject_right' },
      subject: {
        ...typicalProject.subject,
        subjectType: 'person',
        subjectCount: 1,
        subjectPosition: 'center_right',
      },
    })
    expect(conflictIds(project)).not.toContain('conflict-composition-subject')
  })

  it('tidak menandakan konflik bagi komposisi tanpa sisi tersirat', () => {
    const project = makeProject({
      ...typicalProject,
      layout: { ...typicalProject.layout, composition: 'centered' },
      subject: {
        ...typicalProject.subject,
        subjectType: 'person',
        subjectCount: 1,
        subjectPosition: 'left',
      },
    })
    expect(conflictIds(project)).not.toContain('conflict-composition-subject')
  })

  it('mengesan logo atas berkongsi ruang dengan tajuk', () => {
    const project = makeProject({
      ...typicalProject,
      layout: { ...typicalProject.layout, logoZone: 'top' },
    })
    expect(conflictIds(project)).toContain('conflict-logo-headline')
  })

  it('konflik tidak menyekat penjanaan — semuanya amaran atau info (§10.2)', () => {
    const project = makeProject({
      ...denseProject,
      style: { ...denseProject.style, stylePreset: 'minimalist' },
    })
    const warnings = detectConflicts(
      project,
      scoreContentDensity(project),
      effectiveColors(project.style.palettePreset, project.style.customColors),
    )
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings.every((w) => w.severity !== 'ralat')).toBe(true)
  })
})
