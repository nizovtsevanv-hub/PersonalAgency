import { useApp } from '../state/AppContext'

export type FluffyState =
  | 'neutral'
  | 'guiding'
  | 'listening'
  | 'speaking'
  | 'recording'
  | 'supportive'
  | 'correct'
  | 'retry'
  | 'ih'
  | 'ee'
  | 'gold'

interface FluffyCoachProps {
  state?: FluffyState
  message?: string
  messageRu?: string
  /** Together Mode moves Fluffy toward the active participant. */
  side?: 'left' | 'center' | 'right'
  size?: number
}

const ACCENT: Partial<Record<FluffyState, string>> = {
  ih: '#28C7D9',
  ee: '#42C978',
  correct: '#FFC94A',
  gold: '#FFC94A',
  retry: '#D96DEB',
  supportive: '#D96DEB',
  recording: '#D96DEB',
}

/** Positions of the fluff-ring puffs around the body. */
const PUFFS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2
  return { cx: 60 + Math.cos(a) * 33, cy: 62 + Math.sin(a) * 33 }
})

function Mouth({ state }: { state: FluffyState }) {
  if (state === 'speaking' || state === 'recording') {
    return <ellipse cx="60" cy="78" rx="6" ry="4.6" fill="#5D3A78" />
  }
  if (state === 'correct' || state === 'gold') {
    return <path d="M50 75 Q60 87 70 75 Q60 80 50 75 Z" fill="#5D3A78" />
  }
  if (state === 'retry' || state === 'supportive') {
    return <circle cx="60" cy="78" r="3.4" fill="#5D3A78" />
  }
  return (
    <path
      d="M52 76 Q60 82.5 68 76"
      fill="none"
      stroke="#5D3A78"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  )
}

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
  return (
    <path
      className="fluffy-sparkle"
      style={{ animationDelay: `${delay}ms` }}
      d={`M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`}
      fill="#FFC94A"
    />
  )
}

