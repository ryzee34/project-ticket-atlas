import type { Atlas, Cell } from './data'
import { perWeek } from './data'
import { dayName, hourRange, rate, whole } from './format'

export function createTooltip(atlas: Atlas) {
  const tip = document.querySelector<HTMLElement>('[data-tip]')!

  return function update(cell: Cell | null, x: number, y: number, slot: number | null) {
    if (!cell) {
      tip.hidden = true
      return
    }
    const value = document.createElement('strong')
    const label = document.createElement('span')
    if (slot === null) {
      value.textContent = `${whole(perWeek(atlas, cell, null))} a week`
      label.textContent = `${whole(cell.tickets)} tickets in two years`
    } else {
      value.textContent = `${rate(perWeek(atlas, cell, slot))} a week`
      label.textContent = `${dayName(slot, true)} ${hourRange(slot)}`
    }
    tip.replaceChildren(value, label)
    tip.style.transform = `translate(${Math.round(x + 14)}px, ${Math.round(y + 14)}px)`
    tip.hidden = false
  }
}
