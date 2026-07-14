import type { SoundId } from '../types/content'
import { Bi } from './Bi'

interface MouthDiagramProps {
  sound: SoundId
  /** Adults get position labels; kids get the plain picture. */
  detailed?: boolean
  size?: number
}

/**
 * Original educational schematic of the mouth (side view). This is a
 * simplified teaching diagram, not an anatomical or medical illustration.
 * The tongue for /iː/ sits higher and more front than for /ɪ/; the lips for
 * /iː/ are slightly spread.
 */
export function MouthDiagram({ sound, detailed = false, size = 260 }: MouthDiagramProps) {
  const isEe = sound === 'ee'
  const accent = isEe ? 'var(--c-ee)' : 'var(--c-ih)'

  // Tongue body: /iː/ peaks higher and further forward than /ɪ/.
  const tonguePath = isEe
    ? 'M40 128 Q44 96 62 90 Q84 84 104 100 Q118 112 120 132 Q80 142 40 128 Z'
    : 'M40 130 Q48 104 68 99 Q88 94 106 106 Q118 116 120 133 Q80 143 40 130 Z'

  return (
    <div className={`mouth-diagram mouth-diagram--${sound}`}>
      <svg
        width={size}
        height={size * 0.85}
        viewBox="0 0 200 170"
        role="img"
        aria-label={
          isEe
            ? 'Mouth diagram for /iː/: tongue high and front, lips slightly spread, a longer clearer vowel'
            : 'Mouth diagram for /ɪ/: tongue high and near the front, jaw slightly open, lips relaxed, a shorter vowel'
        }
      >
        {/* head profile, facing left */}
        <path
          d="M96 8 Q46 10 36 52 Q32 68 30 80 L22 96 Q20 100 26 101 L32 102 Q30 112 33 116 Q36 120 33 124 Q30 134 42 136 L48 137 Q52 152 68 158 Q100 168 132 158 L132 8 Z"
          fill="#FDEEE2"
          stroke="#E4C4A8"
          strokeWidth="2"
        />
        {/* oral cavity */}
        <path d="M38 100 Q60 78 100 82 Q122 85 126 100 L126 138 Q80 150 42 134 Z" fill="#F7D6D0" />
        {/* palate line */}
        <path d="M40 98 Q66 80 100 84 Q118 87 124 98" fill="none" stroke="#C98D74" strokeWidth="3" strokeLinecap="round" />
        {/* teeth */}
        <rect x="36" y="98" width="8" height="9" rx="2" fill="#FFFFFF" stroke="#E4C4A8" strokeWidth="1" />
        <rect x="36" y="118" width="8" height="9" rx="2" fill="#FFFFFF" stroke="#E4C4A8" strokeWidth="1" />
        {/* tongue (animated between positions via CSS transition on d is unreliable, so we crossfade) */}
        <path className="mouth-tongue" d={tonguePath} fill={accent} opacity="0.85" />
        {/* lips: /iː/ slightly spread (longer line), /ɪ/ neutral */}
        <path
          d={isEe ? 'M24 108 Q34 104 46 106' : 'M26 107 Q33 106 40 107'}
          fill="none"
          stroke="#C2543F"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* eye + brow for friendliness */}
        <circle cx="52" cy="52" r="4" fill="#16233B" />
        <path d="M44 42 Q52 38 60 42" fill="none" stroke="#16233B" strokeWidth="2.4" strokeLinecap="round" />

        {detailed && (
          <g className="mouth-labels" fontSize="10" fontFamily="inherit" fill="#16233B">
            <line x1="80" y1="94" x2="80" y2="66" stroke="#7E3FA1" strokeWidth="1.4" />
            <text x="66" y="60">tongue {isEe ? 'higher + front' : 'high + front'}</text>
            <line x1="34" y1="108" x2="20" y2="150" stroke="#7E3FA1" strokeWidth="1.4" />
            <text x="6" y="162">{isEe ? 'lips slightly spread' : 'lips relaxed'}</text>
            <text x="132" y="150" fill="#7E3FA1">{isEe ? '/iː/ longer' : '/ɪ/ shorter'}</text>
          </g>
        )}
      </svg>
      <p className="mouth-caption">
        <Bi
          en="Educational schematic — not an anatomical drawing."
          ru="Учебная схема, не анатомический рисунок."
        />
      </p>
    </div>
  )
}
