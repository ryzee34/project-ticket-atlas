import { dayName, hourRange } from './format'

const STEP_MS = 260

type ClockOptions = {
  initial: number
  onChange(slot: number | null): void
}

export function createClock({ initial, onChange }: ClockOptions) {
  const range = document.querySelector<HTMLInputElement>('[data-slot]')!
  const play = document.querySelector<HTMLButtonElement>('[data-play]')!
  const allWeek = document.querySelector<HTMLButtonElement>('[data-all-week]')!
  const day = document.querySelector<HTMLElement>('[data-now-day]')!
  const hour = document.querySelector<HTMLElement>('[data-now-hour]')!

  let slot = initial
  let wholeWeek = false
  let timer: number | undefined

  function emit() {
    day.textContent = wholeWeek ? 'All week' : dayName(slot)
    hour.textContent = wholeWeek ? 'every hour added up' : hourRange(slot)
    range.value = String(slot)
    range.setAttribute('aria-valuetext', wholeWeek ? 'All week' : `${dayName(slot)} ${hourRange(slot)}`)
    allWeek.setAttribute('aria-pressed', String(wholeWeek))
    document.body.classList.toggle('whole-week', wholeWeek)
    onChange(wholeWeek ? null : slot)
  }

  function pause() {
    window.clearInterval(timer)
    timer = undefined
    play.classList.remove('playing')
    play.setAttribute('aria-label', 'Play the week')
  }

  function resume() {
    wholeWeek = false
    play.classList.add('playing')
    play.setAttribute('aria-label', 'Pause')
    timer = window.setInterval(() => {
      slot = (slot + 1) % 168
      emit()
    }, STEP_MS)
    emit()
  }

  range.addEventListener('input', () => {
    pause()
    wholeWeek = false
    slot = Number(range.value)
    emit()
  })

  play.addEventListener('click', () => (timer === undefined ? resume() : pause()))

  allWeek.addEventListener('click', () => {
    pause()
    wholeWeek = !wholeWeek
    emit()
  })

  emit()

  return { play: resume, pause }
}
