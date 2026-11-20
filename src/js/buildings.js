/**
 * Space Colonization: Idle
 * Building Menu UI Controller & Procedural 3D Colony Building Renderer
 */

(function () {
  "use strict";

  function t(key, params) {
    if (window.GameLang && typeof window.GameLang.t === "function") {
      return window.GameLang.t(key, params);
    }
    return String(key || "");
  }

  function formatCitizenGain(count) {
    const formatted = formatCostValue(count);
    return t(count === 1 ? "build.citizen_gain_one" : "build.citizen_gain_many", { count: formatted });
  }

  function formatEnergyGain(count) {
    return t("build.energy_gain", { count: formatCostValue(count) });
  }

  function formatEnergyReq(count) {
    return t("build.energy_req", { count: formatCostValue(count) });
  }

  function formatCitizenReq(count) {
    const formatted = formatCostValue(count);
    return t(count === 1 ? "build.citizen_req_one" : "build.citizen_req_many", { count: formatted });
  }

  const CATEGORIES = [
    { id: "all",     label: t("categories.all"),     iconSrc: "./assets/ui/cat-all.svg",     accent: "#ffc83a", badgeBg: "#fff6cc" },
    { id: "power",   label: t("categories.power"),   iconSrc: "./assets/ui/cat-power.svg",   accent: "#ffc83a", badgeBg: "#fff6cc" },
    { id: "mining",  label: t("categories.mining"),  iconSrc: "./assets/ui/cat-mining.svg",  accent: "#ffb13b", badgeBg: "#ffefd6" },
    { id: "colony",  label: t("categories.colony"),  iconSrc: "./assets/ui/cat-colony.svg",  accent: "#ff6b5a", badgeBg: "#ffe6e3" },
    { id: "science", label: t("categories.science"), iconSrc: "./assets/ui/cat-science.svg", accent: "#37a8ff", badgeBg: "#e0f4ff" }
  ];

  const TERRAIN_GROUPS = {
    solid: {
      id: "solid",
      label: t("terrains.solid"),
      iconSrc: "./assets/ui/terrain-solid.svg"
    },
    surface: {
      id: "surface",
      label: t("terrains.surface"),
      iconSrc: "./assets/ui/terrain-surface.svg"
    },
    mountainous: {
      id: "mountainous",
      label: t("terrains.mountainous"),
      iconSrc: "./assets/ui/terrain-mountainous.svg"
    }
  };

  const CURRENCY_ICONS = {
    credits: "./assets/ui/icon-credits.svg",
    bricks: "./assets/ui/icon-bricks.svg",
    ore: "./assets/ui/icon-ore.svg"
  };

  const STAT_ICONS = {
    citizens: "./assets/ui/icon-citizen.svg",
    energy: "./assets/ui/icon-energy.svg",
    bricks: "./assets/ui/icon-bricks.svg",
    research: "./assets/ui/icon-research.svg",
    ore: "./assets/ui/icon-ore.svg"
  };

  const BUILDINGS = [
    {
      id: "mine",
      name: t("buildings.mine.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "mountainous",
      nextVariantId: "deep_mine",
      bricksPerSec: 0.2,
      energyRequired: 1,
      citizensRequired: 1,
      description: t("buildings.mine.description"),
      cost: { credits: 100 },
      accent: "#ffb13b",
      iconSrc: "./assets/ui/bld-mine.svg"
    },
    {
      id: "deep_mine",
      name: t("buildings.deep_mine.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "mountainous",
      nextVariantId: "mega_quarry",
      bricksPerSec: 0.8,
      energyRequired: 3,
      citizensRequired: 2,
      description: t("buildings.deep_mine.description"),
      cost: { credits: 230, ore: 40 },
      accent: "#f97316",
      iconSrc: "./assets/ui/bld-deep-mine.svg"
    },
    {
      id: "mega_quarry",
      name: t("buildings.mega_quarry.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "mountainous",
      nextVariantId: null,
      bricksPerSec: 2.5,
      energyRequired: 8,
      citizensRequired: 4,
      description: t("buildings.mega_quarry.description"),
      cost: { credits: 460, ore: 90 },
      accent: "#ef4444",
      iconSrc: "./assets/ui/bld-mega-quarry.svg"
    },
    {
      id: "trade_rocket_1",
      name: t("buildings.trade_rocket_1.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      tradeVariant: 1,
      nextVariantId: "trade_rocket_2",
      bricksPerLaunch: 5,
      creditsPerBrick: 4,
      tradeIntervalSec: 6.0,
      tradeSpeedMult: 1.0,
      energyRequired: 2,
      citizensRequired: 1,
      specialtyLabel: t("buildings.trade_rocket_1.specialty"),
      specialtyIconSrc: "./assets/ui/bld-trade-rocket-1.svg",
      description: t("buildings.trade_rocket_1.description"),
      cost: { credits: 140, ore: 20 },
      accent: "#10b981",
      iconSrc: "./assets/ui/bld-trade-rocket-1.svg"
    },
    {
      id: "trade_rocket_2",
      name: t("buildings.trade_rocket_2.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      tradeVariant: 2,
      nextVariantId: "trade_rocket_3",
      bricksPerLaunch: 12,
      creditsPerBrick: 5,
      tradeIntervalSec: 4.0,
      tradeSpeedMult: 1.35,
      energyRequired: 5,
      citizensRequired: 2,
      specialtyLabel: t("buildings.trade_rocket_2.specialty"),
      specialtyIconSrc: "./assets/ui/bld-trade-rocket-2.svg",
      description: t("buildings.trade_rocket_2.description"),
      cost: { credits: 290, ore: 50 },
      accent: "#06b6d4",
      iconSrc: "./assets/ui/bld-trade-rocket-2.svg"
    },
    {
      id: "trade_rocket_3",
      name: t("buildings.trade_rocket_3.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      tradeVariant: 3,
      nextVariantId: null,
      bricksPerLaunch: 25,
      creditsPerBrick: 6,
      tradeIntervalSec: 2.5,
      tradeSpeedMult: 1.75,
      energyRequired: 10,
      citizensRequired: 4,
      specialtyLabel: t("buildings.trade_rocket_3.specialty"),
      specialtyIconSrc: "./assets/ui/bld-trade-rocket-3.svg",
      description: t("buildings.trade_rocket_3.description"),
      cost: { credits: 480, ore: 95 },
      accent: "#f59e0b",
      iconSrc: "./assets/ui/bld-trade-rocket-3.svg"
    },
    {
      id: "research_center",
      name: t("buildings.research_center.name"),
      category: "science",
      tag: t("categories.science"),
      terrain: "solid",
      maxPerPlanet: 1,
      nextVariantId: null,
      researchPerSec: 0.25,
      energyRequired: 1,
      citizensRequired: 1,
      description: t("buildings.research_center.description"),
      cost: { credits: 150, ore: 20 },
      accent: "#a855f7",
      iconSrc: "./assets/ui/bld-research-center.svg"
    },
    {
      id: "research_lab",
      name: t("buildings.research_lab.name"),
      category: "science",
      tag: t("categories.science"),
      terrain: "solid",
      nextVariantId: "observatory",
      researchPerSec: 0.5,
      energyRequired: 2,
      citizensRequired: 2,
      description: t("buildings.research_lab.description"),
      cost: { credits: 200, ore: 35 },
      accent: "#37a8ff",
      iconSrc: "./assets/ui/bld-research-lab.svg"
    },
    {
      id: "observatory",
      name: t("buildings.observatory.name"),
      category: "science",
      tag: t("categories.science"),
      terrain: "mountainous",
      nextVariantId: "quantum_array",
      researchPerSec: 1.2,
      energyRequired: 5,
      citizensRequired: 3,
      description: t("buildings.observatory.description"),
      cost: { credits: 340, ore: 60 },
      accent: "#6366f1",
      iconSrc: "./assets/ui/bld-observatory.svg"
    },
    {
      id: "quantum_array",
      name: t("buildings.quantum_array.name"),
      category: "science",
      tag: t("categories.science"),
      terrain: "solid",
      nextVariantId: null,
      researchPerSec: 3.5,
      energyRequired: 12,
      citizensRequired: 5,
      requiredResearch: "quantum_computing",
      description: t("buildings.quantum_array.description"),
      cost: { credits: 450, ore: 85 },
      accent: "#ec4899",
      iconSrc: "./assets/ui/bld-quantum-array.svg"
    },
    {
      id: "ore_research_station",
      name: t("buildings.ore_research_station.name"),
      category: "science",
      tag: t("categories.science"),
      terrain: "solid",
      nextVariantId: null,
      orePerDay: 5,
      energyRequired: 15,
      citizensRequired: 8,
      requiredResearch: "ore_synthesis",
      description: t("buildings.ore_research_station.description"),
      cost: { credits: 2500, bricks: 400 },
      costScaling: {
        creditsMult: 1.8,
        bricksMult: 1.6,
        oreBaseAfterFirst: 15,
        oreMult: 1.75
      },
      accent: "#22d3ee",
      iconSrc: "./assets/ui/bld-ore-research-station.svg"
    },
    {
      id: "small_house",
      name: t("buildings.small_house.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      nextVariantId: "big_house",
      citizenSlots: 2,
      description: t("buildings.small_house.description"),
      cost: { credits: 75, ore: 10 },
      accent: "#ff6b5a",
      iconSrc: "./assets/ui/bld-house.svg"
    },
    {
      id: "big_house",
      name: t("buildings.big_house.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      nextVariantId: "villa",
      citizenSlots: 6,
      description: t("buildings.big_house.description"),
      cost: { credits: 200, ore: 35 },
      accent: "#ff8a3d",
      iconSrc: "./assets/ui/bld-big-house.svg"
    },
    {
      id: "villa",
      name: t("buildings.villa.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      nextVariantId: null,
      citizenSlots: 15,
      description: t("buildings.villa.description"),
      cost: { credits: 450, ore: 90 },
      accent: "#a855f7",
      iconSrc: "./assets/ui/bld-villa.svg"
    },
    {
      id: "solar_panel",
      name: t("buildings.solar_panel.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "solid",
      nextVariantId: "solar_array",
      energySlots: 3,
      description: t("buildings.solar_panel.description"),
      cost: { credits: 50 },
      accent: "#ffc83a",
      iconSrc: "./assets/ui/bld-solar-panel.svg"
    },
    {
      id: "solar_array",
      name: t("buildings.solar_array.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "solid",
      nextVariantId: "solar_tower",
      energySlots: 8,
      description: t("buildings.solar_array.description"),
      cost: { credits: 160, ore: 25 },
      accent: "#ffad26",
      iconSrc: "./assets/ui/bld-solar-array.svg"
    },
    {
      id: "solar_tower",
      name: t("buildings.solar_tower.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "solid",
      nextVariantId: null,
      energySlots: 20,
      description: t("buildings.solar_tower.description"),
      cost: { credits: 400, ore: 75 },
      accent: "#ff7b1c",
      iconSrc: "./assets/ui/bld-solar-tower.svg"
    },
    {
      id: "windmill",
      name: t("buildings.windmill.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "surface",
      nextVariantId: "wind_turbine",
      energySlots: 6,
      description: t("buildings.windmill.description"),
      cost: { credits: 120, ore: 25 },
      accent: "#3fd6c4",
      iconSrc: "./assets/ui/bld-windmill.svg"
    },
    {
      id: "wind_turbine",
      name: t("buildings.wind_turbine.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "surface",
      nextVariantId: "wind_farm",
      energySlots: 16,
      description: t("buildings.wind_turbine.description"),
      cost: { credits: 280, ore: 55 },
      accent: "#20b9f0",
      iconSrc: "./assets/ui/bld-wind-turbine.svg"
    },
    {
      id: "wind_farm",
      name: t("buildings.wind_farm.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "surface",
      nextVariantId: null,
      energySlots: 35,
      description: t("buildings.wind_farm.description"),
      cost: { credits: 480, ore: 95 },
      accent: "#3888ff",
      iconSrc: "./assets/ui/bld-wind-farm.svg"
    },
    {
      id: "space_rocket_1",
      name: t("buildings.space_rocket_1.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      requiredResearch: "orbital_rocketry",
      nextVariantId: "space_rocket_2",
      rocketTier: 1,
      rocketCitizens: 4,
      rocketMaxBricks: 200,
      specialtyLabel: t("buildings.space_rocket_1.specialty"),
      specialtyIconSrc: "./assets/ui/bld-space-rocket-1.svg",
      description: t("buildings.space_rocket_1.description"),
      cost: { credits: 450, ore: 85 },
      accent: "#ff5a4d",
      iconSrc: "./assets/ui/bld-space-rocket-1.svg"
    },
    {
      id: "space_rocket_2",
      name: t("buildings.space_rocket_2.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      requiredResearch: "heavy_starship",
      nextVariantId: null,
      rocketTier: 2,
      rocketCitizens: 10,
      rocketMaxBricks: 600,
      specialtyLabel: t("buildings.space_rocket_2.specialty"),
      specialtyIconSrc: "./assets/ui/bld-space-rocket-2.svg",
      description: t("buildings.space_rocket_2.description"),
      cost: { credits: 500, ore: 100 },
      accent: "#f59e0b",
      iconSrc: "./assets/ui/bld-space-rocket-2.svg"
    },
    {
      id: "crash_base",
      name: t("buildings.crash_base.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "solid",
      nextVariantId: null,
      specialtyLabel: t("buildings.crash_base.specialty"),
      specialtyIconSrc: "./assets/ui/bld-crash-base.svg",
      bricksPerSec: 1 / 60,
      energySlots: 1,
      citizenSlots: 1,
      fixedCitizens: true,
      indestructible: true,
      unreplaceable: true,
      hiddenFromBuildMenu: true,
      description: t("buildings.crash_base.description"),
      cost: {},
      accent: "#ff7a45",
      iconSrc: "./assets/ui/bld-crash-base.svg"
    }
  ];

  if (window.GameEconomy && typeof window.GameEconomy.getBuilding === "function") {
    for (let i = 0; i < BUILDINGS.length; i++) {
      const b = BUILDINGS[i];
      const econ = window.GameEconomy.getBuilding(b.id);
      if (!econ) continue;
      for (const prop in econ) {
        if (Object.prototype.hasOwnProperty.call(econ, prop)) {
          if (prop === "cost" && econ.cost && typeof econ.cost === "object") {
            b.cost = Object.assign({}, econ.cost);
          } else if (prop === "costScaling" && econ.costScaling && typeof econ.costScaling === "object") {
            b.costScaling = Object.assign({}, econ.costScaling);
          } else {
            b[prop] = econ[prop];
          }
        }
      }
    }
  }

  const BIOMES = {
    mountains: { id: "mountains", name: t("biomes.mountains.name"), terrains: ["solid", "mountainous"], accent: "#94a3b8", badgeBg: "#edf4ff", iconSrc: "./assets/ui/biome-mountains.svg" },
    glacier:   { id: "glacier",   name: t("biomes.glacier.name"),   terrains: ["solid"],                accent: "#5fd8f8", badgeBg: "#e6faff", iconSrc: "./assets/ui/biome-glacier.svg" },
    highlands: { id: "highlands", name: t("biomes.highlands.name"), terrains: ["solid", "surface"],     accent: "#a78bfa", badgeBg: "#f2eeff", iconSrc: "./assets/ui/biome-highlands.svg" },
    crater:    { id: "crater",    name: t("biomes.crater.name"),    terrains: ["solid", "mountainous"], accent: "#7c8ba8", badgeBg: "#eceff8", iconSrc: "./assets/ui/biome-crater.svg" },
    forest:    { id: "forest",    name: t("biomes.forest.name"),    terrains: ["solid", "surface"],     accent: "#22c55e", badgeBg: "#e8fce9", iconSrc: "./assets/ui/biome-forest.svg" },
    plains:    { id: "plains",    name: t("biomes.plains.name"),    terrains: ["solid", "surface"],     accent: "#84e148", badgeBg: "#f2ffe4", iconSrc: "./assets/ui/biome-plains.svg" },
    ocean:     { id: "ocean",     name: t("biomes.ocean.name"),     terrains: [],                       accent: "#37a8ff", badgeBg: "#e3f5ff", iconSrc: "./assets/ui/biome-ocean.svg", unbuildableHint: t("biomes.ocean.unbuildable_hint") },
    lava:      { id: "lava",      name: t("biomes.lava.name"),      terrains: [],                       accent: "#ff8c2a", badgeBg: "#fff0dc", iconSrc: "./assets/ui/biome-lava.svg", unbuildableHint: t("biomes.lava.unbuildable_hint") },
    volcano:   { id: "volcano",   name: t("biomes.volcano.name"),   terrains: ["solid", "mountainous"], accent: "#ff5a4d", badgeBg: "#ffe8e6", iconSrc: "./assets/ui/biome-volcano.svg" },
    canyon:    { id: "canyon",    name: t("biomes.canyon.name"),    terrains: ["solid", "mountainous"], accent: "#e87d3e", badgeBg: "#ffefe3", iconSrc: "./assets/ui/biome-canyon.svg" },
    ashlands:  { id: "ashlands",  name: t("biomes.ashlands.name"),  terrains: ["solid", "surface"],     accent: "#8d7ab8", badgeBg: "#f0ecf9", iconSrc: "./assets/ui/biome-ashlands.svg" }
  };

  function getBiome(biomeId) {
    return (biomeId && BIOMES[biomeId]) || BIOMES.highlands;
  }

  function getBuilding(buildingId) {
    const id = buildingId === "house" ? "small_house" : buildingId;
    for (let i = 0; i < BUILDINGS.length; i++) {
      if (BUILDINGS[i].id === id) {
        return BUILDINGS[i];
      }
    }
    return null;
  }

  function isProtectedBuilding(buildingId) {
    const b = getBuilding(buildingId);
    return Boolean(b && (b.indestructible || b.unreplaceable));
  }

  function getTerrainGroup(terrainId) {
    return TERRAIN_GROUPS[terrainId] || TERRAIN_GROUPS.solid;
  }

  function getCategory(categoryId) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === categoryId) {
        return CATEGORIES[i];
      }
    }
    return CATEGORIES[0];
  }

  function canBuildOnBiome(buildingId, biomeId) {
    const b = getBuilding(buildingId);
    if (!b) return false;
    const biome = getBiome(biomeId);
    return Boolean(biome && biome.terrains && biome.terrains.indexOf(b.terrain) !== -1);
  }

  function getAvailableCurrencyAmount(key, planetId) {
    if (key === "bricks") {
      const pId = planetId !== undefined && planetId !== null ? planetId : currentPlanetId;
      if (typeof callbacks.getPlanetBricks === "function") {
        return Math.max(0, Math.floor(callbacks.getPlanetBricks(pId) || 0));
      }
      return 0;
    }
    return (window.GameCurrencies && typeof window.GameCurrencies.get === "function" ? window.GameCurrencies.get(key) : 0) || 0;
  }

  function getBuildingOrePerSec(b) {
    if (!b) return 0;
    if (b.orePerSec && b.orePerSec > 0) return b.orePerSec;
    if (b.orePerDay && b.orePerDay > 0) return b.orePerDay / 86400;
    return 0;
  }

  function getOwnedBuildingCount(buildingId) {
    if (typeof callbacks.getBuildingCountGlobal === "function") {
      return Math.max(0, Math.floor(callbacks.getBuildingCountGlobal(buildingId) || 0));
    }
    return 0;
  }

  function getBuildingCost(buildingId) {
    const b = getBuilding(buildingId);
    if (!b || !b.cost) return null;
    if (!b.costScaling) {
      return b.cost;
    }
    const owned = getOwnedBuildingCount(b.id);
    const s = b.costScaling;
    const cost = {};
    if (b.cost.credits > 0) {
      cost.credits = Math.round(b.cost.credits * Math.pow(s.creditsMult || 1, owned));
    }
    if (b.cost.bricks > 0) {
      cost.bricks = Math.round(b.cost.bricks * Math.pow(s.bricksMult || 1, owned));
    }
    if (owned >= 1 && s.oreBaseAfterFirst > 0) {
      cost.ore = Math.round(s.oreBaseAfterFirst * Math.pow(s.oreMult || 1, owned - 1));
    } else if (b.cost.ore > 0) {
      cost.ore = Math.round(b.cost.ore * Math.pow(s.oreMult || 1, owned));
    }
    return cost;
  }

  function canAffordBuilding(buildingId, planetId) {
    const cost = getBuildingCost(buildingId);
    if (!cost) return true;
    const pId = planetId !== undefined && planetId !== null ? planetId : currentPlanetId;
    if (cost.bricks) {
      const bricksReq = Math.max(0, Number(cost.bricks) || 0);
      if (bricksReq > 0) {
        const currentBricks = getAvailableCurrencyAmount("bricks", pId);
        if (currentBricks < bricksReq) {
          return false;
        }
      }
    }
    if (!window.GameCurrencies || typeof window.GameCurrencies.canAfford !== "function") {
      return true;
    }
    const globalCosts = {};
    for (const key in cost) {
      if (key !== "bricks" && Object.prototype.hasOwnProperty.call(cost, key)) {
        globalCosts[key] = cost[key];
      }
    }
    return window.GameCurrencies.canAfford(globalCosts);
  }

  function isBuildingResearchLocked(buildingId) {
    const b = getBuilding(buildingId);
    if (!b || !b.requiredResearch) return false;
    if (!window.GameResearch || typeof window.GameResearch.isResearched !== "function") {
      return true;
    }
    return !window.GameResearch.isResearched(b.requiredResearch);
  }

  function isBuildingPlanetLimitReached(buildingId, planetId, placedId) {
    const b = getBuilding(buildingId);
    if (!b || !b.maxPerPlanet) return false;
    if (placedId === b.id) return false;
    if (typeof callbacks.getBuildingCountOnPlanet !== "function") return false;
    return callbacks.getBuildingCountOnPlanet(planetId, b.id) >= b.maxPerPlanet;
  }

  function getNextUpgradeBuilding(buildingId, biomeId) {
    let cur = getBuilding(buildingId);
    if (!cur || !cur.nextVariantId) return null;
    const visited = Object.create(null);
    visited[cur.id] = true;
    while (cur && cur.nextVariantId) {
      const nextId = cur.nextVariantId;
      if (visited[nextId]) return null;
      visited[nextId] = true;
      const nextDef = getBuilding(nextId);
      if (!nextDef) return null;
      if (!biomeId || canBuildOnBiome(nextDef.id, biomeId)) {
        return nextDef;
      }
      cur = nextDef;
    }
    return null;
  }

  function formatCostValue(amount) {
    if (window.GameCurrencies && typeof window.GameCurrencies.formatNumber === "function") {
      return window.GameCurrencies.formatNumber(amount);
    }
    return String(amount);
  }

  function formatRateNumber(val) {
    if (val >= 1000) {
      return formatCostValue(val);
    }
    if (val >= 100) {
      return String(Math.round(val));
    }
    const rounded = Math.round(val * 10) / 10;
    return rounded % 1 === 0 ? String(rounded | 0) : rounded.toFixed(1);
  }

  function formatProductionRate(perSec) {
    const r = Math.max(0, Number(perSec) || 0);
    if (r <= 0) return "";
    if (r >= 1) {
      return t("rates.per_second", { rate: formatRateNumber(r) });
    }
    const perMin = r * 60;
    if (perMin >= 1) {
      return t("rates.per_minute", { rate: formatRateNumber(perMin) });
    }
    const perHour = r * 3600;
    if (perHour >= 1) {
      return t("rates.per_hour", { rate: formatRateNumber(perHour) });
    }
    const perDay = Math.max(0.1, r * 86400);
    return t("rates.per_day", { rate: formatRateNumber(perDay) });
  }

  function renderCostItems(containerEl, cost, planetId) {
    if (!containerEl) return;
    const costOrder = ["credits", "bricks", "ore"];
    for (let c = 0; c < costOrder.length; c++) {
      const key = costOrder[c];
      const req = cost && cost[key];
      if (!req || req <= 0) continue;
      const hasEnough = getAvailableCurrencyAmount(key, planetId) >= req;
      const item = document.createElement("span");
      item.className = "build-cost-item" + (hasEnough ? "" : " is-short");
      const cIcon = document.createElement("img");
      cIcon.className = "build-cost-icon";
      cIcon.src = CURRENCY_ICONS[key];
      cIcon.alt = "";
      cIcon.draggable = false;
      const cVal = document.createElement("span");
      cVal.className = "build-cost-val";
      cVal.textContent = formatCostValue(req);
      item.appendChild(cIcon);
      item.appendChild(cVal);
      containerEl.appendChild(item);
    }
  }

  // --- Drawer UI References & State ---

  const drawerEl = document.getElementById("build-drawer");
  const biomeBadgeEl = document.getElementById("build-biome-badge");
  const biomeIconEl = document.getElementById("build-biome-icon");
  const titleEl = document.getElementById("build-tile-title");
  const unbuildableBannerEl = document.getElementById("build-unbuildable-banner");
  const categoriesEl = document.getElementById("build-categories");
  const shelfPrevBtn = document.getElementById("btn-shelf-prev");
  const shelfNextBtn = document.getElementById("btn-shelf-next");
  const listEl = document.getElementById("build-list");
  const closeBtn = document.getElementById("btn-close-build");
  const removeBtn = document.getElementById("btn-remove-building");
  const toastContainerEl = document.getElementById("game-toast-container");
  const confirmSceneEl = document.getElementById("build-confirm-scene");
  const confirmStageEl = document.getElementById("build-confirm-stage");
  const confirmCatBadgeEl = document.getElementById("build-confirm-cat-badge");
  const confirmCatIconEl = document.getElementById("build-confirm-cat-icon");
  const confirmIconEl = document.getElementById("build-confirm-icon");
  const confirmNameEl = document.getElementById("build-confirm-name");
  const confirmBadgesEl = document.getElementById("build-confirm-badges");
  const confirmDescEl = document.getElementById("build-confirm-desc");
  const confirmReplaceEl = document.getElementById("build-confirm-replace");
  const confirmCostsEl = document.getElementById("build-confirm-costs");
  const confirmCancelBtn = document.getElementById("btn-confirm-cancel");
  const confirmBuildBtn = document.getElementById("btn-confirm-build");

  let activeCategory = "all";
  let currentPlanetId = 0;
  let currentTileId = null;
  let currentPlacedId = null;
  let currentBiomeId = null;
  let pendingConfirmBuildingId = null;
  let menuOpen = false;
  let callbacks = {
    onPlace: null,
    onRemove: null,
    onClose: null
  };
  let listDragScroller = null;
  let catDragScroller = null;
  const activeToasts = [];
  const MAX_TOASTS = 5;

  function removeToastItem(item) {
    if (!item) return;
    if (item.timer) {
      window.clearTimeout(item.timer);
      item.timer = 0;
    }
    const idx = activeToasts.indexOf(item);
    if (idx !== -1) {
      activeToasts.splice(idx, 1);
    }
    if (item.el && item.el.parentNode) {
      item.el.parentNode.removeChild(item.el);
    }
  }

  function clearAllToasts() {
    while (activeToasts.length > 0) {
      removeToastItem(activeToasts[0]);
    }
  }

  function showBuildErrorToast(messageHtml, variant) {
    const container = toastContainerEl || document.body;

    // Maintain max 5 simultaneous visible toasts by popping oldest
    while (activeToasts.length >= MAX_TOASTS) {
      removeToastItem(activeToasts[0]);
    }

    const toast = document.createElement("div");
    toast.className = "game-toast" + (variant === "success" ? " game-toast--success" : "");
    toast.setAttribute("role", "alert");
    toast.innerHTML = messageHtml;

    container.appendChild(toast);

    const item = {
      el: toast,
      timer: 0
    };
    activeToasts.push(item);

    // Fade-in entrance
    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    // After display duration, trigger float-up and fade-out
    item.timer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.classList.add("is-hiding");
      item.timer = window.setTimeout(function () {
        removeToastItem(item);
      }, 650);
    }, 2200);
  }

  function isCompactRightMode() {
    return window.innerWidth > window.innerHeight && window.innerHeight <= 520;
  }

  function syncUnbuildableBanner(biome) {
    if (!unbuildableBannerEl) return;
    if (isProtectedBuilding(currentPlacedId)) {
      unbuildableBannerEl.textContent = t("build.protected_base_banner");
      unbuildableBannerEl.classList.add("is-protected");
      unbuildableBannerEl.classList.remove("is-hidden");
      return;
    }
    unbuildableBannerEl.classList.remove("is-protected");
    unbuildableBannerEl.classList.add("is-hidden");
  }

  let lastOverflowX = null;
  let lastOverflowY = null;
  let lastPrevHidden = null;
  let lastNextHidden = null;
  let scrollSyncRaf = 0;

  function updateShelfNav(scrollPos, maxScroll) {
    const overflow = maxScroll > 6;
    const prevHidden = !overflow || scrollPos <= 12;
    const nextHidden = !overflow || scrollPos >= maxScroll - 12;
    if (shelfPrevBtn && prevHidden !== lastPrevHidden) {
      lastPrevHidden = prevHidden;
      shelfPrevBtn.classList.toggle("is-hidden", prevHidden);
    }
    if (shelfNextBtn && nextHidden !== lastNextHidden) {
      lastNextHidden = nextHidden;
      shelfNextBtn.classList.toggle("is-hidden", nextHidden);
    }
  }

  function syncShelfScroll() {
    if (!listEl) return;
    if (isCompactRightMode()) {
      if (lastOverflowX !== false) {
        lastOverflowX = false;
        listEl.classList.remove("is-overflowing");
      }
      const overflowY = listEl.scrollHeight > listEl.clientHeight + 6;
      if (overflowY !== lastOverflowY) {
        lastOverflowY = overflowY;
        listEl.classList.toggle("is-v-overflowing", overflowY);
      }
      if (shelfPrevBtn && lastPrevHidden !== true) {
        lastPrevHidden = true;
        shelfPrevBtn.classList.add("is-hidden");
      }
      if (shelfNextBtn && lastNextHidden !== true) {
        lastNextHidden = true;
        shelfNextBtn.classList.add("is-hidden");
      }
      return;
    }

    if (lastOverflowY !== false) {
      lastOverflowY = false;
      listEl.classList.remove("is-v-overflowing");
    }
    const maxScroll = Math.max(0, listEl.scrollWidth - listEl.clientWidth);
    const overflowX = maxScroll > 6;
    if (overflowX !== lastOverflowX) {
      lastOverflowX = overflowX;
      listEl.classList.toggle("is-overflowing", overflowX);
    }
    updateShelfNav(listEl.scrollLeft, maxScroll);
  }

  function renderCategories() {
    if (!categoriesEl) return;
    categoriesEl.innerHTML = "";

    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "build-cat-btn" + (cat.id === activeCategory ? " active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", cat.id === activeCategory ? "true" : "false");
      btn.setAttribute("data-category", cat.id);
      const catIcon = document.createElement("img");
      catIcon.className = "build-cat-icon";
      catIcon.src = cat.iconSrc;
      catIcon.alt = "";
      catIcon.draggable = false;
      const catLabel = document.createElement("span");
      catLabel.className = "build-cat-label";
      catLabel.textContent = cat.label;
      btn.appendChild(catIcon);
      btn.appendChild(catLabel);
      btn.addEventListener("click", function () {
        if (listDragScroller) listDragScroller.stopGlide();
        activeCategory = cat.id;
        renderCategories();
        renderBuildingCards();
      });
      categoriesEl.appendChild(btn);
    }
  }

  /** Create a compact icon+label stat or terrain pill for a building card. */
  function createCardInfoChip(chipClass, iconClass, iconSrc, labelClass, labelText, attrName, attrVal) {
    const chip = document.createElement("span");
    chip.className = chipClass;
    if (attrName) {
      chip.setAttribute(attrName, String(attrVal));
    }
    const icon = document.createElement("img");
    icon.className = iconClass;
    icon.src = iconSrc;
    icon.alt = "";
    icon.draggable = false;
    const label = document.createElement("span");
    label.className = labelClass;
    label.textContent = labelText;
    chip.appendChild(icon);
    chip.appendChild(label);
    return chip;
  }

  function showProtectedToast(buildingId, msgKey) {
    const b = getBuilding(buildingId);
    if (!b) return;
    showBuildErrorToast(
      "<span>" +
        '<img class="game-toast-icon" src="' + b.iconSrc + '" alt="" draggable="false" />' +
        t(msgKey, { building: '<strong class="game-toast-strong">' + b.name + "</strong>" }) +
        "</span>"
    );
  }

  function showPurchaseBlockedToast(b, planetId, placedId, biomeId) {
    const plId = placedId !== undefined ? placedId : currentPlacedId;
    if (isProtectedBuilding(plId)) {
      showProtectedToast(plId, "toast.cannot_replace_protected");
      return true;
    }
    if (!b || b.hiddenFromBuildMenu) return true;
    const researchLocked = isBuildingResearchLocked(b.id);
    if (researchLocked) {
      const bldImg = '<img class="game-toast-icon" src="' + b.iconSrc + '" alt="" draggable="false" />';
      const bldStrong = '<strong class="game-toast-strong">' + b.name + "</strong>";
      const resPill =
        '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="' +
        STAT_ICONS.research +
        '" alt="" draggable="false" /> ' +
        t("research.nodes." + b.requiredResearch + ".name") +
        "</span>";
      showBuildErrorToast(
        "<span>" + bldImg + t("toast.research_required", { building: bldStrong, research: resPill }) + "</span>"
      );
      return true;
    }

    const pId = planetId !== undefined && planetId !== null ? planetId : currentPlanetId;
    if (isBuildingPlanetLimitReached(b.id, pId, plId)) {
      const bldImg = '<img class="game-toast-icon" src="' + b.iconSrc + '" alt="" draggable="false" />';
      const bldStrong = '<strong class="game-toast-strong">' + b.name + "</strong>";
      showBuildErrorToast(
        "<span>" + bldImg + t("toast.planet_limit_reached", { building: bldStrong, limit: b.maxPerPlanet }) + "</span>"
      );
      return true;
    }

    const bId = biomeId || currentBiomeId;
    if (bId && !canBuildOnBiome(b.id, bId)) {
      const currentBiome = getBiome(bId);
      const terrain = getTerrainGroup(b.terrain);
      const bldImg = '<img class="game-toast-icon" src="' + b.iconSrc + '" alt="" draggable="false" />';
      const bldStrong = '<strong class="game-toast-strong">' + b.name + "</strong>";
      const terrainPill =
        '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="' +
        terrain.iconSrc +
        '" alt="" draggable="false" /> ' +
        terrain.label +
        "</span>";
      const biomePill =
        '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="' +
        currentBiome.iconSrc +
        '" alt="" draggable="false" /> ' +
        currentBiome.name +
        "</span>";

      const reasonText =
        currentBiome.terrains.length === 0
          ? t("toast.cannot_build_unbuildable", {
              building: bldStrong,
              biome: biomePill
            })
          : t("toast.cannot_build_terrain", {
              building: bldStrong,
              biome: biomePill,
              terrain: terrainPill
            });
      showBuildErrorToast("<span>" + bldImg + reasonText + "</span>");
      return true;
    }

    if (!canAffordBuilding(b.id, pId)) {
      const bldImg = '<img class="game-toast-icon" src="' + b.iconSrc + '" alt="" draggable="false" />';
      const bldStrong = '<strong class="game-toast-strong">' + b.name + "</strong>";
      const missing = [];
      const bCost = getBuildingCost(b.id);
      const costOrder = ["credits", "bricks", "ore"];
      for (let c = 0; c < costOrder.length; c++) {
        const key = costOrder[c];
        const req = bCost && bCost[key];
        if (!req || req <= 0) continue;
        const has = getAvailableCurrencyAmount(key, pId);
        if (has < req) {
          const diff = req - has;
          const cIcon = CURRENCY_ICONS[key];
          const cLabel = key === "credits" ? t("currencies.credits") : (key === "bricks" ? t("currencies.bricks") : t("currencies.ore"));
          missing.push(
            '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="' +
              cIcon +
              '" alt="" draggable="false" /> ' +
              formatCostValue(diff) +
              " " +
              cLabel +
              "</span>"
          );
        }
      }
      if (missing.length > 0) {
        showBuildErrorToast(
          "<span>" +
            bldImg +
            t("toast.cannot_afford", {
              building: bldStrong,
              missing: missing.join(t("toast.missing_joiner"))
            }) +
            "</span>"
        );
      }
      return true;
    }

    return false;
  }

  function renderBuildingCards() {
    if (!listEl) return;
    listEl.innerHTML = "";

    const tileProtected = isProtectedBuilding(currentPlacedId);
    const entries = [];
    for (let i = 0; i < BUILDINGS.length; i++) {
      const b = BUILDINGS[i];
      if (tileProtected) {
        if (b.id !== currentPlacedId) continue;
      } else {
        if (b.hiddenFromBuildMenu) continue;
        if (activeCategory !== "all" && b.category !== activeCategory) {
          continue;
        }
      }
      const isBuilt = currentPlacedId === b.id;
      const researchLocked = isBuildingResearchLocked(b.id);
      const limitBlocked = !isBuilt && isBuildingPlanetLimitReached(b.id, currentPlanetId, currentPlacedId);
      const terrainOk = canBuildOnBiome(b.id, currentBiomeId);
      const affordable = canAffordBuilding(b.id);
      const rank = isBuilt ? 0 : !researchLocked && !limitBlocked && terrainOk ? 1 : 2;
      entries.push({
        b: b,
        idx: i,
        isBuilt: isBuilt,
        researchLocked: researchLocked,
        limitBlocked: limitBlocked,
        terrainOk: terrainOk,
        affordable: affordable,
        rank: rank
      });
    }

    entries.sort(function (a, c) {
      if (a.rank !== c.rank) return a.rank - c.rank;
      return a.idx - c.idx;
    });

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const b = entry.b;
      const isBuilt = entry.isBuilt;
      const isProtectedCard = isProtectedBuilding(b.id);
      const researchLocked = entry.researchLocked;
      const limitBlocked = entry.limitBlocked;
      const terrain = getTerrainGroup(b.terrain);
      const terrainOk = entry.terrainOk;
      const affordable = entry.affordable;
      const canPurchase = !isProtectedCard && !isBuilt && !researchLocked && !limitBlocked && terrainOk && affordable;

      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "build-card" +
        (isBuilt ? " is-built" : "") +
        (isProtectedCard ? " build-card--protected" : "") +
        (!isBuilt && researchLocked ? " is-research-locked" : "") +
        (!isBuilt && !researchLocked && limitBlocked ? " is-limit-blocked" : "") +
        (!isBuilt && !researchLocked && !limitBlocked && !terrainOk ? " is-terrain-blocked" : "") +
        (!isBuilt && !researchLocked && !limitBlocked && terrainOk && !affordable ? " is-unaffordable" : "");
      card.setAttribute("data-building", b.id);
      card.setAttribute("data-category", b.category);
      card.setAttribute("data-terrain", b.terrain);
      card.setAttribute("aria-disabled", canPurchase || isBuilt ? "false" : "true");
      card.style.setProperty("--cat-accent", b.accent);

      const stage = document.createElement("span");
      stage.className = "build-card-stage";

      if (isBuilt) {
        const badge = document.createElement("span");
        badge.className = "build-card-badge is-built";
        badge.textContent = t("build.built_badge");
        stage.appendChild(badge);
      }

      const cat = getCategory(b.category);
      const catBadge = document.createElement("span");
      catBadge.className = "build-card-cat-badge";
      catBadge.title = cat.label;
      catBadge.setAttribute("data-category-badge", cat.id);
      catBadge.style.setProperty("--cat-badge-bg", cat.badgeBg);
      catBadge.style.setProperty("--cat-badge-accent", cat.accent);
      const catBadgeIcon = document.createElement("img");
      catBadgeIcon.className = "build-card-cat-icon";
      catBadgeIcon.src = cat.iconSrc;
      catBadgeIcon.alt = "";
      catBadgeIcon.draggable = false;
      catBadge.appendChild(catBadgeIcon);
      stage.appendChild(catBadge);

      const preview = document.createElement("span");
      preview.className = "build-card-preview";
      const icon = document.createElement("img");
      icon.className = "build-card-icon";
      icon.src = b.iconSrc;
      icon.alt = "";
      icon.draggable = false;
      preview.appendChild(icon);
      stage.appendChild(preview);

      if (b.energyRequired && b.energyRequired > 0) {
        const reqBadge = createCardInfoChip(
          "build-card-energy-req",
          "build-card-energy-req-icon",
          STAT_ICONS.energy,
          "build-card-energy-req-label",
          t("build.energy_req_short", { count: formatCostValue(b.energyRequired) })
        );
        reqBadge.title = formatEnergyReq(b.energyRequired);
        stage.appendChild(reqBadge);
      }

      if (b.citizensRequired && b.citizensRequired > 0) {
        const citReqBadge = createCardInfoChip(
          "build-card-citizen-req",
          "build-card-citizen-req-icon",
          STAT_ICONS.citizens,
          "build-card-citizen-req-label",
          t("build.citizen_req_short", { count: formatCostValue(b.citizensRequired) })
        );
        citReqBadge.title = formatCitizenReq(b.citizensRequired);
        stage.appendChild(citReqBadge);
      }

      const info = document.createElement("span");
      info.className = "build-card-info";

      const nameEl = document.createElement("span");
      nameEl.className = "build-card-name";
      nameEl.textContent = b.name;
      info.appendChild(nameEl);

      const showInvalidTerrain = !isBuilt && !terrainOk;
      if (isProtectedCard) {
        const multiWrap = document.createElement("span");
        multiWrap.className = "build-card-multi-chips";
        if (b.citizenSlots && b.citizenSlots > 0) {
          multiWrap.appendChild(
            createCardInfoChip(
              "build-citizen-chip",
              "build-citizen-icon",
              STAT_ICONS.citizens,
              "build-citizen-label",
              formatCitizenGain(b.citizenSlots)
            )
          );
        }
        if (b.energySlots && b.energySlots > 0) {
          multiWrap.appendChild(
            createCardInfoChip(
              "build-energy-chip",
              "build-energy-icon",
              STAT_ICONS.energy,
              "build-energy-label",
              formatEnergyGain(b.energySlots)
            )
          );
        }
        if (b.bricksPerSec && b.bricksPerSec > 0) {
          multiWrap.appendChild(
            createCardInfoChip(
              "build-bricks-chip",
              "build-bricks-icon",
              STAT_ICONS.bricks,
              "build-bricks-label",
              formatProductionRate(b.bricksPerSec)
            )
          );
        }
        info.appendChild(multiWrap);
      } else if (!isBuilt && researchLocked) {
        info.appendChild(
          createCardInfoChip(
            "build-lock-chip",
            "build-research-icon",
            STAT_ICONS.research,
            "build-research-label",
            t("build.requires_research_chip")
          )
        );
      } else if (!isBuilt && limitBlocked) {
        info.appendChild(
          createCardInfoChip(
            "build-limit-chip",
            "build-research-icon",
            STAT_ICONS.research,
            "build-research-label",
            t("build.max_per_planet", { limit: b.maxPerPlanet })
          )
        );
      } else if (!showInvalidTerrain && b.citizenSlots && b.citizenSlots > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-citizen-chip",
            "build-citizen-icon",
            STAT_ICONS.citizens,
            "build-citizen-label",
            formatCitizenGain(b.citizenSlots),
            "data-citizen-slots",
            b.citizenSlots
          )
        );
      } else if (!showInvalidTerrain && b.energySlots && b.energySlots > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-energy-chip",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            formatEnergyGain(b.energySlots),
            "data-energy-slots",
            b.energySlots
          )
        );
      } else if (!showInvalidTerrain && b.bricksPerSec && b.bricksPerSec > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-bricks-chip",
            "build-bricks-icon",
            STAT_ICONS.bricks,
            "build-bricks-label",
            formatProductionRate(b.bricksPerSec),
            "data-bricks-rate",
            b.bricksPerSec
          )
        );
      } else if (!showInvalidTerrain && b.researchPerSec && b.researchPerSec > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-research-chip",
            "build-research-icon",
            STAT_ICONS.research,
            "build-research-label",
            formatProductionRate(b.researchPerSec),
            "data-research-rate",
            b.researchPerSec
          )
        );
      } else if (!showInvalidTerrain && getBuildingOrePerSec(b) > 0) {
        const orePerSec = getBuildingOrePerSec(b);
        info.appendChild(
          createCardInfoChip(
            "build-ore-chip",
            "build-ore-icon",
            STAT_ICONS.ore,
            "build-ore-label",
            formatProductionRate(orePerSec),
            "data-ore-rate",
            orePerSec
          )
        );
      } else if (!showInvalidTerrain && b.rocketTier) {
        info.appendChild(
          createCardInfoChip(
            "build-specialty-chip",
            "build-terrain-icon",
            b.specialtyIconSrc || b.iconSrc,
            "build-terrain-label",
            t("rocket.tier_chip", { tier: b.rocketTier })
          )
        );
      } else if (!showInvalidTerrain && b.tradeVariant) {
        info.appendChild(
          createCardInfoChip(
            "build-trade-chip",
            "build-bricks-icon",
            CURRENCY_ICONS.credits,
            "build-bricks-label",
            t("trade.rate_chip", {
              bricks: formatCostValue(b.bricksPerLaunch),
              credits: formatCostValue(b.bricksPerLaunch * b.creditsPerBrick)
            })
          )
        );
      } else {
        info.appendChild(
          createCardInfoChip(
            "build-terrain-chip " + (terrainOk ? "is-valid" : "is-invalid"),
            "build-terrain-icon",
            terrain.iconSrc,
            "build-terrain-label",
            terrain.label
          )
        );
      }

      const actionBtn = document.createElement("span");
      actionBtn.className = "build-card-action";

      if (isProtectedCard) {
        const permLbl = document.createElement("span");
        permLbl.className = "build-built-label";
        permLbl.textContent = t("build.permanent_badge");
        actionBtn.appendChild(permLbl);
      } else if (isBuilt) {
        const builtLbl = document.createElement("span");
        builtLbl.className = "build-built-label";
        builtLbl.textContent = t("build.built_badge");
        actionBtn.appendChild(builtLbl);
      } else {
        renderCostItems(actionBtn, getBuildingCost(b.id), currentPlanetId);
      }

      card.appendChild(stage);
      card.appendChild(info);
      card.appendChild(actionBtn);

      card.addEventListener("click", function () {
        if (isProtectedCard) {
          showProtectedToast(b.id, "toast.cannot_replace_protected");
          return;
        }
        if (isBuilt) return;
        if (isProtectedBuilding(currentPlacedId)) {
          showProtectedToast(currentPlacedId, "toast.cannot_replace_protected");
          return;
        }
        if (!canPurchase) {
          card.classList.remove("is-shake");
          void card.offsetWidth;
          card.classList.add("is-shake");
          window.setTimeout(function () {
            card.classList.remove("is-shake");
          }, 280);

          showPurchaseBlockedToast(b, currentPlanetId, currentPlacedId, currentBiomeId);
          return;
        }
        if (typeof callbacks.onPlace === "function") {
          openConfirmScene(b.id);
        }
      });

      listEl.appendChild(card);
    }

    syncShelfScroll();
    window.requestAnimationFrame(syncShelfScroll);
  }

  function syncRemoveButton() {
    if (removeBtn) {
      removeBtn.classList.toggle("is-hidden", !currentPlacedId || isProtectedBuilding(currentPlacedId));
    }
  }

  function syncConfirmState() {
    const b = pendingConfirmBuildingId ? getBuilding(pendingConfirmBuildingId) : null;
    if (!b) return;
    if (confirmCostsEl) {
      confirmCostsEl.innerHTML = "";
      renderCostItems(confirmCostsEl, getBuildingCost(b.id), currentPlanetId);
      confirmCostsEl.classList.toggle("is-hidden", confirmCostsEl.childNodes.length === 0);
    }
    if (confirmBuildBtn) {
      const canConfirm =
        !isBuildingResearchLocked(b.id) &&
        !isBuildingPlanetLimitReached(b.id, currentPlanetId, currentPlacedId) &&
        canBuildOnBiome(b.id, currentBiomeId) &&
        canAffordBuilding(b.id, currentPlanetId);
      confirmBuildBtn.classList.toggle("is-disabled", !canConfirm);
    }
  }

  function openConfirmScene(buildingId) {
    if (isProtectedBuilding(currentPlacedId)) {
      showProtectedToast(currentPlacedId, "toast.cannot_replace_protected");
      return;
    }
    const b = getBuilding(buildingId);
    if (!b || b.hiddenFromBuildMenu) return;

    pendingConfirmBuildingId = b.id;
    if (listDragScroller) listDragScroller.cancel();
    if (catDragScroller) catDragScroller.cancel();

    const cat = getCategory(b.category);
    const terrain = getTerrainGroup(b.terrain);

    if (confirmStageEl) {
      confirmStageEl.style.setProperty("--cat-accent", b.accent);
    }
    if (confirmCatBadgeEl) {
      confirmCatBadgeEl.title = cat.label;
      confirmCatBadgeEl.setAttribute("data-category-badge", cat.id);
      confirmCatBadgeEl.style.setProperty("--cat-badge-bg", cat.badgeBg);
      confirmCatBadgeEl.style.setProperty("--cat-badge-accent", cat.accent);
    }
    if (confirmCatIconEl) {
      confirmCatIconEl.src = cat.iconSrc;
    }
    if (confirmIconEl) {
      confirmIconEl.src = b.iconSrc;
    }
    if (confirmNameEl) {
      confirmNameEl.textContent = b.name;
    }

    if (confirmBadgesEl) {
      confirmBadgesEl.innerHTML = "";
      confirmBadgesEl.appendChild(
        createCardInfoChip(
          "build-confirm-cat-chip",
          "build-terrain-icon",
          cat.iconSrc,
          "build-terrain-label",
          cat.label
        )
      );
      confirmBadgesEl.appendChild(
        createCardInfoChip(
          "build-terrain-chip is-valid",
          "build-terrain-icon",
          terrain.iconSrc,
          "build-terrain-label",
          terrain.label
        )
      );
      if (b.citizenSlots && b.citizenSlots > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-citizen-chip",
            "build-citizen-icon",
            STAT_ICONS.citizens,
            "build-citizen-label",
            formatCitizenGain(b.citizenSlots),
            "data-citizen-slots",
            b.citizenSlots
          )
        );
      } else if (b.energySlots && b.energySlots > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-energy-chip",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            formatEnergyGain(b.energySlots),
            "data-energy-slots",
            b.energySlots
          )
        );
      } else if (b.bricksPerSec && b.bricksPerSec > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-bricks-chip",
            "build-bricks-icon",
            STAT_ICONS.bricks,
            "build-bricks-label",
            formatProductionRate(b.bricksPerSec),
            "data-bricks-rate",
            b.bricksPerSec
          )
        );
      } else if (b.researchPerSec && b.researchPerSec > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-research-chip",
            "build-research-icon",
            STAT_ICONS.research,
            "build-research-label",
            formatProductionRate(b.researchPerSec),
            "data-research-rate",
            b.researchPerSec
          )
        );
      } else if (getBuildingOrePerSec(b) > 0) {
        const orePerSec = getBuildingOrePerSec(b);
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-ore-chip",
            "build-ore-icon",
            STAT_ICONS.ore,
            "build-ore-label",
            formatProductionRate(orePerSec),
            "data-ore-rate",
            orePerSec
          )
        );
      } else if (b.specialtyLabel && b.specialtyIconSrc) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-specialty-chip",
            "build-terrain-icon",
            b.specialtyIconSrc,
            "build-terrain-label",
            b.specialtyLabel
          )
        );
        if (b.rocketTier) {
          confirmBadgesEl.appendChild(
            createCardInfoChip(
              "build-citizen-chip",
              "build-citizen-icon",
              STAT_ICONS.citizens,
              "build-citizen-label",
              t("rocket.crew_chip", { count: b.rocketCitizens })
            )
          );
          confirmBadgesEl.appendChild(
            createCardInfoChip(
              "build-bricks-chip",
              "build-bricks-icon",
              STAT_ICONS.bricks,
              "build-bricks-label",
              t("rocket.bricks_cap_chip", { max: formatCostValue(b.rocketMaxBricks) })
            )
          );
        }
        if (b.tradeVariant) {
          const earnedPerLaunch = b.bricksPerLaunch * b.creditsPerBrick;
          const scPerSec = earnedPerLaunch / b.tradeIntervalSec;
          confirmBadgesEl.appendChild(
            createCardInfoChip(
              "build-trade-chip",
              "build-bricks-icon",
              CURRENCY_ICONS.credits,
              "build-bricks-label",
              t("trade.rate_chip", {
                bricks: formatCostValue(b.bricksPerLaunch),
                credits: formatCostValue(earnedPerLaunch)
              })
            )
          );
          confirmBadgesEl.appendChild(
            createCardInfoChip(
              "build-energy-chip",
              "build-energy-icon",
              CURRENCY_ICONS.credits,
              "build-energy-label",
              t("trade.speed_chip", {
                sec: formatRateNumber(b.tradeIntervalSec),
                rate: formatRateNumber(scPerSec)
              })
            )
          );
        }
      }
      if (b.maxPerPlanet) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-limit-chip",
            "build-research-icon",
            STAT_ICONS.research,
            "build-research-label",
            t("build.max_per_planet", { limit: b.maxPerPlanet })
          )
        );
      }
      if (b.costScaling) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-limit-chip",
            "build-ore-icon",
            STAT_ICONS.ore,
            "build-research-label",
            t("build.owned_scaling_chip", { count: getOwnedBuildingCount(b.id) })
          )
        );
      }
      if (b.energyRequired && b.energyRequired > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-energy-chip is-req",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            formatEnergyReq(b.energyRequired),
            "data-energy-req",
            b.energyRequired
          )
        );
      }
      if (b.citizensRequired && b.citizensRequired > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-citizen-chip is-req",
            "build-citizen-icon",
            STAT_ICONS.citizens,
            "build-citizen-label",
            formatCitizenReq(b.citizensRequired),
            "data-citizen-req",
            b.citizensRequired
          )
        );
      }
    }

    if (confirmDescEl) {
      confirmDescEl.textContent = b.description || "";
    }

    if (confirmReplaceEl) {
      if (currentPlacedId && currentPlacedId !== b.id) {
        const existing = getBuilding(currentPlacedId);
        confirmReplaceEl.textContent = t("build.replace_notice", {
          building: existing ? existing.name : t("build.replace_fallback_building")
        });
        confirmReplaceEl.classList.remove("is-hidden");
      } else {
        confirmReplaceEl.textContent = "";
        confirmReplaceEl.classList.add("is-hidden");
      }
    }

    syncConfirmState();

    if (drawerEl) {
      drawerEl.classList.add("is-confirming");
      drawerEl.setAttribute("data-confirm-building", b.id);
    }
    if (confirmSceneEl) {
      confirmSceneEl.classList.remove("is-hidden");
      confirmSceneEl.setAttribute("aria-hidden", "false");
    }
  }

  function closeConfirmScene() {
    if (!pendingConfirmBuildingId && (!drawerEl || !drawerEl.classList.contains("is-confirming"))) {
      return;
    }
    pendingConfirmBuildingId = null;
    if (drawerEl) {
      drawerEl.classList.remove("is-confirming");
      drawerEl.removeAttribute("data-confirm-building");
    }
    if (confirmSceneEl) {
      confirmSceneEl.classList.add("is-hidden");
      confirmSceneEl.setAttribute("aria-hidden", "true");
    }
    syncRemoveButton();
    syncShelfScroll();
    window.requestAnimationFrame(syncShelfScroll);
  }

  function openForTile(planetId, tileId, placedBuildingId, biomeId) {
    closeConfirmScene();
    currentPlanetId = planetId;
    currentTileId = tileId;
    currentPlacedId = placedBuildingId || null;

    const biome = getBiome(biomeId);
    currentBiomeId = biome.id;

    if (biomeBadgeEl) {
      biomeBadgeEl.style.setProperty("--biome-accent", biome.accent);
      biomeBadgeEl.style.setProperty("--biome-bg", biome.badgeBg);
    }
    if (biomeIconEl) {
      biomeIconEl.src = biome.iconSrc;
    }
    if (titleEl) {
      titleEl.textContent = biome.name;
    }

    if (listDragScroller) listDragScroller.cancel();
    if (catDragScroller) catDragScroller.cancel();

    syncUnbuildableBanner(biome);
    syncRemoveButton();
    renderCategories();
    renderBuildingCards();
    if (listEl) {
      listEl.scrollTop = 0;
      listEl.scrollLeft = 0;
    }

    menuOpen = true;
    if (drawerEl) {
      drawerEl.setAttribute("data-biome", biome.id);
      drawerEl.classList.toggle("is-protected-tile", isProtectedBuilding(currentPlacedId));
      drawerEl.classList.add("is-open");
      drawerEl.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("build-menu-open");

    syncShelfScroll();
    window.requestAnimationFrame(syncShelfScroll);
  }

  function requestUpgradeForTile(planetId, tileId, placedBuildingId, biomeId, targetBuildingId) {
    if (isProtectedBuilding(placedBuildingId)) {
      showProtectedToast(placedBuildingId, "toast.cannot_replace_protected");
      return false;
    }
    const nextDef = targetBuildingId
      ? getBuilding(targetBuildingId)
      : getNextUpgradeBuilding(placedBuildingId, biomeId);
    if (!nextDef) return false;
    if (showPurchaseBlockedToast(nextDef, planetId, placedBuildingId, biomeId)) {
      return false;
    }
    if (!menuOpen || currentPlanetId !== planetId || currentTileId !== tileId || currentPlacedId !== placedBuildingId) {
      openForTile(planetId, tileId, placedBuildingId, biomeId);
    }
    openConfirmScene(nextDef.id);
    return true;
  }

  function updateCurrentBuilding(placedBuildingId) {
    currentPlacedId = placedBuildingId || null;
    syncRemoveButton();
    if (menuOpen) {
      renderBuildingCards();
    }
  }

  function close(notifyHandler) {
    closeConfirmScene();
    if (listDragScroller) listDragScroller.cancel();
    if (catDragScroller) catDragScroller.cancel();
    if (scrollSyncRaf) {
      window.cancelAnimationFrame(scrollSyncRaf);
      scrollSyncRaf = 0;
    }
    if (!menuOpen && (!drawerEl || !drawerEl.classList.contains("is-open"))) {
      return;
    }
    menuOpen = false;
    currentTileId = null;
    currentPlacedId = null;
    currentBiomeId = null;
    if (drawerEl) {
      drawerEl.classList.remove("is-open");
      drawerEl.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("build-menu-open");

    if (notifyHandler && typeof callbacks.onClose === "function") {
      callbacks.onClose();
    }
  }

  function isOpen() {
    return menuOpen;
  }

  function getLayoutBounds() {
    if (!menuOpen || !drawerEl) {
      return { open: false, mode: "none", width: 0, height: 0 };
    }
    return {
      open: true,
      mode: isCompactRightMode() ? "right" : "bottom",
      width: drawerEl.offsetWidth || 0,
      height: drawerEl.offsetHeight || 0
    };
  }

  function setHandlers(handlers) {
    callbacks = handlers || {};
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      close(true);
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      if (isProtectedBuilding(currentPlacedId)) {
        showProtectedToast(currentPlacedId, "toast.cannot_demolish_protected");
        return;
      }
      if (typeof callbacks.onRemove === "function") {
        callbacks.onRemove();
      }
    });
  }

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener("click", function () {
      closeConfirmScene();
    });
  }

  if (confirmBuildBtn) {
    confirmBuildBtn.addEventListener("click", function () {
      if (isProtectedBuilding(currentPlacedId)) {
        showProtectedToast(currentPlacedId, "toast.cannot_replace_protected");
        closeConfirmScene();
        return;
      }
      const bId = pendingConfirmBuildingId;
      if (!bId) return;
      const b = getBuilding(bId);
      if (
        !b ||
        b.hiddenFromBuildMenu ||
        isBuildingResearchLocked(bId) ||
        isBuildingPlanetLimitReached(bId, currentPlanetId, currentPlacedId) ||
        !canBuildOnBiome(bId, currentBiomeId)
      ) {
        showPurchaseBlockedToast(b, currentPlanetId, currentPlacedId, currentBiomeId);
        closeConfirmScene();
        renderBuildingCards();
        return;
      }
      if (!canAffordBuilding(bId)) {
        showPurchaseBlockedToast(b, currentPlanetId, currentPlacedId, currentBiomeId);
        return;
      }
      closeConfirmScene();
      if (typeof callbacks.onPlace === "function") {
        callbacks.onPlace(bId);
      }
    });
  }

  function createDragScroller(el, getAxis, onScrollPosition) {
    const DRAG_THRESHOLD_PX = 6;
    const INERTIA_MIN_VEL = 0.14;
    const INERTIA_STOP_VEL = 0.03;
    const INERTIA_DECAY = 6.5;

    let active = false;
    let dragging = false;
    let pointerId = null;
    let axis = "x";
    let startX = 0;
    let startY = 0;
    let maxScroll = 0;
    let anchorPos = 0;
    let anchorScroll = 0;
    let currentScroll = 0;
    let targetScroll = 0;
    let lastFrameScroll = 0;
    let lastFrameTime = 0;
    let lastMoveTime = 0;
    let velocity = 0;
    let dragRaf = 0;
    let glideRaf = 0;
    let lastGlideTime = 0;
    let suppressClick = false;
    let suppressTimer = 0;

    function stopGlide() {
      if (glideRaf) {
        window.cancelAnimationFrame(glideRaf);
        glideRaf = 0;
      }
    }

    function cancel() {
      stopGlide();
      if (dragRaf) {
        window.cancelAnimationFrame(dragRaf);
        dragRaf = 0;
      }
      if (dragging && pointerId !== null && el.releasePointerCapture) {
        try {
          el.releasePointerCapture(pointerId);
        } catch (_) { }
      }
      active = false;
      dragging = false;
      pointerId = null;
      el.classList.remove("is-dragging");
    }

    function startGlide(glideAxis, startPos, cachedMaxScroll, initVel) {
      stopGlide();
      let pos = startPos;
      let glideVel = Math.max(-3.5, Math.min(3.5, initVel));
      lastGlideTime = performance.now();

      function step(now) {
        const dtMs = Math.min(48, Math.max(1, now - lastGlideTime));
        const dtSec = dtMs / 1000;
        lastGlideTime = now;

        const next = pos + glideVel * dtMs;
        const clamped = next < 0 ? 0 : next > cachedMaxScroll ? cachedMaxScroll : next;
        pos = clamped;

        if (glideAxis === "y") {
          el.scrollTop = pos;
        } else {
          el.scrollLeft = pos;
        }

        if (typeof onScrollPosition === "function") {
          onScrollPosition(pos, cachedMaxScroll);
        }

        if (clamped !== next || Math.abs(glideVel) < INERTIA_STOP_VEL) {
          stopGlide();
          return;
        }

        glideVel *= Math.exp(-INERTIA_DECAY * dtSec);
        glideRaf = window.requestAnimationFrame(step);
      }

      glideRaf = window.requestAnimationFrame(step);
    }

    function flushDrag(now) {
      dragRaf = 0;
      if (!dragging) return;

      const dtMs = Math.max(1, now - lastFrameTime);
      const instVel = (targetScroll - lastFrameScroll) / dtMs;
      velocity = velocity * 0.45 + instVel * 0.55;
      lastFrameScroll = targetScroll;
      lastFrameTime = now;

      if (targetScroll !== currentScroll) {
        currentScroll = targetScroll;
        if (axis === "y") {
          el.scrollTop = currentScroll;
        } else {
          el.scrollLeft = currentScroll;
        }
        if (typeof onScrollPosition === "function") {
          onScrollPosition(currentScroll, maxScroll);
        }
      }
    }

    el.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    el.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.pointerType === "touch") return;

      if (suppressTimer) {
        window.clearTimeout(suppressTimer);
        suppressTimer = 0;
      }
      suppressClick = false;
      stopGlide();

      axis = typeof getAxis === "function" ? getAxis() : "x";
      maxScroll = axis === "y"
        ? Math.max(0, el.scrollHeight - el.clientHeight)
        : Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= 2) return;

      active = true;
      dragging = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      lastMoveTime = performance.now();
      velocity = 0;
    });

    window.addEventListener(
      "pointermove",
      function (e) {
        if (!active || e.pointerId !== pointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const primaryDelta = axis === "y" ? dy : dx;
        const curPos = axis === "y" ? e.clientY : e.clientX;

        if (!dragging) {
          if (Math.abs(primaryDelta) < DRAG_THRESHOLD_PX) return;
          dragging = true;
          anchorPos = curPos;
          anchorScroll = axis === "y" ? el.scrollTop : el.scrollLeft;
          currentScroll = anchorScroll;
          targetScroll = anchorScroll;
          lastFrameScroll = anchorScroll;
          lastFrameTime = performance.now();
          lastMoveTime = lastFrameTime;
          velocity = 0;
          el.classList.add("is-dragging");
          if (el.setPointerCapture) {
            try {
              el.setPointerCapture(pointerId);
            } catch (_) { }
          }
        }

        const raw = anchorScroll - (curPos - anchorPos);
        targetScroll = raw < 0 ? 0 : raw > maxScroll ? maxScroll : raw;
        lastMoveTime = performance.now();

        if (!dragRaf) {
          dragRaf = window.requestAnimationFrame(flushDrag);
        }
      },
      { passive: true }
    );

    function finishPointer(e, wasCanceled) {
      if (!active || e.pointerId !== pointerId) return;

      const wasDragging = dragging;
      const releaseAxis = axis;
      const releaseMax = maxScroll;
      const releaseIdleMs = performance.now() - lastMoveTime;

      if (dragRaf) {
        window.cancelAnimationFrame(dragRaf);
        dragRaf = 0;
        if (wasDragging && targetScroll !== currentScroll) {
          const now = performance.now();
          const dtMs = Math.max(1, now - lastFrameTime);
          const instVel = (targetScroll - lastFrameScroll) / dtMs;
          velocity = velocity * 0.45 + instVel * 0.55;
          currentScroll = targetScroll;
          if (releaseAxis === "y") {
            el.scrollTop = currentScroll;
          } else {
            el.scrollLeft = currentScroll;
          }
          if (typeof onScrollPosition === "function") {
            onScrollPosition(currentScroll, releaseMax);
          }
        }
      }

      const releaseVel = velocity;

      if (wasDragging && el.releasePointerCapture) {
        try {
          el.releasePointerCapture(pointerId);
        } catch (_) { }
      }

      active = false;
      dragging = false;
      pointerId = null;
      el.classList.remove("is-dragging");

      if (wasDragging) {
        suppressClick = true;
        if (suppressTimer) {
          window.clearTimeout(suppressTimer);
        }
        suppressTimer = window.setTimeout(function () {
          suppressClick = false;
          suppressTimer = 0;
        }, 140);

        if (!wasCanceled && releaseIdleMs < 85 && Math.abs(releaseVel) >= INERTIA_MIN_VEL) {
          startGlide(releaseAxis, currentScroll, releaseMax, releaseVel);
        }

        if (typeof onScrollPosition === "function") {
          onScrollPosition(currentScroll, releaseMax);
        }
      }
    }

    window.addEventListener("pointerup", function (e) {
      finishPointer(e, false);
    });
    window.addEventListener("pointercancel", function (e) {
      finishPointer(e, true);
    });

    el.addEventListener(
      "click",
      function (e) {
        if (suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick = false;
          if (suppressTimer) {
            window.clearTimeout(suppressTimer);
            suppressTimer = 0;
          }
        }
      },
      true
    );

    return {
      stopGlide: stopGlide,
      cancel: cancel,
      isDriving: function () {
        return dragging || glideRaf !== 0;
      }
    };
  }

  listDragScroller = listEl
    ? createDragScroller(
        listEl,
        function () {
          return isCompactRightMode() ? "y" : "x";
        },
        function (scrollPos, maxScroll) {
          if (!isCompactRightMode()) {
            updateShelfNav(scrollPos, maxScroll);
          }
        }
      )
    : null;
  catDragScroller = categoriesEl
    ? createDragScroller(
        categoriesEl,
        function () {
          return "x";
        },
        null
      )
    : null;

  if (listEl) {
    listEl.addEventListener(
      "scroll",
      function () {
        if (listDragScroller && listDragScroller.isDriving()) return;
        if (!scrollSyncRaf) {
          scrollSyncRaf = window.requestAnimationFrame(function () {
            scrollSyncRaf = 0;
            syncShelfScroll();
          });
        }
      },
      { passive: true }
    );
    listEl.addEventListener(
      "wheel",
      function (e) {
        if (listDragScroller) listDragScroller.stopGlide();
        if (
          !isCompactRightMode() &&
          listEl.scrollWidth > listEl.clientWidth + 4 &&
          Math.abs(e.deltaY) > Math.abs(e.deltaX)
        ) {
          e.preventDefault();
          listEl.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );
  }

  if (shelfPrevBtn && listEl) {
    shelfPrevBtn.addEventListener("click", function () {
      if (listDragScroller) listDragScroller.stopGlide();
      listEl.scrollBy({ left: -220, behavior: "smooth" });
    });
  }

  if (shelfNextBtn && listEl) {
    shelfNextBtn.addEventListener("click", function () {
      if (listDragScroller) listDragScroller.stopGlide();
      listEl.scrollBy({ left: 220, behavior: "smooth" });
    });
  }

  window.addEventListener("resize", function () {
    if (menuOpen) {
      syncShelfScroll();
    }
  });

  if (window.GameCurrencies && typeof window.GameCurrencies.onChange === "function") {
    window.GameCurrencies.onChange(function () {
      if (menuOpen) {
        renderBuildingCards();
        if (pendingConfirmBuildingId) {
          syncConfirmState();
        }
      }
    });
  }

  if (window.GameResearch && typeof window.GameResearch.onChange === "function") {
    window.GameResearch.onChange(function () {
      if (menuOpen) {
        renderBuildingCards();
      }
    });
  }

  // --- 3D Local-Tangent-Space Mesh Helpers ---

  function dot3(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  function sub3(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  function cross3(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function norm3(v) {
    const l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
    return { x: v.x / l, y: v.y / l, z: v.z / l };
  }

  function clampByte(n) {
    return n < 0 ? 0 : n > 255 ? 255 : n | 0;
  }

  function shadeColor(rgb, n, lightDir, halfVec, atmo, opts) {
    const ndotl = Math.max(0, dot3(n, lightDir));
    const frontFill = 0.16 * Math.max(0, n.z);
    const emissive = opts.emissive || 0;
    const spec = opts.spec !== undefined ? opts.spec : 0.14;
    const lightAmt = Math.min(1.22, 0.30 + 0.78 * ndotl + frontFill + emissive * (1 - ndotl * 0.5));
    const specAmt = spec * Math.pow(Math.max(0, dot3(n, halfVec)), 18);
    const fresnel = Math.pow(Math.max(0, 1 - Math.max(0, n.z)), 2.8) * 0.22;

    const r = clampByte(Math.round(rgb[0] * lightAmt + 255 * specAmt + (atmo.r - rgb[0] * lightAmt) * fresnel));
    const g = clampByte(Math.round(rgb[1] * lightAmt + 255 * specAmt + (atmo.g - rgb[1] * lightAmt) * fresnel));
    const b = clampByte(Math.round(rgb[2] * lightAmt + 255 * specAmt + (atmo.b - rgb[2] * lightAmt) * fresnel));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function createMeshCollector(frame, buildScale, opts) {
    const o = opts || {};
    const primitives = [];
    const baseS = frame.scale * Math.max(0.05, buildScale);
    const sXY = baseS * (o.scaleXY !== undefined ? o.scaleXY : 1);
    const sZ = baseS * (o.scaleZ !== undefined ? o.scaleZ : 1);
    const jx = o.jitterX || 0;
    const jy = o.jitterY || 0;
    const ox = frame.origin.x;
    const oy = frame.origin.y;
    const oz = frame.origin.z;
    const t = frame.rotT;
    const b = frame.rotB;
    const n = frame.rotN;
    const camVec = frame.camVec;
    const lightDir = frame.lightDir;
    const halfVec = frame.halfVec;
    const atmo = frame.atmo;

    function toWorld(lx, ly, lz) {
      const wx = (lx + jx) * sXY;
      const wy = (ly + jy) * sXY;
      const wz = lz * sZ;
      return {
        x: ox + t.x * wx + b.x * wy + n.x * wz,
        y: oy + t.y * wx + b.y * wy + n.y * wz,
        z: oz + t.z * wx + b.z * wy + n.z * wz
      };
    }

    function addFace(localVerts, rgb, opts) {
      const o = opts || {};
      const count = localVerts.length;
      const wVerts = new Array(count);
      let cx = 0;
      let cy = 0;
      let cz = 0;

      for (let i = 0; i < count; i++) {
        const w = toWorld(localVerts[i][0], localVerts[i][1], localVerts[i][2]);
        wVerts[i] = w;
        cx += w.x;
        cy += w.y;
        cz += w.z;
      }
      cx /= count;
      cy /= count;
      cz /= count;
      const fc = { x: cx, y: cy, z: cz };

      let fn = norm3(cross3(sub3(wVerts[1], wVerts[0]), sub3(wVerts[2], wVerts[0])));

      if (o.refWorld) {
        if (dot3(fn, sub3(fc, o.refWorld)) < 0) {
          wVerts.reverse();
          fn = { x: -fn.x, y: -fn.y, z: -fn.z };
        }
      }

      const toCam = sub3(camVec, fc);
      const facing = dot3(fn, toCam);

      if (!o.doubleSided && facing <= 0) {
        return;
      }

      const litNormal = facing < 0 ? { x: -fn.x, y: -fn.y, z: -fn.z } : fn;
      const fill = shadeColor(rgb, litNormal, lightDir, halfVec, atmo, o);

      const pts = new Array(count);
      for (let i = 0; i < count; i++) {
        pts[i] = frame.project(wVerts[i], frame.cx, frame.cy, frame.focalLength);
      }

      primitives.push({
        type: "poly",
        pts: pts,
        fill: fill,
        stroke: o.stroke || fill,
        lineWidth: o.lineWidth || 0.7,
        depthZ: cz + (o.depthBias || 0)
      });
    }

    function addQuad(v0, v1, v2, v3, rgb, opts) {
      addFace([v0, v1, v2, v3], rgb, opts);
    }

    function addLine(a, bPt, stroke, lineWidth, depthBias) {
      const wa = toWorld(a[0], a[1], a[2]);
      const wb = toWorld(bPt[0], bPt[1], bPt[2]);
      primitives.push({
        type: "line",
        p0: frame.project(wa, frame.cx, frame.cy, frame.focalLength),
        p1: frame.project(wb, frame.cx, frame.cy, frame.focalLength),
        stroke: stroke,
        lineWidth: lineWidth || 1.2,
        depthZ: (wa.z + wb.z) * 0.5 + (depthBias || 0)
      });
    }

    function addBox(cx, cy, cz, hx, hy, hz, rgb, opts) {
      const refWorld = toWorld(cx, cy, cz);
      const o = Object.assign({}, opts || {}, { refWorld: refWorld });
      const x0 = cx - hx, x1 = cx + hx;
      const y0 = cy - hy, y1 = cy + hy;
      const z0 = cz - hz, z1 = cz + hz;

      addFace([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], rgb, o);
      addFace([[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], rgb, o);
      addFace([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], rgb, o);
      addFace([[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], rgb, o);
      addFace([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], rgb, o);
      addFace([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], rgb, o);
    }

    function addPrism(cx, cy, z0, z1, r0, r1, sides, rotAngle, rgb, opts) {
      const refWorld = toWorld(cx, cy, (z0 + z1) * 0.5);
      const o = Object.assign({}, opts || {}, { refWorld: refWorld });
      const angleOffset = rotAngle || 0;
      const topVerts = [];
      const botRing = [];
      const topRing = [];

      for (let i = 0; i < sides; i++) {
        const a = angleOffset + (Math.PI * 2 * i) / sides;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        botRing.push([cx + r0 * ca, cy + r0 * sa, z0]);
        topRing.push([cx + r1 * ca, cy + r1 * sa, z1]);
        topVerts.push([cx + r1 * ca, cy + r1 * sa, z1]);
      }

      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        if (r1 > 0.002) {
          addFace([botRing[i], botRing[next], topRing[next], topRing[i]], rgb, o);
        } else {
          addFace([botRing[i], botRing[next], [cx, cy, z1]], rgb, o);
        }
      }

      if (r1 > 0.002) {
        addFace(topVerts, rgb, o);
      }
    }

    function addDome(cx, cy, zBase, rx, ry, rz, rings, segs, rgb, opts) {
      const refWorld = toWorld(cx, cy, zBase);
      const o = Object.assign({}, opts || {}, { refWorld: refWorld });

      for (let r = 0; r < rings; r++) {
        const phi0 = (Math.PI * 0.5 * r) / rings;
        const phi1 = (Math.PI * 0.5 * (r + 1)) / rings;
        const c0 = Math.cos(phi0);
        const s0 = Math.sin(phi0);
        const c1 = Math.cos(phi1);
        const s1 = Math.sin(phi1);

        for (let k = 0; k < segs; k++) {
          const t0 = (Math.PI * 2 * k) / segs;
          const t1 = (Math.PI * 2 * (k + 1)) / segs;

          const p00 = [cx + rx * c0 * Math.cos(t0), cy + ry * c0 * Math.sin(t0), zBase + rz * s0];
          const p01 = [cx + rx * c0 * Math.cos(t1), cy + ry * c0 * Math.sin(t1), zBase + rz * s0];
          const p11 = [cx + rx * c1 * Math.cos(t1), cy + ry * c1 * Math.sin(t1), zBase + rz * s1];
          const p10 = [cx + rx * c1 * Math.cos(t0), cy + ry * c1 * Math.sin(t0), zBase + rz * s1];

          if (r === rings - 1) {
            addFace([p00, p01, [cx, cy, zBase + rz]], rgb, o);
          } else {
            addFace([p00, p01, p11, p10], rgb, o);
          }
        }
      }
    }

    function drawAll(ctx) {
      primitives.sort(function (a, bItem) {
        return a.depthZ - bItem.depthZ;
      });

      for (let i = 0; i < primitives.length; i++) {
        const p = primitives[i];
        if (p.type === "line") {
          ctx.beginPath();
          ctx.moveTo(p.p0.x, p.p0.y);
          ctx.lineTo(p.p1.x, p.p1.y);
          ctx.strokeStyle = p.stroke;
          ctx.lineWidth = p.lineWidth;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(p.pts[0].x, p.pts[0].y);
          for (let k = 1; k < p.pts.length; k++) {
            ctx.lineTo(p.pts[k].x, p.pts[k].y);
          }
          ctx.closePath();
          ctx.fillStyle = p.fill;
          ctx.fill();
          ctx.lineWidth = p.lineWidth;
          ctx.strokeStyle = p.stroke;
          ctx.stroke();
        }
      }
    }

    return {
      toWorld: toWorld,
      addQuad: addQuad,
      addLine: addLine,
      addBox: addBox,
      addPrism: addPrism,
      addDome: addDome,
      drawAll: drawAll
    };
  }

  // --- Five Procedural 3D Building Models ---

  function buildMineModel(m, time, phase, pxScale) {
    // Octagonal industrial foundation
    m.addPrism(0, 0, 0.0, 0.08, 0.56, 0.50, 8, Math.PI / 8, [71, 85, 105], { spec: 0.25 });
    // Glowing drill bore pit
    m.addPrism(0, 0, 0.08, 0.098, 0.23, 0.19, 8, 0, [245, 158, 11], { emissive: 0.55 });

    // 4 angled A-frame derrick legs
    const legSpan = 0.34;
    const crownSpan = 0.07;
    const legPairs = [
      [-legSpan, -legSpan, -crownSpan, -crownSpan],
      [legSpan, -legSpan, crownSpan, -crownSpan],
      [legSpan, legSpan, crownSpan, crownSpan],
      [-legSpan, legSpan, -crownSpan, crownSpan]
    ];
    const lw = Math.max(1.4, pxScale * 0.06);
    for (let i = 0; i < legPairs.length; i++) {
      const p = legPairs[i];
      m.addLine([p[0], p[1], 0.07], [p[2], p[3], 0.72], "#cbd5e1", lw);
    }
    // Cross-brace struts
    m.addLine([-0.20, -0.20, 0.38], [0.20, -0.20, 0.38], "#94a3b8", lw * 0.75);
    m.addLine([0.20, -0.20, 0.38], [0.20, 0.20, 0.38], "#94a3b8", lw * 0.75);
    m.addLine([0.20, 0.20, 0.38], [-0.20, 0.20, 0.38], "#94a3b8", lw * 0.75);
    m.addLine([-0.20, 0.20, 0.38], [-0.20, -0.20, 0.38], "#94a3b8", lw * 0.75);

    // Derrick crown block + pulsing amber beacon
    m.addBox(0, 0, 0.73, 0.11, 0.11, 0.05, [148, 163, 184], { spec: 0.35 });
    const beaconGlow = 0.55 + 0.35 * Math.sin(time * 0.006 + phase);
    m.addPrism(0, 0, 0.78, 0.85, 0.055, 0.02, 6, 0, [251, 191, 36], { emissive: beaconGlow });

    // Animated bobbing vertical drill shaft
    const bob = 0.065 * Math.abs(Math.sin(time * 0.007 + phase));
    m.addPrism(0, 0, 0.06 + bob, 0.68, 0.055, 0.045, 6, time * 0.006, [226, 232, 240], { spec: 0.5 });
    m.addPrism(0, 0, 0.04 + bob, 0.14 + bob, 0.09, 0.01, 6, time * 0.006, [251, 191, 36], { emissive: 0.65 });

    // Side amber ore hopper + cyan space ore crystal chunk
    m.addBox(0.32, -0.16, 0.16, 0.14, 0.12, 0.09, [217, 119, 6], { spec: 0.2 });
    m.addPrism(0.32, -0.16, 0.25, 0.37, 0.08, 0.01, 5, 0.4, [34, 211, 238], { emissive: 0.45, spec: 0.65 });
  }

  function buildDeepMineModel(m, time, phase, pxScale) {
    // Heavy hexagonal reinforced foundation
    m.addPrism(0, 0, 0.0, 0.10, 0.60, 0.54, 6, Math.PI / 6, [68, 80, 98], { spec: 0.30 });
    // Glowing deep-bore pit
    m.addPrism(0, 0, 0.10, 0.12, 0.25, 0.21, 8, 0, [249, 115, 22], { emissive: 0.60 });

    const lw = Math.max(1.5, pxScale * 0.065);
    // Twin steel truss derrick towers
    const towers = [
      { x: -0.26, y: 0.0 },
      { x: 0.26, y: 0.0 }
    ];
    for (let i = 0; i < towers.length; i++) {
      const tx = towers[i].x;
      const ty = towers[i].y;
      m.addLine([tx - 0.11, ty - 0.11, 0.10], [tx - 0.04, ty - 0.04, 0.78], "#cbd5e1", lw);
      m.addLine([tx + 0.11, ty - 0.11, 0.10], [tx + 0.04, ty - 0.04, 0.78], "#cbd5e1", lw);
      m.addLine([tx - 0.11, ty + 0.11, 0.10], [tx - 0.04, ty + 0.04, 0.78], "#cbd5e1", lw);
      m.addLine([tx + 0.11, ty + 0.11, 0.10], [tx + 0.04, ty + 0.04, 0.78], "#cbd5e1", lw);
    }

    // Orange industrial crossbeam bridge + hazard beacons
    m.addBox(0, 0, 0.78, 0.36, 0.09, 0.06, [249, 115, 22], { spec: 0.32 });
    const beaconGlow = 0.55 + 0.38 * Math.sin(time * 0.007 + phase);
    m.addPrism(-0.26, 0, 0.84, 0.91, 0.05, 0.02, 6, 0, [251, 191, 36], { emissive: beaconGlow });
    m.addPrism(0.26, 0, 0.84, 0.91, 0.05, 0.02, 6, 0, [251, 191, 36], { emissive: beaconGlow });

    // Thick animated hydraulic piston drill shaft
    const bob = 0.08 * Math.abs(Math.sin(time * 0.008 + phase));
    m.addPrism(0, 0, 0.08 + bob, 0.74, 0.075, 0.06, 8, time * 0.007, [226, 232, 240], { spec: 0.55 });
    m.addPrism(0, 0, 0.05 + bob, 0.18 + bob, 0.12, 0.015, 8, time * 0.007, [251, 191, 36], { emissive: 0.70 });

    // Stacked terracotta construction brick pallets
    m.addBox(-0.34, -0.24, 0.16, 0.13, 0.09, 0.06, [232, 93, 63], { spec: 0.15 });
    m.addBox(-0.34, -0.24, 0.26, 0.10, 0.08, 0.04, [240, 103, 72], { spec: 0.15 });
    m.addBox(0.34, 0.24, 0.16, 0.13, 0.09, 0.06, [217, 78, 50], { spec: 0.15 });
  }

  function buildMegaQuarryModel(m, time, phase, pxScale) {
    // Stepped octagonal open-pit quarry foundation
    m.addPrism(0, 0, 0.0, 0.09, 0.66, 0.61, 8, Math.PI / 8, [63, 63, 70], { spec: 0.22 });
    m.addPrism(0, 0, 0.09, 0.15, 0.52, 0.46, 8, Math.PI / 8, [82, 82, 91], { spec: 0.25 });
    // Glowing thermal quarry core pit
    m.addPrism(0, 0, 0.15, 0.175, 0.24, 0.19, 8, 0, [249, 115, 22], { emissive: 0.68 });

    // Tri-pillar heavy crimson/steel orbital gantry legs
    const lw = Math.max(1.6, pxScale * 0.07);
    const gantryPts = [
      [-0.36, -0.26],
      [0.36, -0.26],
      [0.0, 0.38]
    ];
    for (let i = 0; i < gantryPts.length; i++) {
      const gx = gantryPts[i][0];
      const gy = gantryPts[i][1];
      m.addPrism(gx, gy, 0.15, 0.24, 0.08, 0.07, 6, 0, [148, 163, 184], { spec: 0.35 });
      m.addLine([gx, gy, 0.22], [gx * 0.35, gy * 0.35, 0.88], "#ef4444", lw);
    }

    // Upper crimson-amber crane crown & floodlights
    m.addPrism(0, 0, 0.82, 0.92, 0.24, 0.19, 6, 0, [239, 68, 68], { spec: 0.38 });
    const glow = 0.60 + 0.32 * Math.sin(time * 0.006 + phase);
    m.addPrism(0, 0, 0.92, 0.98, 0.09, 0.04, 6, 0, [251, 191, 36], { emissive: glow });

    // Rotating upper crane jib arm
    const armAngle = time * 0.0018 + phase;
    const ax = Math.cos(armAngle) * 0.42;
    const ay = Math.sin(armAngle) * 0.42;
    m.addLine([0, 0, 0.92], [ax, ay, 0.96], "#ff9838", lw * 0.9);
    m.addLine([0, 0, 0.92], [-ax * 0.45, -ay * 0.45, 0.94], "#cbd5e1", lw * 0.8);

    // Pulsing central auger/laser excavator column
    const pulseR = 0.055 + 0.015 * Math.sin(time * 0.01 + phase);
    m.addPrism(0, 0, 0.17, 0.82, pulseR, pulseR * 0.85, 8, time * 0.008, [56, 189, 248], { emissive: 0.85, spec: 0.6 });

    // Dual terracotta brick sintering silos / stacks
    m.addBox(-0.40, 0.18, 0.22, 0.12, 0.10, 0.09, [232, 93, 63], { spec: 0.18 });
    m.addBox(-0.40, 0.18, 0.34, 0.09, 0.08, 0.05, [240, 103, 72], { spec: 0.18 });
    m.addBox(0.40, 0.18, 0.22, 0.12, 0.10, 0.09, [217, 78, 50], { spec: 0.18 });
    m.addBox(0.40, 0.18, 0.34, 0.09, 0.08, 0.05, [240, 103, 72], { spec: 0.18 });
  }

  function buildResearchLabModel(m, time, phase, pxScale) {
    // Titanium hex foundation deck
    m.addPrism(0, 0, 0.0, 0.09, 0.58, 0.53, 6, 0, [100, 116, 139], { spec: 0.25 });

    // Side cleanroom wing + glowing cyan viewport
    m.addBox(-0.24, 0.16, 0.19, 0.18, 0.15, 0.10, [226, 232, 240], { spec: 0.35 });
    m.addBox(-0.24, 0.005, 0.19, 0.11, 0.02, 0.045, [56, 189, 248], { emissive: 0.72 });

    // Shimmering geodesic cyan-indigo observatory dome
    const domePulse = 0.22 + 0.10 * Math.sin(time * 0.003 + phase);
    m.addDome(0.10, -0.05, 0.09, 0.33, 0.33, 0.38, 3, 8, [56, 189, 248], {
      spec: 0.60,
      emissive: domePulse,
      stroke: "rgba(224, 242, 254, 0.55)",
      lineWidth: Math.max(0.6, pxScale * 0.015)
    });

    // Slowly rotating rooftop radar dish on side wing
    const dishAngle = time * 0.0014 + phase;
    const rx = -0.24;
    const ry = 0.16;
    m.addPrism(rx, ry, 0.29, 0.40, 0.035, 0.025, 6, 0, [203, 213, 225], { spec: 0.3 });

    const dirX = Math.cos(dishAngle);
    const dirY = Math.sin(dishAngle);
    const perpX = -dirY;
    const perpY = dirX;
    const dHalf = 0.13;
    const dZ = 0.44;
    m.addQuad(
      [rx - perpX * dHalf, ry - perpY * dHalf, dZ - 0.05],
      [rx + perpX * dHalf, ry + perpY * dHalf, dZ - 0.05],
      [rx + perpX * dHalf + dirX * 0.10, ry + perpY * dHalf + dirY * 0.10, dZ + 0.11],
      [rx - perpX * dHalf + dirX * 0.10, ry - perpY * dHalf + dirY * 0.10, dZ + 0.11],
      [241, 245, 249],
      { doubleSided: true, spec: 0.45, depthBias: 0.004 }
    );
    m.addLine(
      [rx + dirX * 0.04, ry + dirY * 0.04, dZ + 0.03],
      [rx + dirX * 0.14, ry + dirY * 0.14, dZ + 0.08],
      "#67e8f9",
      Math.max(1.1, pxScale * 0.035),
      0.006
    );
  }

  function buildResearchCenterModel(m, time, phase, pxScale) {
    // Tiered white/indigo science citadel base
    m.addPrism(0, 0, 0.0, 0.10, 0.64, 0.58, 8, Math.PI / 8, [79, 70, 229], { spec: 0.35 });
    m.addBox(-0.34, 0.0, 0.19, 0.14, 0.22, 0.10, [226, 232, 240], { spec: 0.35 });
    m.addBox(0.34, 0.0, 0.19, 0.14, 0.22, 0.10, [226, 232, 240], { spec: 0.35 });
    m.addBox(0, -0.22, 0.22, 0.26, 0.14, 0.12, [241, 245, 249], { spec: 0.40 });
    m.addBox(0, -0.365, 0.20, 0.10, 0.015, 0.08, [56, 189, 248], { emissive: 0.80 });

    // Glowing holographic violet dome
    const domePulse = 0.28 + 0.12 * Math.sin(time * 0.0035 + phase);
    m.addDome(0, 0.03, 0.24, 0.34, 0.34, 0.36, 3, 8, [168, 85, 247], {
      spec: 0.65,
      emissive: domePulse,
      stroke: "rgba(243, 232, 255, 0.55)",
      lineWidth: Math.max(0.7, pxScale * 0.016)
    });

    // Central golden spire
    m.addPrism(0, 0.03, 0.58, 0.86, 0.04, 0.018, 6, 0, [241, 245, 249], { spec: 0.45 });
    const spireGlow = 0.60 + 0.35 * Math.sin(time * 0.006 + phase);
    m.addPrism(0, 0.03, 0.86, 0.94, 0.06, 0.025, 6, 0, [255, 200, 58], { emissive: spireGlow });

    // Orbiting cyan telemetry ring
    const ringSpin = time * 0.0022 + phase;
    const ringR = 0.46;
    const lw = Math.max(1.2, pxScale * 0.045);
    for (let k = 0; k < 6; k++) {
      const a0 = ringSpin + (Math.PI * 2 * k) / 6;
      const a1 = ringSpin + (Math.PI * 2 * (k + 1)) / 6;
      const z0 = 0.64 + Math.sin(a0) * 0.08;
      const z1 = 0.64 + Math.sin(a1) * 0.08;
      m.addLine(
        [Math.cos(a0) * ringR, 0.03 + Math.sin(a0) * ringR, z0],
        [Math.cos(a1) * ringR, 0.03 + Math.sin(a1) * ringR, z1],
        "#38bdf8",
        lw,
        0.006
      );
    }
  }

  function buildObservatoryModel(m, time, phase, pxScale) {
    // Indigo stone octagonal plinth
    m.addPrism(0, 0, 0.0, 0.14, 0.58, 0.52, 8, Math.PI / 8, [99, 102, 241], { spec: 0.28 });
    m.addPrism(0, 0, 0.14, 0.22, 0.44, 0.42, 8, Math.PI / 8, [199, 210, 254], { spec: 0.35 });

    // Observatory dome
    m.addDome(0, 0, 0.22, 0.38, 0.38, 0.36, 3, 8, [226, 232, 240], { spec: 0.55 });

    // Slowly panning skyward telescope tube
    const pan = Math.sin(time * 0.0009 + phase) * 0.45 + 0.4;
    const dirX = Math.cos(pan);
    const dirY = Math.sin(pan);
    const base = [dirX * 0.08, dirY * 0.08, 0.44];
    const tip = [dirX * 0.48, dirY * 0.48, 0.80];
    m.addLine(base, tip, "#4f46e5", Math.max(3.0, pxScale * 0.12), 0.008);
    m.addPrism(tip[0], tip[1], tip[2] - 0.02, tip[2] + 0.05, 0.075, 0.065, 6, 0, [103, 232, 249], {
      emissive: 0.72,
      spec: 0.65
    });
  }

  function buildQuantumArrayModel(m, time, phase, pxScale) {
    // Deep-indigo containment base
    m.addPrism(0, 0, 0.0, 0.11, 0.62, 0.56, 6, 0, [49, 46, 129], { spec: 0.35 });
    m.addPrism(0, 0, 0.11, 0.14, 0.32, 0.28, 6, 0, [56, 189, 248], { emissive: 0.65 });

    // Twin emitter pylons
    m.addPrism(-0.34, 0, 0.11, 0.76, 0.09, 0.05, 6, 0, [203, 213, 225], { spec: 0.45 });
    m.addPrism(0.34, 0, 0.11, 0.76, 0.09, 0.05, 6, 0, [203, 213, 225], { spec: 0.45 });
    m.addPrism(-0.34, 0, 0.76, 0.85, 0.06, 0.025, 6, 0, [56, 189, 248], { emissive: 0.78 });
    m.addPrism(0.34, 0, 0.76, 0.85, 0.06, 0.025, 6, 0, [244, 114, 182], { emissive: 0.78 });

    // Hovering pulsing quantum core
    const hoverZ = 0.52 + 0.05 * Math.sin(time * 0.004 + phase);
    m.addDome(0, 0, hoverZ - 0.10, 0.17, 0.17, 0.22, 3, 8, [236, 72, 153], {
      emissive: 0.75,
      spec: 0.7
    });

    // Dual counter-rotating quantum rings
    const lw = Math.max(1.2, pxScale * 0.042);
    const spinA = time * 0.003 + phase;
    const spinB = -time * 0.0024 + phase;
    for (let k = 0; k < 6; k++) {
      const a0 = spinA + (Math.PI * 2 * k) / 6;
      const a1 = spinA + (Math.PI * 2 * (k + 1)) / 6;
      m.addLine(
        [Math.cos(a0) * 0.30, Math.sin(a0) * 0.30, hoverZ + Math.cos(a0) * 0.14],
        [Math.cos(a1) * 0.30, Math.sin(a1) * 0.30, hoverZ + Math.cos(a1) * 0.14],
        "#38bdf8",
        lw,
        0.008
      );
      const b0 = spinB + (Math.PI * 2 * k) / 6;
      const b1 = spinB + (Math.PI * 2 * (k + 1)) / 6;
      m.addLine(
        [Math.cos(b0) * 0.30, Math.sin(b0) * 0.30, hoverZ - Math.sin(b0) * 0.14],
        [Math.cos(b1) * 0.30, Math.sin(b1) * 0.30, hoverZ - Math.sin(b1) * 0.14],
        "#f472b6",
        lw,
        0.008
      );
    }
  }

  function buildOreResearchStationModel(m, time, phase, pxScale) {
    // Tiered deep-indigo octagonal containment plinth + glowing cyan conduit ring
    m.addPrism(0, 0, 0.0, 0.11, 0.66, 0.60, 8, Math.PI / 8, [49, 46, 129], { spec: 0.36 });
    m.addPrism(0, 0, 0.11, 0.145, 0.36, 0.31, 8, Math.PI / 8, [56, 189, 248], { emissive: 0.62 });

    // Three radial titanium emitter pylons at 120-deg intervals + converging synthesis beams
    const pylonR = 0.42;
    const beamLW = Math.max(1.2, pxScale * 0.04);
    const hoverZ = 0.56 + 0.045 * Math.sin(time * 0.0035 + phase);
    for (let k = 0; k < 3; k++) {
      const a = (Math.PI * 2 * k) / 3 + 0.35;
      const px = Math.cos(a) * pylonR;
      const py = Math.sin(a) * pylonR;
      m.addPrism(px, py, 0.11, 0.72, 0.075, 0.042, 6, 0, [203, 213, 225], { spec: 0.45 });
      const emitterCol = k === 1 ? [255, 200, 58] : [56, 189, 248];
      m.addPrism(px, py, 0.72, 0.80, 0.052, 0.022, 6, 0, emitterCol, { emissive: 0.78 });
      m.addLine(
        [px * 0.82, py * 0.82, 0.75],
        [0, 0, hoverZ],
        k === 1 ? "#ffc83a" : "#38bdf8",
        beamLW,
        0.006
      );
    }

    // Hovering, slowly spinning 3D faceted cyan Space Ore crystal (two opposing hexagonal pyramids)
    const spin = time * 0.0018 + phase;
    m.addPrism(0, 0, hoverZ - 0.22, hoverZ, 0.022, 0.17, 6, spin, [34, 164, 230], {
      emissive: 0.32,
      spec: 0.65
    });
    m.addPrism(0, 0, hoverZ, hoverZ + 0.28, 0.17, 0.022, 6, spin, [103, 232, 249], {
      emissive: 0.52,
      spec: 0.82
    });

    // Angled counter-rotating golden-cyan orbital ring
    const ringSpin = -time * 0.0022 + phase;
    const lw = Math.max(1.2, pxScale * 0.042);
    for (let k = 0; k < 6; k++) {
      const a0 = ringSpin + (Math.PI * 2 * k) / 6;
      const a1 = ringSpin + (Math.PI * 2 * (k + 1)) / 6;
      m.addLine(
        [Math.cos(a0) * 0.28, Math.sin(a0) * 0.28, hoverZ + Math.sin(a0) * 0.11],
        [Math.cos(a1) * 0.28, Math.sin(a1) * 0.28, hoverZ + Math.sin(a1) * 0.11],
        k % 2 === 0 ? "#ffc83a" : "#38bdf8",
        lw,
        0.008
      );
    }
  }

  function buildRocketExhaust3D(m, time, phase, ox, oy, zNozzle, rNozzle, len, thrust) {
    if (!thrust || thrust <= 0.02) return;
    const flicker = 0.88 + 0.22 * Math.sin(time * 0.05 + phase);
    const totalLen = len * thrust * flicker;
    const spin = time * 0.014 + phase;

    m.addPrism(
      ox,
      oy,
      zNozzle - totalLen * 0.62,
      zNozzle - totalLen,
      rNozzle * 0.72,
      0.001,
      6,
      spin,
      [255, 90, 77],
      { emissive: 0.90, spec: 0.1 }
    );
    m.addPrism(
      ox,
      oy,
      zNozzle - totalLen * 0.28,
      zNozzle - totalLen * 0.70,
      rNozzle * 1.08,
      rNozzle * 0.42,
      7,
      -spin,
      [255, 200, 58],
      { emissive: 0.96, spec: 0.1 }
    );
    m.addPrism(
      ox,
      oy,
      zNozzle,
      zNozzle - totalLen * 0.34,
      rNozzle * 0.92,
      rNozzle * 0.62,
      7,
      spin * 0.5,
      [255, 255, 255],
      { emissive: 1.0, spec: 0.1 }
    );
  }

  function buildSpaceRocket1Vessel3D(m, time, phase, pxScale, opts) {
    const o = opts || {};
    const z0 = o.zOffset !== undefined ? o.zOffset : 0.12;
    const sz = o.vesselScale !== undefined ? clamp01(o.vesselScale) : 1;
    if (sz <= 0.02) return;
    const jx = o.jx || 0;
    const thrust = o.thrust || 0;
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.11, 0.58, thrust);

    // Thruster bell + crimson delta fins
    m.addPrism(jx, 0, zAt(0.0), zAt(0.08), 0.12, 0.08, 8, 0, [255, 200, 58], {
      spec: 0.45,
      emissive: thrust > 0 ? 0.65 : 0
    });
    m.addBox(jx, 0, zAt(0.14), 0.24, 0.04, 0.08 * sz, [255, 90, 77], { spec: 0.30 });
    m.addBox(jx, 0, zAt(0.14), 0.04, 0.24, 0.08 * sz, [224, 62, 49], { spec: 0.30 });

    // White orbital fuselage + crimson nose cone + glowing cyan porthole
    m.addPrism(jx, 0, zAt(0.08), zAt(0.60), 0.13, 0.12, 10, 0, [248, 250, 252], { spec: 0.48 });
    m.addPrism(jx, 0, zAt(0.60), zAt(0.82), 0.12, 0.015, 10, 0, [255, 90, 77], { spec: 0.40 });
    m.addBox(jx, -0.12, zAt(0.42), 0.045, 0.02, 0.045 * sz, [56, 189, 248], { emissive: 0.72 });
  }

  function buildSpaceRocket2Vessel3D(m, time, phase, pxScale, opts) {
    const o = opts || {};
    const z0 = o.zOffset !== undefined ? o.zOffset : 0.13;
    const sz = o.vesselScale !== undefined ? clamp01(o.vesselScale) : 1;
    if (sz <= 0.02) return;
    const jx = o.jx || 0;
    const thrust = o.thrust || 0;
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase + 0.7, jx - 0.22, 0, z0, 0.068, 0.45, thrust);
    buildRocketExhaust3D(m, time, phase + 1.4, jx + 0.22, 0, z0, 0.068, 0.45, thrust);
    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.115, 0.66, thrust);

    // Twin strap-on liquid-fuel side boosters
    m.addPrism(jx - 0.22, 0, zAt(0.0), zAt(0.06), 0.07, 0.05, 8, 0, [255, 200, 58], {
      spec: 0.45,
      emissive: thrust > 0 ? 0.60 : 0
    });
    m.addPrism(jx - 0.22, 0, zAt(0.06), zAt(0.47), 0.08, 0.075, 8, 0, [226, 232, 240], { spec: 0.45 });
    m.addPrism(jx - 0.22, 0, zAt(0.47), zAt(0.59), 0.075, 0.015, 8, 0, [245, 158, 11], { spec: 0.42 });

    m.addPrism(jx + 0.22, 0, zAt(0.0), zAt(0.06), 0.07, 0.05, 8, 0, [255, 200, 58], {
      spec: 0.45,
      emissive: thrust > 0 ? 0.60 : 0
    });
    m.addPrism(jx + 0.22, 0, zAt(0.06), zAt(0.47), 0.08, 0.075, 8, 0, [226, 232, 240], { spec: 0.45 });
    m.addPrism(jx + 0.22, 0, zAt(0.47), zAt(0.59), 0.075, 0.015, 8, 0, [245, 158, 11], { spec: 0.42 });

    // Central navy-and-gold heavy starship core
    m.addPrism(jx, 0, zAt(0.0), zAt(0.08), 0.12, 0.09, 8, 0, [255, 200, 58], {
      spec: 0.45,
      emissive: thrust > 0 ? 0.65 : 0
    });
    m.addPrism(jx, 0, zAt(0.08), zAt(0.67), 0.14, 0.13, 10, 0, [30, 41, 59], { spec: 0.50 });
    m.addPrism(jx, 0, zAt(0.67), zAt(0.91), 0.13, 0.018, 10, 0, [245, 158, 11], { spec: 0.48 });
    m.addBox(jx, -0.13, zAt(0.49), 0.055, 0.02, 0.055 * sz, [56, 189, 248], { emissive: 0.80 });
  }

  function buildSpaceRocket1Model(m, time, phase, pxScale) {
    // Launchpad deck
    m.addPrism(0, 0, 0.0, 0.09, 0.60, 0.54, 8, Math.PI / 8, [71, 85, 105], { spec: 0.25 });
    m.addPrism(0, 0, 0.09, 0.12, 0.26, 0.22, 8, 0, [245, 158, 11], { emissive: 0.40 });

    // Umbilical service tower
    const lw = Math.max(1.3, pxScale * 0.055);
    m.addBox(-0.28, 0.08, 0.42, 0.06, 0.06, 0.34, [148, 163, 184], { spec: 0.35 });
    m.addLine([-0.22, 0.08, 0.62], [-0.08, 0.0, 0.62], "#cbd5e1", lw);
    m.addLine([-0.22, 0.08, 0.40], [-0.08, 0.0, 0.40], "#cbd5e1", lw);

    buildSpaceRocket1Vessel3D(m, time, phase, pxScale, { zOffset: 0.12, thrust: 0 });

    // Pulsing tower beacon
    const beacon = 0.55 + 0.38 * Math.sin(time * 0.005 + phase);
    m.addPrism(-0.28, 0.08, 0.76, 0.82, 0.035, 0.015, 6, 0, [251, 191, 36], { emissive: beacon });
  }

  function buildSpaceRocket2Model(m, time, phase, pxScale) {
    // Heavy reinforced launchpad
    m.addPrism(0, 0, 0.0, 0.10, 0.66, 0.60, 8, Math.PI / 8, [51, 65, 85], { spec: 0.28 });
    m.addPrism(0, 0, 0.10, 0.13, 0.34, 0.30, 8, 0, [245, 158, 11], { emissive: 0.45 });

    // Dual launch gantry arms
    const lw = Math.max(1.4, pxScale * 0.055);
    m.addBox(-0.38, 0.0, 0.46, 0.055, 0.055, 0.36, [148, 163, 184], { spec: 0.35 });
    m.addBox(0.38, 0.0, 0.46, 0.055, 0.055, 0.36, [148, 163, 184], { spec: 0.35 });
    m.addLine([-0.32, 0.0, 0.68], [-0.14, 0.0, 0.68], "#ff9838", lw);
    m.addLine([0.32, 0.0, 0.68], [0.14, 0.0, 0.68], "#ff9838", lw);

    buildSpaceRocket2Vessel3D(m, time, phase, pxScale, { zOffset: 0.13, thrust: 0 });

    const beacon = 0.55 + 0.38 * Math.sin(time * 0.006 + phase);
    m.addPrism(-0.38, 0, 0.82, 0.88, 0.035, 0.015, 6, 0, [56, 189, 248], { emissive: beacon });
    m.addPrism(0.38, 0, 0.82, 0.88, 0.035, 0.015, 6, 0, [56, 189, 248], { emissive: beacon });
  }

  function buildSmallHouseModel(m, time, phase, pxScale) {
    // Slate habitat foundation
    m.addPrism(0, 0, 0.0, 0.08, 0.56, 0.52, 8, Math.PI / 8, [100, 116, 139], { spec: 0.2 });

    // Green hydroponic garden ring
    m.addPrism(-0.04, 0.04, 0.08, 0.14, 0.38, 0.37, 10, 0, [16, 185, 129], { spec: 0.15 });

    // Cozy lit residential titanium biodome
    m.addDome(-0.04, 0.04, 0.13, 0.35, 0.35, 0.32, 3, 10, [241, 245, 249], {
      spec: 0.38,
      stroke: "rgba(186, 230, 253, 0.40)",
      lineWidth: Math.max(0.6, pxScale * 0.015)
    });

    // Warm golden lit viewport panels around the habitat
    const winGlow = 0.65 + 0.12 * Math.sin(time * 0.002 + phase);
    for (let k = 0; k < 4; k++) {
      const ang = (Math.PI * 2 * k) / 4 + 0.45;
      const wx = -0.04 + Math.cos(ang) * 0.34;
      const wy = 0.04 + Math.sin(ang) * 0.34;
      m.addBox(wx, wy, 0.20, 0.05, 0.05, 0.035, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    }

    // Pressurized airlock entryway pod + warm lit door
    m.addBox(0.30, -0.18, 0.17, 0.14, 0.12, 0.09, [203, 213, 225], { spec: 0.28 });
    m.addBox(0.39, -0.18, 0.16, 0.06, 0.06, 0.05, [251, 191, 36], { emissive: 0.72 });

    // Slim comms spire
    m.addLine([-0.04, 0.04, 0.45], [-0.04, 0.04, 0.66], "#e2e8f0", Math.max(1.1, pxScale * 0.035));
    m.addPrism(-0.04, 0.04, 0.65, 0.69, 0.03, 0.01, 6, 0, [52, 211, 153], { emissive: 0.7 });
  }

  function buildBigHouseModel(m, time, phase, pxScale) {
    // Larger octagonal slate foundation + emerald lawn deck
    m.addPrism(0, 0, 0.0, 0.08, 0.64, 0.60, 8, Math.PI / 8, [100, 116, 139], { spec: 0.2 });
    m.addPrism(0, 0, 0.08, 0.13, 0.50, 0.50, 10, 0, [16, 185, 129], { spec: 0.15 });

    // Ground floor wide warm-ivory residential block + terracotta mid-floor band
    m.addBox(0, 0, 0.25, 0.33, 0.25, 0.12, [241, 245, 249], { spec: 0.32 });
    m.addBox(0, 0, 0.38, 0.35, 0.27, 0.025, [255, 138, 61], { spec: 0.25 });

    // Second-story suite + pitched terracotta-orange pyramid roof
    m.addBox(-0.04, 0.02, 0.49, 0.24, 0.19, 0.095, [248, 250, 252], { spec: 0.35 });
    m.addPrism(-0.04, 0.02, 0.585, 0.72, 0.36, 0.04, 4, Math.PI / 4, [255, 132, 56], { spec: 0.30 });

    // Side glass sunroom biodome
    m.addDome(0.30, -0.06, 0.13, 0.16, 0.16, 0.16, 2, 8, [125, 211, 252], {
      spec: 0.55,
      emissive: 0.22
    });

    // Warm golden glowing windows & entryway door
    const winGlow = 0.66 + 0.12 * Math.sin(time * 0.002 + phase);
    m.addBox(0, -0.245, 0.22, 0.065, 0.02, 0.085, [251, 191, 36], { emissive: 0.72, depthBias: 0.004 });
    m.addBox(-0.18, -0.245, 0.24, 0.055, 0.02, 0.048, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0.18, -0.245, 0.24, 0.055, 0.02, 0.048, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(-0.14, 0.245, 0.24, 0.055, 0.02, 0.048, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0.14, 0.245, 0.24, 0.055, 0.02, 0.048, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(-0.325, 0, 0.24, 0.02, 0.075, 0.048, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });

    // Second-story lit windows
    m.addBox(-0.12, -0.165, 0.49, 0.048, 0.02, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0.05, -0.165, 0.49, 0.048, 0.02, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(-0.04, 0.205, 0.49, 0.075, 0.02, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(-0.275, 0.02, 0.49, 0.02, 0.06, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0.195, 0.02, 0.49, 0.02, 0.06, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });

    // Slim rooftop beacon spire
    m.addLine([-0.04, 0.02, 0.72], [-0.04, 0.02, 0.85], "#e2e8f0", Math.max(1.1, pxScale * 0.035));
    m.addPrism(-0.04, 0.02, 0.84, 0.88, 0.032, 0.01, 6, 0, [251, 191, 36], { emissive: 0.72 });
  }

  function buildVillaModel(m, time, phase, pxScale) {
    // Grand hexagonal marble terrace, golden trim collar & emerald manicured garden lawn
    m.addPrism(0, 0, 0.0, 0.09, 0.70, 0.66, 6, 0, [226, 232, 240], { spec: 0.28 });
    m.addPrism(0, 0, 0.09, 0.115, 0.64, 0.62, 6, 0, [251, 191, 36], { spec: 0.50 });
    m.addPrism(0, 0, 0.115, 0.135, 0.58, 0.57, 6, 0, [16, 185, 129], { spec: 0.12 });

    // Glowing cyan front courtyard infinity pool & flanking ornamental cypress cones
    m.addBox(0, -0.34, 0.142, 0.23, 0.105, 0.015, [56, 189, 248], {
      emissive: 0.55,
      spec: 0.85,
      depthBias: 0.002
    });
    m.addPrism(-0.34, -0.30, 0.135, 0.30, 0.065, 0.01, 6, 0, [34, 197, 94], { spec: 0.12 });
    m.addPrism(0.34, -0.30, 0.135, 0.30, 0.065, 0.01, 6, 0, [34, 197, 94], { spec: 0.12 });

    // Symmetrical left & right marble villa wings with royal-amethyst pitched roofs
    m.addBox(-0.31, 0.04, 0.24, 0.15, 0.20, 0.11, [255, 249, 238], { spec: 0.34 });
    m.addPrism(-0.31, 0.04, 0.35, 0.45, 0.29, 0.05, 4, Math.PI / 4, [139, 92, 246], { spec: 0.35 });
    m.addBox(0.31, 0.04, 0.24, 0.15, 0.20, 0.11, [255, 249, 238], { spec: 0.34 });
    m.addPrism(0.31, 0.04, 0.35, 0.45, 0.29, 0.05, 4, Math.PI / 4, [139, 92, 246], { spec: 0.35 });

    // Grand central 2-story marble hall & golden balcony cornice
    m.addBox(0, 0.10, 0.34, 0.21, 0.21, 0.205, [255, 252, 245], { spec: 0.38 });
    m.addBox(0, 0.10, 0.35, 0.24, 0.24, 0.02, [251, 191, 36], { spec: 0.55 });

    // Shimmering cyan glass cupola biodome & gleaming golden finial spire
    m.addDome(0, 0.10, 0.545, 0.21, 0.21, 0.21, 3, 8, [56, 189, 248], {
      spec: 0.65,
      emissive: 0.28,
      stroke: "rgba(254, 240, 138, 0.65)",
      lineWidth: Math.max(0.6, pxScale * 0.015)
    });
    m.addPrism(0, 0.10, 0.75, 0.87, 0.038, 0.008, 6, 0, [251, 191, 36], { emissive: 0.72 });

    // Warm golden glowing panoramic windows & grand entrance across hall and wings
    const winGlow = 0.68 + 0.12 * Math.sin(time * 0.002 + phase);
    m.addBox(0, -0.105, 0.23, 0.065, 0.02, 0.085, [251, 191, 36], { emissive: 0.75, depthBias: 0.004 });
    m.addBox(-0.105, -0.105, 0.45, 0.038, 0.02, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0, -0.105, 0.45, 0.038, 0.02, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0.105, -0.105, 0.45, 0.038, 0.02, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0, 0.305, 0.24, 0.09, 0.02, 0.052, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0, 0.305, 0.45, 0.11, 0.02, 0.042, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });

    m.addBox(-0.31, -0.155, 0.245, 0.065, 0.02, 0.05, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0.31, -0.155, 0.245, 0.065, 0.02, 0.05, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(-0.455, 0.04, 0.245, 0.02, 0.075, 0.05, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
    m.addBox(0.455, 0.04, 0.245, 0.02, 0.075, 0.05, [253, 224, 71], { emissive: winGlow, depthBias: 0.004 });
  }

  function buildWindmillModel(m, time, phase, pxScale) {
    // Octagonal turbine base
    m.addPrism(0, 0, 0.0, 0.09, 0.44, 0.36, 8, Math.PI / 8, [100, 116, 139], { spec: 0.25 });
    m.addPrism(0, 0, 0.09, 0.12, 0.24, 0.18, 8, 0, [56, 189, 248], { emissive: 0.35 });

    // Tall tapered white pylon tower
    m.addPrism(0, 0, 0.12, 0.86, 0.11, 0.055, 8, 0, [241, 245, 249], { spec: 0.40 });

    // Nacelle housing + cyan tail fin
    m.addBox(0, 0.02, 0.87, 0.075, 0.15, 0.07, [226, 232, 240], { spec: 0.40 });
    m.addQuad([0, 0.14, 0.87], [0, 0.25, 0.89], [0, 0.26, 1.00], [0, 0.14, 0.94], [56, 189, 248], {
      doubleSided: true,
      emissive: 0.32
    });

    // Rotor hub cone at front of nacelle
    const hy = -0.14;
    const hz = 0.87;
    m.addBox(0, hy, hz, 0.06, 0.05, 0.06, [56, 189, 248], { emissive: 0.45, spec: 0.6 });

    // 3 spinning aerodynamic rotor blades
    const spin = time * 0.0032 + phase;
    const bladeLen = 0.56;
    for (let k = 0; k < 3; k++) {
      const a = spin + (Math.PI * 2 * k) / 3;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const px = -sa;
      const pz = ca;

      const rootW = 0.055;
      const tipW = 0.018;
      const tipX = ca * bladeLen;
      const tipZ = hz + sa * bladeLen;

      m.addQuad(
        [ca * 0.05 - px * rootW, hy - 0.03, hz + sa * 0.05 - pz * rootW],
        [ca * 0.05 + px * rootW, hy - 0.03, hz + sa * 0.05 + pz * rootW],
        [tipX + px * tipW, hy - 0.04, tipZ + pz * tipW],
        [tipX - px * tipW, hy - 0.04, tipZ - pz * tipW],
        [248, 250, 252],
        { doubleSided: true, spec: 0.55, depthBias: 0.008 }
      );
      m.addLine(
        [tipX * 0.72, hy - 0.045, hz + sa * bladeLen * 0.72],
        [tipX, hy - 0.045, tipZ],
        "#38bdf8",
        Math.max(1.2, pxScale * 0.035),
        0.010
      );
    }
  }

  function buildSolarPanelModel(m, time, phase, pxScale) {
    // Dark slate base + central power hub
    m.addPrism(0, 0, 0.0, 0.07, 0.54, 0.48, 6, 0, [71, 85, 105], { spec: 0.25 });
    m.addBox(0, 0, 0.13, 0.14, 0.13, 0.07, [100, 116, 139], { spec: 0.3 });

    const corePulse = 0.50 + 0.35 * Math.sin(time * 0.004 + phase);
    m.addPrism(0, 0, 0.20, 0.25, 0.08, 0.05, 6, 0, [251, 191, 36], { emissive: corePulse });

    // Twin gimbal support masts
    const postLW = Math.max(1.4, pxScale * 0.05);
    m.addLine([-0.30, 0, 0.06], [-0.30, 0, 0.34], "#cbd5e1", postLW);
    m.addLine([0.30, 0, 0.06], [0.30, 0, 0.34], "#cbd5e1", postLW);

    // Two wide tilted cobalt photovoltaic wings catching specular sunlight
    const wings = [-0.31, 0.31];
    const gridStroke = "rgba(186, 230, 253, 0.78)";
    const gridLW = Math.max(0.7, pxScale * 0.018);

    for (let w = 0; w < wings.length; w++) {
      const wx = wings[w];
      const hw = 0.21;
      const hd = 0.26;
      const zLow = 0.24;
      const zHigh = 0.46;

      // Metallic rim frame slightly behind cells
      m.addQuad(
        [wx - hw - 0.02, -hd - 0.02, zLow - 0.01],
        [wx + hw + 0.02, -hd - 0.02, zLow - 0.01],
        [wx + hw + 0.02, hd + 0.02, zHigh - 0.01],
        [wx - hw - 0.02, hd + 0.02, zHigh - 0.01],
        [203, 213, 225],
        { doubleSided: true, spec: 0.45 }
      );

      // Deep cobalt photovoltaic surface
      m.addQuad(
        [wx - hw, -hd, zLow],
        [wx + hw, -hd, zLow],
        [wx + hw, hd, zHigh],
        [wx - hw, hd, zHigh],
        [29, 78, 216],
        { doubleSided: true, spec: 0.90, emissive: 0.14, depthBias: 0.002 }
      );

      // Crisp photovoltaic cell grid lines
      m.addLine([wx, -hd, zLow], [wx, hd, zHigh], gridStroke, gridLW, 0.004);
      m.addLine([wx - hw, 0, (zLow + zHigh) * 0.5], [wx + hw, 0, (zLow + zHigh) * 0.5], gridStroke, gridLW, 0.004);
    }
  }

  function buildSolarArrayModel(m, time, phase, pxScale) {
    // Larger octagonal slate base + golden collector collar
    m.addPrism(0, 0, 0.0, 0.08, 0.64, 0.60, 8, Math.PI / 8, [71, 85, 105], { spec: 0.25 });
    m.addPrism(0, 0, 0.08, 0.105, 0.56, 0.54, 8, Math.PI / 8, [251, 191, 36], { spec: 0.48 });

    // Central twin-module inverter housing + pulsing amber capacitor prism
    m.addBox(0, 0, 0.17, 0.18, 0.15, 0.08, [100, 116, 139], { spec: 0.32 });
    const corePulse = 0.55 + 0.35 * Math.sin(time * 0.0045 + phase);
    m.addPrism(0, 0, 0.25, 0.33, 0.095, 0.055, 6, 0, [251, 191, 36], { emissive: corePulse });

    // Four tilted cobalt photovoltaic panels in two elevated rows
    const postLW = Math.max(1.3, pxScale * 0.045);
    const gridStroke = "rgba(186, 230, 253, 0.80)";
    const gridLW = Math.max(0.7, pxScale * 0.016);
    const panels = [
      { wx: -0.28, wy: -0.22, zLow: 0.22, zHigh: 0.38 },
      { wx:  0.28, wy: -0.22, zLow: 0.22, zHigh: 0.38 },
      { wx: -0.28, wy:  0.20, zLow: 0.34, zHigh: 0.54 },
      { wx:  0.28, wy:  0.20, zLow: 0.34, zHigh: 0.54 }
    ];

    for (let i = 0; i < panels.length; i++) {
      const p = panels[i];
      const hw = 0.21;
      const hd = 0.16;
      const zMid = (p.zLow + p.zHigh) * 0.5;
      m.addLine([p.wx, p.wy, 0.09], [p.wx, p.wy, zMid - 0.02], "#cbd5e1", postLW);

      // Warm silver-gold trim frame
      m.addQuad(
        [p.wx - hw - 0.02, p.wy - hd - 0.02, p.zLow - 0.01],
        [p.wx + hw + 0.02, p.wy - hd - 0.02, p.zLow - 0.01],
        [p.wx + hw + 0.02, p.wy + hd + 0.02, p.zHigh - 0.01],
        [p.wx - hw - 0.02, p.wy + hd + 0.02, p.zHigh - 0.01],
        i >= 2 ? [251, 191, 36] : [226, 232, 240],
        { doubleSided: true, spec: 0.50 }
      );

      // Deep cobalt photovoltaic wing
      m.addQuad(
        [p.wx - hw, p.wy - hd, p.zLow],
        [p.wx + hw, p.wy - hd, p.zLow],
        [p.wx + hw, p.wy + hd, p.zHigh],
        [p.wx - hw, p.wy + hd, p.zHigh],
        [29, 78, 216],
        { doubleSided: true, spec: 0.92, emissive: 0.16, depthBias: 0.002 }
      );

      m.addLine([p.wx, p.wy - hd, p.zLow], [p.wx, p.wy + hd, p.zHigh], gridStroke, gridLW, 0.004);
      m.addLine([p.wx - hw, p.wy, zMid], [p.wx + hw, p.wy, zMid], gridStroke, gridLW, 0.004);
    }
  }

  function buildSolarTowerModel(m, time, phase, pxScale) {
    // Grand hexagonal foundation + golden trim ring
    m.addPrism(0, 0, 0.0, 0.09, 0.70, 0.66, 6, 0, [71, 85, 105], { spec: 0.28 });
    m.addPrism(0, 0, 0.09, 0.115, 0.63, 0.61, 6, 0, [251, 191, 36], { spec: 0.52 });

    // Six radial heliostat mirror quads arranged in a ring tilting inward toward receiver
    const postLW = Math.max(1.2, pxScale * 0.04);
    const mirrorRadius = 0.45;
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI * 2 * k) / 6 + Math.PI / 6;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const tx = -sa;
      const ty = ca;
      const mx = ca * mirrorRadius;
      const my = sa * mirrorRadius;
      m.addLine([mx, my, 0.10], [mx, my, 0.21], "#cbd5e1", postLW);

      const hw = 0.14;
      const hd = 0.10;
      const outX = ca * hd;
      const outY = sa * hd;
      const zIn = 0.18;
      const zOut = 0.30;

      // Silver backing frame
      m.addQuad(
        [mx - outX - tx * (hw + 0.015), my - outY - ty * (hw + 0.015), zIn - 0.01],
        [mx - outX + tx * (hw + 0.015), my - outY + ty * (hw + 0.015), zIn - 0.01],
        [mx + outX + tx * (hw + 0.015), my + outY + ty * (hw + 0.015), zOut - 0.01],
        [mx + outX - tx * (hw + 0.015), my + outY - ty * (hw + 0.015), zOut - 0.01],
        [203, 213, 225],
        { doubleSided: true, spec: 0.45 }
      );

      // Reflective cobalt-cyan mirror surface
      m.addQuad(
        [mx - outX - tx * hw, my - outY - ty * hw, zIn],
        [mx - outX + tx * hw, my - outY + ty * hw, zIn],
        [mx + outX + tx * hw, my + outY + ty * hw, zOut],
        [mx + outX - tx * hw, my + outY - ty * hw, zOut],
        [37, 99, 235],
        { doubleSided: true, spec: 0.92, emissive: 0.20, depthBias: 0.002 }
      );
    }

    // Tall tapered central titanium receiver spire + two structural rings
    m.addPrism(0, 0, 0.11, 0.64, 0.16, 0.095, 8, 0, [241, 245, 249], { spec: 0.40 });
    m.addPrism(0, 0, 0.30, 0.34, 0.155, 0.148, 8, 0, [100, 116, 139], { spec: 0.32 });
    m.addPrism(0, 0, 0.50, 0.54, 0.132, 0.125, 8, 0, [100, 116, 139], { spec: 0.32 });

    // Blazing golden solar thermal receiver chamber + glowing summit orb + finial spire
    const solarPulse = 0.78 + 0.18 * Math.sin(time * 0.005 + phase);
    m.addPrism(0, 0, 0.64, 0.78, 0.115, 0.125, 8, 0, [251, 191, 36], { emissive: solarPulse, spec: 0.65 });
    m.addDome(0, 0, 0.77, 0.12, 0.12, 0.12, 3, 8, [254, 240, 138], {
      spec: 0.75,
      emissive: 0.85,
      stroke: "rgba(255, 255, 255, 0.7)",
      lineWidth: Math.max(0.6, pxScale * 0.015)
    });
    m.addLine([0, 0, 0.89], [0, 0, 0.98], "#fef08a", Math.max(1.2, pxScale * 0.04));
  }

  function buildWindTurbineModel(m, time, phase, pxScale) {
    // Heavy reinforced octagonal base + glowing cyan ring + side transformer pod
    m.addPrism(0, 0, 0.0, 0.10, 0.56, 0.48, 8, Math.PI / 8, [100, 116, 139], { spec: 0.28 });
    m.addPrism(0, 0, 0.10, 0.135, 0.28, 0.22, 8, 0, [56, 189, 248], { emissive: 0.42 });
    m.addBox(0.28, 0.14, 0.16, 0.12, 0.11, 0.08, [148, 163, 184], { spec: 0.30 });
    const cellPulse = 0.55 + 0.30 * Math.sin(time * 0.004 + phase);
    m.addBox(0.28, 0.14, 0.25, 0.06, 0.055, 0.025, [251, 191, 36], { emissive: cellPulse });

    // Tall sleek tapered aero-tower + two glowing cyan power collar rings
    m.addPrism(0, 0, 0.13, 0.96, 0.135, 0.068, 8, 0, [241, 245, 249], { spec: 0.44 });
    m.addPrism(0, 0, 0.40, 0.44, 0.128, 0.122, 8, 0, [56, 189, 248], { emissive: 0.52 });
    m.addPrism(0, 0, 0.70, 0.735, 0.102, 0.096, 8, 0, [56, 189, 248], { emissive: 0.52 });

    // Futuristic nacelle + dual cyan tail fins
    m.addBox(0, 0.02, 0.97, 0.09, 0.18, 0.08, [226, 232, 240], { spec: 0.42 });
    m.addQuad([-0.03, 0.16, 0.97], [-0.03, 0.29, 0.99], [-0.03, 0.30, 1.12], [-0.03, 0.16, 1.05], [56, 189, 248], {
      doubleSided: true,
      emissive: 0.38
    });
    m.addQuad([0.03, 0.16, 0.97], [0.03, 0.29, 0.99], [0.03, 0.30, 1.12], [0.03, 0.16, 1.05], [56, 189, 248], {
      doubleSided: true,
      emissive: 0.38
    });

    // Glowing golden-cyan spinner cone
    const hy = -0.17;
    const hz = 0.97;
    m.addBox(0, hy, hz, 0.07, 0.055, 0.07, [251, 191, 36], { emissive: 0.55, spec: 0.65 });

    // 3 longer, faster aerodynamic rotor blades with bright cyan & gold energized tips
    const spin = time * 0.0044 + phase;
    const bladeLen = 0.66;
    for (let k = 0; k < 3; k++) {
      const a = spin + (Math.PI * 2 * k) / 3;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const px = -sa;
      const pz = ca;

      const rootW = 0.062;
      const tipW = 0.020;
      const tipX = ca * bladeLen;
      const tipZ = hz + sa * bladeLen;

      m.addQuad(
        [ca * 0.055 - px * rootW, hy - 0.03, hz + sa * 0.055 - pz * rootW],
        [ca * 0.055 + px * rootW, hy - 0.03, hz + sa * 0.055 + pz * rootW],
        [tipX + px * tipW, hy - 0.04, tipZ + pz * tipW],
        [tipX - px * tipW, hy - 0.04, tipZ - pz * tipW],
        [248, 250, 252],
        { doubleSided: true, spec: 0.58, depthBias: 0.008 }
      );
      m.addLine(
        [tipX * 0.65, hy - 0.045, hz + sa * bladeLen * 0.65],
        [tipX * 0.88, hy - 0.045, hz + sa * bladeLen * 0.88],
        "#38bdf8",
        Math.max(1.3, pxScale * 0.038),
        0.010
      );
      m.addLine(
        [tipX * 0.88, hy - 0.046, hz + sa * bladeLen * 0.88],
        [tipX, hy - 0.046, tipZ],
        "#ffc83a",
        Math.max(1.3, pxScale * 0.040),
        0.011
      );
    }
  }

  function buildWindFarmModel(m, time, phase, pxScale) {
    // Grand hexagonal aero-platform + glowing cyan energy ring + central substation block
    m.addPrism(0, 0, 0.0, 0.09, 0.70, 0.66, 6, 0, [71, 85, 105], { spec: 0.26 });
    m.addPrism(0, 0, 0.09, 0.115, 0.63, 0.61, 6, 0, [56, 189, 248], { emissive: 0.44 });
    m.addBox(0, -0.02, 0.16, 0.11, 0.09, 0.05, [203, 213, 225], { spec: 0.35 });
    const subGlow = 0.58 + 0.30 * Math.sin(time * 0.005 + phase);
    m.addPrism(0, -0.02, 0.21, 0.255, 0.05, 0.025, 6, 0, [251, 191, 36], { emissive: subGlow });

    function addMiniTurbine(ox, oy, zBase, topZ, rBot, rTop, bladeLen, spin) {
      m.addPrism(ox, oy, zBase, topZ, rBot, rTop, 6, 0, [241, 245, 249], { spec: 0.42 });
      m.addBox(ox, oy + 0.015, topZ + 0.01, rTop * 1.15, rTop * 2.1, rTop * 1.05, [226, 232, 240], { spec: 0.40 });
      const hy = oy - rTop * 1.95;
      const hz = topZ + 0.01;
      m.addBox(ox, hy, hz, rTop * 0.85, rTop * 0.7, rTop * 0.85, [56, 189, 248], { emissive: 0.50 });

      for (let k = 0; k < 3; k++) {
        const a = spin + (Math.PI * 2 * k) / 3;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const px = -sa;
        const pz = ca;
        const rootW = bladeLen * 0.105;
        const tipW = bladeLen * 0.032;
        const tipX = ox + ca * bladeLen;
        const tipZ = hz + sa * bladeLen;

        m.addQuad(
          [ox + ca * 0.035 - px * rootW, hy - 0.025, hz + sa * 0.035 - pz * rootW],
          [ox + ca * 0.035 + px * rootW, hy - 0.025, hz + sa * 0.035 + pz * rootW],
          [tipX + px * tipW, hy - 0.032, tipZ + pz * tipW],
          [tipX - px * tipW, hy - 0.032, tipZ - pz * tipW],
          [248, 250, 252],
          { doubleSided: true, spec: 0.56, depthBias: 0.008 }
        );
        m.addLine(
          [ox + ca * bladeLen * 0.70, hy - 0.036, hz + sa * bladeLen * 0.70],
          [tipX, hy - 0.036, tipZ],
          "#38bdf8",
          Math.max(1.0, pxScale * 0.028),
          0.010
        );
      }
    }

    // 3 synchronized non-colliding turbines (rear tall + 2 front flanking)
    addMiniTurbine(0, 0.20, 0.115, 0.98, 0.095, 0.052, 0.44, time * 0.0046 + phase);
    addMiniTurbine(-0.35, -0.16, 0.115, 0.68, 0.075, 0.042, 0.30, time * 0.0054 + phase + 1.1);
    addMiniTurbine(0.35, -0.16, 0.115, 0.68, 0.075, 0.042, 0.30, time * 0.0054 + phase + 2.3);
  }

  function getTradeBeaconStyle(opts, time, phase) {
    const active = Boolean(opts && opts.tradeEnabled);
    const prog = opts && opts.tradeProgress !== undefined ? clamp01(opts.tradeProgress) : 0;
    const pulse = active ? 0.55 + 0.40 * Math.sin(time * 0.008 + phase) : 0.42;
    return {
      active: active,
      prog: prog,
      beaconCol: active ? [34, 197, 94] : [239, 68, 68],
      beaconGlow: pulse,
      preLaunchGlow: active && prog > 0.72 ? 0.50 + ((prog - 0.72) / 0.28) * 0.50 : 0.25
    };
  }

  function buildTradeRocket1Vessel3D(m, time, phase, pxScale, opts) {
    const o = opts || {};
    const z0 = o.zOffset !== undefined ? o.zOffset : 0.125;
    const sz = o.vesselScale !== undefined ? clamp01(o.vesselScale) : 1;
    if (sz <= 0.02) return;
    const jx = o.jx || 0;
    const thrust = o.thrust || 0;
    const glow = o.preLaunchGlow !== undefined ? o.preLaunchGlow : 0.25;
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.105, 0.55, thrust);

    m.addPrism(jx, 0, zAt(0.0), zAt(0.075), 0.11, 0.075, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addBox(jx, 0, zAt(0.125), 0.22, 0.04, 0.075 * sz, [16, 185, 129], { spec: 0.30 });
    m.addBox(jx, 0, zAt(0.125), 0.04, 0.22, 0.075 * sz, [5, 150, 105], { spec: 0.30 });
    m.addPrism(jx, 0, zAt(0.075), zAt(0.555), 0.125, 0.115, 10, 0, [248, 250, 252], { spec: 0.48 });
    m.addPrism(jx, 0, zAt(0.555), zAt(0.755), 0.115, 0.015, 10, 0, [255, 177, 41], { spec: 0.45 });
    m.addBox(jx, -0.115, zAt(0.355), 0.05, 0.02, 0.05 * sz, [255, 216, 77], { emissive: 0.55 });
  }

  function buildTradeRocket2Vessel3D(m, time, phase, pxScale, opts) {
    const o = opts || {};
    const z0 = o.zOffset !== undefined ? o.zOffset : 0.135;
    const sz = o.vesselScale !== undefined ? clamp01(o.vesselScale) : 1;
    if (sz <= 0.02) return;
    const jx = o.jx || 0;
    const thrust = o.thrust || 0;
    const glow = o.preLaunchGlow !== undefined ? o.preLaunchGlow : 0.25;
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase + 0.6, jx - 0.19, 0, z0, 0.062, 0.42, thrust);
    buildRocketExhaust3D(m, time, phase + 1.2, jx + 0.19, 0, z0, 0.062, 0.42, thrust);
    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.105, 0.60, thrust);

    m.addPrism(jx - 0.19, 0, zAt(0.0), zAt(0.055), 0.065, 0.045, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.62 : glow
    });
    m.addPrism(jx - 0.19, 0, zAt(0.055), zAt(0.425), 0.075, 0.07, 8, 0, [6, 182, 212], { spec: 0.42 });
    m.addPrism(jx - 0.19, 0, zAt(0.425), zAt(0.545), 0.07, 0.012, 8, 0, [255, 216, 77], { spec: 0.42 });

    m.addPrism(jx + 0.19, 0, zAt(0.0), zAt(0.055), 0.065, 0.045, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.62 : glow
    });
    m.addPrism(jx + 0.19, 0, zAt(0.055), zAt(0.425), 0.075, 0.07, 8, 0, [8, 145, 178], { spec: 0.42 });
    m.addPrism(jx + 0.19, 0, zAt(0.425), zAt(0.545), 0.07, 0.012, 8, 0, [255, 216, 77], { spec: 0.42 });

    m.addPrism(jx, 0, zAt(0.0), zAt(0.075), 0.115, 0.085, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addPrism(jx, 0, zAt(0.075), zAt(0.605), 0.13, 0.12, 10, 0, [248, 250, 252], { spec: 0.48 });
    m.addPrism(jx, 0, zAt(0.605), zAt(0.825), 0.12, 0.016, 10, 0, [6, 182, 212], { spec: 0.45 });
    m.addBox(jx, -0.125, zAt(0.385), 0.055, 0.02, 0.055 * sz, [255, 216, 77], { emissive: 0.62 });
  }

  function buildTradeRocket3Vessel3D(m, time, phase, pxScale, opts) {
    const o = opts || {};
    const z0 = o.zOffset !== undefined ? o.zOffset : 0.135;
    const sz = o.vesselScale !== undefined ? clamp01(o.vesselScale) : 1;
    if (sz <= 0.02) return;
    const jx = o.jx || 0;
    const thrust = o.thrust || 0;
    const glow = o.preLaunchGlow !== undefined ? o.preLaunchGlow : 0.25;
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase + 0.5, jx - 0.22, 0, z0, 0.068, 0.48, thrust);
    buildRocketExhaust3D(m, time, phase + 1.1, jx + 0.22, 0, z0, 0.068, 0.48, thrust);
    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.118, 0.70, thrust);

    m.addBox(jx, 0, zAt(0.145), 0.32, 0.04, 0.09 * sz, [56, 189, 248], { spec: 0.42 });
    m.addPrism(jx - 0.22, 0, zAt(0.0), zAt(0.055), 0.068, 0.048, 8, 0, [255, 90, 77], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addPrism(jx - 0.22, 0, zAt(0.055), zAt(0.465), 0.08, 0.075, 8, 0, [255, 216, 77], { spec: 0.50 });
    m.addPrism(jx - 0.22, 0, zAt(0.465), zAt(0.595), 0.075, 0.014, 8, 0, [245, 158, 11], { spec: 0.45 });

    m.addPrism(jx + 0.22, 0, zAt(0.0), zAt(0.055), 0.068, 0.048, 8, 0, [255, 90, 77], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addPrism(jx + 0.22, 0, zAt(0.055), zAt(0.465), 0.08, 0.075, 8, 0, [245, 158, 11], { spec: 0.50 });
    m.addPrism(jx + 0.22, 0, zAt(0.465), zAt(0.595), 0.075, 0.014, 8, 0, [217, 119, 6], { spec: 0.45 });

    m.addPrism(jx, 0, zAt(0.0), zAt(0.085), 0.125, 0.09, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.70 : glow
    });
    m.addPrism(jx, 0, zAt(0.085), zAt(0.665), 0.145, 0.135, 10, 0, [30, 41, 59], { spec: 0.52 });
    m.addPrism(jx, 0, zAt(0.665), zAt(0.905), 0.135, 0.018, 10, 0, [255, 216, 77], { spec: 0.55 });
    m.addBox(jx, -0.138, zAt(0.425), 0.06, 0.02, 0.06 * sz, [56, 189, 248], { emissive: 0.82 });
  }

  function buildTradeRocket1Model(m, time, phase, pxScale, opts) {
    const st = getTradeBeaconStyle(opts, time, phase);
    // Commercial slate & emerald trade launchpad
    m.addPrism(0, 0, 0.0, 0.09, 0.62, 0.56, 8, Math.PI / 8, [71, 85, 105], { spec: 0.28 });
    m.addPrism(0, 0, 0.09, 0.125, 0.34, 0.28, 8, 0, [16, 185, 129], { emissive: st.active ? 0.42 : 0.12 });

    // Stacked terracotta brick crate next to pad
    m.addBox(-0.30, -0.18, 0.15, 0.10, 0.08, 0.06, [232, 93, 63], { spec: 0.18 });
    m.addBox(-0.30, -0.18, 0.23, 0.08, 0.065, 0.03, [255, 200, 58], { spec: 0.45 });

    // Telemetry service tower + active/stopped status beacon
    const lw = Math.max(1.2, pxScale * 0.05);
    m.addBox(0.28, 0.10, 0.36, 0.055, 0.055, 0.27, [148, 163, 184], { spec: 0.32 });
    m.addLine([0.22, 0.10, 0.52], [0.09, 0.02, 0.52], "#10b981", lw);
    m.addPrism(0.28, 0.10, 0.63, 0.70, 0.04, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });

    const fp = opts && opts.flightProgress !== undefined ? opts.flightProgress : null;
    if (fp === null || fp >= 0.68) {
      const reloadScale = fp !== null ? clamp01((fp - 0.68) / 0.32) : 1;
      const jx = st.active && st.prog > 0.78 && fp === null ? Math.sin(time * 0.07 + phase) * 0.02 : 0;
      buildTradeRocket1Vessel3D(m, time, phase, pxScale, {
        zOffset: 0.125,
        jx: jx,
        vesselScale: reloadScale,
        preLaunchGlow: st.preLaunchGlow,
        thrust: 0
      });
    }
  }

  function buildTradeRocket2Model(m, time, phase, pxScale, opts) {
    const st = getTradeBeaconStyle(opts, time, phase);
    // Express cyan-teal freighter terminal
    m.addPrism(0, 0, 0.0, 0.10, 0.66, 0.60, 8, Math.PI / 8, [51, 65, 85], { spec: 0.28 });
    m.addPrism(0, 0, 0.10, 0.135, 0.38, 0.32, 8, 0, [6, 182, 212], { emissive: st.active ? 0.45 : 0.12 });

    // Cargo gantry & crates
    const lw = Math.max(1.3, pxScale * 0.055);
    m.addBox(-0.36, 0.0, 0.42, 0.055, 0.055, 0.32, [100, 116, 139], { spec: 0.35 });
    m.addLine([-0.30, 0.0, 0.62], [-0.14, 0.0, 0.62], "#06b6d4", lw);
    m.addPrism(-0.36, 0.0, 0.74, 0.81, 0.045, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });
    m.addBox(0.32, -0.20, 0.16, 0.095, 0.08, 0.06, [232, 93, 63], { spec: 0.18 });
    m.addBox(-0.28, -0.26, 0.15, 0.085, 0.075, 0.05, [245, 158, 11], { spec: 0.35 });

    const fp = opts && opts.flightProgress !== undefined ? opts.flightProgress : null;
    if (fp === null || fp >= 0.68) {
      const reloadScale = fp !== null ? clamp01((fp - 0.68) / 0.32) : 1;
      const jx = st.active && st.prog > 0.78 && fp === null ? Math.sin(time * 0.08 + phase) * 0.022 : 0;
      buildTradeRocket2Vessel3D(m, time, phase, pxScale, {
        zOffset: 0.135,
        jx: jx,
        vesselScale: reloadScale,
        preLaunchGlow: st.preLaunchGlow,
        thrust: 0
      });
    }
  }

  function buildTradeRocket3Model(m, time, phase, pxScale, opts) {
    const st = getTradeBeaconStyle(opts, time, phase);
    // Grand orbital gold starliner port
    m.addPrism(0, 0, 0.0, 0.10, 0.70, 0.64, 6, 0, [30, 41, 59], { spec: 0.35 });
    m.addPrism(0, 0, 0.10, 0.135, 0.56, 0.52, 6, 0, [245, 158, 11], { emissive: st.active ? 0.50 : 0.14 });

    // Flanking active/stopped telemetry pylons
    m.addBox(-0.40, 0, 0.44, 0.05, 0.05, 0.30, [148, 163, 184], { spec: 0.35 });
    m.addBox(0.40, 0, 0.44, 0.05, 0.05, 0.30, [148, 163, 184], { spec: 0.35 });
    m.addPrism(-0.40, 0, 0.74, 0.81, 0.04, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });
    m.addPrism(0.40, 0, 0.74, 0.81, 0.04, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });

    const fp = opts && opts.flightProgress !== undefined ? opts.flightProgress : null;
    if (fp === null || fp >= 0.68) {
      const reloadScale = fp !== null ? clamp01((fp - 0.68) / 0.32) : 1;
      const jx = st.active && st.prog > 0.78 && fp === null ? Math.sin(time * 0.09 + phase) * 0.024 : 0;
      buildTradeRocket3Vessel3D(m, time, phase, pxScale, {
        zOffset: 0.135,
        jx: jx,
        vesselScale: reloadScale,
        preLaunchGlow: st.preLaunchGlow,
        thrust: 0
      });
    }
  }

  function buildCrashBaseModel(m, time, phase, pxScale) {
    // Scorched impact crater dish & jagged dirt berm mounds
    m.addPrism(0, 0, 0.0, 0.055, 0.62, 0.56, 8, Math.PI / 8, [52, 58, 72], { spec: 0.14 });
    m.addBox(0.36, 0.16, 0.085, 0.14, 0.11, 0.055, [100, 112, 130], { spec: 0.12 });
    m.addBox(0.35, -0.17, 0.08, 0.13, 0.10, 0.05, [86, 98, 118], { spec: 0.12 });
    m.addBox(-0.40, 0.22, 0.07, 0.10, 0.09, 0.04, [92, 104, 122], { spec: 0.12 });

    // Tilted nose-down escape craft fuselage buried at front (+x) and raised toward rear (-x)
    const fusRef = m.toWorld(-0.04, 0, 0.22);
    const hullOpt = { spec: 0.45, refWorld: fusRef };
    const bellyOpt = { spec: 0.22, refWorld: fusRef };
    const stripeOpt = { spec: 0.32, refWorld: fusRef };

    // Top fuselage deck
    m.addQuad([0.30, -0.09, 0.13], [0.30, 0.09, 0.13], [-0.40, 0.11, 0.41], [-0.40, -0.11, 0.41], [238, 243, 249], hullOpt);
    // Belly plate
    m.addQuad([0.28, -0.11, 0.04], [-0.40, -0.11, 0.25], [-0.40, 0.11, 0.25], [0.28, 0.11, 0.04], [96, 110, 128], bellyOpt);
    // Side hull + crimson accent stripe (left & right flanks)
    m.addQuad([0.30, 0.09, 0.13], [0.28, 0.11, 0.04], [-0.40, 0.11, 0.25], [-0.40, 0.11, 0.41], [220, 228, 238], hullOpt);
    m.addQuad([0.30, -0.09, 0.13], [-0.40, -0.11, 0.41], [-0.40, -0.11, 0.25], [0.28, -0.11, 0.04], [190, 202, 218], hullOpt);
    m.addQuad([0.20, 0.102, 0.12], [0.20, 0.106, 0.08], [-0.36, 0.114, 0.29], [-0.36, 0.114, 0.35], [255, 90, 77], stripeOpt);
    m.addQuad([0.20, -0.102, 0.12], [-0.36, -0.114, 0.35], [-0.36, -0.114, 0.29], [0.20, -0.106, 0.08], [224, 62, 49], stripeOpt);
    // Buried nose wedge + rear bulkhead
    m.addQuad([0.38, -0.05, 0.06], [0.38, 0.05, 0.06], [0.30, 0.09, 0.13], [0.30, -0.09, 0.13], [255, 90, 77], hullOpt);
    m.addQuad([-0.40, -0.11, 0.25], [-0.40, -0.11, 0.41], [-0.40, 0.11, 0.41], [-0.40, 0.11, 0.25], [71, 85, 105], bellyOpt);

    // Glowing cyan cockpit canopy on top forward slope
    m.addQuad([0.22, -0.075, 0.16], [0.22, 0.075, 0.16], [-0.02, 0.088, 0.31], [-0.02, -0.088, 0.31], [56, 189, 248], {
      emissive: 0.38,
      spec: 0.65,
      refWorld: fusRef
    });

    // Intact swept left wing (+y) + deployed blue mini solar panel flap
    m.addQuad([-0.02, 0.11, 0.24], [-0.28, 0.11, 0.33], [-0.36, 0.46, 0.44], [-0.12, 0.42, 0.36], [226, 232, 240], {
      doubleSided: true,
      spec: 0.42
    });
    m.addQuad([-0.08, 0.16, 0.27], [-0.26, 0.16, 0.34], [-0.32, 0.41, 0.44], [-0.14, 0.38, 0.37], [37, 99, 235], {
      doubleSided: true,
      spec: 0.58
    });
    const lw = Math.max(1.0, pxScale * 0.032);
    m.addLine([-0.14, 0.21, 0.30], [-0.22, 0.40, 0.40], "#93c5fd", lw);

    // Snapped right wing stub (-y) + detached broken wing shard resting in dirt
    m.addQuad([-0.04, -0.11, 0.25], [-0.24, -0.11, 0.33], [-0.26, -0.26, 0.34], [-0.08, -0.25, 0.27], [148, 163, 184], {
      doubleSided: true,
      spec: 0.28
    });
    m.addQuad([0.06, -0.34, 0.068], [-0.08, -0.48, 0.072], [-0.16, -0.39, 0.066], [0.00, -0.28, 0.065], [203, 213, 225], {
      doubleSided: true,
      spec: 0.25
    });

    // Rear vertical tail fin + blinking red distress beacon
    m.addQuad([-0.24, 0, 0.35], [-0.40, 0, 0.40], [-0.46, 0, 0.60], [-0.33, 0, 0.56], [255, 90, 77], {
      doubleSided: true,
      spec: 0.35
    });
    const beaconPulse = 0.5 + 0.5 * Math.sin(time * 0.0055 + phase);
    m.addDome(-0.42, 0, 0.60, 0.045, 0.045, 0.045, 2, 6, [255, 90, 77], {
      emissive: 0.25 + 0.75 * beaconPulse
    });

    // Exhaust nozzle + subtle warm residual ember + rising cel smoke orbs
    m.addBox(-0.44, 0, 0.32, 0.05, 0.07, 0.07, [71, 85, 105], { spec: 0.32 });
    m.addBox(-0.49, 0, 0.32, 0.015, 0.045, 0.045, [245, 158, 11], { emissive: 0.55 });
    for (let k = 0; k < 3; k++) {
      const sp = (time * 0.0005 + k * 0.333 + phase * 0.1) % 1;
      const smZ = 0.42 + sp * 0.38;
      const smX = -0.30 - sp * 0.08 + Math.sin(sp * 5 + phase) * 0.03;
      const smY = (k - 1) * 0.04;
      const smR = 0.065 * (1 - sp * 0.45);
      m.addDome(smX, smY, smZ, smR, smR, smR * 0.85, 2, 6, [186, 198, 214], { spec: 0.08 });
    }

    // Salvaged orange survivor gear crate & initial brick stack
    m.addBox(-0.14, -0.34, 0.105, 0.095, 0.075, 0.055, [245, 158, 11], { spec: 0.25 });
    m.addBox(0.06, -0.32, 0.085, 0.075, 0.055, 0.035, [217, 119, 6], { spec: 0.20 });
  }

  function buildUtopiaSpireModel(m, time, phase, pxScale) {
    // Grand hexagonal alabaster-and-gold podium
    m.addPrism(0, 0, 0.0, 0.10, 0.66, 0.60, 6, 0, [226, 232, 240], { spec: 0.36 });
    m.addPrism(0, 0, 0.10, 0.13, 0.58, 0.55, 6, 0, [251, 191, 36], { spec: 0.58 });
    m.addPrism(0, 0, 0.13, 0.15, 0.42, 0.38, 6, 0, [56, 189, 248], { emissive: 0.55 });

    // Tall central futuristic ivory-pearl arcology spire
    m.addPrism(0, 0, 0.14, 0.54, 0.23, 0.16, 6, 0, [248, 250, 252], { spec: 0.52 });
    m.addPrism(0, 0, 0.54, 0.58, 0.19, 0.18, 6, 0, [251, 191, 36], { spec: 0.62 });
    m.addPrism(0, 0, 0.58, 0.94, 0.15, 0.085, 6, Math.PI / 6, [241, 245, 249], { spec: 0.56 });
    m.addPrism(0, 0, 0.94, 0.98, 0.11, 0.095, 6, Math.PI / 6, [251, 191, 36], { spec: 0.65 });
    m.addPrism(0, 0, 0.98, 1.24, 0.075, 0.02, 6, 0, [255, 252, 240], { spec: 0.60 });

    // Glowing cyan architectural window strips on spire core
    const winPulse = 0.68 + 0.20 * Math.sin(time * 0.004 + phase);
    m.addBox(0, -0.19, 0.35, 0.055, 0.02, 0.14, [56, 189, 248], { emissive: winPulse, depthBias: 0.003 });
    m.addBox(0, 0.19, 0.35, 0.055, 0.02, 0.14, [56, 189, 248], { emissive: winPulse, depthBias: 0.003 });
    m.addBox(0, -0.125, 0.74, 0.04, 0.02, 0.11, [103, 232, 249], { emissive: winPulse, depthBias: 0.003 });

    // Twin sleek flanking glass towers
    m.addPrism(-0.33, 0.12, 0.14, 0.68, 0.13, 0.075, 6, 0, [224, 242, 254], { spec: 0.65, emissive: 0.18 });
    m.addPrism(-0.33, 0.12, 0.68, 0.78, 0.075, 0.015, 6, 0, [251, 191, 36], { emissive: 0.60 });
    m.addPrism(0.32, -0.14, 0.14, 0.58, 0.12, 0.068, 6, 0, [224, 242, 254], { spec: 0.65, emissive: 0.18 });
    m.addPrism(0.32, -0.14, 0.58, 0.67, 0.068, 0.015, 6, 0, [251, 191, 36], { emissive: 0.60 });

    // Pulsing summit beacon + rotating holographic orbital ring
    const spirePulse = 0.72 + 0.25 * Math.sin(time * 0.006 + phase);
    m.addPrism(0, 0, 1.24, 1.35, 0.045, 0.01, 6, 0, [103, 232, 249], { emissive: spirePulse });
    const ringSpin = time * 0.0022 + phase;
    const lw = Math.max(1.2, pxScale * 0.042);
    for (let k = 0; k < 6; k++) {
      const a0 = ringSpin + (Math.PI * 2 * k) / 6;
      const a1 = ringSpin + (Math.PI * 2 * (k + 1)) / 6;
      m.addLine(
        [Math.cos(a0) * 0.28, Math.sin(a0) * 0.28, 0.88 + Math.sin(a0) * 0.05],
        [Math.cos(a1) * 0.28, Math.sin(a1) * 0.28, 0.88 + Math.sin(a1) * 0.05],
        k % 2 === 0 ? "#ffc83a" : "#67e8f9",
        lw,
        0.008
      );
    }
  }

  function buildSkyCitadelModel(m, time, phase, pxScale) {
    // Stepped sapphire-gold citadel base + emerald arboretum lawn
    m.addPrism(0, 0, 0.0, 0.10, 0.68, 0.63, 8, Math.PI / 8, [67, 56, 202], { spec: 0.40 });
    m.addPrism(0, 0, 0.10, 0.13, 0.60, 0.57, 8, Math.PI / 8, [251, 191, 36], { spec: 0.56 });
    m.addPrism(0, 0, 0.13, 0.155, 0.52, 0.50, 8, 0, [16, 185, 129], { spec: 0.16 });

    // 4 gleaming marble colonnade pillars supporting central crystal dome
    const colOffsets = [
      [-0.30, -0.30],
      [0.30, -0.30],
      [0.30, 0.30],
      [-0.30, 0.30]
    ];
    for (let i = 0; i < colOffsets.length; i++) {
      const cx = colOffsets[i][0];
      const cy = colOffsets[i][1];
      m.addPrism(cx, cy, 0.15, 0.56, 0.068, 0.052, 6, 0, [248, 250, 252], { spec: 0.45 });
      m.addPrism(cx, cy, 0.56, 0.62, 0.06, 0.015, 6, 0, [251, 191, 36], { emissive: 0.55 });
    }

    // Grand central luminous azure-violet crystal sky-dome
    const domePulse = 0.30 + 0.14 * Math.sin(time * 0.0032 + phase);
    m.addDome(0, 0, 0.16, 0.34, 0.34, 0.38, 3, 10, [99, 102, 241], {
      spec: 0.72,
      emissive: domePulse,
      stroke: "rgba(186, 230, 253, 0.65)",
      lineWidth: Math.max(0.6, pxScale * 0.016)
    });

    // Hovering spinning golden crystal monument above dome
    const hoverZ = 0.80 + 0.045 * Math.sin(time * 0.0038 + phase);
    const spin = time * 0.002 + phase;
    m.addPrism(0, 0, hoverZ - 0.15, hoverZ, 0.015, 0.14, 6, spin, [245, 158, 11], { emissive: 0.48, spec: 0.70 });
    m.addPrism(0, 0, hoverZ, hoverZ + 0.22, 0.14, 0.015, 6, spin, [254, 240, 138], { emissive: 0.78, spec: 0.85 });
  }

  function buildUtopiaSpireFast(m, time, phase) {
    // Lean ~14-face utopian sky spire for silky 60fps Nova-7 metropolis rendering
    m.addPrism(0, 0, 0.0, 0.10, 0.62, 0.56, 6, 0, [251, 191, 36], { spec: 0.55 });
    m.addPrism(0, 0, 0.10, 0.72, 0.24, 0.12, 5, 0, [248, 250, 252], { spec: 0.52 });
    m.addPrism(0, 0, 0.72, 0.78, 0.16, 0.13, 5, 0, [251, 191, 36], { spec: 0.62 });
    const glow = 0.68 + 0.22 * Math.sin(time * 0.004 + phase);
    m.addPrism(0, 0, 0.78, 1.18, 0.09, 0.01, 4, Math.PI / 4, [56, 189, 248], { emissive: glow, spec: 0.7 });
  }

  function buildSkyCitadelFast(m, time, phase) {
    // Lean ~12-face azure-gold citadel dome for 60fps Nova-7 metropolis rendering
    m.addPrism(0, 0, 0.0, 0.11, 0.62, 0.56, 6, 0, [67, 56, 202], { spec: 0.38 });
    m.addPrism(0, 0, 0.11, 0.44, 0.42, 0.12, 6, Math.PI / 6, [56, 189, 248], { emissive: 0.35, spec: 0.72 });
    const bob = 0.03 * Math.sin(time * 0.0038 + phase);
    m.addPrism(0, 0, 0.54 + bob, 0.76 + bob, 0.14, 0.015, 4, time * 0.002 + phase, [254, 240, 138], {
      emissive: 0.78,
      spec: 0.85
    });
  }

  function buildUtopiaClusterFast(m) {
    // Trio of staggered low-poly golden-glass arcology towers (~14 faces total)
    m.addPrism(0, 0, 0.0, 0.09, 0.60, 0.54, 6, 0, [16, 185, 129], { spec: 0.18 });
    m.addPrism(-0.18, 0.12, 0.09, 0.68, 0.16, 0.09, 4, Math.PI / 4, [241, 245, 249], { spec: 0.52 });
    m.addPrism(0.20, -0.08, 0.09, 0.54, 0.14, 0.07, 4, 0, [251, 191, 36], { spec: 0.58 });
    m.addPrism(0.02, -0.22, 0.09, 0.42, 0.13, 0.06, 4, Math.PI / 4, [125, 211, 252], { emissive: 0.35, spec: 0.68 });
  }

  function buildEscapeCraftModel(m, time, phase, pxScale, opts) {
    // Coordinates in ship frame: +Z = forward nose, +Y = dorsal top, +X = starboard right wing
    const o = opts || {};
    const thr = o.thrust !== undefined ? clamp01(o.thrust) : 0;
    const reentry = o.reentryGlow !== undefined ? clamp01(o.reentryGlow) : 0;
    const beacon = o.beacon !== false;
    const sputter = Boolean(o.sputter);

    // 1. 3D Re-entry Atmospheric Bow-Shock Plasma Cone & Streaming Ribs (when diving into atmosphere)
    if (reentry > 0.02) {
      const flick = 0.88 + 0.18 * Math.sin(time * 0.065 + phase);
      const shockTip = 1.18 + 0.16 * reentry * flick;
      // Blazing incandescent nose shock cap
      m.addPrism(0, 0, shockTip - 0.22, shockTip + 0.08, 0.20, 0.02, 6, Math.PI / 6, [255, 252, 224], {
        emissive: 1.0,
        spec: 0.2,
        depthBias: 0.012
      });
      // 6 sweeping 3D plasma bow-shock ribbons arcing back past wings & tail
      for (let k = 0; k < 6; k++) {
        const ang = (Math.PI * 2 * k) / 6 + time * 0.008;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const tx = -sa;
        const ty = ca;
        const rMid = (k % 2 === 0 ? 0.56 : 0.44) * (0.75 + 0.30 * reentry) * flick;
        const rBack = rMid * 1.38;
        const zBack = -0.35 - 0.55 * reentry * flick;
        const wFront = 0.06;
        const wBack = 0.14;
        const pCol = k % 2 === 0 ? [255, 200, 58] : [255, 90, 77];

        m.addQuad(
          [ca * 0.16 - tx * wFront, sa * 0.16 - ty * wFront, shockTip - 0.14],
          [ca * 0.16 + tx * wFront, sa * 0.16 + ty * wFront, shockTip - 0.14],
          [ca * rBack + tx * wBack, sa * rBack + ty * wBack, zBack],
          [ca * rBack - tx * wBack, sa * rBack - ty * wBack, zBack],
          pCol,
          { doubleSided: true, emissive: 0.96, spec: 0.1, depthBias: -0.006 }
        );
      }
    }

    // 2. Layered 3D Exhaust Plumes (when engine thrust > 0)
    if (thr > 0.02) {
      const flicker = 0.86 + 0.24 * Math.sin(time * 0.055 + phase);
      const exLen = (0.48 + 0.72 * thr) * flicker;
      const spin = time * 0.016 + phase;
      const zNoz = -0.78;
      const outerCol = sputter ? [255, 90, 77] : [56, 189, 248];
      const midCol = sputter ? [251, 146, 60] : [186, 230, 253];

      m.addPrism(0, 0, zNoz - exLen * 0.58, zNoz - exLen, 0.105, 0.002, 5, spin, outerCol, {
        emissive: 0.92,
        spec: 0.1
      });
      m.addPrism(0, 0, zNoz - exLen * 0.22, zNoz - exLen * 0.72, 0.138, 0.055, 5, -spin, midCol, {
        emissive: 0.98,
        spec: 0.1
      });
      m.addPrism(0, 0, zNoz, zNoz - exLen * 0.34, 0.125, 0.085, 5, spin * 0.5, [255, 255, 255], {
        emissive: 1.0,
        spec: 0.1
      });
    }

    // 3. 3D Swept Fuselage (crimson nose cone, forward fuselage, mid-aft hull, dark thermal belly, red flank stripes)
    m.addPrism(0, 0, 0.56, 1.06, 0.19, 0.022, 6, Math.PI / 6, [255, 90, 77], { spec: 0.48 });
    m.addPrism(0, 0, 0.14, 0.56, 0.245, 0.19, 6, Math.PI / 6, [248, 250, 252], { spec: 0.52 });
    m.addPrism(0, 0, -0.58, 0.14, 0.215, 0.245, 6, Math.PI / 6, [232, 238, 248], { spec: 0.46 });
    m.addPrism(0, 0, -0.64, -0.58, 0.19, 0.215, 6, Math.PI / 6, [71, 85, 105], { spec: 0.30 });
    m.addBox(0, -0.17, -0.06, 0.145, 0.05, 0.52, [68, 82, 104], { spec: 0.24 });

    // Crimson racing stripes along port & starboard flanks
    m.addBox(-0.225, 0.01, -0.05, 0.026, 0.052, 0.50, [224, 62, 49], { spec: 0.36 });
    m.addBox(0.225, 0.01, -0.05, 0.026, 0.052, 0.50, [255, 90, 77], { spec: 0.36 });

    // 4. 3D Cockpit Canopy & Inner Pilot Visor Glow
    m.addBox(0, 0.19, 0.26, 0.105, 0.072, 0.22, [56, 189, 248], { emissive: 0.48, spec: 0.85 });
    m.addPrism(0, 0.185, 0.44, 0.62, 0.105, 0.02, 6, 0, [56, 189, 248], { emissive: 0.45, spec: 0.82 });
    m.addBox(0, 0.23, 0.28, 0.07, 0.04, 0.11, [253, 224, 71], { emissive: 0.72, depthBias: 0.002 });

    // 5. Solid 3D Swept Delta Wings (Starboard +X & Port -X) with Embedded Blue Solar Arrays & Nav Lights
    const lw = Math.max(0.9, pxScale * 0.025);
    for (let s = -1; s <= 1; s += 2) {
      const rx0 = s * 0.19;
      const rx1 = s * 0.88;
      const yTop = 0.025;
      const yBot = -0.045;
      const wingRef = m.toWorld(s * 0.48, -0.01, -0.24);
      const wingOpt = { spec: 0.42, refWorld: wingRef };
      const topCol = s > 0 ? [226, 232, 240] : [206, 216, 230];
      const sideCol = [148, 163, 184];

      // Top, bottom, leading edge, trailing edge, and tip cap
      m.addQuad([rx0, yTop, 0.22], [rx0, yTop, -0.48], [rx1, yTop, -0.56], [rx1, yTop, -0.18], topCol, wingOpt);
      m.addQuad([rx0, yBot, 0.22], [rx1, yBot, -0.18], [rx1, yBot, -0.56], [rx0, yBot, -0.48], sideCol, wingOpt);
      m.addQuad([rx0, yTop, 0.22], [rx1, yTop, -0.18], [rx1, yBot, -0.18], [rx0, yBot, 0.22], [241, 245, 249], wingOpt);
      m.addQuad([rx0, yTop, -0.48], [rx0, yBot, -0.48], [rx1, yBot, -0.56], [rx1, yTop, -0.56], sideCol, wingOpt);
      m.addQuad([rx1, yTop, -0.18], [rx1, yTop, -0.56], [rx1, yBot, -0.56], [rx1, yBot, -0.18], [255, 90, 77], wingOpt);

      // Cobalt solar wing array mounted flush on dorsal surface (matches crash_base solar wing)
      const sx0 = s * 0.26;
      const sx1 = s * 0.72;
      m.addQuad(
        [sx0, yTop + 0.012, 0.04],
        [sx0, yTop + 0.012, -0.38],
        [sx1, yTop + 0.012, -0.47],
        [sx1, yTop + 0.012, -0.20],
        [37, 99, 235],
        { refWorld: wingRef, spec: 0.90, emissive: 0.16, depthBias: 0.003 }
      );
      m.addLine(
        [(sx0 + sx1) * 0.5, yTop + 0.018, -0.08],
        [(sx0 + sx1) * 0.5, yTop + 0.018, -0.425],
        "rgba(186, 230, 253, 0.82)",
        lw,
        0.002
      );

      // Wingtip navigation beacon pod (red port, cyan-green starboard)
      m.addBox(s * 0.89, -0.005, -0.37, 0.038, 0.045, 0.14, s < 0 ? [255, 90, 77] : [52, 211, 153], {
        emissive: 0.72,
        spec: 0.5
      });

      // Twin wing-root auxiliary thruster pods
      m.addPrism(s * 0.29, -0.025, -0.66, -0.34, 0.058, 0.068, 6, 0, [100, 116, 139], { spec: 0.38 });
      m.addBox(s * 0.29, -0.025, -0.67, 0.036, 0.036, 0.018, sputter ? [251, 146, 60] : [56, 189, 248], {
        emissive: thr > 0 ? 0.85 : 0.15
      });
    }

    // 6. Solid 3D Vertical Crimson Tail Fin & Blinking Red Distress Beacon
    const finRef = m.toWorld(0, 0.40, -0.46);
    const finOpt = { spec: 0.38, refWorld: finRef };
    m.addQuad([-0.026, 0.18, -0.14], [-0.026, 0.18, -0.62], [-0.026, 0.66, -0.60], [-0.026, 0.60, -0.42], [224, 62, 49], finOpt);
    m.addQuad([0.026, 0.18, -0.14], [0.026, 0.60, -0.42], [0.026, 0.66, -0.60], [0.026, 0.18, -0.62], [255, 90, 77], finOpt);
    m.addQuad([-0.026, 0.18, -0.14], [-0.026, 0.60, -0.42], [0.026, 0.60, -0.42], [0.026, 0.18, -0.14], [255, 135, 115], finOpt);
    m.addQuad([-0.026, 0.18, -0.62], [0.026, 0.18, -0.62], [0.026, 0.66, -0.60], [-0.026, 0.66, -0.60], [190, 48, 38], finOpt);
    m.addQuad([-0.026, 0.60, -0.42], [-0.026, 0.66, -0.60], [0.026, 0.66, -0.60], [0.026, 0.60, -0.42], [255, 120, 100], finOpt);

    if (beacon) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.009 + phase);
      m.addDome(0, 0.65, -0.53, 0.055, 0.065, 0.055, 2, 6, pulse > 0.45 ? [255, 90, 77] : [140, 32, 32], {
        emissive: 0.25 + 0.75 * pulse
      });
    }

    // 7. Main Rear Thruster Nozzle Bell + Inner Reactor Glow
    m.addPrism(0, 0, -0.78, -0.62, 0.155, 0.115, 8, Math.PI / 8, [71, 85, 105], { spec: 0.36 });
    m.addBox(0, 0, -0.785, 0.09, 0.09, 0.02, sputter ? [251, 146, 60] : [56, 189, 248], {
      emissive: thr > 0 ? 0.92 : 0.28
    });
  }

  function renderEscapeCraft3D(ctx, frame, time, buildScale, opts) {
    if (!ctx || !frame) return;
    const collector = createMeshCollector(frame, buildScale, opts);
    const pxScale = frame.scale * (frame.focalLength / 3.8);
    const phase = frame.phase || 0;
    buildEscapeCraftModel(collector, time, phase, pxScale, opts);
    collector.drawAll(ctx);
  }

  function renderRocketVessel3D(ctx, rocketId, frame, time, buildScale, opts) {
    if (!ctx || !frame) return;
    const collector = createMeshCollector(frame, buildScale, opts);
    const pxScale = frame.scale * (frame.focalLength / 3.8);
    const phase = frame.phase || 0;
    const vOpts = Object.assign(
      { zOffset: -0.44, jx: 0, vesselScale: 1, preLaunchGlow: 0.75, thrust: 1.0 },
      opts || {}
    );

    if (rocketId === "space_rocket_1") {
      buildSpaceRocket1Vessel3D(collector, time, phase, pxScale, vOpts);
    } else if (rocketId === "space_rocket_2") {
      buildSpaceRocket2Vessel3D(collector, time, phase, pxScale, vOpts);
    } else if (rocketId === "trade_rocket_1") {
      buildTradeRocket1Vessel3D(collector, time, phase, pxScale, vOpts);
    } else if (rocketId === "trade_rocket_2") {
      buildTradeRocket2Vessel3D(collector, time, phase, pxScale, vOpts);
    } else if (rocketId === "trade_rocket_3") {
      buildTradeRocket3Vessel3D(collector, time, phase, pxScale, vOpts);
    }

    collector.drawAll(ctx);
  }

  function renderBuilding3D(ctx, buildingId, frame, time, buildScale, opts) {
    if (!ctx || !frame) return;

    const collector = createMeshCollector(frame, buildScale, opts);
    const pxScale = frame.scale * (frame.focalLength / 3.8);
    const phase = frame.phase || 0;

    if (buildingId === "mine") {
      buildMineModel(collector, time, phase, pxScale);
    } else if (buildingId === "deep_mine") {
      buildDeepMineModel(collector, time, phase, pxScale);
    } else if (buildingId === "mega_quarry") {
      buildMegaQuarryModel(collector, time, phase, pxScale);
    } else if (buildingId === "research_center") {
      buildResearchCenterModel(collector, time, phase, pxScale);
    } else if (buildingId === "research_lab") {
      buildResearchLabModel(collector, time, phase, pxScale);
    } else if (buildingId === "observatory") {
      buildObservatoryModel(collector, time, phase, pxScale);
    } else if (buildingId === "quantum_array") {
      buildQuantumArrayModel(collector, time, phase, pxScale);
    } else if (buildingId === "ore_research_station") {
      buildOreResearchStationModel(collector, time, phase, pxScale);
    } else if (buildingId === "small_house" || buildingId === "house") {
      buildSmallHouseModel(collector, time, phase, pxScale);
    } else if (buildingId === "big_house") {
      buildBigHouseModel(collector, time, phase, pxScale);
    } else if (buildingId === "villa") {
      buildVillaModel(collector, time, phase, pxScale);
    } else if (buildingId === "windmill") {
      buildWindmillModel(collector, time, phase, pxScale);
    } else if (buildingId === "wind_turbine") {
      buildWindTurbineModel(collector, time, phase, pxScale);
    } else if (buildingId === "wind_farm") {
      buildWindFarmModel(collector, time, phase, pxScale);
    } else if (buildingId === "solar_panel") {
      buildSolarPanelModel(collector, time, phase, pxScale);
    } else if (buildingId === "solar_array") {
      buildSolarArrayModel(collector, time, phase, pxScale);
    } else if (buildingId === "solar_tower") {
      buildSolarTowerModel(collector, time, phase, pxScale);
    } else if (buildingId === "space_rocket_1") {
      buildSpaceRocket1Model(collector, time, phase, pxScale);
    } else if (buildingId === "space_rocket_2") {
      buildSpaceRocket2Model(collector, time, phase, pxScale);
    } else if (buildingId === "trade_rocket_1") {
      buildTradeRocket1Model(collector, time, phase, pxScale, opts);
    } else if (buildingId === "trade_rocket_2") {
      buildTradeRocket2Model(collector, time, phase, pxScale, opts);
    } else if (buildingId === "trade_rocket_3") {
      buildTradeRocket3Model(collector, time, phase, pxScale, opts);
    } else if (buildingId === "crash_base") {
      buildCrashBaseModel(collector, time, phase, pxScale);
    } else if (buildingId === "utopia_spire") {
      buildUtopiaSpireModel(collector, time, phase, pxScale);
    } else if (buildingId === "sky_citadel") {
      buildSkyCitadelModel(collector, time, phase, pxScale);
    } else if (buildingId === "utopia_spire_fast") {
      buildUtopiaSpireFast(collector, time, phase);
    } else if (buildingId === "sky_citadel_fast") {
      buildSkyCitadelFast(collector, time, phase);
    } else if (buildingId === "utopia_cluster_fast") {
      buildUtopiaClusterFast(collector);
    }

    collector.drawAll(ctx);
  }

  // --- 3D Cartoon Tile Construction & Demolition VFX ---

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function easeInQuart(t) {
    return t * t * t * t;
  }

  function easeOutCubic(t) {
    const inv = 1 - t;
    return 1 - inv * inv * inv;
  }

  function pseudoRand(seed) {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }

  function projectLocal(frame, lx, ly, lz) {
    const s = frame.scale;
    const t = frame.rotT;
    const b = frame.rotB;
    const n = frame.rotN;
    const world = {
      x: frame.origin.x + (t.x * lx + b.x * ly + n.x * lz) * s,
      y: frame.origin.y + (t.y * lx + b.y * ly + n.y * lz) * s,
      z: frame.origin.z + (t.z * lx + b.z * ly + n.z * lz) * s
    };
    return frame.project(world, frame.cx, frame.cy, frame.focalLength);
  }

  function drawFusedCloud(ctx, puffs, alpha, outlineCol, shadowCol, bodyCol, highlightCol, outlineW) {
    if (alpha <= 0.01 || puffs.length === 0) return;

    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);

    // Pass 1: Unified dark ink silhouette
    ctx.fillStyle = outlineCol;
    for (let i = 0; i < puffs.length; i++) {
      const pf = puffs[i];
      if (pf.r <= 0.3) continue;
      ctx.beginPath();
      ctx.arc(pf.x, pf.y, pf.r + outlineW, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pass 2: Cool lower/belly shading
    ctx.fillStyle = shadowCol;
    for (let i = 0; i < puffs.length; i++) {
      const pf = puffs[i];
      if (pf.r <= 0.3) continue;
      ctx.beginPath();
      ctx.arc(pf.x, pf.y, pf.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pass 3: Main cel body offset upward-left
    ctx.fillStyle = bodyCol;
    for (let i = 0; i < puffs.length; i++) {
      const pf = puffs[i];
      if (pf.r <= 0.5) continue;
      ctx.beginPath();
      ctx.arc(pf.x - pf.r * 0.08, pf.y - pf.r * 0.12, pf.r * 0.90, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pass 4: Crisp highlight crown
    ctx.fillStyle = highlightCol;
    for (let i = 0; i < puffs.length; i++) {
      const pf = puffs[i];
      if (pf.r <= 1.2) continue;
      ctx.beginPath();
      ctx.arc(pf.x - pf.r * 0.20, pf.y - pf.r * 0.24, pf.r * 0.54, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawSparkle4(ctx, x, y, size, rot, fillCol, outlineCol, alpha) {
    if (size <= 0.5 || alpha <= 0.02) return;
    const inner = size * 0.28;

    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? size : inner;
      const a = (i * Math.PI) / 4;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1.8, size * 0.32);
    ctx.strokeStyle = outlineCol;
    ctx.stroke();
    ctx.fillStyle = fillCol;
    ctx.fill();
    ctx.restore();
  }

  function drawImpactStarburst(ctx, x, y, outerR, innerR, spikes, rot, alpha) {
    if (outerR <= 1 || alpha <= 0.02) return;

    function traceStar(rOut, rIn) {
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? rOut : rIn;
        const a = rot + (i * Math.PI) / spikes;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);
    ctx.translate(x, y);
    ctx.lineJoin = "round";

    // Outer crimson-orange impact burst with cartoon ink outline
    traceStar(outerR, innerR);
    ctx.lineWidth = Math.max(2.4, outerR * 0.14);
    ctx.strokeStyle = "#1b1147";
    ctx.stroke();
    ctx.fillStyle = "#ff5a4d";
    ctx.fill();

    // Inner bright gold burst
    traceStar(outerR * 0.72, innerR * 0.78);
    ctx.fillStyle = "#ffc83a";
    ctx.fill();

    // Hot white flash core
    traceStar(outerR * 0.40, innerR * 0.50);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();
  }

  function drawCartoonHammer(ctx, anchorX, anchorY, scalePx, baseUpAngle, swingAngle, alpha, showWhoosh, whooshAlpha) {
    if (alpha <= 0.01 || scalePx <= 1) return;

    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);
    ctx.translate(anchorX, anchorY);
    // Align 0 rad along surface normal up: baseUpAngle + PI/2 maps (0, -1) to normal direction
    ctx.rotate(baseUpAngle + Math.PI * 0.5);

    const handleLen = scalePx * 1.15;
    const handleW = Math.max(4, scalePx * 0.17);
    const headLen = scalePx * 0.92;
    const headThick = Math.max(10, scalePx * 0.44);
    const inkW = Math.max(2.0, scalePx * 0.085);

    // Sweeping motion-whoosh arc during the smash stroke (swings CCW from wind-up to center strike)
    if (showWhoosh && whooshAlpha > 0.02) {
      ctx.save();
      ctx.globalAlpha *= whooshAlpha;
      const arcR = handleLen * 0.94;
      ctx.beginPath();
      ctx.arc(0, 0, arcR, swingAngle - Math.PI * 0.5 - 0.06, swingAngle - Math.PI * 0.5 + 0.88);
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(4, scalePx * 0.22);
      ctx.strokeStyle = "#fff3b0";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcR * 0.86, swingAngle - Math.PI * 0.5 - 0.03, swingAngle - Math.PI * 0.5 + 0.66);
      ctx.lineWidth = Math.max(2, scalePx * 0.10);
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();
    }

    // Rotate hammer mallet around bottom grip pivot
    ctx.rotate(swingAngle);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Wooden Handle + Warm Highlight
    const hx = -handleW * 0.5;
    const hy = -handleLen;
    ctx.fillStyle = "#e89428";
    ctx.strokeStyle = "#1b1147";
    ctx.lineWidth = inkW;
    ctx.beginPath();
    ctx.rect(hx, hy, handleW, handleLen);
    ctx.fill();
    ctx.fillStyle = "#ffc85a";
    ctx.fillRect(hx + handleW * 0.14, hy + 2, handleW * 0.34, handleLen - 4);
    ctx.stroke();

    // Grip pommel cap
    ctx.beginPath();
    ctx.arc(0, 0, handleW * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = "#6c55e8";
    ctx.fill();
    ctx.stroke();

    // Top of handle connects to center of hammer head
    const headX = -headLen * 0.5;
    const headY = -handleLen - headThick * 0.5;
    const chamfer = headThick * 0.20;

    ctx.beginPath();
    ctx.moveTo(headX + chamfer, headY);
    ctx.lineTo(headX + headLen - chamfer, headY);
    ctx.lineTo(headX + headLen, headY + chamfer);
    ctx.lineTo(headX + headLen, headY + headThick - chamfer);
    ctx.lineTo(headX + headLen - chamfer, headY + headThick);
    ctx.lineTo(headX + chamfer, headY + headThick);
    ctx.lineTo(headX, headY + headThick - chamfer);
    ctx.lineTo(headX, headY + chamfer);
    ctx.closePath();

    // Base dark steel fill
    ctx.fillStyle = "#64748b";
    ctx.fill();

    // Upper steel cel highlight & red hazard center collar clipped inside head
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(headX, headY, headLen, headThick * 0.36);

    ctx.fillStyle = "#ff5a4d";
    ctx.fillRect(-headLen * 0.14, headY, headLen * 0.28, headThick);
    ctx.fillStyle = "#ff9d90";
    ctx.fillRect(-headLen * 0.14, headY, headLen * 0.28, headThick * 0.30);
    ctx.restore();

    // Crisp outer dark ink outline over whole hammer head
    ctx.strokeStyle = "#1b1147";
    ctx.lineWidth = inkW;
    ctx.stroke();

    ctx.restore();
  }

  function renderBuildEffect(ctx, effect, frame, p, depthScale) {
    const seedBase = effect.seed || 1;
    const centerPt = projectLocal(frame, 0, 0, 0.04);

    // 1. Expanding soft ground flash hex ring flush on tile surface
    if (p < 0.52) {
      const ringT = easeOutCubic(p / 0.52);
      const rad = 0.42 + 0.56 * ringT;
      ctx.save();
      ctx.globalAlpha *= (1 - ringT) * 0.78;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k + 0.25;
        const pt = projectLocal(frame, Math.cos(a) * rad, Math.sin(a) * rad, 0.03);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.lineWidth = Math.max(1.8, depthScale * 0.085 * (1 - ringT * 0.4));
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();
    }

    // 2. Billowing Cartoon White Fog Cloud (11 fused cel-shaded puffs)
    const expandT = easeOutCubic(Math.min(1, p * 1.15));
    const swell = p < 0.26
      ? easeOutCubic(p / 0.26)
      : p < 0.56
        ? 1
        : Math.max(0, 1 - (p - 0.56) / 0.44);
    const cloudAlpha = p < 0.12
      ? p / 0.12
      : p > 0.62
        ? Math.max(0, 1 - (p - 0.62) / 0.38)
        : 1;

    const puffs = [];
    // Low fused cloud collar (8 overlapping chunky puffs)
    for (let i = 0; i < 8; i++) {
      const r1 = pseudoRand(seedBase + i * 3.17);
      const r2 = pseudoRand(seedBase + i * 7.41 + 11);
      const angle = (Math.PI * 2 * i) / 8 + (r1 - 0.5) * 0.34;
      const dist = 0.08 + (0.40 + r2 * 0.16) * expandT;
      const lz = 0.05 + (0.08 + r1 * 0.12) * expandT + Math.sin(p * Math.PI) * 0.05;
      const pt = projectLocal(frame, Math.cos(angle) * dist, Math.sin(angle) * dist, lz);
      const radiusPx = depthScale * (0.26 + r2 * 0.12) * (0.45 + 0.55 * swell);
      puffs.push({ x: pt.x, y: pt.y, r: radiusPx, z: pt.z });
    }
    // 3 inner puffs peaking early then parting aside as building pops above
    const crownSwell = p < 0.24 ? easeOutCubic(p / 0.24) : Math.max(0, 1 - (p - 0.24) / 0.40);
    if (crownSwell > 0.04) {
      for (let i = 0; i < 3; i++) {
        const r1 = pseudoRand(seedBase + 50 + i * 5.23);
        const angle = (Math.PI * 2 * i) / 3 + seedBase * 0.7;
        const dist = (0.12 + r1 * 0.16) * expandT;
        const lz = 0.16 + (0.18 + r1 * 0.12) * expandT;
        const pt = projectLocal(frame, Math.cos(angle) * dist, Math.sin(angle) * dist, lz);
        const radiusPx = depthScale * (0.28 + r1 * 0.08) * crownSwell;
        puffs.push({ x: pt.x, y: pt.y, r: radiusPx, z: pt.z });
      }
    }

    drawFusedCloud(
      ctx,
      puffs,
      cloudAlpha,
      "#1b1147",
      "#c7d4f2",
      "#eef5ff",
      "#ffffff",
      Math.max(1.8, depthScale * 0.048)
    );

    // 3. 5 Celebratory Golden-White Cartoon Sparkles popping as the fog clears
    if (p > 0.26) {
      const spT = clamp01((p - 0.26) / 0.70);
      for (let i = 0; i < 5; i++) {
        const delay = i * 0.08;
        const localT = clamp01((spT - delay) / 0.68);
        if (localT <= 0 || localT >= 1) continue;

        const r1 = pseudoRand(seedBase + 100 + i * 4.3);
        const angle = (Math.PI * 2 * i) / 5 + 0.4 + r1 * 0.5;
        const dist = 0.34 + 0.44 * localT;
        const lz = 0.28 + 0.52 * easeOutCubic(localT);
        const pt = projectLocal(frame, Math.cos(angle) * dist, Math.sin(angle) * dist, lz);
        const popScale = Math.sin(localT * Math.PI);
        const sizePx = depthScale * (0.14 + r1 * 0.06) * popScale;
        const fillCol = i % 2 === 0 ? "#ffc83a" : "#ffffff";
        drawSparkle4(ctx, pt.x, pt.y, sizePx, localT * 1.4 + i, fillCol, "#1b1147", popScale);
      }
    }

    // Subtle soft ambient mist tint at base center early in build
    if (p < 0.42 && centerPt) {
      ctx.save();
      ctx.globalAlpha *= (1 - p / 0.42) * 0.35;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, depthScale * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function renderDemolishEffect(ctx, effect, frame, p, depthScale) {
    const seedBase = effect.seed || 2;
    const IMPACT_T = 0.32;

    // Height of impact target for each building type (local Z above tile base)
    const buildingImpactHeights = {
      mine: 0.60,
      deep_mine: 0.72,
      mega_quarry: 0.84,
      research_center: 0.78,
      research_lab: 0.38,
      observatory: 0.64,
      quantum_array: 0.86,
      ore_research_station: 0.90,
      small_house: 0.36,
      house: 0.36,
      big_house: 0.54,
      villa: 0.66,
      windmill: 0.75,
      wind_turbine: 0.86,
      wind_farm: 0.88,
      solar_panel: 0.32,
      solar_array: 0.50,
      solar_tower: 0.76,
      space_rocket_1: 0.88,
      space_rocket_2: 0.96,
      trade_rocket_1: 0.84,
      trade_rocket_2: 0.90,
      trade_rocket_3: 0.96
    };
    const targetZ = buildingImpactHeights[effect.buildingId] || 0.40;

    // 1. Dark Gritty Demolition Smoke Cloud + Flying Angular 3D Rubble (post-impact)
    if (p >= IMPACT_T - 0.02) {
      const postT = clamp01((p - (IMPACT_T - 0.02)) / (1 - (IMPACT_T - 0.02)));
      const burstT = easeOutCubic(postT);
      const smokeSwell = postT < 0.22
        ? easeOutCubic(postT / 0.22)
        : Math.max(0, 1 - (postT - 0.22) / 0.78);
      const smokeAlpha = postT > 0.55
        ? Math.max(0, 1 - (postT - 0.55) / 0.45)
        : 1;

      const smokePuffs = [];
      for (let i = 0; i < 11; i++) {
        const r1 = pseudoRand(seedBase + 10 + i * 4.11);
        const r2 = pseudoRand(seedBase + 30 + i * 6.73);
        const angle = (Math.PI * 2 * i) / 11 + (r1 - 0.5) * 0.45;
        const isCore = i < 4;
        const dist = isCore ? (0.04 + 0.24 * burstT) : (0.12 + (0.34 + r2 * 0.18) * burstT);
        const lz = 0.06 + (isCore ? 0.36 : 0.22) * burstT + r1 * 0.12;
        const pt = projectLocal(frame, Math.cos(angle) * dist, Math.sin(angle) * dist, lz);
        const radiusPx = depthScale * (isCore ? (0.28 + r2 * 0.11) : (0.22 + r2 * 0.10)) * (0.45 + 0.55 * smokeSwell);
        smokePuffs.push({ x: pt.x, y: pt.y, r: radiusPx });
      }

      // Clearly darker charcoal-violet / warm dust smoke palette (distinct from snowy build fog)
      drawFusedCloud(
        ctx,
        smokePuffs,
        smokeAlpha,
        "#1b1147",
        "#483e63",
        "#7d7294",
        "#b4a7ba",
        Math.max(1.8, depthScale * 0.050)
      );

      // 8 Tumbling 3D Debris Chunks on ballistic arcs
      if (postT < 0.94) {
        const debT = clamp01(postT / 0.94);
        const chunkColors = ["#94a3b8", "#cbd5e1", "#ffb13b", "#6c55e8"];
        ctx.save();
        ctx.lineJoin = "round";
        for (let i = 0; i < 8; i++) {
          const r1 = pseudoRand(seedBase + 200 + i * 3.7);
          const r2 = pseudoRand(seedBase + 220 + i * 5.9);
          const angle = (Math.PI * 2 * i) / 8 + (r1 - 0.5) * 0.6;
          const speedXY = 0.55 + r2 * 0.65;
          const v0z = 1.65 + r1 * 0.85;
          const gravity = 3.9;
          const lx = Math.cos(angle) * speedXY * debT;
          const ly = Math.sin(angle) * speedXY * debT;
          const lz = Math.max(0.02, 0.12 + v0z * debT - 0.5 * gravity * debT * debT);
          const pt = projectLocal(frame, lx, ly, lz);

          const chunkAlpha = debT > 0.68 ? Math.max(0, 1 - (debT - 0.68) / 0.32) : 1;
          const sz = depthScale * (0.095 + r1 * 0.055) * (1 - debT * 0.25);
          const rot = debT * (6 + i * 1.9) * (i % 2 === 0 ? 1 : -1);

          ctx.save();
          ctx.globalAlpha *= chunkAlpha;
          ctx.translate(pt.x, pt.y);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.moveTo(-sz, -sz * 0.55);
          ctx.lineTo(sz * 0.85, -sz * 0.78);
          ctx.lineTo(sz, sz * 0.50);
          ctx.lineTo(-sz * 0.45, sz * 0.85);
          ctx.closePath();
          ctx.lineWidth = Math.max(1.5, sz * 0.38);
          ctx.strokeStyle = "#1b1147";
          ctx.stroke();
          ctx.fillStyle = chunkColors[i % chunkColors.length];
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // 4 Hot Orange-Gold Ember Sparks
      if (postT < 0.65) {
        const emT = postT / 0.65;
        for (let i = 0; i < 4; i++) {
          const r1 = pseudoRand(seedBase + 300 + i * 8.3);
          const angle = (Math.PI * 2 * i) / 4 + 0.55 + r1 * 0.7;
          const lx = Math.cos(angle) * (0.28 + 0.72 * emT);
          const ly = Math.sin(angle) * (0.28 + 0.72 * emT);
          const lz = 0.15 + (1.25 + r1 * 0.5) * emT - 1.1 * emT * emT;
          if (lz < 0) continue;
          const pt = projectLocal(frame, lx, ly, lz);
          drawSparkle4(
            ctx,
            pt.x,
            pt.y,
            depthScale * 0.11 * (1 - emT * 0.65),
            emT * 2.5,
            "#ff7a45",
            "#1b1147",
            1 - emT
          );
        }
      }
    }

    // 2. Comic Starburst Impact Flash at Smash Moment (0.30 -> 0.50)
    if (p >= 0.30 && p <= 0.50) {
      const fT = (p - 0.30) / 0.20;
      const strikePt = projectLocal(frame, 0, 0, targetZ * 0.75);
      const burstScale = Math.sin(Math.min(1, fT * 1.15) * Math.PI);
      const outerR = depthScale * (0.42 + 0.36 * easeOutCubic(fT)) * Math.max(0.25, burstScale);
      drawImpactStarburst(ctx, strikePt.x, strikePt.y, outerR, outerR * 0.44, 8, fT * 0.4, 1 - fT * 0.35);
    }

    // 3. Heavy Overhead Cartoon Demolition Hammer (0.00 -> 0.66)
    if (p < 0.66) {
      const hammerScale = depthScale * 0.90;
      const handleLen = hammerScale * 1.15;
      const headThick = Math.max(10, hammerScale * 0.44);
      const impactRadius = handleLen + headThick * 0.5;

      const pBase = projectLocal(frame, 0, 0, targetZ * 0.5);
      const pUp = projectLocal(frame, 0, 0, targetZ * 0.5 + 0.80);
      const dx = pUp.x - pBase.x;
      const dy = pUp.y - pBase.y;
      const projLen = Math.hypot(dx, dy);

      // Surface normal screen direction
      const screenUpX = 0;
      const screenUpY = -1;
      const blend = Math.min(1, projLen / Math.max(8, depthScale * 0.38));
      const nx = projLen > 0.001 ? dx / projLen : 0;
      const ny = projLen > 0.001 ? dy / projLen : -1;
      const normX = screenUpX * (1 - blend) + nx * blend;
      const normY = screenUpY * (1 - blend) + ny * blend;
      const normLen = Math.hypot(normX, normY) || 1;
      const uX = normX / normLen;
      const uY = normY / normLen;
      const baseUpAngle = Math.atan2(uY, uX);

      // Exact impact contact point directly atop the building model
      const impactTarget = projectLocal(frame, 0, 0, targetZ);

      // The hammer handle extends along -uVector (upwards from grip to head):
      // head_center = anchor + uVector * impactRadius
      // To place the head center exactly on impactTarget when striking at swingAngle = 0:
      // anchor = impactTarget - uVector * impactRadius
      const anchorX = impactTarget.x - uX * impactRadius;
      const anchorY = impactTarget.y - uY * impactRadius;

      let swingAngle = 0;
      let hammerAlpha = 1;
      let showWhoosh = false;
      let whooshAlpha = 0;

      if (p < 0.18) {
        const wT = easeOutCubic(p / 0.18);
        hammerAlpha = clamp01(p / 0.10);
        swingAngle = - (0.45 + 0.75 * wT); // -25deg -> -68deg (draw back overhead)
      } else if (p < IMPACT_T) {
        const sT = easeInQuart((p - 0.18) / (IMPACT_T - 0.18));
        swingAngle = - 1.20 * (1 - sT); // -68deg down to exactly 0.00deg (direct flush impact)
        showWhoosh = sT > 0.12;
        whooshAlpha = Math.sin(sT * Math.PI);
      } else if (p < 0.46) {
        const rT = easeOutCubic((p - IMPACT_T) / (0.46 - IMPACT_T));
        swingAngle = - 0.32 * Math.sin(rT * Math.PI); // slight elastic rebound bounce
      } else {
        const fT = (p - 0.46) / 0.20;
        swingAngle = - 0.08 * (1 - fT);
        hammerAlpha = Math.max(0, 1 - fT);
      }

      drawCartoonHammer(
        ctx,
        anchorX,
        anchorY,
        hammerScale,
        baseUpAngle,
        swingAngle,
        hammerAlpha,
        showWhoosh,
        whooshAlpha
      );
    }
  }

  function renderCrashEffect(ctx, effect, frame, p, depthScale) {
    const seedBase = effect.seed || 7;

    // 1. Expanding dusty shockwave hex ring
    if (p < 0.72) {
      const ringT = easeOutCubic(p / 0.72);
      const rad = 0.28 + 0.74 * ringT;
      ctx.save();
      ctx.globalAlpha *= (1 - ringT) * 0.85;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k + 0.25;
        const pt = projectLocal(frame, Math.cos(a) * rad, Math.sin(a) * rad, 0.03);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.lineWidth = Math.max(2, depthScale * 0.095 * (1 - ringT * 0.4));
      ctx.strokeStyle = "#ffc83a";
      ctx.stroke();
      ctx.restore();
    }

    // 2. Fiery comic starburst flash right at touchdown
    if (p < 0.28) {
      const stP = p / 0.28;
      const strikePt = projectLocal(frame, 0, 0, 0.16);
      const outerR = depthScale * (0.48 + 0.44 * easeOutCubic(stP));
      drawImpactStarburst(ctx, strikePt.x, strikePt.y, outerR, outerR * 0.44, 10, stP * 0.45, 1 - stP * 0.75);
    }

    // 3. 12 billowing charcoal-and-amber impact smoke puffs
    const expandT = easeOutCubic(Math.min(1, p * 1.1));
    const smokeSwell = p < 0.22 ? easeOutCubic(p / 0.22) : Math.max(0, 1 - (p - 0.22) / 0.78);
    const smokeAlpha = p > 0.52 ? Math.max(0, 1 - (p - 0.52) / 0.48) : 1;
    const smokePuffs = [];
    for (let i = 0; i < 12; i++) {
      const r1 = pseudoRand(seedBase + 15 + i * 4.13);
      const r2 = pseudoRand(seedBase + 35 + i * 6.91);
      const angle = (Math.PI * 2 * i) / 12 + (r1 - 0.5) * 0.4;
      const dist = (i < 4 ? 0.08 : 0.16) + (0.42 + r2 * 0.22) * expandT;
      const lz = 0.08 + (i < 4 ? 0.42 : 0.24) * expandT + r1 * 0.14;
      const pt = projectLocal(frame, Math.cos(angle) * dist, Math.sin(angle) * dist, lz);
      const radiusPx = depthScale * (0.24 + r2 * 0.12) * (0.45 + 0.55 * smokeSwell);
      smokePuffs.push({ x: pt.x, y: pt.y, r: radiusPx });
    }
    drawFusedCloud(
      ctx,
      smokePuffs,
      smokeAlpha,
      "#1b1147",
      "#574b68",
      "#8b7e96",
      "#e2c4a8",
      Math.max(1.8, depthScale * 0.05)
    );

    // 4. 10 tumbling debris chunks
    if (p < 0.92) {
      const debT = clamp01(p / 0.92);
      const cols = ["#64748b", "#94a3b8", "#ff5a4d", "#f59e0b"];
      for (let i = 0; i < 10; i++) {
        const r1 = pseudoRand(seedBase + 200 + i * 3.9);
        const r2 = pseudoRand(seedBase + 230 + i * 5.3);
        const angle = (Math.PI * 2 * i) / 10 + (r1 - 0.5) * 0.55;
        const spd = 0.55 + r2 * 0.72;
        const v0z = 1.7 + r1 * 0.95;
        const lz = Math.max(0.02, 0.10 + v0z * debT - 1.9 * debT * debT);
        const pt = projectLocal(frame, Math.cos(angle) * spd * debT, Math.sin(angle) * spd * debT, lz);
        const sz = depthScale * (0.085 + r1 * 0.05) * (1 - debT * 0.25);
        ctx.save();
        ctx.globalAlpha *= debT > 0.65 ? Math.max(0, 1 - (debT - 0.65) / 0.35) : 1;
        ctx.translate(pt.x, pt.y);
        ctx.rotate(debT * (5.5 + i * 1.6) * (i % 2 === 0 ? 1 : -1));
        ctx.beginPath();
        ctx.moveTo(-sz, -sz * 0.5);
        ctx.lineTo(sz * 0.85, -sz * 0.75);
        ctx.lineTo(sz, sz * 0.55);
        ctx.lineTo(-sz * 0.45, sz * 0.8);
        ctx.closePath();
        ctx.lineWidth = Math.max(1.5, sz * 0.35);
        ctx.strokeStyle = "#1b1147";
        ctx.stroke();
        ctx.fillStyle = cols[i % cols.length];
        ctx.fill();
        ctx.restore();
      }
    }

    // 5. 6 hot orange-gold sparks
    if (p < 0.65) {
      const emT = p / 0.65;
      for (let i = 0; i < 6; i++) {
        const r1 = pseudoRand(seedBase + 320 + i * 7.1);
        const angle = (Math.PI * 2 * i) / 6 + r1 * 0.6;
        const lz = 0.16 + (1.35 + r1 * 0.5) * emT - 1.15 * emT * emT;
        if (lz < 0) continue;
        const pt = projectLocal(frame, Math.cos(angle) * (0.3 + 0.78 * emT), Math.sin(angle) * (0.3 + 0.78 * emT), lz);
        drawSparkle4(
          ctx,
          pt.x,
          pt.y,
          depthScale * 0.12 * (1 - emT * 0.6),
          emT * 2.8,
          i % 2 === 0 ? "#ffc83a" : "#ff7a45",
          "#1b1147",
          1 - emT
        );
      }
    }
  }

  function renderTileEffect(ctx, effect, frame, time) {
    if (!ctx || !effect || !frame) return;

    const p = clamp01((time - effect.startTime) / effect.duration);
    if (p >= 1) return;

    const dist = Math.max(0.8, frame.camVec.z - frame.origin.z);
    const depthScale = (frame.scale * frame.focalLength) / dist;

    if (effect.type === "build") {
      renderBuildEffect(ctx, effect, frame, p, depthScale);
    } else if (effect.type === "demolish") {
      renderDemolishEffect(ctx, effect, frame, p, depthScale);
    } else if (effect.type === "crash") {
      renderCrashEffect(ctx, effect, frame, p, depthScale);
    }
  }

  window.GameBuildings = {
    CATEGORIES: CATEGORIES,
    TERRAIN_GROUPS: TERRAIN_GROUPS,
    BUILDINGS: BUILDINGS,
    BIOMES: BIOMES,
    getBiome: getBiome,
    getBuilding: getBuilding,
    isProtectedBuilding: isProtectedBuilding,
    getTerrainGroup: getTerrainGroup,
    getCategory: getCategory,
    getBuildingCost: getBuildingCost,
    getBuildingOrePerSec: getBuildingOrePerSec,
    canBuildOnBiome: canBuildOnBiome,
    canAffordBuilding: canAffordBuilding,
    isBuildingResearchLocked: isBuildingResearchLocked,
    getNextUpgradeBuilding: getNextUpgradeBuilding,
    requestUpgradeForTile: requestUpgradeForTile,
    formatProductionRate: formatProductionRate,
    showErrorToast: showBuildErrorToast,
    showToast: showBuildErrorToast,
    setHandlers: setHandlers,
    openForTile: openForTile,
    openConfirmForBuilding: openConfirmScene,
    updateCurrentBuilding: updateCurrentBuilding,
    close: close,
    isOpen: isOpen,
    isConfirming: function () {
      return Boolean(pendingConfirmBuildingId);
    },
    cancelConfirm: closeConfirmScene,
    getLayoutBounds: getLayoutBounds,
    renderBuilding3D: renderBuilding3D,
    renderRocketVessel3D: renderRocketVessel3D,
    renderEscapeCraft3D: renderEscapeCraft3D,
    renderTileEffect: renderTileEffect
  };
})();
