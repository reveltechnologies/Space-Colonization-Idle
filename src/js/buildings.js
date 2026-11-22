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
    { id: "all",          label: t("categories.all"),          iconSrc: "./assets/ui/cat-all.svg",          accent: "#ffc83a", badgeBg: "#fff6cc" },
    { id: "power",        label: t("categories.power"),        iconSrc: "./assets/ui/cat-power.svg",        accent: "#ffc83a", badgeBg: "#fff6cc" },
    { id: "mining",       label: t("categories.mining"),       iconSrc: "./assets/ui/cat-mining.svg",       accent: "#ffb13b", badgeBg: "#ffefd6" },
    { id: "colony",       label: t("categories.colony"),       iconSrc: "./assets/ui/cat-colony.svg",       accent: "#ff6b5a", badgeBg: "#ffe6e3" },
    { id: "science",      label: t("categories.science"),      iconSrc: "./assets/ui/cat-science.svg",      accent: "#37a8ff", badgeBg: "#e0f4ff" },
    { id: "decorations",  label: t("categories.decorations"),  iconSrc: "./assets/ui/cat-decorations.svg",  accent: "#ec4899", badgeBg: "#fce7f3" },
    { id: "terraforming", label: t("categories.terraforming"), iconSrc: "./assets/ui/cat-terraforming.svg", accent: "#14b8a6", badgeBg: "#ccfbf1" }
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
    },
    any: {
      id: "any",
      label: t("terrains.any"),
      iconSrc: "./assets/ui/terrain-any.svg"
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
      id: "brick_press",
      name: t("buildings.brick_press.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      nextVariantId: "hydraulic_press",
      manualBrickPerClick: 1,
      manualBrickCooldownMs: 1600,
      description: t("buildings.brick_press.description"),
      cost: { bricks: 1 },
      costScaling: { creditsBaseAfterFirst: 25, creditsMult: 1.35, bricksMult: 1.45 },
      accent: "#f59e0b",
      iconSrc: "./assets/ui/bld-brick-press.svg"
    },
    {
      id: "hydraulic_press",
      name: t("buildings.hydraulic_press.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      nextVariantId: "quantum_kiln",
      manualBrickPerClick: 4,
      manualBrickCooldownMs: 1300,
      description: t("buildings.hydraulic_press.description"),
      cost: { credits: 650, bricks: 95 },
      costScaling: { creditsMult: 1.38, bricksMult: 1.30 },
      accent: "#f97316",
      iconSrc: "./assets/ui/bld-hydraulic-press.svg"
    },
    {
      id: "quantum_kiln",
      name: t("buildings.quantum_kiln.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      nextVariantId: null,
      manualBrickPerClick: 15,
      manualBrickCooldownMs: 1000,
      description: t("buildings.quantum_kiln.description"),
      cost: { credits: 4200, bricks: 550 },
      costScaling: { creditsMult: 1.42, bricksMult: 1.35 },
      accent: "#ef4444",
      iconSrc: "./assets/ui/bld-plasma-kiln.svg"
    },
    {
      id: "mine",
      name: t("buildings.mine.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "mountainous",
      nextVariantId: "deep_mine",
      bricksPerSec: 0.12,
      energyRequired: 1,
      citizensRequired: 1,
      description: t("buildings.mine.description"),
      cost: { credits: 120, bricks: 20 },
      costScaling: { creditsMult: 1.25, bricksMult: 1.22 },
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
      bricksPerSec: 0.42,
      energyRequired: 3,
      citizensRequired: 2,
      description: t("buildings.deep_mine.description"),
      cost: { credits: 1150, bricks: 160 },
      costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
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
      bricksPerSec: 1.35,
      energyRequired: 8,
      citizensRequired: 4,
      description: t("buildings.mega_quarry.description"),
      cost: { credits: 6400, bricks: 820 },
      costScaling: { creditsMult: 1.32, bricksMult: 1.28 },
      accent: "#ef4444",
      iconSrc: "./assets/ui/bld-mega-quarry.svg"
    },
    {
      id: "cargo_trampoline",
      name: t("buildings.cargo_trampoline.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      nextVariantId: "spring_catapult",
      manualTradeTier: 1,
      manualTradeBricks: 4,
      manualTradeCreditsPerBrick: 3,
      manualTradeCooldownMs: 1800,
      description: t("buildings.cargo_trampoline.description"),
      cost: { bricks: 4 },
      costScaling: { creditsBaseAfterFirst: 35, creditsMult: 1.35, bricksMult: 1.35 },
      accent: "#10b981",
      iconSrc: "./assets/ui/bld-cargo-trampoline.svg"
    },
    {
      id: "spring_catapult",
      name: t("buildings.spring_catapult.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      nextVariantId: "orbital_bouncer",
      manualTradeTier: 2,
      manualTradeBricks: 12,
      manualTradeCreditsPerBrick: 4,
      manualTradeCooldownMs: 1500,
      description: t("buildings.spring_catapult.description"),
      cost: { credits: 720, bricks: 110 },
      costScaling: { creditsMult: 1.38, bricksMult: 1.32 },
      accent: "#06b6d4",
      iconSrc: "./assets/ui/bld-spring-catapult.svg"
    },
    {
      id: "orbital_bouncer",
      name: t("buildings.orbital_bouncer.name"),
      category: "mining",
      tag: t("categories.mining"),
      terrain: "solid",
      nextVariantId: null,
      manualTradeTier: 3,
      manualTradeBricks: 30,
      manualTradeCreditsPerBrick: 5,
      manualTradeCooldownMs: 1200,
      description: t("buildings.orbital_bouncer.description"),
      cost: { credits: 4600, bricks: 600 },
      costScaling: { creditsMult: 1.42, bricksMult: 1.35 },
      accent: "#8b5cf6",
      iconSrc: "./assets/ui/bld-orbital-bouncer.svg"
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
      creditsPerBrick: 3,
      tradeIntervalSec: 8.0,
      tradeSpeedMult: 1.0,
      energyRequired: 2,
      citizensRequired: 1,
      specialtyLabel: t("buildings.trade_rocket_1.specialty"),
      specialtyIconSrc: "./assets/ui/bld-trade-rocket-1.svg",
      description: t("buildings.trade_rocket_1.description"),
      cost: { credits: 180, bricks: 40 },
      costScaling: { creditsMult: 1.30, bricksMult: 1.25 },
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
      creditsPerBrick: 4,
      tradeIntervalSec: 6.0,
      tradeSpeedMult: 1.35,
      energyRequired: 5,
      citizensRequired: 2,
      specialtyLabel: t("buildings.trade_rocket_2.specialty"),
      specialtyIconSrc: "./assets/ui/bld-trade-rocket-2.svg",
      description: t("buildings.trade_rocket_2.description"),
      cost: { credits: 1650, bricks: 240 },
      costScaling: { creditsMult: 1.34, bricksMult: 1.28 },
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
      creditsPerBrick: 5,
      tradeIntervalSec: 4.0,
      tradeSpeedMult: 1.75,
      energyRequired: 10,
      citizensRequired: 4,
      specialtyLabel: t("buildings.trade_rocket_3.specialty"),
      specialtyIconSrc: "./assets/ui/bld-trade-rocket-3.svg",
      description: t("buildings.trade_rocket_3.description"),
      cost: { credits: 8800, bricks: 1100 },
      costScaling: { creditsMult: 1.38, bricksMult: 1.32 },
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
      researchPerSec: 0.12,
      energyRequired: 1,
      citizensRequired: 1,
      description: t("buildings.research_center.description"),
      cost: { credits: 260, bricks: 45 },
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
      researchPerSec: 0.28,
      energyRequired: 2,
      citizensRequired: 2,
      description: t("buildings.research_lab.description"),
      cost: { credits: 850, bricks: 130 },
      costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
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
      researchPerSec: 0.70,
      energyRequired: 5,
      citizensRequired: 3,
      description: t("buildings.observatory.description"),
      cost: { credits: 2800, bricks: 380 },
      costScaling: { creditsMult: 1.32, bricksMult: 1.28 },
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
      researchPerSec: 1.75,
      energyRequired: 11,
      citizensRequired: 5,
      requiredResearch: "quantum_computing",
      description: t("buildings.quantum_array.description"),
      cost: { credits: 9500, bricks: 1250 },
      costScaling: { creditsMult: 1.36, bricksMult: 1.32 },
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
      energyRequired: 16,
      citizensRequired: 8,
      requiredResearch: "ore_synthesis",
      description: t("buildings.ore_research_station.description"),
      cost: { credits: 18500, bricks: 2400 },
      costScaling: {
        scope: "global",
        creditsMult: 1.85,
        bricksMult: 1.65,
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
      cost: { credits: 60, bricks: 15 },
      costScaling: { creditsMult: 1.22, bricksMult: 1.20 },
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
      cost: { credits: 720, bricks: 115 },
      costScaling: { creditsMult: 1.26, bricksMult: 1.24 },
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
      cost: { credits: 3900, bricks: 520 },
      costScaling: { creditsMult: 1.30, bricksMult: 1.28 },
      accent: "#a855f7",
      iconSrc: "./assets/ui/bld-villa.svg"
    },
    {
      id: "solar_cabin",
      name: t("buildings.solar_cabin.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      nextVariantId: "eco_dome",
      citizenSlots: 3,
      energySlots: 2,
      isSolar: true,
      specialtyLabel: t("buildings.solar_cabin.specialty"),
      specialtyIconSrc: "./assets/ui/bld-solar-cabin.svg",
      description: t("buildings.solar_cabin.description"),
      cost: { credits: 240, bricks: 40 },
      costScaling: { creditsMult: 1.25, bricksMult: 1.22 },
      accent: "#14b8a6",
      iconSrc: "./assets/ui/bld-solar-cabin.svg"
    },
    {
      id: "eco_dome",
      name: t("buildings.eco_dome.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      requiredResearch: "solar_habitats",
      nextVariantId: "eco_arcology",
      citizenSlots: 8,
      energySlots: 6,
      isSolar: true,
      specialtyLabel: t("buildings.eco_dome.specialty"),
      specialtyIconSrc: "./assets/ui/bld-eco-dome.svg",
      description: t("buildings.eco_dome.description"),
      cost: { credits: 1950, bricks: 280 },
      costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
      accent: "#22c55e",
      iconSrc: "./assets/ui/bld-eco-dome.svg"
    },
    {
      id: "eco_arcology",
      name: t("buildings.eco_arcology.name"),
      category: "colony",
      tag: t("categories.colony"),
      terrain: "surface",
      requiredResearch: "arcology_grids",
      nextVariantId: null,
      citizenSlots: 20,
      energySlots: 15,
      isSolar: true,
      specialtyLabel: t("buildings.eco_arcology.specialty"),
      specialtyIconSrc: "./assets/ui/bld-eco-arcology.svg",
      description: t("buildings.eco_arcology.description"),
      cost: { credits: 8200, bricks: 1050 },
      costScaling: { creditsMult: 1.34, bricksMult: 1.30 },
      accent: "#10b981",
      iconSrc: "./assets/ui/bld-eco-arcology.svg"
    },
    {
      id: "hand_crank",
      name: t("buildings.hand_crank.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "solid",
      nextVariantId: "flywheel_dynamo",
      manualEnergySlots: 2,
      manualEnergyClickSec: 180,
      manualEnergyMaxSec: 3600,
      manualEnergyCooldownMs: 350,
      description: t("buildings.hand_crank.description"),
      cost: { bricks: 2 },
      costScaling: { creditsBaseAfterFirst: 20, creditsMult: 1.35, bricksMult: 1.40 },
      accent: "#facc15",
      iconSrc: "./assets/ui/bld-hand-crank.svg"
    },
    {
      id: "flywheel_dynamo",
      name: t("buildings.flywheel_dynamo.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "solid",
      nextVariantId: "capacitor_core",
      manualEnergySlots: 7,
      manualEnergyClickSec: 240,
      manualEnergyMaxSec: 3600,
      manualEnergyCooldownMs: 350,
      description: t("buildings.flywheel_dynamo.description"),
      cost: { credits: 580, bricks: 85 },
      costScaling: { creditsMult: 1.38, bricksMult: 1.30 },
      accent: "#38bdf8",
      iconSrc: "./assets/ui/bld-flywheel-dynamo.svg"
    },
    {
      id: "capacitor_core",
      name: t("buildings.capacitor_core.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "solid",
      nextVariantId: null,
      manualEnergySlots: 22,
      manualEnergyClickSec: 300,
      manualEnergyMaxSec: 3600,
      manualEnergyCooldownMs: 350,
      description: t("buildings.capacitor_core.description"),
      cost: { credits: 3800, bricks: 480 },
      costScaling: { creditsMult: 1.42, bricksMult: 1.35 },
      accent: "#a855f7",
      iconSrc: "./assets/ui/bld-capacitor-core.svg"
    },
    {
      id: "solar_panel",
      name: t("buildings.solar_panel.name"),
      category: "power",
      tag: t("categories.power"),
      terrain: "solid",
      nextVariantId: "solar_array",
      energySlots: 3,
      isSolar: true,
      description: t("buildings.solar_panel.description"),
      cost: { credits: 85, bricks: 12 },
      costScaling: { creditsMult: 1.22, bricksMult: 1.20 },
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
      isSolar: true,
      description: t("buildings.solar_array.description"),
      cost: { credits: 780, bricks: 110 },
      costScaling: { creditsMult: 1.26, bricksMult: 1.24 },
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
      isSolar: true,
      description: t("buildings.solar_tower.description"),
      cost: { credits: 4100, bricks: 540 },
      costScaling: { creditsMult: 1.30, bricksMult: 1.28 },
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
      cost: { credits: 210, bricks: 35 },
      costScaling: { creditsMult: 1.24, bricksMult: 1.22 },
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
      cost: { credits: 1550, bricks: 220 },
      costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
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
      cost: { credits: 6800, bricks: 880 },
      costScaling: { creditsMult: 1.32, bricksMult: 1.28 },
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
      rocketMaxBricks: 250,
      specialtyLabel: t("buildings.space_rocket_1.specialty"),
      specialtyIconSrc: "./assets/ui/bld-space-rocket-1.svg",
      description: t("buildings.space_rocket_1.description"),
      cost: { credits: 3200, bricks: 450 },
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
      rocketMaxBricks: 750,
      specialtyLabel: t("buildings.space_rocket_2.specialty"),
      specialtyIconSrc: "./assets/ui/bld-space-rocket-2.svg",
      description: t("buildings.space_rocket_2.description"),
      cost: { credits: 14500, bricks: 1800 },
      accent: "#f59e0b",
      iconSrc: "./assets/ui/bld-space-rocket-2.svg"
    },
    {
      id: "starlight_monument",
      name: t("buildings.starlight_monument.name"),
      category: "decorations",
      tag: t("categories.decorations"),
      terrain: "solid",
      nextVariantId: null,
      isCosmetic: true,
      specialtyLabel: t("buildings.starlight_monument.specialty"),
      specialtyIconSrc: "./assets/ui/bld-starlight-monument.svg",
      description: t("buildings.starlight_monument.description"),
      cost: { credits: 150, bricks: 25 },
      costScaling: { creditsMult: 1.25, bricksMult: 1.25 },
      accent: "#ec4899",
      iconSrc: "./assets/ui/bld-starlight-monument.svg"
    },
    {
      id: "helio_mirror",
      name: t("buildings.helio_mirror.name"),
      category: "decorations",
      tag: t("categories.decorations"),
      terrain: "solid",
      requiredResearch: "helio_optics",
      maxPerPlanet: 3,
      solarEnergyBonus: 0.25,
      nextVariantId: null,
      specialtyLabel: t("buildings.helio_mirror.specialty"),
      specialtyIconSrc: "./assets/ui/bld-helio-mirror.svg",
      description: t("buildings.helio_mirror.description"),
      cost: { credits: 1400, bricks: 210 },
      costScaling: { creditsMult: 1.45, bricksMult: 1.40 },
      accent: "#fbbf24",
      iconSrc: "./assets/ui/bld-helio-mirror.svg"
    },
    {
      id: "botanical_garden",
      name: t("buildings.botanical_garden.name"),
      category: "decorations",
      tag: t("categories.decorations"),
      terrain: "surface",
      requiredResearch: "civic_gardens",
      maxPerPlanet: 3,
      citizenGrowthBonus: 0.50,
      nextVariantId: null,
      specialtyLabel: t("buildings.botanical_garden.specialty"),
      specialtyIconSrc: "./assets/ui/bld-botanical-garden.svg",
      description: t("buildings.botanical_garden.description"),
      cost: { credits: 1100, bricks: 170 },
      costScaling: { creditsMult: 1.45, bricksMult: 1.40 },
      accent: "#22c55e",
      iconSrc: "./assets/ui/bld-botanical-garden.svg"
    },
    {
      id: "builders_plaza",
      name: t("buildings.builders_plaza.name"),
      category: "decorations",
      tag: t("categories.decorations"),
      terrain: "solid",
      requiredResearch: "modular_prefabs",
      maxPerPlanet: 2,
      costDiscount: 0.15,
      discountCategories: ["colony", "power", "mining"],
      nextVariantId: null,
      specialtyLabel: t("buildings.builders_plaza.specialty"),
      specialtyIconSrc: "./assets/ui/bld-builders-plaza.svg",
      description: t("buildings.builders_plaza.description"),
      cost: { credits: 2400, bricks: 350 },
      costScaling: { creditsMult: 1.60, bricksMult: 1.50 },
      accent: "#3b82f6",
      iconSrc: "./assets/ui/bld-builders-plaza.svg"
    },
    {
      id: "geo_terraformer",
      name: t("buildings.geo_terraformer.name"),
      category: "terraforming",
      tag: t("categories.terraforming"),
      terrain: "any",
      requiredResearch: "planetary_terraforming",
      energyRequired: 2,
      singleUseTerraformer: true,
      nextVariantId: null,
      specialtyLabel: t("buildings.geo_terraformer.specialty"),
      specialtyIconSrc: "./assets/ui/bld-geo-terraformer.svg",
      description: t("buildings.geo_terraformer.description"),
      cost: { credits: 1250, bricks: 190 },
      accent: "#14b8a6",
      iconSrc: "./assets/ui/bld-geo-terraformer.svg"
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
      bricksPerSec: 0.2,
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
          } else if (Array.isArray(econ[prop])) {
            b[prop] = econ[prop].slice();
          } else {
            b[prop] = econ[prop];
          }
        }
      }
    }
  }

  const BUILDINGS_BY_ID = Object.create(null);
  for (let i = 0; i < BUILDINGS.length; i++) {
    BUILDINGS_BY_ID[BUILDINGS[i].id] = BUILDINGS[i];
  }
  if (BUILDINGS_BY_ID.small_house) {
    BUILDINGS_BY_ID.house = BUILDINGS_BY_ID.small_house;
  }

  const CATEGORIES_BY_ID = Object.create(null);
  for (let i = 0; i < CATEGORIES.length; i++) {
    CATEGORIES_BY_ID[CATEGORIES[i].id] = CATEGORIES[i];
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
    return (buildingId && BUILDINGS_BY_ID[buildingId]) || null;
  }

  function isProtectedBuilding(buildingId) {
    const b = getBuilding(buildingId);
    return Boolean(b && (b.indestructible || b.unreplaceable));
  }

  function getTerrainGroup(terrainId) {
    return TERRAIN_GROUPS[terrainId] || TERRAIN_GROUPS.solid;
  }

  function getCategory(categoryId) {
    return (categoryId && CATEGORIES_BY_ID[categoryId]) || CATEGORIES[0];
  }

  function canBuildOnBiome(buildingId, biomeId) {
    const b = getBuilding(buildingId);
    if (!b) return false;
    if (b.terrain === "any") return true;
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

  function getOwnedBuildingCount(buildingId, planetId, scope) {
    if (scope !== "global" && typeof callbacks.getBuildingCountOnPlanet === "function") {
      const pId = planetId !== undefined && planetId !== null ? planetId : currentPlanetId;
      return Math.max(0, Math.floor(callbacks.getBuildingCountOnPlanet(pId, buildingId) || 0));
    }
    if (typeof callbacks.getBuildingCountGlobal === "function") {
      return Math.max(0, Math.floor(callbacks.getBuildingCountGlobal(buildingId) || 0));
    }
    return 0;
  }

  function getBuildingDiscountRate(buildingId, planetId) {
    const b = getBuilding(buildingId);
    if (!b || typeof callbacks.getPlanetCostDiscount !== "function") return 0;
    const pId = planetId !== undefined && planetId !== null ? planetId : currentPlanetId;
    const raw = Number(callbacks.getPlanetCostDiscount(pId, b)) || 0;
    return Math.max(0, Math.min(0.50, raw));
  }

  function getBuildingDiscountPercent(buildingId, planetId) {
    return Math.round(getBuildingDiscountRate(buildingId, planetId) * 100);
  }

  function getBuildingCost(buildingId, planetId) {
    const b = getBuilding(buildingId);
    if (!b || !b.cost) return null;
    const pId = planetId !== undefined && planetId !== null ? planetId : currentPlanetId;
    const discount = getBuildingDiscountRate(b.id, pId);
    const cost = {};
    if (!b.costScaling) {
      if (b.cost.credits > 0) cost.credits = b.cost.credits;
      if (b.cost.bricks > 0) cost.bricks = b.cost.bricks;
      if (b.cost.ore > 0) cost.ore = b.cost.ore;
    } else {
      const s = b.costScaling;
      const owned = getOwnedBuildingCount(b.id, pId, s.scope);
      if (owned >= 1 && s.creditsBaseAfterFirst > 0) {
        cost.credits = Math.round(s.creditsBaseAfterFirst * Math.pow(s.creditsMult || 1, owned - 1));
      } else if (b.cost.credits > 0) {
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
    }
    if (discount > 0) {
      const factor = 1 - discount;
      if (cost.credits > 0) cost.credits = Math.max(1, Math.round(cost.credits * factor));
      if (cost.bricks > 0) cost.bricks = Math.max(1, Math.round(cost.bricks * factor));
      if (cost.ore > 0) cost.ore = Math.max(1, Math.round(cost.ore * factor));
    }
    return cost;
  }

  function canAffordBuilding(buildingId, planetId) {
    const pId = planetId !== undefined && planetId !== null ? planetId : currentPlanetId;
    const cost = getBuildingCost(buildingId, pId);
    if (!cost) return true;
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
    const raw = Number(perSec) || 0;
    if (Math.abs(raw) < 1e-6) return "";
    const isNeg = raw < 0;
    const r = Math.abs(raw);
    const prefix = isNeg ? "rates.loss_" : "rates.";
    if (r >= 1) {
      return t(prefix + "per_second", { rate: formatRateNumber(r) });
    }
    const perMin = r * 60;
    if (perMin >= 1) {
      return t(prefix + "per_minute", { rate: formatRateNumber(perMin) });
    }
    const perHour = r * 3600;
    if (perHour >= 1) {
      return t(prefix + "per_hour", { rate: formatRateNumber(perHour) });
    }
    const perDay = Math.max(0.1, r * 86400);
    return t(prefix + "per_day", { rate: formatRateNumber(perDay) });
  }

  function renderCostItems(containerEl, cost, planetId, isDiscounted) {
    if (!containerEl) return;
    const costOrder = ["credits", "bricks", "ore"];
    let renderedCount = 0;
    for (let c = 0; c < costOrder.length; c++) {
      const key = costOrder[c];
      const req = cost && cost[key];
      if (!req || req <= 0) continue;
      renderedCount++;
      const hasEnough = getAvailableCurrencyAmount(key, planetId) >= req;
      const item = document.createElement("span");
      item.className = "build-cost-item" + (hasEnough ? "" : " is-short") + (isDiscounted ? " is-discounted" : "");
      item.setAttribute("data-cost-key", key);
      item.setAttribute("data-cost-req", String(req));
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
    if (containerEl.classList) {
      containerEl.classList.toggle("is-compact-costs", renderedCount >= 3);
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
  const confirmBuildLabelEl = confirmBuildBtn ? confirmBuildBtn.querySelector(".build-confirm-btn-label") : null;

  let activeCategory = "all";
  let currentPlanetId = 0;
  let currentTileId = null;
  let currentPlacedId = null;
  let currentPlacedUsed = false;
  let currentPlacedLanded = false;
  let currentBiomeId = null;
  let pendingConfirmBuildingId = null;
  let pendingDemolishConfirm = false;
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
    if (currentPlacedLanded && plId) {
      showProtectedToast(plId, "toast.cannot_replace_landed");
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
      const bCost = getBuildingCost(b.id, pId);
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
    const tileSingleCard = tileProtected || currentPlacedLanded;
    const entries = [];
    for (let i = 0; i < BUILDINGS.length; i++) {
      const b = BUILDINGS[i];
      if (tileSingleCard) {
        if (b.id !== currentPlacedId) continue;
      } else {
        if (b.hiddenFromBuildMenu) continue;
        if (activeCategory !== "all" && b.category !== activeCategory) {
          continue;
        }
      }
      const isBuilt = currentPlacedId === b.id;
      const isSpentBuilt = isBuilt && currentPlacedUsed;
      const isLandedBuilt = isBuilt && currentPlacedLanded;
      const researchLocked = isBuildingResearchLocked(b.id);
      const limitBlocked = !isBuilt && isBuildingPlanetLimitReached(b.id, currentPlanetId, currentPlacedId);
      const terrainOk = canBuildOnBiome(b.id, currentBiomeId);
      const affordable = canAffordBuilding(b.id, currentPlanetId);
      const rank = isBuilt ? 0 : !researchLocked && !limitBlocked && terrainOk ? 1 : 2;
      entries.push({
        b: b,
        idx: i,
        isBuilt: isBuilt,
        isSpentBuilt: isSpentBuilt,
        isLandedBuilt: isLandedBuilt,
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
      const isSpentBuilt = entry.isSpentBuilt;
      const isLandedBuilt = entry.isLandedBuilt;
      const isProtectedCard = isProtectedBuilding(b.id);
      const researchLocked = entry.researchLocked;
      const limitBlocked = entry.limitBlocked;
      const terrain = getTerrainGroup(b.terrain);
      const terrainOk = entry.terrainOk;
      const affordable = entry.affordable;
      const canPurchase = !isProtectedCard && !isLandedBuilt && !isBuilt && !researchLocked && !limitBlocked && terrainOk && affordable;

      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "build-card" +
        (isBuilt ? " is-built" : "") +
        (isSpentBuilt ? " is-spent" : "") +
        (isProtectedCard || isLandedBuilt ? " build-card--protected" : "") +
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
        badge.className = "build-card-badge " + (isSpentBuilt ? "is-spent" : "is-built");
        badge.textContent = t(isSpentBuilt ? "build.spent_badge" : "build.built_badge");
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
      if (isLandedBuilt && b.rocketCitizens > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-citizen-chip",
            "build-citizen-icon",
            STAT_ICONS.citizens,
            "build-citizen-label",
            formatCitizenGain(b.rocketCitizens)
          )
        );
      } else if (isProtectedCard) {
        const multiWrap = document.createElement("span");
        multiWrap.className = "build-card-multi-chips";
        if (b.citizenSlots && b.citizenSlots > 0) {
          const cChip = createCardInfoChip(
            "build-citizen-chip",
            "build-citizen-icon",
            STAT_ICONS.citizens,
            "build-citizen-label",
            t("build.stat_plus_short", { count: formatCostValue(b.citizenSlots) })
          );
          cChip.title = formatCitizenGain(b.citizenSlots);
          multiWrap.appendChild(cChip);
        }
        if (b.energySlots && b.energySlots > 0) {
          const eChip = createCardInfoChip(
            "build-energy-chip",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            t("build.stat_plus_short", { count: formatCostValue(b.energySlots) })
          );
          eChip.title = formatEnergyGain(b.energySlots);
          multiWrap.appendChild(eChip);
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
      } else if (!showInvalidTerrain && b.citizenSlots && b.citizenSlots > 0 && b.energySlots && b.energySlots > 0) {
        const multiWrap = document.createElement("span");
        multiWrap.className = "build-card-multi-chips";
        const cChip = createCardInfoChip(
          "build-citizen-chip",
          "build-citizen-icon",
          STAT_ICONS.citizens,
          "build-citizen-label",
          t("build.stat_plus_short", { count: formatCostValue(b.citizenSlots) }),
          "data-citizen-slots",
          b.citizenSlots
        );
        cChip.title = formatCitizenGain(b.citizenSlots);
        multiWrap.appendChild(cChip);
        const eChip = createCardInfoChip(
          "build-energy-chip",
          "build-energy-icon",
          STAT_ICONS.energy,
          "build-energy-label",
          t("build.stat_plus_short", { count: formatCostValue(b.energySlots) }),
          "data-energy-slots",
          b.energySlots
        );
        eChip.title = formatEnergyGain(b.energySlots);
        multiWrap.appendChild(eChip);
        info.appendChild(multiWrap);
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
      } else if (!showInvalidTerrain && b.manualBrickPerClick && b.manualBrickPerClick > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-bricks-chip",
            "build-bricks-icon",
            STAT_ICONS.bricks,
            "build-bricks-label",
            t("manual.brick_chip", { amount: formatCostValue(b.manualBrickPerClick) })
          )
        );
      } else if (!showInvalidTerrain && b.manualEnergySlots && b.manualEnergySlots > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-energy-chip",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            t("manual.energy_chip", {
              energy: formatCostValue(b.manualEnergySlots),
              mins: formatRateNumber((b.manualEnergyClickSec || 180) / 60)
            })
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
      } else if (!showInvalidTerrain && b.manualTradeBricks && b.manualTradeBricks > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-trade-chip",
            "build-bricks-icon",
            CURRENCY_ICONS.credits,
            "build-bricks-label",
            t("manual.trade_chip", {
              bricks: formatCostValue(b.manualTradeBricks),
              credits: formatCostValue(b.manualTradeBricks * (b.manualTradeCreditsPerBrick || 4))
            })
          )
        );
      } else if (!showInvalidTerrain && b.solarEnergyBonus && b.solarEnergyBonus > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-decor-chip is-solar",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            t("build.solar_boost_chip", { pct: Math.round(b.solarEnergyBonus * 100) })
          )
        );
      } else if (!showInvalidTerrain && b.citizenGrowthBonus && b.citizenGrowthBonus > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-decor-chip is-growth",
            "build-citizen-icon",
            STAT_ICONS.citizens,
            "build-citizen-label",
            t("build.growth_boost_chip", { pct: Math.round(b.citizenGrowthBonus * 100) })
          )
        );
      } else if (!showInvalidTerrain && b.costDiscount && b.costDiscount > 0) {
        info.appendChild(
          createCardInfoChip(
            "build-decor-chip is-discount",
            "build-terrain-icon",
            b.iconSrc,
            "build-terrain-label",
            t("build.cost_discount_chip", { pct: Math.round(b.costDiscount * 100) })
          )
        );
      } else if (!showInvalidTerrain && b.singleUseTerraformer) {
        info.appendChild(
          createCardInfoChip(
            "build-decor-chip is-terraform",
            "build-terrain-icon",
            "./assets/ui/cat-terraforming.svg",
            "build-terrain-label",
            t("build.terraform_single_use_chip")
          )
        );
      } else if (!showInvalidTerrain && b.isCosmetic && b.specialtyLabel) {
        info.appendChild(
          createCardInfoChip(
            "build-specialty-chip",
            "build-terrain-icon",
            b.specialtyIconSrc || b.iconSrc,
            "build-terrain-label",
            b.specialtyLabel
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
      } else if (isLandedBuilt) {
        const landedLbl = document.createElement("span");
        landedLbl.className = "build-built-label";
        landedLbl.textContent = t("build.landed_badge");
        actionBtn.appendChild(landedLbl);
      } else if (isBuilt) {
        const builtLbl = document.createElement("span");
        builtLbl.className = "build-built-label";
        builtLbl.textContent = t(isSpentBuilt ? "build.spent_badge" : "build.built_badge");
        actionBtn.appendChild(builtLbl);
      } else {
        renderCostItems(
          actionBtn,
          getBuildingCost(b.id, currentPlanetId),
          currentPlanetId,
          getBuildingDiscountRate(b.id, currentPlanetId) > 0
        );
      }

      card.appendChild(stage);
      card.appendChild(info);
      card.appendChild(actionBtn);

      card.addEventListener("click", function () {
        if (isProtectedCard) {
          showProtectedToast(b.id, "toast.cannot_replace_protected");
          return;
        }
        if (isLandedBuilt || currentPlacedLanded) {
          showProtectedToast(currentPlacedId || b.id, "toast.cannot_replace_landed");
          return;
        }
        if (isBuilt) return;
        if (isProtectedBuilding(currentPlacedId)) {
          showProtectedToast(currentPlacedId, "toast.cannot_replace_protected");
          return;
        }
        const canBuyNow =
          !isProtectedCard &&
          !isLandedBuilt &&
          !isBuilt &&
          !researchLocked &&
          !limitBlocked &&
          terrainOk &&
          canAffordBuilding(b.id, currentPlanetId);
        if (!canBuyNow) {
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

  function syncBuildingCardAffordability() {
    if (!listEl || !menuOpen) return;
    const cards = listEl.querySelectorAll(".build-card");
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const bId = card.getAttribute("data-building");
      if (!bId) continue;
      const isBuilt = currentPlacedId === bId;
      const isProtectedCard = isProtectedBuilding(bId);
      const isLandedBuilt = isBuilt && currentPlacedLanded;
      const researchLocked = isBuildingResearchLocked(bId);
      const limitBlocked = !isBuilt && isBuildingPlanetLimitReached(bId, currentPlanetId, currentPlacedId);
      const terrainOk = canBuildOnBiome(bId, currentBiomeId);
      const affordable = canAffordBuilding(bId, currentPlanetId);
      const canBuyNow =
        !isProtectedCard &&
        !isLandedBuilt &&
        !isBuilt &&
        !researchLocked &&
        !limitBlocked &&
        terrainOk &&
        affordable;

      card.classList.toggle(
        "is-unaffordable",
        !isBuilt && !researchLocked && !limitBlocked && terrainOk && !affordable
      );
      card.setAttribute("aria-disabled", canBuyNow || isBuilt ? "false" : "true");

      const costItems = card.querySelectorAll(".build-cost-item[data-cost-key]");
      for (let c = 0; c < costItems.length; c++) {
        const item = costItems[c];
        const key = item.getAttribute("data-cost-key");
        const req = Number(item.getAttribute("data-cost-req")) || 0;
        item.classList.toggle("is-short", getAvailableCurrencyAmount(key, currentPlanetId) < req);
      }
    }
  }

  function syncRemoveButton() {
    if (removeBtn) {
      removeBtn.classList.toggle("is-hidden", !currentPlacedId || isProtectedBuilding(currentPlacedId));
    }
  }

  function syncConfirmState() {
    if (pendingDemolishConfirm) return;
    const b = pendingConfirmBuildingId ? getBuilding(pendingConfirmBuildingId) : null;
    if (!b) return;
    if (confirmCostsEl) {
      confirmCostsEl.innerHTML = "";
      renderCostItems(
        confirmCostsEl,
        getBuildingCost(b.id, currentPlanetId),
        currentPlanetId,
        getBuildingDiscountRate(b.id, currentPlanetId) > 0
      );
      confirmCostsEl.classList.toggle("is-hidden", confirmCostsEl.childNodes.length === 0);
    }
    if (confirmBuildBtn) {
      confirmBuildBtn.classList.remove("is-demolish");
      if (confirmBuildLabelEl) {
        confirmBuildLabelEl.textContent = t("build.confirm_build");
      }
      const canConfirm =
        !isBuildingResearchLocked(b.id) &&
        !isBuildingPlanetLimitReached(b.id, currentPlanetId, currentPlacedId) &&
        canBuildOnBiome(b.id, currentBiomeId) &&
        canAffordBuilding(b.id, currentPlanetId);
      confirmBuildBtn.classList.toggle("is-disabled", !canConfirm);
    }
  }

  function populateConfirmCardDetails(b) {
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
      }
      if (b.energySlots && b.energySlots > 0) {
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
      }
      if (b.solarEnergyBonus && b.solarEnergyBonus > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-decor-chip is-solar",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            t("build.solar_boost_chip", { pct: Math.round(b.solarEnergyBonus * 100) })
          )
        );
      }
      if (b.citizenGrowthBonus && b.citizenGrowthBonus > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-decor-chip is-growth",
            "build-citizen-icon",
            STAT_ICONS.citizens,
            "build-citizen-label",
            t("build.growth_boost_chip", { pct: Math.round(b.citizenGrowthBonus * 100) })
          )
        );
      }
      if (b.costDiscount && b.costDiscount > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-decor-chip is-discount",
            "build-terrain-icon",
            b.iconSrc,
            "build-terrain-label",
            t("build.cost_discount_chip", { pct: Math.round(b.costDiscount * 100) })
          )
        );
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-specialty-chip",
            "build-terrain-icon",
            "./assets/ui/cat-colony.svg",
            "build-terrain-label",
            t("build.discount_targets_chip")
          )
        );
      }
      if (b.singleUseTerraformer) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-decor-chip is-terraform",
            "build-terrain-icon",
            "./assets/ui/cat-terraforming.svg",
            "build-terrain-label",
            t("build.terraform_single_use_chip")
          )
        );
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-limit-chip",
            "build-research-icon",
            STAT_ICONS.research,
            "build-research-label",
            t("build.terraform_spent_warning")
          )
        );
      }
      if (getBuildingDiscountPercent(b.id, currentPlanetId) > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-discount-chip",
            "build-terrain-icon",
            "./assets/ui/bld-builders-plaza.svg",
            "build-terrain-label",
            t("build.discount_active_pill", { pct: getBuildingDiscountPercent(b.id, currentPlanetId) })
          )
        );
      }
      if (b.bricksPerSec && b.bricksPerSec > 0) {
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
      } else if (b.manualBrickPerClick && b.manualBrickPerClick > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-bricks-chip",
            "build-bricks-icon",
            STAT_ICONS.bricks,
            "build-bricks-label",
            t("manual.brick_chip", { amount: formatCostValue(b.manualBrickPerClick) })
          )
        );
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-specialty-chip",
            "build-terrain-icon",
            b.iconSrc,
            "build-terrain-label",
            t("manual.brick_cooldown_chip", { sec: formatRateNumber((b.manualBrickCooldownMs || 1500) / 1000) })
          )
        );
      } else if (b.manualEnergySlots && b.manualEnergySlots > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-energy-chip",
            "build-energy-icon",
            STAT_ICONS.energy,
            "build-energy-label",
            formatEnergyGain(b.manualEnergySlots)
          )
        );
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-specialty-chip",
            "build-terrain-icon",
            b.iconSrc,
            "build-terrain-label",
            t("manual.energy_stack_chip", { mins: formatRateNumber((b.manualEnergyClickSec || 180) / 60) })
          )
        );
      } else if (b.manualTradeBricks && b.manualTradeBricks > 0) {
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-trade-chip",
            "build-bricks-icon",
            CURRENCY_ICONS.credits,
            "build-bricks-label",
            t("manual.trade_chip", {
              bricks: formatCostValue(b.manualTradeBricks),
              credits: formatCostValue(b.manualTradeBricks * (b.manualTradeCreditsPerBrick || 4))
            })
          )
        );
        confirmBadgesEl.appendChild(
          createCardInfoChip(
            "build-specialty-chip",
            "build-terrain-icon",
            b.iconSrc,
            "build-terrain-label",
            t("manual.brick_cooldown_chip", { sec: formatRateNumber((b.manualTradeCooldownMs || 1600) / 1000) })
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
            t("build.owned_scaling_chip", { count: getOwnedBuildingCount(b.id, currentPlanetId, b.costScaling.scope) })
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
  }

  function openConfirmScene(buildingId) {
    if (isProtectedBuilding(currentPlacedId)) {
      showProtectedToast(currentPlacedId, "toast.cannot_replace_protected");
      return;
    }
    if (currentPlacedLanded && currentPlacedId) {
      showProtectedToast(currentPlacedId, "toast.cannot_replace_landed");
      return;
    }
    const b = getBuilding(buildingId);
    if (!b || b.hiddenFromBuildMenu) return;

    pendingDemolishConfirm = false;
    pendingConfirmBuildingId = b.id;
    if (listDragScroller) listDragScroller.cancel();
    if (catDragScroller) catDragScroller.cancel();

    populateConfirmCardDetails(b);

    if (confirmReplaceEl) {
      confirmReplaceEl.classList.remove("is-demolish");
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

    if (confirmBuildBtn) {
      confirmBuildBtn.classList.remove("is-demolish");
      if (confirmBuildLabelEl) {
        confirmBuildLabelEl.textContent = t("build.confirm_build");
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

  function openDemolishConfirmScene() {
    if (!currentPlacedId) return;
    if (isProtectedBuilding(currentPlacedId)) {
      showProtectedToast(currentPlacedId, "toast.cannot_demolish_protected");
      return;
    }
    const b = getBuilding(currentPlacedId);
    if (!b) return;

    pendingConfirmBuildingId = null;
    pendingDemolishConfirm = true;
    if (listDragScroller) listDragScroller.cancel();
    if (catDragScroller) catDragScroller.cancel();

    populateConfirmCardDetails(b);
    if (currentPlacedLanded && confirmBadgesEl && b.rocketCitizens > 0) {
      confirmBadgesEl.appendChild(
        createCardInfoChip(
          "build-citizen-chip",
          "build-citizen-icon",
          STAT_ICONS.citizens,
          "build-citizen-label",
          formatCitizenGain(b.rocketCitizens)
        )
      );
    }

    if (confirmReplaceEl) {
      confirmReplaceEl.textContent = t("build.demolish_notice", { building: b.name });
      confirmReplaceEl.classList.add("is-demolish");
      confirmReplaceEl.classList.remove("is-hidden");
    }
    if (confirmCostsEl) {
      confirmCostsEl.innerHTML = "";
      confirmCostsEl.classList.add("is-hidden");
    }
    if (confirmBuildBtn) {
      confirmBuildBtn.classList.remove("is-disabled");
      confirmBuildBtn.classList.add("is-demolish");
      if (confirmBuildLabelEl) {
        confirmBuildLabelEl.textContent = t("build.confirm_demolish");
      }
    }

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
    if (!pendingConfirmBuildingId && !pendingDemolishConfirm && (!drawerEl || !drawerEl.classList.contains("is-confirming"))) {
      return;
    }
    pendingConfirmBuildingId = null;
    pendingDemolishConfirm = false;
    if (confirmReplaceEl) {
      confirmReplaceEl.classList.remove("is-demolish");
    }
    if (confirmBuildBtn) {
      confirmBuildBtn.classList.remove("is-demolish");
      if (confirmBuildLabelEl) {
        confirmBuildLabelEl.textContent = t("build.confirm_build");
      }
    }
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

  function openForTile(planetId, tileId, placedBuildingId, biomeId, placedUsed, placedLanded) {
    closeConfirmScene();
    currentPlanetId = planetId;
    currentTileId = tileId;
    currentPlacedId = placedBuildingId || null;
    currentPlacedUsed = Boolean(placedUsed);
    currentPlacedLanded = Boolean(placedLanded);

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
      drawerEl.classList.toggle("is-protected-tile", isProtectedBuilding(currentPlacedId) || currentPlacedLanded);
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
    if (currentPlacedLanded && currentPlacedId === placedBuildingId) {
      showProtectedToast(placedBuildingId, "toast.cannot_replace_landed");
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

  function updateCurrentBuilding(placedBuildingId, placedUsed, placedLanded) {
    currentPlacedId = placedBuildingId || null;
    currentPlacedUsed = Boolean(placedUsed);
    currentPlacedLanded = Boolean(placedLanded);
    if (drawerEl) {
      drawerEl.classList.toggle("is-protected-tile", isProtectedBuilding(currentPlacedId) || currentPlacedLanded);
    }
    syncRemoveButton();
    if (menuOpen) {
      renderBuildingCards();
    }
  }

  function refreshTileState(planetId, tileId, placedBuildingId, biomeId, placedUsed, placedLanded) {
    if (!menuOpen || currentPlanetId !== planetId || currentTileId !== tileId) {
      return;
    }
    currentPlacedId = placedBuildingId || null;
    currentPlacedUsed = Boolean(placedUsed);
    currentPlacedLanded = Boolean(placedLanded);
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
    if (drawerEl) {
      drawerEl.setAttribute("data-biome", biome.id);
      drawerEl.classList.toggle("is-protected-tile", isProtectedBuilding(currentPlacedId) || currentPlacedLanded);
    }
    syncRemoveButton();
    renderBuildingCards();
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
    currentPlacedUsed = false;
    currentPlacedLanded = false;
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
      openDemolishConfirmScene();
    });
  }

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener("click", function () {
      closeConfirmScene();
    });
  }

  if (confirmBuildBtn) {
    confirmBuildBtn.addEventListener("click", function () {
      if (pendingDemolishConfirm) {
        if (isProtectedBuilding(currentPlacedId)) {
          showProtectedToast(currentPlacedId, "toast.cannot_demolish_protected");
          closeConfirmScene();
          return;
        }
        closeConfirmScene();
        if (typeof callbacks.onRemove === "function") {
          callbacks.onRemove();
        }
        return;
      }
      if (isProtectedBuilding(currentPlacedId)) {
        showProtectedToast(currentPlacedId, "toast.cannot_replace_protected");
        closeConfirmScene();
        return;
      }
      if (currentPlacedLanded && currentPlacedId) {
        showProtectedToast(currentPlacedId, "toast.cannot_replace_landed");
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
      if (!canAffordBuilding(bId, currentPlanetId)) {
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

  function refreshAffordability() {
    if (!menuOpen) return;
    syncBuildingCardAffordability();
    if (pendingConfirmBuildingId) {
      syncConfirmState();
    }
  }

  if (window.GameCurrencies && typeof window.GameCurrencies.onChange === "function") {
    window.GameCurrencies.onChange(refreshAffordability);
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

  function shadeColorXYZ(rgb, nx, ny, nz, lightDir, halfVec, atmo, spec, emissive) {
    const ndotl = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
    const ndotlPos = ndotl > 0 ? ndotl : 0;
    const nzPos = nz > 0 ? nz : 0;
    const frontFill = 0.16 * nzPos;
    let lightAmt = 0.30 + 0.78 * ndotlPos + frontFill + emissive * (1 - ndotlPos * 0.5);
    if (lightAmt > 1.22) lightAmt = 1.22;

    let specAmt = 0;
    if (spec > 0) {
      const ndoth = nx * halfVec.x + ny * halfVec.y + nz * halfVec.z;
      if (ndoth > 0.2) {
        const p2 = ndoth * ndoth;
        const p4 = p2 * p2;
        const p8 = p4 * p4;
        specAmt = spec * (p8 * p8 * p2);
      }
    }

    let fresnel = 0;
    if (nzPos < 0.99) {
      const invNz = 1 - nzPos;
      const f2 = invNz * invNz;
      fresnel = f2 * Math.sqrt(f2) * 0.22;
    }

    const rBase = rgb[0] * lightAmt;
    const gBase = rgb[1] * lightAmt;
    const bBase = rgb[2] * lightAmt;
    const spec255 = 255 * specAmt;
    const r = clampByte((rBase + spec255 + (atmo.r - rBase) * fresnel + 0.5) | 0);
    const g = clampByte((gBase + spec255 + (atmo.g - gBase) * fresnel + 0.5) | 0);
    const b = clampByte((bBase + spec255 + (atmo.b - bBase) * fresnel + 0.5) | 0);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  const CLIP_AX = new Float64Array(32);
  const CLIP_AY = new Float64Array(32);
  const CLIP_BX = new Float64Array(32);
  const CLIP_BY = new Float64Array(32);
  const CLIP_OVERLAP_PT = { x: 0, y: 0 };
  const LINE_HIT_INFO = { x: 0, y: 0, um: 0 };

  // Scratch buffers for zero-allocation 3D building mesh generation
  const SCRATCH_WX = new Float64Array(32);
  const SCRATCH_WY = new Float64Array(32);
  const SCRATCH_WZ = new Float64Array(32);
  const RING_BOT_X = new Float64Array(32);
  const RING_BOT_Y = new Float64Array(32);
  const RING_TOP_X = new Float64Array(32);
  const RING_TOP_Y = new Float64Array(32);
  const COS_LUT = new Float64Array(33);
  const SIN_LUT = new Float64Array(33);

  let sortNodeCap = 256;
  let sortEdgeCap = 2048;
  let sortIndeg = new Int16Array(sortNodeCap);
  let sortDone = new Uint8Array(sortNodeCap);
  let sortHead = new Int32Array(sortNodeCap);
  let sortReady = new Int32Array(sortNodeCap);
  let sortFastOrder = new Int32Array(sortNodeCap);
  let sortEdgeTo = new Int32Array(sortEdgeCap);
  let sortEdgeNext = new Int32Array(sortEdgeCap);

  function ensureSortNodeCap(n) {
    if (n <= sortNodeCap) return;
    while (sortNodeCap < n) sortNodeCap *= 2;
    sortIndeg = new Int16Array(sortNodeCap);
    sortDone = new Uint8Array(sortNodeCap);
    sortHead = new Int32Array(sortNodeCap);
    sortReady = new Int32Array(sortNodeCap);
    sortFastOrder = new Int32Array(sortNodeCap);
  }

  function ensureSortEdgeCap(needed) {
    if (needed <= sortEdgeCap) return;
    let nextCap = sortEdgeCap;
    while (nextCap < needed) nextCap *= 2;
    const nextTo = new Int32Array(nextCap);
    nextTo.set(sortEdgeTo);
    const nextNext = new Int32Array(nextCap);
    nextNext.set(sortEdgeNext);
    sortEdgeTo = nextTo;
    sortEdgeNext = nextNext;
    sortEdgeCap = nextCap;
  }

  const primPool = [];
  function allocPrimSlot(idx) {
    while (primPool.length <= idx) {
      primPool.push({
        type: 0, // 0 = poly, 1 = line
        count: 0,
        ptsX: new Float64Array(16),
        ptsY: new Float64Array(16),
        cnx: 0,
        cny: 0,
        cnz: 0,
        camOffset: 0,
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
        depthZ: 0,
        depthBias: 0,
        convexGroup: 0,
        fill: "",
        stroke: "",
        lineWidth: 0.7,
        p0x: 0,
        p0y: 0,
        p1x: 0,
        p1y: 0,
        d0: 0,
        d1: 0
      });
    }
    return primPool[idx];
  }

  function clipPolyOverlapCentroid(ax, ay, lenA, bx, by, nb, outPt) {
    let len = lenA < 32 ? lenA : 32;
    for (let i = 0; i < len; i++) {
      CLIP_AX[i] = ax[i];
      CLIP_AY[i] = ay[i];
    }
    for (let e = 0; e < nb; e++) {
      const next = e + 1 < nb ? e + 1 : 0;
      const x1 = bx[e];
      const y1 = by[e];
      const ex = bx[next] - x1;
      const ey = by[next] - y1;
      if (len === 0) return false;
      let outLen = 0;
      let sx = CLIP_AX[len - 1];
      let sy = CLIP_AY[len - 1];
      let sCross = ex * (sy - y1) - ey * (sx - x1);
      for (let i = 0; i < len; i++) {
        const px = CLIP_AX[i];
        const py = CLIP_AY[i];
        const pCross = ex * (py - y1) - ey * (px - x1);
        if (pCross >= 0) {
          if (sCross < 0 && outLen < 32) {
            const t = sCross / (sCross - pCross);
            CLIP_BX[outLen] = sx + t * (px - sx);
            CLIP_BY[outLen] = sy + t * (py - sy);
            outLen++;
          }
          if (outLen < 32) {
            CLIP_BX[outLen] = px;
            CLIP_BY[outLen] = py;
            outLen++;
          }
        } else if (sCross >= 0 && outLen < 32) {
          const t = sCross / (sCross - pCross);
          CLIP_BX[outLen] = sx + t * (px - sx);
          CLIP_BY[outLen] = sy + t * (py - sy);
          outLen++;
        }
        sx = px;
        sy = py;
        sCross = pCross;
      }
      len = outLen;
      if (len < 3) return false;
      for (let i = 0; i < len; i++) {
        CLIP_AX[i] = CLIP_BX[i];
        CLIP_AY[i] = CLIP_BY[i];
      }
    }
    let area2 = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0, j = len - 1; i < len; j = i++) {
      const cr = CLIP_AX[j] * CLIP_AY[i] - CLIP_AX[i] * CLIP_AY[j];
      area2 += cr;
      cx += (CLIP_AX[j] + CLIP_AX[i]) * cr;
      cy += (CLIP_AY[j] + CLIP_AY[i]) * cr;
    }
    if (Math.abs(area2) < 0.02) return false;
    outPt.x = cx / (3 * area2);
    outPt.y = cy / (3 * area2);
    return true;
  }

  function clipLineInPoly(p0x, p0y, p1x, p1y, px, py, np, outInfo) {
    const dx = p1x - p0x;
    const dy = p1y - p0y;
    let u0 = 0;
    let u1 = 1;
    for (let e = 0; e < np; e++) {
      const next = e + 1 < np ? e + 1 : 0;
      const ax = px[e];
      const ay = py[e];
      const ex = px[next] - ax;
      const ey = py[next] - ay;
      const num = ex * (p0y - ay) - ey * (p0x - ax);
      const den = ex * dy - ey * dx;
      if (den > -1e-9 && den < 1e-9) {
        if (num < 0) return false;
      } else {
        const uHit = -num / den;
        if (den > 0) {
          if (uHit > u0) u0 = uHit;
        } else {
          if (uHit < u1) u1 = uHit;
        }
        if (u0 >= u1 - 1e-6) return false;
      }
    }
    const um = 0.5 * (u0 + u1);
    outInfo.x = p0x + um * dx;
    outInfo.y = p0y + um * dy;
    outInfo.um = um;
    return true;
  }

  // Reusable module-level mesh collector state (eliminates per-building closures & array allocations)
  let mcPrimCount = 0;
  let mcNextConvexGroup = 0;
  let mcSXY = 1;
  let mcSZ = 1;
  let mcJx = 0;
  let mcJy = 0;
  let mcOx = 0;
  let mcOy = 0;
  let mcOz = 0;
  let mcOjx = 0;
  let mcOjy = 0;
  let mcOjz = 0;
  let mcTx = 1, mcTy = 0, mcTz = 0;
  let mcBx = 0, mcBy = 1, mcBz = 0;
  let mcNx = 0, mcNy = 0, mcNz = 1;
  let mcTSx = 1, mcTSy = 0, mcTSz = 0;
  let mcBSx = 0, mcBSy = 1, mcBSz = 0;
  let mcNSx = 0, mcNSy = 0, mcNSz = 1;
  let mcCamX = 0, mcCamY = 0, mcCamZ = 4.2;
  let mcCamLx = 0, mcCamLy = 0, mcCamLz = 4.2;
  let mcNearClipZ = 3.95;
  let mcVx = 0, mcVy = 0, mcVz = 1;
  let mcCx = 0, mcCy = 0, mcFl = 1;
  let mcLightDir = null;
  let mcHalfVec = null;
  let mcAtmo = null;

  function mcToWorld(lx, ly, lz) {
    return {
      x: mcOjx + mcTSx * lx + mcBSx * ly + mcNSx * lz,
      y: mcOjy + mcTSy * lx + mcBSy * ly + mcNSy * lz,
      z: mcOjz + mcTSz * lx + mcBSz * ly + mcNSz * lz
    };
  }

  function mcAddFaceFlat(
    lx0, ly0, lz0,
    lx1, ly1, lz1,
    lx2, ly2, lz2,
    lx3, ly3, lz3,
    has4,
    rgb,
    spec,
    emissive,
    doubleSided,
    stroke,
    lineWidth,
    depthBias,
    hasHint,
    hx, hy, hz,
    convexGroup
  ) {
    const count = has4 ? 4 : 3;
    const w0x = mcOjx + mcTSx * lx0 + mcBSx * ly0 + mcNSx * lz0;
    const w0y = mcOjy + mcTSy * lx0 + mcBSy * ly0 + mcNSy * lz0;
    const w0z = mcOjz + mcTSz * lx0 + mcBSz * ly0 + mcNSz * lz0;
    if (w0z >= mcNearClipZ) return;

    const w1x = mcOjx + mcTSx * lx1 + mcBSx * ly1 + mcNSx * lz1;
    const w1y = mcOjy + mcTSy * lx1 + mcBSy * ly1 + mcNSy * lz1;
    const w1z = mcOjz + mcTSz * lx1 + mcBSz * ly1 + mcNSz * lz1;
    if (w1z >= mcNearClipZ) return;

    const w2x = mcOjx + mcTSx * lx2 + mcBSx * ly2 + mcNSx * lz2;
    const w2y = mcOjy + mcTSy * lx2 + mcBSy * ly2 + mcNSy * lz2;
    const w2z = mcOjz + mcTSz * lx2 + mcBSz * ly2 + mcNSz * lz2;
    if (w2z >= mcNearClipZ) return;

    let w3x = 0, w3y = 0, w3z = 0;
    let fcx, fcy, fcz;
    if (has4) {
      w3x = mcOjx + mcTSx * lx3 + mcBSx * ly3 + mcNSx * lz3;
      w3y = mcOjy + mcTSy * lx3 + mcBSy * ly3 + mcNSy * lz3;
      w3z = mcOjz + mcTSz * lx3 + mcBSz * ly3 + mcNSz * lz3;
      if (w3z >= mcNearClipZ) return;
      fcx = (w0x + w1x + w2x + w3x) * 0.25;
      fcy = (w0y + w1y + w2y + w3y) * 0.25;
      fcz = (w0z + w1z + w2z + w3z) * 0.25;
    } else {
      fcx = (w0x + w1x + w2x) / 3;
      fcy = (w0y + w1y + w2y) / 3;
      fcz = (w0z + w1z + w2z) / 3;
    }

    const e1x = w1x - w0x, e1y = w1y - w0y, e1z = w1z - w0z;
    const e2x = w2x - w0x, e2y = w2y - w0y, e2z = w2z - w0z;
    let rnx = e1y * e2z - e1z * e2y;
    let rny = e1z * e2x - e1x * e2z;
    let rnz = e1x * e2y - e1y * e2x;
    let rawLenSq = rnx * rnx + rny * rny + rnz * rnz;
    if (rawLenSq < 1e-18 && has4) {
      const f1x = w2x - w1x, f1y = w2y - w1y, f1z = w2z - w1z;
      const f2x = w3x - w1x, f2y = w3y - w1y, f2z = w3z - w1z;
      rnx = f1y * f2z - f1z * f2y;
      rny = f1z * f2x - f1x * f2z;
      rnz = f1x * f2y - f1y * f2x;
      rawLenSq = rnx * rnx + rny * rny + rnz * rnz;
    }
    if (rawLenSq < 1e-18) return;

    const invRawLen = 1 / Math.sqrt(rawLenSq);
    let fnx = rnx * invRawLen;
    let fny = rny * invRawLen;
    let fnz = rnz * invRawLen;

    if (hasHint) {
      const dnx = hx / mcSXY;
      const dny = hy / mcSXY;
      const dnz = hz / mcSZ;
      const hwx = mcTx * dnx + mcBx * dny + mcNx * dnz;
      const hwy = mcTy * dnx + mcBy * dny + mcNy * dnz;
      const hwz = mcTz * dnx + mcBz * dny + mcNz * dnz;
      if (fnx * hwx + fny * hwy + fnz * hwz < 0) {
        fnx = -fnx;
        fny = -fny;
        fnz = -fnz;
      }
    }

    const toCamX = mcCamX - fcx;
    const toCamY = mcCamY - fcy;
    const toCamZ = mcCamZ - fcz;
    const facing = fnx * toCamX + fny * toCamY + fnz * toCamZ;
    if (!doubleSided && facing <= 1e-7) return;

    const cnx = facing < 0 ? -fnx : fnx;
    const cny = facing < 0 ? -fny : fny;
    const cnz = facing < 0 ? -fnz : fnz;
    const camOffset = cnx * (fcx - mcCamX) + cny * (fcy - mcCamY) + cnz * (fcz - mcCamZ);

    const denom0 = mcCamZ - w0z;
    const inv0 = mcFl / (denom0 < 0.30 ? 0.30 : denom0);
    const p0x = mcCx + w0x * inv0;
    const p0y = mcCy - w0y * inv0;

    const denom1 = mcCamZ - w1z;
    const inv1 = mcFl / (denom1 < 0.30 ? 0.30 : denom1);
    const p1x = mcCx + w1x * inv1;
    const p1y = mcCy - w1y * inv1;

    const denom2 = mcCamZ - w2z;
    const inv2 = mcFl / (denom2 < 0.30 ? 0.30 : denom2);
    const p2x = mcCx + w2x * inv2;
    const p2y = mcCy - w2y * inv2;

    let p3x = 0, p3y = 0;
    let minX, maxX, minY, maxY, area2, sumD;
    if (has4) {
      const denom3 = mcCamZ - w3z;
      const inv3 = mcFl / (denom3 < 0.30 ? 0.30 : denom3);
      p3x = mcCx + w3x * inv3;
      p3y = mcCy - w3y * inv3;

      area2 =
        (p3x * p0y - p0x * p3y) +
        (p0x * p1y - p1x * p0y) +
        (p1x * p2y - p2x * p1y) +
        (p2x * p3y - p3x * p2y);
      if (area2 > -1e-4 && area2 < 1e-4) return;

      minX = p0x < p1x ? p0x : p1x;
      if (p2x < minX) minX = p2x;
      if (p3x < minX) minX = p3x;
      maxX = p0x > p1x ? p0x : p1x;
      if (p2x > maxX) maxX = p2x;
      if (p3x > maxX) maxX = p3x;
      minY = p0y < p1y ? p0y : p1y;
      if (p2y < minY) minY = p2y;
      if (p3y < minY) minY = p3y;
      maxY = p0y > p1y ? p0y : p1y;
      if (p2y > maxY) maxY = p2y;
      if (p3y > maxY) maxY = p3y;
      sumD =
        ((w0x + w1x + w2x + w3x) * mcVx +
          (w0y + w1y + w2y + w3y) * mcVy +
          (w0z + w1z + w2z + w3z) * mcVz) * 0.25;
    } else {
      area2 =
        (p2x * p0y - p0x * p2y) +
        (p0x * p1y - p1x * p0y) +
        (p1x * p2y - p2x * p1y);
      if (area2 > -1e-4 && area2 < 1e-4) return;

      minX = p0x < p1x ? (p0x < p2x ? p0x : p2x) : (p1x < p2x ? p1x : p2x);
      maxX = p0x > p1x ? (p0x > p2x ? p0x : p2x) : (p1x > p2x ? p1x : p2x);
      minY = p0y < p1y ? (p0y < p2y ? p0y : p2y) : (p1y < p2y ? p1y : p2y);
      maxY = p0y > p1y ? (p0y > p2y ? p0y : p2y) : (p1y > p2y ? p1y : p2y);
      sumD =
        ((w0x + w1x + w2x) * mcVx +
          (w0y + w1y + w2y) * mcVy +
          (w0z + w1z + w2z) * mcVz) / 3;
    }

    const fill = shadeColorXYZ(rgb, cnx, cny, cnz, mcLightDir, mcHalfVec, mcAtmo, spec, emissive);
    const prim = allocPrimSlot(mcPrimCount++);
    prim.type = 0;
    prim.count = count;
    const pxArr = prim.ptsX;
    const pyArr = prim.ptsY;
    if (area2 < 0) {
      if (has4) {
        pxArr[0] = p3x; pyArr[0] = p3y;
        pxArr[1] = p2x; pyArr[1] = p2y;
        pxArr[2] = p1x; pyArr[2] = p1y;
        pxArr[3] = p0x; pyArr[3] = p0y;
      } else {
        pxArr[0] = p2x; pyArr[0] = p2y;
        pxArr[1] = p1x; pyArr[1] = p1y;
        pxArr[2] = p0x; pyArr[2] = p0y;
      }
    } else {
      pxArr[0] = p0x; pyArr[0] = p0y;
      pxArr[1] = p1x; pyArr[1] = p1y;
      pxArr[2] = p2x; pyArr[2] = p2y;
      if (has4) {
        pxArr[3] = p3x; pyArr[3] = p3y;
      }
    }
    prim.cnx = cnx;
    prim.cny = cny;
    prim.cnz = cnz;
    prim.camOffset = camOffset;
    prim.minX = minX;
    prim.maxX = maxX;
    prim.minY = minY;
    prim.maxY = maxY;
    prim.depthZ = sumD + depthBias;
    prim.depthBias = depthBias;
    prim.convexGroup = convexGroup;
    prim.fill = fill;
    prim.stroke = stroke || fill;
    prim.lineWidth = lineWidth;
  }

  function mcAddFace(localVerts, rgb, opts) {
    const o = opts || {};
    const count = localVerts.length;
    if (count < 3) return;
    if (count <= 4 && !o.refWorld) {
      const v0 = localVerts[0];
      const v1 = localVerts[1];
      const v2 = localVerts[2];
      const v3 = count === 4 ? localVerts[3] : v0;
      const hint = o.outwardNormal;
      mcAddFaceFlat(
        v0[0], v0[1], v0[2],
        v1[0], v1[1], v1[2],
        v2[0], v2[1], v2[2],
        v3[0], v3[1], v3[2],
        count === 4,
        rgb,
        o.spec !== undefined ? o.spec : 0.14,
        o.emissive || 0,
        Boolean(o.doubleSided),
        o.stroke || "",
        o.lineWidth || 0.7,
        o.depthBias || 0,
        Boolean(hint),
        hint ? hint[0] : 0,
        hint ? hint[1] : 0,
        hint ? hint[2] : 0,
        o.convexGroup || 0
      );
      return;
    }

    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < count; i++) {
      const lv = localVerts[i];
      const wx = mcOjx + mcTSx * lv[0] + mcBSx * lv[1] + mcNSx * lv[2];
      const wy = mcOjy + mcTSy * lv[0] + mcBSy * lv[1] + mcNSy * lv[2];
      const wz = mcOjz + mcTSz * lv[0] + mcBSz * lv[1] + mcNSz * lv[2];
      if (wz >= mcNearClipZ) return;
      SCRATCH_WX[i] = wx;
      SCRATCH_WY[i] = wy;
      SCRATCH_WZ[i] = wz;
      cx += wx;
      cy += wy;
      cz += wz;
    }
    cx /= count;
    cy /= count;
    cz /= count;

    const e1x = SCRATCH_WX[1] - SCRATCH_WX[0];
    const e1y = SCRATCH_WY[1] - SCRATCH_WY[0];
    const e1z = SCRATCH_WZ[1] - SCRATCH_WZ[0];
    const e2x = SCRATCH_WX[2] - SCRATCH_WX[0];
    const e2y = SCRATCH_WY[2] - SCRATCH_WY[0];
    const e2z = SCRATCH_WZ[2] - SCRATCH_WZ[0];
    let rnx = e1y * e2z - e1z * e2y;
    let rny = e1z * e2x - e1x * e2z;
    let rnz = e1x * e2y - e1y * e2x;
    let rawLenSq = rnx * rnx + rny * rny + rnz * rnz;
    if (rawLenSq < 1e-18 && count >= 4) {
      const f1x = SCRATCH_WX[2] - SCRATCH_WX[1], f1y = SCRATCH_WY[2] - SCRATCH_WY[1], f1z = SCRATCH_WZ[2] - SCRATCH_WZ[1];
      const f2x = SCRATCH_WX[3] - SCRATCH_WX[1], f2y = SCRATCH_WY[3] - SCRATCH_WY[1], f2z = SCRATCH_WZ[3] - SCRATCH_WZ[1];
      rnx = f1y * f2z - f1z * f2y;
      rny = f1z * f2x - f1x * f2z;
      rnz = f1x * f2y - f1y * f2x;
      rawLenSq = rnx * rnx + rny * rny + rnz * rnz;
    }
    if (rawLenSq < 1e-18) return;
    const invRawLen = 1 / Math.sqrt(rawLenSq);
    let fnx = rnx * invRawLen;
    let fny = rny * invRawLen;
    let fnz = rnz * invRawLen;

    if (o.outwardNormal) {
      const hint = o.outwardNormal;
      const dnx = hint[0] / mcSXY;
      const dny = hint[1] / mcSXY;
      const dnz = hint[2] / mcSZ;
      const hwx = mcTx * dnx + mcBx * dny + mcNx * dnz;
      const hwy = mcTy * dnx + mcBy * dny + mcNy * dnz;
      const hwz = mcTz * dnx + mcBz * dny + mcNz * dnz;
      if (fnx * hwx + fny * hwy + fnz * hwz < 0) {
        fnx = -fnx;
        fny = -fny;
        fnz = -fnz;
      }
    } else if (o.refWorld) {
      const rw = o.refWorld;
      if (fnx * (cx - rw.x) + fny * (cy - rw.y) + fnz * (cz - rw.z) < 0) {
        fnx = -fnx;
        fny = -fny;
        fnz = -fnz;
      }
    }

    const facing = fnx * (mcCamX - cx) + fny * (mcCamY - cy) + fnz * (mcCamZ - cz);
    if (!o.doubleSided && facing <= 1e-7) return;

    const cnx = facing < 0 ? -fnx : fnx;
    const cny = facing < 0 ? -fny : fny;
    const cnz = facing < 0 ? -fnz : fnz;
    const camOffset = cnx * (cx - mcCamX) + cny * (cy - mcCamY) + cnz * (cz - mcCamZ);

    const prim = allocPrimSlot(mcPrimCount++);
    if (prim.ptsX.length < count) {
      prim.ptsX = new Float64Array(count);
      prim.ptsY = new Float64Array(count);
    }
    const pxArr = prim.ptsX;
    const pyArr = prim.ptsY;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, sumD = 0;

    for (let i = 0; i < count; i++) {
      const wx = SCRATCH_WX[i];
      const wy = SCRATCH_WY[i];
      const wz = SCRATCH_WZ[i];
      const denom = mcCamZ - wz;
      const inv = mcFl / (denom < 0.30 ? 0.30 : denom);
      const px = mcCx + wx * inv;
      const py = mcCy - wy * inv;
      pxArr[i] = px;
      pyArr[i] = py;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      sumD += wx * mcVx + wy * mcVy + wz * mcVz;
    }

    let area2 = 0;
    for (let i = 0, j = count - 1; i < count; j = i++) {
      area2 += pxArr[j] * pyArr[i] - pxArr[i] * pyArr[j];
    }
    if (area2 > -1e-4 && area2 < 1e-4) {
      mcPrimCount--;
      return;
    }
    if (area2 < 0) {
      for (let l = 0, r = count - 1; l < r; l++, r--) {
        const tx = pxArr[l]; pxArr[l] = pxArr[r]; pxArr[r] = tx;
        const ty = pyArr[l]; pyArr[l] = pyArr[r]; pyArr[r] = ty;
      }
    }

    const spec = o.spec !== undefined ? o.spec : 0.14;
    const emissive = o.emissive || 0;
    const fill = shadeColorXYZ(rgb, cnx, cny, cnz, mcLightDir, mcHalfVec, mcAtmo, spec, emissive);
    const bias = o.depthBias || 0;

    prim.type = 0;
    prim.count = count;
    prim.cnx = cnx;
    prim.cny = cny;
    prim.cnz = cnz;
    prim.camOffset = camOffset;
    prim.minX = minX;
    prim.maxX = maxX;
    prim.minY = minY;
    prim.maxY = maxY;
    prim.depthZ = sumD / count + bias;
    prim.depthBias = bias;
    prim.convexGroup = o.convexGroup || 0;
    prim.fill = fill;
    prim.stroke = o.stroke || fill;
    prim.lineWidth = o.lineWidth || 0.7;
  }

  function mcAddQuad(v0, v1, v2, v3, rgb, opts) {
    const o = opts || {};
    if (o.refWorld) {
      mcAddFace([v0, v1, v2, v3], rgb, o);
      return;
    }
    const hint = o.outwardNormal;
    mcAddFaceFlat(
      v0[0], v0[1], v0[2],
      v1[0], v1[1], v1[2],
      v2[0], v2[1], v2[2],
      v3[0], v3[1], v3[2],
      true,
      rgb,
      o.spec !== undefined ? o.spec : 0.14,
      o.emissive || 0,
      Boolean(o.doubleSided),
      o.stroke || "",
      o.lineWidth || 0.7,
      o.depthBias || 0,
      Boolean(hint),
      hint ? hint[0] : 0,
      hint ? hint[1] : 0,
      hint ? hint[2] : 0,
      o.convexGroup || 0
    );
  }

  function mcAddLine(a, bPt, stroke, lineWidth, depthBias, opts) {
    const wax = mcOjx + mcTSx * a[0] + mcBSx * a[1] + mcNSx * a[2];
    const way = mcOjy + mcTSy * a[0] + mcBSy * a[1] + mcNSy * a[2];
    const waz = mcOjz + mcTSz * a[0] + mcBSz * a[1] + mcNSz * a[2];
    if (waz >= mcNearClipZ) return;

    const wbx = mcOjx + mcTSx * bPt[0] + mcBSx * bPt[1] + mcNSx * bPt[2];
    const wby = mcOjy + mcTSy * bPt[0] + mcBSy * bPt[1] + mcNSy * bPt[2];
    const wbz = mcOjz + mcTSz * bPt[0] + mcBSz * bPt[1] + mcNSz * bPt[2];
    if (wbz >= mcNearClipZ) return;

    if (opts && opts.outwardNormal) {
      const hint = opts.outwardNormal;
      const dnx = hint[0] / mcSXY;
      const dny = hint[1] / mcSXY;
      const dnz = hint[2] / mcSZ;
      const hwx = mcTx * dnx + mcBx * dny + mcNx * dnz;
      const hwy = mcTy * dnx + mcBy * dny + mcNy * dnz;
      const hwz = mcTz * dnx + mcBz * dny + mcNz * dnz;
      const midX = (wax + wbx) * 0.5;
      const midY = (way + wby) * 0.5;
      const midZ = (waz + wbz) * 0.5;
      if (hwx * (mcCamX - midX) + hwy * (mcCamY - midY) + hwz * (mcCamZ - midZ) <= 1e-7) {
        return;
      }
    }

    const denom0 = mcCamZ - waz;
    const inv0 = mcFl / (denom0 < 0.30 ? 0.30 : denom0);
    const p0x = mcCx + wax * inv0;
    const p0y = mcCy - way * inv0;

    const denom1 = mcCamZ - wbz;
    const inv1 = mcFl / (denom1 < 0.30 ? 0.30 : denom1);
    const p1x = mcCx + wbx * inv1;
    const p1y = mcCy - wby * inv1;

    const da = wax * mcVx + way * mcVy + waz * mcVz;
    const db = wbx * mcVx + wby * mcVy + wbz * mcVz;
    const d0 = denom0 < 0.30 ? 0.30 : denom0;
    const d1 = denom1 < 0.30 ? 0.30 : denom1;
    const bias = depthBias || 0;
    const lw = lineWidth || 1.2;
    const pad = lw * 0.5;

    const prim = allocPrimSlot(mcPrimCount++);
    prim.type = 1;
    prim.p0x = p0x;
    prim.p0y = p0y;
    prim.p1x = p1x;
    prim.p1y = p1y;
    prim.d0 = d0;
    prim.d1 = d1;
    prim.minX = (p0x < p1x ? p0x : p1x) - pad;
    prim.maxX = (p0x > p1x ? p0x : p1x) + pad;
    prim.minY = (p0y < p1y ? p0y : p1y) - pad;
    prim.maxY = (p0y > p1y ? p0y : p1y) + pad;
    prim.depthZ = (da + db) * 0.5 + bias;
    prim.depthBias = bias;
    prim.convexGroup = 0;
    prim.stroke = stroke;
    prim.lineWidth = lw;
  }

  function mcAddBox(cx, cy, cz, hx, hy, hz, rgb, opts) {
    const o = opts || {};
    const spec = o.spec !== undefined ? o.spec : 0.14;
    const emissive = o.emissive || 0;
    const ds = Boolean(o.doubleSided);
    const stroke = o.stroke || "";
    const lw = o.lineWidth || 0.7;
    const bias = o.depthBias || 0;
    const grp = ds ? 0 : ++mcNextConvexGroup;

    const x0 = cx - hx, x1 = cx + hx;
    const y0 = cy - hy, y1 = cy + hy;
    const z0 = cz - hz, z1 = cz + hz;

    if (ds || mcCamLz > z1 - 1e-5) {
      mcAddFaceFlat(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1, true, rgb, spec, emissive, ds, stroke, lw, bias, true, 0, 0, 1, grp);
    }
    if (ds || z0 + 1e-5 > mcCamLz) {
      mcAddFaceFlat(x0, y0, z0, x0, y1, z0, x1, y1, z0, x1, y0, z0, true, rgb, spec, emissive, ds, stroke, lw, bias, true, 0, 0, -1, grp);
    }
    if (ds || y0 + 1e-5 > mcCamLy) {
      mcAddFaceFlat(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1, true, rgb, spec, emissive, ds, stroke, lw, bias, true, 0, -1, 0, grp);
    }
    if (ds || mcCamLy > y1 - 1e-5) {
      mcAddFaceFlat(x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0, true, rgb, spec, emissive, ds, stroke, lw, bias, true, 0, 1, 0, grp);
    }
    if (ds || mcCamLx > x1 - 1e-5) {
      mcAddFaceFlat(x1, y0, z0, x1, y1, z0, x1, y1, z1, x1, y0, z1, true, rgb, spec, emissive, ds, stroke, lw, bias, true, 1, 0, 0, grp);
    }
    if (ds || x0 + 1e-5 > mcCamLx) {
      mcAddFaceFlat(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0, true, rgb, spec, emissive, ds, stroke, lw, bias, true, -1, 0, 0, grp);
    }
  }

  function mcAddPrism(cx, cy, z0, z1, r0, r1, sides, rotAngle, rgb, opts) {
    const o = opts || {};
    const swapped = z1 < z0;
    const zBot = swapped ? z1 : z0;
    const zTop = swapped ? z0 : z1;
    const rBot = swapped ? r1 : r0;
    const rTop = swapped ? r0 : r1;
    const h = zTop - zBot;
    if (h < 1e-6) return;

    const spec = o.spec !== undefined ? o.spec : 0.14;
    const emissive = o.emissive || 0;
    const ds = Boolean(o.doubleSided);
    const stroke = o.stroke || "";
    const lw = o.lineWidth || 0.7;
    const bias = o.depthBias || 0;
    const grp = ds ? 0 : ++mcNextConvexGroup;

    const angleOffset = rotAngle || 0;
    const step = (Math.PI * 2) / sides;
    const cosHalf = Math.cos(Math.PI / sides);

    for (let i = 0; i < sides; i++) {
      const a = angleOffset + step * i;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      RING_BOT_X[i] = cx + rBot * ca;
      RING_BOT_Y[i] = cy + rBot * sa;
      RING_TOP_X[i] = cx + rTop * ca;
      RING_TOP_Y[i] = cy + rTop * sa;
    }

    const effRBot = rBot > 0.002 ? rBot : 0;
    const effRTop = rTop > 0.002 ? rTop : 0;
    const dzSlope = (effRBot - effRTop) * cosHalf;
    for (let i = 0; i < sides; i++) {
      const next = i + 1 < sides ? i + 1 : 0;
      const midA = angleOffset + step * (i + 0.5);
      const onx = Math.cos(midA) * h;
      const ony = Math.sin(midA) * h;
      const bx0 = RING_BOT_X[i];
      const by0 = RING_BOT_Y[i];
      const px0 = effRBot > 0 ? bx0 : cx;
      const py0 = effRBot > 0 ? by0 : cy;

      if (!ds && onx * (mcCamLx - px0) + ony * (mcCamLy - py0) + dzSlope * (mcCamLz - zBot) <= -1e-4) {
        continue;
      }

      if (rBot > 0.002 && rTop > 0.002) {
        mcAddFaceFlat(
          bx0, by0, zBot,
          RING_BOT_X[next], RING_BOT_Y[next], zBot,
          RING_TOP_X[next], RING_TOP_Y[next], zTop,
          RING_TOP_X[i], RING_TOP_Y[i], zTop,
          true, rgb, spec, emissive, ds, stroke, lw, bias, true, onx, ony, dzSlope, grp
        );
      } else if (rBot > 0.002) {
        mcAddFaceFlat(
          bx0, by0, zBot,
          RING_BOT_X[next], RING_BOT_Y[next], zBot,
          cx, cy, zTop,
          0, 0, 0,
          false, rgb, spec, emissive, ds, stroke, lw, bias, true, onx, ony, dzSlope, grp
        );
      } else if (rTop > 0.002) {
        mcAddFaceFlat(
          cx, cy, zBot,
          RING_TOP_X[next], RING_TOP_Y[next], zTop,
          RING_TOP_X[i], RING_TOP_Y[i], zTop,
          0, 0, 0,
          false, rgb, spec, emissive, ds, stroke, lw, bias, true, onx, ony, dzSlope, grp
        );
      }
    }

    if (rTop > 0.002 && !o.openTop && (ds || mcCamLz > zTop - 1e-5)) {
      const capOpts = {
        spec: spec,
        emissive: emissive,
        doubleSided: ds,
        stroke: stroke,
        lineWidth: lw,
        depthBias: bias,
        convexGroup: grp,
        outwardNormal: [0, 0, 1]
      };
      const topVerts = new Array(sides);
      for (let i = 0; i < sides; i++) {
        topVerts[i] = [RING_TOP_X[i], RING_TOP_Y[i], zTop];
      }
      mcAddFace(topVerts, rgb, capOpts);
    }
    if (rBot > 0.002 && !o.openBottom && (ds || zBot + 1e-5 > mcCamLz)) {
      const capOpts = {
        spec: spec,
        emissive: emissive,
        doubleSided: ds,
        stroke: stroke,
        lineWidth: lw,
        depthBias: bias,
        convexGroup: grp,
        outwardNormal: [0, 0, -1]
      };
      const botVerts = new Array(sides);
      for (let i = 0; i < sides; i++) {
        botVerts[i] = [RING_BOT_X[sides - 1 - i], RING_BOT_Y[sides - 1 - i], zBot];
      }
      mcAddFace(botVerts, rgb, capOpts);
    }
  }

  function mcAddDome(cx, cy, zBase, rx, ry, rz, rings, segs, rgb, opts) {
    const o = opts || {};
    const spec = o.spec !== undefined ? o.spec : 0.14;
    const emissive = o.emissive || 0;
    const ds = Boolean(o.doubleSided);
    const stroke = o.stroke || "";
    const lw = o.lineWidth || 0.7;
    const bias = o.depthBias || 0;
    const grp = ds ? 0 : ++mcNextConvexGroup;

    const invRx = 1 / (rx || 1);
    const invRy = 1 / (ry || 1);
    const invRz = 1 / (rz || 1);

    for (let k = 0; k <= segs; k++) {
      const ang = (Math.PI * 2 * k) / segs;
      COS_LUT[k] = Math.cos(ang);
      SIN_LUT[k] = Math.sin(ang);
    }

    for (let r = 0; r < rings; r++) {
      const phi0 = (Math.PI * 0.5 * r) / rings;
      const phi1 = (Math.PI * 0.5 * (r + 1)) / rings;
      const c0 = Math.cos(phi0);
      const s0 = Math.sin(phi0);
      const c1 = Math.cos(phi1);
      const s1 = Math.sin(phi1);
      const phiMid = (phi0 + phi1) * 0.5;
      const cMid = Math.cos(phiMid);
      const sMid = Math.sin(phiMid);

      for (let k = 0; k < segs; k++) {
        const ck0 = COS_LUT[k], sk0 = SIN_LUT[k];
        const ck1 = COS_LUT[k + 1], sk1 = SIN_LUT[k + 1];
        const tMid = (Math.PI * 2 * (k + 0.5)) / segs;
        const hnx = cMid * Math.cos(tMid) * invRx;
        const hny = cMid * Math.sin(tMid) * invRy;
        const hnz = sMid * invRz;

        const p00x = cx + rx * c0 * ck0;
        const p00y = cy + ry * c0 * sk0;
        const p00z = zBase + rz * s0;

        if (!ds) {
          const dpx = mcCamLx - p00x;
          const dpy = mcCamLy - p00y;
          const dpz = mcCamLz - p00z;
          const dotN = hnx * dpx + hny * dpy + hnz * dpz;
          if (dotN < -0.25 * Math.sqrt((hnx * hnx + hny * hny + hnz * hnz) * (dpx * dpx + dpy * dpy + dpz * dpz))) {
            continue;
          }
        }

        const p01x = cx + rx * c0 * ck1;
        const p01y = cy + ry * c0 * sk1;
        if (r === rings - 1) {
          mcAddFaceFlat(
            p00x, p00y, p00z,
            p01x, p01y, p00z,
            cx, cy, zBase + rz,
            0, 0, 0,
            false, rgb, spec, emissive, ds, stroke, lw, bias, true, hnx, hny, hnz, grp
          );
        } else {
          const p11x = cx + rx * c1 * ck1;
          const p11y = cy + ry * c1 * sk1;
          const p10x = cx + rx * c1 * ck0;
          const p10y = cy + ry * c1 * sk0;
          const z1 = zBase + rz * s1;
          mcAddFaceFlat(
            p00x, p00y, p00z,
            p01x, p01y, p00z,
            p11x, p11y, z1,
            p10x, p10y, z1,
            true, rgb, spec, emissive, ds, stroke, lw, bias, true, hnx, hny, hnz, grp
          );
        }
      }
    }

    if (!o.openBottom && rx > 0.002 && ry > 0.002 && (ds || zBase + 1e-5 > mcCamLz)) {
      const capOpts = {
        spec: spec,
        emissive: emissive,
        doubleSided: ds,
        stroke: stroke,
        lineWidth: lw,
        depthBias: bias,
        convexGroup: grp,
        outwardNormal: [0, 0, -1]
      };
      const baseVerts = new Array(segs);
      for (let k = 0; k < segs; k++) {
        const rk = segs - 1 - k;
        baseVerts[k] = [cx + rx * COS_LUT[rk], cy + ry * SIN_LUT[rk], zBase];
      }
      mcAddFace(baseVerts, rgb, capOpts);
    }
  }

  function mcDrawAll(ctx) {
    const n = mcPrimCount;
    if (n === 0) return;

    ensureSortNodeCap(n);
    for (let i = 0; i < n; i++) {
      sortHead[i] = -1;
      sortIndeg[i] = 0;
      sortDone[i] = 0;
    }

    let edgeCount = 0;
    const cx = mcCx;
    const cy = mcCy;
    const fl = mcFl;

    for (let i = 0; i < n; i++) {
      const A = primPool[i];
      const aIsPoly = A.type === 0;
      const aGrp = A.convexGroup;
      for (let j = i + 1; j < n; j++) {
        const B = primPool[j];
        if (aGrp > 0 && aGrp === B.convexGroup) {
          continue;
        }
        if (
          A.maxX <= B.minX + 0.05 ||
          B.maxX <= A.minX + 0.05 ||
          A.maxY <= B.minY + 0.05 ||
          B.maxY <= A.minY + 0.05
        ) {
          continue;
        }

        const bIsPoly = B.type === 0;
        let dir = 0;

        if (aIsPoly && bIsPoly) {
          if (!clipPolyOverlapCentroid(A.ptsX, A.ptsY, A.count, B.ptsX, B.ptsY, B.count, CLIP_OVERLAP_PT)) {
            continue;
          }
          const rx = (CLIP_OVERLAP_PT.x - cx) / fl;
          const ry = -(CLIP_OVERLAP_PT.y - cy) / fl;
          const da = A.cnx * rx + A.cny * ry - A.cnz;
          const db = B.cnx * rx + B.cny * ry - B.cnz;
          if ((da > 1e-7 || da < -1e-7) && (db > 1e-7 || db < -1e-7)) {
            const ta = A.camOffset / da;
            const tb = B.camOffset / db;
            const diff = ta - tb;
            if (diff > 1e-5 || diff < -1e-5) {
              dir = ta > tb ? -1 : 1;
            } else {
              dir = A.depthBias <= B.depthBias ? -1 : 1;
            }
          } else {
            dir = A.depthZ <= B.depthZ ? -1 : 1;
          }
        } else if (aIsPoly !== bIsPoly) {
          const L = aIsPoly ? B : A;
          const P = aIsPoly ? A : B;
          if (!clipLineInPoly(L.p0x, L.p0y, L.p1x, L.p1y, P.ptsX, P.ptsY, P.count, LINE_HIT_INFO)) {
            continue;
          }
          const rx = (LINE_HIT_INFO.x - cx) / fl;
          const ry = -(LINE_HIT_INFO.y - cy) / fl;
          const dp = P.cnx * rx + P.cny * ry - P.cnz;
          const tL = (L.d0 * L.d1) / ((1 - LINE_HIT_INFO.um) * L.d1 + LINE_HIT_INFO.um * L.d0);
          const tP = (dp > 1e-7 || dp < -1e-7) ? P.camOffset / dp : mcCamZ - P.depthZ;
          const diff = tL - tP;
          const lineBehind = (diff > 1e-5 || diff < -1e-5) ? tL > tP : L.depthBias <= P.depthBias;
          dir = lineBehind ? (aIsPoly ? 1 : -1) : (aIsPoly ? -1 : 1);
        } else {
          continue;
        }

        if (dir !== 0) {
          const from = dir < 0 ? i : j;
          const to = dir < 0 ? j : i;
          ensureSortEdgeCap(edgeCount + 1);
          sortEdgeTo[edgeCount] = to;
          sortEdgeNext[edgeCount] = sortHead[from];
          sortHead[from] = edgeCount++;
          sortIndeg[to]++;
        }
      }
    }

    let lastFill = "";
    let lastStroke = "";
    let lastLW = -1;

    if (edgeCount === 0) {
      for (let i = 0; i < n; i++) {
        sortFastOrder[i] = i;
      }
      for (let i = 1; i < n; i++) {
        const keyIdx = sortFastOrder[i];
        const keyDepth = primPool[keyIdx].depthZ;
        let k = i - 1;
        while (k >= 0 && primPool[sortFastOrder[k]].depthZ > keyDepth) {
          sortFastOrder[k + 1] = sortFastOrder[k];
          k--;
        }
        sortFastOrder[k + 1] = keyIdx;
      }
      for (let step = 0; step < n; step++) {
        const p = primPool[sortFastOrder[step]];
        if (p.type === 1) {
          ctx.beginPath();
          ctx.moveTo(p.p0x, p.p0y);
          ctx.lineTo(p.p1x, p.p1y);
          if (p.stroke !== lastStroke) { ctx.strokeStyle = p.stroke; lastStroke = p.stroke; }
          if (p.lineWidth !== lastLW) { ctx.lineWidth = p.lineWidth; lastLW = p.lineWidth; }
          ctx.stroke();
        } else {
          const pxArr = p.ptsX;
          const pyArr = p.ptsY;
          const cnt = p.count;
          ctx.beginPath();
          ctx.moveTo(pxArr[0], pyArr[0]);
          for (let k = 1; k < cnt; k++) {
            ctx.lineTo(pxArr[k], pyArr[k]);
          }
          ctx.closePath();
          if (p.fill !== lastFill) { ctx.fillStyle = p.fill; lastFill = p.fill; }
          ctx.fill();
          if (p.lineWidth !== lastLW) { ctx.lineWidth = p.lineWidth; lastLW = p.lineWidth; }
          if (p.stroke !== lastStroke) { ctx.strokeStyle = p.stroke; lastStroke = p.stroke; }
          ctx.stroke();
        }
      }
      return;
    }

    let readyCount = 0;
    for (let i = 0; i < n; i++) {
      if (sortIndeg[i] === 0) {
        sortReady[readyCount++] = i;
      }
    }

    for (let step = 0; step < n; step++) {
      let best = -1;
      if (readyCount > 0) {
        let bestSlot = 0;
        best = sortReady[0];
        let bestDepth = primPool[best].depthZ;
        for (let r = 1; r < readyCount; r++) {
          const idx = sortReady[r];
          const d = primPool[idx].depthZ;
          if (d < bestDepth) {
            bestDepth = d;
            best = idx;
            bestSlot = r;
          }
        }
        sortReady[bestSlot] = sortReady[--readyCount];
      } else {
        for (let i = 0; i < n; i++) {
          if (sortDone[i]) continue;
          if (
            best < 0 ||
            sortIndeg[i] < sortIndeg[best] ||
            (sortIndeg[i] === sortIndeg[best] && primPool[i].depthZ < primPool[best].depthZ)
          ) {
            best = i;
          }
        }
      }

      sortDone[best] = 1;
      for (let e = sortHead[best]; e !== -1; e = sortEdgeNext[e]) {
        const to = sortEdgeTo[e];
        if (--sortIndeg[to] === 0 && !sortDone[to]) {
          sortReady[readyCount++] = to;
        }
      }

      const p = primPool[best];
      if (p.type === 1) {
        ctx.beginPath();
        ctx.moveTo(p.p0x, p.p0y);
        ctx.lineTo(p.p1x, p.p1y);
        if (p.stroke !== lastStroke) { ctx.strokeStyle = p.stroke; lastStroke = p.stroke; }
        if (p.lineWidth !== lastLW) { ctx.lineWidth = p.lineWidth; lastLW = p.lineWidth; }
        ctx.stroke();
      } else {
        const pxArr = p.ptsX;
        const pyArr = p.ptsY;
        const cnt = p.count;
        ctx.beginPath();
        ctx.moveTo(pxArr[0], pyArr[0]);
        for (let k = 1; k < cnt; k++) {
          ctx.lineTo(pxArr[k], pyArr[k]);
        }
        ctx.closePath();
        if (p.fill !== lastFill) { ctx.fillStyle = p.fill; lastFill = p.fill; }
        ctx.fill();
        if (p.lineWidth !== lastLW) { ctx.lineWidth = p.lineWidth; lastLW = p.lineWidth; }
        if (p.stroke !== lastStroke) { ctx.strokeStyle = p.stroke; lastStroke = p.stroke; }
        ctx.stroke();
      }
    }
  }

  const sharedCollector = {
    toWorld: mcToWorld,
    addFace: mcAddFace,
    addQuad: mcAddQuad,
    addLine: mcAddLine,
    addBox: mcAddBox,
    addPrism: mcAddPrism,
    addDome: mcAddDome,
    drawAll: mcDrawAll
  };

  function createMeshCollector(frame, buildScale, opts) {
    const o = opts || {};
    mcPrimCount = 0;
    mcNextConvexGroup = 0;
    const baseS = frame.scale * Math.max(0.05, buildScale);
    mcSXY = Math.max(1e-4, baseS * (o.scaleXY !== undefined ? o.scaleXY : 1));
    mcSZ = Math.max(1e-4, baseS * (o.scaleZ !== undefined ? o.scaleZ : 1));
    mcJx = o.jitterX || 0;
    mcJy = o.jitterY || 0;
    mcOx = frame.origin.x;
    mcOy = frame.origin.y;
    mcOz = frame.origin.z;
    const t = frame.rotT;
    const b = frame.rotB;
    const n = frame.rotN;
    mcTx = t.x; mcTy = t.y; mcTz = t.z;
    mcBx = b.x; mcBy = b.y; mcBz = b.z;
    mcNx = n.x; mcNy = n.y; mcNz = n.z;

    mcTSx = mcTx * mcSXY; mcTSy = mcTy * mcSXY; mcTSz = mcTz * mcSXY;
    mcBSx = mcBx * mcSXY; mcBSy = mcBy * mcSXY; mcBSz = mcBz * mcSXY;
    mcNSx = mcNx * mcSZ;  mcNSy = mcNy * mcSZ;  mcNSz = mcNz * mcSZ;
    mcOjx = mcOx + mcTSx * mcJx + mcBSx * mcJy;
    mcOjy = mcOy + mcTSy * mcJx + mcBSy * mcJy;
    mcOjz = mcOz + mcTSz * mcJx + mcBSz * mcJy;

    mcCamX = frame.camVec.x;
    mcCamY = frame.camVec.y;
    mcCamZ = frame.camVec.z;
    mcNearClipZ = mcCamZ - 0.25;
    mcCx = frame.cx;
    mcCy = frame.cy;
    mcFl = frame.focalLength;
    mcLightDir = frame.lightDir;
    mcHalfVec = frame.halfVec;
    mcAtmo = frame.atmo;

    const dxCam = mcCamX - mcOjx;
    const dyCam = mcCamY - mcOjy;
    const dzCam = mcCamZ - mcOjz;
    const vLen = Math.sqrt(dxCam * dxCam + dyCam * dyCam + dzCam * dzCam) || 1;
    mcVx = dxCam / vLen;
    mcVy = dyCam / vLen;
    mcVz = dzCam / vLen;

    mcCamLx = (dxCam * mcTx + dyCam * mcTy + dzCam * mcTz) / mcSXY;
    mcCamLy = (dxCam * mcBx + dyCam * mcBy + dzCam * mcBz) / mcSXY;
    mcCamLz = (dxCam * mcNx + dyCam * mcNy + dzCam * mcNz) / mcSZ;

    return sharedCollector;
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

    // Side cleanroom wing + glowing cyan viewport mounted proud on exterior wall
    m.addBox(-0.24, 0.16, 0.19, 0.18, 0.15, 0.10, [226, 232, 240], { spec: 0.35 });
    m.addBox(-0.24, -0.002, 0.19, 0.11, 0.011, 0.045, [56, 189, 248], { emissive: 0.72 });

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
      { doubleSided: true, spec: 0.45 }
    );
    m.addLine(
      [rx + dirX * 0.05, ry + dirY * 0.05, dZ + 0.04],
      [rx + dirX * 0.15, ry + dirY * 0.15, dZ + 0.08],
      "#67e8f9",
      Math.max(1.1, pxScale * 0.035)
    );
  }

  function buildResearchCenterModel(m, time, phase, pxScale) {
    // Tiered white/indigo science citadel base
    m.addPrism(0, 0, 0.0, 0.10, 0.64, 0.58, 8, Math.PI / 8, [79, 70, 229], { spec: 0.35 });
    m.addBox(-0.34, 0.0, 0.19, 0.14, 0.22, 0.10, [226, 232, 240], { spec: 0.35 });
    m.addBox(0.34, 0.0, 0.19, 0.14, 0.22, 0.10, [226, 232, 240], { spec: 0.35 });
    m.addBox(0, -0.22, 0.22, 0.26, 0.14, 0.12, [241, 245, 249], { spec: 0.40 });
    m.addBox(0, -0.372, 0.20, 0.10, 0.011, 0.08, [56, 189, 248], { emissive: 0.80 });

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
        lw
      );
    }
  }

  function buildObservatoryModel(m, time, phase, pxScale) {
    // Indigo stone octagonal plinth
    m.addPrism(0, 0, 0.0, 0.14, 0.58, 0.52, 8, Math.PI / 8, [99, 102, 241], { spec: 0.28 });
    m.addPrism(0, 0, 0.14, 0.22, 0.44, 0.42, 8, Math.PI / 8, [199, 210, 254], { spec: 0.35 });

    // Observatory dome
    m.addDome(0, 0, 0.22, 0.38, 0.38, 0.36, 3, 8, [226, 232, 240], { spec: 0.55 });

    // Slowly panning skyward telescope tube anchored cleanly at outer dome shell
    const pan = Math.sin(time * 0.0009 + phase) * 0.45 + 0.4;
    const dirX = Math.cos(pan);
    const dirY = Math.sin(pan);
    const base = [dirX * 0.24, dirY * 0.24, 0.49];
    const tip = [dirX * 0.50, dirY * 0.50, 0.80];
    m.addLine(base, tip, "#4f46e5", Math.max(3.0, pxScale * 0.12));
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
        lw
      );
      const b0 = spinB + (Math.PI * 2 * k) / 6;
      const b1 = spinB + (Math.PI * 2 * (k + 1)) / 6;
      m.addLine(
        [Math.cos(b0) * 0.30, Math.sin(b0) * 0.30, hoverZ - Math.sin(b0) * 0.14],
        [Math.cos(b1) * 0.30, Math.sin(b1) * 0.30, hoverZ - Math.sin(b1) * 0.14],
        "#f472b6",
        lw
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
        beamLW
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
        lw
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
      zNozzle,
      zNozzle - totalLen * 0.34,
      rNozzle * 0.92,
      rNozzle * 0.78,
      7,
      spin * 0.5,
      [255, 255, 255],
      { emissive: 1.0, spec: 0.1 }
    );
    m.addPrism(
      ox,
      oy,
      zNozzle - totalLen * 0.34,
      zNozzle - totalLen * 0.68,
      rNozzle * 0.96,
      rNozzle * 0.50,
      7,
      -spin,
      [255, 200, 58],
      { emissive: 0.96, spec: 0.1 }
    );
    m.addPrism(
      ox,
      oy,
      zNozzle - totalLen * 0.68,
      zNozzle - totalLen,
      rNozzle * 0.56,
      0.001,
      6,
      spin,
      [255, 90, 77],
      { emissive: 0.90, spec: 0.1 }
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

    // Thruster bell + 4 radial delta fins mounted flush outside fuselage
    m.addPrism(jx, 0, zAt(0.0), zAt(0.08), 0.12, 0.08, 8, 0, [255, 200, 58], {
      spec: 0.45,
      emissive: thrust > 0 ? 0.65 : 0
    });
    m.addBox(jx - 0.175, 0, zAt(0.14), 0.052, 0.032, 0.08 * sz, [255, 90, 77], { spec: 0.30 });
    m.addBox(jx + 0.175, 0, zAt(0.14), 0.052, 0.032, 0.08 * sz, [255, 90, 77], { spec: 0.30 });
    m.addBox(jx, -0.175, zAt(0.14), 0.032, 0.052, 0.08 * sz, [224, 62, 49], { spec: 0.30 });
    m.addBox(jx, 0.175, zAt(0.14), 0.032, 0.052, 0.08 * sz, [224, 62, 49], { spec: 0.30 });

    // White orbital fuselage + crimson nose cone + glowing cyan porthole outside shell
    m.addPrism(jx, 0, zAt(0.08), zAt(0.60), 0.13, 0.12, 10, 0, [248, 250, 252], { spec: 0.48 });
    m.addPrism(jx, 0, zAt(0.60), zAt(0.82), 0.12, 0.015, 10, 0, [255, 90, 77], { spec: 0.40 });
    m.addBox(jx, -0.142, zAt(0.42), 0.045, 0.014, 0.045 * sz, [56, 189, 248], { emissive: 0.72 });
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
    m.addBox(jx, -0.156, zAt(0.49), 0.055, 0.014, 0.055 * sz, [56, 189, 248], { emissive: 0.80 });
  }

  function buildSpaceRocket1Model(m, time, phase, pxScale, opts) {
    if (opts && opts.isLanded) {
      buildSpaceRocket1Vessel3D(m, time, phase, pxScale, { zOffset: 0.0, thrust: 0 });
      return;
    }
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

  function buildSpaceRocket2Model(m, time, phase, pxScale, opts) {
    if (opts && opts.isLanded) {
      buildSpaceRocket2Vessel3D(m, time, phase, pxScale, { zOffset: 0.0, thrust: 0 });
      return;
    }
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

    // Warm golden lit viewport pods outside biodome shell
    const winGlow = 0.65 + 0.12 * Math.sin(time * 0.002 + phase);
    for (let k = 0; k < 4; k++) {
      const ang = (Math.PI * 2 * k) / 4 + 0.45;
      const wx = -0.04 + Math.cos(ang) * 0.352;
      const wy = 0.04 + Math.sin(ang) * 0.352;
      m.addBox(wx, wy, 0.20, 0.032, 0.032, 0.035, [253, 224, 71], { emissive: winGlow });
    }

    // Pressurized airlock entryway pod + warm lit door outside front wall
    m.addBox(0.30, -0.18, 0.17, 0.14, 0.12, 0.09, [203, 213, 225], { spec: 0.28 });
    m.addBox(0.452, -0.18, 0.16, 0.011, 0.06, 0.05, [251, 191, 36], { emissive: 0.72 });

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
    m.addBox(0, 0, 0.382, 0.35, 0.27, 0.012, [255, 138, 61], { spec: 0.25 });

    // Second-story suite + pitched terracotta-orange pyramid roof
    m.addBox(-0.04, 0.02, 0.49, 0.24, 0.19, 0.095, [248, 250, 252], { spec: 0.35 });
    m.addPrism(-0.04, 0.02, 0.585, 0.72, 0.36, 0.04, 4, Math.PI / 4, [255, 132, 56], { spec: 0.30 });

    // Side glass sunroom biodome
    m.addDome(0.30, -0.06, 0.13, 0.16, 0.16, 0.16, 2, 8, [125, 211, 252], {
      spec: 0.55,
      emissive: 0.22
    });

    // Warm golden glowing windows & entryway door mounted flush outside walls
    const winGlow = 0.66 + 0.12 * Math.sin(time * 0.002 + phase);
    m.addBox(0, -0.262, 0.22, 0.065, 0.011, 0.085, [251, 191, 36], { emissive: 0.72 });
    m.addBox(-0.18, -0.262, 0.24, 0.055, 0.011, 0.048, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.18, -0.262, 0.24, 0.055, 0.011, 0.048, [253, 224, 71], { emissive: winGlow });
    m.addBox(-0.14, 0.262, 0.24, 0.055, 0.011, 0.048, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.14, 0.262, 0.24, 0.055, 0.011, 0.048, [253, 224, 71], { emissive: winGlow });
    m.addBox(-0.342, 0, 0.24, 0.011, 0.075, 0.048, [253, 224, 71], { emissive: winGlow });

    // Second-story lit windows outside upper walls
    m.addBox(-0.12, -0.182, 0.49, 0.048, 0.011, 0.042, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.05, -0.182, 0.49, 0.048, 0.011, 0.042, [253, 224, 71], { emissive: winGlow });
    m.addBox(-0.04, 0.222, 0.49, 0.075, 0.011, 0.042, [253, 224, 71], { emissive: winGlow });
    m.addBox(-0.292, 0.02, 0.49, 0.011, 0.06, 0.042, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.212, 0.02, 0.49, 0.011, 0.06, 0.042, [253, 224, 71], { emissive: winGlow });

    // Slim rooftop beacon spire
    m.addLine([-0.04, 0.02, 0.72], [-0.04, 0.02, 0.85], "#e2e8f0", Math.max(1.1, pxScale * 0.035));
    m.addPrism(-0.04, 0.02, 0.84, 0.88, 0.032, 0.01, 6, 0, [251, 191, 36], { emissive: 0.72 });
  }

  function buildVillaModel(m, time, phase, pxScale) {
    // Grand hexagonal marble terrace, golden trim collar & emerald manicured garden lawn
    m.addPrism(0, 0, 0.0, 0.09, 0.70, 0.66, 6, 0, [226, 232, 240], { spec: 0.28 });
    m.addPrism(0, 0, 0.09, 0.115, 0.64, 0.62, 6, 0, [251, 191, 36], { spec: 0.50 });
    m.addPrism(0, 0, 0.115, 0.135, 0.58, 0.57, 6, 0, [16, 185, 129], { spec: 0.12 });

    // Glowing cyan front courtyard infinity pool above lawn & flanking ornamental cypress cones
    m.addBox(0, -0.34, 0.146, 0.23, 0.105, 0.010, [56, 189, 248], {
      emissive: 0.55,
      spec: 0.85
    });
    m.addPrism(-0.34, -0.30, 0.135, 0.30, 0.065, 0.01, 6, 0, [34, 197, 94], { spec: 0.12 });
    m.addPrism(0.34, -0.30, 0.135, 0.30, 0.065, 0.01, 6, 0, [34, 197, 94], { spec: 0.12 });

    // Symmetrical left & right marble villa wings with royal-amethyst pitched roofs
    m.addBox(-0.31, 0.04, 0.24, 0.15, 0.20, 0.11, [255, 249, 238], { spec: 0.34 });
    m.addPrism(-0.31, 0.04, 0.35, 0.45, 0.29, 0.05, 4, Math.PI / 4, [139, 92, 246], { spec: 0.35 });
    m.addBox(0.31, 0.04, 0.24, 0.15, 0.20, 0.11, [255, 249, 238], { spec: 0.34 });
    m.addPrism(0.31, 0.04, 0.35, 0.45, 0.29, 0.05, 4, Math.PI / 4, [139, 92, 246], { spec: 0.35 });

    // Grand central 2-story marble hall split cleanly around golden balcony cornice
    m.addBox(0, 0.10, 0.2325, 0.21, 0.21, 0.0975, [255, 252, 245], { spec: 0.38 });
    m.addBox(0, 0.10, 0.35, 0.24, 0.24, 0.02, [251, 191, 36], { spec: 0.55 });
    m.addBox(0, 0.10, 0.4575, 0.21, 0.21, 0.0875, [255, 252, 245], { spec: 0.38 });

    // Shimmering cyan glass cupola biodome & gleaming golden finial spire
    m.addDome(0, 0.10, 0.545, 0.21, 0.21, 0.21, 3, 8, [56, 189, 248], {
      spec: 0.65,
      emissive: 0.28,
      stroke: "rgba(254, 240, 138, 0.65)",
      lineWidth: Math.max(0.6, pxScale * 0.015)
    });
    m.addPrism(0, 0.10, 0.75, 0.87, 0.038, 0.008, 6, 0, [251, 191, 36], { emissive: 0.72 });

    // Warm golden glowing panoramic windows & grand entrance mounted flush outside walls
    const winGlow = 0.68 + 0.12 * Math.sin(time * 0.002 + phase);
    m.addBox(0, -0.122, 0.23, 0.065, 0.011, 0.085, [251, 191, 36], { emissive: 0.75 });
    m.addBox(-0.105, -0.122, 0.45, 0.038, 0.011, 0.042, [253, 224, 71], { emissive: winGlow });
    m.addBox(0, -0.122, 0.45, 0.038, 0.011, 0.042, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.105, -0.122, 0.45, 0.038, 0.011, 0.042, [253, 224, 71], { emissive: winGlow });
    m.addBox(0, 0.322, 0.24, 0.09, 0.011, 0.052, [253, 224, 71], { emissive: winGlow });
    m.addBox(0, 0.322, 0.45, 0.11, 0.011, 0.042, [253, 224, 71], { emissive: winGlow });

    m.addBox(-0.31, -0.172, 0.245, 0.065, 0.011, 0.05, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.31, -0.172, 0.245, 0.065, 0.011, 0.05, [253, 224, 71], { emissive: winGlow });
    m.addBox(-0.472, 0.04, 0.245, 0.011, 0.075, 0.05, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.472, 0.04, 0.245, 0.011, 0.075, 0.05, [253, 224, 71], { emissive: winGlow });
  }

  function buildWindmillModel(m, time, phase, pxScale) {
    // Octagonal turbine base
    m.addPrism(0, 0, 0.0, 0.09, 0.44, 0.36, 8, Math.PI / 8, [100, 116, 139], { spec: 0.25 });
    m.addPrism(0, 0, 0.09, 0.12, 0.24, 0.18, 8, 0, [56, 189, 248], { emissive: 0.35 });

    // Tall tapered white pylon tower
    m.addPrism(0, 0, 0.12, 0.86, 0.11, 0.055, 8, 0, [241, 245, 249], { spec: 0.40 });

    // Nacelle housing + cyan tail fin flush behind nacelle
    m.addBox(0, 0.02, 0.87, 0.075, 0.15, 0.07, [226, 232, 240], { spec: 0.40 });
    m.addQuad([0, 0.17, 0.87], [0, 0.27, 0.89], [0, 0.28, 1.00], [0, 0.17, 0.94], [56, 189, 248], {
      doubleSided: true,
      emissive: 0.32
    });

    // Rotor hub cone in front of nacelle + blades clearing hub radius cleanly
    const hy = -0.178;
    const hz = 0.87;
    m.addBox(0, hy, hz, 0.048, 0.046, 0.048, [56, 189, 248], { emissive: 0.45, spec: 0.6 });

    // 3 spinning aerodynamic rotor blades
    const spin = time * 0.0032 + phase;
    const bladeLen = 0.56;
    const bladeY = hy - 0.01;
    for (let k = 0; k < 3; k++) {
      const a = spin + (Math.PI * 2 * k) / 3;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const px = -sa;
      const pz = ca;

      const rootW = 0.055;
      const tipW = 0.018;
      const rootR = 0.072;
      const tipX = ca * bladeLen;
      const tipZ = hz + sa * bladeLen;

      m.addQuad(
        [ca * rootR - px * rootW, bladeY, hz + sa * rootR - pz * rootW],
        [ca * rootR + px * rootW, bladeY, hz + sa * rootR + pz * rootW],
        [tipX + px * tipW, bladeY - 0.01, tipZ + pz * tipW],
        [tipX - px * tipW, bladeY - 0.01, tipZ - pz * tipW],
        [248, 250, 252],
        { doubleSided: true, spec: 0.55 }
      );
      m.addLine(
        [tipX * 0.72, bladeY - 0.012, hz + sa * bladeLen * 0.72],
        [tipX, bladeY - 0.014, tipZ],
        "#38bdf8",
        Math.max(1.2, pxScale * 0.035)
      );
    }
  }

  function buildSolarPanelModel(m, time, phase, pxScale) {
    // Dark slate base + central power hub
    m.addPrism(0, 0, 0.0, 0.07, 0.54, 0.48, 6, 0, [71, 85, 105], { spec: 0.25 });
    m.addBox(0, 0, 0.13, 0.14, 0.13, 0.07, [100, 116, 139], { spec: 0.3 });

    const corePulse = 0.50 + 0.35 * Math.sin(time * 0.004 + phase);
    m.addPrism(0, 0, 0.20, 0.25, 0.08, 0.05, 6, 0, [251, 191, 36], { emissive: corePulse });

    // Twin gimbal support masts terminating below panel frame
    const postLW = Math.max(1.4, pxScale * 0.05);
    m.addLine([-0.30, 0, 0.06], [-0.30, 0, 0.32], "#cbd5e1", postLW);
    m.addLine([0.30, 0, 0.06], [0.30, 0, 0.32], "#cbd5e1", postLW);

    // Two wide tilted cobalt photovoltaic wings catching specular sunlight
    const wings = [-0.31, 0.31];
    const gridStroke = "rgba(186, 230, 253, 0.78)";
    const gridLW = Math.max(0.7, pxScale * 0.018);

    const hw = 0.21;
    const hd = 0.26;
    const zLow = 0.24;
    const zHigh = 0.46;
    const dz = zHigh - zLow;
    const dy = hd * 2;
    const nLen = Math.hypot(dz, dy);
    const nY = -dz / nLen;
    const nZ = dy / nLen;
    const offY = nY * 0.012;
    const offZ = nZ * 0.012;
    const lineOffY = nY * 0.016;
    const lineOffZ = nZ * 0.016;

    for (let w = 0; w < wings.length; w++) {
      const wx = wings[w];

      // Metallic rim frame backing (double-sided for clean rear view)
      m.addQuad(
        [wx - hw - 0.02, -hd - 0.02, zLow],
        [wx + hw + 0.02, -hd - 0.02, zLow],
        [wx + hw + 0.02, hd + 0.02, zHigh],
        [wx - hw - 0.02, hd + 0.02, zHigh],
        [203, 213, 225],
        { doubleSided: true, spec: 0.45 }
      );

      // Single-sided deep cobalt photovoltaic surface offset strictly along panel normal
      m.addQuad(
        [wx - hw, -hd + offY, zLow + offZ],
        [wx + hw, -hd + offY, zLow + offZ],
        [wx + hw, hd + offY, zHigh + offZ],
        [wx - hw, hd + offY, zHigh + offZ],
        [29, 78, 216],
        { outwardNormal: [0, nY, nZ], spec: 0.90, emissive: 0.14 }
      );

      // Crisp photovoltaic cell grid lines offset strictly proud of cells
      m.addLine([wx, -hd + lineOffY, zLow + lineOffZ], [wx, hd + lineOffY, zHigh + lineOffZ], gridStroke, gridLW);
      m.addLine(
        [wx - hw, lineOffY, (zLow + zHigh) * 0.5 + lineOffZ],
        [wx + hw, lineOffY, (zLow + zHigh) * 0.5 + lineOffZ],
        gridStroke,
        gridLW
      );
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
      const dz = p.zHigh - p.zLow;
      const dy = hd * 2;
      const nLen = Math.hypot(dz, dy);
      const nY = -dz / nLen;
      const nZ = dy / nLen;
      const offY = nY * 0.012;
      const offZ = nZ * 0.012;
      const lineOffY = nY * 0.016;
      const lineOffZ = nZ * 0.016;

      m.addLine([p.wx, p.wy, 0.09], [p.wx, p.wy, zMid - 0.02], "#cbd5e1", postLW);

      // Warm silver-gold trim frame
      m.addQuad(
        [p.wx - hw - 0.02, p.wy - hd - 0.02, p.zLow],
        [p.wx + hw + 0.02, p.wy - hd - 0.02, p.zLow],
        [p.wx + hw + 0.02, p.wy + hd + 0.02, p.zHigh],
        [p.wx - hw - 0.02, p.wy + hd + 0.02, p.zHigh],
        i >= 2 ? [251, 191, 36] : [226, 232, 240],
        { doubleSided: true, spec: 0.50 }
      );

      // Single-sided deep cobalt photovoltaic wing
      m.addQuad(
        [p.wx - hw, p.wy - hd + offY, p.zLow + offZ],
        [p.wx + hw, p.wy - hd + offY, p.zLow + offZ],
        [p.wx + hw, p.wy + hd + offY, p.zHigh + offZ],
        [p.wx - hw, p.wy + hd + offY, p.zHigh + offZ],
        [29, 78, 216],
        { outwardNormal: [0, nY, nZ], spec: 0.92, emissive: 0.16 }
      );

      m.addLine(
        [p.wx, p.wy - hd + lineOffY, p.zLow + lineOffZ],
        [p.wx, p.wy + hd + lineOffY, p.zHigh + lineOffZ],
        gridStroke,
        gridLW
      );
      m.addLine(
        [p.wx - hw, p.wy + lineOffY, zMid + lineOffZ],
        [p.wx + hw, p.wy + lineOffY, zMid + lineOffZ],
        gridStroke,
        gridLW
      );
    }
  }

  function buildStarlightMonumentModel(m, time, phase, pxScale) {
    // Stepped marble hex base & golden collar
    m.addPrism(0, 0, 0.0, 0.08, 0.62, 0.56, 6, 0, [226, 232, 240], { spec: 0.30 });
    m.addPrism(0, 0, 0.08, 0.13, 0.44, 0.40, 6, 0, [251, 191, 36], { spec: 0.52 });

    // 4 corner lantern bollards cleanly on base terrace
    const corners = [
      [-0.36, -0.30],
      [0.36, -0.30],
      [-0.36, 0.30],
      [0.36, 0.30]
    ];
    for (let i = 0; i < corners.length; i++) {
      m.addPrism(corners[i][0], corners[i][1], 0.08, 0.21, 0.045, 0.038, 6, 0, [148, 163, 184], { spec: 0.3 });
      m.addPrism(corners[i][0], corners[i][1], 0.21, 0.26, 0.042, 0.02, 6, 0, [253, 224, 71], { emissive: 0.72 });
    }

    // Faceted white/lavender obelisk spire
    m.addPrism(0, 0, 0.13, 0.64, 0.19, 0.09, 4, Math.PI / 4, [248, 250, 252], { spec: 0.42 });
    m.addPrism(0, 0, 0.64, 0.72, 0.11, 0.04, 4, Math.PI / 4, [251, 191, 36], { spec: 0.55 });

    // Levitating glowing magenta-gold octahedral starlight crystal above spire tip
    const bobZ = 0.85 + 0.035 * Math.sin(time * 0.003 + phase);
    const spin = time * 0.0018 + phase;
    const glow = 0.65 + 0.30 * Math.sin(time * 0.004 + phase);
    m.addPrism(0, 0, bobZ - 0.075, bobZ, 0.015, 0.085, 4, spin, [236, 72, 153], { emissive: glow, spec: 0.75 });
    m.addPrism(0, 0, bobZ, bobZ + 0.075, 0.085, 0.015, 4, spin, [244, 114, 182], { emissive: glow, spec: 0.75 });
  }

  function buildHelioMirrorModel(m, time, phase, pxScale) {
    // Hexagonal plaza base + golden compass collar
    m.addPrism(0, 0, 0.0, 0.075, 0.64, 0.58, 6, 0, [71, 85, 105], { spec: 0.26 });
    m.addPrism(0, 0, 0.075, 0.115, 0.48, 0.44, 6, 0, [251, 191, 36], { spec: 0.50 });

    // Gimbal collar, central support mast & anchor struts connecting base to tilted mirror underside
    m.addPrism(0, 0.04, 0.115, 0.24, 0.13, 0.095, 6, 0, [148, 163, 184], { spec: 0.35 });
    m.addPrism(0, 0.05, 0.24, 0.40, 0.075, 0.062, 6, 0, [203, 213, 225], { spec: 0.42 });
    m.addPrism(0, 0.06, 0.40, 0.45, 0.072, 0.055, 6, 0, [245, 158, 11], { spec: 0.52 });
    const postLW = Math.max(1.5, pxScale * 0.048);
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 + 0.35;
      m.addLine(
        [Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0.115],
        [Math.cos(a) * 0.095, 0.04 + Math.sin(a) * 0.095, 0.235],
        "#e2e8f0",
        postLW
      );
    }
    const braceLW = Math.max(1.4, pxScale * 0.042);
    m.addLine([-0.18, 0.16, 0.115], [-0.22, 0.20, 0.56], "#cbd5e1", braceLW);
    m.addLine([0.18, 0.16, 0.115], [0.22, 0.20, 0.56], "#cbd5e1", braceLW);
    m.addLine([-0.05, 0.05, 0.38], [-0.22, -0.14, 0.35], "#cbd5e1", braceLW);
    m.addLine([0.05, 0.05, 0.38], [0.22, -0.14, 0.35], "#cbd5e1", braceLW);

    // Tilted parabolic concentrator mirror dish (gold backing + cobalt/cyan reflector face)
    const hw = 0.38;
    const hd = 0.32;
    const zLow = 0.25;
    const zHigh = 0.65;
    const dz = zHigh - zLow;
    const dy = hd * 2;
    const nLen = Math.hypot(dz, dy);
    const nY = -dz / nLen;
    const nZ = dy / nLen;
    const offY = nY * 0.014;
    const offZ = nZ * 0.014;
    const lineOffY = nY * 0.018;
    const lineOffZ = nZ * 0.018;

    m.addQuad(
      [-hw, -hd, zLow],
      [hw, -hd, zLow],
      [hw, hd, zHigh],
      [-hw, hd, zHigh],
      [251, 191, 36],
      { doubleSided: true, spec: 0.55 }
    );
    m.addQuad(
      [-hw * 0.88, -hd * 0.88 + offY, zLow + 0.02 + offZ],
      [hw * 0.88, -hd * 0.88 + offY, zLow + 0.02 + offZ],
      [hw * 0.88, hd * 0.88 + offY, zHigh - 0.02 + offZ],
      [-hw * 0.88, hd * 0.88 + offY, zHigh - 0.02 + offZ],
      [56, 189, 248],
      { outwardNormal: [0, nY, nZ], spec: 0.95, emissive: 0.28 }
    );
    const gridLW = Math.max(0.8, pxScale * 0.018);
    m.addLine([0, -hd * 0.88 + lineOffY, zLow + 0.02 + lineOffZ], [0, hd * 0.88 + lineOffY, zHigh - 0.02 + lineOffZ], "#e0f2fe", gridLW);
    m.addLine([-hw * 0.88, lineOffY, (zLow + zHigh) * 0.5 + lineOffZ], [hw * 0.88, lineOffY, (zLow + zHigh) * 0.5 + lineOffZ], "#e0f2fe", gridLW);

    // Pulsing sun-focal orb held above the mirror dish
    const focalPulse = 0.65 + 0.30 * Math.sin(time * 0.005 + phase);
    const fx = 0;
    const fy = nY * 0.28;
    const fz = (zLow + zHigh) * 0.5 + nZ * 0.28;
    m.addLine([0, offY, (zLow + zHigh) * 0.5 + offZ], [fx, fy, fz], "#fde047", Math.max(1.2, pxScale * 0.032));
    m.addPrism(fx, fy, fz - 0.06, fz + 0.06, 0.065, 0.065, 6, 0, [253, 224, 71], { emissive: focalPulse, spec: 0.7 });
  }

  function buildBotanicalGardenModel(m, time, phase, pxScale) {
    // Cream stone curb + lush emerald park terrace
    m.addPrism(0, 0, 0.0, 0.06, 0.68, 0.65, 8, Math.PI / 8, [241, 245, 249], { spec: 0.24 });
    m.addPrism(0, 0, 0.06, 0.095, 0.62, 0.60, 8, Math.PI / 8, [34, 197, 94], { spec: 0.12 });

    // Central marble fountain basin + sparkling cyan water + jet plume
    m.addPrism(0, 0, 0.095, 0.155, 0.24, 0.22, 8, Math.PI / 8, [248, 250, 252], { spec: 0.35 });
    m.addPrism(0, 0, 0.155, 0.17, 0.18, 0.18, 8, Math.PI / 8, [56, 189, 248], { emissive: 0.45, spec: 0.8 });
    m.addPrism(0, 0, 0.17, 0.32, 0.055, 0.035, 6, 0, [226, 232, 240], { spec: 0.35 });
    const jetH = 0.38 + 0.04 * Math.sin(time * 0.006 + phase);
    m.addPrism(0, 0, 0.32, jetH, 0.025, 0.075, 6, 0, [186, 230, 253], { emissive: 0.7 });

    // 4 non-intersecting trees (2 emerald, 2 cherry blossom)
    const trees = [
      { x: -0.36, y: -0.22, col: [22, 163, 74], h: 0.46 },
      { x: 0.36, y: -0.22, col: [244, 114, 182], h: 0.44 },
      { x: -0.32, y: 0.28, col: [244, 114, 182], h: 0.42 },
      { x: 0.32, y: 0.28, col: [22, 163, 74], h: 0.48 }
    ];
    for (let i = 0; i < trees.length; i++) {
      const tr = trees[i];
      m.addPrism(tr.x, tr.y, 0.095, 0.22, 0.032, 0.024, 6, 0, [146, 64, 14], { spec: 0.1 });
      m.addDome(tr.x, tr.y, 0.22, 0.125, 0.125, tr.h - 0.22, 2, 6, tr.col, { spec: 0.14 });
    }
  }

  function buildBuildersPlazaModel(m, time, phase, pxScale) {
    // Stepped slate & amber guild plinth
    m.addPrism(0, 0, 0.0, 0.08, 0.66, 0.60, 6, 0, [100, 116, 139], { spec: 0.28 });
    m.addPrism(0, 0, 0.08, 0.125, 0.54, 0.50, 6, 0, [251, 191, 36], { spec: 0.50 });

    // Twin steel-blue arch pillars + golden top lintel beam cleanly above hologram cube
    m.addBox(-0.28, 0, 0.335, 0.085, 0.11, 0.21, [59, 130, 246], { spec: 0.36 });
    m.addBox(0.28, 0, 0.335, 0.085, 0.11, 0.21, [59, 130, 246], { spec: 0.36 });
    m.addBox(0, 0, 0.59, 0.39, 0.13, 0.045, [251, 191, 36], { spec: 0.52 });
    m.addBox(0, 0, 0.655, 0.24, 0.08, 0.02, [248, 250, 252], { spec: 0.4 });

    // Rotating cyan holographic blueprint cube floating cleanly in the arch center
    const spin = time * 0.002 + phase;
    const hoverZ = 0.27 + 0.02 * Math.sin(time * 0.0035 + phase);
    m.addPrism(0, 0, hoverZ, hoverZ + 0.17, 0.12, 0.12, 4, spin, [56, 189, 248], {
      emissive: 0.65,
      spec: 0.75,
      stroke: "rgba(224, 242, 254, 0.85)",
      lineWidth: Math.max(0.8, pxScale * 0.018)
    });
  }

  function buildSolarCabinModel(m, time, phase, pxScale) {
    // Stone pad & front emerald planter strip
    m.addPrism(0, 0, 0.0, 0.07, 0.60, 0.56, 6, 0, [100, 116, 139], { spec: 0.22 });
    m.addBox(0, -0.30, 0.095, 0.24, 0.06, 0.025, [34, 197, 94], { spec: 0.12 });

    // Cream & teal cabin body
    m.addBox(0, 0.02, 0.20, 0.28, 0.22, 0.13, [255, 247, 234], { spec: 0.28 });
    // Pitched teal roof
    m.addPrism(0, 0.02, 0.33, 0.48, 0.39, 0.06, 4, Math.PI / 4, [20, 184, 166], { spec: 0.32 });

    // Tilted cobalt rooftop solar panel mounted cleanly above roof slope
    m.addQuad([-0.20, -0.14, 0.41], [0.20, -0.14, 0.41], [0.20, 0.14, 0.53], [-0.20, 0.14, 0.53], [37, 99, 235], {
      doubleSided: true,
      spec: 0.90,
      emissive: 0.18
    });
    const gridLW = Math.max(0.7, pxScale * 0.016);
    m.addLine([0, -0.14, 0.414], [0, 0.14, 0.534], "#bae6fd", gridLW);
    m.addLine([-0.20, 0, 0.474], [0.20, 0, 0.474], "#bae6fd", gridLW);

    // Flush outward warm doorway & windows
    const winGlow = 0.65 + 0.15 * Math.sin(time * 0.0025 + phase);
    m.addBox(0, -0.212, 0.16, 0.065, 0.012, 0.08, [255, 138, 61], { spec: 0.3 });
    m.addBox(-0.16, -0.212, 0.21, 0.055, 0.012, 0.045, [253, 224, 71], { emissive: winGlow });
    m.addBox(0.16, -0.212, 0.21, 0.055, 0.012, 0.045, [253, 224, 71], { emissive: winGlow });
  }

  function buildEcoDomeModel(m, time, phase, pxScale) {
    // Hexagonal silver & emerald terrace
    m.addPrism(0, 0, 0.0, 0.075, 0.66, 0.62, 6, 0, [203, 213, 225], { spec: 0.28 });
    m.addPrism(0, 0, 0.075, 0.105, 0.58, 0.56, 6, 0, [34, 197, 94], { spec: 0.14 });

    // Luminous sky-cyan geodesic biodome cupola
    m.addDome(0, 0, 0.105, 0.34, 0.34, 0.34, 3, 8, [95, 216, 248], {
      spec: 0.72,
      emissive: 0.28,
      stroke: "rgba(255, 255, 255, 0.55)",
      lineWidth: Math.max(0.7, pxScale * 0.016)
    });
    // Top golden beacon spire
    m.addPrism(0, 0, 0.445, 0.54, 0.04, 0.012, 6, 0, [251, 191, 36], { emissive: 0.68 });

    // 3 external angled cobalt solar collector wings cleanly outside the dome radius
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 + 0.52;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const px = -sa;
      const py = ca;
      const rIn = 0.38;
      const rOut = 0.60;
      const hw = 0.11;
      m.addQuad(
        [ca * rIn - px * hw, sa * rIn - py * hw, 0.24],
        [ca * rIn + px * hw, sa * rIn + py * hw, 0.24],
        [ca * rOut + px * hw, sa * rOut + py * hw, 0.13],
        [ca * rOut - px * hw, sa * rOut - py * hw, 0.13],
        [37, 99, 235],
        { doubleSided: true, spec: 0.88, emissive: 0.16 }
      );
    }
  }

  function buildEcoArcologyModel(m, time, phase, pxScale) {
    // Octagonal terrace & emerald plinth
    m.addPrism(0, 0, 0.0, 0.08, 0.68, 0.64, 8, Math.PI / 8, [226, 232, 240], { spec: 0.30 });
    m.addPrism(0, 0, 0.08, 0.115, 0.60, 0.58, 8, Math.PI / 8, [16, 185, 129], { spec: 0.14 });

    // Cleanly stacked 3-tier tower separated by emerald sky-garden rings (zero intersection)
    m.addPrism(0, 0, 0.115, 0.33, 0.34, 0.32, 6, 0, [255, 252, 245], { spec: 0.36 });
    m.addPrism(0, 0, 0.33, 0.37, 0.39, 0.38, 6, 0, [34, 197, 94], { spec: 0.16 });
    m.addPrism(0, 0, 0.37, 0.57, 0.26, 0.24, 6, 0, [255, 252, 245], { spec: 0.36 });
    m.addPrism(0, 0, 0.57, 0.605, 0.30, 0.29, 6, 0, [34, 197, 94], { spec: 0.16 });

    // Cyan biodome crown + golden finial
    m.addDome(0, 0, 0.605, 0.22, 0.22, 0.20, 3, 8, [95, 216, 248], {
      spec: 0.72,
      emissive: 0.32,
      stroke: "rgba(254, 240, 138, 0.65)",
      lineWidth: Math.max(0.6, pxScale * 0.015)
    });
    m.addPrism(0, 0, 0.805, 0.90, 0.032, 0.008, 6, 0, [251, 191, 36], { emissive: 0.75 });

    // 3 external vertical cobalt solar wing sails mounted outside the hull
    const sailLW = Math.max(1.2, pxScale * 0.035);
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 + 0.52;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const px = -sa;
      const py = ca;
      const rSail = 0.44;
      const hw = 0.12;
      m.addLine([ca * 0.28, sa * 0.28, 0.24], [ca * rSail, sa * rSail, 0.24], "#fbbf24", sailLW);
      m.addLine([ca * 0.23, sa * 0.23, 0.50], [ca * rSail, sa * rSail, 0.50], "#fbbf24", sailLW);
      m.addQuad(
        [ca * rSail - px * hw, sa * rSail - py * hw, 0.14],
        [ca * rSail + px * hw, sa * rSail + py * hw, 0.14],
        [ca * rSail + px * hw, sa * rSail + py * hw, 0.56],
        [ca * rSail - px * hw, sa * rSail - py * hw, 0.56],
        [37, 99, 235],
        { doubleSided: true, spec: 0.90, emissive: 0.20 }
      );
    }

    // Warm glowing front window accents
    const winGlow = 0.68 + 0.14 * Math.sin(time * 0.002 + phase);
    m.addBox(0, -0.312, 0.22, 0.08, 0.012, 0.075, [253, 224, 71], { emissive: winGlow });
    m.addBox(0, -0.235, 0.47, 0.07, 0.012, 0.06, [253, 224, 71], { emissive: winGlow });
  }

  function buildGeoTerraformerModel(m, time, phase, pxScale, opts) {
    const isUsed = Boolean(opts && opts.used);
    if (isUsed) {
      // Spent / burnt-out Geo-Terraformer husk
      m.addPrism(0, 0, 0.0, 0.08, 0.64, 0.58, 6, 0, [51, 65, 85], { spec: 0.12 });
      m.addPrism(0, 0, 0.08, 0.12, 0.46, 0.42, 6, 0, [71, 85, 105], { spec: 0.14 });

      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 * i) / 3 + 0.35;
        const bx = Math.cos(a) * 0.36;
        const by = Math.sin(a) * 0.36;
        const tx = Math.cos(a) * 0.22;
        const ty = Math.sin(a) * 0.22;
        m.addLine([bx, by, 0.10], [tx, ty, 0.46], "#64748b", Math.max(2.0, pxScale * 0.075));
        m.addPrism(tx, ty, 0.46, 0.51, 0.045, 0.03, 6, 0, [120, 113, 108], { spec: 0.15 });
      }

      // Dead matte-charcoal core with slow dim amber-red warning blink
      const warnBlink = 0.15 + 0.35 * Math.max(0, Math.sin(time * 0.003 + phase));
      m.addPrism(0, 0, 0.26, 0.44, 0.12, 0.12, 6, 0, [30, 41, 59], { spec: 0.08 });
      m.addBox(0, -0.11, 0.35, 0.035, 0.015, 0.035, [239, 68, 68], { emissive: warnBlink });
      return;
    }

    // Active Geo-Terraformer: teal-and-white seismic rig framing a glowing emerald-cyan core
    m.addPrism(0, 0, 0.0, 0.08, 0.64, 0.58, 6, 0, [71, 85, 105], { spec: 0.28 });
    m.addPrism(0, 0, 0.08, 0.12, 0.48, 0.44, 6, 0, [20, 184, 166], { emissive: 0.25, spec: 0.4 });

    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 + 0.35;
      const bx = Math.cos(a) * 0.38;
      const by = Math.sin(a) * 0.38;
      const tx = Math.cos(a) * 0.20;
      const ty = Math.sin(a) * 0.20;
      m.addLine([bx, by, 0.10], [tx, ty, 0.54], "#f8fafc", Math.max(2.2, pxScale * 0.08));
      m.addPrism(tx, ty, 0.54, 0.60, 0.048, 0.025, 6, 0, [45, 212, 191], { emissive: 0.65 });
    }

    // Levitating pulsing emerald-cyan terraforming energy core
    const spin = time * 0.0024 + phase;
    const pulse = 0.65 + 0.30 * Math.sin(time * 0.005 + phase);
    const coreZ = 0.38 + 0.025 * Math.sin(time * 0.004 + phase);
    m.addPrism(0, 0, coreZ - 0.11, coreZ, 0.02, 0.13, 6, spin, [45, 212, 191], { emissive: pulse, spec: 0.8 });
    m.addPrism(0, 0, coreZ, coreZ + 0.11, 0.13, 0.02, 6, spin, [167, 243, 208], { emissive: pulse, spec: 0.8 });
    // Downward energy beam into ground emitter ring
    m.addPrism(0, 0, 0.12, 0.24, 0.08, 0.04, 6, 0, [95, 216, 248], { emissive: 0.72 });
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
      const mDz = zOut - zIn;
      const mDr = hd * 2;
      const mLen = Math.hypot(mDz, mDr);
      const mOutR = -mDz / mLen;
      const mOutZ = mDr / mLen;
      const offX = ca * mOutR * 0.012;
      const offY = sa * mOutR * 0.012;
      const offZ = mOutZ * 0.012;

      // Silver backing frame
      m.addQuad(
        [mx - outX - tx * (hw + 0.015), my - outY - ty * (hw + 0.015), zIn],
        [mx - outX + tx * (hw + 0.015), my - outY + ty * (hw + 0.015), zIn],
        [mx + outX + tx * (hw + 0.015), my + outY + ty * (hw + 0.015), zOut],
        [mx + outX - tx * (hw + 0.015), my + outY - ty * (hw + 0.015), zOut],
        [203, 213, 225],
        { doubleSided: true, spec: 0.45 }
      );

      // Single-sided reflective cobalt-cyan mirror surface
      m.addQuad(
        [mx - outX - tx * hw + offX, my - outY - ty * hw + offY, zIn + offZ],
        [mx - outX + tx * hw + offX, my - outY + ty * hw + offY, zIn + offZ],
        [mx + outX + tx * hw + offX, my + outY + ty * hw + offY, zOut + offZ],
        [mx + outX - tx * hw + offX, my + outY - ty * hw + offY, zOut + offZ],
        [37, 99, 235],
        { outwardNormal: [ca * mOutR, sa * mOutR, mOutZ], spec: 0.92, emissive: 0.20 }
      );
    }

    // Tall tapered central titanium receiver spire split cleanly around its two structural collars
    m.addPrism(0, 0, 0.11, 0.30, 0.16, 0.137, 8, 0, [241, 245, 249], { spec: 0.40 });
    m.addPrism(0, 0, 0.30, 0.34, 0.155, 0.148, 8, 0, [100, 116, 139], { spec: 0.32 });
    m.addPrism(0, 0, 0.34, 0.50, 0.132, 0.112, 8, 0, [241, 245, 249], { spec: 0.40 });
    m.addPrism(0, 0, 0.50, 0.54, 0.132, 0.125, 8, 0, [100, 116, 139], { spec: 0.32 });
    m.addPrism(0, 0, 0.54, 0.64, 0.107, 0.095, 8, 0, [241, 245, 249], { spec: 0.40 });

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
    m.addBox(0.28, 0.14, 0.265, 0.06, 0.055, 0.025, [251, 191, 36], { emissive: cellPulse });

    // Tall sleek tapered aero-tower split cleanly around two glowing cyan collar rings
    m.addPrism(0, 0, 0.13, 0.40, 0.135, 0.113, 8, 0, [241, 245, 249], { spec: 0.44 });
    m.addPrism(0, 0, 0.40, 0.44, 0.128, 0.122, 8, 0, [56, 189, 248], { emissive: 0.52 });
    m.addPrism(0, 0, 0.44, 0.70, 0.110, 0.089, 8, 0, [241, 245, 249], { spec: 0.44 });
    m.addPrism(0, 0, 0.70, 0.735, 0.102, 0.096, 8, 0, [56, 189, 248], { emissive: 0.52 });
    m.addPrism(0, 0, 0.735, 0.96, 0.086, 0.068, 8, 0, [241, 245, 249], { spec: 0.44 });

    // Futuristic nacelle + dual cyan tail fins flush behind nacelle
    m.addBox(0, 0.02, 0.97, 0.09, 0.18, 0.08, [226, 232, 240], { spec: 0.42 });
    m.addQuad([-0.03, 0.20, 0.97], [-0.03, 0.30, 0.99], [-0.03, 0.31, 1.12], [-0.03, 0.20, 1.05], [56, 189, 248], {
      doubleSided: true,
      emissive: 0.38
    });
    m.addQuad([0.03, 0.20, 0.97], [0.03, 0.30, 0.99], [0.03, 0.31, 1.12], [0.03, 0.20, 1.05], [56, 189, 248], {
      doubleSided: true,
      emissive: 0.38
    });

    // Glowing golden-cyan spinner cone + blades clearing spinner bounds cleanly
    const hy = -0.21;
    const hz = 0.97;
    m.addBox(0, hy, hz, 0.055, 0.05, 0.055, [251, 191, 36], { emissive: 0.55, spec: 0.65 });

    // 3 longer, faster aerodynamic rotor blades with bright cyan & gold energized tips
    const spin = time * 0.0044 + phase;
    const bladeLen = 0.66;
    const bladeY = hy - 0.01;
    for (let k = 0; k < 3; k++) {
      const a = spin + (Math.PI * 2 * k) / 3;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const px = -sa;
      const pz = ca;

      const rootW = 0.062;
      const tipW = 0.020;
      const rootR = 0.082;
      const tipX = ca * bladeLen;
      const tipZ = hz + sa * bladeLen;

      m.addQuad(
        [ca * rootR - px * rootW, bladeY, hz + sa * rootR - pz * rootW],
        [ca * rootR + px * rootW, bladeY, hz + sa * rootR + pz * rootW],
        [tipX + px * tipW, bladeY - 0.01, tipZ + pz * tipW],
        [tipX - px * tipW, bladeY - 0.01, tipZ - pz * tipW],
        [248, 250, 252],
        { doubleSided: true, spec: 0.58 }
      );
      m.addLine(
        [tipX * 0.65, bladeY - 0.012, hz + sa * bladeLen * 0.65],
        [tipX * 0.88, bladeY - 0.014, hz + sa * bladeLen * 0.88],
        "#38bdf8",
        Math.max(1.3, pxScale * 0.038)
      );
      m.addLine(
        [tipX * 0.88, bladeY - 0.014, hz + sa * bladeLen * 0.88],
        [tipX, bladeY - 0.015, tipZ],
        "#ffc83a",
        Math.max(1.3, pxScale * 0.040)
      );
    }
  }

  function buildWindFarmModel(m, time, phase, pxScale) {
    // Grand hexagonal aero-platform + glowing cyan energy ring + central substation block
    m.addPrism(0, 0, 0.0, 0.09, 0.70, 0.66, 6, 0, [71, 85, 105], { spec: 0.26 });
    m.addPrism(0, 0, 0.09, 0.115, 0.63, 0.61, 6, 0, [56, 189, 248], { emissive: 0.44 });
    m.addBox(0, -0.02, 0.165, 0.11, 0.09, 0.05, [203, 213, 225], { spec: 0.35 });
    const subGlow = 0.58 + 0.30 * Math.sin(time * 0.005 + phase);
    m.addPrism(0, -0.02, 0.215, 0.26, 0.05, 0.025, 6, 0, [251, 191, 36], { emissive: subGlow });

    function addMiniTurbine(ox, oy, zBase, topZ, rBot, rTop, bladeLen, spin) {
      m.addPrism(ox, oy, zBase, topZ, rBot, rTop, 6, 0, [241, 245, 249], { spec: 0.42 });
      m.addBox(ox, oy + 0.015, topZ + 0.01, rTop * 1.15, rTop * 2.1, rTop * 1.05, [226, 232, 240], { spec: 0.40 });
      const hy = oy - rTop * 2.65;
      const hz = topZ + 0.01;
      m.addBox(ox, hy, hz, rTop * 0.75, rTop * 0.65, rTop * 0.75, [56, 189, 248], { emissive: 0.50 });
      const bladeY = hy - 0.006;
      const rootR = rTop * 1.15;

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
          [ox + ca * rootR - px * rootW, bladeY, hz + sa * rootR - pz * rootW],
          [ox + ca * rootR + px * rootW, bladeY, hz + sa * rootR + pz * rootW],
          [tipX + px * tipW, bladeY - 0.008, tipZ + pz * tipW],
          [tipX - px * tipW, bladeY - 0.008, tipZ - pz * tipW],
          [248, 250, 252],
          { doubleSided: true, spec: 0.56 }
        );
        m.addLine(
          [ox + ca * bladeLen * 0.70, bladeY - 0.010, hz + sa * bladeLen * 0.70],
          [tipX, bladeY - 0.011, tipZ],
          "#38bdf8",
          Math.max(1.0, pxScale * 0.028)
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
    function xAt(dx) {
      return jx + dx * sz;
    }
    function yAt(dy) {
      return dy * sz;
    }
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.105 * sz, 0.55 * sz, thrust);

    m.addPrism(jx, 0, zAt(0.0), zAt(0.075), 0.11 * sz, 0.075 * sz, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addBox(xAt(-0.174), 0, zAt(0.125), 0.044 * sz, 0.030 * sz, 0.075 * sz, [16, 185, 129], { spec: 0.30 });
    m.addBox(xAt(0.174), 0, zAt(0.125), 0.044 * sz, 0.030 * sz, 0.075 * sz, [16, 185, 129], { spec: 0.30 });
    m.addBox(jx, yAt(-0.174), zAt(0.125), 0.030 * sz, 0.044 * sz, 0.075 * sz, [5, 150, 105], { spec: 0.30 });
    m.addBox(jx, yAt(0.174), zAt(0.125), 0.030 * sz, 0.044 * sz, 0.075 * sz, [5, 150, 105], { spec: 0.30 });
    m.addPrism(jx, 0, zAt(0.075), zAt(0.555), 0.125 * sz, 0.115 * sz, 10, 0, [248, 250, 252], { spec: 0.48 });
    m.addPrism(jx, 0, zAt(0.555), zAt(0.755), 0.115 * sz, 0.015 * sz, 10, 0, [255, 177, 41], { spec: 0.45 });
    m.addBox(jx, yAt(-0.138), zAt(0.355), 0.05 * sz, 0.012 * sz, 0.05 * sz, [255, 216, 77], { emissive: 0.55 });
  }

  function buildTradeRocket2Vessel3D(m, time, phase, pxScale, opts) {
    const o = opts || {};
    const z0 = o.zOffset !== undefined ? o.zOffset : 0.135;
    const sz = o.vesselScale !== undefined ? clamp01(o.vesselScale) : 1;
    if (sz <= 0.02) return;
    const jx = o.jx || 0;
    const thrust = o.thrust || 0;
    const glow = o.preLaunchGlow !== undefined ? o.preLaunchGlow : 0.25;
    function xAt(dx) {
      return jx + dx * sz;
    }
    function yAt(dy) {
      return dy * sz;
    }
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase + 0.6, xAt(-0.212), 0, z0, 0.062 * sz, 0.42 * sz, thrust);
    buildRocketExhaust3D(m, time, phase + 1.2, xAt(0.212), 0, z0, 0.062 * sz, 0.42 * sz, thrust);
    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.105 * sz, 0.60 * sz, thrust);

    m.addPrism(xAt(-0.212), 0, zAt(0.0), zAt(0.055), 0.065 * sz, 0.045 * sz, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.62 : glow
    });
    m.addPrism(xAt(-0.212), 0, zAt(0.055), zAt(0.425), 0.075 * sz, 0.07 * sz, 8, 0, [6, 182, 212], { spec: 0.42 });
    m.addPrism(xAt(-0.212), 0, zAt(0.425), zAt(0.545), 0.07 * sz, 0.012 * sz, 8, 0, [255, 216, 77], { spec: 0.42 });

    m.addPrism(xAt(0.212), 0, zAt(0.0), zAt(0.055), 0.065 * sz, 0.045 * sz, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.62 : glow
    });
    m.addPrism(xAt(0.212), 0, zAt(0.055), zAt(0.425), 0.075 * sz, 0.07 * sz, 8, 0, [8, 145, 178], { spec: 0.42 });
    m.addPrism(xAt(0.212), 0, zAt(0.425), zAt(0.545), 0.07 * sz, 0.012 * sz, 8, 0, [255, 216, 77], { spec: 0.42 });

    m.addPrism(jx, 0, zAt(0.0), zAt(0.075), 0.115 * sz, 0.085 * sz, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addPrism(jx, 0, zAt(0.075), zAt(0.605), 0.13 * sz, 0.12 * sz, 10, 0, [248, 250, 252], { spec: 0.48 });
    m.addPrism(jx, 0, zAt(0.605), zAt(0.825), 0.12 * sz, 0.016 * sz, 10, 0, [6, 182, 212], { spec: 0.45 });
    m.addBox(jx, yAt(-0.145), zAt(0.385), 0.055 * sz, 0.012 * sz, 0.055 * sz, [255, 216, 77], { emissive: 0.62 });
  }

  function buildTradeRocket3Vessel3D(m, time, phase, pxScale, opts) {
    const o = opts || {};
    const z0 = o.zOffset !== undefined ? o.zOffset : 0.135;
    const sz = o.vesselScale !== undefined ? clamp01(o.vesselScale) : 1;
    if (sz <= 0.02) return;
    const jx = o.jx || 0;
    const thrust = o.thrust || 0;
    const glow = o.preLaunchGlow !== undefined ? o.preLaunchGlow : 0.25;
    function xAt(dx) {
      return jx + dx * sz;
    }
    function yAt(dy) {
      return dy * sz;
    }
    function zAt(dz) {
      return z0 + dz * sz;
    }

    buildRocketExhaust3D(m, time, phase + 0.5, xAt(-0.232), 0, z0, 0.068 * sz, 0.48 * sz, thrust);
    buildRocketExhaust3D(m, time, phase + 1.1, xAt(0.232), 0, z0, 0.068 * sz, 0.48 * sz, thrust);
    buildRocketExhaust3D(m, time, phase, jx, 0, z0, 0.118 * sz, 0.70 * sz, thrust);

    m.addBox(xAt(-0.354), 0, zAt(0.145), 0.038 * sz, 0.032 * sz, 0.09 * sz, [56, 189, 248], { spec: 0.42 });
    m.addBox(xAt(0.354), 0, zAt(0.145), 0.038 * sz, 0.032 * sz, 0.09 * sz, [56, 189, 248], { spec: 0.42 });
    m.addPrism(xAt(-0.232), 0, zAt(0.0), zAt(0.055), 0.068 * sz, 0.048 * sz, 8, 0, [255, 90, 77], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addPrism(xAt(-0.232), 0, zAt(0.055), zAt(0.465), 0.08 * sz, 0.075 * sz, 8, 0, [255, 216, 77], { spec: 0.50 });
    m.addPrism(xAt(-0.232), 0, zAt(0.465), zAt(0.595), 0.075 * sz, 0.014 * sz, 8, 0, [245, 158, 11], { spec: 0.45 });

    m.addPrism(xAt(0.232), 0, zAt(0.0), zAt(0.055), 0.068 * sz, 0.048 * sz, 8, 0, [255, 90, 77], {
      emissive: thrust > 0 ? 0.65 : glow
    });
    m.addPrism(xAt(0.232), 0, zAt(0.055), zAt(0.465), 0.08 * sz, 0.075 * sz, 8, 0, [245, 158, 11], { spec: 0.50 });
    m.addPrism(xAt(0.232), 0, zAt(0.465), zAt(0.595), 0.075 * sz, 0.014 * sz, 8, 0, [217, 119, 6], { spec: 0.45 });

    m.addPrism(jx, 0, zAt(0.0), zAt(0.085), 0.125 * sz, 0.09 * sz, 8, 0, [255, 200, 58], {
      emissive: thrust > 0 ? 0.70 : glow
    });
    m.addPrism(jx, 0, zAt(0.085), zAt(0.665), 0.145 * sz, 0.135 * sz, 10, 0, [30, 41, 59], { spec: 0.52 });
    m.addPrism(jx, 0, zAt(0.665), zAt(0.905), 0.135 * sz, 0.018 * sz, 10, 0, [255, 216, 77], { spec: 0.55 });
    m.addBox(jx, yAt(-0.160), zAt(0.425), 0.06 * sz, 0.012 * sz, 0.06 * sz, [56, 189, 248], { emissive: 0.82 });
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
    m.addLine([0.225, 0.10, 0.52], [0.132, 0.04, 0.52], "#10b981", lw);
    m.addPrism(0.28, 0.10, 0.63, 0.70, 0.04, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });

    const fp = opts && opts.flightProgress !== undefined ? opts.flightProgress : null;
    if (fp === null || fp >= 0.68) {
      const reloadScale = fp !== null ? easeOutCubic(clamp01((fp - 0.68) / 0.32)) : 1;
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
    m.addBox(-0.38, 0.0, 0.42, 0.055, 0.055, 0.32, [100, 116, 139], { spec: 0.35 });
    m.addLine([-0.325, 0.0, 0.50], [-0.288, 0.0, 0.50], "#06b6d4", lw);
    m.addPrism(-0.38, 0.0, 0.74, 0.81, 0.045, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });
    m.addBox(0.32, -0.20, 0.16, 0.095, 0.08, 0.06, [232, 93, 63], { spec: 0.18 });
    m.addBox(-0.28, -0.26, 0.15, 0.085, 0.075, 0.05, [245, 158, 11], { spec: 0.35 });

    const fp = opts && opts.flightProgress !== undefined ? opts.flightProgress : null;
    if (fp === null || fp >= 0.68) {
      const reloadScale = fp !== null ? easeOutCubic(clamp01((fp - 0.68) / 0.32)) : 1;
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
    m.addBox(-0.445, 0, 0.44, 0.048, 0.05, 0.30, [148, 163, 184], { spec: 0.35 });
    m.addBox(0.445, 0, 0.44, 0.048, 0.05, 0.30, [148, 163, 184], { spec: 0.35 });
    m.addPrism(-0.445, 0, 0.74, 0.81, 0.04, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });
    m.addPrism(0.445, 0, 0.74, 0.81, 0.04, 0.015, 6, 0, st.beaconCol, { emissive: st.beaconGlow });

    const fp = opts && opts.flightProgress !== undefined ? opts.flightProgress : null;
    if (fp === null || fp >= 0.68) {
      const reloadScale = fp !== null ? easeOutCubic(clamp01((fp - 0.68) / 0.32)) : 1;
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

    // Tilted nose-down escape craft fuselage closed on all faces with explicit outward normals
    m.addQuad([0.30, -0.09, 0.13], [0.30, 0.09, 0.13], [-0.40, 0.11, 0.41], [-0.40, -0.11, 0.41], [238, 243, 249], {
      spec: 0.45,
      outwardNormal: [0.37, 0, 0.93]
    });
    m.addQuad([0.28, -0.11, 0.04], [-0.40, -0.11, 0.25], [-0.40, 0.11, 0.25], [0.28, 0.11, 0.04], [96, 110, 128], {
      spec: 0.22,
      outwardNormal: [-0.29, 0, -0.96]
    });
    m.addQuad([0.30, 0.09, 0.13], [0.28, 0.11, 0.04], [-0.40, 0.11, 0.25], [-0.40, 0.11, 0.41], [220, 228, 238], {
      spec: 0.45,
      outwardNormal: [0, 1, 0]
    });
    m.addQuad([0.30, -0.09, 0.13], [-0.40, -0.11, 0.41], [-0.40, -0.11, 0.25], [0.28, -0.11, 0.04], [190, 202, 218], {
      spec: 0.45,
      outwardNormal: [0, -1, 0]
    });
    m.addQuad([0.20, 0.114, 0.135], [0.20, 0.118, 0.095], [-0.36, 0.122, 0.29], [-0.36, 0.122, 0.35], [255, 90, 77], {
      spec: 0.32,
      outwardNormal: [0, 1, 0]
    });
    m.addQuad([0.20, -0.114, 0.135], [-0.36, -0.122, 0.35], [-0.36, -0.122, 0.29], [0.20, -0.118, 0.095], [224, 62, 49], {
      spec: 0.32,
      outwardNormal: [0, -1, 0]
    });
    m.addQuad([0.38, -0.05, 0.06], [0.38, 0.05, 0.06], [0.30, 0.09, 0.13], [0.30, -0.09, 0.13], [255, 90, 77], {
      spec: 0.45,
      outwardNormal: [0.66, 0, 0.75]
    });
    m.addQuad([0.38, -0.05, 0.06], [0.38, 0.05, 0.06], [0.28, 0.11, 0.04], [0.28, -0.11, 0.04], [190, 62, 52], {
      spec: 0.22,
      outwardNormal: [0, 0, -1]
    });
    m.addQuad([-0.40, -0.11, 0.25], [-0.40, -0.11, 0.41], [-0.40, 0.11, 0.41], [-0.40, 0.11, 0.25], [71, 85, 105], {
      spec: 0.22,
      outwardNormal: [-1, 0, 0]
    });

    // Glowing cyan cockpit canopy lifted cleanly above top deck slope
    m.addQuad([0.22, -0.075, 0.178], [0.22, 0.075, 0.178], [-0.02, 0.088, 0.328], [-0.02, -0.088, 0.328], [56, 189, 248], {
      emissive: 0.38,
      spec: 0.65,
      outwardNormal: [0.37, 0, 0.93]
    });

    // Intact swept left wing (+y) + single-sided blue mini solar panel flap on dorsal surface
    m.addQuad([-0.02, 0.11, 0.24], [-0.28, 0.11, 0.33], [-0.36, 0.46, 0.44], [-0.12, 0.42, 0.36], [226, 232, 240], {
      doubleSided: true,
      spec: 0.42
    });
    m.addQuad([-0.08, 0.16, 0.286], [-0.26, 0.16, 0.356], [-0.32, 0.41, 0.456], [-0.14, 0.38, 0.386], [37, 99, 235], {
      outwardNormal: [0.28, -0.25, 0.92],
      spec: 0.58
    });
    const lw = Math.max(1.0, pxScale * 0.032);
    m.addLine([-0.14, 0.21, 0.322], [-0.22, 0.40, 0.422], "#93c5fd", lw);

    // Snapped right wing stub (-y) + detached broken wing shard resting cleanly above dirt
    m.addQuad([-0.04, -0.11, 0.25], [-0.24, -0.11, 0.33], [-0.26, -0.26, 0.34], [-0.08, -0.25, 0.27], [148, 163, 184], {
      doubleSided: true,
      spec: 0.28
    });
    m.addQuad([0.06, -0.34, 0.072], [-0.08, -0.48, 0.076], [-0.16, -0.39, 0.070], [0.00, -0.28, 0.069], [203, 213, 225], {
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
    m.addBox(-0.45, 0, 0.32, 0.05, 0.07, 0.07, [71, 85, 105], { spec: 0.32 });
    m.addBox(-0.51, 0, 0.32, 0.012, 0.045, 0.045, [245, 158, 11], { emissive: 0.55 });
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
    // Grand hexagonal alabaster-and-gold podium + sky-blue energy ring flush atop podium
    m.addPrism(0, 0, 0.0, 0.10, 0.66, 0.60, 6, 0, [226, 232, 240], { spec: 0.36 });
    m.addPrism(0, 0, 0.10, 0.13, 0.58, 0.55, 6, 0, [251, 191, 36], { spec: 0.58 });
    m.addPrism(0, 0, 0.13, 0.15, 0.42, 0.38, 6, 0, [56, 189, 248], { emissive: 0.55 });

    // Tall central futuristic ivory-pearl arcology spire
    m.addPrism(0, 0, 0.15, 0.54, 0.23, 0.16, 6, 0, [248, 250, 252], { spec: 0.52 });
    m.addPrism(0, 0, 0.54, 0.58, 0.19, 0.18, 6, 0, [251, 191, 36], { spec: 0.62 });
    m.addPrism(0, 0, 0.58, 0.94, 0.15, 0.085, 6, Math.PI / 6, [241, 245, 249], { spec: 0.56 });
    m.addPrism(0, 0, 0.94, 0.98, 0.11, 0.095, 6, Math.PI / 6, [251, 191, 36], { spec: 0.65 });
    m.addPrism(0, 0, 0.98, 1.24, 0.075, 0.02, 6, 0, [255, 252, 240], { spec: 0.60 });

    // Glowing cyan architectural window strips proud outside spire core
    const winPulse = 0.68 + 0.20 * Math.sin(time * 0.004 + phase);
    m.addBox(0, -0.205, 0.35, 0.055, 0.012, 0.14, [56, 189, 248], { emissive: winPulse });
    m.addBox(0, 0.205, 0.35, 0.055, 0.012, 0.14, [56, 189, 248], { emissive: winPulse });
    m.addBox(0, -0.152, 0.74, 0.04, 0.012, 0.11, [103, 232, 249], { emissive: winPulse });

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
        lw
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

  function buildBrickPressModel(m, time, phase, pxScale, opts) {
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const stampDown = Math.sin(pulse * Math.PI) * 0.16;
    m.addPrism(0, 0, 0.0, 0.09, 0.56, 0.51, 8, Math.PI / 8, [71, 85, 105], { spec: 0.24 });
    m.addBox(-0.26, 0, 0.36, 0.06, 0.07, 0.28, [148, 163, 184], { spec: 0.32 });
    m.addBox(0.26, 0, 0.36, 0.06, 0.07, 0.28, [148, 163, 184], { spec: 0.32 });
    m.addBox(0, 0, 0.64, 0.35, 0.12, 0.06, [203, 213, 225], { spec: 0.38 });
    m.addBox(0, 0, 0.16, 0.16, 0.12, 0.07, [232, 93, 63], { spec: 0.22 });
    m.addBox(0, 0, 0.40 - stampDown, 0.18, 0.14, 0.055, [245, 158, 11], { spec: 0.45, emissive: 0.18 + pulse * 0.55 });
    m.addPrism(0, 0, 0.455 - stampDown, 0.60, 0.05, 0.05, 6, 0, [251, 191, 36], { spec: 0.42 });
  }

  function buildHydraulicPressModel(m, time, phase, pxScale, opts) {
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const stampDown = Math.sin(pulse * Math.PI) * 0.19;
    m.addPrism(0, 0, 0.0, 0.10, 0.62, 0.56, 8, Math.PI / 8, [51, 65, 85], { spec: 0.28 });
    m.addBox(-0.32, 0, 0.42, 0.07, 0.09, 0.32, [100, 116, 139], { spec: 0.35 });
    m.addBox(0.32, 0, 0.42, 0.07, 0.09, 0.32, [100, 116, 139], { spec: 0.35 });
    m.addBox(0, 0, 0.74, 0.42, 0.15, 0.07, [148, 163, 184], { spec: 0.40 });
    m.addPrism(-0.14, 0, 0.44 - stampDown, 0.68, 0.055, 0.055, 6, 0, [56, 189, 248], { spec: 0.60, emissive: 0.22 + pulse * 0.45 });
    m.addPrism(0.14, 0, 0.44 - stampDown, 0.68, 0.055, 0.055, 6, 0, [56, 189, 248], { spec: 0.60, emissive: 0.22 + pulse * 0.45 });
    m.addBox(0, 0, 0.39 - stampDown, 0.24, 0.16, 0.06, [249, 115, 22], { spec: 0.45, emissive: 0.25 + pulse * 0.55 });
    m.addBox(-0.11, 0, 0.16, 0.09, 0.12, 0.06, [234, 88, 12], { spec: 0.25 });
    m.addBox(0.11, 0, 0.16, 0.09, 0.12, 0.06, [251, 146, 60], { spec: 0.25 });
  }

  function buildPlasmaKilnModel(m, time, phase, pxScale, opts) {
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const glow = 0.48 + 0.16 * Math.sin(time * 0.006 + phase) + pulse * 0.42;
    m.addPrism(0, 0, 0.0, 0.11, 0.66, 0.60, 8, Math.PI / 8, [30, 41, 59], { spec: 0.30 });
    m.addPrism(0, 0, 0.11, 0.56, 0.40, 0.28, 6, Math.PI / 6, [71, 85, 105], { spec: 0.36 });
    m.addPrism(-0.28, 0, 0.52, 0.86, 0.08, 0.05, 6, 0, [239, 68, 68], { emissive: glow, spec: 0.45 });
    m.addPrism(0.28, 0, 0.52, 0.86, 0.08, 0.05, 6, 0, [239, 68, 68], { emissive: glow, spec: 0.45 });
    const lw = Math.max(1.5, pxScale * 0.05);
    m.addLine([-0.24, 0, 0.78], [0.24, 0, 0.78], "#fbbf24", lw * (1 + pulse * 0.6));
    m.addPrism(0, 0, 0.14, 0.42 + pulse * 0.12, 0.20, 0.12, 6, time * 0.005, [251, 191, 36], { emissive: glow, spec: 0.65 });
  }

  function buildHandCrankModel(m, time, phase, pxScale, opts) {
    const active = Boolean(opts && opts.manualActive);
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const spin = active ? time * 0.007 + phase : phase + pulse * 2.5;
    m.addPrism(0, 0, 0.0, 0.09, 0.54, 0.49, 8, Math.PI / 8, [71, 85, 105], { spec: 0.24 });
    m.addBox(-0.10, 0, 0.27, 0.20, 0.17, 0.18, [100, 116, 139], { spec: 0.35 });
    m.addBox(-0.10, 0, 0.27, 0.13, 0.19, 0.10, [245, 158, 11], { emissive: active ? 0.55 + pulse * 0.35 : 0.12 });
    m.addPrism(0.24, 0, 0.22, 0.36, 0.14, 0.14, 8, spin, [250, 204, 21], { spec: 0.48, emissive: active ? 0.30 : 0.05 });
    const lw = Math.max(1.4, pxScale * 0.055);
    const armX = 0.24 + Math.cos(spin) * 0.12;
    const armY = Math.sin(spin) * 0.12;
    m.addLine([0.24, 0, 0.36], [armX, armY, 0.52], "#e2e8f0", lw);
    m.addBox(armX, armY, 0.53, 0.045, 0.045, 0.035, [239, 68, 68], { spec: 0.4 });
    m.addPrism(-0.10, 0, 0.45, 0.60, 0.045, 0.015, 6, 0, [253, 224, 71], { emissive: active ? 0.85 : 0.18 });
  }

  function buildFlywheelDynamoModel(m, time, phase, pxScale, opts) {
    const active = Boolean(opts && opts.manualActive);
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const spin = active ? time * 0.011 + phase : phase + pulse * 3.0;
    m.addPrism(0, 0, 0.0, 0.10, 0.60, 0.55, 8, Math.PI / 8, [51, 65, 85], { spec: 0.28 });
    m.addBox(-0.24, 0, 0.26, 0.06, 0.14, 0.16, [100, 116, 139], { spec: 0.35 });
    m.addBox(0.24, 0, 0.26, 0.06, 0.14, 0.16, [100, 116, 139], { spec: 0.35 });
    m.addPrism(0, 0, 0.20, 0.44, 0.24, 0.24, 10, spin, [2, 132, 199], { spec: 0.55, emissive: active ? 0.32 + pulse * 0.35 : 0.08 });
    m.addPrism(0, 0, 0.44, 0.54, 0.16, 0.08, 8, -spin, [56, 189, 248], { spec: 0.65, emissive: active ? 0.62 : 0.15 });
    m.addPrism(0, 0, 0.54, 0.72, 0.05, 0.015, 6, 0, [253, 224, 71], { emissive: active ? 0.90 : 0.20 });
  }

  function buildCapacitorCoreModel(m, time, phase, pxScale, opts) {
    const active = Boolean(opts && opts.manualActive);
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const spin = active ? time * 0.008 + phase : phase + pulse * 2.5;
    const glow = active ? 0.68 + 0.22 * Math.sin(time * 0.008 + phase) + pulse * 0.25 : 0.20;
    m.addPrism(0, 0, 0.0, 0.11, 0.64, 0.58, 8, Math.PI / 8, [49, 46, 129], { spec: 0.35 });
    m.addPrism(0, 0, 0.11, 0.64, 0.22, 0.18, 8, spin * 0.4, [109, 40, 217], { spec: 0.55, emissive: glow * 0.65 });
    m.addPrism(0, 0, 0.28, 0.34, 0.34, 0.34, 8, spin, [56, 189, 248], { emissive: glow, spec: 0.70 });
    m.addPrism(0, 0, 0.48, 0.54, 0.30, 0.30, 8, -spin, [168, 85, 247], { emissive: glow, spec: 0.70 });
    m.addDome(0, 0, 0.64, 0.16, 0.16, 0.18, 3, 8, [253, 224, 71], { emissive: active ? 0.92 : 0.28, spec: 0.80 });
  }

  function buildTradeCrateModel(m, tier, zOffset) {
    const zc = zOffset || 0;
    const bodyCol = tier === 3 ? [109, 40, 217] : tier === 2 ? [2, 132, 199] : [217, 119, 6];
    const bandCol = tier === 3 ? [253, 224, 71] : tier === 2 ? [56, 189, 248] : [245, 158, 11];
    m.addBox(0, 0, zc, 0.15, 0.15, 0.14, bodyCol, { spec: 0.38, emissive: tier === 3 ? 0.25 : 0.08 });
    m.addBox(0, 0, zc, 0.165, 0.165, 0.036, bandCol, { spec: 0.55, emissive: tier === 3 ? 0.45 : 0.15 });
  }

  function buildCargoTrampolineModel(m, time, phase, pxScale, opts) {
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const bounce = pulse > 0 ? -Math.sin(pulse * Math.PI * 2) * Math.exp(-pulse * 2.2) * 0.12 : 0;
    const lw = Math.max(1.3, pxScale * 0.048);
    m.addPrism(0, 0, 0.0, 0.05, 0.60, 0.56, 8, Math.PI / 8, [51, 65, 85], { spec: 0.22 });
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI * 2 * k) / 6;
      m.addLine(
        [Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0.04],
        [Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0.24],
        "#94a3b8",
        lw
      );
    }
    m.addPrism(0, 0, 0.23, 0.29, 0.50, 0.50, 8, Math.PI / 8, [100, 116, 139], { spec: 0.35 });
    m.addPrism(0, 0, 0.26 + bounce, 0.31 + bounce, 0.40, 0.38, 8, Math.PI / 8, [16, 185, 129], {
      spec: 0.40,
      emissive: 0.12 + pulse * 0.35
    });
    if (pulse < 0.05) {
      buildTradeCrateModel(m, 1, 0.45);
    }
  }

  function buildSpringCatapultModel(m, time, phase, pxScale, opts) {
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const bounce = pulse > 0 ? -Math.sin(pulse * Math.PI * 2) * Math.exp(-pulse * 2.2) * 0.14 : 0;
    m.addPrism(0, 0, 0.0, 0.07, 0.64, 0.59, 8, Math.PI / 8, [30, 41, 59], { spec: 0.28 });
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI * 2 * k) / 6;
      m.addPrism(Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0.07, 0.28, 0.055, 0.045, 6, 0, [56, 189, 248], {
        emissive: 0.32 + pulse * 0.3,
        spec: 0.55
      });
    }
    m.addPrism(0, 0, 0.27, 0.34, 0.54, 0.54, 8, Math.PI / 8, [71, 85, 105], { spec: 0.40 });
    m.addPrism(0, 0, 0.30 + bounce, 0.36 + bounce, 0.43, 0.41, 8, Math.PI / 8, [6, 182, 212], {
      spec: 0.48,
      emissive: 0.20 + pulse * 0.40
    });
    if (pulse < 0.05) {
      buildTradeCrateModel(m, 2, 0.50);
    }
  }

  function buildOrbitalBouncerModel(m, time, phase, pxScale, opts) {
    const pulse = opts && opts.manualPulse ? opts.manualPulse : 0;
    const bounce = pulse > 0 ? -Math.sin(pulse * Math.PI * 2) * Math.exp(-pulse * 2.2) * 0.14 : 0;
    const glow = 0.45 + 0.15 * Math.sin(time * 0.005 + phase) + pulse * 0.40;
    m.addPrism(0, 0, 0.0, 0.09, 0.66, 0.61, 8, Math.PI / 8, [49, 46, 129], { spec: 0.36 });
    for (let k = 0; k < 4; k++) {
      const a = (Math.PI * 2 * k) / 4 + Math.PI / 4;
      const px = Math.cos(a) * 0.46;
      const py = Math.sin(a) * 0.46;
      m.addPrism(px, py, 0.09, 0.48, 0.065, 0.04, 6, 0, [139, 92, 246], { spec: 0.5, emissive: glow * 0.6 });
      m.addBox(px, py, 0.51, 0.04, 0.04, 0.035, [253, 224, 71], { emissive: glow });
    }
    m.addPrism(0, 0, 0.26 + bounce, 0.33 + bounce, 0.44, 0.42, 8, time * 0.002, [196, 181, 253], {
      spec: 0.65,
      emissive: glow * 0.85
    });
    if (pulse < 0.05) {
      buildTradeCrateModel(m, 3, 0.47);
    }
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

    // 1. 3D Re-entry Atmospheric Bow-Shock Plasma Cone & Streaming Ribs (ahead of crimson nose)
    if (reentry > 0.02) {
      const flick = 0.88 + 0.18 * Math.sin(time * 0.065 + phase);
      const shockTip = 1.24 + 0.16 * reentry * flick;
      // Blazing incandescent nose shock cap strictly ahead of nose cone
      m.addPrism(0, 0, 1.09, Math.max(1.22, shockTip + 0.08), 0.20, 0.02, 6, Math.PI / 6, [255, 252, 224], {
        emissive: 1.0,
        spec: 0.2
      });
      // 6 sweeping 3D plasma bow-shock ribbons arcing cleanly outside full wingspan & tail
      for (let k = 0; k < 6; k++) {
        const ang = (Math.PI * 2 * k) / 6 + time * 0.008;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const tx = -sa;
        const ty = ca;
        const rBack = (k % 2 === 0 ? 1.38 : 1.24) * (0.85 + 0.22 * reentry) * flick;
        const zBack = -0.32 - 0.45 * reentry * flick;
        const wFront = 0.06;
        const wBack = 0.14;
        const pCol = k % 2 === 0 ? [255, 200, 58] : [255, 90, 77];

        m.addQuad(
          [ca * 0.24 - tx * wFront, sa * 0.24 - ty * wFront, shockTip - 0.04],
          [ca * 0.24 + tx * wFront, sa * 0.24 + ty * wFront, shockTip - 0.04],
          [ca * rBack + tx * wBack, sa * rBack + ty * wBack, zBack],
          [ca * rBack - tx * wBack, sa * rBack - ty * wBack, zBack],
          pCol,
          { doubleSided: true, emissive: 0.96, spec: 0.1 }
        );
      }
    }

    // 2. Layered 3D Exhaust Plumes (strictly behind nozzle glow with tiny non-overlapping gaps)
    if (thr > 0.02) {
      const flicker = 0.86 + 0.24 * Math.sin(time * 0.055 + phase);
      const exLen = (0.48 + 0.72 * thr) * flicker;
      const spin = time * 0.016 + phase;
      const zNoz = -0.816;
      const outerCol = sputter ? [255, 90, 77] : [56, 189, 248];
      const midCol = sputter ? [251, 146, 60] : [186, 230, 253];

      m.addPrism(0, 0, zNoz, zNoz - exLen * 0.31, 0.125, 0.105, 5, spin * 0.5, [255, 255, 255], {
        emissive: 1.0,
        spec: 0.1
      });
      m.addPrism(0, 0, zNoz - exLen * 0.316, zNoz - exLen * 0.65, 0.130, 0.068, 5, -spin, midCol, {
        emissive: 0.98,
        spec: 0.1
      });
      m.addPrism(0, 0, zNoz - exLen * 0.656, zNoz - exLen, 0.074, 0.002, 5, spin, outerCol, {
        emissive: 0.92,
        spec: 0.1
      });
    }

    // 3. Contiguous 4-Section Swept Fuselage Shell (zero internal bulkhead seam caps)
    m.addPrism(0, 0, 0.56, 1.06, 0.19, 0.022, 6, Math.PI / 6, [255, 90, 77], { spec: 0.48, openBottom: true });
    m.addPrism(0, 0, 0.14, 0.56, 0.245, 0.19, 6, Math.PI / 6, [248, 250, 252], {
      spec: 0.52,
      openTop: true,
      openBottom: true
    });
    m.addPrism(0, 0, -0.58, 0.14, 0.215, 0.245, 6, Math.PI / 6, [232, 238, 248], {
      spec: 0.46,
      openTop: true,
      openBottom: true
    });
    m.addPrism(0, 0, -0.64, -0.58, 0.19, 0.215, 6, Math.PI / 6, [71, 85, 105], { spec: 0.30, openTop: true });
    // Ventral thermal belly keel strictly below fuselage bottom ridge (y <= -0.248)
    m.addBox(0, -0.264, -0.20, 0.092, 0.016, 0.30, [68, 82, 104], { spec: 0.24 });

    // Crimson racing stripes mounted strictly outside port/starboard hull flanks & above wing top
    m.addBox(-0.224, 0.068, -0.20, 0.009, 0.024, 0.30, [224, 62, 49], { spec: 0.36 });
    m.addBox(0.224, 0.068, -0.20, 0.009, 0.024, 0.30, [255, 90, 77], { spec: 0.36 });

    // 4. 3D Cockpit Canopy, Tapered Frustum Nose & Visor Glow strictly atop dorsal ridge (y >= 0.248)
    m.addBox(0, 0.286, 0.22, 0.094, 0.038, 0.16, [56, 189, 248], { emissive: 0.48, spec: 0.85 });
    const cyB = 0.248;
    const cyT0 = 0.324;
    const cyT1 = 0.270;
    const cx0 = 0.094;
    const cx1 = 0.036;
    const cz0 = 0.382;
    const cz1 = 0.53;
    const canopyCol = [56, 189, 248];
    const canopyOpt = { emissive: 0.45, spec: 0.82 };
    m.addQuad([-cx0, cyT0, cz0], [cx0, cyT0, cz0], [cx1, cyT1, cz1], [-cx1, cyT1, cz1], canopyCol, Object.assign({ outwardNormal: [0, 0.94, 0.34] }, canopyOpt));
    m.addQuad([-cx0, cyB, cz0], [-cx1, cyB, cz1], [cx1, cyB, cz1], [cx0, cyB, cz0], canopyCol, Object.assign({ outwardNormal: [0, -1, 0] }, canopyOpt));
    m.addQuad([-cx1, cyB, cz1], [cx1, cyB, cz1], [cx1, cyT1, cz1], [-cx1, cyT1, cz1], canopyCol, Object.assign({ outwardNormal: [0, 0, 1] }, canopyOpt));
    m.addQuad([-cx0, cyB, cz0], [-cx0, cyT0, cz0], [cx0, cyT0, cz0], [cx0, cyB, cz0], canopyCol, Object.assign({ outwardNormal: [0, 0, -1] }, canopyOpt));
    m.addQuad([cx0, cyB, cz0], [cx1, cyB, cz1], [cx1, cyT1, cz1], [cx0, cyT0, cz0], canopyCol, Object.assign({ outwardNormal: [0.93, 0, 0.36] }, canopyOpt));
    m.addQuad([-cx0, cyB, cz0], [-cx0, cyT0, cz0], [-cx1, cyT1, cz1], [-cx1, cyB, cz1], canopyCol, Object.assign({ outwardNormal: [-0.93, 0, 0.36] }, canopyOpt));
    m.addBox(0, 0.335, 0.24, 0.066, 0.009, 0.095, [253, 224, 71], { emissive: 0.72 });

    // 5. Watertight 6-Face Swept Delta Wings (Starboard +X & Port -X) with Dorsal Solar Arrays & Nav Lights
    const lw = Math.max(0.9, pxScale * 0.025);
    for (let s = -1; s <= 1; s += 2) {
      const rx0 = s * 0.215;
      const rx1 = s * 0.88;
      const yTop = 0.025;
      const yBot = -0.045;
      const topCol = s > 0 ? [226, 232, 240] : [206, 216, 230];
      const sideCol = [148, 163, 184];

      // Top, bottom, leading edge, trailing edge, tip cap, and inboard root cap
      if (s > 0) {
        m.addQuad([rx0, yTop, 0.22], [rx1, yTop, -0.18], [rx1, yTop, -0.56], [rx0, yTop, -0.48], topCol, {
          spec: 0.42,
          outwardNormal: [0, 1, 0]
        });
        m.addQuad([rx0, yBot, 0.22], [rx0, yBot, -0.48], [rx1, yBot, -0.56], [rx1, yBot, -0.18], sideCol, {
          spec: 0.42,
          outwardNormal: [0, -1, 0]
        });
        m.addQuad([rx0, yTop, 0.22], [rx0, yBot, 0.22], [rx1, yBot, -0.18], [rx1, yTop, -0.18], [241, 245, 249], {
          spec: 0.42,
          outwardNormal: [0.40, 0, 0.69]
        });
        m.addQuad([rx0, yTop, -0.48], [rx1, yTop, -0.56], [rx1, yBot, -0.56], [rx0, yBot, -0.48], sideCol, {
          spec: 0.42,
          outwardNormal: [0.08, 0, -0.69]
        });
        m.addQuad([rx1, yTop, -0.18], [rx1, yBot, -0.18], [rx1, yBot, -0.56], [rx1, yTop, -0.56], [255, 90, 77], {
          spec: 0.42,
          outwardNormal: [1, 0, 0]
        });
        m.addQuad([rx0, yTop, 0.22], [rx0, yTop, -0.48], [rx0, yBot, -0.48], [rx0, yBot, 0.22], sideCol, {
          spec: 0.35,
          outwardNormal: [-1, 0, 0]
        });

        // Single-sided cobalt solar wing array mounted flush above dorsal surface (matches crash_base solar wing)
        const sx0 = s * 0.28;
        const sx1 = s * 0.72;
        m.addQuad(
          [sx0, yTop + 0.012, 0.04],
          [sx1, yTop + 0.012, -0.20],
          [sx1, yTop + 0.012, -0.47],
          [sx0, yTop + 0.012, -0.38],
          [37, 99, 235],
          { outwardNormal: [0, 1, 0], spec: 0.90, emissive: 0.16 }
        );
      } else {
        m.addQuad([rx0, yTop, 0.22], [rx0, yTop, -0.48], [rx1, yTop, -0.56], [rx1, yTop, -0.18], topCol, {
          spec: 0.42,
          outwardNormal: [0, 1, 0]
        });
        m.addQuad([rx0, yBot, 0.22], [rx1, yBot, -0.18], [rx1, yBot, -0.56], [rx0, yBot, -0.48], sideCol, {
          spec: 0.42,
          outwardNormal: [0, -1, 0]
        });
        m.addQuad([rx0, yTop, 0.22], [rx1, yTop, -0.18], [rx1, yBot, -0.18], [rx0, yBot, 0.22], [241, 245, 249], {
          spec: 0.42,
          outwardNormal: [-0.40, 0, 0.69]
        });
        m.addQuad([rx0, yTop, -0.48], [rx0, yBot, -0.48], [rx1, yBot, -0.56], [rx1, yTop, -0.56], sideCol, {
          spec: 0.42,
          outwardNormal: [-0.08, 0, -0.69]
        });
        m.addQuad([rx1, yTop, -0.18], [rx1, yTop, -0.56], [rx1, yBot, -0.56], [rx1, yBot, -0.18], [255, 90, 77], {
          spec: 0.42,
          outwardNormal: [-1, 0, 0]
        });
        m.addQuad([rx0, yTop, 0.22], [rx0, yBot, 0.22], [rx0, yBot, -0.48], [rx0, yTop, -0.48], sideCol, {
          spec: 0.35,
          outwardNormal: [1, 0, 0]
        });

        // Single-sided cobalt solar wing array mounted flush above dorsal surface (matches crash_base solar wing)
        const sx0 = s * 0.28;
        const sx1 = s * 0.72;
        m.addQuad(
          [sx0, yTop + 0.012, 0.04],
          [sx0, yTop + 0.012, -0.38],
          [sx1, yTop + 0.012, -0.47],
          [sx1, yTop + 0.012, -0.20],
          [37, 99, 235],
          { outwardNormal: [0, 1, 0], spec: 0.90, emissive: 0.16 }
        );
      }
      const sx0 = s * 0.28;
      const sx1 = s * 0.72;
      m.addLine(
        [(sx0 + sx1) * 0.5, yTop + 0.018, -0.08],
        [(sx0 + sx1) * 0.5, yTop + 0.018, -0.425],
        "rgba(186, 230, 253, 0.82)",
        lw,
        0,
        { outwardNormal: [0, 1, 0] }
      );

      // Wingtip navigation beacon pod flush outside tip cap
      m.addBox(s * 0.918, -0.01, -0.37, 0.036, 0.040, 0.14, s < 0 ? [255, 90, 77] : [52, 211, 153], {
        emissive: 0.72,
        spec: 0.5
      });

      // Twin wing-root auxiliary thruster pods mounted cleanly below ventral wing surface
      m.addPrism(s * 0.31, -0.102, -0.66, -0.34, 0.048, 0.050, 6, 0, [100, 116, 139], { spec: 0.38 });
      m.addBox(s * 0.31, -0.102, -0.676, 0.032, 0.032, 0.014, sputter ? [251, 146, 60] : [56, 189, 248], {
        emissive: thr > 0 ? 0.85 : 0.15
      });
    }

    // 6. Watertight 6-Face Vertical Crimson Tail Fin strictly atop dorsal ridge (y >= 0.248) & Blinking Red Beacon
    m.addQuad([-0.026, 0.248, -0.18], [-0.026, 0.60, -0.42], [-0.026, 0.66, -0.58], [-0.026, 0.248, -0.58], [224, 62, 49], {
      spec: 0.38,
      outwardNormal: [-1, 0, 0]
    });
    m.addQuad([0.026, 0.248, -0.18], [0.026, 0.248, -0.58], [0.026, 0.66, -0.58], [0.026, 0.60, -0.42], [255, 90, 77], {
      spec: 0.38,
      outwardNormal: [1, 0, 0]
    });
    m.addQuad([-0.026, 0.248, -0.18], [0.026, 0.248, -0.18], [0.026, 0.60, -0.42], [-0.026, 0.60, -0.42], [255, 135, 115], {
      spec: 0.38,
      outwardNormal: [0, 0.24, 0.35]
    });
    m.addQuad([-0.026, 0.248, -0.58], [-0.026, 0.66, -0.58], [0.026, 0.66, -0.58], [0.026, 0.248, -0.58], [190, 48, 38], {
      spec: 0.38,
      outwardNormal: [0, 0, -1]
    });
    m.addQuad([-0.026, 0.60, -0.42], [0.026, 0.60, -0.42], [0.026, 0.66, -0.58], [-0.026, 0.66, -0.58], [255, 120, 100], {
      spec: 0.38,
      outwardNormal: [0, 0.16, 0.06]
    });
    m.addQuad([-0.026, 0.248, -0.18], [-0.026, 0.248, -0.58], [0.026, 0.248, -0.58], [0.026, 0.248, -0.18], [168, 42, 34], {
      spec: 0.30,
      outwardNormal: [0, -1, 0]
    });

    if (beacon) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.009 + phase);
      m.addBox(0, 0.692, -0.51, 0.036, 0.028, 0.046, pulse > 0.45 ? [255, 90, 77] : [140, 32, 32], {
        emissive: 0.25 + 0.75 * pulse
      });
    }

    // 7. Main Rear Thruster Nozzle Bell + Inner Reactor Glow flush behind AftRing & Nozzle
    m.addPrism(0, 0, -0.78, -0.642, 0.155, 0.115, 8, Math.PI / 8, [71, 85, 105], { spec: 0.36 });
    m.addBox(0, 0, -0.798, 0.09, 0.09, 0.014, sputter ? [251, 146, 60] : [56, 189, 248], {
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

  function renderTradeCrate3D(ctx, frame, time, tier) {
    if (!ctx || !frame) return;
    const collector = createMeshCollector(frame, 1, null);
    buildTradeCrateModel(collector, tier || 1, 0);
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

    if (buildingId === "brick_press") {
      buildBrickPressModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "hydraulic_press") {
      buildHydraulicPressModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "quantum_kiln") {
      buildPlasmaKilnModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "hand_crank") {
      buildHandCrankModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "flywheel_dynamo") {
      buildFlywheelDynamoModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "capacitor_core") {
      buildCapacitorCoreModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "cargo_trampoline") {
      buildCargoTrampolineModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "spring_catapult") {
      buildSpringCatapultModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "orbital_bouncer") {
      buildOrbitalBouncerModel(collector, time, phase, pxScale, opts);
    } else if (buildingId === "mine") {
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
    } else if (buildingId === "solar_cabin") {
      buildSolarCabinModel(collector, time, phase, pxScale);
    } else if (buildingId === "eco_dome") {
      buildEcoDomeModel(collector, time, phase, pxScale);
    } else if (buildingId === "eco_arcology") {
      buildEcoArcologyModel(collector, time, phase, pxScale);
    } else if (buildingId === "starlight_monument") {
      buildStarlightMonumentModel(collector, time, phase, pxScale);
    } else if (buildingId === "helio_mirror") {
      buildHelioMirrorModel(collector, time, phase, pxScale);
    } else if (buildingId === "botanical_garden") {
      buildBotanicalGardenModel(collector, time, phase, pxScale);
    } else if (buildingId === "builders_plaza") {
      buildBuildersPlazaModel(collector, time, phase, pxScale);
    } else if (buildingId === "geo_terraformer") {
      buildGeoTerraformerModel(collector, time, phase, pxScale, opts);
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
      buildSpaceRocket1Model(collector, time, phase, pxScale, opts);
    } else if (buildingId === "space_rocket_2") {
      buildSpaceRocket2Model(collector, time, phase, pxScale, opts);
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
      solar_cabin: 0.48,
      eco_dome: 0.50,
      eco_arcology: 0.85,
      starlight_monument: 0.82,
      helio_mirror: 0.64,
      botanical_garden: 0.44,
      builders_plaza: 0.64,
      geo_terraformer: 0.58,
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

  function renderTerraformEffect(ctx, effect, frame, p, depthScale) {
    const seedBase = effect.seed || 11;
    // Double expanding teal & gold hexagonal shockwave rings
    for (let rIdx = 0; rIdx < 2; rIdx++) {
      const delay = rIdx * 0.16;
      const rt = clamp01((p - delay) / (1 - delay));
      if (rt <= 0 || rt >= 1) continue;
      const rad = 0.24 + 0.86 * easeOutCubic(rt);
      ctx.save();
      ctx.globalAlpha *= (1 - rt) * 0.92;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k + 0.22;
        const pt = projectLocal(frame, Math.cos(a) * rad, Math.sin(a) * rad, 0.04 + rt * 0.08);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.lineWidth = Math.max(2, depthScale * 0.09 * (1 - rt * 0.45));
      ctx.strokeStyle = rIdx === 0 ? "#2dd4bf" : "#fde047";
      ctx.stroke();
      ctx.restore();
    }

    // 7 rising emerald & gold sparkles
    if (p < 0.92) {
      const spT = clamp01(p / 0.92);
      for (let i = 0; i < 7; i++) {
        const r1 = pseudoRand(seedBase + 40 + i * 5.7);
        const angle = (Math.PI * 2 * i) / 7 + r1 * 0.55;
        const dist = 0.18 + 0.55 * easeOutCubic(spT);
        const lz = 0.10 + (0.72 + r1 * 0.28) * easeOutCubic(spT);
        const pt = projectLocal(frame, Math.cos(angle) * dist, Math.sin(angle) * dist, lz);
        const popScale = Math.sin(spT * Math.PI);
        drawSparkle4(
          ctx,
          pt.x,
          pt.y,
          depthScale * (0.13 + r1 * 0.05) * popScale,
          spT * 2.2 + i,
          i % 2 === 0 ? "#2dd4bf" : "#fde047",
          "#1b1147",
          1 - spT * 0.5
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
    } else if (effect.type === "terraform") {
      renderTerraformEffect(ctx, effect, frame, p, depthScale);
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
    getBuildingDiscountPercent: getBuildingDiscountPercent,
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
    refreshTileState: refreshTileState,
    refreshAffordability: refreshAffordability,
    close: close,
    isOpen: isOpen,
    isConfirming: function () {
      return Boolean(pendingConfirmBuildingId || pendingDemolishConfirm);
    },
    cancelConfirm: closeConfirmScene,
    getLayoutBounds: getLayoutBounds,
    renderBuilding3D: renderBuilding3D,
    renderRocketVessel3D: renderRocketVessel3D,
    renderEscapeCraft3D: renderEscapeCraft3D,
    renderTradeCrate3D: renderTradeCrate3D,
    renderTileEffect: renderTileEffect
  };
})();
