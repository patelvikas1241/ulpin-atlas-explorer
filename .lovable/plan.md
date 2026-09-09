# Gurugram 3D ULPIN Upgrade

Keep the existing app: sidebar, dashboard layout, stat cards, Recent Properties table, Add Property flow, ULPIN search, property pages and analytics all stay. The change is the data, the map experience and the surrounding polish.

## 1. Relocate to Gurugram, Haryana

- Replace the six Delhi demo parcels with ~14 realistic Gurugram parcels centred on 28.4595, 77.0266: Cyber City, DLF Phase 1-5, Golf Course Road, Sohna Road, Sector 29, Udyog Vihar, MG Road, Sushant Lok, Palam Vihar, Manesar edge.
- ULPINs become `IN-HR-GGM-########`; plot numbers stay `P-0xx`.
- Mix of tower/office/residential/retail/industrial with true-to-life floor counts (3 to 32) and unit counts, plus owner name, registry date, land value, built-up area, and Verified/Pending/Draft status.
- Every screen keeps a visible "Simulated demo data - not official land records" label.

## 2. New 3D map experience

Rebuild the scene as a small Gurugram district rather than a symmetric grid:

- Real coordinates projected to scene positions, so relative layout matches the actual city.
- Extruded parcels with visible boundaries; buildings extruded to real height with per-floor banding, window texture, rooftop details and slight footprint variety.
- Road network derived from the main corridors (NH-48, Golf Course Road, Sohna Road, MG Road) with lane markings.
- Rapid Metro / Yellow Line corridor as an elevated viaduct with station markers.
- Infrastructure layer: parks, water body, a few trees and street lights.
- Hover highlight and click select; selected building glows and shows a floating ULPIN label.

## 3. Floor and unit drill-down

- Clicking a building opens the info panel with a vertical floor list, top floor first.
- Selecting a floor isolates it: the rest of the tower turns translucent, the chosen slab highlights and rises slightly.
- Each floor expands into unit cards (e.g. 1201, 1202) showing unit ULPIN suffix, carpet area, usage and occupancy status.

## 4. Map controls and layers

- Layer toggles: buildings, parcels, roads, metro, parks, labels.
- Camera presets: Top / Isometric / Street, plus reset, zoom in/out, and a "focus selected" button.
- Search box on the map itself: type ULPIN, plot number or locality; camera flies to the match.
- Legend for land-use colours and status.

## 5. Supporting screens

- Dashboard stats, hero copy and Recent Properties switch to Gurugram numbers and localities; add a compact locality summary strip.
- Properties list and detail pages gain the new metadata fields and the improved mini 3D view.
- Analytics adds a locality breakdown alongside the existing type and floor charts.
- Add Property defaults to Gurugram coordinates and HR/GGM ULPIN prefixes; validation warns when coordinates fall outside the Gurugram bounds.

## Technical notes

- Data model in `src/lib/ulpin.ts` extends `Property` with locality, owner, registry date, built-up area, land value, and a `units` shape; a small lon/lat to scene-metre projection helper keeps positions consistent.
- Scene work stays in `src/components/three/PropertyScene.tsx`, split into `Buildings`, `Roads`, `Metro`, `Parks`, `Parcels` modules under `src/components/three/`; still loaded through the existing client-only `ClientScene` wrapper.
- Instanced or memoised geometry for windows and street furniture to hold the draw-call budget; camera moves use damped lerp in `useFrame`.
- Rendered result verified with a browser screenshot before hand-off.
