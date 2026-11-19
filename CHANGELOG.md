# Changelog

All notable changes to **Space Colonization: Idle** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-alpha.9] - 2026-11-19

### Added
- **Studio Game Command Deck Build Menu UI**:
  - Re-architected building selection menu into a studio-grade command deck layout with large, highly accessible, finger-friendly touch and click targets.
  - Floating Bottom Command Deck on desktop, tablets, and portrait screens (`width: min(980px, calc(100vw - 20px))`) with centered hero 3D planet framing.
  - Adaptive 2-column side grid on compact landscape phones (`(orientation: landscape) and (max-height: 520px)`) ensuring uncompromised planet visibility and zero clipping.
- **Studio Vertical Building Cards**:
  - Large showcase stage featuring category-tinted spotlight gradients (`--cat-accent`) and prominent `58px` building artwork icons.
  - Top-right status chips (`BUILT` gold ribbon badge or `✕` red lock indicator).
  - Clear, un-truncated full-width terrain capability chips with high-contrast valid (`#dffad0`) and invalid (`#ffe0dc`) states.
  - Full-width tactile bottom action buttons (`44px` height) with multi-currency costs arranged cleanly on a single horizontal row (`[SC] 250  [Ore] 50`).
  - High-contrast unaffordable state styling with dark-indigo backing plates (`#261b54`), crisp white affordable numerals, and bright coral-red (`#ff6e66`) shortage indicators.
  - Tactile cartoon nope-shake feedback (`@keyframes build-card-shake`) when tapping locked or unaffordable cards.
- **Tile Terrain Traits & Unbuildable Notice Banners**:
  - Biome header displays active tile terrain trait pills (e.g. `[⛰ Mountainous] [⬡ Any Solid]`) alongside the biome medallion and title.
  - Contextual unbuildable warning banners for hazardous terrain like deep ocean and molten lava tiles.
- **Dedicated Demolish Action & Shelf Carousel Controls**:
  - Separated demolition into an explicit Hazard-Orange (`#ff8426`) `Demolish` action button with clear spatial isolation from the close (`✕`) button.
  - Smooth horizontal card carousel with touch scroll-snap, mouse wheel redirection, and adaptive chunky paddle navigation buttons (`<` / `>`).

### Changed
- Stable card ordering hierarchy prioritizing currently built structures (`rank 0`), followed by terrain-compatible buildings (`rank 1`), and locked buildings (`rank 2`).
- Dynamically adjusted planet framing bounds in `src/js/planets.js` to center the focused planet heroically above the studio bottom deck.

## [0.1.0-alpha.8] - 2026-11-19

### Added
- **11 Tile Biomes with Cel-Shaded Biome Icons**:
  - Deterministic procedural biome assignment across all 3 planets:
    - Planet 1 (Rocky Core): *Mountains*, *Glacier*, *Highlands*, *Crater*.
    - Planet 2 (Terraformed / Oceanic): *Mountains*, *Glacier*, *Forest*, *Plains*, *Ocean*.
    - Planet 3 (Volcanic): *Volcano*, *Canyon*, *Lava*, *Ashlands*.
  - 11 custom hand-crafted cartoon SVG biome icons in `src/assets/ui/` (`biome-mountains.svg`, `biome-glacier.svg`, `biome-highlands.svg`, `biome-crater.svg`, `biome-forest.svg`, `biome-plains.svg`, `biome-ocean.svg`, `biome-lava.svg`, `biome-volcano.svg`, `biome-canyon.svg`, `biome-ashlands.svg`).
  - Building Menu header badge socket (`.build-biome-badge` + `.build-biome-icon`) replacing raw `Tile #N` text with the active tile's biome icon and capitalized biome name (e.g., `Crater`, `Mountains`, `Forest`).
- **Cross-Planet Terrain Placement Rules & Icons**:
  - Three universal terrain compatibility groups with dedicated cel-shaded cartoon SVG icons:
    - *Any Solid* (`terrain-solid.svg`): Allows construction across solid ground types.
    - *Surface* (`terrain-surface.svg`): Restricts construction to walkable open ground and plateaus.
    - *Mountainous* (`terrain-mountainous.svg`): Requires rugged, elevated rock formations, craters, or ridges.
  - Per-building terrain requirements:
    - Mine: *Mountainous* only (Crater, Mountains, Volcano).
    - House & Windmill: *Surface* only (Highlands, Forest, Plains, Ashlands).
    - Research Lab & Solar Panel: *Any Solid* (all solid biomes).
    - Uninhabitable biomes (*Ocean*, *Lava*) disallow all construction.
  - Interactive terrain requirement chips (`.build-terrain-chip`) on each building card showing real-time placement validity (`#e2f9d4` badge when valid; `#ffd7d2` with warning indicator and card lock when invalid).
- **Building Resource Costs & Currency Integration**:
  - Attached construction resource costs:
    - Mine: `100 SC`
    - Research Lab: `250 SC`, `50 Ore`
    - House: `75 SC`, `10 Ore`
    - Windmill: `120 SC`, `25 Ore`
    - Solar Panel: `50 SC`
  - Seed balances configured for early-game colony testing (`500 SC`, `100 Ore`).
  - Added live `onChange` subscription listener pattern to `currencies.js` updating building card affordability states in real time.
  - Stacked currency cost rows inside card action buttons with red highlight indicators (`.is-short`) and disabled states (`is-unaffordable`) when player funds are insufficient.
  - Automatic balance deduction on confirmed tile placement.

