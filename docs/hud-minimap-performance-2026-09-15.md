# Movement HUD and minimap follow-up — September 15

User still reports warming on the latest release. The last upload-range fix is now deployed in dpl_9ki3bVH7E3WrvHLMaNbjH6nF2wK7; earlier notes calling it pending are historical.

## Changes (local, not deployed)

- Town caches viewport dimensions in its existing resize handlers. The render loop no longer reads clientWidth/clientHeight after HUD mutations. ResizeObserver, window and visualViewport events still update projection and renderer sizing.
- Visibility writes are conditional. Building prompts resolve offscreen/nearest-building state before changing hidden, preventing hide/show churn. No polling cadence or interaction radius changed.
- Floating prompts use independent CSS translate with stable left/top, preserving their existing percentage anchor transform. The Enter Store bounding rectangle matches the legacy left/top position exactly and clicking still opens the Store.
- The minimap scrolls an HTML layer containing the static SVG island. It retains continuous interpolation, the same map extent/zoom, centered marker, colors and offshore mask. Previously an animated SVG group caused layout every animation frame. Full-map navigation retains its previous SVG implementation. No new animation loop or asset request was introduced.

## Measurements

Built production Chromium, mobile 440×760/DPR3, four-second samples at the same initial location, height28, hover/movement/boost. Raw results: hud-minimap-performance-2026-09-15.json. Counts are workload evidence, not temperature or total frame-time percentages.

| Sample | Live redundant hidden writes | Final | Live size reads | Final | Live layouts | Final |
|---|---:|---:|---:|---:|---:|---:|
| Hover |984|0|246|0|0|0|
| Moving |1024|0|256|0|241|2|
| Boost |976|0|244|0|222|3|

Isolation: alternating normal minimap animation and no-transition diagnostics produced 240/231 layouts versus 26/26. The shipped candidate preserves animation using a compositor layer; the no-transition diagnostic was not applied to the app.

Style recalculation still occurs while moving, and measured timing totals are noisy: the reduction in layout count does not establish a corresponding total CPU or GPU speedup. An HTML compositor layer can retain a raster backing for the island map, so this trades some bounded layer memory for less repeated SVG layout. No whole-game resolution or frame-rate changes were made.

## Validation and limits

Production build and typecheck passed. Landscape resize matched camera aspect to760×440. Store prompt position parity and click passed. Onshore/store, field, and offshore screenshots preserve positions and boundary, with mean absolute channel differences of approximately0.63,0.64,0.48 out of255 due to rasterization. Visual pairs inspected. Existing position subscription continues to stop while minimized/inactive. Physical iPhone/Safari memory and thermal outcomes need a real-device retest; Chromium does not prove cooling.

Scripts used: /tmp/fi2-hud-work-review.cjs, /tmp/fi2-minimap-diagnostic.cjs, /tmp/fi2-hud-prompt-parity.cjs, /tmp/fi2-map-layer-visual.cjs. Local comparison server8119; user dev server8092 untouched.
