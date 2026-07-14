import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'recorded'
  | 'denied'
  | 'unsupported'

/** Safari/iOS prefers MP4/AAC; Chromium prefers WebM/Opus. Never hard-code one. */
const MIME_CANDIDATES = [
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
]

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t))
}

/**
 * Fully local recording. The audio blob lives in memory only, exposed via an
 * object URL that is revoked whenever it is replaced or the hook unmounts.
 * Nothing is uploaded or persisted.
 */
export function useMediaRecorder() {
  const [status, setStatus] = useState<RecorderStatus>(() =>
    typeof MediaRecorder === 'undefined' ||
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
      ? 'unsupported'
      : 'idle',
  )
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const urlRef = useRef<string | null>(null)

  const disposeUrl = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }

  const stopTracks = () => {
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    recorderRef.current = null
  }

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      stopTracks()
      disposeUrl()
    }
  }, [])

  const start = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        disposeUrl()
        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setRecordingUrl(url)
        setStatus('recorded')
        stream.getTracks().forEach((t) => t.stop())
        recorderRef.current = null
      }
      recorderRef.current = recorder
      recorder.start()
      setStatus('recording')
    } catch {
      setStatus('denied')
    }
  }, [])

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  const reset = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    stopTracks()
    disposeUrl()
    setRecordingUrl(null)
    setStatus(
      typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia
        ? 'unsupported'
        : 'idle',
    )
  }, [])

  return { status, recordingUrl, start, stop, reset }
}
