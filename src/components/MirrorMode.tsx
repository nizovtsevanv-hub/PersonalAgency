import { useEffect, useRef, useState } from 'react'
import { Bi } from './Bi'

interface MirrorModeProps {
  open: boolean
  onClose: () => void
}

type MirrorStatus = 'notice' | 'starting' | 'live' | 'denied' | 'unsupported'

/**
 * Optional selfie mirror for articulation practice. The video is local only:
 * nothing is captured, stored or transmitted, and every camera track is
 * stopped when the mirror closes or unmounts.
 */
export function MirrorMode({ open, onClose }: MirrorModeProps) {
  const [status, setStatus] = useState<MirrorStatus>('notice')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => {
    if (!open) {
      stopTracks()
      setStatus('notice')
    }
    return stopTracks
  }, [open])

  if (!open) return null

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }
    setStatus('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setStatus('live')
    } catch {
      setStatus('denied')
    }
  }

  const close = () => {
    stopTracks()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal mirror-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Mirror Mode"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2><Bi en="Mirror Mode" ru="Режим зеркала" /></h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close Mirror Mode and stop the camera">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {status === 'notice' && (
          <div className="mirror-notice">
            <p>
              <Bi
                en="The mirror shows your mouth so you can copy the diagram. The camera image stays on this device — it is never recorded, saved or uploaded."
                ru="Зеркало показывает твой рот, чтобы повторить схему. Изображение с камеры остаётся на устройстве — оно не записывается, не сохраняется и не отправляется."
              />
            </p>
            <button type="button" className="btn btn--primary" onClick={() => void startCamera()}>
              <Bi en="Turn on the mirror" ru="Включить зеркало" />
            </button>
          </div>
        )}

        {status === 'starting' && <p role="status"><Bi en="Starting camera…" ru="Включаем камеру…" /></p>}

        {status === 'live' && (
          <div className="mirror-live">
            {/* playsInline keeps iPhone Safari from going fullscreen */}
            <video ref={videoRef} className="mirror-video" playsInline muted autoPlay />
            <p className="mirror-tip">
              <Bi en="Small smile for /iː/, relaxed lips for /ɪ/." ru="Лёгкая улыбка для /iː/, расслабленные губы для /ɪ/." />
            </p>
          </div>
        )}

        {(status === 'denied' || status === 'unsupported') && (
          <p role="status">
            {status === 'denied' ? (
              <Bi
                en="No camera this time — the mouth diagram works just as well!"
                ru="Камера недоступна — схема рта отлично подойдёт вместо неё!"
              />
            ) : (
              <Bi
                en="This device has no camera support — keep using the mouth diagram."
                ru="Камера не поддерживается — продолжай со схемой рта."
              />
            )}
          </p>
        )}
      </div>
    </div>
  )
}
