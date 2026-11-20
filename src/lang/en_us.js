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
      confirm_construction: "Confirm Construction"
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
      zoom_format: "{zoom}×"
    },
    rates: {
      per_second: "+{rate}/s",
      per_minute: "+{rate}/min",
      per_hour: "+{rate}/hr",
      per_day: "+{rate}/day"
    },
    planets: {
      planet_1: {
        default_name: "Planet 1",
        type_label: "Rocky"
      },
      planet_2: {
        default_name: "Planet 2",
        type_label: "Oceanic"
      },
      planet_3: {
        default_name: "Planet 3",
        type_label: "Volcanic"
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
      research_lab: {
        name: "Research Lab",
        specialty: "Tech Research",
        description: "Pressurized orbital science facility equipped with quantum telemetry arrays to study planetary anomalies and advance colony technology."
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
      }
    },
    build: {
      demolish: "Demolish",
      cancel: "Cancel",
      confirm_build: "Confirm Build",
      built_badge: "BUILT",
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
      missing_joiner: " and "
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
