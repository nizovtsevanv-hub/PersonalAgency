import type { WordEntry } from '../types/content'
import { WordArt } from './WordArt'
import { useAudio } from '../hooks/useAudio'
import { SpeakerIcon } from './AudioButton'

interface WordCardProps {
  entry: WordEntry
  selected?: boolean
  onSelect?: () => void
  playOnTap?: boolean
  size?: 'sm' | 'md' | 'lg'
  hideIpa?: boolean
  hideRu?: boolean
  accented?: boolean
}

/**
 * Vocabulary card. The content order is fixed and non-negotiable:
 * English word → British IPA → Russian meaning.
 */
export function WordCard({
  entry,
  selected,
  onSelect,
  playOnTap = true,
  size = 'md',
  hideIpa = false,
  hideRu = false,
  accented = false,
}: WordCardProps) {
  const { play, playingKey } = useAudio()
  const playing = playingKey === entry.id

  const handleClick = () => {
    if (onSelect) onSelect()
    else if (playOnTap) void play(entry.id, entry.word)
  }

  const interactive = Boolean(onSelect) || playOnTap
  const cls = [
    'word-card',
    `word-card--${size}`,
    selected ? 'is-selected' : '',
    accented ? `word-card--${entry.sound}` : '',
    playing ? 'is-playing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const body = (
    <>
      <WordArt wordId={entry.id} size={size === 'lg' ? 88 : size === 'sm' ? 52 : 68} />
      <span className="word-card-word" lang="en">{entry.word}</span>
      {!hideIpa && <span className="word-card-ipa ipa">{entry.ipa}</span>}
      {!hideRu && <span className="word-card-ru" lang="ru">{entry.ru}</span>}
      {playOnTap && (
        <span className="word-card-speaker" aria-hidden="true">
          <SpeakerIcon playing={playing} />
        </span>
      )}
    </>
  )

  if (!interactive) {
    return <div className={cls}>{body}</div>
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={
        onSelect
          ? `${entry.word}, ${entry.ru}${selected ? ', selected' : ''}`
          : `Play the word ${entry.word}`
      }
    >
      {body}
    </button>
  )
}
