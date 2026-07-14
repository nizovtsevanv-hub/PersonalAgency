interface SoundWaveProps {
  variant: 'short' | 'long'
  playing?: boolean
  width?: number
}

/**
 * Visual duration cue: /ɪ/ gets a short compact wave, /iː/ a longer smooth
 * one. Purely decorative reinforcement — meaning is never colour-only, the
 * IPA labels always accompany it.
 */
export function SoundWave({ variant, playing = false, width = 120 }: SoundWaveProps) {
  const isShort = variant === 'short'
  const color = isShort ? 'var(--c-ih)' : 'var(--c-ee)'
  const path = isShort
    ? 'M6 20 Q14 6 22 20 Q30 34 38 20 Q46 6 54 20'
    : 'M6 20 Q16 8 26 20 Q36 32 46 20 Q56 8 66 20 Q76 32 86 20 Q96 8 106 20 Q112 14 114 20'
  return (
    <svg
      className={`soundwave${playing ? ' is-playing' : ''}`}
      width={width}
      height={40}
      viewBox={isShort ? '0 0 60 40' : '0 0 120 40'}
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
