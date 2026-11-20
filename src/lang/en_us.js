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
      trade_upgrade: "Upgrade Trade Rocket"
    },
    currencies: {
      credits: "Credits",
      ore: "Ore",
      space_ore: "Space Ore",
      per_second: "/s",
      suffixes: ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
    },
    planet: {
      rename: "Rename Planet",
      save_name: "Save Planet Name",
      name_label: "Planet Name",
      name_placeholder: "Planet name",
      citizens_tooltip: "Citizens on this planet (Current / Max Capacity)",
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
      per_day: "+{rate}/day"
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
      science: "Science"
    },
    terrains: {
      solid: "Any Solid",
      surface: "Surface",
      mountainous: "Mountainous"
    },
    biomes: {
      mountains: { name: "Mountains" },
      glacier:   { name: "Glacier" },
      highlands: { name: "Highlands" },
      crater:    { name: "Crater" },
      forest:    { name: "Forest" },
      plains:    { name: "Plains" },
      ocean:     { name: "Ocean", unbuildable_hint: "Cannot build on deep water — select a solid land tile" },
      lava:      { name: "Lava", unbuildable_hint: "Cannot build on molten lava — select a solid land tile" },
      volcano:   { name: "Volcano" },
      canyon:    { name: "Canyon" },
      ashlands:  { name: "Ashlands" }
    },
    buildings: {
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
    rocket: {
      launch_btn: "LAUNCH!",
      cargo_btn: "Cargo",
      cargo_btn_loaded: "Cargo {loaded}/{max}",
      cargo_modal_title: "Rocket Payload",
      target_planet: "Destination: {planet}",
      crew_label: "Citizens (Fixed)",
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
      max_per_planet: "Max {limit} / Planet",
      requires_research_chip: "To Be Researched",
      citizen_gain_one: "+{count} Citizen",
      citizen_gain_many: "+{count} Citizens",
      energy_gain: "+{count} Energy",
      replace_notice: "Replaces existing {building} on this tile.",
      replace_fallback_building: "building"
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
      trade_no_bricks_to_start: "Cannot start {building} — no Construction Bricks left on {planet}!"
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
        }
      }
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
