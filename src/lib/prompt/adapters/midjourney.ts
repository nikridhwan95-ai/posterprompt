/**
 * Adapter Midjourney — SDD §7.6: "Fokus visual, komposisi dan nisbah. Teks
 * panjang dipisahkan serta amaran tipografi dipaparkan."
 *
 * Midjourney tidak menerima blok arahan panjang berlabel dengan baik, jadi
 * bahagian visual digabungkan menjadi satu baris deskriptif dan nisbah
 * dihantar melalui parameter `--ar`.
 */
import { LONG_TEXT_THRESHOLD } from '../conflicts'
import {
  modelNotesSection,
  note,
  pickSections,
  renderProse,
  type PlatformAdapter,
} from './shared'

export const midjourneyAdapter: PlatformAdapter = {
  id: 'midjourney',
  version: '1.0.0',
  transform(sections, ctx) {
    const visual = pickSections(sections, [
      'DESIGN TASK',
      'VISUAL DIRECTION',
      'COMPOSITION',
      'SUBJECT',
    ])

    const exactCopy = sections.find((section) => section.section === 'EXACT COPY')
    // FR-014: kekangan mesti hadir dalam prompt utama. Midjourney tidak
    // menerima blok berlabel, jadi ia dicantum sebagai ayat biasa — tetapi ia
    // tidak boleh digugurkan, kerana arahan tersuai pengguna berada di sini dan
    // §7.2 meletakkan kekangan identiti di atas komposisi serta gaya.
    const constraints = sections.find((section) => section.section === 'CONSTRAINTS')
    const separateText = ctx.density.totalCharacters > LONG_TEXT_THRESHOLD

    const notes: string[] = []
    const warnings = []

    if (exactCopy && separateText) {
      notes.push(
        note(
          ctx,
          'Teks poster dikeluarkan daripada prompt ini kerana Midjourney tidak menulis teks panjang dengan tepat. Gunakan tab Teks Tepat dan tambah teks melalui editor.',
          'Poster text has been removed from this prompt because Midjourney does not render long text accurately. Use the Exact Copy tab and add the text in an editor.',
        ),
      )
      warnings.push({
        id: 'midjourney-text-separated',
        severity: 'amaran' as const,
        message:
          'Teks poster dipisahkan daripada prompt Midjourney. Jana visual dahulu, kemudian tambah teks melalui editor supaya ejaan kekal tepat.',
        field: 'platform.targetPlatform',
      })
    }

    notes.push(
      note(
        ctx,
        'Nisbah dihantar melalui parameter --ar pada hujung prompt.',
        'The aspect ratio is passed through the --ar parameter at the end of the prompt.',
      ),
    )

    const visualText = renderProse(visual)
    const parts: string[] = [visualText]

    if (exactCopy && separateText) {
      // Ruang teks tetap perlu dikosongkan supaya teks boleh ditambah kemudian.
      parts.push(
        note(
          ctx,
          'Biarkan kawasan teks kosong tanpa sebarang tulisan supaya teks sebenar boleh ditambah melalui editor.',
          'Leave the text areas empty with no lettering at all so the real text can be added later in an editor.',
        ),
      )
    }

    if (exactCopy && !separateText) {
      const quoted = exactCopy.lines.map((line) => `"${line}"`).join(', ')
      parts.push(
        note(
          ctx,
          `Sertakan teks berikut tepat seperti tertulis: ${quoted}.`,
          `Include the following text exactly as written: ${quoted}.`,
        ),
      )
    }

    if (constraints) {
      parts.push(constraints.lines.join(' '))
    }

    const prompt = `${parts.filter((part) => part.trim().length > 0).join(' ')} --ar ${ctx.integerRatio}`

    const notesSection = modelNotesSection(notes)
    const all = [...(separateText ? sections.filter((s) => s.section !== 'EXACT COPY') : sections)]
    if (notesSection) all.push(notesSection)

    return {
      sections: all,
      prompt,
      modelNotes: notes,
      warnings,
      textSeparated: separateText && !!exactCopy,
    }
  },
}
