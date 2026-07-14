import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { WordCard } from '../components/WordCard'
import { SoundWave } from '../components/SoundWave'
import { Bi } from '../components/Bi'
import { WordArt } from '../components/WordArt'
import { useAudio } from '../hooks/useAudio'
import { wordById } from '../content'
import type { FluffyState } from '../components/FluffyCoach'

type Phase = 'intro' | 'played' | 'revealed'

/**
 * The magic hook: one tiny sound turns a ship into a sheep.
 * Layered crossfade + motion between two original SVG illustrations.
 */
export function VisualHook() {
  const { dispatch } = useApp()
  const { play, playingKey } = useAudio()
  const [phase, setPhase] = useState<Phase>('intro')
  const [showing, setShowing] = useState<'ship' | 'sheep'>('ship')
  const [fluffy, setFluffy] = useState<FluffyState>('guiding')

  const ship = wordById('ship')
  const sheep = wordById('sheep')

  const hear = async (id: 'ship' | 'sheep') => {
    setShowing(id)
    setFluffy('listening')
    await play(id, id)
    setFluffy(id === 'ship' ? 'ih' : 'ee')
    if (phase === 'intro') setPhase('played')
  }

  const compare = async () => {
    setFluffy('listening')
    setShowing('ship')
    await play('ship', 'ship', { rate: 1.0 })
    setShowing('sheep')
    await new Promise((r) => setTimeout(r, 350))
    await play('sheep', 'sheep', { rate: 1.0 })
    setFluffy('guiding')
    setPhase('revealed')
  }

  const coach =
    phase === 'intro'
      ? {
          en: 'Watch the ship… one tiny sound can turn it into a sheep!',
          ru: 'Смотри на корабль… один маленький звук превратит его в овцу!',
        }
      : phase === 'played'
        ? {
            en: 'Did you see that? Try both sounds, then compare them.',
            ru: 'Видишь? Попробуй оба звука, а потом сравни их.',
          }
        : {
            en: '/ɪ/ is short and relaxed. /iː/ is longer and clearer. That tiny difference changes the word!',
            ru: '/ɪ/ — короткий и расслабленный. /iː/ — длиннее и яснее. Эта маленькая разница меняет слово!',
          }

  return (
    <ScreenLayout
      coachState={fluffy}
      coachMessage={coach.en}
      coachMessageRu={coach.ru}
      actions={
        <>
          <button
            type="button"
            className="btn btn--wave accent--ih"
            onClick={() => void hear('ship')}
            aria-label="Hear /ɪ/ in the word ship"
          >
            Hear <span className="ipa">/ɪ/</span>
          </button>
          <button
            type="button"
            className="btn btn--wave accent--ee"
            onClick={() => void hear('sheep')}
            aria-label="Hear /iː/ in the word sheep"
          >
            Hear <span className="ipa">/iː/</span>
          </button>
          <button
            type="button"
            className="btn btn--soft"
            onClick={() => void compare()}
            disabled={playingKey !== null}
          >
            <Bi en="Compare" ru="Сравнить" />
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'visualHook' })}
            disabled={phase === 'intro'}
          >
            <Bi en="Continue" ru="Дальше" />
          </button>
        </>
      }
    >
      <div className="screen-title">
        <h1><Bi en="One sound changes everything" ru="Один звук меняет всё" /></h1>
      </div>

      <div className="hook-stage" aria-live="polite">
        <div className={`hook-morph hook-morph--${showing}`}>
          <div className="hook-layer hook-layer--ship" aria-hidden={showing !== 'ship'}>
            <WordArt wordId="ship" size={190} />
          </div>
          <div className="hook-layer hook-layer--sheep" aria-hidden={showing !== 'sheep'}>
            <WordArt wordId="sheep" size={190} />
          </div>
        </div>
        <div className="hook-waves">
          <div className={`hook-wave${showing === 'ship' ? ' is-active' : ''}`}>
            <span className="ipa ipa-ih">/ɪ/</span>
            <SoundWave variant="short" playing={playingKey === 'ship'} />
          </div>
          <div className={`hook-wave${showing === 'sheep' ? ' is-active' : ''}`}>
            <span className="ipa ipa-ee">/iː/</span>
            <SoundWave variant="long" playing={playingKey === 'sheep'} />
          </div>
        </div>
      </div>

      {phase !== 'intro' && (
        <div className="hook-cards">
          <WordCard entry={ship} accented size="md" />
          <WordCard entry={sheep} accented size="md" />
        </div>
      )}
    </ScreenLayout>
  )
}
