import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { WordCard } from '../components/WordCard'
import { SoundWave } from '../components/SoundWave'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { Bi } from '../components/Bi'
import { useAudio } from '../hooks/useAudio'
import { kidsWords, shuffle } from '../content'
import type { FluffyState } from '../components/FluffyCoach'
import type { SoundId } from '../types/content'

/**
 * Sorting lab: six randomised word cards go to the /ɪ/ or /iː/ zone.
 * Tap-select → tap-destination (keyboard friendly); no drag required.
 * After two consecutive errors, “Show me the difference” replays the
 * contrast and the learner resumes at the same card.
 */
export function EarLab() {
  const { dispatch } = useApp()
  const { play, playSequence, playingKey } = useAudio()
  const deck = useMemo(() => shuffle(kidsWords), [])
  const [index, setIndex] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [attemptedThisCard, setAttemptedThisCard] = useState(false)
  const [errorStreak, setErrorStreak] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'retry' | null>(null)
  const [fluffy, setFluffy] = useState<FluffyState>('guiding')
  const [finished, setFinished] = useState(false)

  const card = deck[Math.min(index, deck.length - 1)]

  const chooseZone = (zone: SoundId) => {
    if (finished || feedback === 'correct') return
    if (zone === card.sound) {
      if (!attemptedThisCard) setFirstTryCorrect((c) => c + 1)
      setFeedback('correct')
      setErrorStreak(0)
      setFluffy(zone === 'ih' ? 'ih' : 'ee')
      window.setTimeout(() => {
        setFeedback(null)
        setAttemptedThisCard(false)
        setFluffy('guiding')
        if (index + 1 >= deck.length) {
          setFinished(true)
          dispatch({
            type: 'SET_RESULT',
            patch: {
              earLab: {
                correct: firstTryCorrect + (attemptedThisCard ? 0 : 1),
                total: deck.length,
              },
            },
          })
          setFluffy('correct')
        } else {
          setIndex((i) => i + 1)
        }
      }, 900)
    } else {
      setAttemptedThisCard(true)
      setErrorStreak((s) => s + 1)
      setFeedback('retry')
      setFluffy('retry')
    }
  }

  const showDifference = async () => {
    setErrorStreak(0)
    setFeedback(null)
    setFluffy('listening')
    await playSequence([
      { key: 'ship', text: 'ship', rate: 0.85 },
      { key: 'sheep', text: 'sheep', rate: 0.85 },
    ])
    setFluffy('guiding')
  }

  const coach = finished
    ? {
        state: 'correct' as FluffyState,
        en: `Ear lab complete! ${firstTryCorrect} of ${deck.length} sorted on the first try.`,
        ru: `Лаборатория слуха пройдена! С первой попытки: ${firstTryCorrect} из ${deck.length}.`,
      }
    : {
        state: fluffy,
        en: 'Tap the card to hear it, then tap the right sound zone.',
        ru: 'Нажми на карточку, чтобы услышать слово, затем выбери зону звука.',
      }

  return (
    <ScreenLayout
      coachState={coach.state}
      coachMessage={coach.en}
      coachMessageRu={coach.ru}
      actions={
        finished ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'earLab' })}
          >
            <Bi en="Continue" ru="Дальше" />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--soft"
            onClick={() => void play(card.id, card.word)}
          >
            <Bi en="Replay the word" ru="Повторить слово" />
          </button>
        )
      }
    >
      <div className="screen-title">
        <h1><Bi en="Ear Lab: sort the sounds" ru="Лаборатория слуха: рассортируй звуки" /></h1>
        <p className="screen-sub">
          <Bi en={`Card ${Math.min(index + 1, deck.length)} of ${deck.length}`} ru={`Карточка ${Math.min(index + 1, deck.length)} из ${deck.length}`} />
        </p>
      </div>

      <div className="earlab-zones">
        <button
          type="button"
          className="earlab-zone earlab-zone--ih"
          onClick={() => chooseZone('ih')}
          disabled={finished}
          aria-label="Sound zone /ɪ/ — short relaxed vowel, like in ship"
        >
          <span className="ipa earlab-zone-ipa">/ɪ/</span>
          <SoundWave variant="short" playing={playingKey === card?.id && card?.sound === 'ih'} width={72} />
          <span className="earlab-zone-word">ship</span>
        </button>
        <button
          type="button"
          className="earlab-zone earlab-zone--ee"
          onClick={() => chooseZone('ee')}
          disabled={finished}
          aria-label="Sound zone /iː/ — longer clearer vowel, like in sheep"
        >
          <span className="ipa earlab-zone-ipa">/iː/</span>
          <SoundWave variant="long" playing={playingKey === card?.id && card?.sound === 'ee'} width={110} />
          <span className="earlab-zone-word">sheep</span>
        </button>
      </div>

      {!finished && (
        <div className="earlab-card">
          <WordCard entry={card} size="lg" hideIpa={feedback !== 'correct'} />
        </div>
      )}

      {feedback === 'correct' && (
        <FeedbackBanner kind="correct" en={`Yes! “${card.word}” ${card.ipa} lives in that zone.`} ru="Точно в цель!" />
      )}
      {feedback === 'retry' &&
        (errorStreak >= 2 ? (
          <FeedbackBanner
            kind="retry"
            en="Let’s listen to the two sounds side by side."
            ru="Давай послушаем оба звука рядом."
            action={{ label: 'Show me the difference', onClick: () => void showDifference() }}
          />
        ) : (
          <FeedbackBanner
            kind="retry"
            en="Almost! Listen once more — is it short /ɪ/ or long /iː/?"
            ru="Почти! Послушай ещё раз: короткий /ɪ/ или долгий /iː/?"
          />
        ))}
    </ScreenLayout>
  )
}
