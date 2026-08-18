/**
 * Pendaftaran adapter platform (SDD §7.6, FR-012).
 */
import type { PlatformId } from '@/data/platforms'
import { adobeAdapter } from './adobe'
import { canvaAdapter } from './canva'
import { chatgptImageAdapter } from './chatgptImage'
import { geminiImageAdapter } from './geminiImage'
import { midjourneyAdapter } from './midjourney'
import { universalAdapter } from './universal'
import type { PlatformAdapter } from './shared'

export const ADAPTERS: Record<PlatformId, PlatformAdapter> = {
  universal: universalAdapter,
  chatgpt_image: chatgptImageAdapter,
  gemini_image: geminiImageAdapter,
  midjourney: midjourneyAdapter,
  canva: canvaAdapter,
  adobe: adobeAdapter,
}

export function getAdapter(id: string): PlatformAdapter | undefined {
  return ADAPTERS[id as PlatformId]
}

export { universalAdapter }
export type { PlatformAdapter, AdapterResult } from './shared'
