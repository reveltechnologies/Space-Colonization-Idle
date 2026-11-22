/**
 * Space Colonization: Idle
 * English (United States) Language Pack (en_us) & Localization Helper
 */

(function () {
  "use strict";

  const EN_US = {
    app: {
      title: "Space Colonization: Idle",
      description: "Space Colonization: Idle — Mobile sci-fi incremental colony builder."
    },
    aria: {
      planet_carousel: "Planet Carousel",
      colony_currencies: "Colony Currencies",
      current_planet_stats: "Current Planet Statistics",
      prev_planet: "Previous Planet",
      next_planet: "Next Planet",
      planet_selection: "Planet Selection",
      view_controls: "View Controls",
      zoom_out: "Zoom Out",
      zoom_in: "Zoom In",
      building_menu: "Building Menu",
      building_categories: "Building Categories",
      demolish_building: "Demolish Building",
      close_building_menu: "Close Building Menu",
      scroll_buildings_left: "Scroll Buildings Left",
      available_buildings: "Available Buildings",
      scroll_buildings_right: "Scroll Buildings Right",
      confirm_building_construction: "Confirm Building Construction",
      cancel_construction: "Cancel Construction",
      confirm_construction: "Confirm Construction",
      open_research_tree: "Open Research Tree",
      research_tree_modal: "Research Tree",
      close_research_tree: "Close Research Tree",
      rocket_launch: "Launch Rocket",
      rocket_cargo: "Load Rocket Cargo",
      rocket_cargo_modal: "Rocket Cargo",
      close_rocket_cargo: "Close Rocket Cargo",
      follow_rocket: "Follow Rocket",
      rocket_bricks_slider: "Construction Bricks to Load",
      trade_toggle: "Toggle Trade Rocket",
      trade_upgrade: "Upgrade Trade Rocket",
      intro_cinematic: "Opening Story",
      player_name_input: "Pioneer Name",
      continue_intro: "Continue Story",
      secret_reset_modal: "Reset Progress Confirmation",
      secret_reset_confirm: "Confirm Reset",
      secret_reset_cancel: "Cancel Reset",
      terraform_tile: "Transform Tile",
      terraform_modal: "Transform Tile Terrain",
      close_terraform_modal: "Close Transform Tile Modal"
    },
    currencies: {
      credits: "Credits",
      ore: "Ore",
      bricks: "Bricks",
      space_ore: "Space Ore",
      per_second: "/s",
      suffixes: ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
    },
    planet: {
      rename: "Rename Planet",
      save_name: "Save Planet Name",
      name_label: "Planet Name",
      name_placeholder: "Planet name",
      citizens_tooltip: "Citizens on this planet (Available / Max Capacity)",
      energy_tooltip: "Energy on this planet (Current / Max Capacity)",
      bricks_tooltip: "Construction Bricks on this planet (Obtained by Mines)",
      zoom_format: "{zoom}×",
      locked_title: "Locked Planet",
      requires_rocket_tier: "Requires Tier {tier} Rocket"
    },
    rates: {
      per_second: "+{rate}/s",
      per_minute: "+{rate}/min",
      per_hour: "+{rate}/hr",
      per_day: "+{rate}/day",
      loss_per_second: "-{rate}/s",
      loss_per_minute: "-{rate}/min",
      loss_per_hour: "-{rate}/hr",
      loss_per_day: "-{rate}/day"
    },
    planets: {
      planet_1: {
        default_name: "Planet 1"
      },
      planet_2: {
        default_name: "Planet 2"
      },
      planet_3: {
        default_name: "Planet 3"
      }
    },
    categories: {
      all: "All",
      power: "Power",
      mining: "Mining",
      colony: "Colony",
      science: "Science",
      decorations: "Decorations",
      terraforming: "Terraforming"
    },
    terrains: {
      solid: "Any Solid",
      surface: "Surface",
      mountainous: "Mountainous",
      any: "Any Tile"
    },
    biomes: {
      mountains: { name: "Mountains" },
      glacier: { name: "Glacier" },
      highlands: { name: "Highlands" },
      crater: { name: "Crater" },
      forest: { name: "Forest" },
      plains: { name: "Plains" },
      ocean: { name: "Ocean", unbuildable_hint: "Cannot build on deep water — select a solid land tile" },
      lava: { name: "Lava", unbuildable_hint: "Cannot build on molten lava — select a solid land tile" },
      volcano: { name: "Volcano" },
      canyon: { name: "Canyon" },
      ashlands: { name: "Ashlands" }
    },
    buildings: {
      brick_press: {
        name: "Brick Press",
        description: "Compact manual stone-molding press. Click its tile action button to stamp Construction Bricks with a short cooldown between presses."
      },
      hydraulic_press: {
        name: "Hydraulic Press",
        description: "Heavy twin-piston manual forge press that stamps larger batches of Construction Bricks per click with a faster cycle."
      },
      quantum_kiln: {
        name: "Plasma Kiln",
        description: "High-output plasma-sintering press that rapidly fuses massive batches of Construction Bricks on every click for late-game manual production."
      },
      hand_crank: {
        name: "Crank Dynamo",
        description: "Manual coil-wound dynamo. Click to wind +3m of emergency Energy (+2 Energy), stacking up to 1 hour max."
      },
      flywheel_dynamo: {
        name: "Kinetic Flywheel",
        description: "Upgraded vacuum-sealed flywheel generator. Click to spin up +5m of +8 Energy, stacking up to 1 hour max."
      },
      capacitor_core: {
        name: "Overdrive Core",
        description: "Late-game manual hyper-capacitor spire. Click to inject +7.5m of +25 Energy per click, stacking up to 1 hour max."
      },
      crash_base: {
        name: "Crash Base",
        specialty: "Permanent Pioneer Shelter",
        description: "The wreckage of your escape craft, repurposed into an emergency shelter. Supplies 1 permanent Citizen (you), 1 emergency Energy, and slowly salvages +1 Construction Brick/min. Cannot be destroyed or replaced."
      },
      mine: {
        name: "Mine",
        description: "Automated shaft drill anchored into rocky ridges that extracts dense stone and presses it into sturdy Construction Bricks."
      },
      deep_mine: {
        name: "Deep Mine",
        description: "Reinforced deep-crust boring facility with heavy hydraulic crushers that rapidly refine bedrock into high-grade Construction Bricks."
      },
      mega_quarry: {
        name: "Mega Quarry",
        description: "Colossal industrial strip-quarry and thermal sintering complex engineered to mass-produce Construction Bricks around the clock."
      },
      research_center: {
        name: "Research Center",
        description: "Planetary science headquarters (limit 1 per planet). Generates Research Points and provides terminal access to the Research Tree from this world."
      },
      research_lab: {
        name: "Research Lab",
        description: "Pressurized orbital laboratory equipped with automated analyzers that steadily generate Research Points for your colony."
      },
      observatory: {
        name: "Observatory",
        description: "High-altitude deep-space telescope mounted on rugged peaks to scan cosmic phenomena and produce high Research Point yields."
      },
      quantum_array: {
        name: "Quantum Array",
        description: "Entangled subatomic processor lattice that solves hyper-dimensional equations to generate massive Research Point output."
      },
      ore_research_station: {
        name: "Ore Research Station",
        description: "Ultra-expensive crystalline synthesis observatory that slowly condenses rare Space Ore (+5/day). Each station increases construction cost; your first station requires no Ore, while additional stations require Space Ore."
      },
      small_house: {
        name: "Small House",
        description: "Compact pressurized habitat dome with essential life-support quarters, providing safe frontier housing for early colony pioneers."
      },
      big_house: {
        name: "Big House",
        description: "Two-story reinforced residential lodge featuring expanded living decks, atmospheric recycling, and observation dormers for a growing workforce."
      },
      villa: {
        name: "Villa",
        description: "Luxurious grand colony estate with amethyst pavilion wings, climate-controlled biodome terraces, and high-capacity executive suites."
      },
      solar_cabin: {
        name: "Solar Cabin",
        specialty: "Self-Sustaining Home",
        description: "Cozy off-grid frontier cabin topped with photovoltaic roof panels. Houses 3 Citizens while generating +2 solar Energy for your colony."
      },
      eco_dome: {
        name: "Eco Biodome",
        specialty: "Self-Sustaining Biodome",
        description: "Pressurized glass living dome ringed by lush planters and flanking solar wings. Houses 8 Citizens and supplies +6 clean solar Energy."
      },
      eco_arcology: {
        name: "Eco Arcology",
        specialty: "Self-Sustaining Spire",
        description: "Vertical green-terrace tower fitted with towering cobalt solar sails. Supports 20 Citizens and generates +15 solar Energy on its own."
      },
      starlight_monument: {
        name: "Starlight Monument",
        specialty: "Colony Landmark",
        description: "A radiant crystal obelisk honoring your pioneers' journey from Nova-7. Purely decorative landmark to personalize and brighten your world."
      },
      helio_mirror: {
        name: "Helio Mirror",
        specialty: "+25% Solar Energy",
        description: "Tilted orbital-grade reflector dish that focuses extra starlight onto this planet, boosting Energy output of all Solar buildings here by +25% (max 3 per planet)."
      },
      botanical_garden: {
        name: "Botanical Park",
        specialty: "+50% Citizen Growth",
        description: "Lush green park with a glowing fountain and blossom trees that makes life on this planet thrive, speeding up Citizen growth by +50% when housing space allows (max 3 per planet)."
      },
      builders_plaza: {
        name: "Builders' Plaza",
        specialty: "-15% Build Cost",
        description: "Civic architecture plaza with holographic blueprint arches that streamlines local construction, reducing Colony, Power, and Mining building costs on this planet by 15% (max 2 per planet)."
      },
      geo_terraformer: {
        name: "Geo-Terraformer",
        specialty: "1-Use Tile Transformer",
        description: "Heavy seismic emitter rig that reshapes any tile (even Ocean or Lava) into a chosen terrain biome. Requires 2 Energy to fire, then burns out permanently and must be demolished or replaced."
      },
      solar_panel: {
        name: "Solar Panel",
        description: "High-efficiency photovoltaic collector cells that track local starlight to supply clean baseline power to nearby colony systems."
      },
      solar_array: {
        name: "Solar Array",
        description: "Dual-mast synchronized solar collector matrix with angled reflector banks for sustained mid-tier power generation."
      },
      solar_tower: {
        name: "Solar Tower",
        description: "Towering thermal heliostat spire that concentrates orbital radiation into a superheated receiver core for massive grid output."
      },
      windmill: {
        name: "Windmill",
        description: "Rugged aero-rotor generator engineered to harvest surface atmospheric currents and steady planetary trade winds."
      },
      wind_turbine: {
        name: "Wind Turbine",
        description: "High-altitude composite tri-blade turbine built with low-friction magnetic bearings to capture fast planetary wind streams."
      },
      wind_farm: {
        name: "Wind Farm",
        description: "Interlinked multi-turbine wind array synchronized across open plains to deliver industrial-scale kinetic power to the colony grid."
      },
      space_rocket_1: {
        name: "Space Rocket I",
        specialty: "Tier I Orbital Rocket",
        description: "Single-stage orbital launch vehicle carrying a fixed crew of Citizens and editable Construction Bricks to colonize the next world."
      },
      space_rocket_2: {
        name: "Space Rocket II",
        specialty: "Tier II Heavy Starship",
        description: "Heavy multi-stage deep-space starship fitted with twin strap-on boosters, carrying a larger Citizen crew and heavy Construction Brick payload."
      },
      trade_rocket_1: {
        name: "Trade Rocket I",
        specialty: "Tier I Brick Trader",
        description: "Automated commercial launchpad that regularly launches cargo shuttles to space, selling 5 Construction Bricks for 20 Space Credits every 6 seconds. Auto-stops if the planet runs out of Bricks."
      },
      trade_rocket_2: {
        name: "Trade Rocket II",
        specialty: "Tier II Express Trader",
        description: "Upgraded twin-booster freighter terminal with faster turnaround and higher trade rates, selling 12 Construction Bricks for 60 Space Credits every 4 seconds."
      },
      trade_rocket_3: {
        name: "Trade Rocket III",
        specialty: "Tier III Heavy Starliner",
        description: "High-velocity orbital trade port that rapidly dispatches heavy cargo starliners, selling 25 Construction Bricks for 150 Space Credits every 2.5 seconds."
      }
    },
    trade: {
      btn_stop: "Stop Trading",
      btn_enable: "Start Trading",
      btn_upgrade: "Upgrade → {name}",
      rate_chip: "{bricks} Bricks → +{credits} SC",
      speed_chip: "Every {sec}s (+{rate}/s)",
      floating_gain: "+{credits} SC (-{bricks})"
    },
    manual: {
      brick_chip: "+{amount}/click",
      brick_cooldown_chip: "{sec}s Cooldown",
      energy_chip: "+{energy} Energy ({mins}m)",
      energy_stack_chip: "+{mins}m/click (Max 1h)",
      btn_press: "Press +{amount}",
      btn_cooldown: "Wait {sec}s",
      btn_charge: "Charge +{energy}⚡",
      btn_charge_active: "+{energy}⚡ • {time}",
      btn_charge_max: "MAX 60:00 (+{energy}⚡)",
      popup_brick: "+{amount} Bricks",
      popup_energy: "+{mins}m ⚡",
      popup_energy_max: "MAX 1h ⚡"
    },
    rocket: {
      launch_btn: "LAUNCH!",
      cargo_btn: "Cargo",
      cargo_btn_loaded: "Cargo {loaded}/{max}",
      cargo_modal_title: "Rocket Payload",
      target_planet: "Destination: {planet}",
      crew_label: "Citizens",
      crew_hint: "Deducted from current citizens on launch",
      crew_unit: "{count} Citizens",
      crew_available: "Available: {curr}/{max}",
      bricks_label: "Construction Bricks",
      bricks_hint: "Deducted immediately as you fill the rocket",
      bricks_stock: "Planet Stock: {stock}",
      bricks_loaded_fmt: "{loaded} / {max}",
      btn_empty: "Empty",
      btn_minus_10: "-10",
      btn_plus_10: "+10",
      btn_fill_max: "Max",
      btn_done: "Done",
      follow_btn: "Follow Rocket",
      following_btn: "Following Rocket",
      tier_chip: "Tier {tier} Rocket",
      crew_chip: "{count} Citizens",
      bricks_cap_chip: "Up to {max} Bricks"
    },
    build: {
      demolish: "Demolish",
      cancel: "Cancel",
      confirm_build: "Confirm Build",
      built_badge: "BUILT",
      landed_badge: "LANDED",
      permanent_badge: "PERMANENT",
      max_per_planet: "Max {limit} / Planet",
      owned_scaling_chip: "Owned: {count} (Scales)",
      requires_research_chip: "To Be Researched",
      citizen_gain_one: "+{count} Citizen",
      citizen_gain_many: "+{count} Citizens",
      energy_gain: "+{count} Energy",
      stat_plus_short: "+{count}",
      energy_req: "-{count} Energy",
      energy_req_short: "-{count}",
      citizen_req_one: "-{count} Citizen",
      citizen_req_many: "-{count} Citizens",
      citizen_req_short: "-{count}",
      replace_notice: "Replaces existing {building} on this tile.",
      replace_fallback_building: "building",
      spent_badge: "SPENT",
      solar_boost_chip: "+{pct}% Solar Energy",
      growth_boost_chip: "+{pct}% Citizen Growth",
      cost_discount_chip: "-{pct}% Build Cost",
      discount_targets_chip: "Colony, Power & Mining",
      terraform_single_use_chip: "1-Use Tile Transform",
      terraform_spent_warning: "Single-use: burns out after use",
      discount_active_pill: "-{pct}% Plaza Discount"
    },
    terraform: {
      action_btn: "Transform Tile",
      spent_btn: "Spent — Demolish or Replace",
      modal_title: "Transform Tile",
      current_biome: "Current: {biome}",
      single_use_warning: "Single-use device: after transforming this tile, the Geo-Terraformer becomes unusable and must be demolished or replaced.",
      choose_biome_label: "Select Target Terrain",
      current_tag: "Current",
      btn_cancel: "Cancel",
      btn_confirm: "Transform Tile"
    },
    toast: {
      cannot_build_unbuildable: "Cannot build {building} on {biome} terrain.",
      cannot_build_terrain: "Cannot build {building} on {biome} — requires {terrain} terrain.",
      cannot_afford: "Cannot afford {building} — need {missing} more.",
      missing_joiner: " and ",
      planet_limit_reached: "Cannot build {building} — limit of {limit} per planet reached.",
      research_required: "Unlock {building} by researching {research} in the Research Tree.",
      research_need_rp: "Need {missing} more Research Points to research {research}.",
      research_wrong_planet: "{research} must be researched from a Research Center on {planet}.",
      research_need_prereq: "Research {prereq} first to unlock {research}.",
      planet_locked_requires_rocket: "{planet} is locked — launch a {tier} from {prevPlanet} to unlock it.",
      rocket_tier_too_low: "{planet} requires a Tier {tier} Rocket or higher to launch.",
      rocket_need_citizens: "Need {needed} current Citizens on {planet} to launch {rocket} (currently {curr}).",
      rocket_no_free_tile: "No free surface tile remaining on {planet} for rocket landing.",
      rocket_no_destination: "No further planet ahead to launch toward.",
      rocket_launched: "{rocket} launched toward {planet} with {citizens} Citizens and {bricks} Bricks!",
      rocket_landed_unlocked: "{planet} unlocked! Landed with {citizens} Citizens and {bricks} Bricks.",
      rocket_landed_delivered: "{rocket} landed on {planet} with {citizens} Citizens and {bricks} Bricks!",
      trade_started: "{building} started selling Construction Bricks on {planet}.",
      trade_stopped: "{building} stopped trading on {planet}.",
      trade_auto_stopped: "{building} on {planet} auto-stopped — no Construction Bricks left!",
      trade_no_bricks_to_start: "Cannot start {building} — no Construction Bricks left on {planet}!",
      cannot_demolish_protected: "{building} is your permanent shelter and cannot be destroyed.",
      cannot_replace_protected: "{building} is permanent and cannot be replaced.",
      cannot_replace_landed: "{building} must be demolished before building on this tile.",
      terraform_need_power: "{building} needs {energy} Energy before it can transform this tile.",
      terraform_already_used: "{building} has already been used — demolish or replace it with another building.",
      terraform_same_biome: "This tile is already {biome}. Pick a different terrain type.",
      terraform_success: "Tile transformed into {biome}! {building} is now spent — demolish or replace it.",
      manual_energy_max: "{building} is already at maximum charge (1 hour)!"
    },
    research: {
      title: "Research Tree",
      open_tree: "Research Tree",
      rp_unit: "RP",
      terminal_from: "Terminal: {planet}",
      total_generation: "Generation",
      close_details: "Close Details",
      categories: {
        mining: "Mining",
        power: "Power",
        colony: "Colony",
        science: "Science",
        planetary: "Planetary",
        aerospace: "Aerospace"
      },
      any_planet: "Any Planet",
      requires_planet: "Requires {planet}",
      requires_prereq: "Requires: {prereq}",
      btn_research: "Research",
      btn_researched: "Researched",
      btn_locked: "Locked",
      btn_wrong_planet: "Visit {planet}",
      nodes: {
        reinforced_masonry: {
          name: "Reinforced Masonry",
          effect: "+25% Mine Bricks",
          description: "Upgrades quarry compression dies to boost Construction Brick output from all Mines across every planet."
        },
        cryo_drilling: {
          name: "Cryo-Core Drilling",
          effect: "+35% Mine Bricks",
          description: "Analyzes frozen bedrock fractures on {planet_1} to further accelerate Brick excavation."
        },
        thermal_sintering: {
          name: "Magma Sintering",
          effect: "+50% Deep & Mega Bricks",
          description: "Harnesses volcanic heat profiles to super-bake Construction Bricks in Deep Mines and Mega Quarries."
        },
        mantle_excavation: {
          name: "Mantle Excavation",
          effect: "+50% Mine Bricks",
          description: "Automated mantle-piercing rigs extracting ultra-dense subterranean aggregate for rapid Brick production."
        },
        solar_cells: {
          name: "Photovoltaic Cells",
          effect: "+20% Energy Capacity",
          description: "Refines solar crystal coatings to squeeze higher grid output from all power generation structures."
        },
        hydro_grid: {
          name: "Hydro-Cooling Power Grid",
          effect: "+25% Energy Capacity",
          description: "Applies fluid-cooled superconducting conduits discovered on {planet_2} to boost all Power buildings."
        },
        superconductors: {
          name: "Thermal Superconductors",
          effect: "+35% Energy Capacity",
          description: "Forges zero-loss thermal alloys from {planet_3} core ores to supercharge planetary energy grids."
        },
        habitat_insulation: {
          name: "Habitat Insulation",
          effect: "+20% Citizen Capacity",
          description: "Multi-layer thermal shielding for residential domes, increasing Citizen capacity across all planets."
        },
        biodome_recycling: {
          name: "Biodome Recycling",
          effect: "+25% Citizen Capacity",
          description: "Closed-loop hydro-filtration systems tested on {planet_2} supporting denser, self-sustaining residential quarters."
        },
        arcology_habitats: {
          name: "Arcology Habitats",
          effect: "+35% Citizen Capacity",
          description: "Engineered pressurized vertical housing blueprints increasing Citizen capacity for all residential structures."
        },
        orbital_telemetry: {
          name: "Orbital Telemetry",
          effect: "+25% Research Points",
          description: "Links planetary research uplinks into a shared network, increasing Research Point generation everywhere."
        },
        stellar_optics: {
          name: "Deep-Space Optics",
          effect: "+35% Research Points",
          description: "High-precision glass lenses calibrated on {planet_3} to boost Research Point generation."
        },
        quantum_computing: {
          name: "Quantum Computing",
          effect: "Unlocks Quantum Array",
          description: "Decodes wave-function resonance on {planet_2}, unlocking the high-output Quantum Array in the Build Menu."
        },
        neural_archivists: {
          name: "Neural Archivists",
          effect: "+50% Research Points",
          description: "Synchronizes colony AI synthesis clusters on {planet_1} to accelerate scientific discovery."
        },
        ore_synthesis: {
          name: "Space Ore Synthesis",
          effect: "Unlocks Ore Research Station",
          description: "Masters high-energy crystalline synthesis from {planet_3} core isotopes, unlocking the Ore Research Station in the Build Menu."
        },
        surface_surveying: {
          name: "Surface Surveying",
          effect: "+15% Bricks & Research",
          description: "Standardized orbital terrain mapping improves both mining yields and field research speed."
        },
        oceanic_adaptation: {
          name: "Atmospheric Adaptation",
          effect: "+20% Energy & Citizens",
          description: "Atmospheric moisture harvesting techniques tested on {planet_2} improve life support and power cooling."
        },
        volcanic_shielding: {
          name: "Basalt-Ceramic Shielding",
          effect: "+30% All Colony Yields",
          description: "Extreme basalt-ceramic plating tested on {planet_3} fortifies every planetary production system."
        },
        hull_metallurgy: {
          name: "Aerospace Metallurgy",
          effect: "+15% Research Points",
          description: "Develops ultra-lightweight vacuum-forged rocket alloys from {planet_1} mineral deposits."
        },
        cryo_propellant: {
          name: "Cryo Propellant",
          effect: "+20% Energy Capacity",
          description: "Synthesizes high-impulse liquid hydrogen rocket fuel from {planet_1} glacier ice reserves."
        },
        orbital_rocketry: {
          name: "Orbital Rocketry",
          effect: "Unlocks Space Rocket I",
          description: "Completes single-stage launch gantry telemetry on {planet_1} test pads, unlocking Space Rocket I in the Build Menu."
        },
        heavy_starship: {
          name: "Heavy Starship Design",
          effect: "Unlocks Space Rocket II",
          description: "Masters twin strap-on booster staging from {planet_2} launchpads, unlocking Space Rocket II in the Build Menu."
        },
        helio_optics: {
          name: "Helio-Reflector Optics",
          effect: "Unlocks Helio Mirror",
          description: "Focuses orbital mirror arrays to concentrate starlight onto planetary grids, unlocking the Helio Mirror decoration."
        },
        solar_habitats: {
          name: "Self-Sustaining Habitats",
          effect: "Unlocks Eco Biodome",
          description: "Combines closed-loop hydroponics with integrated solar shells, unlocking the self-powered Eco Biodome."
        },
        arcology_grids: {
          name: "Arcology Microgrids",
          effect: "Unlocks Eco Arcology",
          description: "High-density vertical living towers tested on {planet_2} with built-in solar sails, unlocking the Eco Arcology."
        },
        civic_gardens: {
          name: "Civic Botanical Parks",
          effect: "Unlocks Botanical Park",
          description: "Designs thriving pressurized colony parks that boost Citizen growth speed, unlocking the Botanical Park decoration."
        },
        modular_prefabs: {
          name: "Modular Guild Prefabs",
          effect: "Unlocks Builders' Plaza",
          description: "Standardizes holographic prefab arches that cut local building costs, unlocking the Builders' Plaza decoration."
        },
        civic_prosperity: {
          name: "Civic Prosperity",
          effect: "+30% Citizen Growth",
          description: "Colony-wide quality-of-life charters from {planet_2} that speed up Citizen population growth across every planet."
        },
        planetary_terraforming: {
          name: "Planetary Terraforming",
          effect: "Unlocks Geo-Terraformer",
          description: "Harnesses focused seismic emitter cores to reshape tile terrain, unlocking the single-use Geo-Terraformer."
        },
        crust_stabilization: {
          name: "Crust Stabilization",
          effect: "+20% Bricks & Energy",
          description: "Deep tectonic anchors tested on {planet_2} that reinforce planetary Mines and Energy grids."
        }
      }
    },
    resource_tooltips: {
      global_tag: "Global Currency",
      planet_tag: "Planet Resource",
      current_label: "Current: {val}",
      capacity_label: "Capacity: {curr} / {max}",
      energy_avail_label: "Available: {avail} / {max} (Used: {used})",
      citizens_avail_label: "Available: {avail} / {max} (Used: {used})",
      citizens_regen_label: "Available: {avail} (Pop: {pop} / {max}, Used: {used})",
      solar_bonus_suffix: " · Solar +{pct}%",
      growth_bonus_suffix: " · Growth +{pct}%",
      rate_suffix: " ({rate})",
      credits: {
        title: "Space Credits",
        description: "Primary colony currency shared across all planets. Earned by launching Trade Rockets to sell Construction Bricks in orbit, and spent to construct and upgrade colony buildings."
      },
      ore: {
        title: "Space Ore",
        description: "Rare crystalline space gem shared across all planets. Slowly synthesized by Ore Research Stations (+5/day) and required to build additional Ore Research Stations beyond your first."
      },
      citizens: {
        title: "Citizens",
        description: "Colony pioneers living on this planet (Planet 1 always has 1 permanent pioneer — you!). Homes, Eco Habitats, and landed Space Rockets expand capacity; Botanical Parks speed up population growth."
      },
      energy: {
        title: "Energy",
        description: "Electrical power capacity on this planet. Generated by Solar buildings, Wind generators, and Self-Sustaining Eco Homes, and boosted by Helio Mirrors and Power research."
      },
      bricks: {
        title: "Construction Bricks",
        description: "Planetary building material extracted by Mines, Deep Mines, and Mega Quarries on this world. Sold by Trade Rockets for Space Credits or loaded onto Space Rockets for colonization missions."
      }
    },
    save: {
      offline_welcome: "Welcome back ({duration})! Earned {gains}",
      offline_welcome_named: "Welcome back, {name} ({duration})! Earned {gains}",
      offline_landed: "{count} Space Rocket(s) landed while you were away!",
      gain_credits: "+{val} SC",
      gain_ore: "+{val} Ore",
      gain_bricks: "+{val} Bricks",
      gain_rp: "+{val} RP",
      duration_sec: "{s}s",
      duration_min: "{m}m",
      duration_hr: "{h}h",
      duration_hr_min: "{h}h {m}m",
      gain_sep: ", "
    },
    intro: {
      tap_to_finish: "Tap to show all text",
      tap_to_continue: "Tap to continue",
      default_pioneer: "Explorer",
      name_placeholder: "Type your name...",
      name_required_error: "Please type your name to unlock the ship!",
      hint_enter_name: "Type your name above to unlock the engines",
      hint_ready_launch: "Engines unlocked — press Launch!",
      salvage_citizen: "+1 Citizen",
      salvage_energy: "+1 Energy",
      salvage_bricks: "+1/m Bricks",
      steps: [
        {
          beats: [
            {
              speaker: "Storyteller",
              caption: "This was Nova-7, our homeworld. For a thousand years, billions of us lived in peace beneath its golden rings—never knowing the planet's core was running out of time.",
              btn: "Continue"
            },
            {
              speaker: "Chief Leo (Radio)",
              caption: "Morning, rookie! I just finished fueling up your little scout ship on Pad 01. Wait a second... did you just feel the floor shake?",
              btn: "What was that?"
            }
          ]
        },
        {
          beats: [
            {
              speaker: "V.E.G.A. (Ship AI)",
              caption: "Red alert! The planet's core is breaking apart! The ground is collapsing across every city!",
              btn: "Leo, come in!"
            },
            {
              speaker: "Chief Leo (Radio)",
              caption: "There's no time! Your scout ship is the only one fueled and ready. Get into the cockpit right now—I'll hold the launch tower steady from the control room!",
              btn: "What about you?!"
            }
          ]
        },
        {
          beats: [
            {
              speaker: "Chief Leo (Radio)",
              caption: "The tower clamps are jammed—I have to hold the release lever by hand! Sign your name on the cockpit screen to unlock the engines, and don't look back!",
              btn: "Launch!"
            }
          ]
        },
        {
          beats: [
            {
              speaker: "Chief Leo (Radio)",
              caption: "You're clear of the tower! Fly far, {name}... find a new home for us. Somebody has to remember we were here— *kzzzt*—",
              btn: "Leo?! Come in!"
            },
            {
              speaker: "{name}",
              caption: "...Leo? Anybody? ...The whole radio is just static. Nova-7 is gone. Everyone I ever knew... gone in a single flash.",
              btn: "Keep Flying"
            }
          ]
        },
        {
          beats: [
            {
              speaker: "V.E.G.A. (Ship AI)",
              caption: "{name}, our fuel tanks just hit zero. That emergency launch burned every last drop we had. The engines are shutting down...",
              btn: "Can we steer?"
            },
            {
              speaker: "{name}",
              caption: "The thrusters are dead! We're spinning out of control in the middle of nowhere... V.E.G.A., are we going to make it?",
              btn: "Listen to V.E.G.A."
            },
            {
              speaker: "V.E.G.A. (Ship AI)",
              caption: "I am still right here with you, {name}. I turned off my own lights and heaters to save oxygen for you. Rest your eyes—I will keep watch in the dark.",
              btn: "Close Your Eyes"
            }
          ]
        },
        {
          beats: [
            {
              speaker: "Storyteller",
              caption: "Days turned into weeks as the little ship drifted silently through the cold dark. Just when hope began to fade, a pale rocky world appeared ahead.",
              btn: "Wake Up"
            },
            {
              speaker: "V.E.G.A. (Ship AI)",
              caption: "{name}, wake up! Look out the front window! My sensors found a planet—and it has solid ground, ice, and minerals!",
              btn: "Look Outside"
            }
          ]
        },
        {
          beats: [
            {
              speaker: "{name}",
              caption: "It's huge... wait, why are we speeding up?! V.E.G.A., its gravity is pulling us straight down, and we have no fuel to slow down!",
              btn: "Grab the Controls"
            },
            {
              speaker: "V.E.G.A. (Ship AI)",
              caption: "I'm locking your seat harness and sending all my last battery power into the crash shields! Hold on tight, {name}—we're going in!",
              btn: "Brace for Impact!"
            }
          ]
        },
        {
          beats: [
            {
              speaker: "V.E.G.A. (Ship AI)",
              caption: "*Bzzzt*... Systems rebooting... {name}? Are you hurt? You made it! We're alive!",
              btn: "I'm Okay"
            },
            {
              speaker: "{name}",
              caption: "My ship is wrecked, but its hull is still strong enough to be my shelter and power source. I made a promise to Leo... and this is where our new home begins.",
              btn: "Build Our New Home"
            }
          ]
        }
      ]
    },
    reset_modal: {
      badge: "SECRET CHEAT",
      title: "Reset All Progress?",
      question: "Would you like to reset your progress?",
      warning: "This will wipe all planets, buildings, currencies, research, and saved files completely. You will restart as a fresh player from the opening story cinematic.",
      btn_cancel: "Cancel",
      btn_confirm: "Yes, Reset Everything"
    }
  };

  function get(path) {
    if (!path) return undefined;
    const parts = String(path).split(".");
    let cur = EN_US;
    for (let i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== "object") {
        return undefined;
      }
      cur = cur[parts[i]];
    }
    return cur;
  }

  function t(path, params) {
    const val = get(path);
    if (val === undefined || val === null) {
      return String(path || "");
    }
    let str = String(val);
    if (params && typeof params === "object") {
      str = str.replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, key) {
        return Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined
          ? String(params[key])
          : "{" + key + "}";
      });
    }
    return str;
  }

  function applyToDom(root) {
    const scope = root || document;
    if (!scope || typeof scope.querySelectorAll !== "function") return;

    const textEls = scope.querySelectorAll("[data-i18n]");
    for (let i = 0; i < textEls.length; i++) {
      const el = textEls[i];
      const val = get(el.getAttribute("data-i18n"));
      if (typeof val === "string") {
        el.textContent = val;
      }
    }

    const titleEls = scope.querySelectorAll("[data-i18n-title]");
    for (let i = 0; i < titleEls.length; i++) {
      const el = titleEls[i];
      const val = get(el.getAttribute("data-i18n-title"));
      if (typeof val === "string") {
        el.setAttribute("title", val);
      }
    }

    const ariaEls = scope.querySelectorAll("[data-i18n-aria-label]");
    for (let i = 0; i < ariaEls.length; i++) {
      const el = ariaEls[i];
      const val = get(el.getAttribute("data-i18n-aria-label"));
      if (typeof val === "string") {
        el.setAttribute("aria-label", val);
      }
    }

    const placeholderEls = scope.querySelectorAll("[data-i18n-placeholder]");
    for (let i = 0; i < placeholderEls.length; i++) {
      const el = placeholderEls[i];
      const val = get(el.getAttribute("data-i18n-placeholder"));
      if (typeof val === "string") {
        el.setAttribute("placeholder", val);
      }
    }

    const contentEls = scope.querySelectorAll("[data-i18n-content]");
    for (let i = 0; i < contentEls.length; i++) {
      const el = contentEls[i];
      const val = get(el.getAttribute("data-i18n-content"));
      if (typeof val === "string") {
        el.setAttribute("content", val);
      }
    }
  }

  window.GameLang = {
    locale: "en_us",
    en_us: EN_US,
    get: get,
    t: t,
    applyToDom: applyToDom
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyToDom(document);
    });
  } else {
    applyToDom(document);
  }
})();
