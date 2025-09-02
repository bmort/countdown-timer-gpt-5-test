let audioCtx: AudioContext | null = null

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return audioCtx
}

export function beep({ frequency = 880, durationMs = 120, volume = 0.1 }: { frequency?: number; durationMs?: number; volume?: number }) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.value = volume
  osc.connect(gain)
  gain.connect(ctx.destination)
  const now = ctx.currentTime
  osc.start(now)
  osc.stop(now + durationMs / 1000)
}

export function chimeEnd() {
  // short triad
  beep({ frequency: 660, durationMs: 140, volume: 0.12 })
  setTimeout(() => beep({ frequency: 880, durationMs: 160, volume: 0.12 }), 120)
  setTimeout(() => beep({ frequency: 990, durationMs: 180, volume: 0.12 }), 280)
}


