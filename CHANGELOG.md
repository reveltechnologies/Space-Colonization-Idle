# Changelog

All notable changes to **Space Colonization: Idle** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-pre.3] - 2026-11-22

### Changed
- **Planet-Native Biome Restriction for Geo-Terraformer (`src/js/planets.js`)**:
  - Scoped Geo-Terraformer target terrain choices (`PLANET_TERRAFORM_BIOMES` / `getPlanetAllowedTerraformBiomes`) to biomes native to the current planet type (`rocky`: `glacier`, `mountains`, `highlands`, `crater`; `oceanic`: `glacier`, `mountains`, `forest`, `plains`, `ocean`; `volcanic`: `volcano`, `canyon`, `ashlands`, `lava`) in both the modal grid and `executeTerraform` validation.

### Fixed
- **Reliable Single-Click Selection & Purchase in Research Menu (`src/js/research.js`)**:
  - Fixed dropped clicks in the Research Tree modal caused by `tick()` and `addPoints()` calling `renderTree()` and `renderDetailPanel()` on every Research Points integer increment (which destroyed and recreated button DOM nodes between `mousedown` and `mouseup`).
  - Replaced full DOM rebuilds on RP ticks with in-place `syncAffordabilityState()` class (`is-ready`, `is-unaffordable`, `is-short`) and `aria-disabled` updates.
- **Trading Rocket 3D Model, Opaque Flight Rendering & Depth-Sorting (`src/js/buildings.js`, `src/js/planets.js`)**:
  - Split active trade rocket flights in `drawPlanet()` by hemisphere (`worldOrigin.z < 0` rendered behind the opaque planet core sphere; `worldOrigin.z >= 0` inserted into `visibleTiles` and depth-sorted by `depthZ` alongside tiles and buildings) so flying trade rockets are properly occluded by the planet and closer models.
  - Removed `fadeAlpha` and duplicate `transform.alpha` multiplication in `drawTradeRocketInFlight3D()` (and liftoff smoke) so flying trade rockets remain 100% opaque and smoothly scale down via `departShrink` as they leave orbit, with quadratic liftoff pitch and ramped exhaust thrust.
  - Applied uniform X/Y/Z reload scaling (`easeOutCubic`) and separated overlapping fins, side boosters, portholes, gantry arms, and telemetry pylons across `buildTradeRocket1Vessel3D`–`3` and `buildTradeRocket1Model`–`3`.
- **Uncut Tile Biome Icon Badge in Build Menu Header (`src/css/style.css`)**:
  - Removed clipping on `.build-title-stack` so `#build-biome-badge`'s bottom border and drop shadow render cleanly without being cut off by the purple header background.

## [0.2.0-pre.2] - 2026-11-21

### Added
- **New Building Categories (`Decorations` & `Terraforming`)**:
  - Added **Decorations** (`decorations`, `src/assets/ui/cat-decorations.svg`) and **Terraforming** (`terraforming`, `src/assets/ui/cat-terraforming.svg`) tabs to the Build Menu (`src/js/buildings.js`, `src/lang/en_us.js`), with drag-scrollable mobile category tabs (`src/css/style.css`).
- **Cosmetic & Purposeful Planet Decorations (`src/economy/economy.js`, `src/js/buildings.js`, `src/js/planets.js`)**:
  - **Starlight Monument** (`starlight_monument`): Affordable crystal obelisk landmark to personalize and brighten colonies.
  - **Helio Mirror** (`helio_mirror`, max 3 per planet, unlocked via *Helio-Reflector Optics*): Focuses extra starlight to boost Energy output of all Solar buildings on that planet by **+25%** each.
  - **Botanical Park** (`botanical_garden`, max 3 per planet, unlocked via *Civic Botanical Parks*): Speeds up Citizen population growth rate on that planet by **+50%** each when housing capacity allows.
  - **Builders' Plaza** (`builders_plaza`, max 2 per planet, unlocked via *Modular Guild Prefabs*): Reduces construction costs for Colony, Power, and Mining buildings on that planet by **15%** each (safely capped at 50% max), with highlighted discounted prices and confirmation pills.
- **Self-Sustaining Solar Homes (`colony`)**:
  - Added **Solar Cabin** (`solar_cabin`, +3 Citizens, +2 Solar Energy), **Eco Biodome** (`eco_dome`, +8 Citizens, +6 Solar Energy, unlocked via *Self-Sustaining Habitats*), and **Eco Arcology** (`eco_arcology`, +20 Citizens, +15 Solar Energy, unlocked via *Arcology Microgrids*), complete with dual-stat UI chips and in-place upgrade chain (`Solar Cabin → Eco Biodome → Eco Arcology`).
- **Single-Use Tile-Transforming Building (`Geo-Terraformer`)**:
  - Added **Geo-Terraformer** (`geo_terraformer`, unlocked via *Planetary Terraforming*, `terrain: "any"` including Ocean & Lava), with floating **Transform Tile** action button (`#btn-tile-terraform`) and **Transform Tile** terrain picker modal (`#terraform-modal` in `src/index.html`).
  - Firing requires 2 Energy, transforms the tile into the chosen terrain biome with animated elevation & shockwave VFX (`renderTerraformEffect`), permanently marks the Geo-Terraformer as **SPENT** (burnt-out 3D husk, zero ongoing energy draw, must be demolished or replaced), and persists both `tileBiomes` overrides and `used` state across saves (`src/js/planets.js`, `src/js/save.js`).
