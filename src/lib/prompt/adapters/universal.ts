/**
 * Adapter Universal — SDD §7.6: "Prompt berlabel lengkap tanpa sintaks khusus."
 * Ini juga adapter sandaran apabila adapter lain gagal (NFR-010).
 */
import { modelNotesSection, note, renderLabelled, type PlatformAdapter } from './shared'

export const universalAdapter: PlatformAdapter = {
  id: 'universal',
  version: '1.0.0',
  transform(sections, ctx) {
    const notes = [
      note(
        ctx,
        'Prompt ini berlabel penuh dan boleh disalin ke mana-mana alat AI atau diserahkan kepada pereka.',
        'This prompt is fully labelled and can be pasted into any AI tool or handed to a designer.',
      ),
    ]

    const all = [...sections]
    const notesSection = modelNotesSection(notes)
    if (notesSection) all.push(notesSection)

    return {
      sections: all,
      prompt: renderLabelled(all),
      modelNotes: notes,
      warnings: [],
      textSeparated: false,
    }
  },
}
