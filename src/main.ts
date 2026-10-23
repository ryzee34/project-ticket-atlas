import './style.css'
import { loadAtlas, perWeek } from './data'
import type { Cell } from './data'
import { createMap } from './map'
import { createClock } from './clock'
import { createPanel } from './panel'
import { createTooltip } from './tooltip'
import { compact, money, monthYear, rate, whole } from './format'
import { rampGradient } from './colors'

const SLOT_SCALE = 8
const WEEK_SCALE = 400
const FIRST_SLOT = 32

const { atlas, cells } = await loadAtlas()

document.querySelector('[data-total]')!.textContent = compact(atlas.totals.tickets)
document.querySelector('[data-fines]')!.textContent = money(atlas.totals.fines)
document.querySelector('[data-range]')!.textContent = `${monthYear(atlas.range.first)} to ${monthYear(atlas.range.last)}`
document.querySelector<HTMLElement>('.legend-bar')!.style.background = rampGradient()

const legendLabel = document.querySelector<HTMLElement>('[data-legend-label]')!
const legendMax = document.querySelector<HTMLElement>('[data-legend-max]')!

let slot: number | null = FIRST_SLOT
let selected: Cell | null = null

const tooltip = createTooltip(atlas)
const panel = createPanel(atlas, () => select(null))
const view = createMap(document.getElementById('map')!, cells, {
  onHover: (cell, x, y) => tooltip(cell, x, y, slot),
  onPick: cell => select(cell),
})

function values() {
  const out = new Float32Array(cells.length)
  cells.forEach((c, i) => (out[i] = perWeek(atlas, c, slot)))
  return out
}

function draw() {
  const scale = slot === null ? WEEK_SCALE : SLOT_SCALE
  legendLabel.textContent = slot === null ? 'Tickets a week, all hours' : 'Tickets a week in this hour'
  legendMax.textContent = `${slot === null ? whole(scale) : rate(scale)}+`
  view.draw(values(), scale, selected?.id ?? null)
}

function select(cell: Cell | null) {
  selected = cell
  if (cell) {
    panel.show(cell)
    view.focus(cell)
  } else {
    panel.hide()
  }
  draw()
}

const clock = createClock({
  initial: FIRST_SLOT,
  onChange: next => {
    slot = next
    draw()
  },
})

document.querySelector('[data-loading]')!.remove()

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) clock.play()
