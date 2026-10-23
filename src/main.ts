import './style.css'
import { loadAtlas, perWeek } from './data'
import { createMap } from './map'
import { compact, money, monthYear } from './format'

const WEEK_SCALE = 400

const { atlas, cells } = await loadAtlas()

document.querySelector('[data-total]')!.textContent = compact(atlas.totals.tickets)
document.querySelector('[data-fines]')!.textContent = money(atlas.totals.fines)
document.querySelector('[data-range]')!.textContent = `${monthYear(atlas.range.first)} to ${monthYear(atlas.range.last)}`

const view = createMap(document.getElementById('map')!, cells)
const values = new Float32Array(cells.length)
cells.forEach((c, i) => (values[i] = perWeek(atlas, c, null)))
view.draw(values, WEEK_SCALE)

document.querySelector('[data-loading]')!.remove()
