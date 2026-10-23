import type { Atlas, Cell } from './data'
import { perWeek, worstSlots } from './data'
import { cellToLatLng } from 'h3-js'
import { renderHeatmap } from './heatmap'
import { dayName, hourRange, money, rate, whole, monthYear } from './format'

const SHOWN_TYPES = 5
const HEX_KM2 = 0.74

export function createPanel(atlas: Atlas, onClose: () => void) {
  const panel = document.querySelector<HTMLElement>('[data-panel]')!
  const title = panel.querySelector<HTMLElement>('[data-panel-title]')!
  const sub = panel.querySelector<HTMLElement>('[data-panel-sub]')!
  const tickets = panel.querySelector<HTMLElement>('[data-panel-tickets]')!
  const fines = panel.querySelector<HTMLElement>('[data-panel-fines]')!
  const worst = panel.querySelector<HTMLOListElement>('[data-panel-worst]')!
  const heatmap = panel.querySelector<HTMLElement>('[data-panel-heatmap]')!
  const types = panel.querySelector<HTMLUListElement>('[data-panel-types]')!
  const caption = document.createElement('p')
  caption.className = 'heat-caption'

  panel.querySelector('[data-close]')!.addEventListener('click', onClose)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) onClose()
  })

  function renderWorst(cell: Cell) {
    worst.replaceChildren(
      ...worstSlots(atlas, cell, 3).map(({ slot, rate: r }) => {
        const li = document.createElement('li')
        const when = document.createElement('span')
        when.textContent = `${dayName(slot)} ${hourRange(slot)}`
        const value = document.createElement('strong')
        value.textContent = `${rate(r)} a week`
        li.append(when, value)
        return li
      }),
    )
  }

  function renderTypes(cell: Cell) {
    const top = cell.types.slice(0, SHOWN_TYPES)
    const rest = cell.types.slice(SHOWN_TYPES)
    const rows = top.map(([type, n, f]) => ({ label: atlas.types[type] ?? 'Other', n, f }))
    if (rest.length) {
      rows.push({ label: 'Everything else', n: rest.reduce((a, t) => a + t[1], 0), f: rest.reduce((a, t) => a + t[2], 0) })
    }
    const peak = Math.max(...rows.map(r => r.n), 1)
    types.replaceChildren(
      ...rows.map(r => {
        const li = document.createElement('li')
        const label = document.createElement('span')
        label.className = 'type-label'
        label.textContent = r.label
        const bar = document.createElement('span')
        bar.className = 'type-bar'
        bar.style.setProperty('--w', `${(r.n / peak) * 100}%`)
        const value = document.createElement('span')
        value.className = 'type-value'
        value.textContent = `${whole(r.n)} · ${money(r.f)}`
        li.append(label, bar, value)
        return li
      }),
    )
  }

  return {
    show(cell: Cell) {
      const [lat, lng] = cellToLatLng(cell.id)
      title.textContent = `Near ${lat.toFixed(3)}, ${lng.toFixed(3)}`
      sub.textContent = `About ${HEX_KM2} km² · ${monthYear(atlas.range.first)} to ${monthYear(atlas.range.last)}`
      tickets.textContent = whole(cell.tickets)
      fines.textContent = money(cell.fines)
      renderWorst(cell)
      const rates = cell.week.map((_, slot) => perWeek(atlas, cell, slot))
      caption.textContent = 'Hover a square for that hour'
      renderHeatmap(heatmap, rates, text => (caption.textContent = text ?? 'Hover a square for that hour'))
      heatmap.append(caption)
      renderTypes(cell)
      panel.hidden = false
      document.body.classList.add('panel-open')
    },
    hide() {
      panel.hidden = true
      document.body.classList.remove('panel-open')
    },
  }
}
