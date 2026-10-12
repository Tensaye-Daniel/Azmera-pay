// Shared styling for form controls so every input/select/textarea matches.
export const controlBase =
  'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-stone-dark placeholder:text-stone/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60'

export function controlClasses(invalid?: boolean, extra = ''): string {
  const border = invalid ? 'border-red-400 bg-red-50/40' : 'border-forest/20'
  return `${controlBase} ${border} ${extra}`.trim()
}
