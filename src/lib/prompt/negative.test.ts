import { describe, expect, it } from 'vitest'
import { buildNegativePrompt, negativeRules } from './negative'
import { scoreContentDensity } from './density'
import { denseProject, makeProject, minimalProject } from '@/tests/fixtures'

function rulesFor(project = minimalProject, language: 'ms' | 'en' = 'en') {
  return negativeRules(project, scoreContentDensity(project), language).map((rule) => rule.id)
}

describe('negative prompt (§7.7)', () => {
  it('sentiasa melarang teks tidak jelas, logo rawak dan watermark', () => {
    const ids = rulesFor()
    expect(ids).toContain('illegible')
    expect(ids).toContain('misspelled')
    expect(ids).toContain('random_logo')
    expect(ids).toContain('watermark')
    expect(ids).toContain('extra_elements')
  })

  it('menambah larangan anatomi hanya apabila subjek manusia dipilih', () => {
    expect(rulesFor()).not.toContain('distorted_anatomy')

    const withPerson = makeProject({
      ...minimalProject,
      subject: { ...minimalProject.subject, subjectType: 'person', subjectCount: 1 },
    })
    expect(rulesFor(withPerson)).toContain('distorted_anatomy')
    expect(rulesFor(withPerson)).toContain('altered_face')
  })

  it('tidak menambah larangan anatomi bagi subjek bukan manusia', () => {
    const withProduct = makeProject({
      ...minimalProject,
      subject: { ...minimalProject.subject, subjectType: 'product', subjectCount: 1 },
    })
    expect(rulesFor(withProduct)).not.toContain('distorted_anatomy')
  })

  it('menambah larangan latar sesak apabila ketumpatan padat', () => {
    expect(rulesFor()).not.toContain('busy_background')
    expect(rulesFor(denseProject)).toContain('busy_background')
  })

  it('menambah larangan warna di luar palet hanya apabila palet ketat', () => {
    expect(rulesFor()).not.toContain('off_palette')
    const strict = makeProject({
      ...minimalProject,
      style: { ...minimalProject.style, strictPalette: true },
    })
    expect(rulesFor(strict)).toContain('off_palette')
  })

  it('tidak memasukkan larangan yang bercanggah dengan gaya utama', () => {
    // Gaya berhias (Islamik geometri) + kandungan padat: larangan hiasan
    // berlebihan digugurkan kerana ia bercanggah dengan gaya yang dipilih.
    const ornamental = makeProject({
      ...denseProject,
      style: { ...denseProject.style, stylePreset: 'islamic_geometric' },
    })
    const ids = negativeRules(ornamental, scoreContentDensity(ornamental), 'en').map((r) => r.id)
    expect(ids).toContain('busy_background')
    expect(ids).not.toContain('excessive_ornament')

    // Gaya bukan berhias mengekalkan larangan tersebut.
    const plain = makeProject({
      ...denseProject,
      style: { ...denseProject.style, stylePreset: 'corporate' },
    })
    const plainIds = negativeRules(plain, scoreContentDensity(plain), 'en').map((r) => r.id)
    expect(plainIds).toContain('excessive_ornament')
  })

  it('menambah larangan ejaan Melayu bagi kandungan BM dan dwibahasa', () => {
    expect(rulesFor(makeProject({ ...minimalProject, language: 'ms' }))).toContain('malay_spelling')
    expect(rulesFor(makeProject({ ...minimalProject, language: 'bilingual' }))).toContain(
      'malay_spelling',
    )
    expect(rulesFor(makeProject({ ...minimalProject, language: 'en' }))).not.toContain(
      'malay_spelling',
    )
  })

  it('menghasilkan satu ayat dalam bahasa prompt yang dipilih', () => {
    const density = scoreContentDensity(minimalProject)
    expect(buildNegativePrompt(minimalProject, density, 'en')).toMatch(/^Avoid .+\.$/)
    expect(buildNegativePrompt(minimalProject, density, 'ms')).toMatch(/^Elakkan .+\.$/)
  })
})
