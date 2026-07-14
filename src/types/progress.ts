export type Mode = 'kids' | 'adults' | 'together'

export type ScreenId =
  | 'modeSelection'
  | 'diagnostic'
  | 'visualHook'
  | 'earLab'
  | 'mouthLab'
  | 'ipaTrace'
  | 'spellingBridge'
  | 'speakReplay'
  | 'speechTransfer'
  | 'soundBoss'
  | 'passport'

export const SCREEN_ORDER: ScreenId[] = [
  'modeSelection',
  'diagnostic',
  'visualHook',
  'earLab',
  'mouthLab',
  'ipaTrace',
  'spellingBridge',
  'speakReplay',
  'speechTransfer',
  'soundBoss',
  'passport',
]

export interface ScoreResult {
  correct: number
  total: number
}

export type SpeakingStatus = 'none' | 'recorded' | 'selfPractice'

export interface Results {
  /** Unscored baseline confusion recorded before teaching. */
  diagnosticBaseline: ScoreResult | null
  earLab: ScoreResult | null
  ipaMatch: ScoreResult | null
  spelling: ScoreResult | null
  bossHear: ScoreResult | null
  bossMatch: ScoreResult | null
  bossBuild: ScoreResult | null
  speaking: SpeakingStatus
  /** Self-check statements ticked on SpeakReplay. */
  selfChecks: string[]
  sentenceDone: boolean
  bossDone: boolean
}

export interface Settings {
  quietMode: boolean
  russianSupport: boolean
  /** Explicit adult gate for the warning pair (Grown-ups Lab only). */
  adultGate: boolean
}

export interface AppState {
  mode: Mode | null
  screen: ScreenId
  completed: ScreenId[]
  results: Results
  settings: Settings
}

export type MasteryLevel = 'exploring' | 'practised' | 'mastered' | 'practiseAgain'

export interface PassportStatus {
  listening: MasteryLevel
  ipa: MasteryLevel
  words: MasteryLevel
  speaking: MasteryLevel
  sentence: MasteryLevel
}
