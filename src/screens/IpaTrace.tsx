import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { TraceCanvas } from '../components/TraceCanvas'
import { WordCard } from '../components/WordCard'
import { AudioButton } from '../components/AudioButton'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { Bi } from '../components/Bi'
import { kidsWords, shuffle, soundInfo } from '../content'
import type { SoundId } from '../types/content'
import type { FluffyState } from '../components/FluffyCoach'

type Tab = 'trace' | 'match'

/**
 * IPA symbol lab: tap to hear a labelled anchor word (never a fake isolated
 * phoneme), trace the symbol with pointer input, then match symbols to
 * words. Kids know these as “Sound badges”; adults as “British IPA symbols”.
 */
export function IpaTrace() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<Tab>('trace')
  const [sound, setSound] = useState<SoundId>('ih')
  const [traced, setTraced] = useState<Record<SoundId, boolean>>({ ih: false, ee: false })

  // Match round: 4 items, symbol shown → choose the word that contains it.
  const matchItems = useMemo(() => shuffle(kidsWords).slice(0, 4), [])
  const [matchIndex, setMatchIndex] = useState(0)
  const [matchFirstTry, setMatchFirstTry] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const [matchFeedback, setMatchFeedback] = useState<'correct' | 'retry' | null>(null)
  const [matchDone, setMatchDone] = useState(false)

  const isKids = state.mode !== 'adults'
  const info = soundInfo(sound)
  const anchorId = info.anchorWordId
  const current = matchItems[Math.min(matchIndex, matchItems.length - 1)]
  const matchOptions = useMemo(() => {
    void matchIndex
    return shuffle(kidsWords.filter((w) => w.id === current.id || w.sound !== current.sound).slice(0, 4))
  }, [current, matchIndex])

  const chooseMatch = (id: string) => {
    if (matchDone || matchFeedback === 'correct') return
    if (id === current.id) {
      if (!attempted) setMatchFirstTry((c) => c + 1)
      setMatchFeedback('correct')
      const finalScore = matchFirstTry + (attempted ? 0 : 1)
      window.setTimeout(() => {
        setMatchFeedback(null)
        setAttempted(false)
        if (matchIndex + 1 >= matchItems.length) {
          setMatchDone(true)
          dispatch({
            type: 'SET_RESULT',
            patch: { ipaMatch: { correct: finalScore, total: matchItems.length } },
          })
        } else {
          setMatchIndex((i) => i + 1)
        }
      }, 900)
    } else {
      setAttempted(true)
      setMatchFeedback('retry')
    }
  }

  const bothTraced = traced.ih && traced.ee
  const canContinue = bothTraced && matchDone

  const coachState: FluffyState = matchDone && bothTraced ? 'correct' : sound === 'ih' ? 'ih' : 'ee'

  return (
    <ScreenLayout
      coachState={coachState}
      coachMessage={
        tab === 'trace'
          ? 'Tap a badge to hear its anchor word, then trace the symbol with your finger.'
          : `Which word has the ${sound === 'ih' ? '/ɪ/' : '/iː/'} badge? Find it!`
      }
      coachMessageRu={
        tab === 'trace'
          ? 'Нажми на значок, чтобы услышать слово-якорь, и обведи символ пальцем.'
          : 'В каком слове живёт этот значок? Найди его!'
      }
      actions={
        <>
          {tab === 'trace' ? (
            <button type="button" className="btn btn--soft" onClick={() => setTab('match')}>
              <Bi en="Go to matching" ru="К сопоставлению" />
            </button>
          ) : (
            <button type="button" className="btn btn--soft" onClick={() => setTab('trace')}>
              <Bi en="Back to tracing" ru="К обводке" />
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'ipaTrace' })}
            disabled={!canContinue}
          >
            <Bi en="Continue" ru="Дальше" />
          </button>
        </>
      }
    >
      <div className="screen-title">
        <h1>{isKids ? <Bi en="Sound badges" ru="Значки звуков" /> : <Bi en="British IPA symbols" ru="Символы британского IPA" />}</h1>
        <p className="screen-sub">
          {tab === 'trace' ? (
            <Bi
              en={`Trace both symbols to unlock matching ${traced.ih ? '· /ɪ/ ✓' : ''} ${traced.ee ? '· /iː/ ✓' : ''}`}
              ru="Обведи оба символа"
            />
          ) : (
            <Bi en={`Match ${Math.min(matchIndex + 1, matchItems.length)} of ${matchItems.length}`} ru="Сопоставь символ и слово" />
          )}
        </p>
      </div>

      {tab === 'trace' ? (
        <div className="ipatrace-stage">
          <div className="sound-toggle" role="tablist" aria-label="Choose a symbol">
            <button
              type="button"
              role="tab"
              aria-selected={sound === 'ih'}
              className={`sound-tab sound-tab--ih${sound === 'ih' ? ' is-active' : ''}`}
              onClick={() => setSound('ih')}
            >
              <span className="ipa">/ɪ/</span> {traced.ih && '✓'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sound === 'ee'}
              className={`sound-tab sound-tab--ee${sound === 'ee' ? ' is-active' : ''}`}
              onClick={() => setSound('ee')}
            >
              <span className="ipa">/iː/</span> {traced.ee && '✓'}
            </button>
          </div>

          <div className="ipatrace-anchor">
            <AudioButton
              audioKey={anchorId}
              text={anchorId}
              label={`Anchor word: ${anchorId}`}
              accent={sound === 'ih' ? 'ih' : 'ee'}
            />
            <p className="ipatrace-anchor-note">
              <Bi
                en="We play a real anchor word — an isolated vowel needs a human recording."
                ru="Мы играем настоящее слово-якорь: изолированный звук требует записи диктора."
              />
            </p>
          </div>

          <TraceCanvas
            key={sound}
            glyph={sound === 'ih' ? 'ɪ' : 'iː'}
            color={sound === 'ih' ? '#28C7D9' : '#42C978'}
            onTraced={() => setTraced((t) => ({ ...t, [sound]: true }))}
          />
        </div>
      ) : (
        <div className="ipamatch-stage">
          {!matchDone ? (
            <>
              <div className={`ipamatch-prompt ipamatch-prompt--${current.sound}`}>
                <span className="ipamatch-symbol ipa">{current.sound === 'ih' ? '/ɪ/' : '/iː/'}</span>
                <AudioButton
                  audioKey={current.id}
                  text={current.word}
                  ariaLabel={`Play the mystery word for this symbol`}
                  label="Hear the word"
                  accent={current.sound === 'ih' ? 'ih' : 'ee'}
                />
              </div>
              <div className="ipamatch-options">
                {matchOptions.map((w) => (
                  <WordCard
                    key={w.id}
                    entry={w}
                    playOnTap={false}
                    hideIpa
                    onSelect={() => chooseMatch(w.id)}
                    size="sm"
                  />
                ))}
              </div>
              {matchFeedback === 'correct' && (
                <FeedbackBanner kind="correct" en={`Yes — “${current.word}” ${current.ipa}!`} ru="Верно!" />
              )}
              {matchFeedback === 'retry' && (
                <FeedbackBanner
                  kind="retry"
                  en="Not that one. Listen again and feel the vowel length."
                  ru="Не то слово. Послушай ещё раз — какой длины гласный?"
                />
              )}
            </>
          ) : (
            <FeedbackBanner
              kind="correct"
              en={`Matching complete: ${matchFirstTry} of ${matchItems.length} on the first try!`}
              ru={`Сопоставление готово: ${matchFirstTry} из ${matchItems.length} с первой попытки!`}
            />
          )}
        </div>
      )}
    </ScreenLayout>
  )
}
