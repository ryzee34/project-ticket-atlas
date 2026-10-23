import { rampCss, EMPTY } from './colors'
import { dayName, hourRange, rate } from './format'

const HOUR_MARKS = [0, 6, 12, 18]
const MARK_LABELS = ['12a', '6a', '12p', '6p']

export function renderHeatmap(root: HTMLElement, rates: number[], onHover: (text: string | null) => void) {
  root.replaceChildren()
  const peak = Math.max(...rates, 0)

  const grid = document.createElement('div')
  grid.className = 'heat-grid'
  grid.setAttribute('role', 'img')
  grid.setAttribute('aria-label', 'Tickets a week for every hour, Monday to Sunday')

  for (let d = 0; d < 7; d++) {
    const name = document.createElement('span')
    name.className = 'heat-day'
    name.textContent = dayName(d * 24, true)
    grid.append(name)
    for (let h = 0; h < 24; h++) {
      const slot = d * 24 + h
      const value = rates[slot] ?? 0
      const cell = document.createElement('span')
      cell.className = 'heat-cell'
      cell.style.background = value > 0 && peak > 0 ? rampCss(Math.sqrt(value / peak)) : EMPTY
      cell.tabIndex = -1
      const text = `${rate(value)} a week · ${dayName(slot, true)} ${hourRange(slot)}`
      cell.addEventListener('pointerenter', () => onHover(text))
      cell.addEventListener('pointerleave', () => onHover(null))
      grid.append(cell)
    }
  }

  const axis = document.createElement('div')
  axis.className = 'heat-axis'
  HOUR_MARKS.forEach((h, i) => {
    const mark = document.createElement('span')
    mark.style.gridColumn = String(h + 2)
    mark.textContent = MARK_LABELS[i] ?? ''
    axis.append(mark)
  })

  root.append(grid, axis)
}
