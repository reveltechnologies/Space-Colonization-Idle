/**
 * Space Colonization: Idle
 * Centralized Economy Configuration (Building Costs, Generation Rates, Capacities, Research Costs & Bonuses)
 */

(function () {
  "use strict";

  const ECONOMY = {
    currencies: {
      credits: {
        startingAmount: 0,
        baseRatePerSec: 0
      },
      ore: {
        startingAmount: 0,
        baseRatePerSec: 0
      }
    },

    planets: {
      citizenRegenPerSec: 0.025,
      startingBricks: [1, 0, 0],
      baseCitizens: [0, 0, 0],
      startingCitizens: [0, 0, 0],
      startingResearchPoints: 0,
      tradeFlightBaseMs: 1400
    },

    save: {
      autosaveIntervalMs: 10000,
      debounceMs: 500,
      minOfflineSeconds: 5,
      toastMinOfflineSeconds: 60,
      maxOfflineSeconds: 86400
    },

    buildings: {
      // Permanent Crash Landing Base (Planet 1 Starter HQ)
      crash_base: {
        bricksPerSec: 0.2,
        energySlots: 1,
        citizenSlots: 1,
        fixedCitizens: true,
        indestructible: true,
        unreplaceable: true,
        hiddenFromBuildMenu: true
      },

      // Manual Brick Production (cheapest starter + late-game upgrades)
      brick_press: {
        cost: { bricks: 1 },
        costScaling: { creditsBaseAfterFirst: 25, creditsMult: 1.35, bricksMult: 1.45 },
        manualBrickPerClick: 1,
        manualBrickCooldownMs: 1600
      },
      hydraulic_press: {
        cost: { credits: 650, bricks: 95 },
        costScaling: { creditsMult: 1.38, bricksMult: 1.30 },
        manualBrickPerClick: 4,
        manualBrickCooldownMs: 1300
      },
      quantum_kiln: {
        cost: { credits: 4200, bricks: 550 },
        costScaling: { creditsMult: 1.42, bricksMult: 1.35 },
        manualBrickPerClick: 15,
        manualBrickCooldownMs: 1000
      },

      // Mining
      mine: {
        cost: { credits: 120, bricks: 20 },
        costScaling: { creditsMult: 1.25, bricksMult: 1.22 },
        bricksPerSec: 0.12,
        energyRequired: 1,
        citizensRequired: 1
      },
      deep_mine: {
        cost: { credits: 1150, bricks: 160 },
        costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
        bricksPerSec: 0.42,
        energyRequired: 3,
        citizensRequired: 2
      },
      mega_quarry: {
        cost: { credits: 6400, bricks: 820 },
        costScaling: { creditsMult: 1.32, bricksMult: 1.28 },
        bricksPerSec: 1.35,
        energyRequired: 8,
        citizensRequired: 4
      },

      // Manual Brick Trading (Trampolines)
      cargo_trampoline: {
        cost: { bricks: 4 },
        costScaling: { creditsBaseAfterFirst: 35, creditsMult: 1.35, bricksMult: 1.35 },
        manualTradeTier: 1,
        manualTradeBricks: 4,
        manualTradeCreditsPerBrick: 3,
        manualTradeCooldownMs: 1800
      },
      spring_catapult: {
        cost: { credits: 720, bricks: 110 },
        costScaling: { creditsMult: 1.38, bricksMult: 1.32 },
        manualTradeTier: 2,
        manualTradeBricks: 12,
        manualTradeCreditsPerBrick: 4,
        manualTradeCooldownMs: 1500
      },
      orbital_bouncer: {
        cost: { credits: 4600, bricks: 600 },
        costScaling: { creditsMult: 1.42, bricksMult: 1.35 },
        manualTradeTier: 3,
        manualTradeBricks: 30,
        manualTradeCreditsPerBrick: 5,
        manualTradeCooldownMs: 1200
      },

      // Automated Trade Rockets
      trade_rocket_1: {
        cost: { credits: 180, bricks: 40 },
        costScaling: { creditsMult: 1.30, bricksMult: 1.25 },
        bricksPerLaunch: 5,
        creditsPerBrick: 3,
        tradeIntervalSec: 8.0,
        tradeSpeedMult: 1.0,
        energyRequired: 2,
        citizensRequired: 1
      },
      trade_rocket_2: {
        cost: { credits: 1650, bricks: 240 },
        costScaling: { creditsMult: 1.34, bricksMult: 1.28 },
        bricksPerLaunch: 12,
        creditsPerBrick: 4,
        tradeIntervalSec: 6.0,
        tradeSpeedMult: 1.35,
        energyRequired: 5,
        citizensRequired: 2
      },
      trade_rocket_3: {
        cost: { credits: 8800, bricks: 1100 },
        costScaling: { creditsMult: 1.38, bricksMult: 1.32 },
        bricksPerLaunch: 25,
        creditsPerBrick: 5,
        tradeIntervalSec: 4.0,
        tradeSpeedMult: 1.75,
        energyRequired: 10,
        citizensRequired: 4
      },

      // Science
      research_center: {
        cost: { credits: 260, bricks: 45 },
        researchPerSec: 0.12,
        maxPerPlanet: 1,
        energyRequired: 1,
        citizensRequired: 1
      },
      research_lab: {
        cost: { credits: 850, bricks: 130 },
        costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
        researchPerSec: 0.28,
        energyRequired: 2,
        citizensRequired: 2
      },
      observatory: {
        cost: { credits: 2800, bricks: 380 },
        costScaling: { creditsMult: 1.32, bricksMult: 1.28 },
        researchPerSec: 0.70,
        energyRequired: 5,
        citizensRequired: 3
      },
      quantum_array: {
        cost: { credits: 9500, bricks: 1250 },
        costScaling: { creditsMult: 1.36, bricksMult: 1.32 },
        researchPerSec: 1.75,
        energyRequired: 11,
        citizensRequired: 5
      },
      ore_research_station: {
        cost: { credits: 18500, bricks: 2400 },
        costScaling: {
          scope: "global",
          creditsMult: 1.85,
          bricksMult: 1.65,
          oreBaseAfterFirst: 15,
          oreMult: 1.75
        },
        orePerDay: 5,
        energyRequired: 16,
        citizensRequired: 8
      },

      // Colony Housing
      small_house: {
        cost: { credits: 60, bricks: 15 },
        costScaling: { creditsMult: 1.22, bricksMult: 1.20 },
        citizenSlots: 2
      },
      big_house: {
        cost: { credits: 720, bricks: 115 },
        costScaling: { creditsMult: 1.26, bricksMult: 1.24 },
        citizenSlots: 6
      },
      villa: {
        cost: { credits: 3900, bricks: 520 },
        costScaling: { creditsMult: 1.30, bricksMult: 1.28 },
        citizenSlots: 15
      },

      // Self-Sustaining Solar Homes
      solar_cabin: {
        cost: { credits: 240, bricks: 40 },
        costScaling: { creditsMult: 1.25, bricksMult: 1.22 },
        citizenSlots: 3,
        energySlots: 2,
        isSolar: true
      },
      eco_dome: {
        cost: { credits: 1950, bricks: 280 },
        costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
        citizenSlots: 8,
        energySlots: 6,
        isSolar: true
      },
      eco_arcology: {
        cost: { credits: 8200, bricks: 1050 },
        costScaling: { creditsMult: 1.34, bricksMult: 1.30 },
        citizenSlots: 20,
        energySlots: 15,
        isSolar: true
      },

      // Manual Energy Production (cheapest starter + late-game upgrades, stacks up to 1 hour)
      hand_crank: {
        cost: { bricks: 2 },
        costScaling: { creditsBaseAfterFirst: 20, creditsMult: 1.35, bricksMult: 1.40 },
        manualEnergySlots: 2,
        manualEnergyClickSec: 180,
        manualEnergyMaxSec: 3600,
        manualEnergyCooldownMs: 350
      },
      flywheel_dynamo: {
        cost: { credits: 580, bricks: 85 },
        costScaling: { creditsMult: 1.38, bricksMult: 1.30 },
        manualEnergySlots: 7,
        manualEnergyClickSec: 240,
        manualEnergyMaxSec: 3600,
        manualEnergyCooldownMs: 350
      },
      capacitor_core: {
        cost: { credits: 3800, bricks: 480 },
        costScaling: { creditsMult: 1.42, bricksMult: 1.35 },
        manualEnergySlots: 22,
        manualEnergyClickSec: 300,
        manualEnergyMaxSec: 3600,
        manualEnergyCooldownMs: 350
      },

      // Solar Power
      solar_panel: {
        cost: { credits: 85, bricks: 12 },
        costScaling: { creditsMult: 1.22, bricksMult: 1.20 },
        energySlots: 3,
        isSolar: true
      },
      solar_array: {
        cost: { credits: 780, bricks: 110 },
        costScaling: { creditsMult: 1.26, bricksMult: 1.24 },
        energySlots: 8,
        isSolar: true
      },
      solar_tower: {
        cost: { credits: 4100, bricks: 540 },
        costScaling: { creditsMult: 1.30, bricksMult: 1.28 },
        energySlots: 20,
        isSolar: true
      },

      // Decorations (Cosmetic & Purposeful Colony Utility)
      starlight_monument: {
        cost: { credits: 150, bricks: 25 },
        costScaling: { creditsMult: 1.25, bricksMult: 1.25 },
        isCosmetic: true
      },
      helio_mirror: {
        cost: { credits: 1400, bricks: 210 },
        costScaling: { creditsMult: 1.45, bricksMult: 1.40 },
        maxPerPlanet: 3,
        solarEnergyBonus: 0.25
      },
      botanical_garden: {
        cost: { credits: 1100, bricks: 170 },
        costScaling: { creditsMult: 1.45, bricksMult: 1.40 },
        maxPerPlanet: 3,
        citizenGrowthBonus: 0.50
      },
      builders_plaza: {
        cost: { credits: 2400, bricks: 350 },
        costScaling: { creditsMult: 1.60, bricksMult: 1.50 },
        maxPerPlanet: 2,
        costDiscount: 0.15,
        discountCategories: ["colony", "power", "mining"]
      },

      // Terraforming
      geo_terraformer: {
        cost: { credits: 1250, bricks: 190 },
        energyRequired: 2,
        singleUseTerraformer: true
      },

      // Wind Power
      windmill: {
        cost: { credits: 210, bricks: 35 },
        costScaling: { creditsMult: 1.24, bricksMult: 1.22 },
        energySlots: 6
      },
      wind_turbine: {
        cost: { credits: 1550, bricks: 220 },
        costScaling: { creditsMult: 1.28, bricksMult: 1.25 },
        energySlots: 16
      },
      wind_farm: {
        cost: { credits: 6800, bricks: 880 },
        costScaling: { creditsMult: 1.32, bricksMult: 1.28 },
        energySlots: 35
      },

      // Interplanetary Space Rockets
      space_rocket_1: {
        cost: { credits: 3200, bricks: 450 },
        rocketTier: 1,
        rocketCitizens: 4,
        rocketMaxBricks: 250
      },
      space_rocket_2: {
        cost: { credits: 14500, bricks: 1800 },
        rocketTier: 2,
        rocketCitizens: 10,
        rocketMaxBricks: 750
      }
    },

    research: {
      // Mining
      reinforced_masonry: { cost: 25, bricksBonus: 0.25 },
      cryo_drilling: { cost: 85, bricksBonus: 0.35 },
      thermal_sintering: { cost: 420, deepMegaBricksBonus: 0.50 },
      mantle_excavation: { cost: 1150, bricksBonus: 0.50 },

      // Power
      solar_cells: { cost: 25, energyBonus: 0.20 },
      hydro_grid: { cost: 160, energyBonus: 0.25 },
      superconductors: { cost: 680, energyBonus: 0.35 },

      // Colony
      habitat_insulation: { cost: 25, citizenBonus: 0.20 },
      biodome_recycling: { cost: 160, citizenBonus: 0.25 },
      arcology_habitats: { cost: 620, citizenBonus: 0.35 },

      // Science
      orbital_telemetry: { cost: 35, researchBonus: 0.25 },
      stellar_optics: { cost: 320, researchBonus: 0.35 },
      quantum_computing: { cost: 750 },
      neural_archivists: { cost: 1500, researchBonus: 0.50 },
      ore_synthesis: { cost: 3600 },

      // Planetary
      surface_surveying: { cost: 45, bricksBonus: 0.15, researchBonus: 0.15 },
      oceanic_adaptation: { cost: 240, energyBonus: 0.20, citizenBonus: 0.20 },
      volcanic_shielding: { cost: 950, bricksBonus: 0.30, energyBonus: 0.30, citizenBonus: 0.30, researchBonus: 0.30 },

      // Aerospace
      hull_metallurgy: { cost: 75, researchBonus: 0.15 },
      cryo_propellant: { cost: 180, energyBonus: 0.20 },
      orbital_rocketry: { cost: 380 },
      heavy_starship: { cost: 1400 },

      // Track 2: Solar Optics, Self-Sustaining Homes, Civic Decorations & Terraforming
      helio_optics: { cost: 65 },
      solar_habitats: { cost: 210 },
      arcology_grids: { cost: 850 },
      civic_gardens: { cost: 55 },
      modular_prefabs: { cost: 220 },
      civic_prosperity: { cost: 720, citizenGrowthBonus: 0.30 },
      planetary_terraforming: { cost: 140 },
      crust_stabilization: { cost: 680, bricksBonus: 0.20, energyBonus: 0.20 }
    }
  };

  function get(path, fallback) {
    if (!path) return fallback;
    const parts = String(path).split(".");
    let cur = ECONOMY;
    for (let i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== "object") {
        return fallback;
      }
      cur = cur[parts[i]];
    }
    return cur === undefined ? fallback : cur;
  }

  function getBuilding(id) {
    return (id && ECONOMY.buildings[id]) || null;
  }

  function getResearchNode(id) {
    return (id && ECONOMY.research[id]) || null;
  }

  window.GameEconomy = {
    DATA: ECONOMY,
    get: get,
    getBuilding: getBuilding,
    getResearchNode: getResearchNode
  };
})();
