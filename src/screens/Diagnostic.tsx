import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { WordCard } from '../components/WordCard'
import { AudioButton } from '../components/AudioButton'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { Bi } from '../components/Bi'
import { shuffle, wordById } from '../content'
import type { FluffyState } from '../components/FluffyCoach'

interface Item {
  target: string
  distractor: string
}

const POOL: Item[] = [
  { target: 'ship', distractor: 'sheep' },
  { target: 'sheep', distractor: 'ship' },
  { target: 'sit', distractor: 'seat' },
  { target: 'seat', distractor: 'sit' },
]

/**
 * Four unscored baseline listening items before any teaching.
 * IPA stays hidden until the learner answers; results are stored locally as
 * a baseline for later comparison. There is no “failed” state here.
 */
export function Diagnostic() {
  const { dispatch } = useApp()
  const items = useMemo(() => shuffle(POOL), [])
  const [index, setIndex] = useState(0)
  const [answered, setAnswered] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [played, setPlayed] = useState(false)
  const [finished, setFinished] = useState(false)

  const item = items[index]
  // Randomised answer position, fixed per item.
  const options = useMemo(
    () => shuffle([wordById(item.target), wordById(item.distractor)]),
    [item],
  )

  const choose = (id: string) => {
    if (answered || !played) return
    setAnswered(id)
    if (id === item.target) setCorrectCount((c) => c + 1)
  }

  const next = () => {
    if (index + 1 < items.length) {
      setIndex(index + 1)
      setAnswered(null)
      setPlayed(false)
    } else {
      const finalCorrect = correctCount
      dispatch({
        type: 'SET_RESULT',
        patch: { diagnosticBaseline: { correct: finalCorrect, total: items.length } },
      })
      setFinished(true)
    }
  }

  const coach: { state: FluffyState; en: string; ru: string } = finished
    ? {
        state: 'supportive',
        en: 'Thanks! I listened very carefully. Now let’s learn the secret of these two sounds!',
        ru: 'Спасибо! Я внимательно послушал. Теперь узнаем секрет этих двух звуков!',
      }
    : answered
      ? answered === item.target
        ? { state: 'correct', en: 'Nice listening!', ru: 'Отлично слушаешь!' }
        : {
            state: 'supportive',
            en: 'Tricky pair! We’ll explore it together.',
            ru: 'Хитрая пара! Мы разберём её вместе.',
          }
      : {
          state: 'listening',
          en: 'Play the word, then tap what you hear.',
          ru: 'Нажми «Играть слово», потом выбери, что услышишь.',
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
            onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'diagnostic' })}
          >
            <Bi en="Continue" ru="Дальше" />
          </button>
        ) : answered ? (
          <button type="button" className="btn btn--primary" onClick={next}>
            {index + 1 < items.length ? <Bi en="Next word" ru="Следующее слово" /> : <Bi en="Finish warm-up" ru="Завершить разминку" />}
          </button>
        ) : (
          <AudioButton
            audioKey={item.target}
            text={wordById(item.target).word}
            label={played ? 'Play again' : 'Play the word'}
            variant="primary"
            onPlayStart={() => setPlayed(true)}
          />
        )
      }
    >
      <div className="screen-title">
        <h1><Bi en="Warm-up: What do you hear?" ru="Разминка: что ты слышишь?" /></h1>
        <p className="screen-sub">
          <Bi en={`Word ${Math.min(index + 1, items.length)} of ${items.length} · just listening, no marks`} ru="Просто слушаем — без оценок" />
        </p>
      </div>

      {!finished ? (
        <>
          <div className="diagnostic-options">
            {options.map((w) => (
              <WordCard
                key={w.id}
                entry={w}
                playOnTap={false}
                hideIpa={!answered}
                onSelect={() => choose(w.id)}
                selected={answered === w.id}
                size="lg"
              />
            ))}
          </div>
          {answered && (
            <FeedbackBanner
              kind={answered === item.target ? 'correct' : 'retry'}
              en={
                answered === item.target
                  ? `Yes — that was “${wordById(item.target).word}” ${wordById(item.target).ipa}.`
                  : `That was “${wordById(item.target).word}” ${wordById(item.target).ipa}. This pair is the whole adventure!`
              }
              ru={
                answered === item.target
                  ? 'Верно!'
                  : 'Эта пара — наше главное приключение!'
              }
            />
          )}
        </>
      ) : (
        <div className="diagnostic-done">
          <FeedbackBanner
            kind="info"
            en={`Warm-up finished: you caught ${correctCount} of ${items.length} by ear. We’ll check again after the lab!`}
            ru={`Разминка готова: на слух поймано ${correctCount} из ${items.length}. Сравним после лаборатории!`}
          />
        </div>
      )}
    </ScreenLayout>
  )
}
