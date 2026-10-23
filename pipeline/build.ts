import { createReadStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parse } from 'csv-parse'
import { latLngToCell } from 'h3-js'
import { CATEGORIES, categoryOf } from './categories'
import { BOUNDS, FIRST_DAY, LAST_DAY, MONTHS, OUT_FILE, RAW_FILE, RESOLUTION } from './window'

type Cell = { n: number; fines: number; week: number[]; types: Map<number, [number, number]> }

const cells = new Map<string, Cell>()
const seen = new Set<string>()
const week = new Array<number>(168).fill(0)
const typeTotals = CATEGORIES.map(() => [0, 0] as [number, number])
const dropped = { duplicate: 0, outsideRange: 0, badTime: 0, badLocation: 0 }
let tickets = 0
let fines = 0
let read = 0

function inBounds(lat: number, lon: number) {
  return lat >= BOUNDS.south && lat <= BOUNDS.north && lon >= BOUNDS.west && lon <= BOUNDS.east
}

function cellFor(id: string) {
  let cell = cells.get(id)
  if (!cell) {
    cell = { n: 0, fines: 0, week: new Array<number>(168).fill(0), types: new Map() }
    cells.set(id, cell)
  }
  return cell
}

function weekdayCounts() {
  const counts = new Array<number>(7).fill(0)
  for (let d = new Date(`${FIRST_DAY}T00:00:00Z`); d <= new Date(`${LAST_DAY}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    counts[(d.getUTCDay() + 6) % 7]!++
  }
  return counts
}

const parser = createReadStream(RAW_FILE).pipe(parse({ columns: true, relax_column_count: true }))

for await (const row of parser as AsyncIterable<Record<string, string>>) {
  read++
  const id = row.ticket_number ?? ''
  if (id && seen.has(id)) { dropped.duplicate++; continue }
  if (id) seen.add(id)

  const day = (row.issue_date ?? '').slice(0, 10)
  if (day < FIRST_DAY || day > LAST_DAY) { dropped.outsideRange++; continue }

  const time = Number(row.issue_time)
  const hour = Math.floor(time / 100)
  if (!row.issue_time || !Number.isInteger(time) || hour > 23 || time % 100 > 59) { dropped.badTime++; continue }

  const lat = Number(row.loc_lat)
  const lon = Number(row.loc_long)
  if (!inBounds(lat, lon)) { dropped.badLocation++; continue }

  const weekday = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7
  const slot = weekday * 24 + hour
  const fine = Number(row.fine_amount) || 0
  const type = categoryOf(row.violation_description ?? '')

  const cell = cellFor(latLngToCell(lat, lon, RESOLUTION))
  cell.n++
  cell.fines += fine
  cell.week[slot]!++
  const t = cell.types.get(type) ?? [0, 0]
  t[0]++
  t[1] += fine
  cell.types.set(type, t)

  week[slot]!++
  typeTotals[type]![0]++
  typeTotals[type]![1] += fine
  tickets++
  fines += fine
}

const out = {
  range: { first: FIRST_DAY, last: LAST_DAY, months: MONTHS, weekdays: weekdayCounts() },
  totals: { tickets, fines: Math.round(fines) },
  dropped,
  types: CATEGORIES,
  typeTotals: typeTotals.map(([n, f]) => [n, Math.round(f)]),
  week,
  cells: [...cells.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .map(([id, c]) => [
      id,
      c.n,
      Math.round(c.fines),
      c.week,
      [...c.types.entries()].sort((a, b) => b[1][0] - a[1][0]).map(([type, [n, f]]) => [type, n, Math.round(f)]),
    ]),
}

await mkdir(dirname(OUT_FILE), { recursive: true })
const json = JSON.stringify(out)
await writeFile(OUT_FILE, json)

console.log(`read ${read.toLocaleString()} rows`)
console.log(`kept ${tickets.toLocaleString()} tickets, $${Math.round(fines).toLocaleString()} in fines`)
console.log(`dropped ${JSON.stringify(dropped)}`)
console.log(`${cells.size.toLocaleString()} hexagons at resolution ${RESOLUTION}`)
console.log(`${OUT_FILE} is ${(json.length / 1e6).toFixed(2)} MB`)
