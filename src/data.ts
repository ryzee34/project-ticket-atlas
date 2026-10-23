export type TypeShare = [type: number, tickets: number, fines: number]

export type RawCell = [id: string, tickets: number, fines: number, week: number[], types: TypeShare[]]

export type Atlas = {
  range: { first: string; last: string; months: number; weekdays: number[] }
  totals: { tickets: number; fines: number }
  dropped: Record<string, number>
  types: string[]
  typeTotals: [number, number][]
  week: number[]
  cells: RawCell[]
}

export type Cell = {
  id: string
  tickets: number
  fines: number
  week: number[]
  types: TypeShare[]
}

export async function loadAtlas() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/atlas.json`)
  if (!res.ok) throw new Error(`atlas.json failed with ${res.status}`)
  const atlas = (await res.json()) as Atlas
  const cells: Cell[] = atlas.cells.map(([id, tickets, fines, week, types]) => ({ id, tickets, fines, week, types }))
  return { atlas, cells }
}

export function weeksIn(atlas: Atlas) {
  return atlas.range.weekdays.reduce((a, b) => a + b, 0) / 7
}

export function perWeek(atlas: Atlas, cell: Cell, slot: number | null) {
  if (slot === null) return cell.tickets / weeksIn(atlas)
  return (cell.week[slot] ?? 0) / (atlas.range.weekdays[Math.floor(slot / 24)] ?? 1)
}

export function worstSlots(atlas: Atlas, cell: Cell, count: number) {
  return cell.week
    .map((_, slot) => ({ slot, rate: perWeek(atlas, cell, slot) }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, count)
    .filter(s => s.rate > 0)
}
