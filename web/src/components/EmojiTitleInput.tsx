import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
  onBlur?: () => void
}

type EmojiDef = { name: string; char: string; aliases?: string[] }

const EMOJIS: EmojiDef[] = [
  { name: 'smile', char: '😊', aliases: ['happy', 'blush'] },
  { name: 'grinning', char: '😀', aliases: ['smiley'] },
  { name: 'laugh', char: '😂', aliases: ['joy'] },
  { name: 'wink', char: '😉' },
  { name: 'heart', char: '❤️', aliases: ['love'] },
  { name: 'thumbs_up', char: '👍', aliases: ['like', 'approve'] },
  { name: 'clap', char: '👏' },
  { name: 'party', char: '🥳', aliases: ['tada'] },
  { name: 'rocket', char: '🚀', aliases: ['launch'] },
  { name: 'fire', char: '🔥' },
  { name: 'sparkles', char: '✨' },
  { name: 'star', char: '⭐' },
  { name: 'check', char: '✅' },
  { name: 'x', char: '❌' },
  { name: 'warning', char: '⚠️' },
  { name: 'hourglass', char: '⏳' },
  { name: 'alarm', char: '⏰', aliases: ['clock'] },
  { name: 'bell', char: '🔔' },
  { name: 'coffee', char: '☕' },
  { name: 'pizza', char: '🍕' },
  { name: 'microphone', char: '🎤' },
  { name: 'laptop', char: '💻' },
  { name: 'musical_note', char: '🎵', aliases: ['music'] },
  { name: 'soccer', char: '⚽' },
  { name: 'trophy', char: '🏆' },
  { name: 'sun', char: '☀️' },
  { name: 'moon', char: '🌙' },
  { name: 'cloud', char: '☁️' },
  { name: 'rain', char: '🌧️' },
  { name: 'snow', char: '❄️' },
  { name: 'wave', char: '🌊' },
  { name: 'book', char: '📖' },
  { name: 'pencil', char: '✏️' },
  { name: 'art', char: '🎨' },
  { name: 'sparkle_heart', char: '💖' },
]

export function EmojiTitleInput({ value, onChange, placeholder, className, onBlur }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [anchorStart, setAnchorStart] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!open) return []
    const all = EMOJIS.map((e) => ({
      score: e.name.startsWith(q) ? 2 : (e.aliases?.some((a) => a.startsWith(q)) ? 1 : 0),
      e,
    }))
      .filter((s) => q === '' || s.score > 0)
      .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name))
      .slice(0, 8)
      .map((s) => s.e)
    return all
  }, [open, query])

  // Track query based on caret position and preceding ':'
  const updateQueryFromCaret = () => {
    const el = inputRef.current
    if (!el) return
    const caret = el.selectionStart ?? value.length
    const before = value.slice(0, caret)
    const m = before.match(/:([a-z0-9_+-]*)$/i)
    if (m) {
      setOpen(true)
      setQuery(m[1])
      setAnchorStart(caret - m[0].length)
      setActiveIndex(0)
    } else {
      setOpen(false)
      setQuery('')
      setAnchorStart(null)
    }
  }

  useEffect(() => {
    updateQueryFromCaret()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const applyEmoji = (emoji: string) => {
    const el = inputRef.current
    if (el == null || anchorStart == null) return
    const caret = el.selectionStart ?? value.length
    const next = value.slice(0, anchorStart) + emoji + value.slice(caret)
    onChange(next)
    setOpen(false)
    // place caret after inserted emoji on next tick
    requestAnimationFrame(() => {
      const pos = anchorStart + emoji.length
      el.setSelectionRange(pos, pos)
      el.focus()
    })
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className={className}
        placeholder={placeholder}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, 0))
          } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (suggestions[activeIndex]) {
              e.preventDefault()
              applyEmoji(suggestions[activeIndex].char)
            }
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        onClick={updateQueryFromCaret}
        onKeyUp={updateQueryFromCaret}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-56 rounded-md border ui-border bg-[color:var(--ui-panel-bg)] shadow-lg">
          <ul className="max-h-60 overflow-auto py-1 text-sm">
            {suggestions.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  className={`w-full px-2 py-1 flex items-center gap-2 text-left ${i === activeIndex ? 'bg-white/10' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyEmoji(s.char)}
                >
                  <span className="text-base leading-none">{s.char}</span>
                  <span className="ui-label">:{s.name}:</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