### Changed
- **Demolition Hammer Strike Precision & Geometry Alignment**:
  - Dynamic 3D contact target calculation (`targetZ`) mapped to exact individual building model geometry (`Mine` 0.60, `Windmill` 0.75, `Research Lab` 0.38, `House` 0.36, `Solar Panel` 0.32).
  - Hammer pivot anchor positioned along the tile surface normal offset by the tool reach length (`handleLen + headThick / 2`), eliminating radial and sideways overshoot at impact moment (`p = 0.32`, `swingAngle = 0.0°`).
  - Flush alignment of the 8-spike starburst impact flash directly at the building contact point with an authentic elastic recoil rebound bounce (`-18°`).
- **Building Drawer Layout Adaptability**:
  - Upgraded card action button container to support multi-currency cost chips cleanly alongside the build CTA.
  - Preserved fluid scaling and zero-clipping layout across mobile portrait, compact landscape, and desktop viewports.

## [0.1.0-alpha.7] - 2026-11-19

### Added
- **3D Cartoon Construction VFX (`build`)**:
  - Billowing 4-pass fused cel-shaded cartoon fog cloud collar puffing outward around newly placed buildings with an expanding ground shockwave ring.
  - Elastic squash-and-stretch building pop-in entrance (`easeOutBack`), with a smooth shrink-down transition on building replacement.
  - Five celebratory 4-point cartoon star sparkles popping in orbit around the completed structure.
- **3D Cartoon Demolition VFX (`demolish`)**:
  - Pre-strike building trembling jitter anticipating destruction.
  - Animated overhead cartoon demolition hammer (wooden handle, steel head with red hazard chevron band, and motion whoosh arc) winding up and slamming down (`easeInQuart`).
  - High-energy 8-spike comic starburst impact flash at strike contact.
  - Instant building pancake crush (`scaleZ` compression down to `0.06`).
  - Dense charcoal-violet cartoon smoke burst, four fiery orange ember sparks, and eight tumbling 3D debris chunks exploding on parabolic gravity trajectories.

### Changed
- **Adaptive Building Menu Responsiveness & Fit**:
  - Fluid, responsive drawer sizing across desktop, mobile landscape, and ultra-wide viewports using viewport clamping (`clamp(256px, 42vw, 386px)`), ensuring all elements fit comfortably on screen without overflow.
  - Compact single-row drawer header pairing the tile identifier (`Tile #N`) with a planet pill (`Planet N`).
  - Auto-wrapping category filter tab pills and single-line building titles to prevent horizontal clipping.
  - Clean inset gold highlight border (`inset 0 0 0 3px var(--yellow)`) on built cards and subtle themed scrollbars.
  - Narrow/portrait view fallback (`@media (max-width: 519px)` and `@media (orientation: portrait) and (max-height: 540px)`) docking the menu as an adaptive bottom sheet with bottom dots automatically hidden while open.
- **Dynamic Planet Viewport Centering & Framing**:
  - Integrated `getLayoutBounds()` layout detection in `src/js/planets.js` to dynamically compute available unobstructed screen space.
  - Smoothly lerps planet center position (`drawerShiftX`, `drawerShiftY`) and auto-scales planet radius (`drawerScale`) when the building menu opens or resizes, keeping the entire 3D planet perfectly centered and fully visible on all display sizes.

## [0.1.0-alpha.6] - 2026-11-19

### Changed
- Complete visual UI overhaul: Replaced generic dark glassmorphism, chamfered wireframe polygonal cuts, and thin cyan HUD frames with a chunky, mobile-first cel-shaded cartoon art style (thick dark outlines, physical bottom press lips, and tactile color-coded buttons).
- Re-architected UI assets into dedicated hand-crafted vector files in `src/assets/ui/`:
  - `icon-credits.svg` (chunky gold SC card with embossed chip and violet core)
  - `icon-ore.svg` (faceted ice-cyan Space Ore crystal gem with sparkles)
  - Building icons: `bld-mine.svg`, `bld-research-lab.svg`, `bld-house.svg`, `bld-windmill.svg`, and `bld-solar-panel.svg`
  - Action glyphs: `icon-arrow.svg`, `icon-plus.svg`, `icon-minus.svg`, `icon-close.svg`, and `icon-trash.svg`
- Streamlined HUD and minimized UI clutter:
  - Top-left currency pill bars showing only the bold icon, value counter, and rate indicator without redundant framing.
  - Bottom-right zoom controls simplified to discrete circular `+`/`−` buttons flanking a bold magnification readout.
  - Circular edge-docked navigation buttons for planet carousel switching.
  - Redesigned building construction drawer (`#build-drawer`): royal purple container, chunky category tabs, cream building cards with circular colored icon sockets, and vibrant green `BUILD` buttons shifting to gold `BUILT` plaques.

### Removed
- Removed legacy inline HUD SVG wireframes, chamfered polygons, and temporary procedural asset generation scripts.

## [0.1.0-alpha.5] - 2026-11-19

### Added
- Interactive hexagon-click Building Menu (`#build-drawer`) with category filtering (`ALL`, `POWER`, `MINING`, `COLONY`, `SCIENCE`), bold chamfered mobile UI cards, custom SVG building previews, and smooth planet viewport shifting.
- Five procedural 3D building models with live animations rendered directly on 3D planet hexagons (`Mine`, `Research Lab`, `House`, `Windmill`, and `Solar Panel`) with instant build, replace, and remove controls in `src/js/buildings.js` and `src/js/planets.js` (models and UI only; gameplay effects not implemented yet).

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
