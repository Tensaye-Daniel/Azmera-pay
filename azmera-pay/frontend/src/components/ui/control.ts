// Shared styling for form controls so every input/select/textarea matches.
export const controlBase =
  'w-full rounded-xl border bg-[#fbfdfb] px-3.5 py-3 text-sm text-stone-dark shadow-[0_1px_2px_rgba(22,95,48,0.03)] placeholder:text-stone/50 transition-[border-color,background-color,box-shadow] duration-200 hover:border-forest/30 focus-visible:border-forest focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/10 disabled:cursor-not-allowed disabled:opacity-60'

export function controlClasses(invalid?: boolean, extra = ''): string {
  const border = invalid
    ? 'border-red-400 bg-red-50/40 focus-visible:border-red-500 focus-visible:ring-red-500/10'
    : 'border-forest/15'
  return `${controlBase} ${border} ${extra}`.trim()
}
