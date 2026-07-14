import { useRef, useState } from 'react'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { useAudio } from '../hooks/useAudio'
import { Bi } from './Bi'

interface RecordReplayProps {
  modelKey: string
  modelText: string
  /** Called when a recording is completed at least once. */
  onRecorded?: () => void
  /** Called when the user completes the non-blocking self-repeat route. */
  onSelfPractice?: () => void
}

/**
 * Real local recording via MediaRecorder. Audio never leaves the device:
 * the current take lives in memory behind an object URL that is revoked on
 * replacement/unmount. When the microphone is denied or unsupported, a
 * listen-and-repeat route keeps the lesson fully usable.
 */
export function RecordReplay({ modelKey, modelText, onRecorded, onSelfPractice }: RecordReplayProps) {
  const { status, recordingUrl, start, stop, reset } = useMediaRecorder()
  const { play } = useAudio()
  const [selfDone, setSelfDone] = useState(false)
  const playerRef = useRef<HTMLAudioElement>(null)

  const playMine = () => {
    playerRef.current?.play().catch(() => {})
  }

  const compare = async () => {
    await play(modelKey, modelText, { rate: 1.0 })
    setTimeout(playMine, 350)
  }

  const handleStop = () => {
    stop()
    onRecorded?.()
  }

  const micBlocked = status === 'denied' || status === 'unsupported'

  return (
    <div className="record-replay">
      {!micBlocked ? (
        <>
          <div className="record-controls">
            {status !== 'recording' ? (
              <button
                type="button"
                className="btn btn--record"
                onClick={() => void start()}
                disabled={status === 'requesting'}
              >
                <span className="rec-dot" aria-hidden="true" />
                {status === 'requesting' ? (
                  <Bi en="Asking for microphone…" ru="Запрашиваем микрофон…" />
                ) : recordingUrl ? (
                  <Bi en="Record again" ru="Записать ещё раз" />
                ) : (
                  <Bi en="Record" ru="Записать" />
                )}
              </button>
            ) : (
              <button type="button" className="btn btn--record is-recording" onClick={handleStop}>
                <span className="rec-dot rec-dot--live" aria-hidden="true" />
                <Bi en="Stop" ru="Стоп" />
              </button>
            )}

            {recordingUrl && (
              <>
                <button type="button" className="btn btn--soft" onClick={playMine}>
                  <Bi en="Play my voice" ru="Моя запись" />
                </button>
                <button type="button" className="btn btn--soft" onClick={() => void compare()}>
                  <Bi en="Compare: model → me" ru="Сравнить: образец → я" />
                </button>
              </>
            )}
          </div>
          {status === 'recording' && (
            <p className="record-hint" role="status">
              <Bi en="Recording… say the words, then press Stop." ru="Идёт запись… скажи слова и нажми «Стоп»." />
            </p>
          )}
          {recordingUrl && (
            <audio ref={playerRef} src={recordingUrl} preload="auto">
              <track kind="captions" />
            </audio>
          )}
          <p className="record-privacy">
            <Bi
              en="Your voice stays on this device and is never uploaded or saved."
              ru="Твой голос остаётся на этом устройстве — он никуда не отправляется и не сохраняется."
            />
          </p>
          {status === 'recorded' && (
            <button type="button" className="btn btn--ghost record-discard" onClick={reset}>
              <Bi en="Discard recording" ru="Удалить запись" />
            </button>
          )}
        </>
      ) : (
        <div className="record-fallback" role="status">
          <p>
            {status === 'denied' ? (
              <Bi
                en="No microphone this time — that’s fine! Listen to the model and repeat aloud."
                ru="Микрофон недоступен — не беда! Слушай образец и повторяй вслух."
              />
            ) : (
              <Bi
                en="Recording isn’t supported here. Listen to the model and repeat aloud."
                ru="Запись здесь не поддерживается. Слушай образец и повторяй вслух."
              />
            )}
          </p>
          <label className="self-check">
            <input
              type="checkbox"
              checked={selfDone}
              onChange={(e) => {
                setSelfDone(e.target.checked)
                if (e.target.checked) onSelfPractice?.()
              }}
            />
            <Bi en="I listened and repeated aloud" ru="Я послушал(а) и повторил(а) вслух" />
          </label>
        </div>
      )}
    </div>
  )
}
