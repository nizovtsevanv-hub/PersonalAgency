import { useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { AudioButton } from '../components/AudioButton'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { Bi } from '../components/Bi'
import { useAudio } from '../hooks/useAudio'
import { content } from '../content'
import type { SentenceEntry } from '../types/content'
import type { FluffyState } from '../components/FluffyCoach'

/** Original mini-scene: the sheep sits on the ship. */
function ShipSheepScene({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 240 150" className={`transfer-scene${active ? ' is-active' : ''}`} role="img"
      aria-label="A woolly sheep sitting on a purple ship on cyan waves">
      <circle cx="200" cy="26" r="14" fill="#FFC94A" />
      <ellipse cx="60" cy="24" rx="20" ry="8" fill="#FFFFFF" />
      <ellipse cx="82" cy="28" rx="14" ry="6" fill="#FFFFFF" />
      {/* sheep */}
      <g className="scene-sheep">
        <ellipse cx="120" cy="62" rx="24" ry="16" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
        <circle cx="102" cy="52" r="8" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
        <circle cx="120" cy="47" r="9" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
        <circle cx="136" cy="52" r="8" fill="#FFFFFF" stroke="#DCE5EE" strokeWidth="2" />
        <ellipse cx="146" cy="62" rx="8" ry="7" fill="#16233B" />
        <circle cx="148.5" cy="60" r="1.5" fill="#FFFFFF" />
        <rect x="108" y="74" width="4" height="9" rx="2" fill="#16233B" />
        <rect x="126" y="74" width="4" height="9" rx="2" fill="#16233B" />
      </g>
      {/* ship */}
      <path d="M60 92 Q120 104 180 92 L168 118 Q120 128 72 118 Z" fill="#7E3FA1" />
      <rect x="96" y="84" width="48" height="10" rx="3" fill="#28C7D9" />
      <circle cx="108" cy="89" r="2.6" fill="#F7FBFF" />
      <circle cx="126" cy="89" r="2.6" fill="#F7FBFF" />
      {/* waves */}
      <path d="M20 126 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0"
        fill="none" stroke="#28C7D9" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

/** Sentence with word-by-word highlighting synced to playback. */
function HighlightSentence({
  sentence,
  highlight,
  showIpa,
  showRu,
}: {
  sentence: SentenceEntry
  highlight: number
  showIpa: boolean
  showRu: boolean
}) {
  return (
    <div className="highlight-sentence">
      <p className="highlight-line" lang="en">
        {sentence.tokens.map((tok, i) => (
          <span key={i} className={`highlight-token${highlight === i ? ' is-lit' : ''}`}>
            {tok}{' '}
          </span>
        ))}
      </p>
      {showIpa && <p className="highlight-ipa ipa">{sentence.ipa}</p>}
      {showRu && <p className="highlight-ru" lang="ru">{sentence.ru}</p>}
    </div>
  )
}

function useSentencePlayer(sentence: SentenceEntry) {
  const { play, playingKey } = useAudio()
  const [highlight, setHighlight] = useState(-1)
  const timerRef = useRef<number[]>([])
  const boundaryUsed = useRef(false)

  const clearTimers = () => {
    timerRef.current.forEach((t) => window.clearTimeout(t))
    timerRef.current = []
  }

  // Character offset of each token inside the sentence string.
  const offsets: number[] = []
  {
    let pos = 0
    for (const tok of sentence.tokens) {
      offsets.push(sentence.en.indexOf(tok, pos))
      pos = offsets[offsets.length - 1] + tok.length
    }
  }

  const playSentence = async (rate?: number) => {
    boundaryUsed.current = false
    clearTimers()
    // Fallback: estimated per-word timing, cancelled if boundary events fire.
    let acc = 250
    sentence.tokens.forEach((tok, i) => {
      const t = window.setTimeout(() => {
        if (!boundaryUsed.current) setHighlight(i)
      }, acc)
      timerRef.current.push(t)
      acc += 280 + tok.length * 55
    })
    await play(sentence.id, sentence.en, {
      rate,
      onBoundary: (charIndex) => {
        boundaryUsed.current = true
        clearTimers()
        let idx = 0
        for (let i = 0; i < offsets.length; i++) {
          if (charIndex >= offsets[i]) idx = i
        }
        setHighlight(idx)
      },
    })
    clearTimers()
    setHighlight(-1)
  }

  return { playSentence, highlight, playing: playingKey === sentence.id }
}

// ---------------------------------------------------------------------------

function KidsTransfer({ onDone, done }: { onDone: () => void; done: boolean }) {
  const { state } = useApp()
  const sentence = content.sentences.kids
  const { playSentence, highlight, playing } = useSentencePlayer(sentence)
  const [played, setPlayed] = useState(false)

  return (
    <>
      <ShipSheepScene active={playing} />
      <HighlightSentence sentence={sentence} highlight={highlight} showIpa showRu={state.settings.russianSupport} />
      <div className="transfer-controls">
        <button type="button" className="btn btn--wave accent--brand" disabled={playing}
          onClick={() => { setPlayed(true); void playSentence(1.0) }}>
          <Bi en="Play the story" ru="Играть историю" />
        </button>
        <button type="button" className="btn btn--soft" disabled={playing}
          onClick={() => { setPlayed(true); void playSentence(0.85) }}>
          <Bi en="Slowly" ru="Медленно" />
        </button>
        <button type="button" className="btn btn--gold" disabled={!played || done} onClick={onDone}>
          {done ? <Bi en="Said it! ★" ru="Сказано! ★" /> : <Bi en="I said it too!" ru="Я тоже сказал(а)!" />}
        </button>
      </div>
    </>
  )
}

function AdultsTransfer({ onDone, done }: { onDone: () => void; done: boolean }) {
  const { state } = useApp()
  const { play, playingKey } = useAudio()
  const [role, setRole] = useState<'A' | 'B' | null>(null)
  const [lineIndex, setLineIndex] = useState(0)
  const sentence = content.sentences.adults
  const lines = content.dialogue
  const line = lines[Math.min(lineIndex, lines.length - 1)]
  const finishedDialogue = lineIndex >= lines.length
  const myTurn = role !== null && !finishedDialogue && line.speaker === role

  return (
    <>
      <div className="adult-key">
        <HighlightSentence sentence={sentence} highlight={-1} showIpa showRu={state.settings.russianSupport} />
        <AudioButton audioKey={sentence.id} text={sentence.en} label="Play the key sentence" />
      </div>

      {role === null ? (
        <div className="role-pick">
          <p><Bi en="Choose your role in the dialogue:" ru="Выберите роль в диалоге:" /></p>
          <div className="role-buttons">
            <button type="button" className="btn btn--wave accent--ih" onClick={() => setRole('A')}>
              <Bi en="I am A" ru="Я — A" />
            </button>
            <button type="button" className="btn btn--wave accent--ee" onClick={() => setRole('B')}>
              <Bi en="I am B" ru="Я — B" />
            </button>
          </div>
        </div>
      ) : (
        <div className="dialogue">
          {lines.map((l, i) => (
            <div key={i}
              className={`dialogue-line dialogue-line--${l.speaker === role ? 'me' : 'partner'}${i === lineIndex ? ' is-current' : ''}${i < lineIndex ? ' is-done' : ''}`}>
              <span className="dialogue-speaker">{l.speaker === role ? `${l.speaker} (you)` : l.speaker}</span>
              <span className="dialogue-text" lang="en">{l.en}</span>
              {state.settings.russianSupport && <span className="dialogue-ru" lang="ru">{l.ru}</span>}
              {i === lineIndex && l.speaker !== role && (
                <AudioButton audioKey={`dialogue-${i}`} text={l.en} label="Play partner line" variant="chip" />
              )}
            </div>
          ))}
          {!finishedDialogue ? (
            <div className="transfer-controls">
              <p className="turn-marker" role="status">
                {myTurn
                  ? <Bi en="Your turn — say the line aloud." ru="Ваша реплика — скажите её вслух." />
                  : <Bi en="Partner’s turn — play the line, then continue." ru="Реплика партнёра — включите её и продолжайте." />}
              </p>
              <button type="button" className="btn btn--primary" disabled={playingKey !== null}
                onClick={() => setLineIndex(lineIndex + 1)}>
                {myTurn ? <Bi en="I said my line" ru="Я сказал(а) реплику" /> : <Bi en="Next line" ru="Дальше" />}
              </button>
            </div>
          ) : (
            <div className="transfer-controls">
              <button type="button" className="btn btn--soft" disabled={playingKey !== null}
                onClick={async () => {
                  for (let i = 0; i < lines.length; i++) {
                    await play(`dialogue-${i}`, lines[i].en, { rate: 1.0 })
                  }
                }}>
                <Bi en="Play the whole dialogue" ru="Прослушать весь диалог" />
              </button>
              <button type="button" className="btn btn--gold" disabled={done} onClick={onDone}>
                {done ? <Bi en="Dialogue complete ★" ru="Диалог пройден ★" /> : <Bi en="Finish the dialogue" ru="Завершить диалог" />}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function TogetherTransfer({
  onDone,
  done,
  onTurnChange,
}: {
  onDone: () => void
  done: boolean
  onTurnChange: (t: 'adult' | 'child') => void
}) {
  const { state } = useApp()
  const sentence = content.sentences.together
  const { playSentence, highlight, playing } = useSentencePlayer(sentence)
  const [step, setStep] = useState(0)

  const STEPS: Array<{ turn: 'adult' | 'child'; en: string; ru: string }> = [
    { turn: 'adult', en: 'Adult’s turn: play the question, then ask it yourself.', ru: 'Ход взрослого: включите вопрос и задайте его сами.' },
    { turn: 'child', en: 'Child’s turn: answer — “Yes! I can see the sheep on the ship!”', ru: 'Ход ребёнка: ответь — «Yes! I can see the sheep on the ship!»' },
    { turn: 'child', en: 'Child’s turn: now YOU ask the question!', ru: 'Ход ребёнка: теперь ТЫ задай вопрос!' },
    { turn: 'adult', en: 'Adult’s turn: answer and stretch the /iː/ in “sheep” together.', ru: 'Ход взрослого: ответьте и вместе потяните /iː/ в «sheep».' },
  ]
  const current = STEPS[Math.min(step, STEPS.length - 1)]
  const finished = step >= STEPS.length

  const advance = () => {
    const next = step + 1
    setStep(next)
    if (next < STEPS.length) onTurnChange(STEPS[next].turn)
  }

  return (
    <>
      <ShipSheepScene active={playing} />
      <HighlightSentence sentence={sentence} highlight={highlight} showIpa showRu={state.settings.russianSupport} />
      <div className="together-turn" role="status">
        {!finished ? (
          <>
            <span className={`turn-chip${current.turn === 'adult' ? ' turn-chip--adult' : ' turn-chip--child'}`}>
              {current.turn === 'adult' ? <Bi en="Adult’s turn" ru="Ход взрослого" /> : <Bi en="Child’s turn" ru="Ход ребёнка" />}
            </span>
            <p><Bi en={current.en} ru={current.ru} /></p>
          </>
        ) : (
          <p><Bi en="Beautiful teamwork! You both used the two sounds." ru="Отличная команда! Вы оба использовали два звука." /></p>
        )}
      </div>
      <div className="transfer-controls">
        <button type="button" className="btn btn--wave accent--brand" disabled={playing}
          onClick={() => void playSentence(1.0)}>
          <Bi en="Play the question" ru="Включить вопрос" />
        </button>
        {!finished ? (
          <button type="button" className="btn btn--primary" onClick={advance}>
            <Bi en="We did this step" ru="Шаг сделан" />
          </button>
        ) : (
          <button type="button" className="btn btn--gold" disabled={done} onClick={onDone}>
            {done ? <Bi en="Done ★" ru="Готово ★" /> : <Bi en="Finish together task" ru="Завершить задание" />}
          </button>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------

export function SpeechTransfer() {
  const { state, dispatch } = useApp()
  const [togetherTurn, setTogetherTurn] = useState<'adult' | 'child'>('adult')
  const done = state.results.sentenceDone

  const markDone = () => dispatch({ type: 'SET_RESULT', patch: { sentenceDone: true } })

  const coachSide =
    state.mode === 'together' ? (togetherTurn === 'adult' ? 'left' : 'right') : 'left'

  const coachState: FluffyState = done ? 'correct' : 'speaking'

  return (
    <ScreenLayout
      coachState={coachState}
      coachSide={coachSide}
      coachMessage={
        state.mode === 'adults'
          ? 'Real speech time. Keep /iː/ long in “leave” and “seat”.'
          : state.mode === 'together'
            ? 'I’ll float to whoever is speaking. Take turns!'
            : 'Story time! Listen, watch the words light up, then say it.'
      }
      coachMessageRu={
        state.mode === 'adults'
          ? 'Живая речь. Держите /iː/ долгим в «leave» и «seat».'
          : state.mode === 'together'
            ? 'Я подлечу к тому, кто говорит. Меняйтесь по очереди!'
            : 'Время истории! Слушай, смотри, как слова загораются, и повтори.'
      }
      actions={
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'speechTransfer' })}
          disabled={!done}
        >
          <Bi en="Continue" ru="Дальше" />
        </button>
      }
    >
      <div className="screen-title">
        <h1>
          {state.mode === 'adults'
            ? <Bi en="Real dialogue" ru="Живой диалог" />
            : state.mode === 'together'
              ? <Bi en="Speak together" ru="Говорим вместе" />
              : <Bi en="Story: the sheep and the ship" ru="История: овца и корабль" />}
        </h1>
      </div>

      {state.mode === 'adults' ? (
        <AdultsTransfer onDone={markDone} done={done} />
      ) : state.mode === 'together' ? (
        <TogetherTransfer onDone={markDone} done={done} onTurnChange={setTogetherTurn} />
      ) : (
        <KidsTransfer onDone={markDone} done={done} />
      )}

      {done && (
        <FeedbackBanner kind="correct" en="Sentence transferred to real speech!" ru="Фраза перешла в живую речь!" />
      )}
    </ScreenLayout>
  )
}
