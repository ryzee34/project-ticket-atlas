import { mkdir, writeFile, appendFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { DATASET, FIRST_DAY, LAST_DAY, RAW_FILE } from './window'

const PAGE = 100_000
const COLUMNS = ['ticket_number', 'issue_date', 'issue_time', 'violation_description', 'fine_amount', 'loc_lat', 'loc_long']

function pageUrl(offset: number) {
  const params = new URLSearchParams({
    $select: COLUMNS.join(','),
    $where: `issue_date >= '${FIRST_DAY}' AND issue_date <= '${LAST_DAY}'`,
    $order: ':id',
    $limit: String(PAGE),
    $offset: String(offset),
  })
  return `${DATASET}.csv?${params}`
}

async function getPage(offset: number, attempt = 1): Promise<string> {
  const res = await fetch(pageUrl(offset))
  if (res.ok) return res.text()
  if (attempt >= 5) throw new Error(`page at ${offset} failed with ${res.status}`)
  await new Promise(r => setTimeout(r, attempt * 5000))
  return getPage(offset, attempt + 1)
}

await mkdir(dirname(RAW_FILE), { recursive: true })
await writeFile(RAW_FILE, '')

let offset = 0
let rows = 0
for (;;) {
  const text = await getPage(offset)
  const lines = text.split('\n')
  const header = lines.shift()
  const body = lines.filter(Boolean)
  if (offset === 0 && header) await appendFile(RAW_FILE, header + '\n')
  if (!body.length) break
  await appendFile(RAW_FILE, body.join('\n') + '\n')
  rows += body.length
  offset += PAGE
  console.log(`${rows.toLocaleString()} rows`)
  if (body.length < PAGE) break
}

console.log(`done, ${rows.toLocaleString()} rows in ${RAW_FILE}`)
