# Changelog

All notable changes to **Space Colonization: Idle** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-alpha.4] - 2026-11-19

### Added
- Two colony currencies—**Space Credits (`SC`)** and **Space Ore**—with custom code-generated inline SVG icons (metallic cosmic `SC` credit card and multi-faceted cyan-amethyst crystal gem) displayed in a top-left chamfered HUD (`#currency-hud`) in `src/index.html` and `src/css/style.css`.
- Currency state, idle-game number formatting (`K`–`Dc`), bump micro-animation, and passive income manager (`window.GameCurrencies`) in `src/js/currencies.js`.

### Changed
- Redesigned mobile HUD buttons in `src/index.html`, `src/css/style.css`, and `src/js/planets.js` into a bold, high-contrast chamfered sci-fi aerospace interface: edge-docked tactical planet navigation wings, a unified segmented zoom console with live optical magnification readout (`1.0×`–`2.2×`) and gauge bar, thicker icons/borders, enlarged bottom indicator dots, `≥46–52px` touch targets, and `@media (hover: hover)` guards.

### Removed
- Removed the Reset View button (`#btn-reset-view`) and `resetActiveView()` from `src/index.html`, `src/css/style.css`, and `src/js/planets.js`.

### Fixed
- Fixed 3D planet hexagons (especially elevated/selected hexagons) disappearing prematurely near the planet's edge in `src/js/planets.js` by testing true polygon-plane orientation and projected area (`planeCenter`, `signedArea2D`), preserving extruded 3D side walls with selected white-light top-rim edges across the horizon, aligning inner white borders coplanar with tile faces, and sorting tiles by un-elevated `rotCenter.z`.

## [0.1.0-alpha.3] - 2026-11-19

### Added
- Three distinct 3D rotating geodesic hexagonal planets (Goldberg polyhedra) in `src/js/planets.js` (small cryo-lunar rocky planet, medium oceanic/emerald planet, and large volcanic/amber-mineral planet) with 3D tile relief, directional/specular lighting, atmospheric halos, and white-light highlighted buildable hexagons.
- Horizontal planet carousel navigation with grow-to-middle scaling, strict single-planet visibility, background star parallax, and 3 transparent bottom indicator dots.
- 3D planet inspection and selection QoL upgrades: free 360° orbit rotation with inertia, pinch/wheel/double-tap zoom (`1.0x`–`2.2x`), smart auto-spin pause during interaction, shortest-arc auto-focus on tile tap with selection pulse ring and forgiving hit-testing, translucent left/right planet arrows, and bottom-right zoom/reset controls.

### Fixed
- Fixed `.github/workflows/sync-documentation.yml` so it skips cleanly when `documentation_sync.enabled` is `false` in `config.yaml` and exits gracefully when no other remote branches exist.

## [0.1.0-alpha.2] - 2026-11-18

### Added
- Dynamic celestial deep space background engine with multi-spectral stars (twinkling, color temperatures, diffraction spikes), drifting nebulae, cosmic dust motes, and shooting stars/meteors.

### Changed
- Streamlined interface to a clean, full-screen dynamic space viewport.
- Simplified `README.md` and updated project license strictly to GPLv3.

### Removed
- Static placeholder UI, emblem, and menu overlays in preparation for the upcoming map/gameplay interface.

## [0.1.0-alpha.1] - 2026-11-18

### Added
- Configured horizontal / landscape locked orientation across Web Manifest, JavaScript Screen Orientation API, and CSS media queries.
- Initial mobile HTML5 game structure under `src/` (`index.html`, `css/style.css`, `js/main.js`, `manifest.json`).
- Initial launch/title screen for **Space Colonization: Idle** with animated starfield background, portrait safe-area layout, and touch controls.
- Project documentation (`README.md`, `docs/`) and `.gitignore` rules tailored for HTML5 mobile and Google Play Android App Bundle (`.aab`) builds.
