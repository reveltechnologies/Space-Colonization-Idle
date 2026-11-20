# Changelog

All notable changes to **Space Colonization: Idle** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-alpha.12] - 2026-11-20

### Added
- **Multi-Tier Energy Generation System**:
  - Implemented an energy capacity system paralleling citizen housing, dynamically aggregated per planet from deployed power generation structures:
    - **Solar Line (Surface / Flat terrain)**:
      - **Tier 1 - Solar Panel** (`solar_panel`): 60 SC, gives **+3 Energy**.
      - **Tier 2 - Solar Array** (`solar_array`): 180 SC, 30 Ore, gives **+8 Energy**.
      - **Tier 3 - Solar Tower** (`solar_tower`): 420 SC, 85 Ore, gives **+20 Energy**.
    - **Wind Line (Highlands / Mountainous terrain)**:
      - **Tier 1 - Windmill** (`windmill`): 80 SC, 15 Ore, gives **+6 Energy**.
      - **Tier 2 - Wind Turbine** (`wind_turbine`): 220 SC, 45 Ore, gives **+16 Energy**.
      - **Tier 3 - Wind Farm** (`wind_farm`): 500 SC, 110 Ore, gives **+35 Energy**.
- **Custom Cel-Shaded Energy Building Artwork**:
  - Added dedicated vector illustrations adhering to the game's bold ink outline and specular lighting language:
    - `bld-solar-array.svg`: Multi-panel photovoltaic array on dual reinforced pedestals.
    - `bld-solar-tower.svg`: High-tech central solar collection spire with glowing heliostat receiver.
    - `bld-wind-turbine.svg`: Modern high-output aerodynamic 3-blade composite wind turbine.
    - `bld-wind-farm.svg`: Multi-turbine offshore/mountain ridgeline power generation cluster.
- **Pure Cel-Shaded Energy Lightning Icon & Card Chips**:
  - Designed `icon-energy.svg`: Clean cartoon lightning bolt featuring a `#ffe44d` core, `#ff9814` warm bevel, `#fffbe0` gleam, and `#1b1147` ink perimeter.
  - Added dedicated `.build-energy-chip` indicators on building cards displaying energy outputs with lightning iconography alongside citizen and terrain requirement chips.
- **Procedural 3D Power Generation Models**:
  - Built Goldberg polyhedron tangent-space 3D models and demolition heights:
    - `buildSolarArrayModel`: Multi-faceted solar panel array on angled dual masts.
    - `buildSolarTowerModel`: Tapered central pylon with glowing amber receiver cap.
    - `buildWindTurbineModel`: Sleek cylindrical tower with central hub and tri-blade rotor.
    - `buildWindFarmModel`: Tri-turbine ridge arrangement with varying heights and rotor orientations.
- **Studio-Grade Planet Status Deck**:
  - Redesigned top-right HUD into a unified, mirrored glass-and-purple command deck (`#planet-stats-deck`):
    - **Mirrored Layout**: Embedded protruding planet orb medallion anchored at the top-right corner with the info deck extending leftward.
    - **Custom Planet Medallions**: Distinct cel-shaded icons for each planet type (`planet-rocky.svg`, `planet-oceanic.svg`, `planet-volcanic.svg`) with dynamic theme color accents.
    - **Dual Stat Cells & Fill Gauges**: Integrated live counters and fill meters for Citizens (Teal/Cyan) and Energy (Amber/Gold), complete with responsive change-bounce micro-animations.
    - **Cleaned Header**: Streamlined planet header by removing redundant planet type tags.
- **Custom Planet Renaming System**:
  - Added an in-place planet naming button next to the planet title:
    - Chunky purple pencil icon button (`#btn-rename-planet` with enlarged `icon-edit.svg`).
    - In-place text input (`#planet-hud-name-input`) with a 12-character limit (`maxlength="12"`).
    - Green checkmark confirmation button (`✔`) with auto-save on blur or enter key, and cancel on Escape.
    - Full keyboard input isolation so typing planet names does not trigger camera/hotkey shortcuts.
    - Persisted player custom names in `localStorage` under `sci_planet_names_v1` across page reloads.

### Removed
- **Cannot Build on Fluid Error Message in Build Menu**:
  - Removed the unbuildable warning banner from appearing inside the build drawer when selecting fluid tiles (such as Ocean and Lava), creating a cleaner building menu interface while maintaining contextual card state.

### Changed
- **Isolated Planet Orbit Drag**:
  - Prevented the background starfield from shifting or panning when a player rotates or inspects a planet in 3D (`gestureMode === "orbit"`).
  - Background parallax remains cleanly linked only to full planet carousel navigation swipe transitions (`dScroll`).

### Fixed
- **Real-Time Background Parallax During Planet Swapping**:
  - Fixed an issue where the background starfield remained frozen while dragging between planets and jumped abruptly only after releasing the drag.
  - Replaced the render-local scroll snapshot with persistent cross-frame tracking (`lastRenderScrollPos`), delivering continuous, fluid real-time parallax to `window.SpaceBackground` both during active pointer dragging and throughout inertial snap deceleration.
