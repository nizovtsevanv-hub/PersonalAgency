import type { ReactNode } from 'react'
import { FluffyCoach, type FluffyState } from './FluffyCoach'

interface ScreenLayoutProps {
  /** The single primary learning task. */
  children: ReactNode
  coachState?: FluffyState
  coachMessage?: string
  coachMessageRu?: string
  coachSide?: 'left' | 'center' | 'right'
  /** Bottom action bar: replay / check / continue as appropriate. */
  actions?: ReactNode
  wide?: boolean
}

/**
 * Learning-screen skeleton: interactive stage, Fluffy coach area, bottom
 * action bar. The compact header lives in App and stays above this.
 */
export function ScreenLayout({
  children,
  coachState = 'neutral',
  coachMessage,
  coachMessageRu,
  coachSide = 'left',
  actions,
  wide = false,
}: ScreenLayoutProps) {
  return (
    <div className={`screen${wide ? ' screen--wide' : ''}`}>
      <main className="stage" id="main-stage">
        {children}
      </main>
      <div className="coach-area">
        <FluffyCoach
          state={coachState}
          message={coachMessage}
          messageRu={coachMessageRu}
          side={coachSide}
        />
      </div>
      {actions && <div className="action-bar">{actions}</div>}
    </div>
  )
}
