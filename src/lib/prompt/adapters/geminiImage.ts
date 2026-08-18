/**
 * Adapter Gemini Image — SDD §7.6: "Arahan visual dan teks distrukturkan
 * secara ringkas dengan kekangan ketepatan."
 */
import {
  headingOf,
  modelNotesSection,
  note,
  renderCompact,
  type PlatformAdapter,
} from './shared'

export const geminiImageAdapter: PlatformAdapter = {
  id: 'gemini_image',
  version: '1.0.0',
  transform(sections, ctx) {
    const exactCopy = sections.find((section) => section.section === 'EXACT COPY')
    const compactSections = sections.filter((section) => section.section !== 'EXACT COPY')

    const notes = [
      note(
        ctx,
        'Teks pada poster mesti sepadan aksara demi aksara dengan blok EXACT COPY.',
        'Text on the poster must match the EXACT COPY block character for character.',
      ),
    ]
    const notesSection = modelNotesSection(notes)

    const parts = [renderCompact(compactSections)]
    if (exactCopy) {
      parts.push(`${headingOf(exactCopy)}\n${exactCopy.lines.join('\n')}`)
    }
    if (notesSection) {
      parts.push(renderCompact([notesSection]))
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
