import { useEffect, useReducer } from 'react'
import { appReducer } from '../state/appState'
import { loadState, saveState } from '../services/progressService'

/**
 * Reducer-backed app state persisted to localStorage (or session memory when
 * storage is unavailable). Refreshing the page restores mode, screen and
 * completed progress.
 */
export function useLocalProgress() {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return { state, dispatch }
}
