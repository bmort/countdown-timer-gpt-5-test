import { useEffect, useMemo, useRef, useState } from 'react'
import { EMOJIS } from '../utils/emoji'

type Props = {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
  onBlur?: () => void
}

// Emoji catalog now imported from utils (includes animals)

export function EmojiTitleInput({ value, onChange, placeholder, className, onBlur }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [anchorStart, setAnchorStart] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!open) return []
    if (q === '') {
      // Curated quick picks when no query
      const quick = ['tada', 'rocket', 'alarm', 'hourglass', 'coffee', 'muscle', 'sparkles', 'star', 'check', 'fire', 'calendar', 'party']
      return EMOJIS.filter((e) => quick.includes(e.name)).slice(0, 12)
    }
    const all = EMOJIS.map((e) => {
      const hay = [e.name, ...(e.aliases ?? [])]
      const starts = hay.some((k) => k.startsWith(q))
      const contains = !starts && hay.some((k) => k.includes(q))
      const score = starts ? 3 : contains ? 1 : 0
      return { e, score }
    })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name))
      .slice(0, 12)
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
        <div className="absolute z-10 mt-1 w-56 rounded-md border ui-border bg-[color:var(--ui-popup-bg)] shadow-lg">
          <ul className="max-h-60 overflow-auto py-1 text-sm">
            {suggestions.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  className={`w-full px-2 py-1 flex items-center gap-2 text-left ${i === activeIndex ? 'bg-[color:var(--ui-hover)]' : 'hover:bg-[color:var(--ui-hover)]'}`}
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