- **Subpixel Antialiasing Artifact on Numeric Zero**:
  - Eliminated the small dark pixel rendering quirk on the initial `0/0` energy text in Chromium:
    - Replaced multi-directional fractional `text-shadow` offsets (`±1.5px`) on `.planet-stat-value` with crisp 1px integer outlines that respect hollow glyph apertures.
    - Replaced semi-transparent empty text colors with an opaque high-contrast `#dbe4f0` tint to prevent underlying shadows from bleeding through the character body.
    - Added explicit text rendering optimizations (`-webkit-font-smoothing: antialiased`, `text-rendering: geometricPrecision`) and inline element spacing.

## [0.1.0-alpha.11] - 2026-11-19

### Added
- **3-Tier Residential Housing System**:
  - Expanded residential structures into a multi-tier progression line under the Colony category:
    - **Small House** (`small_house`): 75 SC, 10 Ore, gives **+2 Citizens**.
    - **Big House** (`big_house`): 200 SC, 35 Ore, gives **+6 Citizens**.
    - **Villa** (`villa`): 450 SC, 90 Ore, gives **+15 Citizens**.
  - Added full backward compatibility fallback in `getBuilding()` for legacy save states or references referencing `house`.
- **Custom Cel-Shaded Artwork for Housing Tiers**:
  - Created custom vector illustrations matching the studio cartoon aesthetic with `#1b1147` ink lines, specular highlights, and warm palettes:
    - `bld-big-house.svg`: 2-story sunset gabled suburban residence with dual chimneys, dormer roof, and glowing golden windows.
    - `bld-villa.svg`: Luxurious imperial estate featuring amethyst side wings, marble arches, swimming pool terrace, and illuminated glass cupola.
- **Dedicated Citizen Slot Stat Icon & Card Slot Indicator**:
  - Created `icon-citizen.svg`: High-contrast teal spacesuit astronaut bust with cyan reflective visor glint.
  - Added dedicated citizen capacity chips (`.build-citizen-chip`) positioned directly above the cost/action button for housing units.
  - Contextual display logic: Shows citizen slots whenever the tile terrain is valid (whether affordable, unaffordable, or already built). If terrain is incompatible, seamlessly swaps with the red terrain requirement chip (e.g., `Surface`).
- **Procedural 3D Models for Housing Tiers**:
  - Implemented 3D Goldberg polyhedron tangent-space models for all 3 housing tiers:
    - `buildSmallHouseModel`: Classic modular dome habitat.
    - `buildBigHouseModel`: Multi-level dual-volume structure with gabled roofline and observation cupola.
    - `buildVillaModel`: Multi-wing estate complex with central rotunda, pavilion wings, and elevated plaza.
  - Added proper demolition impact heights for demolition FX on all tiers.
- **Fluid Hold-and-Drag Shelf Scrolling**:
  - Enabled intuitive click-and-drag / touch-and-drag panning anywhere across the building carousel list.
  - Implemented inertia glide velocity calculation, rAF-coalesced DOM updates, and 6px drag threshold suppression to prevent accidental building placement or nope-shakes while panning.
- **Top-Right Planet Citizen HUD (Current / Max)**:
  - Added a dedicated planet stat counter at the top-right corner of the player HUD (`.planet-stats-hud`) showing the current planet's citizen population and capacity: `[Citizen Icon] CITIZENS <current>/<max>`.
  - Dynamically calculates the planet's total housing capacity across all placed residential structures (`Small House` +2, `Big House` +6, `Villa` +15).
  - Automatically syncs as the player swipes between planets in the carousel or constructs/demolishes residential buildings, complete with a tactile bump bounce animation on capacity change.
- **Top-Center Floating Error Notice System**:
  - Added floating contextual text notices spawned at the top center of the screen when clicking unbuildable or unaffordable cards.
  - Formatted reasons as clear, natural sentences embedded with building icons, biome badges, and terrain group or currency icons (e.g., *"Cannot build Mine on Highlands — requires Mountainous terrain"*).
  - Clean floating text presentation without bubble backgrounds, styled with bold multi-offset ink outlines and ambient drop shadows.
  - Smooth fade-in entrance with float-up fade-away exit animation (`translateY(-24px)`).
  - Stacks simultaneous clicks vertically below each other with a maximum cap of 5 active notices at once (oldest auto-retires when exceeded).
  - Independent lifecycle: notices do not abruptly disappear when closing the building menu, completing their natural float and fade animation.

### Changed
- **Unbuildable Building Card Visuals**:
  - Enhanced disabled / unbuildable cards with a desaturated, muted greyish "loss of color" appearance (`#c8c5cf` slate backing, `filter: grayscale(0.55)`, dimmed artwork, and cold charcoal action buttons) to instantly communicate invalid terrain to players at a glance.
  - Removed the redundant "✕" red cross badge from the top-left corner of building cards, keeping the stage artwork clean while preserving the red invalid terrain chip.
