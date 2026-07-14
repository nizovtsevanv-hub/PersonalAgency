import { useEffect, useMemo, useState } from 'react'
import { AppContext } from './state/AppContext'
import { useLocalProgress } from './hooks/useLocalProgress'
import { useReducedMotion } from './hooks/useReducedMotion'
import { unlock } from './services/audioService'
import { AppHeader } from './components/AppHeader'
import { SettingsPanel } from './components/SettingsPanel'
import { ModeSelection } from './screens/ModeSelection'
import { Diagnostic } from './screens/Diagnostic'
import { VisualHook } from './screens/VisualHook'
import { EarLab } from './screens/EarLab'
import { MouthLabScreen } from './screens/MouthLabScreen'
import { IpaTrace } from './screens/IpaTrace'
import { SpellingBridge } from './screens/SpellingBridge'
import { SpeakReplay } from './screens/SpeakReplay'
import { SpeechTransfer } from './screens/SpeechTransfer'
import { SoundBoss } from './screens/SoundBoss'
import { Passport } from './screens/Passport'

export default function App() {
  const { state, dispatch } = useLocalProgress()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  // Unlock/initialise audio on the first user gesture (required on iOS).
  useEffect(() => {
    const once = () => unlock()
    window.addEventListener('pointerdown', once, { once: true })
    window.addEventListener('keydown', once, { once: true })
    return () => {
      window.removeEventListener('pointerdown', once)
      window.removeEventListener('keydown', once)
    }
  }, [])

  const ctx = useMemo(() => ({ state, dispatch }), [state, dispatch])

  const screen = (() => {
    switch (state.screen) {
      case 'modeSelection':
        return <ModeSelection />
      case 'diagnostic':
        return <Diagnostic />
      case 'visualHook':
        return <VisualHook />
      case 'earLab':
        return <EarLab />
      case 'mouthLab':
        return <MouthLabScreen />
      case 'ipaTrace':
        return <IpaTrace />
      case 'spellingBridge':
        return <SpellingBridge />
      case 'speakReplay':
        return <SpeakReplay />
      case 'speechTransfer':
        return <SpeechTransfer />
      case 'soundBoss':
        return <SoundBoss />
      case 'passport':
        return <Passport />
      default:
        return <ModeSelection />
    }
  })()

  return (
    <AppContext.Provider value={ctx}>
      <div
        className={`app${reducedMotion ? ' app--reduced-motion' : ''}${state.settings.quietMode ? ' app--quiet' : ''}`}
      >
        <a className="skip-link" href="#main-stage">
          Skip to the learning task
        </a>
        <AppHeader onOpenSettings={() => setSettingsOpen(true)} />
        {/* key resets per-screen local state when the screen changes */}
        <div className="app-body" key={`${state.screen}-${state.mode ?? 'none'}`}>
          {screen}
        </div>
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </AppContext.Provider>
  )
}
