import { useApp } from '../state/AppContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { SoundPassport } from '../components/SoundPassport'
import { Bi } from '../components/Bi'
import { computePassport, MASTERY_LABELS } from '../state/appState'
import type { MasteryLevel } from '../types/progress'

const ROWS: Array<{ key: keyof ReturnType<typeof computePassport>; en: string; ru: string }> = [
  { key: 'listening', en: 'Listening', ru: 'Слушание' },
  { key: 'ipa', en: 'IPA', ru: 'Транскрипция' },
  { key: 'words', en: 'Words', ru: 'Слова' },
  { key: 'speaking', en: 'Speaking', ru: 'Говорение' },
  { key: 'sentence', en: 'Sentence', ru: 'Фраза' },
]

function statusIcon(level: MasteryLevel) {
  if (level === 'mastered') return '★'
  if (level === 'practised') return '◉'
  if (level === 'practiseAgain') return '↻'
  return '…'
}

export function Passport() {
  const { state, dispatch } = useApp()
  const status = computePassport(state.results)
  const unlocked = state.results.bossDone
  const baseline = state.results.diagnosticBaseline
  const { russianSupport } = state.settings

  const modeLabel =
    state.mode === 'adults' ? 'Grown-ups Lab' : state.mode === 'together' ? 'Together Mode' : 'Kids Lab'

  return (
    <ScreenLayout
      coachState={unlocked ? 'gold' : 'supportive'}
      coachMessage={
        unlocked
          ? 'Your first sound island is unlocked! /ɪ/ and /iː/ are yours now.'
          : 'Here is your sound map so far. Every practice makes it brighter!'
      }
      coachMessageRu={
        unlocked
          ? 'Первый звуковой остров открыт! /ɪ/ и /iː/ теперь твои.'
          : 'Вот твоя карта звуков. Каждая тренировка делает её ярче!'
      }
      actions={
        <>
          <button type="button" className="btn btn--soft"
            onClick={() => dispatch({ type: 'GO_TO', screen: 'earLab' })}>
            <Bi en="Practise again" ru="Потренироваться ещё" />
          </button>
          <button type="button" className="btn btn--soft"
            onClick={() => {
              dispatch({ type: 'SELECT_MODE', mode: 'together' })
              dispatch({ type: 'GO_TO', screen: 'speechTransfer' })
            }}>
            <Bi en="Play Together" ru="Играть вместе" />
          </button>
          <button type="button" className="btn btn--primary" onClick={() => window.print()}>
            <Bi en="Print summary" ru="Распечатать сводку" />
          </button>
        </>
      }
    >
      <div className="passport-print-area">
        <div className="screen-title">
          <h1><Bi en="My Sound Passport" ru="Мой паспорт звуков" /></h1>
          <p className="screen-sub">FLUFFY SOUND LAB · FSL-P01 · Ship or Sheep? · {modeLabel}</p>
        </div>

        <SoundPassport unlocked={unlocked} />

        <table className="passport-table">
          <caption className="visually-hidden">Learning status for each skill</caption>
          <thead>
            <tr>
              <th scope="col"><Bi en="Skill" ru="Навык" /></th>
              <th scope="col"><Bi en="Status" ru="Статус" /></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const level = status[row.key]
              return (
                <tr key={row.key}>
                  <th scope="row"><Bi en={row.en} ru={row.ru} /></th>
                  <td>
                    <span className={`mastery mastery--${level}`}>
                      <span aria-hidden="true">{statusIcon(level)}</span>{' '}
                      {MASTERY_LABELS[level].en}
                      {russianSupport && <span className="mastery-ru" lang="ru"> · {MASTERY_LABELS[level].ru}</span>}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {baseline && (
          <p className="passport-baseline">
            <Bi
              en={`Warm-up baseline: ${baseline.correct} of ${baseline.total} heard correctly before the lab.`}
              ru={`Базовая разминка: ${baseline.correct} из ${baseline.total} до занятия.`}
            />
          </p>
        )}

        {/* Parent/Teacher summary — expanded by print CSS */}
        <section className="print-summary" aria-label="Parent and teacher summary">
          <h2>Parent / Teacher Summary</h2>
          <p>
            Module FSL-P01 trains the British English contrast /ɪ/ ↔ /iː/ (ship–sheep) through
            listening discrimination, articulation, IPA recognition, spelling patterns
            (i / ee / ea), local voice recording and sentence transfer. Scores reflect
            deterministic tasks only — never accent quality.
          </p>
          <p className="print-summary-words">
            Core words: ship /ʃɪp/ корабль · sheep /ʃiːp/ овца · sit /sɪt/ сидеть · seat /siːt/
            сиденье · fill /fɪl/ наполнять · feel /fiːl/ чувствовать
          </p>
          <p>
            Next steps at home: play “short or long?” with the word pairs; stretch /iː/ with a
            small smile; keep /ɪ/ short and relaxed.
          </p>
        </section>
      </div>

      <div className="passport-next">
        <button type="button" className="btn btn--soft" disabled aria-disabled="true">
          <Bi en="Next Sound" ru="Следующий звук" /> · <Bi en="Coming next" ru="Скоро" />
        </button>
      </div>
    </ScreenLayout>
  )
}
