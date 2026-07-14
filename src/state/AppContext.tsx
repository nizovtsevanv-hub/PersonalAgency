import { createContext, useContext } from 'react'
import type { AppState } from '../types/progress'
import type { AppAction } from './appState'
import { INITIAL_STATE } from '../services/progressService'

export interface AppContextValue {
  state: AppState
  dispatch: (action: AppAction) => void
}

export const AppContext = createContext<AppContextValue>({
  state: INITIAL_STATE,
  dispatch: () => {},
})

export function useApp(): AppContextValue {
  return useContext(AppContext)
}