- **Multi-Track Research Tree & 8 New Research Nodes (`src/js/research.js`)**:
  - Extended `renderTree()` to support multi-track progression rows (`track: 2`) inside existing categories without disrupting existing chains.
  - Added *Helio-Reflector Optics*, *Self-Sustaining Habitats*, and *Arcology Microgrids* (Power Track 2); *Civic Botanical Parks*, *Modular Guild Prefabs*, and *Civic Prosperity* (+30% Citizen Growth, Colony Track 2); *Planetary Terraforming* and *Crust Stabilization* (+20% Bricks & Energy, Planetary Track 2).
- **Watertight 3D Models & Cel-Shaded SVG Icons**:
  - Added 11 custom cel-shaded SVG icons in `src/assets/ui/` and 8 watertight procedural 3D building models (including active & spent states for `buildGeoTerraformerModel`) in `src/js/buildings.js`.

### Fixed
- **Net Brick Income Display Accounting for Trade Rocket Demand (`src/js/planets.js`, `src/js/buildings.js`, `src/lang/en_us.js`, `src/css/style.css`)**:
  - Updated the planet HUD brick income rate text (`#rate-bricks`) and tooltip to reflect the net brick rate (`production - trade rocket consumption`) using `calculatePlanetNetBrickRate(planetIdx)` and `calculatePlanetBrickDemandRate(planetIdx)`.
  - Added support for negative rate display (`formatProductionRate`) with localization keys (`rates.loss_per_second`, `rates.loss_per_minute`, `rates.loss_per_hour`, `rates.loss_per_day`) and distinct `.planet-stat-rate.is-negative` red styling when operational Trade Rockets consume more bricks than active mines produce.
  - Triggered instant HUD brick rate updates when enabling or disabling Trade Rocket operational state from the tile action panel.
- **Fixed-Position Build Menu Header Controls (`src/css/style.css`)**:
  - Locked `.build-drawer-header` to a 2-row CSS Grid (`grid-template-columns: minmax(0, 1fr) auto`) across all viewports so the Demolish button, Close button, and Category tabs stay at fixed coordinates inside the `.build-drawer` background panel regardless of tile biome name length, while `.build-title` stays single-line with ellipsis truncation inside Row 1.
- **Constant-Height Build Menu Cards (`src/css/style.css`, `src/js/buildings.js`, `src/lang/en_us.js`)**:
  - Locked `.build-card-info` and `.build-card-action` to uniform single-row heights across all breakpoints, switched `.build-card-multi-chips` to single-row compact `+N` badges for dual-output buildings (`solar_cabin`, `eco_dome`, `eco_arcology`, `crash_base`), and added `.is-compact-costs` for 3-currency costs so `#build-drawer` never changes height when switching categories or tiles.
- **Back-Rim Selected Building Freeze (`src/js/planets.js`)**:
  - Fixed a `TypeError` in `computeSelectedBuildingScreenBounds` when rotating a selected building (such as `villa`) onto the planet's back rim where `entry.topPts` is `null`, which previously halted `requestAnimationFrame(render)` and left the planet stuck as a dark core circle. Guarded `needsTileActionBounds` with `entry.topVisible && Array.isArray(entry.topPts) && entry.depthZ > -0.25`, added `Array.isArray(pts)` and finite bounds fallbacks in `computeSelectedBuildingScreenBounds`, and wrapped `drawPlanet` (`ctx.save/restore`) and `render` (`requestAnimationFrame`) in `try/finally` blocks.
- **Trade Rocket Flight & Liftoff Dust Occlusion (`src/js/planets.js`)**:
  - Anchored Trade Rocket liftoff smoke puffs (`drawTradeRocketLiftoffSmoke`) directly to the launchpad's front-facing surface mesh in `drawPlanet`, properly hiding ground dust behind buildings and terrain when the pad itself is occluded or facing away.
  - Upgraded flying Trade Rocket vessel rendering (`drawTradeRocketInFlight3D`) to test 3D spatial visibility relative to the planet's spherical horizon (`worldOrigin.z >= 0 || x^2 + y^2 >= 1.00`), ensuring the ascending rocket remains clearly visible from any unblocked perspective even when the bottom launchpad is hidden from view behind the curve.
- **Resource Number Text Bounce Animation Only on Visible String Changes (`src/js/currencies.js`, `src/js/planets.js`)**:
  - Fixed HUD resource counter bouncing (`.currency-value.is-bumped`, `.planet-stat-value.is-bumped`) so text bounce animations trigger strictly when the displayed formatted text actually changes (e.g., from `4.00M` to `4.01M`).
  - Removed unconditional bumps from `GameCurrencies.add()` and `GameCurrencies.spend()`, ensuring income ticks that increment internal floating-point values without changing the rendered text string (such as 4,000,001 to 4,000,005 while displaying `4.00M`) do not cause constant jittering or repeated bouncing.
  - Updated planet HUD stat bars (`Citizens`, `Energy`, `Bricks`) to compare formatted stat strings (`curr/max` or brick count) before triggering the bump animation.

## [0.2.0-pre.1] - 2026-11-21