export function FluffySvg({ state = 'neutral', size = 120 }: { state?: FluffyState; size?: number }) {
  const accent = ACCENT[state]
  const eyeShift = state === 'listening' ? 3 : 0
  return (
    <svg
      className={`fluffy fluffy--${state}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Fluffy the pronunciation coach (${state})`}
    >
      <defs>
        <radialGradient id="fluffyFur" cx="0.42" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F6ECFC" />
          <stop offset="1" stopColor="#DCC3EE" />
        </radialGradient>
        <radialGradient id="fluffyGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.5" stopColor={accent ?? '#C9A9E0'} stopOpacity="0.34" />
          <stop offset="1" stopColor={accent ?? '#C9A9E0'} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft glow behind the fur */}
      <circle cx="60" cy="62" r="56" fill="url(#fluffyGlow)" />

      {/* /iː/ longer emerald light trail */}
      {state === 'ee' && (
        <g className="fluffy-trail">
          <circle cx="14" cy="62" r="5" fill="#42C978" opacity="0.25" />
          <circle cx="24" cy="58" r="6.5" fill="#42C978" opacity="0.4" />
          <circle cx="35" cy="55" r="8" fill="#42C978" opacity="0.55" />
        </g>
      )}
      {/* /ɪ/ short cyan impulse */}
      {state === 'ih' && (
        <circle className="fluffy-impulse" cx="60" cy="62" r="44" fill="none" stroke="#28C7D9" strokeWidth="3" />
      )}

      {/* tiny side arms */}
      <ellipse className="fluffy-arm fluffy-arm--l" cx="19" cy="70" rx="7" ry="10" fill="#E7D4F5" transform="rotate(18 19 70)" />
      <ellipse className="fluffy-arm fluffy-arm--r" cx="101" cy="70" rx="7" ry="10" fill="#E7D4F5" transform="rotate(-18 101 70)" />

      {/* fluff ring + body */}
      <g className="fluffy-body">
        {PUFFS.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="13.5" fill="#EFDFF9" />
        ))}
        <circle cx="60" cy="62" r="40" fill="url(#fluffyFur)" />
        {/* subtle fur strokes */}
        <path d="M38 36 q4 -6 10 -7 M72 29 q6 1 9 6 M30 76 q-4 4 -3 9 M90 74 q4 4 3 9" stroke="#D9BFEC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* eyes: huge, glossy, expressive */}
        <g className="fluffy-eyes" transform={`translate(${eyeShift} 0)`}>
          <ellipse cx="46" cy="57" rx="9.5" ry="11" fill="#16233B" />
          <ellipse cx="74" cy="57" rx="9.5" ry="11" fill="#16233B" />
          <circle cx="43" cy="52.5" r="3.4" fill="#FFFFFF" />
          <circle cx="71" cy="52.5" r="3.4" fill="#FFFFFF" />
          <circle cx="49" cy="61" r="1.6" fill="#FFFFFF" opacity="0.85" />
          <circle cx="77" cy="61" r="1.6" fill="#FFFFFF" opacity="0.85" />
          {(state === 'correct' || state === 'gold') && (
            <>
              <circle cx="46" cy="54" r="1.4" fill="#FFC94A" />
              <circle cx="74" cy="54" r="1.4" fill="#FFC94A" />
            </>
          )}
        </g>

        {/* blush */}
        <ellipse cx="36" cy="70" rx="5.5" ry="3.4" fill="#F5C7E4" opacity="0.75" />
        <ellipse cx="84" cy="70" rx="5.5" ry="3.4" fill="#F5C7E4" opacity="0.75" />

        <Mouth state={state} />
      </g>

      {/* recording badge */}
      {state === 'recording' && (
        <g>
          <circle className="fluffy-rec-dot" cx="96" cy="26" r="6" fill="#D96DEB" />
          <circle cx="96" cy="26" r="9.5" fill="none" stroke="#D96DEB" strokeWidth="1.6" opacity="0.5" />
        </g>
      )}

      {/* headphones while listening */}
      {state === 'listening' && (
        <g opacity="0.9">
          <path d="M28 50 Q30 20 60 18 Q90 20 92 50" fill="none" stroke="#7E3FA1" strokeWidth="4.4" strokeLinecap="round" />
          <rect x="22" y="47" width="10" height="16" rx="5" fill="#7E3FA1" />
          <rect x="88" y="47" width="10" height="16" rx="5" fill="#7E3FA1" />
        </g>
      )}

      {/* gold completion sparkles */}
      {(state === 'correct' || state === 'gold') && (
        <g>
          <Sparkle x={22} y={30} s={6} delay={0} />
          <Sparkle x={98} y={36} s={5} delay={180} />
          {state === 'gold' && <Sparkle x={60} y={12} s={7} delay={360} />}
        </g>
      )}

      {/* guiding raised arm hint */}
      {state === 'guiding' && (
        <ellipse cx="103" cy="52" rx="7" ry="10" fill="#E7D4F5" transform="rotate(-52 103 52)" />
      )}
    </svg>
  )
}

/**
 * Fluffy plus its coach bubble. One short prompt at a time; Fluffy never
 * covers content — the coach area is part of the normal layout flow.
 */
export function FluffyCoach({ state = 'neutral', message, messageRu, side = 'left', size = 96 }: FluffyCoachProps) {
  const { state: appState } = useApp()
  return (
    <div className={`coach coach--${side}`}>
      <div className="coach-fluffy">
        <FluffySvg state={state} size={size} />
      </div>
      {message && (
        <div className="coach-bubble" role="status" aria-live="polite">
          <p className="coach-msg">{message}</p>
          {messageRu && appState.settings.russianSupport && (
            <p className="coach-msg-ru" lang="ru">{messageRu}</p>
          )}
        </div>
      )}
    </div>
  )
}
