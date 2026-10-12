import { CheckIcon } from './icons'

interface ProgressStepsProps {
  steps: string[]
  current: number
  onSelect?: (index: number) => void
}

export default function ProgressSteps({
  steps,
  current,
  onSelect,
}: ProgressStepsProps) {
  return (
    <nav aria-label="Sign-up progress">
      <ol className="flex items-center">
        {steps.map((title, index) => {
          const complete = index < current
          const active = index === current
          const clickable = Boolean(onSelect) && index < current

          return (
            <li
              key={title}
              className="flex flex-1 items-center gap-2 last:flex-none"
            >
              <button
                type="button"
                onClick={() => clickable && onSelect?.(index)}
                disabled={!clickable}
                aria-current={active ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${title}`}
                className={`flex items-center gap-2 rounded-lg ${
                  clickable
                    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40'
                    : 'cursor-default'
                }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-forest text-white'
                      : complete
                        ? 'bg-mint/70 text-forest-deeper'
                        : 'bg-forest/10 text-stone'
                  }`}
                >
                  {complete ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`hidden max-w-28 truncate text-xs font-medium sm:block ${
                    active ? 'text-forest-deeper' : 'text-stone'
                  }`}
                >
                  {title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`h-px min-w-3 flex-1 ${
                    complete ? 'bg-forest/40' : 'bg-forest/15'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
