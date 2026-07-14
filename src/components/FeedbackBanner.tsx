import { useApp } from '../state/AppContext'

interface FeedbackBannerProps {
  kind: 'correct' | 'retry' | 'info'
  en: string
  ru?: string
  action?: { label: string; onClick: () => void }
}

const ICONS: Record<FeedbackBannerProps['kind'], string> = {
  correct: '★',
  retry: '↻',
  info: 'ℹ',
}

/**
 * Supportive feedback. Gold for success, magenta for retry — never red,
 * never “failed”, and never colour-only (icon + text always present).
 */
export function FeedbackBanner({ kind, en, ru, action }: FeedbackBannerProps) {
  const { state } = useApp()
  return (
    <div className={`feedback feedback--${kind}`} role="status" aria-live="polite">
      <span className="feedback-icon" aria-hidden="true">{ICONS[kind]}</span>
      <span className="feedback-text">
        <span>{en}</span>
        {ru && state.settings.russianSupport && <span className="feedback-ru" lang="ru">{ru}</span>}
      </span>
      {action && (
        <button type="button" className="btn btn--soft feedback-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
