/**
 * Adapter Canva — SDD §7.6: "Brief reka bentuk lebih pendek, berorientasikan
 * templat dan mudah disunting."
 *
 * Output ditulis sebagai brief kepada seorang pereka templat, bukan arahan
 * kepada model imej.
 */
import {
  headingOf,
  modelNotesSection,
  note,
  pickSections,
  renderProse,
  type PlatformAdapter,
} from './shared'

export const canvaAdapter: PlatformAdapter = {
  id: 'canva',
  version: '1.0.0',
  transform(sections, ctx) {
    const brief = pickSections(sections, ['DESIGN TASK', 'CANVAS', 'VISUAL DIRECTION'])
    const layout = pickSections(sections, ['COMPOSITION', 'TYPOGRAPHY'])
    const exactCopy = sections.find((section) => section.section === 'EXACT COPY')
    // FR-014: bahagian kekangan mesti kekal walaupun brief ini lebih pendek.
    // Ia juga satu-satunya tempat arahan tersuai pengguna dipancarkan.
    const constraints = sections.find((section) => section.section === 'CONSTRAINTS')

    const notes = [
      note(
        ctx,
        'Taip teks daripada blok EXACT COPY terus ke dalam elemen teks templat supaya ejaan kekal tepat.',
        'Type the EXACT COPY text straight into the template text elements so spelling stays exact.',
      ),
      note(
        ctx,
        'Kunci ruang logo dan footer sebagai elemen berasingan supaya mudah dikemas kini.',
        'Lock the logo and footer zones as separate elements so they are easy to update.',
      ),
    ]
    const notesSection = modelNotesSection(notes)

    const parts: string[] = [
      note(ctx, 'Brief templat poster:', 'Poster template brief:'),
      renderProse(brief),
      note(ctx, 'Susun atur:', 'Layout:'),
      renderProse(layout),
    ]

    if (exactCopy) {
      parts.push(`${headingOf(exactCopy)}\n${exactCopy.lines.join('\n')}`)
    }
    if (constraints) {
      parts.push(`${headingOf(constraints)}\n${constraints.lines.join('\n')}`)
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
