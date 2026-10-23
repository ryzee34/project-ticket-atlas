# ticket atlas la

every parking ticket los angeles wrote from october 2024 to september 2026, about 3.9 million of them, on a 3d hex map of the city. drag the clock to watch a week go by, or click a hexagon to see its worst hours, fines and ticket types.

built with typescript, vite, deck.gl and maplibre. live at https://ryzee34.github.io/ticket-atlas-la/

## running it

```
npm install
npm run dev
```

## the data

tickets come from the city's [parking citations dataset](https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv), which is public domain. i only pull the date, time, location, violation and fine, so no car details ever leave the download step.

`npm run fetch-data` downloads the tickets into `data/raw` (about 380 MB, a few minutes) and `npm run build-data` cleans and counts them into `public/data/atlas.json`, which is about 1 MB.

- the window is 24 full months so every month of the year counts exactly twice. the dates live in `pipeline/window.ts`
- tickets are grouped into [h3](https://h3geo.org) hexagons at resolution 8, about 0.74 km² each
- the "a week" numbers are averages, so an hour's count divided by how many of that weekday were in the window
- 7,708 tickets with missing or out of town coordinates get dropped
- the city's 213 violation descriptions are folded into 16 groups in `pipeline/categories.ts`
- hexagon names come from the most ticketed addresses inside them

basemap from [openfreemap](https://openfreemap.org), map data © openstreetmap contributors.
