/** The two contrasted vowels of module FSL-P01. */
export type SoundId = 'ih' | 'ee'

export interface SoundInfo {
  id: SoundId
  ipa: string
  colorVar: string
  /** English articulation hints (adult wording). */
  articulation: string[]
  /** Simplified hints for Kids Mode. */
  kidsHints: string[]
  /** Anchor word id used when an isolated phoneme recording is unavailable. */
  anchorWordId: string
  /** Typical relative duration used for wave visuals only. */
  wave: 'short' | 'long'
}

export interface WordEntry {
  id: string
  word: string
  /** British IPA, always shown between the word and the Russian meaning. */
  ipa: string
  ru: string
  sound: SoundId
  /** Spelling pattern that writes the vowel: i / ee / ea. */
  spelling: string
  set: 'kids' | 'adult'
}

export interface SentenceEntry {
  id: string
  en: string
  ipa: string
  ru: string
  /** Sentence split into speakable/highlightable tokens. */
  tokens: string[]
}

export interface DialogueLine {
  speaker: 'A' | 'B'
  en: string
  ru: string
}

export interface WarningPairEntry {
  word: string
  ipa: string
  ru: string
  note: string
}

export interface ContentP01 {
  moduleId: string
  title: string
  contrast: string
  sounds: SoundInfo[]
  words: WordEntry[]
  sentences: {
    kids: SentenceEntry
    adults: SentenceEntry
    together: SentenceEntry
  }
  dialogue: DialogueLine[]
  /** Adult-only pronunciation warning; never practice content. */
  warningPair: WarningPairEntry[]
}
