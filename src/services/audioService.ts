/**
 * Reusable audio service for FLUFFY SOUND LAB.
 *
 * Playback priority:
 *   1. matching local reference audio file in /public/audio (if present);
 *   2. speechSynthesis with a preferred en-GB voice;
 *   3. any other available English voice (a subtle notice is surfaced in Settings).
 *
 * Nothing autoplays before the first user gesture; `unlock()` is called on the
 * first pointer/key interaction so iOS Safari allows subsequent playback.
 */

export type AudioSource = 'file' | 'tts-en-gb' | 'tts-en-other' | 'none'

export interface SpeakOptions {
  /** Explicit rate. When omitted, repeated plays of one key alternate 1.0 ↔ 0.85. */
  rate?: number
  /** Fired per word boundary when the engine supports it (charIndex based). */
  onBoundary?: (charIndex: number) => void
  onEnd?: () => void
}

const BASE = import.meta.env.BASE_URL

/** Optional human-recorded files this pilot knows how to use (see AUDIO_REGISTER.md). */
function fileCandidates(key: string): string[] {
  return [`${BASE}audio/en-gb-f1-${key}.mp3`, `${BASE}audio/en-gb-m1-${key}.mp3`]
}

const fileAvailability = new Map<string, Promise<string | null>>()

function findLocalFile(key: string): Promise<string | null> {
  const cached = fileAvailability.get(key)
  if (cached) return cached
  const probe = (async () => {
    for (const url of fileCandidates(key)) {
      try {
        const res = await fetch(url, { method: 'HEAD' })
        const type = res.headers.get('content-type') ?? ''
        if (res.ok && type.startsWith('audio')) return url
      } catch {
        // network/file missing — fall through to next candidate
      }
    }
    return null
  })()
  fileAvailability.set(key, probe)
  return probe
}

// ---------------------------------------------------------------------------
// Voice management
// ---------------------------------------------------------------------------

let voices: SpeechSynthesisVoice[] = []

function refreshVoices() {
  if (typeof speechSynthesis === 'undefined') return
  voices = speechSynthesis.getVoices()
}

if (typeof speechSynthesis !== 'undefined') {
  refreshVoices()
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
}

function pickVoice(): { voice: SpeechSynthesisVoice | null; source: AudioSource } {
  if (typeof speechSynthesis === 'undefined') return { voice: null, source: 'none' }
  if (voices.length === 0) refreshVoices()
  const gb = voices.filter((v) => v.lang.toLowerCase().startsWith('en-gb'))
  if (gb.length > 0) {
    const preferred =
      gb.find((v) => /daniel|serena|kate|libby|sonia|uk english/i.test(v.name)) ?? gb[0]
    return { voice: preferred, source: 'tts-en-gb' }
  }
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  if (en.length > 0) return { voice: en[0], source: 'tts-en-other' }
  return { voice: null, source: 'none' }
}

/** Reported in the Settings panel, never in the main learning flow. */
export function getVoiceStatus(): AudioSource {
  if (typeof speechSynthesis === 'undefined') return 'none'
  return pickVoice().source
}

export function isSpeechAvailable(): boolean {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'
}

// ---------------------------------------------------------------------------
// Playback
// ---------------------------------------------------------------------------

const lastRate = new Map<string, number>()
let currentAudio: HTMLAudioElement | null = null
let unlocked = false

function nextRate(key: string, explicit?: number): number {
  if (explicit !== undefined) {
    lastRate.set(key, explicit)
    return explicit
  }
  const next = lastRate.get(key) === 1.0 ? 0.85 : 1.0
  lastRate.set(key, next)
  return next
}

/** Call once on the first user gesture so iOS allows audio afterwards. */
export function unlock() {
  if (unlocked) return
  unlocked = true
  if (typeof speechSynthesis !== 'undefined') {
    refreshVoices()
    try {
      speechSynthesis.cancel()
      speechSynthesis.resume()
    } catch {
      // best effort — some engines throw before any utterance exists
    }
  }
}

export function stopAll() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

/**
 * Speak `text` for logical `key` (word id or sentence id).
 * Resolves with the source used once playback finishes (or immediately when
 * no audio route exists so callers can show a text-only path).
 */
export function speak(key: string, text: string, opts: SpeakOptions = {}): Promise<AudioSource> {
  const rate = nextRate(key, opts.rate)
  return findLocalFile(key).then((url) => {
    stopAll()
    if (url) {
      return new Promise<AudioSource>((resolve) => {
        const audio = new Audio(url)
        currentAudio = audio
        audio.playbackRate = rate
        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null
          opts.onEnd?.()
          resolve('file')
        }
        audio.onerror = () => {
          if (currentAudio === audio) currentAudio = null
          resolve(speakWithTts(text, rate, opts))
        }
        audio.play().catch(() => resolve(speakWithTts(text, rate, opts)))
      })
    }
    return speakWithTts(text, rate, opts)
  })
}

function speakWithTts(text: string, rate: number, opts: SpeakOptions): Promise<AudioSource> {
  if (!isSpeechAvailable()) {
    opts.onEnd?.()
    return Promise.resolve('none')
  }
  const { voice, source } = pickVoice()
  return new Promise<AudioSource>((resolve) => {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = voice?.lang ?? 'en-GB'
    if (voice) utter.voice = voice
    utter.rate = rate
    utter.pitch = 1
    if (opts.onBoundary) {
      utter.onboundary = (e) => {
        if (e.name === 'word' || e.charIndex !== undefined) opts.onBoundary?.(e.charIndex)
      }
    }
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      window.clearTimeout(watchdog)
      opts.onEnd?.()
      resolve(source)
    }
    // Some engines (no installed voices, some headless/embedded browsers)
    // never fire end/error events; never let the lesson hang on audio.
    const watchdog = window.setTimeout(done, 1500 + text.length * (220 / rate))
    utter.onend = done
    utter.onerror = done
    try {
      speechSynthesis.speak(utter)
    } catch {
      done()
    }
  })
}

/** Speak several items one after another (used for compare / contrast plays). */
export async function speakSequence(
  items: Array<{ key: string; text: string; rate?: number }>,
  gapMs = 450,
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    await speak(item.key, item.text, { rate: item.rate ?? 1.0 })
    if (i < items.length - 1) {
      await new Promise((r) => setTimeout(r, gapMs))
    }
  }
}
