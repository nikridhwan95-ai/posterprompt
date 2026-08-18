import { describe, expect, it } from 'vitest'
import { auditPassed, runQualityAudit } from './audit'
import { collectExactCopy } from './exactCopy'
import { generatePrompt } from './compose'
import { appendixBProject, makeProject, typicalProject } from '@/tests/fixtures'

function auditFor(overrides: Partial<Parameters<typeof runQualityAudit>[0]> = {}) {
  const project = appendixBProject
  const exactCopy = collectExactCopy(project)
  const mainPrompt = generatePrompt(project).mainPrompt
  return runQualityAudit({
    project,
    mainPrompt,
    exactCopy,
    ratio: '3:4',
    adapterVersion: '1.0.0',
    ...overrides,
  })
}

function check(id: string, checks: ReturnType<typeof runQualityAudit>) {
  const found = checks.find((c) => c.id === id)
  if (!found) throw new Error(`semakan ${id} tidak dijumpai`)
  return found
}

describe('audit kualiti (§7.8)', () => {
  it('menjalankan tujuh semakan QA-01 hingga QA-07', () => {
    const checks = auditFor()
    expect(checks.map((c) => c.id)).toEqual([
      'QA-01',
      'QA-02',
      'QA-03',
      'QA-04',
      'QA-05',
      'QA-06',
      'QA-07',
    ])
  })

  it('lulus sepenuhnya bagi projek yang kemas', () => {
    expect(auditPassed(auditFor())).toBe(true)
  })

  it('QA-01 mengesan token placeholder yang tertinggal', () => {
    expect(check('QA-01', auditFor({ mainPrompt: 'Poster untuk [TITLE] pada tarikh' })).passed).toBe(
      false,
    )
    expect(check('QA-01', auditFor({ mainPrompt: 'Poster untuk {{name}}' })).passed).toBe(false)
    expect(check('QA-01', auditFor({ mainPrompt: 'Poster biasa tanpa token' })).passed).toBe(true)
  })

  it('QA-02 mengesan teks tepat yang hilang atau berganda', () => {
    const exactCopy = collectExactCopy(appendixBProject)
    const missing = check('QA-02', auditFor({ mainPrompt: 'prompt tanpa teks tepat', exactCopy }))
    expect(missing.passed).toBe(false)

    const doubled = check(
      'QA-02',
      auditFor({
        mainPrompt: `${exactCopy[0].value} ${exactCopy[0].value}`,
        exactCopy: [exactCopy[0]],
      }),
    )
    expect(doubled.passed).toBe(false)
  })

  it('QA-03 mengesan nisbah yang tidak sepadan dengan dimensi', () => {
    expect(check('QA-03', auditFor({ ratio: '16:9' })).passed).toBe(false)
    expect(check('QA-03', auditFor({ ratio: '3:4' })).passed).toBe(true)
  })

  it('QA-03 menerima nisbah setara seperti 1:1.414', () => {
    const a4 = makeProject({
      ...appendixBProject,
      canvas: { preset: 'a4_portrait', width: 2480, height: 3508, destination: '' },
    })
    const checks = runQualityAudit({
      project: a4,
      mainPrompt: 'prompt',
      exactCopy: [],
      ratio: '1:1.414',
      adapterVersion: '1.0.0',
    })
    expect(check('QA-03', checks).passed).toBe(true)
  })

  it('QA-05 mengesan zon yang bertindih secara logik', () => {
    const overlapping = makeProject({
      ...typicalProject,
      layout: { ...typicalProject.layout, logoZone: 'bottom', assetZones: ['sponsor'] },
    })
    const checks = runQualityAudit({
      project: overlapping,
      mainPrompt: 'prompt',
      exactCopy: [],
      ratio: '4:5',
      adapterVersion: '1.0.0',
    })
    expect(check('QA-05', checks).passed).toBe(false)
  })

  it('QA-06 gagal apabila versi adapter tidak direkod', () => {
    expect(check('QA-06', auditFor({ adapterVersion: undefined })).passed).toBe(false)
  })

  it('QA-07 mengesan teks yang tidak sepadan dengan input asal', () => {
    const tampered = collectExactCopy(appendixBProject).map((line, index) =>
      index === 0 ? { ...line, value: 'TEKS YANG DIREKA' } : line,
    )
    expect(check('QA-07', auditFor({ exactCopy: tampered })).passed).toBe(false)
  })
})
