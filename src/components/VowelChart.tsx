import { useState } from 'react'
import { useAudio } from '../hooks/useAudio'
import { Bi } from './Bi'

/**
 * Compact interactive vowel-chart location for /iː/ (close front) and
 * /ɪ/ (near-close near-front). Tapping a dot plays a labelled anchor word —
 * we never pretend to play an isolated phoneme through speech synthesis.
 */
export function VowelChart() {
  const { play } = useAudio()
  const [active, setActive] = useState<'ih' | 'ee' | null>(null)

  const hear = (id: 'ih' | 'ee') => {
    setActive(id)
    void play(id === 'ih' ? 'ship' : 'sheep', id === 'ih' ? 'ship' : 'sheep')
  }

  return (
    <div className="vowel-chart">
      <h3 className="vowel-chart-title"><Bi en="Where on the vowel chart?" ru="Где на карте гласных?" /></h3>
      <div className="vowel-chart-stage">
        <svg viewBox="0 0 220 150" className="vowel-chart-svg" aria-hidden="true" focusable="false">
          <polygon points="30,18 200,18 200,128 96,128" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
          <line x1="30" y1="18" x2="200" y2="18" stroke="#DCE5EE" strokeWidth="1" />
          <line x1="63" y1="73" x2="200" y2="73" stroke="#DCE5EE" strokeWidth="1" />
          <text x="26" y="12" fontSize="10" fill="#5B6B85">front</text>
          <text x="176" y="12" fontSize="10" fill="#5B6B85">back</text>
          <text x="4" y="24" fontSize="10" fill="#5B6B85">close</text>
          <text x="72" y="142" fontSize="10" fill="#5B6B85">open</text>
        </svg>
        <button
          type="button"
          className={`vowel-dot vowel-dot--ee${active === 'ee' ? ' is-active' : ''}`}
          style={{ left: '16%', top: '13%' }}
          onClick={() => hear('ee')}
          aria-label="/iː/ — close front vowel. Play anchor word sheep"
        >
          <span className="ipa">iː</span>
        </button>
        <button
          type="button"
          className={`vowel-dot vowel-dot--ih${active === 'ih' ? ' is-active' : ''}`}
          style={{ left: '30%', top: '30%' }}
          onClick={() => hear('ih')}
          aria-label="/ɪ/ — near-close near-front vowel. Play anchor word ship"
        >
          <span className="ipa">ɪ</span>
        </button>
      </div>
      <p className="vowel-chart-note">
        {active === 'ee' && <Bi en="/iː/ — close front. Anchor word: sheep" ru="/iː/ — закрытый передний. Слово-якорь: sheep" />}
        {active === 'ih' && <Bi en="/ɪ/ — near-close, near-front. Anchor word: ship" ru="/ɪ/ — приоткрытый, ближе к переднему. Слово-якорь: ship" />}
        {active === null && <Bi en="Tap a symbol to hear its anchor word." ru="Нажми на символ, чтобы услышать слово-якорь." />}
      </p>
    </div>
  )
}
