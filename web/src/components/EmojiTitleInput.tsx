import { useEffect, useMemo, useRef, useState } from 'react'
import { EMOJIS } from '../utils/emoji'
import { loadEmojiData } from '../utils/emojiLoader'

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
  const [fullData, setFullData] = useState<typeof EMOJIS | null>(null)
  const [loadingFull, setLoadingFull] = useState(false)
  const [recents, setRecents] = useState<{ char: string; name: string }[]>([])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!open) return []
    const catalog = (fullData && fullData.length > 0) ? fullData : EMOJIS
    if (q === '') {
      // Recents first
      const byChar = new Map(catalog.map((e) => [e.char, e]))
      const recentItems = recents
        .map((r) => byChar.get(r.char))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
      // Then curated quick picks, excluding recents
      const quick = ['tada', 'rocket', 'alarm', 'hourglass', 'coffee', 'muscle', 'sparkles', 'star', 'white_check_mark', 'fire', 'calendar', 'party']
      const recentNames = new Set(recentItems.map((e) => e.name))
      const quickItems = catalog.filter((e) => quick.includes(e.name) && !recentNames.has(e.name))
      return [...recentItems, ...quickItems].slice(0, 12)
    }
    const all = catalog.map((e) => {
      const hay = [e.name, ...(e.aliases ?? [])]
      const starts = hay.some((k) => k.startsWith(q))
      const contains = !starts && hay.some((k) => k.includes(q))
      const score = starts ? 3 : contains ? 1 : 0
      return { e, score }
    })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name))
      .slice(0, 20)
      .map((s) => s.e)
    return all
  }, [open, query, fullData, recents])

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

  // Load a comprehensive emoji catalog on demand
  useEffect(() => {
    if (!open) return
    if (fullData || loadingFull) return
    setLoadingFull(true)
    loadEmojiData()
      .then((data) => {
        if (data.length > 0) setFullData(data as any)
      })
      .finally(() => setLoadingFull(false))
  }, [open, fullData, loadingFull])

  // Recents: load and persist to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('emoji.recents')
      if (raw) {
        const arr = JSON.parse(raw) as { char: string; name: string }[]
        if (Array.isArray(arr)) setRecents(arr.slice(0, 30))
      }
    } catch { /* ignore */ }
  }, [])

  const recordRecent = (entry: { char: string; name: string }) => {
    setRecents((prev) => {
      const without = prev.filter((r) => r.char !== entry.char)
      const next = [{ char: entry.char, name: entry.name }, ...without].slice(0, 30)
      try {
        localStorage.setItem('emoji.recents', JSON.stringify(next))
      } catch { /* ignore */ }
      return next
    })
  }

  const applyEmoji = (entry: { char: string; name?: string }) => {
    const el = inputRef.current
    if (el == null || anchorStart == null) return
    const caret = el.selectionStart ?? value.length
    const next = value.slice(0, anchorStart) + entry.char + value.slice(caret)
    onChange(next)
    setOpen(false)
    // Record recent
    recordRecent({ char: entry.char, name: entry.name ?? entry.char })
    // place caret after inserted emoji on next tick
    requestAnimationFrame(() => {
      const pos = anchorStart + entry.char.length
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
              const s = suggestions[activeIndex]
              applyEmoji({ char: s.char, name: s.name })
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
                  onClick={() => applyEmoji({ char: s.char, name: s.name })}
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