### Fixed
- **Watertight 3D Rendering & Angle-Independent Visibility Across All Game & Intro Models (`src/js/buildings.js`, `src/js/planets.js`, `src/js/intro.js`)**:
  - Upgraded `createMeshCollector` in `src/js/buildings.js` with analytic outward surface normals (`dirToWorld` supporting non-uniform build/demolish squeeze scaling), near-plane clipping guards, degenerate-edge triangle/sliver fallbacks, closed watertight bottom/top end caps on `addPrism` (including inverted cones and `z1 < z0`) and `addDome`, Cyrus-Beck line sorting, and an exact 2D-convex-clip + perspective ray-depth visibility-graph topological sort in `drawAll`.
  - Eliminated intersecting sub-parts, internal bulkhead seam caps, coplanar z-fighting, and un-culled backfaces across `buildEscapeCraftModel` and procedural 3D models (`buildCrashBaseModel`, `buildRocketExhaust3D`, `buildSpaceRocket1Vessel3D`, `buildSpaceRocket2Vessel3D`, `buildTradeRocket1Vessel3D`–`3`, `buildSolarPanelModel`, `buildSolarArrayModel`, `buildSolarTowerModel`, `buildWindmillModel`, `buildWindTurbineModel`, `buildWindFarmModel`, `buildSmallHouseModel`, `buildBigHouseModel`, `buildVillaModel`, `buildResearchLabModel`, `buildResearchCenterModel`, `buildObservatoryModel`, `buildQuantumArrayModel`, `buildOreResearchStationModel`, and `buildUtopiaSpireModel`).
  - Improved horizon building/trade-rocket visibility and grazing tile/side-wall culling in `src/js/planets.js` with protected perspective projection scaling.
  - Fixed depth-sorted twin orbital rings, integrated the docked Escape Craft into Nova-7's depth-sorted tile pipeline, rendered solid glowing undersides on tumbling hex explosion shards, and replaced instant shard-building pop-out with smooth scaling in `src/js/intro.js`.
  - Rewrote the opening cinematic into a 100% click-driven multi-beat dialogue system (`src/lang/en_us.js`, `src/js/intro.js`, `src/css/style.css`, `src/index.html`) featuring character conversations between Chief Leo, V.E.G.A., `{name}`, and Storyteller in clear, accessible English with zero auto-disappearing text and punctuation-paced typewriter cadence.

## [0.1.0-alpha.22] - 2026-11-21

### Changed
- **Clean Non-Skippable Intro UI, Story Pilot Name Registration & Mandatory Crash Base Guard**:
  - **Cleaned Intro UI (`src/index.html`, `src/css/style.css`, `src/js/intro.js`, `src/lang/en_us.js`)**:
    - Removed the top-left `#intro-telemetry-deck` status panel, all speaker role/timestamp bubble badges (`#intro-speaker-tag` / `Year 2480` / `Emergency` / `Launchpad 01` etc.), and the `#btn-skip-intro` Skip button plus `Escape` key shortcut so the opening story always plays through completely.
  - **In-Story Pilot Name Registration & Persistence (`src/js/intro.js`, `src/js/planets.js`, `src/js/save.js`, `src/lang/en_us.js`)**:
    - Added `#intro-name-row` (`#intro-player-name-input`) at Step 3 of the cinematic where `V.E.G.A. AI` asks the player to register their pilot name to unlock launchpad thrusters (with blank-name validation shake + error hint and `Enter` key submission).
    - Woven the player's chosen name through subsequent dialogue steps (`#intro-speaker-name` and captions), saved `playerName` inside the colony export/local multi-layer save (`window.GameSave`), and personalized returning offline-progress welcome banners (`save.offline_welcome_named`).
  - **Planet 1 `crash_base` Integrity Guard (`src/js/planets.js`, `src/js/save.js`)**:
    - Removed silent fallback placement (`ensureCrashBaseOnPlanet1`). If any loaded save, async storage mirror, or imported save string has Planet 1 without `crash_base`, all progress is automatically reset (`resetProgress()`), saving incomplete pre-crash states is blocked (`canPersistCurrentState`), and the opening cinematic launches cleanly from the beginning.

## [0.1.0-alpha.21] - 2026-11-20

### Changed
- **Opening Story Cinematic 60FPS Performance Overhaul, Native Studio UI & 8-Step Arc**:
  - **60FPS Optimization (`src/js/intro.js`, `src/js/buildings.js`, `src/js/main.js`, `src/js/planets.js`)**:
    - Added `GameIntro.coversBackground()` and `GameIntro.coversStage()` so `#starfield` and `#planet-stage` pause rendering completely while occluded during Steps 1–7, freeing full frame budget for the 3D cinematic.
    - Added ultra-lean low-poly 3D skyline models (`utopia_spire_fast`, `sky_citadel_fast`, `utopia_cluster_fast`) in `src/js/buildings.js` (~12–14 faces each), simplified Nova-7 side fills and single-pass hex borders, reduced twin orbital rings to 18 smooth segments each, cached deep-space nebula canvases across resizes, capped intro DPR at `1.5`, and removed per-frame DOM layout thrashing via cached state & GPU `scaleX()` meter fills.
  - **Pro Game Studio UI (`src/index.html`, `src/css/style.css`, `src/assets/ui/intro-nova7.svg`, `src/assets/ui/intro-ai.svg`)**:
    - Redesigned the intro HUD to match the game's signature chunky cartoon purple/cream aesthetic (`--ink`, `--chunk-shadow`, `--outline`, `#5640c4 -> #3d2899` command decks, `#fff7e8` warm dialogue card): Top-left **Telemetry Deck** (`#intro-telemetry-deck`), top-right **Chapter Pill + Skip**, bottom **Dialogue Command Deck** with speaker portrait (`#intro-portrait-frame`), typewriter dialogue reveal (`~50 chars/sec`), starter salvage reward pills (`+1 Citizen`, `+1 Energy`, `+1/m Bricks` upon touchdown), and chunky action CTA buttons.
  - **Expanded 8-Step Interactive Storyline (`src/lang/en_us.js`, `src/js/intro.js`)**:
    - Expanded the cinematic from 5 to 8 playable beats: *Golden Age of Nova-7* -> *Core Collapse Crisis* -> *Boarding Launchpad 01* -> *Liftoff & 3D Destruction* (with white-gold flash & 3D hex shatter) -> *Fuel Depleted* -> *Adrift in the Void* (zero-G 3D tumble) -> *Planetary Capture* -> *3D Atmospheric Re-Entry, Crash Landing & Colony Start*.