- **Removed Visible Browser Scrollbars / "Sliders"**:
  - Cleaned up the building drawer interface by completely hiding native browser scrollbars (`scrollbar-width: none;` and `::-webkit-scrollbar { display: none; }`) across both horizontal carousel and compact landscape vertical grid modes.
- **Header Biome Traits Cleanup**:
  - Removed cluttering terrain trait tags from directly under the biome title in the build menu header, keeping only the biome badge and clean title. Critical hazardous unbuildable alerts (e.g. Ocean, Lava) remain prominently pinned.
- **Smooth Drag Performance & Latency Optimizations**:
  - Eliminated synchronous layout reflows (`scrollWidth`, `clientWidth`) during `pointermove` events by caching metrics at drag inception.
  - Replaced real-time SVG drop-shadow filter repaints with lightweight border/box-shadow accents and hardware layer promotion (`will-change: scroll-position; contain: layout paint; transform: translateZ(0);`).
  - Added `pointer-events: none` on cards during active drag to eliminate micro-stutters from hover style calculations.

## [0.1.0-alpha.10] - 2026-11-19

### Added
- **Cartoon Category Icons for Build Menu**:
  - Designed 5 custom cel-shaded vector SVG icons matching the game's bold `#1b1147` ink, specular glints, and cartoon color palette:
    - **All** (`cat-all.svg`): 4-color rounded quad mosaic tile.
    - **Energy** (`cat-power.svg`): Amber lightning bolt with dynamic energy rays.
    - **Extraction** (`cat-mining.svg`): Beveled steel pickaxe over an ore-speckled boulder.
    - **Colony** (`cat-colony.svg`): Astronaut bust in red suit with cyan helmet glint.
    - **Research** (`cat-science.svg`): Bubbling Erlenmeyer lab flask with glowing cyan liquid.
- **Category Filter Tabs with Category Icons**:
  - Integrated the category icons directly into the category filter tabs (`.build-cat-btn`) alongside text labels.
  - Implemented responsive Icon-above-Label stacked layout on mobile portrait screens (`<= 460px`) and compact landscape mode (`<= 739px`) so all 5 category tabs fit cleanly edge-to-edge without overflow or scrollbars.
- **Card Stage Category Corner Badges**:
  - Added a circular category badge socket (`.build-card-cat-badge`) at the **top-right corner** of every building card's photo/preview stage.
  - Emphasized each building's category with category-themed radial background tints, thick borders, and crisp vector category icons.

### Changed
- **Stage Badge Alignment**:
  - Relocated existing status badges (`BUILT` gold ribbon pill and `✕` red lock indicator) to the **top-left corner** (`.build-card-badge`) to ensure zero visual overlap with the new top-right category badges.
  - Isolated terrain-blocked card dimming to the central preview artwork only, ensuring top-left and top-right corner badges remain bright, crisp, and readable on incompatible tiles.

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

### Changed
- **Isolated Planet Orbit Drag**:
  - Prevented the background starfield from shifting or panning when a player rotates or inspects a planet in 3D (`gestureMode === "orbit"`).
  - Background parallax remains cleanly linked only to full planet carousel navigation swipe transitions (`dScroll`).

### Fixed
- Fixed 3D planet hexagons (especially elevated/selected hexagons) disappearing prematurely near the planet's edge in `src/js/planets.js` by testing true polygon-plane orientation and projected area (`planeCenter`, `signedArea2D`), preserving extruded 3D side walls with selected white-light top-rim edges across the horizon, aligning inner white borders coplanar with tile faces, and sorting tiles by un-elevated `rotCenter.z`.

## [0.1.0-alpha.3] - 2026-11-19

### Added
- Three distinct 3D rotating geodesic hexagonal planets (Goldberg polyhedra) in `src/js/planets.js` (small cryo-lunar rocky planet, medium oceanic/emerald planet, and large volcanic/amber-mineral planet) with 3D tile relief, directional/specular lighting, atmospheric halos, and white-light highlighted buildable hexagons.
- Horizontal planet carousel navigation with grow-to-middle scaling, strict single-planet visibility, background star parallax, and 3 transparent bottom indicator dots.
- 3D planet inspection and selection QoL upgrades: free 360° orbit rotation with inertia, pinch/wheel/double-tap zoom (`1.0x`–`2.2x`), smart auto-spin pause during interaction, shortest-arc auto-focus on tile tap with selection pulse ring and forgiving hit-testing, translucent left/right planet arrows, and bottom-right zoom/reset controls.

### Changed
- **Isolated Planet Orbit Drag**:
  - Prevented the background starfield from shifting or panning when a player rotates or inspects a planet in 3D (`gestureMode === "orbit"`).
  - Background parallax remains cleanly linked only to full planet carousel navigation swipe transitions (`dScroll`).

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
