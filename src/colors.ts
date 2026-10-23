const RAMP = ['#0d366b', '#104281', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#6da7ec', '#86b6ef', '#9ec5f4', '#b7d3f6', '#cde2fb']

const RGB = RAMP.map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number])

export function rampColor(t: number): [number, number, number] {
  const x = Math.min(Math.max(t, 0), 1) * (RGB.length - 1)
  const i = Math.min(Math.floor(x), RGB.length - 2)
  const f = x - i
  const a = RGB[i]!
  const b = RGB[i + 1]!
  return [0, 1, 2].map(k => Math.round(a[k]! + (b[k]! - a[k]!) * f)) as [number, number, number]
}
