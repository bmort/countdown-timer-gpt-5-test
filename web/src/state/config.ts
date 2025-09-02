import { create } from 'zustand'
import { z } from 'zod'

export type TimerMode = 'duration' | 'until'

export type Config = {
  mode: TimerMode
  // duration mode
  d?: string
  // until mode
  date?: string
  time?: string
  tz?: string

  title?: string
  titleFont?: string | 'system'
  titleSize?: 's' | 'm' | 'l' | 'xl'
  titleColor?: string
  ui?: '0' | '1'
  theme?: 'dark' | 'light'
  font?: string | 'system'
  fs?: 's' | 'm' | 'l' | 'xl'
  fg?: string
  bg?: string
  accent?: string
  bar?: '0' | '1'
  ring?: '0' | '1'
  alert?: 'none' | 'sound' | 'flash' | 'both'
  repeat?: string
  repevery?: string
  overrun?: '0' | '1'
  fullscreen?: '0' | '1'
  fx?: 'none' | 'pulse-sec' | 'pulse-min' | 'flip-sec' | 'neon' | 'shake-10s' | 'pop-sec'
}

export const defaultConfig: Config = {
  mode: 'duration',
  // Default size is the new Medium (previously XL)
  fs: 'm',
  theme: 'dark',
  font: 'Inter',
  fg: '#FFFFFF',
  bg: '#000000',
  accent: '#22D3EE',
  bar: '1',
  ui: '1',
  fx: 'none',
}

const querySchema = z.object({}).catchall(z.string())

type Store = {
  config: Config
  updateConfig: (partial: Partial<Config> & { fromQuery?: Record<string, string> }) => void
  resetConfig: () => void
}

export const useTimerConfig = create<Store>((set) => ({
  config: defaultConfig,
  updateConfig: (partial) => {
    if ('fromQuery' in partial && partial.fromQuery) {
      const q = querySchema.parse(partial.fromQuery)
      set((s) => ({ config: applyQueryToConfig(s.config, q) }))
      return
    }
    set((s) => ({ config: { ...s.config, ...partial } }))
  },
  resetConfig: () => set(() => ({ config: defaultConfig })),
}))

export function serializeConfigToQuery(config: Config): string {
  const params = new URLSearchParams()
  const add = (k: string, v: unknown) => {
    if (v == null) return
    params.set(k, String(v))
  }
  add('mode', config.mode)
  if (config.mode === 'duration') add('d', config.d)
  if (config.mode === 'until') {
    add('to', buildToISO(config))
    add('tz', config.tz)
  }
  add('title', config.title)
  add('tfont', config.titleFont)
  add('tfs', config.titleSize)
  add('tfg', config.titleColor)
  add('ui', config.ui)
  add('theme', config.theme)
  add('font', config.font)
  add('fs', config.fs)
  add('fg', config.fg)
  add('bg', config.bg)
  add('accent', config.accent)
  add('bar', config.bar)
  add('ring', config.ring)
  add('alert', config.alert)
  add('repeat', config.repeat)
  add('repevery', config.repevery)
  add('overrun', config.overrun)
  add('fullscreen', config.fullscreen)
  add('fx', config.fx)
  return params.toString()
}

export function applyQueryToConfig(prev: Config, q: Record<string, string>): Config {
  const next: Config = { ...prev }
  const mode = q.mode === 'until' ? 'until' : 'duration'
  next.mode = mode
  if (mode === 'duration') {
    next.d = q.d || prev.d
  } else {
    const { date, time } = parseToISO(q.to)
    next.date = q.date ?? date
    next.time = q.time ?? time
    next.tz = q.tz || prev.tz
  }
  next.title = q.title ?? prev.title
  next.titleFont = q.tfont ?? prev.titleFont
  next.titleSize = pick(q.tfs, ['s', 'm', 'l', 'xl'] as const) ?? prev.titleSize
  next.titleColor = q.tfg ?? prev.titleColor
  next.ui = pick(q.ui, ['0', '1'] as const) ?? prev.ui
  next.theme = pick(q.theme, ['dark', 'light'] as const) ?? prev.theme
  next.font = q.font ?? prev.font
  next.fs = pick(q.fs, ['s', 'm', 'l', 'xl'] as const) ?? prev.fs
  next.fg = q.fg ?? prev.fg
  next.bg = q.bg ?? prev.bg
  next.accent = q.accent ?? prev.accent
  next.bar = pick(q.bar, ['0', '1'] as const) ?? prev.bar
  next.ring = pick(q.ring, ['0', '1'] as const) ?? prev.ring
  next.alert = pick(q.alert, ['none', 'sound', 'flash', 'both'] as const) ?? prev.alert
  next.repeat = q.repeat ?? prev.repeat
  next.repevery = q.repevery ?? prev.repevery
  next.overrun = pick(q.overrun, ['0', '1'] as const) ?? prev.overrun
  next.fullscreen = pick(q.fullscreen, ['0', '1'] as const) ?? prev.fullscreen
  next.fx = pick(q.fx, ['none', 'pulse-sec', 'pulse-min', 'flip-sec', 'neon', 'shake-10s', 'pop-sec'] as const) ?? prev.fx
  return next
}

function parseToISO(to?: string): { date?: string; time?: string } {
  if (!to) return {}
  // Accept both local ISO and Zulu
  const m = to.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2})?)(Z)?$/)
  if (!m) return {}
  return { date: m[1], time: m[2] }
}

export function buildToISO(config: Config): string | undefined {
  if (!config.date || !config.time) return undefined
  return `${config.date}T${config.time}`
}

export function parseDurationToMs(d?: string): number {
  if (!d) return 0
  const str = d.trim()
  // Support HH:MM:SS or MM:SS
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => Number(p))
    if (parts.some((n) => Number.isNaN(n))) return 0
    let hours = 0, minutes = 0, seconds = 0
    if (parts.length === 3) {
      ;[hours, minutes, seconds] = parts
    } else if (parts.length === 2) {
      ;[minutes, seconds] = parts
    } else {
      return 0
    }
    return ((hours * 60 + minutes) * 60 + seconds) * 1000
  }
  let hours = 0, minutes = 0, seconds = 0
  const parts = str.match(/\d+[hms]/g) || []
  for (const p of parts) {
    if (p.endsWith('h')) hours += Number(p.slice(0, -1))
    else if (p.endsWith('m')) minutes += Number(p.slice(0, -1))
    else if (p.endsWith('s')) seconds += Number(p.slice(0, -1))
  }
  return ((hours * 60 + minutes) * 60 + seconds) * 1000
}

function pick<T extends readonly string[]>(v: string | undefined, allowed: T): T[number] | undefined {
  if (!v) return undefined
  return (allowed as readonly string[]).includes(v) ? (v as T[number]) : undefined
}
