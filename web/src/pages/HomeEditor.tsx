import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTimerConfig, serializeConfigToQuery, parseDurationToMs, defaultConfig } from '../state/config'
import { EmojiTitleInput } from '../components/EmojiTitleInput'
import { ThemeToggle } from '../components/ThemeToggle'
import { DateTime } from 'luxon'
import { buildAccentGlow } from '../utils/color'
import { useGoogleFont } from '../hooks/useGoogleFont'
import type { TimerMode } from '../state/config'

const modeOptions: Array<{ value: TimerMode; label: string }> = [
  { value: 'duration', label: 'Duration' },
  { value: 'until', label: 'Until (Date/Time)' },
]

export function HomeEditor() {
  const navigate = useNavigate()
  const [search, setSearch] = useSearchParams()
  const { config, updateConfig, resetConfig } = useTimerConfig()
  useGoogleFont(config.font)
  useGoogleFont(config.titleFont)

  useEffect(() => {
    // hydrate from URL if present
    if (search.toString()) {
      const next = Object.fromEntries(search.entries())
      updateConfig({ fromQuery: next })
    }
  }, [search, updateConfig])

  const [title, setTitle] = useState(config.title ?? '')
  useEffect(() => setTitle(config.title ?? ''), [config.title])
  const titleEmpty = (title ?? '').trim() === ''

  // Apply theme class to body so the entire page, including config, switches theme
  useEffect(() => {
    const light = config.theme === 'light'
    document.body.classList.toggle('theme-light', light)
    document.body.classList.toggle('theme-dark', !light)
  }, [config.theme])

  // When entering until mode, initialize date/time/tz to 10 minutes ahead if not provided
  useEffect(() => {
    if (config.mode !== 'until') return
    if (config.date && config.time && config.tz) return
    const nowPlus = new Date(Date.now() + 10 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${nowPlus.getFullYear()}-${pad(nowPlus.getMonth() + 1)}-${pad(nowPlus.getDate())}`
    const time = `${pad(nowPlus.getHours())}:${pad(nowPlus.getMinutes())}:${pad(nowPlus.getSeconds())}`
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    updateConfig({ date: config.date ?? date, time: config.time ?? time, tz: config.tz ?? tz })
  }, [config.mode, config.date, config.time, config.tz, updateConfig])

  const quickDurations = [5, 10, 15, 25, 30, 45, 60]

  const onStart = () => {
    const qs = serializeConfigToQuery(config)
    const url = qs ? `${qs}&autostart=1` : 'autostart=1'
    // Use a basename-safe relative path for GitHub Pages
    navigate({ pathname: 'timer', search: `?${url}` })
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <header className="px-6 py-4 border-b ui-border flex items-center justify-between ui-panel sticky top-0 backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold font-inter">Countdown Timer</h1>
          <p className="text-[11px] leading-snug ui-label mt-0.5">Vibed out by @Ben Mort, and gpt-5</p>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-cyan-600 dark:text-cyan-300 hover:underline" to="timer">Player</Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-6 grid md:grid-cols-2 gap-6">
        <section className="ui-panel rounded-xl p-5 space-y-4 border ui-border">
          <div className="flex gap-2">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateConfig({ mode: opt.value })}
                className={
                  'px-3 py-1.5 rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ' +
                  (config.mode === opt.value
                    ? (config.theme === 'light'
                        ? 'bg-cyan-500/15 border-cyan-600 text-cyan-900'
                        : 'bg-cyan-400/25 border-cyan-400 text-cyan-100')
                    : 'ui-border hover:bg-white/5')
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {config.mode === 'duration' ? (
            <div className="space-y-3">
              <label className="block text-sm ui-label">Duration (Examples: 1h30m, 90m, 01:30:00)</label>
              <div className="flex items-center gap-2">
                <input
                  className="px-3 py-2 rounded-lg ui-input border ui-border w-40"
                  placeholder="00h00m00s"
                  value={config.d ?? ''}
                  onChange={(e) => updateConfig({ d: e.target.value })}
                />
                <div className="flex gap-2">
                  {quickDurations.map((m) => (
                    <button
                      key={m}
                      className="px-2.5 py-1 rounded-md border ui-border bg-transparent hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                      onClick={() => updateConfig({ d: `${m}m` })}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm ui-label">Date</label>
                  <input
                    type="date"
                    className="px-3 py-2 rounded-lg ui-input border ui-border w-full"
                    value={config.date ?? ''}
                    onChange={(e) => updateConfig({ date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm ui-label">Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      step={1}
                      className="px-3 py-2 pr-20 rounded-lg ui-input border ui-border w-full"
                      value={config.time ?? ''}
                      onChange={(e) => updateConfig({ time: e.target.value })}
                    />
                    <UntilQuickSetButton variant="inline" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm ui-label">Timezone</label>
                  <select
                    className="px-3 py-2 rounded-lg ui-input border ui-border w-full"
                value={config.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
                onChange={(e) => updateConfig({ tz: e.target.value })}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm ui-label">Title</label>
              <EmojiTitleInput
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full"
                placeholder="Add title here, use : for emojis"
                value={title}
                onChange={(v) => { setTitle(v); updateConfig({ title: v }) }}
              />
            </div>
            <div>
              <label className="block text-sm ui-label">Show progress bar</label>
              <input
                type="checkbox"
                className="scale-125 mt-2"
                checked={config.bar === '1'}
                onChange={(e) => updateConfig({ bar: e.target.checked ? '1' : '0' })}
              />
            </div>
          </div>

        <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm ui-label">Title Font</label>
              <select
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full disabled:opacity-50 disabled:cursor-not-allowed"
                value={config.titleFont ?? config.font}
                onChange={(e) => updateConfig({ titleFont: e.target.value })}
                disabled={titleEmpty}
              >
                {fontOptions.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm ui-label">Title Size</label>
              <select
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full disabled:opacity-50 disabled:cursor-not-allowed"
                value={config.titleSize ?? 'm'}
                onChange={(e) => updateConfig({ titleSize: e.target.value as 's' | 'm' | 'l' | 'xl' })}
                disabled={titleEmpty}
              >
                <option value="s">Small</option>
                <option value="m">Medium</option>
                <option value="l">Large</option>
                <option value="xl">XL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm ui-label">Title Color</label>
              <input
                type="color"
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                value={config.titleColor ?? '#9CA3AF'}
                onChange={(e) => updateConfig({ titleColor: e.target.value })}
                disabled={titleEmpty}
              />
            </div>
            <div>
              <label className="block text-sm ui-label">Title Weight</label>
              <select
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full disabled:opacity-50 disabled:cursor-not-allowed"
                value={config.titleWeight ?? 'normal'}
                onChange={(e) => updateConfig({ titleWeight: e.target.value as 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' })}
                disabled={titleEmpty}
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
                <option value="extrabold">Extra Bold</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm ui-label">Font</label>
              <select
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full"
                value={config.font}
                onChange={(e) => updateConfig({ font: e.target.value })}
              >
                {fontOptions.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm ui-label">Size</label>
              <select
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full"
                value={config.fs}
                onChange={(e) => updateConfig({ fs: e.target.value as 's' | 'm' | 'l' | 'xl' })}
              >
                <option value="s">Small</option>
                <option value="m">Medium (default)</option>
                <option value="l">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm ui-label">Accent</label>
              <input
                type="color"
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full h-10"
                value={config.accent}
                onChange={(e) => updateConfig({ accent: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm ui-label">Timer/Days Weight</label>
              <select
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full"
                value={config.digitWeight ?? 'bold'}
                onChange={(e) => updateConfig({ digitWeight: e.target.value as 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' })}
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
                <option value="extrabold">Extra Bold</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm ui-label">Font Effects (experimental)</label>
              <select
                className="px-3 py-2 rounded-lg ui-input border ui-border w-full"
                value={config.fx}
                onChange={(e) => updateConfig({ fx: e.target.value as ('none' | 'pulse-sec' | 'pulse-min' | 'flip-sec' | 'neon' | 'shake-10s' | 'pop-sec') })}
              >
                <option value="none">None</option>
                <option value="pulse-sec">Pulse on seconds</option>
                <option value="pulse-min">Pulse on minutes</option>
                <option value="flip-sec">Flip on seconds</option>
                <option value="neon">Neon glow</option>
                <option value="shake-10s">Shake in last 10s</option>
                <option value="pop-sec">Pop on seconds</option>
              </select>
              <p className="text-xs ui-label mt-1">Visual effects applied to the main digits. Some effects are continuous; minute/second-triggered effects are basic in v1.</p>
            </div>
          </div>

          {/* Action buttons moved to the right column below Live Preview */}
        </section>

        <section className="ui-panel rounded-xl p-5 border ui-border">
          <h2 className="text-sm ui-label mb-3">Live Preview</h2>
          <div className="aspect-video rounded-lg border ui-border flex items-center justify-center ui-panel">
            <PreviewTimer />
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={onStart}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400"
            >
              Start
            </button>
            <Link
              className="px-4 py-2 rounded-lg border ui-border hover:bg-white/5"
              to={`timer?${serializeConfigToQuery(config)}&ui=0`}
              target="_blank"
            >
              Preview Player
            </Link>
            <CopyUrlButton />
            <button
              className="px-4 py-2 rounded-lg border ui-border hover:bg-white/5"
              onClick={() => {
                const ok = window.confirm('Reset all settings to defaults?')
                if (ok) {
                  resetConfig()
                  const qs = serializeConfigToQuery(defaultConfig)
                  setSearch(new URLSearchParams(qs), { replace: true })
                }
              }}
            >
              Reset Config
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function PreviewTimer() {
  const { config } = useTimerConfig()
  // Compute total ms remaining for preview
  const totalMs = (() => {
    if (config.mode === 'until') {
      const tz = config.tz || Intl.DateTimeFormat().resolvedOptions().timeZone
      const iso = `${config.date ?? ''}T${config.time ?? '00:00:00'}`
      const target = DateTime.fromISO(iso, { zone: tz })
      const wall = DateTime.now().setZone(tz)
      return Math.max(target.toMillis() - wall.toMillis(), 0)
    }
    return parseDurationToMs(config.d)
  })()
  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.floor(totalMs / dayMs)
  const remMs = days > 0 ? Math.max(totalMs - days * dayMs, 0) : totalMs
  const display = formatTime(remMs, days > 0)
  return (
    <div className="text-center w-full">
      {config.title && (
        <div className={
          `${titleFontClass(config.titleFont ?? config.font)} ${titleSizeClass(config.titleSize)} ${weightClass(config.titleWeight)} ${days > 0 ? 'mb-4' : 'mb-2'}`
        } style={{ color: config.titleColor ?? (config.theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)') }}>
          {config.title}
        </div>
      )}
      {days > 0 && (
        <div
          className={`${fontClass(config.font)} ${weightClass(config.digitWeight)}`}
          style={{ color: config.fg, fontSize: `calc(${sizeToPx(config.fs)} * 0.3)`, lineHeight: 1.0, marginBottom: '0.5em' }}
        >
          {days} {days === 1 ? 'day' : 'days'}
        </div>
      )}
      <div className="relative inline-block">
        <div
          className="absolute inset-0 -z-10 blur-3xl opacity-70"
          style={{ backgroundImage: buildAccentGlow(config.accent), filter: 'blur(40px)' }}
        />
        <div
          className={
            `${weightClass(config.digitWeight)} tracking-tight whitespace-nowrap ` + fontClass(config.font)
          }
          style={{ color: config.fg, fontSize: sizeToPx(config.fs) }}
        >
          {display}
        </div>
      </div>
      {config.bar === '1' && (
        <div className="h-2 rounded mt-4" style={{ backgroundColor: config.theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded" style={{ width: '50%', backgroundColor: config.accent }} />
        </div>
      )}
    </div>
  )
}

function formatTime(ms: number, forceHours = false): string {
  const total = Math.floor(ms / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (hours > 0 || forceHours) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return `${pad(minutes)}:${pad(seconds)}`
}

function sizeToPx(fs: 's' | 'm' | 'l' | 'xl' | undefined) {
  // Preview panel is smaller; use illustrative sizes proportional to Player
  switch (fs) {
    case 's':
      return '6rem'
    case 'xl':
      return '14rem' // largest
    case 'l':
      return '11rem' // larger than previous XL
    default:
      return '8rem' // medium equals old XL
  }
}

function CopyUrlButton() {
  const { config } = useTimerConfig()
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    const qs = `${serializeConfigToQuery(config)}&ui=0&autostart=1`
    // Respect Vite/React Router basename for GitHub Pages URLs
    const base = new URL(import.meta.env.BASE_URL, window.location.origin)
    const url = `${base.toString().replace(/\/$/, '')}/timer?${qs}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // Fallback: select/alert if clipboard not available
      window.prompt('Copy URL', url)
    }
  }
  return (
    <button
      onClick={onCopy}
      className={`px-4 py-2 rounded-lg border ui-border hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${copied ? 'text-cyan-700 dark:text-cyan-300 border-cyan-500 dark:border-cyan-400 bg-cyan-500/10 dark:bg-transparent' : ''}`}
      title="Copy a shareable Player URL"
    >
      {copied ? 'Copied!' : 'Copy Share URL'}
    </button>
  )
}

// ThemeToggle moved to components/ThemeToggle

function UntilQuickSetButton({ variant = 'default' as const }: { variant?: 'default' | 'inline' }) {
  const { config, updateConfig } = useTimerConfig()
  const [open, setOpen] = useState(false)
  const tz = config.tz || Intl.DateTimeFormat().resolvedOptions().timeZone
  const apply = (dt: DateTime) => {
    const d = dt.setZone(tz)
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${d.year}-${pad(d.month)}-${pad(d.day)}`
    const time = `${pad(d.hour)}:${pad(d.minute)}:${pad(d.second)}`
    updateConfig({ date, time, tz })
    setOpen(false)
  }
  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-base"
          title="Quickly set the target time"
          aria-label="Quickly set the target time"
        >
          ⏱
        </button>
        {open && (
          <UntilQuickSetDialog tz={tz} onClose={() => setOpen(false)} onApply={apply} />
        )}
      </>
    )
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm"
        title="Quickly set the target time"
      >
        Set target…
      </button>
      {open && (
        <UntilQuickSetDialog tz={tz} onClose={() => setOpen(false)} onApply={apply} />
      )}
    </>
  )
}

function UntilQuickSetDialog({ tz, onClose, onApply }: { tz: string; onClose: () => void; onApply: (dt: DateTime) => void }) {
  const [customMin, setCustomMin] = useState<number>(10)
  const now = DateTime.now().setZone(tz)
  const mk = (minutes: number) => now.plus({ minutes })
  const nextQuarter = () => {
    const minutes = now.minute + now.second / 60
    const next = Math.ceil(minutes / 15) * 15
    return now.set({ minute: 0, second: 0, millisecond: 0 }).plus({ minutes: next })
  }
  const nextHalf = () => {
    const minutes = now.minute + now.second / 60
    const next = Math.ceil(minutes / 30) * 30
    return now.set({ minute: 0, second: 0, millisecond: 0 }).plus({ minutes: next })
  }
  const topOfHour = () => now.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 })
  const tomorrowAt = (hour: number) => now.plus({ days: 1 }).set({ hour, minute: 0, second: 0, millisecond: 0 })

  // Dialog is rendered in a dark panel regardless of overall theme to ensure contrast
  const btn = 'px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-black/95 border border-white/10 rounded-xl p-5 w-full max-w-xl shadow-xl text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/90 font-semibold">Set Target Time</h3>
          <button className="text-white/60 hover:text-white" onClick={onClose}>✕</button>
        </div>
        <p className="text-sm text-white/70 mb-3">Time zone: <span className="text-white/90">{tz}</span></p>
        <div className="grid grid-cols-3 gap-2">
          <button className={btn} onClick={() => onApply(now)}>Now</button>
          <button className={btn} onClick={() => onApply(mk(5))}>+5m</button>
          <button className={btn} onClick={() => onApply(mk(10))}>+10m</button>
          <button className={btn} onClick={() => onApply(mk(15))}>+15m</button>
          <button className={btn} onClick={() => onApply(mk(30))}>+30m</button>
          <button className={btn} onClick={() => onApply(mk(45))}>+45m</button>
          <button className={btn} onClick={() => onApply(mk(60))}>+1h</button>
          <button className={btn} onClick={() => onApply(mk(120))}>+2h</button>
          <button className={btn} onClick={() => onApply(mk(180))}>+3h</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button className={btn} onClick={() => onApply(nextQuarter())}>Next :15</button>
          <button className={btn} onClick={() => onApply(nextHalf())}>Next :30</button>
          <button className={btn} onClick={() => onApply(topOfHour())}>Top of hour</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button className={btn} onClick={() => onApply(tomorrowAt(9))}>Tomorrow 09:00</button>
          <button className={btn} onClick={() => onApply(tomorrowAt(13))}>Tomorrow 13:00</button>
          <button className={btn} onClick={() => onApply(tomorrowAt(18))}>Tomorrow 18:00</button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <label className="text-sm ui-label">Custom minutes ahead</label>
          <input
            type="number"
            min={1}
            max={24*60}
            className="px-3 py-2 rounded-lg ui-input border ui-border w-24"
            value={customMin}
            onChange={(e) => setCustomMin(Number(e.target.value) || 0)}
          />
          <button className={btn} onClick={() => onApply(mk(customMin))}>Apply</button>
        </div>
        <div className="mt-4 text-right">
          <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function titleFontClass(font?: string) {
  return fontClass(font)
}

function titleSizeClass(s?: 's' | 'm' | 'l' | 'xl') {
  switch (s) {
    case 'xl':
      return 'text-3xl'
    case 'l':
      return 'text-2xl'
    case 's':
      return 'text-base'
    default:
      return 'text-xl'
  }
}

// Basic enumerated IANA timezones (common set); can be expanded
const timezones: Array<{ label: string; value: string }> = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'Europe/Madrid', value: 'Europe/Madrid' },
  { label: 'Europe/Rome', value: 'Europe/Rome' },
  { label: 'Europe/Amsterdam', value: 'Europe/Amsterdam' },
  { label: 'Europe/Stockholm', value: 'Europe/Stockholm' },
  { label: 'Europe/Helsinki', value: 'Europe/Helsinki' },
  { label: 'Africa/Johannesburg (Cape Town)', value: 'Africa/Johannesburg' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'America/Chicago', value: 'America/Chicago' },
  { label: 'America/Denver', value: 'America/Denver' },
  { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
  { label: 'America/Toronto', value: 'America/Toronto' },
  { label: 'America/Sao_Paulo', value: 'America/Sao_Paulo' },
  { label: 'Asia/Dubai', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata (Pune)', value: 'Asia/Kolkata' },
  { label: 'Asia/Singapore', value: 'Asia/Singapore' },
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
  { label: 'Australia/Perth', value: 'Australia/Perth' },
]

// Google Fonts options; value used directly in CSS font-family
const fontOptions = [
  { label: 'System', value: 'system' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Roboto Mono', value: 'Roboto Mono' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Noto Sans', value: 'Noto Sans' },
]

function fontClass(font: string | undefined) {
  switch (font) {
    case 'Inter':
      return 'font-inter'
    case 'Poppins':
      return 'font-poppins'
    case 'Bebas Neue':
      return 'font-bebas'
    case 'Roboto Mono':
      return 'font-mono'
    default:
      return ''
  }
}

function weightClass(w?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold') {
  switch (w) {
    case 'medium':
      return 'font-medium'
    case 'semibold':
      return 'font-semibold'
    case 'bold':
      return 'font-bold'
    case 'extrabold':
      return 'font-extrabold'
    default:
      return 'font-normal'
  }
}
