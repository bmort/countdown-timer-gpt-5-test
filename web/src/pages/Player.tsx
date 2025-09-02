import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DateTime, Duration } from 'luxon'
import { useTimerConfig, parseDurationToMs, serializeConfigToQuery } from '../state/config'
import { useGoogleFont } from '../hooks/useGoogleFont'
import { buildAccentGlow } from '../utils/color'
import { beep, chimeEnd } from '../utils/sound'

export function Player() {
  const [search] = useSearchParams()
  const { updateConfig } = useTimerConfig()

  useEffect(() => {
    const next = Object.fromEntries(search.entries())
    updateConfig({ fromQuery: next })
  }, [search, updateConfig])

  // If arriving to until mode without values, default to 10 minutes ahead (mirrors editor behavior)
  useEffect(() => {
    const qs = Object.fromEntries(search.entries())
    if ((qs.mode ?? 'duration') !== 'until') return
    const hasAny = qs.to || (qs.date && qs.time)
    if (hasAny) return
    const nowPlus = new Date(Date.now() + 10 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${nowPlus.getFullYear()}-${pad(nowPlus.getMonth() + 1)}-${pad(nowPlus.getDate())}`
    const time = `${pad(nowPlus.getHours())}:${pad(nowPlus.getMinutes())}:${pad(nowPlus.getSeconds())}`
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    updateConfig({ date, time, tz })
  }, [search, updateConfig])

  return (
    <div className="w-screen h-screen bg-black text-white">
      <TimerView />
    </div>
  )
}

function TimerView() {
  const { config } = useTimerConfig()
  useGoogleFont(config.font)
  useGoogleFont(config.titleFont)
  const [now, setNow] = useState(performance.now())
  const startRef = useRef<number | null>(null)
  const pausedAccumRef = useRef<number>(0)
  const [isRunning, setIsRunning] = useState(false)
  const lastBeepRef = useRef<number>(-1)

  // target end timestamp in ms relative to performance.now()
  const targetDeltaMs = useMemo(() => {
    if (config.mode === 'until') {
      const tz = config.tz || Intl.DateTimeFormat().resolvedOptions().timeZone
      const iso = `${config.date ?? ''}T${config.time ?? '00:00:00'}`
      const target = DateTime.fromISO(iso, { zone: tz })
      const wall = DateTime.now().setZone(tz)
      const ms = target.toMillis() - wall.toMillis()
      return Math.max(ms, 0)
    }
    return parseDurationToMs(config.d)
  }, [config])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleToggle()
      } else if (e.key.toLowerCase() === 'r') {
        startRef.current = null
        pausedAccumRef.current = 0
        setNow(performance.now())
        setIsRunning(false)
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const t = performance.now()
      setNow(t)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Auto-start if query contains autostart=1
  useEffect(() => {
    const qs = Object.fromEntries(new URLSearchParams(window.location.search).entries())
    if (qs.autostart === '1') {
      setIsRunning(true)
    }
  }, [])

  const handleToggle = () => {
    if (isRunning) {
      // Pausing: accumulate elapsed time and clear start
      if (startRef.current != null) {
        pausedAccumRef.current += now - startRef.current
        startRef.current = null
      }
      setIsRunning(false)
    } else {
      // Resuming: mark new start
      startRef.current = now
      setIsRunning(true)
    }
  }

  const remainingMs = useMemo(() => {
    if (!isRunning) {
      return Math.max(targetDeltaMs - pausedAccumRef.current, 0)
    }
    if (startRef.current == null) {
      startRef.current = now
      return Math.max(targetDeltaMs - pausedAccumRef.current, 0)
    }
    const delta = now - startRef.current
    const ms = Math.max(targetDeltaMs - pausedAccumRef.current - delta, 0)
    return ms
  }, [now, isRunning, targetDeltaMs])

  const d = Duration.fromMillis(remainingMs).shiftTo('hours', 'minutes', 'seconds')
  const hh = Math.floor(d.hours).toString().padStart(2, '0')
  const mm = Math.floor(d.minutes).toString().padStart(2, '0')
  const ss = Math.floor(d.seconds).toString().padStart(2, '0')
  const secondsTotal = Math.floor(remainingMs / 1000)

  // Sounds: beep each second in last 5s, soft beep per 10s in last minute
  useEffect(() => {
    if (!isRunning) return
    if (secondsTotal <= 0) return
    if (secondsTotal <= 5) {
      if (lastBeepRef.current !== secondsTotal) {
        lastBeepRef.current = secondsTotal
        beep({ frequency: 880, durationMs: 90, volume: 0.08 })
      }
    } else if (secondsTotal <= 60) {
      if (secondsTotal % 10 === 0 && lastBeepRef.current !== secondsTotal) {
        lastBeepRef.current = secondsTotal
        beep({ frequency: 660, durationMs: 80, volume: 0.06 })
      }
    }
  }, [secondsTotal, isRunning])

  // End chime
  useEffect(() => {
    if (isRunning && remainingMs === 0) {
      chimeEnd()
    }
  }, [remainingMs, isRunning])

  // Base font size mapping (vw):
  // s:14vw, m:18vw (old XL), l:22vw, xl:26vw
  const baseVw = config.fs === 'xl' ? 26 : config.fs === 'l' ? 22 : config.fs === 's' ? 14 : 18
  const scaleRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const measure = () => {
      const el = measureRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const availW = window.innerWidth * 0.98
      const availH = window.innerHeight * 0.75
      if (rect.width === 0 || rect.height === 0) return
      const sW = availW / rect.width
      const sH = availH / rect.height
      const s = Math.min(1, sW, sH)
      // Avoid needless state churn
      setScale((prev) => (Math.abs(prev - s) > 0.01 ? s : prev))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (measureRef.current) ro.observe(measureRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [baseVw, config.font])
  const backHref = `/?${serializeConfigToQuery(config)}`

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none" style={{ color: config.fg, background: config.bg }}>
      {config.title && (
        <div
          className={`${titleFontClass(config.titleFont ?? config.font)} ${titleSizeClass(config.titleSize)} mb-4`}
          style={{ color: config.titleColor ?? (config.bg && config.bg.toLowerCase() === '#ffffff' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)') }}
        >
          {config.title}
        </div>
      )}
      <div className="relative">
        <div
          className="absolute inset-0 -z-10 blur-3xl opacity-80"
          style={{ backgroundImage: buildAccentGlow(config.accent), filter: 'blur(50px)' }}
        />
        <div
          ref={scaleRef}
          className="inline-block"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          <span
            ref={measureRef}
            className={`whitespace-nowrap font-bold leading-none ${fontClass(config.font)} ${fxClass(config.fx, secondsTotal)}`}
            style={{ fontSize: `${baseVw}vw`, ...(config.fx === 'neon' ? { textShadow: `0 0 8px ${config.accent}80, 0 0 28px ${config.accent}40` } : null) }}
          >
            {hh !== '00' ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`}
          </span>
        </div>
      </div>
      {(config.bar ?? '1') !== '0' && (
        <div className="w-full max-w-4xl mx-auto h-3 rounded mt-8" style={{ backgroundColor: config.bg && config.bg.toLowerCase() === '#ffffff' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded"
            style={{
              width: `${progressPercent(remainingMs, targetDeltaMs)}%`,
              backgroundColor: config.accent,
            }}
          />
        </div>
      )}
      <Controls
        isRunning={isRunning}
        onToggle={handleToggle}
        onReset={() => {
          startRef.current = null
          pausedAccumRef.current = 0
          setIsRunning(false)
        }}
        backHref={backHref}
      />
    </div>
  )
}

function progressPercent(remaining: number, total: number) {
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, 100 - (remaining / total) * 100))
}

function Controls({ isRunning, onToggle, onReset, backHref }: { isRunning: boolean; onToggle: () => void; onReset: () => void; backHref: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
      <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20" onClick={onToggle}>{isRunning ? 'Pause' : 'Start'}</button>
      <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20" onClick={onReset}>Reset</button>
      <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20" onClick={toggleFullscreen}>Full-screen</button>
      <a className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20" href={backHref}>Back to Config</a>
    </div>
  )
}

function toggleFullscreen() {
  const el = document.documentElement
  if (!document.fullscreenElement) {
    el.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

function titleFontClass(font?: string) {
  return fontClass(font)
}

function titleSizeClass(s?: 's' | 'm' | 'l' | 'xl') {
  switch (s) {
    case 'xl':
      return 'text-5xl'
    case 'l':
      return 'text-4xl'
    case 's':
      return 'text-lg'
    default:
      return 'text-2xl'
  }
}

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

function fxClass(fx: string | undefined, secondsTotal: number) {
  switch (fx) {
    case 'pulse-sec':
      return 'animate-[pulse_1s_ease-in-out_infinite]'
    case 'pulse-min': {
      // Pop at minute boundaries
      return secondsTotal % 60 === 0 ? 'animate-[pop_300ms_ease-out_1]' : ''
    }
    case 'pop-sec':
      return 'animate-[pop_300ms_ease-out_1]'
    case 'flip-sec':
      return secondsTotal % 1 === 0 ? 'transition-transform duration-300 will-change-transform' : ''
    case 'neon':
      return 'animate-[neonPulse_1.2s_ease-in-out_infinite]'
    case 'shake-10s':
      return secondsTotal <= 10 ? 'animate-[shake_600ms_ease-in-out_infinite]' : ''
    default:
      return ''
  }
}