## [0.1.0-alpha.20] - 2026-11-20

### Changed
- **True 3D Interactive Opening Story Cinematic (`window.GameIntro`)**:
  - Upgraded `src/js/intro.js`, `src/js/buildings.js`, `src/js/planets.js`, `src/index.html`, `src/css/style.css`, and `src/lang/en_us.js` into a full 3D interactive 5-scene prologue:
    - **Utopian 3D Homeworld Nova-7**: Replaced the 2D circle planet with a lush 92-tile `freq = 3` Goldberg geodesic hexagon planet populated with advanced 3D colony structures (`utopia_spire`, `sky_citadel`, `villa`, `quantum_array`, `ore_research_station`, `solar_tower`, `wind_farm`, etc.), twin depth-occluded 3D orbital rings with satellites, glowing magma fault fissures, and a full 3D radial shatter explosion where every hex shard and building tumbles outward through 3D space.
    - **True 3D Escape Craft (`GameBuildings.renderEscapeCraft3D`)**: Built a faceted 3D escape craft matching `crash_base` (crimson/white fuselage, glowing cyan canopy & visor, thick 3D swept wings with embedded cobalt solar panels and nav beacons, vertical fin with blinking red distress beacon, 3D ion/sputter exhaust plumes, and layered 3D re-entry bow-shock plasma ribbons), featuring 3-axis zero-gravity tumbling after fuel reaches `0% EMPTY!`.
    - **True 3D Rocky World Approach & Crash Landing**: Scene 4 renders Planet 1's actual `freq = 2` 3D hexagon sphere approaching and smoothly aligning pixel-for-pixel into the live `planet-stage` canvas as the 3D Escape Craft flies along a 3D quadratic Bézier re-entry dive straight onto the target hex tile with a 3D surface-projected impact shockwave.
    - **Interactive Controls**: Replaced timed passive playback with 5 interactive story scenes controlled via `#btn-intro-continue` (*Launch Escape Craft* / *Continue* / *Drift Onward* / *Brace for Impact!* / *Start Rebuilding!*), 5 chapter step dots (`#intro-step-dots`), tap-anywhere & keyboard (`Space`/`Enter`/`ArrowRight`) advancement, subtle 3D pointer parallax tilt, and preserved `Skip` / `Escape` support.
    - **Pre-Intro Lifecycle Save Guard**: Prevented `src/js/save.js` from flushing an incomplete pre-crash state if backgrounded mid-cinematic, and ensured `src/js/planets.js` resumes the intro if an incomplete save is loaded without a `crash_base`.

## [0.1.0-alpha.19] - 2026-11-20

### Added
- **Secret Reset Cheat Sequence (`K-K-K-K-K-O-O-O-O-O`)**:
  - Added secret keypress sequence listener in `src/js/planets.js` (`SECRET_RESET_SEQUENCE` = 5x `K` then 5x `O` within 8 seconds and max 2.5s between keypresses, ignoring input when typing inside text inputs or during the cinematic).
  - Added `#secret-reset-modal` confirmation dialog in `src/index.html` with cartoon sci-fi warning theme in `src/css/style.css` and localized text in `src/lang/en_us.js` asking *"Would you like to reset your progress?"*.
  - When confirmed, wipes all local storage and database save records via `window.GameSave.resetProgress()`, clears in-memory colony and currency state, and immediately launches `startNewGameIntro()` so the player can watch the opening story and experience the crash landing as a new player.
  - Documented the cheat code in `README.md`.

## [0.1.0-alpha.18] - 2026-11-20

### Added
- **Opening Story Cinematic (`window.GameIntro`)**:
  - Created `src/js/intro.js` and `#intro-cinematic` overlay in `src/index.html` and `src/css/style.css` depicting a 4-act animated prologue on a brand-new save: Nova-7 fracturing and exploding as the hero escapes, fuel dropping to `EMPTY!` and engines sputtering out, silent drift into Planet 1's gravity well, and a live 3D re-entry impact onto Planet 1 (with Skip support, localized story captions in `src/lang/en_us.js`, and async save check coordination via `src/js/save.js` so returning players skip straight to their colony).
