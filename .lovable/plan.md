# BHUMI 3D — real interactive Gurugram 3D map

Rebrand the app to **BHUMI 3D — 3D ULPIN & Vertical Property Mapping System** and replace the current illustrated 3D scene on the map screen with a genuine WebGL map of Gurugram. The dashboard, properties list, add-property flow, search and analytics screens stay as they are, with the new dataset and naming flowing into them.

## 1. Real 3D map

- MapLibre GL JS with a free vector basemap (no API key needed), so real Gurugram streets, buildings and water appear.
- Opens at 28.4595, 77.0266, pitch ~60°, slight bearing — an angled aerial view of the city from the first second.
- Real building footprints extruded by height, plus pan, zoom, rotate, tilt and smooth fly-to.
- If the basemap fails to load: no blank screen — a "3D map service unavailable" notice with a **Load Demo Map** button that falls back to the existing Three.js Gurugram scene.

## 2. Demo dataset

- `src/data/properties.json` with 24 simulated properties across Cyber City, MG Road, Golf Course Road, Sector 29, 44, 45, 56, 57 and Udyog Vihar.
- Each record: parcelId, buildingId, ULPIN, sector, building name, lat/lon, height, floors, units, type, area, owner, registry date, value, status.
- Every parcel also carries a polygon footprint for the parcel overlay.
- "Prototype / Simulated Data" labelling stays visible on the map and every property card.

## 3. Parcels, selection and highlight

- Parcel polygons drawn over the map with boundaries; the selected parcel gets a bright animated outline and its building glows, while neighbours stay visible.
- Clicking a building or parcel flies the camera in, highlights both, and opens the Property Details panel with the 3D VIEW / VERTICAL VIEW / GENERATE ULPIN / VIEW PARCEL buttons.

## 4. Vertical and exploded building modes

- VERTICAL VIEW opens an inspection panel rendering the actual building as stacked floor slabs, top floor first.
- EXPLODE BUILDING animates the slabs apart vertically with per-floor labels (Ground … Floor 8).
- Clicking a floor shows its units; picking a unit shows floor, unit number, area, usage and the full unit ULPIN.

## 5. Controls

- 2D / 3D toggle with an animated camera transition (top-down cadastral view vs tilted perspective).
- Map Layers panel with working toggles: 3D Buildings, Property Parcels, Roads, Metro, Administrative Boundaries, Water Bodies, ULPIN Points, Property Labels.
- Camera controls: zoom in/out, reset, north, tilt, rotate, and "Explore Gurugram".
- Metro layer: Rapid Metro / Yellow Line corridor with station markers, clearly marked as simulated; clicking a station shows its name and nearby properties.

## 6. Search, ULPIN generator, demo mode

- Map search bar accepting sector, parcel ID, building ID or ULPIN, with suggestions and camera fly-to on select.
- GENERATE ULPIN modal: state Haryana, district Gurugram, area/parcel/building/floor/unit fields, generated identifier with a success state and Copy button.
- START DEMO runs a ~25 second scripted tour: Gurugram overview → Sector 44 → parcel select → building → property panel → vertical view → explode → Floor 5 → Unit 501 → ULPIN, closing on "One property. One spatial identity. From parcel to vertical unit." Exit Demo stops it at any point.

## Technical notes

- Add `maplibre-gl`; map component loaded client-only (`ClientScene` pattern) and lazily.
- Basemap: OpenFreeMap Liberty vector style — keyless, so no secrets in the frontend; a style-load error triggers the Three.js fallback.
- Parcels/metro/ULPIN points ship as GeoJSON sources with native fill-extrusion, line and symbol layers; no per-building Three.js objects on the main map, keeping it smooth.
- Vertical/exploded view stays in React Three Fiber, reusing the existing floor/unit model in `src/lib/ulpin.ts`, which is refactored to read from `properties.json`.
- Demo mode is a small step timeline driving the same state the user's clicks drive, so nothing is faked.
- Local saved records are re-seeded (storage version bump) so old data does not mix in.
