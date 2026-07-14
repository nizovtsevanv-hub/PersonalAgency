import { useCallback, useEffect, useRef, useState } from 'react'
import * as audioService from '../services/audioService'
import type { SpeakOptions } from '../services/audioService'

/**
 * Component-friendly wrapper around the audio service.
 * Tracks which key is currently playing so buttons/waves can animate.
 */
export function useAudio() {
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      audioService.stopAll()
    }
  }, [])

  const play = useCallback(async (key: string, text: string, opts?: SpeakOptions) => {
    setPlayingKey(key)
    const source = await audioService.speak(key, text, opts)
    if (alive.current) setPlayingKey(null)
    return source
  }, [])

  const playSequence = useCallback(
    async (items: Array<{ key: string; text: string; rate?: number }>, gapMs?: number) => {
      setPlayingKey('sequence')
      await audioService.speakSequence(items, gapMs)
      if (alive.current) setPlayingKey(null)
    },
    [],
  )

  const stop = useCallback(() => {
    audioService.stopAll()
    setPlayingKey(null)
  }, [])

  return { play, playSequence, stop, playingKey }
}
