import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import { getVoiceStatus, isSpeechAvailable } from '../services/audioService'
import { Bi } from './Bi'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { state, dispatch } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setConfirmReset(false)
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLElement>('button, input')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const voice = getVoiceStatus()
  const voiceNote = !isSpeechAvailable()
    ? { en: 'Speech synthesis is unavailable on this device. Audio buttons show text; use listen-and-repeat with a grown-up.', ru: 'Синтез речи недоступен. Кнопки озвучки покажут текст — повторяйте вслух вместе со взрослым.' }
    : voice === 'tts-en-gb'
      ? { en: 'Using a British English (en-GB) synthetic voice. Human-recorded audio is used automatically when files are present.', ru: 'Используется британский синтетический голос (en-GB). Записи диктора подключаются автоматически, если файлы есть.' }
      : voice === 'tts-en-other'
        ? { en: 'No British (en-GB) voice was found, so another English voice is used as a fallback.', ru: 'Британский голос (en-GB) не найден — используется другой английский голос.' }
        : { en: 'No English voice found yet. Audio may become available after the first tap.', ru: 'Английский голос пока не найден. Звук может появиться после первого нажатия.' }

  const toggle = (key: 'quietMode' | 'russianSupport' | 'adultGate') => {
    dispatch({ type: 'SET_SETTINGS', patch: { [key]: !state.settings[key] } })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal settings-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Audio and settings"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2><Bi en="Settings" ru="Настройки" /></h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <label className="setting-row">
          <span className="setting-label">
            <Bi en="Quiet Mode" ru="Тихий режим" />
            <small><Bi en="Fewer celebration effects, audio only on tap" ru="Меньше эффектов, звук только по нажатию" /></small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={state.settings.quietMode}
            onChange={() => toggle('quietMode')}
            aria-label="Quiet Mode"
          />
        </label>

        <label className="setting-row">
          <span className="setting-label">
            <Bi en="Russian support" ru="Подсказки на русском" />
            <small><Bi en="Show Russian hints under instructions" ru="Показывать русские подсказки под заданиями" /></small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={state.settings.russianSupport}
            onChange={() => toggle('russianSupport')}
            aria-label="Russian support"
          />
        </label>

        {state.mode === 'adults' && (
          <label className="setting-row">
            <span className="setting-label">
              <Bi en="Adult content gate" ru="Взрослый фильтр" />
              <small>
                <Bi
                  en="Show the beach/bitch pronunciation warning in Grown-ups Lab"
                  ru="Показать предупреждение о произношении beach в Grown-ups Lab"
                />
              </small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={state.settings.adultGate}
              onChange={() => toggle('adultGate')}
              aria-label="Adult content gate"
            />
          </label>
        )}

        <div className="setting-note" role="note">
          <strong><Bi en="Voice" ru="Голос" /></strong>
          <p><Bi en={voiceNote.en} ru={voiceNote.ru} /></p>
        </div>

        <div className="setting-note" role="note">
          <strong><Bi en="Privacy" ru="Приватность" /></strong>
          <p>
            <Bi
              en="Recordings and the mirror camera stay on this device only. Nothing is uploaded or stored."
              ru="Записи и изображение с камеры остаются только на этом устройстве. Ничего не загружается и не сохраняется."
            />
          </p>
        </div>

        {!confirmReset ? (
          <button type="button" className="btn btn--soft" onClick={() => setConfirmReset(true)}>
            <Bi en="Reset progress" ru="Сбросить прогресс" />
          </button>
        ) : (
          <div className="reset-confirm">
            <p><Bi en="Delete all local progress for this module?" ru="Удалить весь локальный прогресс этого модуля?" /></p>
            <div className="reset-confirm-actions">
              <button
                type="button"
                className="btn btn--soft"
                onClick={() => setConfirmReset(false)}
              >
                <Bi en="Keep it" ru="Оставить" />
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  dispatch({ type: 'RESET_PROGRESS' })
                  setConfirmReset(false)
                  onClose()
                }}
              >
                <Bi en="Yes, reset" ru="Да, сбросить" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
