import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  CheckIcon,
  ChevronDownIcon,
  LocateIcon,
  SearchIcon,
} from './icons'
import { controlClasses } from './control'
import { useFieldContext } from './field-context'

interface RegionSelectProps {
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  id?: string
  className?: string
}

export default function RegionSelect({
  value,
  onChange,
  options,
  placeholder = 'Select region…',
  id: idProp,
  className = '',
}: RegionSelectProps) {
  const field = useFieldContext()
  const id = field?.id ?? idProp ?? 'region-select'
  const invalid = Boolean(field?.invalid)
  const listId = useId()

  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const filtered = options.filter((option) =>
    option.toLowerCase().includes(query.trim().toLowerCase()),
  )

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  const openMenu = () => {
    setQuery('')
    setActiveIndex(options.indexOf(value))
    setOpen(true)
  }

  const closeMenu = () => {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  const choose = (region: string) => {
    onChange(region)
    closeMenu()
  }

  const moveActive = (step: number) => {
    if (filtered.length === 0) return
    setActiveIndex((prev) => {
      const start = prev < 0 ? (step > 0 ? -1 : 0) : prev
      return (start + step + filtered.length) % filtered.length
    })
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const region = filtered[activeIndex] ?? filtered[0]
      if (region) choose(region)
      return
    }
    if (event.key === 'Tab') closeMenu()
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={field?.describedBy}
        className={controlClasses(
          invalid,
          'flex items-center justify-between gap-3 text-left',
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <LocateIcon className="size-5 shrink-0 text-stone" />
          <span
            className={`truncate ${value ? 'text-stone-dark' : 'text-stone/60'}`}
          >
            {value || placeholder}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-stone transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-forest/15 bg-white p-2 shadow-[0_18px_50px_rgba(22,95,48,0.18)]">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-label="Search regions"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0
                  ? `${listId}-option-${activeIndex}`
                  : undefined
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search regions…"
              className="w-full rounded-xl border border-forest/15 bg-[#fbfdfb] py-2 pl-9 pr-3 text-sm text-stone-dark placeholder:text-stone/50 transition-[border-color,background-color,box-shadow] focus-visible:border-forest focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/10"
            />
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-label="Regions"
            className="mt-1.5 max-h-64 space-y-0.5 overflow-y-auto"
          >
            {filtered.length > 0 ? (
              filtered.map((region, index) => {
                const selected = region === value
                const active = index === activeIndex

                return (
                  <li key={region} role="presentation">
                    <button
                      type="button"
                      id={`${listId}-option-${index}`}
                      role="option"
                      aria-selected={selected}
                      onClick={() => choose(region)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        active || selected
                          ? 'bg-mint/40 text-forest-deeper'
                          : 'text-stone-dark hover:bg-snow'
                      }`}
                    >
                      <span className="truncate font-medium">{region}</span>
                      {selected && (
                        <CheckIcon className="size-4 shrink-0 text-forest" />
                      )}
                    </button>
                  </li>
                )
              })
            ) : (
              <li className="px-3 py-6 text-center text-sm text-stone">
                No regions found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
