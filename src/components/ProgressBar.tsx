interface ProgressBarProps {
  value: number
  max: number
  label?: string
}

export function ProgressBar({ value, max, label = 'Lesson progress' }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div
      className="progressbar"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${label}: step ${value} of ${max}`}
    >
      <div className="progressbar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
