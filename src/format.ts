const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function dayName(slot: number, short = false) {
  const name = DAYS[Math.floor(slot / 24)] ?? ''
  return short ? name.slice(0, 3) : name
}

function clock(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${hour < 12 || hour === 24 ? 'AM' : 'PM'}`
}

export function hourRange(slot: number) {
  const hour = slot % 24
  return `${clock(hour)} to ${clock(hour + 1)}`
}

export function compact(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`
  if (n >= 1e4) return `${Math.round(n / 1e3)}K`
  return Math.round(n).toLocaleString('en-US')
}

export function money(n: number) {
  return n >= 1e4 ? `$${compact(n)}` : `$${Math.round(n).toLocaleString('en-US')}`
}

export function whole(n: number) {
  return Math.round(n).toLocaleString('en-US')
}

export function rate(n: number) {
  if (n >= 10) return whole(n)
  if (n >= 1) return n.toFixed(1).replace(/\.0$/, '')
  return n > 0 ? n.toFixed(2).replace(/0$/, '') : '0'
}

export function monthYear(day: string) {
  const [y, m] = day.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}
