import type { AppState, Results, ScreenId, Settings } from '../types/progress'
import { SCREEN_ORDER } from '../types/progress'

export const STORAGE_KEY = 'fluffy-sound-lab-p01'

export const DEFAULT_RESULTS: Results = {
  diagnosticBaseline: null,
  earLab: null,
  ipaMatch: null,
  spelling: null,
  bossHear: null,
  bossMatch: null,
  bossBuild: null,
  speaking: 'none',
  selfChecks: [],
  sentenceDone: false,
  bossDone: false,
}

export const DEFAULT_SETTINGS: Settings = {
  quietMode: false,
  russianSupport: true,
  adultGate: false,
}

export const INITIAL_STATE: AppState = {
  mode: null,
  screen: 'modeSelection',
  completed: [],
  results: DEFAULT_RESULTS,
  settings: DEFAULT_SETTINGS,
}

/** Session-only fallback when localStorage is unavailable (private mode etc.). */
let memoryStore: string | null = null

function storageAvailable(): boolean {
  try {
    const probe = '__fsl_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

function isValidScreen(value: unknown): value is ScreenId {
  return typeof value === 'string' && (SCREEN_ORDER as string[]).includes(value)
}

/** Rebuild a safe state from possibly corrupted stored JSON. */
function sanitise(raw: unknown): AppState {
  if (typeof raw !== 'object' || raw === null) return INITIAL_STATE
  const r = raw as Record<string, unknown>
  const mode =
    r.mode === 'kids' || r.mode === 'adults' || r.mode === 'together' ? r.mode : null
  const screen = isValidScreen(r.screen) && mode !== null ? r.screen : 'modeSelection'
  const completed = Array.isArray(r.completed) ? r.completed.filter(isValidScreen) : []
  const storedResults = (typeof r.results === 'object' && r.results !== null ? r.results : {}) as Partial<Results>
  const storedSettings = (typeof r.settings === 'object' && r.settings !== null ? r.settings : {}) as Partial<Settings>
  return {
    mode,
    screen,
    completed,
    results: { ...DEFAULT_RESULTS, ...storedResults },
    settings: { ...DEFAULT_SETTINGS, ...storedSettings },
  }
}

export function loadState(): AppState {
  try {
    const raw = storageAvailable() ? localStorage.getItem(STORAGE_KEY) : memoryStore
    if (!raw) return INITIAL_STATE
    return sanitise(JSON.parse(raw))
  } catch {
    return INITIAL_STATE
  }
}

export function saveState(state: AppState): void {
  const payload = JSON.stringify(state)
  try {
    if (storageAvailable()) {
      localStorage.setItem(STORAGE_KEY, payload)
    } else {
      memoryStore = payload
    }
  } catch {
    memoryStore = payload
  }
}

export function clearState(): void {
  memoryStore = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage unavailable — memory copy already cleared
  }
}
