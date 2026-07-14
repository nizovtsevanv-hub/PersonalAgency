# ASSET REGISTER — FSL-P01 “Ship or Sheep?”

All visual assets in this pilot are **original and code-native** (inline
SVG/CSS written for this project). No logos, screenshots, page layouts,
characters or illustrations were copied from Lingokids, Monty’s Alphabet
Book, Bob Books, Round-Up, workbook photographs or any stock library. Those
sources were treated as methodological references only.

| Asset | Purpose | Path | Status | How to replace |
|---|---|---|---|---|
| Fluffy mascot (11 states) | Pronunciation coach: neutral, guiding, listening, speaking, recording, supportive, correct, retry, /ɪ/ cyan, /iː/ emerald, gold completion | `src/components/FluffyCoach.tsx` | original, code-native SVG + CSS motion | Drop transparent PNG/SVG renders per state and swap the `FluffySvg` body for an `<img>` keyed by state; keep proportions and the state API |
| Word illustrations (ship, sheep, sit, seat, fill, feel, live, leave, bit, beat, beach) | Vocabulary card imagery | `src/components/WordArt.tsx` | original, code-native SVG | Replace the matching function in the `ART` map, or render `<img src>` for a given `wordId`; keep viewBox 100×90 |
| Ship ↔ sheep morph layers | VisualHook transformation | `src/screens/VisualHook.tsx` + `WordArt` | original, code-native SVG + CSS crossfade | Substitute richer artwork in `WordArt`; the crossfade container needs no change |
| Ship-and-sheep story scene | SpeechTransfer kids/together scene | `src/screens/SpeechTransfer.tsx` (`ShipSheepScene`) | original, code-native SVG | Replace the SVG inside `ShipSheepScene`, keep the `is-active` animation hook |
| Boss harbour (two flagged ships + sheep) | SoundBoss build stage | `src/screens/SoundBoss.tsx` (`BossHarbour`) | original, code-native SVG | Replace SVG; keep the `sheepOn` prop contract (`'ih' | 'ee' | null`) |
| Mouth articulation schematic | MouthLab teaching diagram (educational schematic, not anatomical) | `src/components/MouthDiagram.tsx` | original, code-native SVG | Replace paths; keep separate tongue shapes for /ɪ/ and /iː/ and the ARIA labels |
| Vowel chart | Adult vowel-space location | `src/components/VowelChart.tsx` | original, code-native SVG | Adjust polygon/dot positions; dots must stay ≥48 px touch targets |
| Sound waves (short/long) | Duration cue for /ɪ/ vs /iː/ | `src/components/SoundWave.tsx` | original, code-native SVG | Edit path data; keep `variant` prop |
| UI icons (speaker, back, settings, close, mode icons) | Interface controls | inline in `src/components/*` and `src/screens/ModeSelection.tsx` | original, inline SVG | Swap path data in place; keep `aria-hidden` and button labels |
| Favicon | Browser tab icon (mini Fluffy) | `public/favicon.svg` | original SVG | Replace file, keep the `<link rel="icon">` reference |
| Colour palette & typography | Visual identity | `src/styles/global.css` (`:root` custom properties) | original | Edit CSS variables; contrast must stay WCAG AA |

## Optional future asset slots

- `public/audio/*` — human-recorded British audio (see `AUDIO_REGISTER.md`).
  Missing files never break the app; TTS is the automatic fallback.
- Higher-fidelity Fluffy renders (transparent PNG/WebP per state) — reuse
  without distortion; never crop or recolour the character.
