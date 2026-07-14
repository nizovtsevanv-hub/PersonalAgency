import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { MouthDiagram } from '../components/MouthDiagram'
import { VowelChart } from '../components/VowelChart'
import { MirrorMode } from '../components/MirrorMode'
import { AudioButton } from '../components/AudioButton'
import { Bi } from '../components/Bi'
import { soundInfo } from '../content'
import type { SoundId } from '../types/content'

/**
 * Articulation lab. Kids see three friendly cues; grown-ups additionally get
 * close/near-close, front/near-front, quality-plus-duration and a compact
 * vowel-chart location. Optional Mirror Mode uses the front camera locally.
 */
export function MouthLabScreen() {
  const { state, dispatch } = useApp()
  const [sound, setSound] = useState<SoundId>('ih')
  const [mirrorOpen, setMirrorOpen] = useState(false)
  const info = soundInfo(sound)
  const isAdults = state.mode === 'adults'
  const anchor = sound === 'ih' ? 'ship' : 'sheep'

  return (
    <ScreenLayout
      coachState={sound === 'ih' ? 'ih' : 'ee'}
      coachMessage={
        sound === 'ih'
          ? 'For /ɪ/, keep it short and relaxed — tongue high, lips easy.'
          : 'For /iː/, make it longer and clearer — tongue higher, a small smile.'
      }
      coachMessageRu={
        sound === 'ih'
          ? 'Для /ɪ/ — коротко и расслабленно: язык высоко, губы спокойны.'
          : 'Для /iː/ — дольше и яснее: язык выше, лёгкая улыбка.'
      }
      actions={
        <>
          <AudioButton
            audioKey={anchor}
            text={anchor}
            label={`Listen: ${anchor}`}
            variant="chip"
            accent={sound === 'ih' ? 'ih' : 'ee'}
          />
          <button type="button" className="btn btn--soft" onClick={() => setMirrorOpen(true)}>
            <Bi en="Mirror Mode" ru="Зеркало" />
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'mouthLab' })}
          >
            <Bi en="Continue" ru="Дальше" />
          </button>
        </>
      }
    >
      <div className="screen-title">
        <h1><Bi en="Mouth Lab" ru="Лаборатория рта" /></h1>
      </div>

      <div className="sound-toggle" role="tablist" aria-label="Choose a sound">
        <button
          type="button"
          role="tab"
          aria-selected={sound === 'ih'}
          className={`sound-tab sound-tab--ih${sound === 'ih' ? ' is-active' : ''}`}
          onClick={() => setSound('ih')}
        >
          <span className="ipa">/ɪ/</span> ship
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sound === 'ee'}
          className={`sound-tab sound-tab--ee${sound === 'ee' ? ' is-active' : ''}`}
          onClick={() => setSound('ee')}
        >
          <span className="ipa">/iː/</span> sheep
        </button>
      </div>

      <div className="mouthlab-stage">
        <MouthDiagram sound={sound} detailed={isAdults} />

        <div className="mouthlab-side">
          {!isAdults ? (
            <ul className="kids-hints" aria-label="How to make the sound">
              {info.kidsHints.map((hint) => (
                <li key={hint} className="kids-hint">
                  <span className="kids-hint-star" aria-hidden="true">★</span> {hint}
                </li>
              ))}
            </ul>
          ) : (
            <>
              <ul className="adult-hints" aria-label="Articulation details">
                {info.articulation.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="adult-position">
                {sound === 'ih' ? (
                  <>
                    <strong className="ipa">/ɪ/</strong> — near-close, near-front. Both{' '}
                    <em>quality</em> and typical <em>duration</em> matter: it is not just a
                    “short i”.
                  </>
                ) : (
                  <>
                    <strong className="ipa">/iː/</strong> — close, front. Clearer quality and
                    typically longer — not simply a “long i”.
                  </>
                )}
              </p>
              <VowelChart />
            </>
          )}
        </div>
      </div>

      <MirrorMode open={mirrorOpen} onClose={() => setMirrorOpen(false)} />
    </ScreenLayout>
  )
}
