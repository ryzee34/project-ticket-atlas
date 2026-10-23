const SUFFIXES: Record<string, string> = {
  AV: 'Ave', AVE: 'Ave', BL: 'Blvd', BLVD: 'Blvd', ST: 'St', DR: 'Dr', PL: 'Pl', WY: 'Way', WAY: 'Way',
  RD: 'Rd', CT: 'Ct', LN: 'Ln', TR: 'Ter', TER: 'Ter', PKWY: 'Pkwy', PY: 'Pkwy', CIR: 'Cir', HWY: 'Hwy',
}

const TRAVEL = new Set(['EB', 'WB', 'NB', 'SB'])
const SIDES = /^[NSEW]\s*\/\s*S\s+/
const DIRECTIONS = new Set(['N', 'S', 'E', 'W'])

function titleCase(word: string) {
  if (/^\d+(ST|ND|RD|TH)$/.test(word)) return word.toLowerCase()
  if (DIRECTIONS.has(word)) return word
  return word.charAt(0) + word.slice(1).toLowerCase()
}

function isHouseNumber(word: string) {
  return /^\d+[A-Z]?$/.test(word) && !/^\d+(ST|ND|RD|TH)$/.test(word)
}

export function streetOf(location: string) {
  const first = location.toUpperCase().replace(SIDES, '').split(/\/|&| AND | AT /)[0] ?? ''
  const words = first.replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  while (words.length && (isHouseNumber(words[0]!) || TRAVEL.has(words[0]!))) words.shift()
  if (words[0] === 'BROADWAY') return 'Broadway'
  const end = words.findIndex((w, i) => i > 0 && SUFFIXES[w])
  if (end > 0) words.splice(DIRECTIONS.has(words[end + 1] ?? '') ? end + 2 : end + 1)
  if (words.length > 2 && DIRECTIONS.has(words[words.length - 1]!)) words.unshift(words.pop()!)
  if (words.length < 2) return null
  return words.map((w, i) => (i > 0 && SUFFIXES[w] ? SUFFIXES[w] : titleCase(w))).join(' ')
}
