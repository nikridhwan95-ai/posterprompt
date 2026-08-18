/**
 * Adapter ChatGPT Image — SDD §7.6: "Arahan natural lengkap dengan penekanan
 * teks tepat dan rujukan aset jika pengguna akan melampirkannya."
 *
 * Bahagian visual ditulis sebagai perenggan naratif; blok EXACT COPY kekal
 * berlabel supaya model tidak menganggapnya sebagai arahan bebas.
 */
import {
  headingOf,
  modelNotesSection,
  note,
  pickSections,
  renderProse,
  type PlatformAdapter,
} from './shared'

export const chatgptImageAdapter: PlatformAdapter = {
  id: 'chatgpt_image',
  version: '1.0.0',
  transform(sections, ctx) {
    const narrative = pickSections(sections, [
      'DESIGN TASK',
      'CANVAS',
      'VISUAL DIRECTION',
      'COMPOSITION',
      'SUBJECT',
      'TYPOGRAPHY',
    ])
    const exactCopy = sections.find((section) => section.section === 'EXACT COPY')
    const constraints = sections.find((section) => section.section === 'CONSTRAINTS')
    const quality = sections.find((section) => section.section === 'QUALITY')

    const notes = [
      note(
        ctx,
        'Semak hasil terhadap blok EXACT COPY sebelum digunakan; minta pembetulan jika ada ejaan berubah.',
        'Check the result against the EXACT COPY block before use and ask for a correction if any spelling changed.',
      ),
    ]

    if (ctx.project.subject.subjectType !== 'none' && ctx.project.subject.preserveFace) {
      notes.push(
        note(
          ctx,
          'Lampirkan gambar rujukan dalam sembang yang sama supaya wajah dan pakaian subjek dapat dikekalkan.',
          'Attach the reference image in the same chat so the face and clothing can be preserved.',
        ),
      )
    }

    const notesSection = modelNotesSection(notes)

    const parts: string[] = [renderProse(narrative)]

    if (exactCopy) {
      parts.push(`${headingOf(exactCopy)}\n${exactCopy.lines.join('\n')}`)
    }
    if (constraints) {
      parts.push(`${headingOf(constraints)}\n${constraints.lines.join('\n')}`)
    }
    if (quality) {
      parts.push(quality.lines.join(' '))
    }
    if (notesSection) {
      parts.push(`${headingOf(notesSection)}\n${notesSection.lines.join('\n')}`)
    }

    const all = [...sections]
    if (notesSection) all.push(notesSection)

    return {
      sections: all,
      prompt: parts.filter((part) => part.trim().length > 0).join('\n\n'),
      modelNotes: notes,
      warnings: [],
      textSeparated: false,
    }
  },
}
