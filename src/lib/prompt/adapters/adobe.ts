/**
 * Adapter Adobe — SDD §7.6: "Arahan visual, latar dan komposisi, disertai
 * cadangan menambah teks melalui editor."
 */
import { LONG_TEXT_THRESHOLD } from '../conflicts'
import {
  modelNotesSection,
  note,
  pickSections,
  renderLabelled,
  type PlatformAdapter,
} from './shared'

export const adobeAdapter: PlatformAdapter = {
  id: 'adobe',
  version: '1.0.0',
  transform(sections, ctx) {
    const visual = pickSections(sections, [
      'DESIGN TASK',
      'CANVAS',
      'VISUAL DIRECTION',
      'COMPOSITION',
      'SUBJECT',
      'CONSTRAINTS',
      'QUALITY',
    ])

    const exactCopy = sections.find((section) => section.section === 'EXACT COPY')
    const separateText = ctx.density.totalCharacters > LONG_TEXT_THRESHOLD

    const notes = [
      note(
        ctx,
        'Jana latar dan visual dahulu, kemudian susun teks sebagai lapisan berasingan dalam Adobe Express atau Photoshop.',
        'Generate the background and visual first, then set the text as separate layers in Adobe Express or Photoshop.',
      ),
    ]

    if (exactCopy && separateText) {
      notes.push(
        note(
          ctx,
          'Teks poster dikeluarkan daripada prompt ini; gunakan tab Teks Tepat semasa menyusun lapisan teks.',
          'Poster text has been removed from this prompt; use the Exact Copy tab when placing the text layers.',
        ),
      )
    }

    const notesSection = modelNotesSection(notes)
    const rendered = [...visual]
    if (exactCopy && !separateText) rendered.push(exactCopy)
    if (notesSection) rendered.push(notesSection)

    const all = [...(separateText ? sections.filter((s) => s.section !== 'EXACT COPY') : sections)]
    if (notesSection) all.push(notesSection)

    return {
      sections: all,
      prompt: renderLabelled(rendered),
      modelNotes: notes,
      warnings:
        exactCopy && separateText
          ? [
              {
                id: 'adobe-text-separated',
                severity: 'info' as const,
                message:
                  'Teks poster dipisahkan daripada prompt Adobe. Tambah teks sebagai lapisan dalam editor supaya ejaan kekal tepat.',
                field: 'platform.targetPlatform',
              },
            ]
          : [],
      textSeparated: separateText && !!exactCopy,
    }
  },
}