- **Permanent Plane Crash Base (`crash_base`)**:
  - Added the indestructible, unreplaceable `crash_base` starter shelter in `src/economy/economy.js`, `src/js/buildings.js`, `src/js/planets.js`, and custom icon `src/assets/ui/bld-crash-base.svg`.
  - Features a procedural 3D tilted escape craft wreckage in a scorched impact crater (`buildCrashBaseModel`) with blinking tail distress beacon, solar wing flap, rising smoke, crater impact burst (`renderCrashEffect`), and screen shake.
  - Supplies `+1 Citizen` (the surviving player pioneer, moved cleanly from Planet 1 static base citizens without double-counting), `+1 Energy`, and passive `+1 Construction Brick/min` salvage, protected from demolition or replacement across UI and game logic (and auto-placed cleanly on older pre-intro saves).

## [0.1.0-alpha.17] - 2026-11-20

### Added
- **Multi-Layer Local Save System & Google Play Android Persistence (`window.GameSave`)**:
  - Created `src/js/save.js` and wired it into `src/index.html` with primary + backup envelopes (`SCI_SAVE` v1), deterministic key-sorted FNV-1a checksums, boot-race protection, serialized async write queueing, and portable `SCI1:` save export/import/reset helpers (`exportSaveString`, `importSaveString`, `resetProgress`, `getStatus`).
  - Mirrors saves simultaneously across all available local/mobile backends and restores from the newest valid slot: Capacitor `Filesystem` (`Directory.DATA`) & `Preferences`, Cordova `cordova.file.dataDirectory` & `NativeStorage`, custom Android WebView `@JavascriptInterface` (`AndroidSave`), `IndexedDB` (`sci_save_db` with persistent storage request & timeout guard), and `localStorage` (preserving seamless legacy migration from `sci_planet_names_v1`).
  - Added full Android & PWA lifecycle flushing/resumption (`visibilitychange`, `pagehide`, `pageshow`, `freeze`, `pause`, `resume`, `blur`, `beforeunload`, `deviceready`, Capacitor `App.appStateChange`, and periodic 10s autosave) plus immediate saves on builds, demolishes, research, rocket launches/landings, trade toggles, and planet renames.
- **Offline Idle Progression & Full Module Serialization**:
  - Added `save` configuration parameters in `src/economy/economy.js` and offline summary strings in `src/lang/en_us.js`.
  - Added `exportState`, `importState`, `resetState`, `resetTickClock`, and silent currency additions in `src/js/currencies.js`.
  - Added `addPoints`, `exportState`, `importState`, `resetState`, and purchase save triggers in `src/js/research.js`.
  - Added full colony state serialization (`exportState`, `importState`, `resetState`, `applyOfflineProgress`, monotonic `placedOrder` priority preservation, in-flight rocket continuation/landing, citizen regen phases, Brick mining, Trade Rocket sales, Research, and Ore synthesis catch-up) in `src/js/planets.js`.
  - Documented Google Play `.aab` native storage integration notes in `README.md`.

## [0.1.0-alpha.16] - 2026-11-20

### Changed
- **Trade Rocket Visual Polish**:
  - Removed the rising floating gain text (`+{credits} SC (-{bricks})`) when Trade Rockets complete a trade cycle in `src/js/planets.js`, keeping the screen clean while preserving the full 3D rocket takeoff/landing animations, smoke effects, brick deduction, and Space Credit reward payouts.

## [0.1.0-alpha.15] - 2026-11-20

### Added
- **Building Citizen Requirements & Permanent Pioneer**:
  - Added ongoing `citizensRequired` staffing demands in `src/economy/economy.js` and `src/js/buildings.js` for Mining (`1`–`4`), Automated Trade Rockets (`1`–`4`), and Science facilities (`1`–`8`), leaving Housing, Power, and Space Rockets free of ongoing staffing costs.
  - Added **Available / Max** citizen allocation (`getPlanetCitizenStatus` and `citizenBlockedTiles`) in `src/js/planets.js`, skipping unstaffed buildings in Brick/Research/Ore/Trade production, updating citizen HUD/tooltip counters (`Available / Max` with `Used` and `Pop` details), and rendering overhead blocked Citizen badges alongside Energy and Bricks.
  - Guaranteed that Planet 1 always starts with and retains **1 permanent Citizen** (`baseCitizens: [1, 0, 0]`, `startingCitizens: [1, 0, 0]`) representing the player pioneer so players can immediately staff their first building and never drop below 1 Citizen on Planet 1.
  - Added `.build-card-citizen-req` bottom-left card badges, `.build-citizen-chip.is-req` confirm badges, and initial `1/1` citizen HUD defaults in `src/index.html` and `src/css/style.css`.

## [0.1.0-alpha.14] - 2026-11-20

