import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { WordArt } from '../components/WordArt'
import { AudioButton } from '../components/AudioButton'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { Bi } from '../components/Bi'
import { shuffle, wordsForMode } from '../content'
import type { WordEntry } from '../types/content'
import type { FluffyState } from '../components/FluffyCoach'

type Phase = 'sort' | 'build' | 'done'

const TILES: Array<{ spelling: string; sound: 'ih' | 'ee' }> = [
  { spelling: 'i', sound: 'ih' },
  { spelling: 'ee', sound: 'ee' },
  { spelling: 'ea', sound: 'ee' },
]

function gapWord(entry: WordEntry): { before: string; after: string } {
  const i = entry.word.indexOf(entry.spelling)
  return {
    before: entry.word.slice(0, i),
    after: entry.word.slice(i + entry.spelling.length),
  }
}

/**
 * The visible chain sound → spelling → word → picture.
 * Phase 1 sorts the spelling tiles onto their sounds; phase 2 rebuilds each
 * word by choosing the tile that actually writes its vowel.
 */
export function SpellingBridge() {
  const { state, dispatch } = useApp()
  const words = useMemo(() => shuffle(wordsForMode(state.mode)), [state.mode])
  const [phase, setPhase] = useState<Phase>('sort')

  // Phase 1 state
  const [sorted, setSorted] = useState<Record<string, 'ih' | 'ee'>>({})
  const [activeTile, setActiveTile] = useState<string | null>(null)
  const [sortFeedback, setSortFeedback] = useState<'correct' | 'retry' | null>(null)

  // Phase 2 state
  const [buildIndex, setBuildIndex] = useState(0)
  const [firstTry, setFirstTry] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const [buildFeedback, setBuildFeedback] = useState<'correct' | 'retry' | null>(null)
  const [lastWrongTile, setLastWrongTile] = useState<string | null>(null)

  const entry = words[Math.min(buildIndex, words.length - 1)]
  const gap = gapWord(entry)

  const assignTile = (zone: 'ih' | 'ee') => {
    if (!activeTile) return
    const tile = TILES.find((t) => t.spelling === activeTile)!
    if (tile.sound === zone) {
      setSorted((s) => ({ ...s, [tile.spelling]: zone }))
      setSortFeedback('correct')
    } else {
      setSortFeedback('retry')
    }
    setActiveTile(null)
    window.setTimeout(() => setSortFeedback(null), 1400)
  }

  const allSorted = TILES.every((t) => sorted[t.spelling])

  const chooseSpelling = (spelling: string) => {
    if (buildFeedback === 'correct') return
    if (spelling === entry.spelling) {
      if (!attempted) setFirstTry((c) => c + 1)
      const finalScore = firstTry + (attempted ? 0 : 1)
      setBuildFeedback('correct')
      setLastWrongTile(null)
      window.setTimeout(() => {
        setBuildFeedback(null)
        setAttempted(false)
        if (buildIndex + 1 >= words.length) {
          dispatch({
            type: 'SET_RESULT',
            patch: { spelling: { correct: finalScore, total: words.length } },
          })
          setPhase('done')
        } else {
          setBuildIndex((i) => i + 1)
        }
      }, 1000)
    } else {
      setAttempted(true)
      setLastWrongTile(spelling)
      setBuildFeedback('retry')
    }
  }

  const wrongTile = lastWrongTile ? TILES.find((t) => t.spelling === lastWrongTile) : null
  const wrongIsSameSound = wrongTile ? wrongTile.sound === entry.sound : false

  const coachState: FluffyState =
    phase === 'done' ? 'correct' : buildFeedback === 'retry' || sortFeedback === 'retry' ? 'retry' : 'guiding'

  return (
    <ScreenLayout
      coachState={coachState}
      coachMessage={
        phase === 'sort'
          ? 'A sound is what you hear. A spelling is how we write it. Sort the spellings!'
          : phase === 'build'
            ? 'Which spelling writes the vowel in this word?'
            : 'Spelling bridge crossed! Sounds and letters are friends now.'
      }
      coachMessageRu={
        phase === 'sort'
          ? 'Звук — это то, что мы слышим. Написание — то, как мы его записываем. Рассортируй написания!'
          : phase === 'build'
            ? 'Какое написание записывает гласный в этом слове?'
            : 'Мост правописания пройден! Звуки и буквы теперь друзья.'
      }
      actions={
        phase === 'done' ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: 'COMPLETE_AND_CONTINUE', screen: 'spellingBridge' })}
          >
            <Bi en="Continue" ru="Дальше" />
          </button>
        ) : phase === 'sort' ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setPhase('build')}
            disabled={!allSorted}
          >
            <Bi en="Build the words" ru="Собрать слова" />
          </button>
        ) : (
          <AudioButton audioKey={entry.id} text={entry.word} label="Hear the word" variant="chip" />
        )
      }
    >
      <div className="screen-title">
        <h1><Bi en="Spelling Bridge" ru="Мост правописания" /></h1>
        <p className="screen-sub">
          <span className="chain">
            <Bi en="sound" ru="звук" /> → <Bi en="spelling" ru="написание" /> → <Bi en="word" ru="слово" /> → <Bi en="picture" ru="картинка" />
          </span>
        </p>
      </div>

      <p className="letter-note">
        <Bi
          en="The letter “i” says its alphabet name /aɪ/, but in ship it writes the sound /ɪ/. The spellings “ee” and “ea” usually write /iː/."
          ru="Буква «i» в алфавите называется /aɪ/, но в слове ship она записывает звук /ɪ/. Сочетания «ee» и «ea» обычно записывают /iː/."
        />
      </p>

      {phase === 'sort' && (
        <div className="spelling-sort">
          <div className="spelling-tiles" role="group" aria-label="Spelling tiles">
            {TILES.map((t) => (
              <button
                key={t.spelling}
                type="button"
                className={`tile${activeTile === t.spelling ? ' is-active' : ''}${sorted[t.spelling] ? ' is-done' : ''}`}
                onClick={() => setActiveTile(activeTile === t.spelling ? null : t.spelling)}
                disabled={Boolean(sorted[t.spelling])}
                aria-pressed={activeTile === t.spelling}
                aria-label={`Spelling tile ${t.spelling}${sorted[t.spelling] ? ', already sorted' : ''}`}
              >
                {t.spelling}
              </button>
            ))}
          </div>
          <p className="spelling-sort-hint">
            <Bi
              en={activeTile ? `Now tap the sound that “${activeTile}” writes.` : 'Tap a tile, then tap its sound.'}
              ru={activeTile ? `Теперь выбери звук, который записывает «${activeTile}».` : 'Выбери плитку, затем её звук.'}
            />
          </p>
          <div className="spelling-zones">
            <button
              type="button"
              className="earlab-zone earlab-zone--ih"
              onClick={() => assignTile('ih')}
              disabled={!activeTile}
              aria-label="Sound /ɪ/ as in ship"
            >
              <span className="ipa earlab-zone-ipa">/ɪ/</span>
              <span className="earlab-zone-word">ship</span>
              <span className="zone-tiles">{Object.entries(sorted).filter(([, z]) => z === 'ih').map(([s]) => <span key={s} className="tile tile--mini">{s}</span>)}</span>
            </button>
            <button
              type="button"
              className="earlab-zone earlab-zone--ee"
              onClick={() => assignTile('ee')}
              disabled={!activeTile}
              aria-label="Sound /iː/ as in sheep"
            >
              <span className="ipa earlab-zone-ipa">/iː/</span>
              <span className="earlab-zone-word">sheep</span>
              <span className="zone-tiles">{Object.entries(sorted).filter(([, z]) => z === 'ee').map(([s]) => <span key={s} className="tile tile--mini">{s}</span>)}</span>
            </button>
          </div>
          {sortFeedback === 'correct' && <FeedbackBanner kind="correct" en="Sorted!" ru="Верно!" />}
          {sortFeedback === 'retry' && (
            <FeedbackBanner kind="retry" en="Listen to the zone words and try again." ru="Послушай слова в зонах и попробуй снова." />
          )}
        </div>
      )}

      {phase === 'build' && (
        <div className="spelling-build">
          <p className="screen-sub">
            <Bi en={`Word ${Math.min(buildIndex + 1, words.length)} of ${words.length}`} ru={`Слово ${Math.min(buildIndex + 1, words.length)} из ${words.length}`} />
          </p>
          <div className="build-card">
            <WordArt wordId={entry.id} size={84} />
            <div className="build-word" aria-label={`Complete the word: ${gap.before} blank ${gap.after}`}>
              <span>{gap.before}</span>
              <span className={`build-gap${buildFeedback === 'correct' ? ' is-filled' : ''}`}>
                {buildFeedback === 'correct' ? entry.spelling : '▁'}
              </span>
              <span>{gap.after}</span>
            </div>
            <span className="word-card-ipa ipa">{entry.ipa}</span>
            <span className="word-card-ru" lang="ru">{entry.ru}</span>
          </div>
          <div className="spelling-tiles" role="group" aria-label="Choose the spelling">
            {TILES.map((t) => (
              <button
                key={t.spelling}
                type="button"
                className="tile"
                onClick={() => chooseSpelling(t.spelling)}
                aria-label={`Use spelling ${t.spelling}`}
              >
                {t.spelling}
              </button>
            ))}
          </div>
          {buildFeedback === 'correct' && (
            <FeedbackBanner kind="correct" en={`“${entry.word}” ${entry.ipa} — built!`} ru="Собрано!" />
          )}
          {buildFeedback === 'retry' && (
            <FeedbackBanner
              kind="retry"
              en={
                wrongIsSameSound
                  ? `Right sound, different spelling — this word uses “${entry.spelling}”.`
                  : 'That spelling writes the other sound. Listen once more!'
              }
              ru={
                wrongIsSameSound
                  ? `Звук верный, но это слово пишется через «${entry.spelling}».`
                  : 'Это написание для другого звука. Послушай ещё раз!'
              }
            />
          )}
        </div>
      )}

      {phase === 'done' && (
        <FeedbackBanner
          kind="correct"
          en={`Bridge crossed: ${firstTry} of ${words.length} words built on the first try!`}
          ru={`Мост пройден: ${firstTry} из ${words.length} слов собраны с первой попытки!`}
        />
      )}
    </ScreenLayout>
  )
}
