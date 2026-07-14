import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { WordCard } from '../components/WordCard'
import { MouthDiagram } from '../components/MouthDiagram'
import { RecordReplay } from '../components/RecordReplay'
import { AudioButton } from '../components/AudioButton'
import { Bi } from '../components/Bi'
import { content, pairsForMode } from '../content'
import type { FluffyState } from '../components/FluffyCoach'

const SELF_CHECKS = [
  { id: 'different', en: 'I made the sounds different.', ru: 'Мои звуки звучали по-разному.' },
  { id: 'clear-ee', en: 'My /iː/ was clear.', ru: 'Мой /iː/ был ясным.' },
  { id: 'understandable', en: 'My phrase was understandable.', ru: 'Мою фразу можно понять.' },
]

/**
 * Listen → watch the mouth cue → record → replay → compare → again/continue.
 * Recording is local-only; a denied microphone opens a non-blocking
 * listen-and-repeat route. No automatic pronunciation score — learners use
 * honest self-check statements instead.
 */
export function SpeakReplay() {
  const { state, dispatch } = useApp()
  const pairs = pairsForMode(state.mode)
  const [pairIndex, setPairIndex] = useState(0)
  const [cueSound, setCueSound] = useState<'ih' | 'ee'>('ih')
  const [recordedAny, setRecordedAny] = useState(state.results.speaking === 'recorded')
  const [selfAny, setSelfAny] = useState(state.results.speaking !== 'none')
  const [checks, setChecks] = useState<string[]>(state.results.selfChecks)
  const [fluffy, setFluffy] = useState<FluffyState>('guiding')

  const [ihWord, eeWord] = pairs[pairIndex]
  const lastPair = pairIndex === pairs.length - 1
  const showWarning = state.mode === 'adults' && state.settings.adultGate

  const markRecorded = () => {
    setRecordedAny(true)
    dispatch({ type: 'SET_RESULT', patch: { speaking: 'recorded' } })
  }
  const markSelf = () => {
    setSelfAny(true)
    if (!recordedAny) dispatch({ type: 'SET_RESULT', patch: { speaking: 'selfPractice' } })
  }

  const toggleCheck = (id: string) => {
    const next = checks.includes(id) ? checks.filter((c) => c !== id) : [...checks, id]
    setChecks(next)
    dispatch({ type: 'SET_RESULT', patch: { selfChecks: next } })
  }

  const canContinue = recordedAny || selfAny

  return (
    <ScreenLayout
      coachState={fluffy}
      coachMessage="Listen, watch the mouth cue, then record yourself and compare."
      coachMessageRu="Послушай, посмотри на подсказку рта, запиши себя и сравни."
      actions={
        <>
          {pairIndex > 0 && (
            <button type="button" className="btn btn--soft" onClick={() => setPairIndex(pairIndex - 1)}>
              <Bi en="Previous pair" ru="Назад" />
            </button>
          )}
          {!lastPair ? (
            <button type="button" className="btn btn--primary" onClick={() => setPairIndex(pairIndex + 1)}>
              <Bi en="Next pair" ru="Следующая пара" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'speakReplay' })}
              disabled={!canContinue}
            >
              <Bi en="Continue" ru="Дальше" />
            </button>
          )}
        </>
      }
    >
      <div className="screen-title">
        <h1><Bi en="Speak & Replay" ru="Скажи и послушай себя" /></h1>
        <p className="screen-sub">
          <Bi en={`Pair ${pairIndex + 1} of ${pairs.length}`} ru={`Пара ${pairIndex + 1} из ${pairs.length}`} />
        </p>
      </div>

      <div className="speak-models">
        <div className="speak-model">
          <WordCard entry={ihWord} accented size="sm" />
          <AudioButton audioKey={ihWord.id} text={ihWord.word} label="Model" accent="ih"
            onPlayStart={() => { setCueSound('ih'); setFluffy('speaking') }}
            onPlayEnd={() => setFluffy('guiding')} />
        </div>
        <div className="speak-model">
          <WordCard entry={eeWord} accented size="sm" />
          <AudioButton audioKey={eeWord.id} text={eeWord.word} label="Model" accent="ee"
            onPlayStart={() => { setCueSound('ee'); setFluffy('speaking') }}
            onPlayEnd={() => setFluffy('guiding')} />
        </div>
      </div>

      <div className="speak-cue">
        <MouthDiagram sound={cueSound} size={170} />
      </div>

      <RecordReplay
        modelKey={cueSound === 'ih' ? ihWord.id : eeWord.id}
        modelText={`${ihWord.word}. ${eeWord.word}.`}
        onRecorded={() => { markRecorded(); setFluffy('recording') }}
        onSelfPractice={markSelf}
      />

      {lastPair && (
        <fieldset className="self-checks">
          <legend><Bi en="My honest check" ru="Мой честный чек" /></legend>
          {SELF_CHECKS.map((c) => (
            <label key={c.id} className="self-check">
              <input
                type="checkbox"
                checked={checks.includes(c.id)}
                onChange={() => toggleCheck(c.id)}
              />
              <Bi en={c.en} ru={c.ru} />
            </label>
          ))}
        </fieldset>
      )}

      {showWarning && (
        <aside className="warning-pair" aria-label="Pronunciation warning for adults">
          <h2><Bi en="Why this contrast matters (adults)" ru="Почему этот контраст важен (для взрослых)" /></h2>
          <p>
            <Bi
              en="A pronunciation warning, not practice content:"
              ru="Предупреждение о произношении, не материал для тренировки:"
            />
          </p>
          <div className="warning-cards">
            {content.warningPair.map((w) => (
              <div key={w.word} className="warning-card">
                <span className="word-card-word" lang="en">{w.word}</span>
                <span className="word-card-ipa ipa">{w.ipa}</span>
                <span className="word-card-ru" lang="ru">{w.ru}</span>
                <p className="warning-note">{w.note}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </ScreenLayout>
  )
}
