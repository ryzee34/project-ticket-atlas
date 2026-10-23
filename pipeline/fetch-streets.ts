import { writeFile } from 'node:fs/promises'
import { DATASET, FIRST_DAY, LAST_DAY, STREETS_FILE } from './window'

const PAGE = 100_000

function pageUrl(offset: number) {
  const params = new URLSearchParams({
    $select: 'location, count(*) as n, avg(loc_lat) as lat, avg(loc_long) as lon',
    $where: `issue_date >= '${FIRST_DAY}' AND issue_date <= '${LAST_DAY}' AND loc_lat > 33.5`,
    $group: 'location',
    $order: 'location',
    $limit: String(PAGE),
    $offset: String(offset),
  })
  return `${DATASET}.csv?${params}`
}

const lines: string[] = []
let offset = 0
for (;;) {
  const res = await fetch(pageUrl(offset))
  if (!res.ok) throw new Error(`streets page at ${offset} failed with ${res.status}`)
  const rows = (await res.text()).split('\n')
  const header = rows.shift()
  const body = rows.filter(Boolean)
  if (offset === 0 && header) lines.push(header)
  lines.push(...body)
  console.log(`${(lines.length - 1).toLocaleString()} addresses`)
  if (body.length < PAGE) break
  offset += PAGE
}

await writeFile(STREETS_FILE, lines.join('\n') + '\n')
console.log(`done, wrote ${STREETS_FILE}`)
