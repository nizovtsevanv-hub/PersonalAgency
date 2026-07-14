import raw from './FSL-P01.json'
import type { ContentP01, SoundId, SoundInfo, WordEntry } from '../types/content'
import type { Mode } from '../types/progress'

export const content = raw as ContentP01

export const kidsWords: WordEntry[] = content.words.filter((w) => w.set === 'kids')
export const adultWords: WordEntry[] = content.words.filter((w) => w.set === 'adult')

export function wordsForMode(mode: Mode | null): WordEntry[] {
  return mode === 'adults' ? content.words : kidsWords
}

export function soundInfo(id: SoundId): SoundInfo {
  return content.sounds.find((s) => s.id === id)!
}

export function wordById(id: string): WordEntry {
  return content.words.find((w) => w.id === id)!
}

/** Minimal-pair list per mode (kids pairs always; adults add live/leave, bit/beat). */
export function pairsForMode(mode: Mode | null): Array<[WordEntry, WordEntry]> {
  const base: Array<[WordEntry, WordEntry]> = [
    [wordById('ship'), wordById('sheep')],
    [wordById('sit'), wordById('seat')],
    [wordById('fill'), wordById('feel')],
  ]
  if (mode === 'adults') {
    base.push([wordById('live'), wordById('leave')], [wordById('bit'), wordById('beat')])
  }
  return base
}

export function shuffle<T>(list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function sentenceForMode(mode: Mode | null) {
  if (mode === 'adults') return content.sentences.adults
  if (mode === 'together') return content.sentences.together
  return content.sentences.kids
}
