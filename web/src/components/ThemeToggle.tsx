import { useTimerConfig } from '../state/config'

export function ThemeToggle() {
  const { config, updateConfig } = useTimerConfig()
  const isLight = config.theme === 'light'
  const toggle = () => {
    updateConfig({ theme: isLight ? 'dark' : 'light', fg: isLight ? '#FFFFFF' : '#000000', bg: isLight ? '#000000' : '#FFFFFF' })
  }
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 grid place-items-center rounded-md border ui-border bg-[color:var(--ui-panel-bg)] hover:bg-white/10"
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  )
}

