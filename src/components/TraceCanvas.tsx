import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Bi } from './Bi'

interface TraceCanvasProps {
  glyph: string
  color: string
  /** Called once when enough of the symbol has been traced. */
  onTraced?: () => void
}

const TRACE_TARGET_PX = 420

/**
 * Touch/pointer tracing canvas. The IPA glyph sits behind a transparent
 * canvas; strokes accumulate until the trace counts as complete.
 */
export function TraceCanvas({ glyph, color, onTraced }: TraceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const lengthRef = useRef(0)
  const doneRef = useRef(false)
  const [done, setDone] = useState(false)

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const dpr = window.devicePixelRatio || 1
    const rect = wrap.getBoundingClientRect()
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 14
      ctx.strokeStyle = color
    }
  }, [color])

  useEffect(() => {
    resize()
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [resize])

  const pointFrom = (e: ReactPointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pointFrom(e)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drawing.current || !last.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const p = pointFrom(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lengthRef.current += Math.hypot(p.x - last.current.x, p.y - last.current.y)
    last.current = p
    if (!doneRef.current && lengthRef.current >= TRACE_TARGET_PX) {
      doneRef.current = true
      setDone(true)
      onTraced?.()
    }
  }

  const onPointerUp = () => {
    drawing.current = false
    last.current = null
  }

  const reset = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
    }
    lengthRef.current = 0
    doneRef.current = false
    setDone(false)
  }

  return (
    <div className="trace">
      <div className="trace-wrap" ref={wrapRef}>
        <span className="trace-glyph ipa" style={{ color }} aria-hidden="true">
          {glyph}
        </span>
        <canvas
          ref={canvasRef}
          className="trace-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={`Trace the symbol ${glyph} with your finger or mouse`}
          role="img"
        />
        {done && (
          <span className="trace-done" role="status">
            ★ <Bi en="Traced!" ru="Обведено!" />
          </span>
        )}
      </div>
      <button type="button" className="btn btn--soft trace-reset" onClick={reset}>
        <Bi en="Clear tracing" ru="Очистить" />
      </button>
    </div>
  )
}
