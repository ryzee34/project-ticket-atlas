import { Map as BaseMap, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapLibreOverlay } from '@deck.gl/maplibre'
import { H3HexagonLayer, AmbientLight, DirectionalLight, LightingEffect } from 'deck.gl'
import { rampColor } from './colors'
import type { Cell } from './data'

const STYLE = 'https://tiles.openfreemap.org/styles/dark'
const TOWER_METERS = 2600
const EMPTY: [number, number, number, number] = [60, 60, 58, 70]

export type MapView = {
  draw(values: Float32Array, scale: number): void
}

setWorkerUrl(workerUrl)

const lighting = new LightingEffect({
  ambient: new AmbientLight({ color: [255, 255, 255], intensity: 1.1 }),
  sun: new DirectionalLight({ color: [255, 255, 255], intensity: 1.6, direction: [-1, -3, -2] }),
})

export function createMap(container: HTMLElement, cells: Cell[]): MapView {
  const narrow = window.innerWidth < 720
  const map = new BaseMap({
    container,
    style: STYLE,
    center: [-118.37, 34.03],
    zoom: narrow ? 8.9 : 9.9,
    pitch: 52,
    bearing: -18,
    maxPitch: 70,
    attributionControl: { compact: true, customAttribution: 'Tickets from the <a href="https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv">City of Los Angeles</a>' },
  })
  map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right')

  const index = new Map(cells.map((c, i) => [c.id, i]))
  const overlay = new MapLibreOverlay({ interleaved: false, effects: [lighting], layers: [] })
  map.addControl(overlay)

  let values: Float32Array = new Float32Array(cells.length)
  let scale = 1

  function layer() {
    return new H3HexagonLayer<Cell>({
      id: 'hexes',
      data: cells,
      getHexagon: c => c.id,
      extruded: true,
      coverage: 0.88,
      elevationScale: 1,
      getElevation: c => Math.max((values[index.get(c.id)!] ?? 0) / scale, 0) * TOWER_METERS,
      getFillColor: c => {
        const v = values[index.get(c.id)!] ?? 0
        return v > 0 ? rampColor(Math.sqrt(v / scale)) : EMPTY
      },
      material: { ambient: 0.5, diffuse: 0.6, shininess: 24, specularColor: [60, 64, 70] },
      transitions: { getElevation: 380, getFillColor: 380 },
      updateTriggers: { getElevation: [values, scale], getFillColor: [values, scale] },
    })
  }

  return {
    draw(next, nextScale) {
      values = next
      scale = nextScale
      overlay.setProps({ layers: [layer()] })
    },
  }
}
