const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function compact(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`
  if (n >= 1e4) return `${Math.round(n / 1e3)}K`
  return Math.round(n).toLocaleString('en-US')
}

export function money(n: number) {
  return n >= 1e4 ? `$${compact(n)}` : `$${Math.round(n).toLocaleString('en-US')}`
}

export function monthYear(day: string) {
  const [y, m] = day.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}
