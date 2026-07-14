import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { AudioButton } from '../components/AudioButton'
import { WordCard } from '../components/WordCard'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { RecordReplay } from '../components/RecordReplay'
import { Bi } from '../components/Bi'
import { useAudio } from '../hooks/useAudio'
import { pairsForMode, sentenceForMode, shuffle, wordById } from '../content'
import type { WordEntry } from '../types/content'
import type { FluffyState } from '../components/FluffyCoach'

type Stage = 'hear' | 'match' | 'build' | 'speak' | 'done'
const STAGES: Stage[] = ['hear', 'match', 'build', 'speak']

/** Two ships with IPA flags; the sheep hops onto the one matching the heard word. */
function BossHarbour({ sheepOn }: { sheepOn: 'ih' | 'ee' | null }) {
  const sheep = (
    <g>
      <ellipse cx="0" cy="0" rx="16" ry="11" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
      <circle cx="-12" cy="-7" r="5.4" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
      <circle cx="0" cy="-10" r="6" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
      <circle cx="11" cy="-7" r="5.4" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
      <ellipse cx="17" cy="0" rx="5.4" ry="4.8" fill="#16233B" />
      <circle cx="18.6" cy="-1.4" r="1" fill="#FFFFFF" />
    </g>
  )
  return (
    <svg viewBox="0 0 320 140" className="boss-harbour" aria-hidden="true" focusable="false">
      {/* ship /ɪ/ */}
      <g transform="translate(20 40)">
        <path d="M0 52 Q60 62 120 52 L108 76 Q60 84 12 76 Z" fill="#7E3FA1" />
        <rect x="30" y="44" width="56" height="10" rx="3" fill="#28C7D9" />
        <line x1="60" y1="8" x2="60" y2="44" stroke="#16233B" strokeWidth="3" />
        <path d="M60 8 L92 16 L60 26 Z" fill="#28C7D9" />
        <text x="66" y="21" fontSize="12" fontWeight="700" fill="#16233B">ɪ</text>
        {sheepOn === 'ih' && <g transform="translate(60 30)">{sheep}</g>}
      </g>
      {/* ship /iː/ */}
      <g transform="translate(180 40)">
        <path d="M0 52 Q60 62 120 52 L108 76 Q60 84 12 76 Z" fill="#7E3FA1" />
        <rect x="30" y="44" width="56" height="10" rx="3" fill="#42C978" />
        <line x1="60" y1="8" x2="60" y2="44" stroke="#16233B" strokeWidth="3" />
        <path d="M60 8 L96 16 L60 26 Z" fill="#42C978" />
        <text x="66" y="21" fontSize="12" fontWeight="700" fill="#16233B">iː</text>
        {sheepOn === 'ee' && <g transform="translate(60 30)">{sheep}</g>}
      </g>
      <path d="M4 122 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0"
        fill="none" stroke="#28C7D9" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Final boss route: Hear → Match → Build → Speak.
 * The gold reward depends on completing the four learning stages,
 * not on raw clicking.
 */
export function SoundBoss() {
  const { state, dispatch } = useApp()
  const { play } = useAudio()
  const [stage, setStage] = useState<Stage>('hear')
  const [fluffy, setFluffy] = useState<FluffyState>('guiding')

  const pairs = pairsForMode(state.mode)

  // -------------------- Stage 1: Hear --------------------
  const hearItems = useMemo(() => shuffle(pairs.flat()).slice(0, 4), [pairs])
  const [hearIndex, setHearIndex] = useState(0)
  const [hearScore, setHearScore] = useState(0)
  const [hearAttempted, setHearAttempted] = useState(false)
  const [hearPlayed, setHearPlayed] = useState(false)
  const [hearFeedback, setHearFeedback] = useState<'correct' | 'retry' | null>(null)
  const hearWord = hearItems[Math.min(hearIndex, hearItems.length - 1)]
  const hearOptions = useMemo(() => {
    const partner = pairs.find((p) => p.some((w) => w.id === hearWord.id))!
    return shuffle([...partner])
  }, [hearWord, pairs])

  const chooseHear = (w: WordEntry) => {
    if (!hearPlayed || hearFeedback === 'correct') return
    if (w.id === hearWord.id) {
      const final = hearScore + (hearAttempted ? 0 : 1)
      if (!hearAttempted) setHearScore((s) => s + 1)
      setHearFeedback('correct')
      setFluffy(hearWord.sound === 'ih' ? 'ih' : 'ee')
      window.setTimeout(() => {
        setHearFeedback(null)
        setHearAttempted(false)
        setHearPlayed(false)
        setFluffy('guiding')
        if (hearIndex + 1 >= hearItems.length) {
          dispatch({ type: 'SET_RESULT', patch: { bossHear: { correct: final, total: hearItems.length } } })
          setStage('match')
        } else {
          setHearIndex((i) => i + 1)
        }
      }, 900)
    } else {
      setHearAttempted(true)
      setHearFeedback('retry')
      setFluffy('retry')
    }
  }

  // -------------------- Stage 2: Match --------------------
  const matchItems = useMemo(() => shuffle(pairs.flat()).slice(0, 4), [pairs])
  const [matchIndex, setMatchIndex] = useState(0)
  const [matchScore, setMatchScore] = useState(0)
  const [matchAttempted, setMatchAttempted] = useState(false)
  const [matchFeedback, setMatchFeedback] = useState<'correct' | 'retry' | null>(null)
  const matchWord = matchItems[Math.min(matchIndex, matchItems.length - 1)]

  const chooseSymbol = (sound: 'ih' | 'ee') => {
    if (matchFeedback === 'correct') return
    if (sound === matchWord.sound) {
      const final = matchScore + (matchAttempted ? 0 : 1)
      if (!matchAttempted) setMatchScore((s) => s + 1)
      setMatchFeedback('correct')
      window.setTimeout(() => {
        setMatchFeedback(null)
        setMatchAttempted(false)
        if (matchIndex + 1 >= matchItems.length) {
          dispatch({ type: 'SET_RESULT', patch: { bossMatch: { correct: final, total: matchItems.length } } })
          setStage('build')
        } else {
          setMatchIndex((i) => i + 1)
        }
      }, 900)
    } else {
      setMatchAttempted(true)
      setMatchFeedback('retry')
    }
  }

  // -------------------- Stage 3: Build (Put the sheep on the right ship) ----
  const buildRounds = useMemo(() => shuffle([wordById('sheep'), wordById('ship'), wordById('seat')]), [])
  const [buildIndex, setBuildIndex] = useState(0)
  const [buildScore, setBuildScore] = useState(0)
  const [buildAttempted, setBuildAttempted] = useState(false)
  const [buildPlayed, setBuildPlayed] = useState(false)
  const [buildFeedback, setBuildFeedback] = useState<'correct' | 'retry' | null>(null)
  const [sheepOn, setSheepOn] = useState<'ih' | 'ee' | null>(null)
  const buildWord = buildRounds[Math.min(buildIndex, buildRounds.length - 1)]

  const chooseShip = (sound: 'ih' | 'ee') => {
    if (!buildPlayed || buildFeedback === 'correct') return
    if (sound === buildWord.sound) {
      const final = buildScore + (buildAttempted ? 0 : 1)
      if (!buildAttempted) setBuildScore((s) => s + 1)
      setSheepOn(sound)
      setBuildFeedback('correct')
      setFluffy('correct')
      window.setTimeout(() => {
        setBuildFeedback(null)
        setBuildAttempted(false)
        setBuildPlayed(false)
        setSheepOn(null)
        setFluffy('guiding')
        if (buildIndex + 1 >= buildRounds.length) {
          dispatch({ type: 'SET_RESULT', patch: { bossBuild: { correct: final, total: buildRounds.length } } })
          setStage('speak')
        } else {
          setBuildIndex((i) => i + 1)
        }
      }, 1100)
    } else {
      setBuildAttempted(true)
      setBuildFeedback('retry')
      setFluffy('retry')
    }
  }

  // -------------------- Stage 4: Speak --------------------
  const sentence = sentenceForMode(state.mode)
  const [spoke, setSpoke] = useState(false)

  const finishBoss = () => {
    dispatch({ type: 'SET_RESULT', patch: { bossDone: true } })
    setStage('done')
    setFluffy('gold')
  }

  const stageNumber = stage === 'done' ? 4 : STAGES.indexOf(stage) + 1

  return (
    <ScreenLayout
      coachState={stage === 'done' ? 'gold' : fluffy}
      coachMessage={
        stage === 'hear' ? 'Boss round 1: pure listening. You know these sounds now!'
        : stage === 'match' ? 'Round 2: match each word to its sound badge.'
        : stage === 'build' ? 'Round 3: listen, then put the sheep on the right ship!'
        : stage === 'speak' ? 'Final round: your voice is the key.'
        : 'You did it! The harbour glows gold. See your Sound Passport!'
      }
      coachMessageRu={
        stage === 'hear' ? 'Босс-раунд 1: чистое слушание. Ты уже знаешь эти звуки!'
        : stage === 'match' ? 'Раунд 2: соедини слово со значком звука.'
        : stage === 'build' ? 'Раунд 3: послушай и посади овцу на правильный корабль!'
        : stage === 'speak' ? 'Финал: твой голос — ключ.'
        : 'Получилось! Гавань светится золотом. Смотри свой паспорт звуков!'
      }
      actions={
        stage === 'done' ? (
          <button type="button" className="btn btn--gold"
            onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'soundBoss' })}>
            <Bi en="Open my Sound Passport" ru="Открыть паспорт звуков" />
          </button>
        ) : stage === 'speak' ? (
          <button type="button" className="btn btn--primary" onClick={finishBoss} disabled={!spoke && state.results.speaking === 'none'}>
            <Bi en="Claim the gold" ru="Забрать золото" />
          </button>
        ) : (
          <span className="boss-progress" aria-live="polite">
            <Bi en={`Stage ${stageNumber} of 4`} ru={`Этап ${stageNumber} из 4`} />
          </span>
        )
      }
    >
      <div className="screen-title">
        <h1><Bi en="Sound Boss: the harbour challenge" ru="Звуковой босс: испытание в гавани" /></h1>
        <ol className="boss-stages" aria-label="Boss stages">
          {STAGES.map((s, i) => (
            <li key={s}
              className={`boss-stage${stage === s ? ' is-active' : ''}${stageNumber > i + 1 || stage === 'done' ? ' is-done' : ''}`}>
              {['Hear', 'Match', 'Build', 'Speak'][i]}
            </li>
          ))}
        </ol>
      </div>

      {stage === 'hear' && (
        <div className="boss-hear">
          <p className="screen-sub"><Bi en={`Word ${hearIndex + 1} of ${hearItems.length}`} ru={`Слово ${hearIndex + 1} из ${hearItems.length}`} /></p>
          <AudioButton audioKey={hearWord.id} text={hearWord.word} label={hearPlayed ? 'Play again' : 'Play the word'}
            variant="primary" onPlayStart={() => setHearPlayed(true)} />
          <div className="diagnostic-options">
            {hearOptions.map((w) => (
              <WordCard key={w.id} entry={w} playOnTap={false} hideIpa={hearFeedback !== 'correct'}
                onSelect={() => chooseHear(w)} size="md" />
            ))}
          </div>
          {hearFeedback === 'correct' && <FeedbackBanner kind="correct" en="Sharp ears!" ru="Отличный слух!" />}
          {hearFeedback === 'retry' && (
            <FeedbackBanner kind="retry" en="Listen once more — short or long?" ru="Послушай ещё раз: короткий или долгий?" />
          )}
        </div>
      )}

      {stage === 'match' && (
        <div className="boss-match">
          <p className="screen-sub"><Bi en={`Word ${matchIndex + 1} of ${matchItems.length}`} ru={`Слово ${matchIndex + 1} из ${matchItems.length}`} /></p>
          <WordCard entry={matchWord} size="lg" hideIpa={matchFeedback !== 'correct'} />
          <div className="boss-symbols">
            <button type="button" className="boss-symbol boss-symbol--ih" onClick={() => chooseSymbol('ih')}
              aria-label="Sound badge /ɪ/">
              <span className="ipa">/ɪ/</span>
            </button>
            <button type="button" className="boss-symbol boss-symbol--ee" onClick={() => chooseSymbol('ee')}
              aria-label="Sound badge /iː/">
              <span className="ipa">/iː/</span>
            </button>
          </div>
          {matchFeedback === 'correct' && <FeedbackBanner kind="correct" en="Badge matched!" ru="Значок найден!" />}
          {matchFeedback === 'retry' && (
            <FeedbackBanner kind="retry" en="Feel the vowel length and try again." ru="Прислушайся к длине гласного и попробуй снова." />
          )}
        </div>
      )}

      {stage === 'build' && (
        <div className="boss-build">
          <p className="boss-task"><Bi en="Put the sheep on the right ship." ru="Посади овцу на правильный корабль." /></p>
          <AudioButton audioKey={buildWord.id} text={buildWord.word} label={buildPlayed ? 'Play again' : 'Play the word'}
            variant="primary" onPlayStart={() => setBuildPlayed(true)} />
          <BossHarbour sheepOn={sheepOn} />
          <div className="boss-ship-buttons">
            <button type="button" className="btn btn--wave accent--ih" onClick={() => chooseShip('ih')} disabled={!buildPlayed}>
              <Bi en="The /ɪ/ ship" ru="Корабль /ɪ/" />
            </button>
            <button type="button" className="btn btn--wave accent--ee" onClick={() => chooseShip('ee')} disabled={!buildPlayed}>
              <Bi en="The /iː/ ship" ru="Корабль /iː/" />
            </button>
          </div>
          {buildFeedback === 'correct' && (
            <FeedbackBanner kind="correct" en={`The sheep loves the “${buildWord.word}” ${buildWord.ipa} ship!`} ru="Овца довольна!" />
          )}
          {buildFeedback === 'retry' && (
            <FeedbackBanner kind="retry" en="The sheep waits — check the flag symbols again." ru="Овца ждёт — посмотри на флаги ещё раз." />
          )}
        </div>
      )}

      {stage === 'speak' && (
        <div className="boss-speak">
          <div className="highlight-sentence">
            <p className="highlight-line" lang="en">{sentence.en}</p>
            <p className="highlight-ipa ipa">{sentence.ipa}</p>
            {state.settings.russianSupport && <p className="highlight-ru" lang="ru">{sentence.ru}</p>}
          </div>
          <div className="transfer-controls">
            <button type="button" className="btn btn--soft" onClick={() => void play(sentence.id, sentence.en)}>
              <Bi en="Play the model" ru="Включить образец" />
            </button>
          </div>
          <RecordReplay
            modelKey={sentence.id}
            modelText={sentence.en}
            onRecorded={() => { setSpoke(true); dispatch({ type: 'SET_RESULT', patch: { speaking: 'recorded' } }) }}
            onSelfPractice={() => {
              setSpoke(true)
              if (state.results.speaking !== 'recorded') {
                dispatch({ type: 'SET_RESULT', patch: { speaking: 'selfPractice' } })
              }
            }}
          />
        </div>
      )}

      {stage === 'done' && (
        <div className="boss-done">
          <BossHarbour sheepOn="ee" />
          <FeedbackBanner kind="correct"
            en="Harbour complete! You listened, matched, built and spoke."
            ru="Гавань пройдена! Ты слушал(а), соединял(а), строил(а) и говорил(а)." />
        </div>
      )}
    </ScreenLayout>
  )
}
