import { useEffect, useRef, useState } from 'react'
import { CalendarIcon, ChevronDownIcon } from './icons'
import { controlClasses } from './control'
import { useFieldContext } from './field-context'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  className?: string
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const pad = (value: number) => String(value).padStart(2, '0')

function parseISO(value?: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return null

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )

  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null
  }

  return date
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'Select a date',
  className = '',
}: DatePickerProps) {
  const field = useFieldContext()
  const id = field?.id ?? 'date-picker'
  const invalid = Boolean(field?.invalid)
  const selected = parseISO(value)
  const minDate = parseISO(min)
  const maxDate = parseISO(max)
  const today = new Date()

  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() =>
    startOfMonth(selected ?? new Date()),
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const openCalendar = () => {
    setView(startOfMonth(selected ?? new Date()))
    setOpen((prev) => !prev)
  }

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const firstYear = minDate?.getFullYear() ?? today.getFullYear() - 100
  const lastYear = maxDate?.getFullYear() ?? today.getFullYear()
  const years = Array.from(
    { length: Math.max(lastYear - firstYear + 1, 1) },
    (_, index) => lastYear - index,
  )

  const moveMonth = (offset: number) => {
    setView(new Date(year, month + offset, 1))
  }

  const selectDay = (day: Date) => {
    onChange(toISO(day))
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={openCalendar}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        aria-invalid={invalid || undefined}
        aria-describedby={field?.describedBy}
        className={controlClasses(
          invalid,
          `flex items-center justify-between gap-3 text-left ${className}`,
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CalendarIcon className="size-5 shrink-0 text-stone" />
          <span
            className={`truncate ${selected ? 'text-stone-dark' : 'text-stone/60'}`}
          >
            {selected
              ? selected.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : placeholder}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-stone transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          id={`${id}-calendar`}
          role="dialog"
          aria-label="Choose a date"
          className="absolute left-0 top-full z-50 mt-2 w-[19rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-forest/15 bg-white p-3.5 shadow-[0_18px_50px_rgba(22,95,48,0.18)]"
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-stone transition-colors hover:bg-mint/40 hover:text-forest-deeper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
            >
              <ChevronDownIcon className="size-4 rotate-90" />
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
              <select
                aria-label="Month"
                value={month}
                onChange={(event) =>
                  setView(new Date(year, Number(event.target.value), 1))
                }
                className="cursor-pointer rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-forest-deeper outline-none transition-colors hover:border-forest/15 hover:bg-[#fbfdfb] focus-visible:border-forest focus-visible:ring-4 focus-visible:ring-forest/10"
              >
                {MONTHS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Year"
                value={year}
                onChange={(event) =>
                  setView(new Date(Number(event.target.value), month, 1))
                }
                className="cursor-pointer rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-forest-deeper outline-none transition-colors hover:border-forest/15 hover:bg-[#fbfdfb] focus-visible:border-forest focus-visible:ring-4 focus-visible:ring-forest/10"
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-stone transition-colors hover:bg-mint/40 hover:text-forest-deeper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
            >
              <ChevronDownIcon className="size-4 -rotate-90" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((label) => (
              <span
                key={label}
                className="py-1 text-[11px] font-semibold uppercase tracking-wide text-stone/70"
              >
                {label}
              </span>
            ))}

            {cells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} aria-hidden="true" />

              const disabled =
                (minDate && day.getTime() < minDate.getTime()) ||
                (maxDate && day.getTime() > maxDate.getTime())
              const isSelected = selected
                ? isSameDay(day, selected)
                : false
              const isToday = isSameDay(day, today)

              return (
                <button
                  key={toISO(day)}
                  type="button"
                  disabled={Boolean(disabled)}
                  onClick={() => selectDay(day)}
                  aria-label={day.toLocaleDateString(undefined, {
                    dateStyle: 'full',
                  })}
                  aria-current={isSelected ? 'date' : undefined}
                  className={`relative grid aspect-square place-items-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 disabled:cursor-not-allowed disabled:text-stone/25 ${
                    isSelected
                      ? 'bg-forest font-semibold text-white shadow-sm'
                      : isToday
                        ? 'bg-mint/40 font-semibold text-forest-deeper hover:bg-mint/60'
                        : 'text-stone-dark hover:bg-[#f3f8f1]'
                  }`}
                >
                  {day.getDate()}
                  {isToday && !isSelected && (
                    <span
                      className="absolute bottom-1 size-1 rounded-full bg-forest"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-forest/10 pt-2.5">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              disabled={!value}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-stone transition-colors hover:bg-[#f3f8f1] hover:text-forest-deeper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
            <span className="text-[11px] text-stone/60">YYYY-MM-DD</span>
          </div>
        </div>
      )}
    </div>
  )
}
