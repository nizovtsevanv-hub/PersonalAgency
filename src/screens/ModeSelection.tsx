import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { Bi } from '../components/Bi'
import { nextScreen } from '../state/appState'
import type { Mode } from '../types/progress'

const MODES: Array<{
  id: Mode
  title: string
  tagline: string
  taglineRu: string
  icon: React.ReactNode
}> = [
  {
    id: 'kids',
    title: 'Kids Lab',
    tagline: 'Play with sounds',
    taglineRu: 'Играем со звуками',
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M19 8 L19 20 L10 36 Q8 41 13 41 L35 41 Q40 41 38 36 L29 20 L29 8" fill="none" stroke="#7E3FA1" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 8 L32 8" stroke="#7E3FA1" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M14 32 Q24 26 34 32 L37 37 Q38 39 35.5 39 L12.5 39 Q10 39 11 37 Z" fill="#28C7D9" />
        <circle cx="20" cy="34" r="2" fill="#F7FBFF" />
        <circle cx="28" cy="35" r="1.6" fill="#F7FBFF" />
      </svg>
    ),
  },
  {
    id: 'adults',
    title: 'Grown-ups Lab',
    tagline: 'Train British pronunciation',
    taglineRu: 'Тренируем британское произношение',
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="17" fill="none" stroke="#42C978" strokeWidth="3.4" />
        <path d="M24 13 L24 24 L31 29" fill="none" stroke="#42C978" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 40 q5 4 15 4 q10 0 15 -4" fill="none" stroke="#7E3FA1" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'together',
    title: 'Together Mode',
    tagline: 'Learn and speak together',
    taglineRu: 'Учимся и говорим вместе',
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="16" cy="16" r="7" fill="#28C7D9" />
        <circle cx="33" cy="14" r="5.4" fill="#D96DEB" />
        <path d="M6 40 Q6 28 16 28 Q26 28 26 40" fill="#28C7D9" opacity="0.65" />
        <path d="M25 38 Q25 26 33 26 Q41 26 41 38" fill="#D96DEB" opacity="0.65" />
        <path d="M20 22 Q24 25 28 21" fill="none" stroke="#FFC94A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function ModeSelection() {
  const { state, dispatch } = useApp()
  const [choice, setChoice] = useState<Mode | null>(state.mode)
  const hasProgress = state.completed.length > 0 && state.mode !== null

  const start = () => {
    if (!choice) return
    dispatch({ type: 'SELECT_MODE', mode: choice })
    dispatch({ type: 'GO_TO', screen: 'diagnostic' })
  }

  return (
    <ScreenLayout
      coachState="guiding"
      coachMessage="Hi! I’m Fluffy. Pick your lab and let’s explore two English sounds!"
      coachMessageRu="Привет! Я Флаффи. Выбери свою лабораторию — исследуем два английских звука!"
      actions={
        <>
          {hasProgress && (
            <button
              type="button"
              className="btn btn--soft"
              onClick={() =>
                dispatch({
                  type: 'GO_TO',
                  screen: nextScreen(state.completed[state.completed.length - 1] ?? 'modeSelection'),
                })
              }
            >
              <Bi en="Continue where I was" ru="Продолжить" />
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={start} disabled={!choice}>
            <Bi en="Start" ru="Начать" />
          </button>
        </>
      }
    >
      <div className="mode-hero">
        <p className="mode-brand">FLUFFY SOUND LAB</p>
        <h1 className="mode-heading">Who is learning today?</h1>
        <p className="mode-heading-ru" lang="ru">Кто сегодня учится?</p>
        <p className="mode-contrast ipa">
          <span className="ipa-ih">/ɪ/</span> ↔ <span className="ipa-ee">/iː/</span> · Ship or Sheep?
        </p>
      </div>
      <div className="mode-cards" role="radiogroup" aria-label="Who is learning today?">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={choice === m.id}
            className={`mode-card${choice === m.id ? ' is-selected' : ''}`}
            onClick={() => setChoice(m.id)}
          >
            <span className="mode-card-icon">{m.icon}</span>
            <span className="mode-card-title">{m.title}</span>
            <span className="mode-card-tagline">
              <Bi en={m.tagline} ru={m.taglineRu} />
            </span>
          </button>
        ))}
      </div>
    </ScreenLayout>
  )
}
