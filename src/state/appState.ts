import type {
  AppState,
  MasteryLevel,
  Mode,
  PassportStatus,
  Results,
  ScoreResult,
  ScreenId,
  Settings,
} from '../types/progress'
import { SCREEN_ORDER } from '../types/progress'
import { DEFAULT_RESULTS, DEFAULT_SETTINGS, INITIAL_STATE } from '../services/progressService'

export type AppAction =
  | { type: 'SELECT_MODE'; mode: Mode }
  | { type: 'GO_TO'; screen: ScreenId }
  | { type: 'BACK' }
  | { type: 'COMPLETE_AND_CONTINUE'; screen: ScreenId }
  | { type: 'SET_RESULT'; patch: Partial<Results> }
  | { type: 'SET_SETTINGS'; patch: Partial<Settings> }
  | { type: 'RESET_PROGRESS' }

export function screenIndex(screen: ScreenId): number {
  return SCREEN_ORDER.indexOf(screen)
}

export function nextScreen(screen: ScreenId): ScreenId {
  const i = screenIndex(screen)
  return SCREEN_ORDER[Math.min(i + 1, SCREEN_ORDER.length - 1)]
}

export function prevScreen(screen: ScreenId): ScreenId {
  const i = screenIndex(screen)
  return SCREEN_ORDER[Math.max(i - 1, 0)]
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_MODE':
      return { ...state, mode: action.mode }
    case 'GO_TO':
      return { ...state, screen: action.screen }
    case 'BACK':
      return state.screen === 'modeSelection'
        ? state
        : { ...state, screen: prevScreen(state.screen) }
    case 'COMPLETE_AND_CONTINUE': {
      const completed = state.completed.includes(action.screen)
        ? state.completed
        : [...state.completed, action.screen]
      return { ...state, completed, screen: nextScreen(action.screen) }
    }
    case 'SET_RESULT':
      return { ...state, results: { ...state.results, ...action.patch } }
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'RESET_PROGRESS':
      return {
        ...INITIAL_STATE,
        results: { ...DEFAULT_RESULTS },
        settings: { ...DEFAULT_SETTINGS, russianSupport: state.settings.russianSupport },
      }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Deterministic mastery logic (never assesses accent quality)
// ---------------------------------------------------------------------------

function ratio(score: ScoreResult | null): number | null {
  if (!score || score.total === 0) return null
  return score.correct / score.total
}

function combine(scores: Array<ScoreResult | null>): ScoreResult | null {
  const present = scores.filter((s): s is ScoreResult => s !== null)
  if (present.length === 0) return null
  return present.reduce(
    (acc, s) => ({ correct: acc.correct + s.correct, total: acc.total + s.total }),
    { correct: 0, total: 0 },
  )
}

function levelFor(r: number | null, threshold: number): MasteryLevel {
  if (r === null) return 'exploring'
  if (r >= threshold) return 'mastered'
  if (r >= threshold - 0.25) return 'practised'
  return 'practiseAgain'
}

export function computePassport(results: Results): PassportStatus {
  const listening = levelFor(ratio(combine([results.earLab, results.bossHear])), 0.8)
  const ipa = levelFor(ratio(combine([results.ipaMatch, results.bossMatch])), 0.75)
  const words = levelFor(ratio(combine([results.spelling, results.bossBuild])), 0.75)
  const speaking: MasteryLevel =
    results.speaking === 'recorded'
      ? 'mastered'
      : results.speaking === 'selfPractice'
        ? 'practised'
        : 'exploring'
  const sentence: MasteryLevel = results.sentenceDone ? 'mastered' : 'exploring'
  return { listening, ipa, words, speaking, sentence }
}

export const MASTERY_LABELS: Record<MasteryLevel, { en: string; ru: string }> = {
  exploring: { en: 'Exploring', ru: 'Изучаем' },
  practised: { en: 'Practised', ru: 'Потренировались' },
  mastered: { en: 'Mastered', ru: 'Освоено' },
  practiseAgain: { en: 'Practise again', ru: 'Потренируйся ещё' },
}
