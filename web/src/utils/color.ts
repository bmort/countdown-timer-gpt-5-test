function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.trim().toLowerCase().match(/^#?([0-9a-f]{6})$/i)
  if (!m) return null
  const int = parseInt(m[1], 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

function rgba(rgb: { r: number; g: number; b: number }, a: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
}

export function buildAccentGlow(accent?: string): string | undefined {
  const fallback = { r: 34, g: 211, b: 238 } // #22D3EE
  const rgb = (accent && hexToRgb(accent)) || fallback
  // Soft radial gradient glow spreading outwards
  const c0 = rgba(rgb, 0.35)
  const c1 = rgba(rgb, 0.18)
  const c2 = rgba(rgb, 0.0)
  return `radial-gradient(ellipse at center, ${c0} 0%, ${c1} 50%, ${c2} 75%)`
}


