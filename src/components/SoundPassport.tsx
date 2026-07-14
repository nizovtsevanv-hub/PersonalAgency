import { Bi } from './Bi'

interface SoundPassportProps {
  unlocked: boolean
}

const FUTURE_SOUNDS = ['/æ/ ↔ /ʌ/', '/ɒ/ ↔ /ɔː/', '/e/ ↔ /eɪ/']

/**
 * Growing personal sound map. In this pilot the /ɪ/ ↔ /iː/ island is
 * unlockable; future sound blocks are visible but marked “Coming next”.
 */
export function SoundPassport({ unlocked }: SoundPassportProps) {
  return (
    <div className="sound-passport">
      <div className={`passport-node passport-node--main${unlocked ? ' is-unlocked' : ''}`}>
        <span className="passport-node-ipa ipa">
          <span className="ipa-ih">/ɪ/</span> ↔ <span className="ipa-ee">/iː/</span>
        </span>
        <span className="passport-node-name">Ship or Sheep?</span>
        <span className="passport-node-state">
          {unlocked ? (
            <Bi en="Unlocked" ru="Открыт" />
          ) : (
            <Bi en="In progress" ru="В процессе" />
          )}
        </span>
      </div>
      <div className="passport-path" aria-hidden="true">
        <svg viewBox="0 0 300 24" width="100%" height="24">
          <path d="M8 12 Q75 2 150 12 Q225 22 292 12" fill="none" stroke="#DCE5EE" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" />
        </svg>
      </div>
      <div className="passport-future">
        {FUTURE_SOUNDS.map((s) => (
          <div key={s} className="passport-node passport-node--future" aria-label={`${s} — coming next`}>
            <span className="passport-node-ipa ipa">{s}</span>
            <span className="passport-node-state"><Bi en="Coming next" ru="Скоро" /></span>
          </div>
        ))}
      </div>
    </div>
  )
}
