/**
 * Original, code-native SVG illustrations for every vocabulary word.
 * No stock imagery, no copyrighted artwork — simple friendly shapes only.
 */

interface WordArtProps {
  wordId: string
  size?: number
  className?: string
}

function Ship() {
  return (
    <g>
      <path d="M14 62 Q48 74 82 62 L74 78 Q48 86 22 78 Z" fill="#7E3FA1" />
      <rect x="34" y="42" width="28" height="16" rx="3" fill="#28C7D9" />
      <rect x="40" y="30" width="10" height="12" rx="2" fill="#FFC94A" />
      <circle cx="42" cy="50" r="3" fill="#F7FBFF" />
      <circle cx="54" cy="50" r="3" fill="#F7FBFF" />
      <path d="M6 80 q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0 q8 -6 16 0" fill="none" stroke="#28C7D9" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

function Sheep() {
  return (
    <g>
      <ellipse cx="50" cy="52" rx="28" ry="20" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2.5" />
      <circle cx="30" cy="40" r="9" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2.5" />
      <circle cx="48" cy="34" r="10" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2.5" />
      <circle cx="66" cy="38" r="9" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2.5" />
      <ellipse cx="79" cy="52" rx="10" ry="9" fill="#16233B" />
      <circle cx="82" cy="50" r="1.8" fill="#FFFFFF" />
      <path d="M86 47 q5 -3 4 3" fill="none" stroke="#16233B" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="36" y="68" width="5" height="12" rx="2.5" fill="#16233B" />
      <rect x="58" y="68" width="5" height="12" rx="2.5" fill="#16233B" />
    </g>
  )
}

function Sit() {
  return (
    <g>
      <rect x="56" y="30" width="8" height="42" rx="3" fill="#7E3FA1" />
      <rect x="30" y="56" width="34" height="8" rx="3" fill="#7E3FA1" />
      <rect x="30" y="64" width="7" height="18" rx="3" fill="#7E3FA1" />
      <rect x="57" y="64" width="7" height="18" rx="3" fill="#7E3FA1" />
      <circle cx="38" cy="34" r="8" fill="#FFC94A" />
      <path d="M38 42 q-2 8 4 12 l8 0" fill="none" stroke="#FFC94A" strokeWidth="7" strokeLinecap="round" />
      <path d="M42 54 l0 14" stroke="#FFC94A" strokeWidth="7" strokeLinecap="round" />
    </g>
  )
}

function Seat() {
  return (
    <g>
      <rect x="30" y="22" width="12" height="42" rx="5" fill="#28C7D9" />
      <rect x="30" y="54" width="40" height="12" rx="5" fill="#42C978" />
      <rect x="32" y="66" width="8" height="16" rx="3" fill="#16233B" opacity="0.75" />
      <rect x="60" y="66" width="8" height="16" rx="3" fill="#16233B" opacity="0.75" />
      <circle cx="36" cy="30" r="3" fill="#F7FBFF" />
    </g>
  )
}

function Fill() {
  return (
    <g>
      <path d="M34 40 L38 80 Q48 84 58 80 L62 40 Z" fill="none" stroke="#7E3FA1" strokeWidth="3.5" />
      <path d="M37 58 L39.5 79 Q48 82.5 56.5 79 L59 58 Q48 63 37 58 Z" fill="#28C7D9" />
      <path d="M48 22 q-3 8 0 14" fill="none" stroke="#28C7D9" strokeWidth="5" strokeLinecap="round" />
      <circle cx="52" cy="30" r="3" fill="#28C7D9" />
    </g>
  )
}

function Feel() {
  return (
    <g>
      <path d="M50 74 C34 60 26 50 30 40 C34 31 46 32 50 42 C54 32 66 31 70 40 C74 50 66 60 50 74 Z" fill="#D96DEB" />
      <path d="M50 74 C34 60 26 50 30 40" fill="none" stroke="#7E3FA1" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <circle cx="42" cy="44" r="3" fill="#FFFFFF" opacity="0.7" />
    </g>
  )
}

function Live() {
  return (
    <g>
      <path d="M24 52 L50 28 L76 52" fill="none" stroke="#7E3FA1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="31" y="52" width="38" height="28" rx="3" fill="#FFC94A" />
      <rect x="44" y="62" width="12" height="18" rx="2" fill="#7E3FA1" />
      <rect x="36" y="58" width="8" height="8" rx="1.6" fill="#F7FBFF" />
    </g>
  )
}

function Leave() {
  return (
    <g>
      <rect x="26" y="26" width="28" height="54" rx="3" fill="none" stroke="#7E3FA1" strokeWidth="4" />
      <rect x="30" y="30" width="20" height="46" rx="2" fill="#DCE5EE" />
      <circle cx="46" cy="54" r="2.6" fill="#16233B" />
      <path d="M56 53 L80 53 M72 44 L81 53 L72 62" fill="none" stroke="#42C978" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

function Bit() {
  return (
    <g>
      <circle cx="48" cy="54" r="24" fill="#FFC94A" />
      <path d="M62 34 a12 12 0 0 0 14 14 a24 24 0 0 1 -14 -14 Z" fill="#F7FBFF" />
      <circle cx="66" cy="38" r="10" fill="#F7FBFF" />
      <circle cx="42" cy="50" r="3" fill="#7E3FA1" />
      <circle cx="52" cy="62" r="3" fill="#7E3FA1" />
      <circle cx="38" cy="62" r="2.4" fill="#7E3FA1" />
    </g>
  )
}

function Beat() {
  return (
    <g>
      <ellipse cx="50" cy="46" rx="26" ry="10" fill="#F7FBFF" stroke="#7E3FA1" strokeWidth="3" />
      <path d="M24 46 L24 68 Q50 80 76 68 L76 46" fill="#D96DEB" stroke="#7E3FA1" strokeWidth="3" />
      <path d="M40 30 L58 42 M62 26 L44 40" stroke="#16233B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="38" cy="28" r="5" fill="#FFC94A" />
      <circle cx="64" cy="24" r="5" fill="#FFC94A" />
    </g>
  )
}

function Beach() {
  return (
    <g>
      <path d="M10 76 Q30 70 50 76 Q70 82 90 76 L90 84 L10 84 Z" fill="#FFC94A" />
      <path d="M56 30 L56 74" stroke="#7E3FA1" strokeWidth="4" strokeLinecap="round" />
      <path d="M56 30 Q34 30 28 46 Q42 40 56 44 Q70 40 84 46 Q78 30 56 30 Z" fill="#D96DEB" />
      <circle cx="24" cy="26" r="8" fill="#FFC94A" />
    </g>
  )
}

const ART: Record<string, () => ReturnType<typeof Ship>> = {
  ship: Ship,
  sheep: Sheep,
  sit: Sit,
  seat: Seat,
  fill: Fill,
  feel: Feel,
  live: Live,
  leave: Leave,
  bit: Bit,
  beat: Beat,
  beach: Beach,
}

/** Fallback keeps the layout intact if an unknown id ever appears. */
function GenericSound() {
  return (
    <g>
      <circle cx="50" cy="52" r="24" fill="#DCE5EE" />
      <path d="M40 44 L52 52 L40 60 Z" fill="#7E3FA1" />
      <path d="M60 42 q10 10 0 20" fill="none" stroke="#7E3FA1" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

export function WordArt({ wordId, size = 72, className }: WordArtProps) {
  const Art = ART[wordId] ?? GenericSound
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.86}
      viewBox="0 0 100 90"
      aria-hidden="true"
      focusable="false"
    >
      <Art />
    </svg>
  )
}
