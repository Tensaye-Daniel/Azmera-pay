import { GENDER_OPTIONS } from '../../data/reference'
import { useFieldContext } from './field-context'
import { CheckIcon } from './icons'

interface GenderChoiceProps {
  value: string
  onChange: (value: string) => void
}

export default function GenderChoice({ value, onChange }: GenderChoiceProps) {
  const field = useFieldContext()
  const id = field?.id ?? 'gender'
  const invalid = Boolean(field?.invalid)

  return (
    <div
      role="radiogroup"
      aria-labelledby={field?.labelId}
      aria-invalid={invalid || undefined}
      aria-describedby={field?.describedBy}
      className="grid grid-cols-2 gap-2.5"
    >
      {GENDER_OPTIONS.map((option) => {
        const selected = value === option.value

        return (
          <label
            key={option.value}
            className={`relative flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium transition-[border-color,background-color,box-shadow] duration-200 has-[:focus-visible]:border-forest has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-forest/10 ${
              selected
                ? 'border-forest bg-mint/30 text-forest-deeper shadow-[0_1px_2px_rgba(22,95,48,0.06)]'
                : invalid
                  ? 'border-red-400 bg-red-50/40 text-stone-dark hover:border-red-500'
                  : 'border-forest/15 bg-[#fbfdfb] text-stone-dark hover:border-forest/30 hover:bg-white'
            }`}
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span>{option.label}</span>
            <span
              aria-hidden="true"
              className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${
                selected
                  ? 'border-forest bg-forest text-white'
                  : 'border-stone/30 bg-white text-transparent'
              }`}
            >
              <CheckIcon className="size-3" />
            </span>
          </label>
        )
      })}
    </div>
  )
}