### Added
- **Ore Research Station & Space Ore Synthesis**:
  - Added the **Ore Research Station** (`ore_research_station`) science facility in `src/economy/economy.js` and `src/js/buildings.js`:
    - Requires the high-tier **Space Ore Synthesis** (`ore_synthesis`, 280 RP on volcanic planet after Neural Archivists) technology in `src/js/research.js` before it can be built.
    - Slowly synthesizes **+5 Space Ore/day** per powered station (consumes 15 Energy and stops generating if unpowered).
    - **Dynamic Exponential Cost Scaling & Conditional Ore Requirement**: First station costs `2,500 Credits + 400 Bricks` (**0 Space Ore required**). Every additional station scales in Credits (`×1.8`), Bricks (`×1.6`), and introduces an escalating **Space Ore cost** (`15 × 1.75^(owned-1)`).
  - Created custom cel-shaded SVG icon `src/assets/ui/bld-ore-research-station.svg`, procedural 3D rotating Space Ore crystal synthesizer model `buildOreResearchStationModel`, demolish impact height, and `.build-ore-chip` UI badges.
  - Updated `src/js/currencies.js` `formatRate` to format slow sub-per-second currency incomes across `/min`, `/hr`, and `/day` intervals (displaying `+5/day` on the Space Ore HUD counter).
  - Connected global building counts (`getBuildingCountGlobal`) and Ore rate syncing (`syncOreProductionRate`) across all planets in `src/js/planets.js`.

## [0.1.0-alpha.13] - 2026-11-20

### Changed
- **Comprehensive Economy Rebalance & Construction Bricks Integration**:
  - Rebalanced src/economy/economy.js so that Construction Bricks form an integral building currency in mid-and-high tier expansion alongside Space Credits:
    - **Starter Mines**: Basic Mine costs 80 Credits (0 Bricks) to ensure immediate bootstrapping of the planetary economy.
    - **Advanced Mines**: Deep Mine costs 180 Credits + 25 Bricks (0.85/s, 3 Energy); Mega Quarry costs 420 Credits + 70 Bricks (2.4/s, 7 Energy).
    - **Automated Trade Rockets**:
      - Trade Rocket I: 120 Credits + 15 Bricks (5 Bricks -> 20 SC every 6s).
      - Trade Rocket II: 260 Credits + 45 Bricks (12 Bricks -> 60 SC every 4s).
      - Trade Rocket III: 450 Credits + 100 Bricks (25 Bricks -> 150 SC every 2.5s).
    - **Colony Housing**:
      - Small House: 60 Credits + 10 Bricks (+2 Citizens).
      - Big House: 160 Credits + 35 Bricks (+6 Citizens).
      - Villa: 360 Credits + 80 Bricks (+15 Citizens).
    - **Power Generation**:
      - Solar Panel: 50 Credits (0 Bricks, +3 Energy).
      - Solar Array: 150 Credits + 25 Bricks (+8 Energy).
      - Solar Tower: 360 Credits + 65 Bricks (+20 Energy).
      - Windmill: 100 Credits + 15 Bricks (+6 Energy).
      - Wind Turbine: 240 Credits + 45 Bricks (+16 Energy).
      - Wind Farm: 460 Credits + 95 Bricks (+35 Energy).
    - **Science & Colonization**:
      - Research Center: 140 Credits + 20 Bricks (+0.3 RP/s).
      - Research Lab: 220 Credits + 40 Bricks (+0.7 RP/s).
      - Observatory: 380 Credits + 75 Bricks (+1.6 RP/s).
      - Quantum Array: 550 Credits + 120 Bricks (+3.8 RP/s).
      - Space Rocket I: 400 Credits + 80 Bricks.
      - Space Rocket II: 550 Credits + 160 Bricks.
- **Planetary Currency Cost & Affordability Support**:
  - Updated src/js/buildings.js to support `bricks` alongside `credits` in `CURRENCY_ICONS`, `canAffordBuilding`, cost items, confirm scenes, and error toasts.
  - Linked planetary brick reserves via `callbacks.getPlanetBricks(planetId)` in src/js/planets.js so construction immediately and safely deducts planetary bricks when placing buildings or upgrading structures.

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
    - In-place text input (`#planet-hud-name-input`) with an expanded character limit of 28 characters (`maxlength="28"`), dynamically sizing over the available space above planet resources.
    - Green checkmark confirmation button (`✔`) with auto-save on blur or enter key, and cancel on Escape.
    - Full keyboard input isolation so typing planet names does not trigger camera/hotkey shortcuts.
    - Persisted player custom names in `localStorage` under `sci_planet_names_v1` across page reloads.
- **Building Description & Construction Confirmation Scene**:
  - Replaced instant placement upon clicking a buildable card with a dedicated building inspection and confirmation scene (`#build-confirm-scene`) inside the build drawer.
  - Displays enlarged cel-shaded building artwork, category & terrain compatibility chips, stat/specialty badges (`+Citizens`, `+Energy`, `Ore Extraction`, `Tech Research`), a specialized description for every structure, replacement notices when overwriting an existing building, and explicit **Confirm Build** (with inline resource cost) and **Cancel** (`Escape` supported) controls.
- **English (`en_us`) Language Pack & Localization System**:
  - Created centralized `en_us` localization resource in `src/lang/en_us.js` (`window.GameLang`) covering all UI text, ARIA labels, planet names, biomes, terrain groups, categories, building names, specialized descriptions, tooltips, and toast templates.
  - Refactored `src/index.html` (via `data-i18n*` attributes) and `src/js/currencies.js`, `src/js/buildings.js`, and `src/js/planets.js` to resolve strings dynamically from `en_us` instead of hardcoding them.
