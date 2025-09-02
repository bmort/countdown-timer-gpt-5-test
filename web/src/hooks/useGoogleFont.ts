import { useEffect } from 'react'

function buildGoogleFontsHref(fontFamily: string): string {
  // e.g., "Noto Sans" -> family=Noto+Sans:wght@400;600;800&display=swap
  const family = fontFamily.trim().replace(/\s+/g, '+')
  const weights = 'wght@400;600;800'
  return `https://fonts.googleapis.com/css2?family=${family}:${weights}&display=swap`
}

export function ensureGoogleFontLoaded(fontFamily?: string) {
  if (!fontFamily) return
  if (fontFamily === 'system') return
  const id = `gf-${fontFamily.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = buildGoogleFontsHref(fontFamily)
  document.head.appendChild(link)
}

export function useGoogleFont(fontFamily?: string) {
  useEffect(() => {
    if (!fontFamily || fontFamily === 'system') return
    ensureGoogleFontLoaded(fontFamily)
  }, [fontFamily])
}


