import { useApp } from '../state/AppContext'
import { SCREEN_ORDER } from '../types/progress'
import { screenIndex } from '../state/appState'
import { ProgressBar } from './ProgressBar'

interface AppHeaderProps {
  onOpenSettings: () => void
}

const MODE_LABELS: Record<string, string> = {
  kids: 'Kids Lab',
  adults: 'Grown-ups Lab',
  together: 'Together Mode',
}

export function AppHeader({ onOpenSettings }: AppHeaderProps) {
  const { state, dispatch } = useApp()
  const idx = screenIndex(state.screen)
  const onFirst = state.screen === 'modeSelection'

  return (
    <header className="app-header">
      <div className="app-header-row">
        {!onFirst ? (
          <button
            type="button"
            className="icon-btn"
            onClick={() => dispatch({ type: 'BACK' })}
            aria-label="Go back to the previous step"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M14.5 5 L7.5 12 L14.5 19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="icon-btn icon-btn--ghost" aria-hidden="true" />
        )}

        <div className="app-header-title">
          <span className="app-header-module">FSL-P01 · Ship or Sheep?</span>
          {state.mode && <span className="app-header-mode">{MODE_LABELS[state.mode]}</span>}
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label="Open audio and settings"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 3.5 L12 6 M12 18 L12 20.5 M3.5 12 L6 12 M18 12 L20.5 12 M6 6 L7.8 7.8 M16.2 16.2 L18 18 M18 6 L16.2 7.8 M7.8 16.2 L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {!onFirst && <ProgressBar value={idx} max={SCREEN_ORDER.length - 1} />}
    </header>
  )
}