- **Per-Planet Construction Bricks Resource & Multi-Tier Mining**:
  - Added a per-planet **Construction Bricks** resource (`bricksByPlanet`) displayed in the top-right Planet Status Deck (`#planet-stat-bricks`) as a single live counter (`#val-bricks`) and production rate (`#rate-bricks`, without current/max).
  - Implemented smart localized production rate formatting (`formatProductionRate`) scaling automatically across `/s`, `/min`, `/hr`, and `/day`.
  - Expanded the Mining line to 3 tiers with custom cel-shaded SVG icons (`icon-bricks.svg`, `bld-deep-mine.svg`, `bld-mega-quarry.svg`), 3D models (`buildDeepMineModel`, `buildMegaQuarryModel`), and brick production rate chips:
    - **Tier 1 - Mine** (`mine`): 100 SC, **+12/min** Bricks (`0.2/s`).
    - **Tier 2 - Deep Mine** (`deep_mine`): 230 SC, 40 Ore, **+48/min** Bricks (`0.8/s`).
    - **Tier 3 - Mega Quarry** (`mega_quarry`): 460 SC, 90 Ore, **+2.5/s** Bricks.
- **Research Points, Research Center & Planet-Specific Research Tree**:
  - Added global **Research Points (`RP`)** generation system (`src/js/research.js`, `window.GameResearch`) accumulating continuously every frame from placed Science structures across all planets.
  - Added the once-per-planet **Research Center** (`research_center`, limit 1 per planet, **+15/min RP**) with custom cel-shaded SVG (`bld-research-center.svg`) and animated 3D orbital dome model (`buildResearchCenterModel`).
  - Added a world-projected floating **Research Tree** action button (`#btn-tile-research-tree`) anchored above the selected **Research Center** tile on the 3D planet.
  - Built an interactive **Research Tree Modal** (`#research-modal`) displaying live `RP` balance, generation rate, terminal planet badge, and a zero-scroll **6-category tabbed horizontal progression track** (**Mining**, **Power**, **Colony**, **Science**, **Planetary**, **Aerospace**) with an enlarged studio command-deck layout (`980px` max width), full un-truncated category labels (no `...` ellipsis, wrapping to `3×2` grid tabs below `860px`), bold progression nodes (`76px`) and connectors, click-to-inspect detail panel (`#research-detail-panel`), and planet-specific unlocks (Rocky, Oceanic, Volcanic).
  - Added Tier 1 & Tier 2 **Space Rocket** buildings (`space_rocket_1` — *Space Rocket I*, `space_rocket_2` — *Space Rocket II*) with cel-shaded SVG art (`bld-space-rocket-1.svg`, `bld-space-rocket-2.svg`), 3D models (`buildSpaceRocket1Model`, `buildSpaceRocket2Model`), high-tier **Aerospace** research locks (*Orbital Rocketry* & *Heavy Starship Design*), and concise `"To Be Researched"` build card badges.
- **Automated Trade Rockets (`trade_rocket_1`–`3`)**:
  - Added a 3-variant **Trade Rocket** building line under the Mining category (`Trade Rocket I` → `Trade Rocket II` → `Trade Rocket III`) with custom SVG art (`bld-trade-rocket-1.svg`, `bld-trade-rocket-2.svg`, `bld-trade-rocket-3.svg`) and procedural 3D animated launchpad models.
  - Trade Rockets periodically launch commercial cargo shuttles into space (at faster intervals and higher Brick-to-Space-Credit exchange rates per tier), converting planetary Construction Bricks into global **Space Credits (`SC`)** with live `/s` HUD rate display, ascending 3D polygonal rocket + floating credit gain animations (`renderRocketVessel3D`), manual **Start / Stop Trading** & **Upgrade** tile controls (`#tile-trade-actions`), and automatic shutoff when the planet runs out of Construction Bricks.
- **3D Polygonal Rocket Flights & Surround Tile Controls**:
  - Replaced flat 2D canvas rocket sprites with true 3D polygonal rocket vessels (`renderRocketVessel3D`) featuring volumetric 3D thruster exhaust cones, 3D orbital pitch/roll during flight, and pad departure/reload staging for Trade Rockets.
  - Positioned floating building action buttons (`#btn-tile-research-tree`, `#tile-rocket-actions`, `#tile-trade-actions`) strictly around each selected building's 3D screen-space bounding box (`computeSelectedBuildingScreenBounds`) so the 3D model itself remains unobstructed.
- **Universal In-Place Building Upgrade Option**:
  - Extended the floating **Upgrade → {Next Building}** action button to every multi-tier building line (**Mine → Deep Mine → Mega Quarry**, **Trade Rocket I → II → III**, **Research Lab → Observatory → Quantum Array**, **Small House → Big House → Villa**, **Solar Panel → Solar Array → Solar Tower**, **Windmill → Wind Turbine → Wind Farm**, **Space Rocket I → Space Rocket II**), automatically skipping terrain-incompatible tiers when applicable (e.g., **Research Lab → Quantum Array** on non-mountainous tiles).
  - Strictly enforces the next building's Space Credits & Space Ore cost, research unlocks, and terrain compatibility before opening the confirmation card (displaying missing-resource / research toasts and button shake feedback when blocked) and preserves loaded Space Rocket cargo across rocket upgrades.
- **Centralized Economy Configuration (`src/economy/economy.js`)**:
  - Created `src/economy/economy.js` (`window.GameEconomy`) mirroring `src/lang/`, centralizing starting currency balances, planetary regen/initial counts, all building costs/generation rates/capacities/trade/rocket parameters, and research node costs and multiplier bonuses into a single editable file wired into `currencies.js`, `buildings.js`, `research.js`, and `planets.js`.
