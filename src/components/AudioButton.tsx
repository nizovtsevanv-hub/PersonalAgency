import { useState } from 'react'
import { useAudio } from '../hooks/useAudio'

interface AudioButtonProps {
  audioKey: string
  text: string
  label?: string
  ariaLabel?: string
  variant?: 'primary' | 'chip' | 'icon' | 'ghost'
  accent?: 'ih' | 'ee' | 'brand'
  rate?: number
  disabled?: boolean
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

export function SpeakerIcon({ playing }: { playing?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9 L8 9 L13 4.5 L13 19.5 L8 15 L4 15 Z" fill="currentColor" />
      <path
        d="M16 9 q2.6 3 0 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={playing ? 1 : 0.55}
      />
      <path
        d="M18.5 6.5 q4.4 5.5 0 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={playing ? 1 : 0.3}
      />
    </svg>
  )
}

/**
 * Accessible audio trigger. Repeated presses alternate rate 1.0 ↔ 0.85
 * (handled inside the audio service).
 */
export function AudioButton({
  audioKey,
  text,
  label,
  ariaLabel,
  variant = 'chip',
  accent = 'brand',
  rate,
  disabled,
  onPlayStart,
  onPlayEnd,
}: AudioButtonProps) {
  const { play, playingKey } = useAudio()
  const [busy, setBusy] = useState(false)
  const playing = busy || playingKey === audioKey

  const handle = async () => {
    if (busy) return
    setBusy(true)
    onPlayStart?.()
    await play(audioKey, text, rate !== undefined ? { rate } : undefined)
    setBusy(false)
    onPlayEnd?.()
  }

  return (
    <button
      type="button"
      className={`audio-btn audio-btn--${variant} accent--${accent}${playing ? ' is-playing' : ''}`}
      onClick={handle}
      disabled={disabled}
      aria-label={ariaLabel ?? `Play audio: ${label ?? text}`}
      aria-pressed={playing}
    >
      <SpeakerIcon playing={playing} />
      {label && variant !== 'icon' && <span>{label}</span>}
    </button>
  )
}
