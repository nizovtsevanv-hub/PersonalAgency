import { useApp } from '../state/AppContext'

interface BiProps {
  en: string
  ru?: string
  className?: string
}

/**
 * Bilingual text: English always, Russian shown when the Russian-support
 * setting is on. Vocabulary cards do NOT use this — their Russian meaning is
 * part of the fixed word → IPA → Russian format and is always visible.
 */
export function Bi({ en, ru, className }: BiProps) {
  const { state } = useApp()
  return (
    <span className={className ? `bi ${className}` : 'bi'}>
      <span className="bi-en">{en}</span>
      {ru && state.settings.russianSupport && <span className="bi-ru" lang="ru">{ru}</span>}
    </span>
  )
}