- **Clickable HUD Resource Info Tooltips**:
  - Made **Space Credits**, **Space Ore**, **Citizens**, **Energy**, and **Construction Bricks** interactive HUD buttons that open a cel-shaded info tooltip (`#hud-resource-tooltip`) anchored below the clicked resource with live balances/rates, scope tag (`Global Currency` / `Planet Resource`), and localized descriptions.
- **Building Energy Requirements, On-Building Blocked Status & Persistent Trade Rockets**:
  - Added per-building `energyRequired` values in `src/economy/economy.js` and `src/js/buildings.js` for Mines, Trade Rockets, and Science structures, displaying `-N Energy` badges on build cards and the confirm scene and showing remaining `available / max` capacity on the Energy HUD.
  - Structures lacking sufficient planet energy pause production (Bricks, Research Points, and Trade Rocket launches) and display a floating cel-shaded blocked Energy icon (`⊘`) directly above their 3D model on the planet canvas.
  - Enabled Trade Rockets now stay in their active trading state when a planet runs out of Construction Bricks—displaying a floating blocked Bricks icon (`⊘`) above the pad and automatically resuming launches once Bricks and Energy become available again.
  - Expanded the Science category with additional RP-generating structures (`icon-research.svg`, `bld-observatory.svg`, `bld-quantum-array.svg`):
    - **Research Center** (`research_center`): 150 SC, 20 Ore, max 1 per planet, **+15/min RP**.
    - **Research Lab** (`research_lab`): 200 SC, 35 Ore, **+30/min RP**.
    - **Observatory** (`observatory`, Mountainous): 340 SC, 60 Ore, **+1.2/s RP**.
    - **Quantum Array** (`quantum_array`, unlocked via *Quantum Computing*): 450 SC, 85 Ore, **+3.5/s RP**.
- **Locked Planets & Interplanetary Space Rocket Missions**:
  - **Oceanic Planet** (`planet_2`, **Requires Tier 1 Rocket**) and **Volcanic Planet** (`planet_3`, **Requires Tier 2 Rocket**) start blackened in shadow with a 3D lock overlay (`icon-lock.svg`) preventing renaming or building until unlocked.
  - Added floating **Cargo** and **LAUNCH!** buttons anchored above selected built Space Rockets on planets with a world ahead, plus a **Rocket Payload** modal (`#rocket-cargo-modal`) to edit **Construction Bricks** (deducted/refunded immediately against planetary stock) alongside each rocket tier's fixed **Citizens** crew (**4** on Tier 1 up to **200 Bricks**; **10** on Tier 2 up to **600 Bricks**).
  - Launching deducts current Citizens, sends an animated cel-shaded rocket along a 3-stage trajectory (`liftoff` → `cruise` → `landing`) with an optional bottom-center **Follow Rocket** camera button (`#btn-follow-rocket`), shatters the target planet's darkness and padlock on first unlock, delivers loaded Bricks, and stations the landed rocket as Citizen housing until demolished.
  - Updated *Cryo Propellant* & *Orbital Rocketry* (Rocky) and *Heavy Starship Design* (Oceanic) in `src/js/research.js` for softlock-free interplanetary rocket progression.

### Removed
- **Cannot Build on Fluid Error Message in Build Menu**:
  - Removed the unbuildable warning banner from appearing inside the build drawer when selecting fluid tiles (such as Ocean and Lava), creating a cleaner building menu interface while maintaining contextual card state.

### Changed
- **Use Player-Set Planet Names Across UI & Research**:
  - Removed all `"Rocky"`, `"Oceanic"`, and `"Volcanic"` planet labels and type tags across `src/lang/en_us.js`, `src/js/research.js`, and `src/js/planets.js`, displaying each planet's player-chosen name (falling back to default `"Planet 1"`, `"Planet 2"`, `"Planet 3"`).
- **Uniform Grey Styling for Research-Locked Building Cards**:
  - Updated `.build-card.is-research-locked` in `src/css/style.css` to share the exact greyed-out visual styling, stage/preview desaturation, action button tones, and press behavior of `.build-card.is-terrain-blocked`.
- **Isolated Planet Orbit Drag**:
  - Prevented the background starfield from shifting or panning when a player rotates or inspects a planet in 3D (`gestureMode === "orbit"`).
  - Background parallax remains cleanly linked only to full planet carousel navigation swipe transitions (`dScroll`).

### Fixed
- **Close Building UI When Changing Planets**:
  - Added `clearSelectionAndCloseBuildMenu()` and routed carousel swipe/drag planet switches (`finishPointerGesture`) through `goToPlanet(...)` as well as `updateIndicatorDots()`, ensuring `#build-drawer`, `#build-confirm-scene`, and selected hex highlights close cleanly on every planet switch method (swipe/drag, prev/next buttons, planet dots, mouse wheel, and arrow keys).
- **Top-Center Toast Leading Icon Alignment**:
  - Fixed an issue where wrapped floating error notices caused the leading icon (`game-toast-icon`, such as the energy bolt or upgrade icon) to float far to the left of the centered text. Switched `.game-toast` to `inline-block` (`width: fit-content`) with the leading icon nested inline inside the message span.
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
