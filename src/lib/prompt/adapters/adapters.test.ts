import { describe, expect, it } from 'vitest'
import { ADAPTERS, getAdapter } from './index'
import { generatePrompt } from '../compose'
import { PLATFORMS } from '@/data/platforms'
import { appendixBProject, makeProject, minimalProject, typicalProject } from '@/tests/fixtures'

function withPlatform(project = typicalProject, targetPlatform: string) {
  return makeProject({
    ...project,
    platform: { ...project.platform, targetPlatform: targetPlatform as never },
  })
}

describe('pendaftaran adapter (§7.6)', () => {
  it('mendaftarkan enam adapter seperti SDD', () => {
    expect(Object.keys(ADAPTERS).sort()).toEqual(
      ['adobe', 'canva', 'chatgpt_image', 'gemini_image', 'midjourney', 'universal'].sort(),
    )
  })

  it('setiap adapter dalam katalog platform mempunyai pelaksanaan', () => {
    for (const platform of PLATFORMS) {
      expect(getAdapter(platform.id)).toBeDefined()
      expect(getAdapter(platform.id)?.version).toBe(platform.adapterVersion)
    }
  })

  it('memulangkan undefined bagi adapter yang tidak dikenali', () => {
    expect(getAdapter('tiada_platform_ini')).toBeUndefined()
  })
})

describe('adapter Universal', () => {
  it('menghasilkan prompt berlabel penuh', () => {
    const output = generatePrompt(withPlatform(appendixBProject, 'universal'))
    expect(output.mainPrompt).toContain('DESIGN TASK')
    expect(output.mainPrompt).toContain('EXACT COPY - reproduce exactly as written')
    expect(output.mainPrompt).toContain('CONSTRAINTS')
    expect(output.mainPrompt).not.toContain('--ar')
  })
})

describe('adapter ChatGPT Image', () => {
  it('menulis bahagian visual sebagai naratif tetapi mengekalkan blok teks tepat', () => {
    const output = generatePrompt(withPlatform(appendixBProject, 'chatgpt_image'))
    expect(output.mainPrompt).not.toContain('DESIGN TASK\n')
    expect(output.mainPrompt).toContain('EXACT COPY')
    expect(output.mainPrompt).toContain('SELAMAT MAJU JAYA')
  })

  it('mencadangkan lampiran gambar rujukan apabila wajah perlu dikekalkan', () => {
    const output = generatePrompt(withPlatform(appendixBProject, 'chatgpt_image'))
    expect(output.mainPrompt.toLowerCase()).toContain('reference image')
  })
})

describe('adapter Gemini Image', () => {
  it('menghasilkan struktur ringkas satu baris setiap bahagian', () => {
    const output = generatePrompt(withPlatform(appendixBProject, 'gemini_image'))
    expect(output.mainPrompt).toContain('Design Task:')
    expect(output.mainPrompt).toContain('Canvas:')
    expect(output.mainPrompt).toContain('EXACT COPY')
  })
})

describe('adapter Midjourney (UAT-05)', () => {
  it('menambah parameter nisbah --ar', () => {
    const output = generatePrompt(withPlatform(appendixBProject, 'midjourney'))
    expect(output.mainPrompt).toMatch(/--ar \d+:\d+$/)
  })

  it('memisahkan teks panjang daripada prompt dan memberi amaran', () => {
    const output = generatePrompt(withPlatform(typicalProject, 'midjourney'))
    expect(output.mainPrompt).not.toContain('BENGKEL PENULISAN GERAN PENYELIDIKAN')
    expect(output.exactCopyText).toContain('BENGKEL PENULISAN GERAN PENYELIDIKAN')
    expect(output.warnings.some((w) => w.id === 'midjourney-text-separated')).toBe(true)
  })

  it('mengekalkan teks pendek dalam prompt', () => {
    const output = generatePrompt(withPlatform(minimalProject, 'midjourney'))
    expect(output.mainPrompt).toContain('HARI TERBUKA 2026')
    expect(output.warnings.some((w) => w.id === 'midjourney-text-separated')).toBe(false)
  })

  it('mengekalkan blok teks tepat walaupun teks dipisahkan (FR-003)', () => {
    const output = generatePrompt(withPlatform(typicalProject, 'midjourney'))
    for (const line of output.exactCopy) {
      expect(output.exactCopyText).toContain(line.value)
    }
  })
})

describe('adapter Canva', () => {
  it('menghasilkan brief templat, bukan arahan model imej', () => {
    const output = generatePrompt(withPlatform(appendixBProject, 'canva'))
    expect(output.mainPrompt).toContain('Poster template brief:')
    expect(output.mainPrompt).toContain('EXACT COPY')
  })

  it('lebih pendek daripada output Universal', () => {
    const canva = generatePrompt(withPlatform(appendixBProject, 'canva'))
    const universal = generatePrompt(withPlatform(appendixBProject, 'universal'))
    expect(canva.mainPrompt.length).toBeLessThan(universal.mainPrompt.length)
  })
})

describe('adapter Adobe', () => {
  it('mencadangkan menambah teks melalui editor', () => {
    const output = generatePrompt(withPlatform(appendixBProject, 'adobe'))
    expect(output.mainPrompt).toContain('MODEL NOTES')
    expect(output.mainPrompt.toLowerCase()).toContain('adobe express')
  })

  it('memisahkan teks panjang seperti Midjourney', () => {
    const output = generatePrompt(withPlatform(typicalProject, 'adobe'))
    expect(output.warnings.some((w) => w.id === 'adobe-text-separated')).toBe(true)
  })
})

describe('bahagian kekangan pada setiap adapter (FR-014)', () => {
  it.each(PLATFORMS.map((platform) => platform.id))(
    'adapter %s mengekalkan kekangan dalam prompt utama',
    (platformId) => {
      const output = generatePrompt(withPlatform(appendixBProject, platformId))
      // Ayat kekangan teras mesti kekal walaupun adapter meringkaskan struktur.
      expect(output.mainPrompt).toMatch(/Do not invent additional logos/i)
    },
  )

  it.each(PLATFORMS.map((platform) => platform.id))(
    'adapter %s tidak membuang arahan tersuai pengguna',
    (platformId) => {
      const instruction = 'Kekalkan ruang kosong di bahagian kiri untuk logo penaja.'
      const project = makeProject({
        ...appendixBProject,
        platform: {
          ...appendixBProject.platform,
          targetPlatform: platformId as never,
          customInstructions: instruction,
        },
      })
      expect(generatePrompt(project).mainPrompt).toContain(instruction)
    },
  )
})

describe('ketahanan adapter (NFR-010)', () => {
  it('jatuh balik kepada Universal apabila adapter melontar ralat', () => {
    const original = ADAPTERS.canva.transform
    ADAPTERS.canva.transform = () => {
      throw new Error('kegagalan adapter yang disengajakan')
    }
    try {
      const output = generatePrompt(withPlatform(appendixBProject, 'canva'))
      expect(output.platformId).toBe('universal')
      expect(output.warnings.some((w) => w.id === 'adapter-fallback')).toBe(true)
      // Kandungan pengguna kekal utuh walaupun adapter gagal.
      expect(output.exactCopyText).toContain('SELAMAT MAJU JAYA')
    } finally {
      ADAPTERS.canva.transform = original
    }
  })
})
