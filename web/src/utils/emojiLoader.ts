// Lazy-load a comprehensive emoji dataset from emojibase-data
// Falls back gracefully to the existing curated set if load fails

export type FullEmoji = {
  emoji: string
  label?: string
  shortcodes?: string[]
  tags?: string[]
}
import type { EmojiDef } from './emoji'

let cache: EmojiDef[] | null = null
let inflight: Promise<EmojiDef[]> | null = null

export async function loadEmojiData(): Promise<EmojiDef[]> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = import('emojibase-data/en/data.json')
    .then((mod: unknown) => {
      const data = extractDataArray(mod)
      const mapped: EmojiDef[] = data.map((e) => {
        const baseName = (e.shortcodes?.[0] || e.label || '').toLowerCase().replace(/\s+/g, '_')
        const aliases = Array.from(
          new Set([...(e.shortcodes ?? []), ...(e.tags ?? [])].map((s) => s.toLowerCase().replace(/\s+/g, '_')))
        )
        return {
          name: baseName || e.emoji,
          char: e.emoji,
          aliases,
        }
      })
      cache = mapped
      return mapped
    })
    .catch(() => {
      cache = []
      return []
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

function extractDataArray(mod: unknown): FullEmoji[] {
  if (Array.isArray(mod)) {
    return mod as FullEmoji[]
  }
  if (typeof mod === 'object' && mod !== null) {
    const maybe = (mod as { default?: unknown }).default
    if (Array.isArray(maybe)) return maybe as FullEmoji[]
  }
  return []
}
