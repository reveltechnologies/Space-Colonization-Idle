/**
 * Space Colonization: Idle
 * Centralized Economy Configuration (Building Costs, Generation Rates, Capacities, Research Costs & Bonuses)
 */

(function () {
  "use strict";

  const ECONOMY = {
    currencies: {
      credits: {
        startingAmount: 500,
        baseRatePerSec: 0
      },
      ore: {
        startingAmount: 0,
        baseRatePerSec: 0
      }
    },

    planets: {
      citizenRegenPerSec: 0.08,
      startingBricks: [0, 0, 0],
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
        bricksPerSec: 1 / 60,
        energySlots: 1,
        citizenSlots: 1,
        fixedCitizens: true,
        indestructible: true,
        unreplaceable: true,
        hiddenFromBuildMenu: true
      },

      // Mining
      mine: {
        cost: { credits: 80 },
        bricksPerSec: 0.25,
        energyRequired: 1,
        citizensRequired: 1
      },
      deep_mine: {
        cost: { credits: 180, bricks: 25 },
        bricksPerSec: 0.85,
        energyRequired: 3,
        citizensRequired: 2
      },
      mega_quarry: {
        cost: { credits: 420, bricks: 70 },
        bricksPerSec: 2.4,
        energyRequired: 7,
        citizensRequired: 4
      },

      // Automated Trade Rockets
      trade_rocket_1: {
        cost: { bricks: 25 },
        bricksPerLaunch: 5,
        creditsPerBrick: 4,
        tradeIntervalSec: 6.0,
        tradeSpeedMult: 1.0,
        energyRequired: 2,
        citizensRequired: 1
      },
      trade_rocket_2: {
        cost: { credits: 260, bricks: 45 },
        bricksPerLaunch: 12,
        creditsPerBrick: 5,
        tradeIntervalSec: 4.0,
        tradeSpeedMult: 1.35,
        energyRequired: 5,
        citizensRequired: 2
      },
      trade_rocket_3: {
        cost: { credits: 450, bricks: 100 },
        bricksPerLaunch: 25,
        creditsPerBrick: 6,
        tradeIntervalSec: 2.5,
        tradeSpeedMult: 1.75,
        energyRequired: 9,
        citizensRequired: 4
      },

      // Science
      research_center: {
        cost: { credits: 140, bricks: 20 },
        researchPerSec: 0.3,
        maxPerPlanet: 1,
        energyRequired: 1,
        citizensRequired: 1
      },
      research_lab: {
        cost: { credits: 220, bricks: 40 },
        researchPerSec: 0.7,
        energyRequired: 2,
        citizensRequired: 2
      },
      observatory: {
        cost: { credits: 380, bricks: 75 },
        researchPerSec: 1.6,
        energyRequired: 5,
        citizensRequired: 3
      },
      quantum_array: {
        cost: { credits: 550, bricks: 120 },
        researchPerSec: 3.8,
        energyRequired: 10,
        citizensRequired: 5
      },
      ore_research_station: {
        cost: { credits: 2500, bricks: 400 },
        costScaling: {
          creditsMult: 1.8,
          bricksMult: 1.6,
          oreBaseAfterFirst: 15,
          oreMult: 1.75
        },
        orePerDay: 5,
        energyRequired: 15,
        citizensRequired: 8
      },

      // Colony Housing
      small_house: {
        cost: { credits: 60, bricks: 10 },
        citizenSlots: 2
      },
      big_house: {
        cost: { credits: 160, bricks: 35 },
        citizenSlots: 6
      },
      villa: {
        cost: { credits: 360, bricks: 80 },
        citizenSlots: 15
      },

      // Self-Sustaining Solar Homes
      solar_cabin: {
        cost: { credits: 130, bricks: 20 },
        citizenSlots: 3,
        energySlots: 2,
        isSolar: true
      },
      eco_dome: {
        cost: { credits: 310, bricks: 65 },
        citizenSlots: 8,
        energySlots: 6,
        isSolar: true
      },
      eco_arcology: {
        cost: { credits: 620, bricks: 140 },
        citizenSlots: 20,
        energySlots: 15,
        isSolar: true
      },

      // Solar Power
      solar_panel: {
        cost: { credits: 50 },
        energySlots: 3,
        isSolar: true
      },
      solar_array: {
        cost: { credits: 150, bricks: 25 },
        energySlots: 8,
        isSolar: true
      },
      solar_tower: {
        cost: { credits: 360, bricks: 65 },
        energySlots: 20,
        isSolar: true
      },

      // Decorations (Cosmetic & Purposeful Colony Utility)
      starlight_monument: {
        cost: { credits: 45, bricks: 5 },
        isCosmetic: true
      },
      helio_mirror: {
        cost: { credits: 220, bricks: 35 },
        maxPerPlanet: 3,
        solarEnergyBonus: 0.25
      },
      botanical_garden: {
        cost: { credits: 160, bricks: 25 },
        maxPerPlanet: 3,
        citizenGrowthBonus: 0.50
      },
      builders_plaza: {
        cost: { credits: 280, bricks: 55 },
        maxPerPlanet: 2,
        costDiscount: 0.15,
        discountCategories: ["colony", "power", "mining"]
      },

      // Terraforming
      geo_terraformer: {
        cost: { credits: 180, bricks: 40 },
        energyRequired: 2,
        singleUseTerraformer: true
      },

      // Wind Power
      windmill: {
        cost: { credits: 100, bricks: 15 },
        energySlots: 6
      },
      wind_turbine: {
        cost: { credits: 240, bricks: 45 },
        energySlots: 16
      },
      wind_farm: {
        cost: { credits: 460, bricks: 95 },
        energySlots: 35
      },

      // Interplanetary Space Rockets
      space_rocket_1: {
        cost: { credits: 400, bricks: 80 },
        rocketTier: 1,
        rocketCitizens: 4,
        rocketMaxBricks: 200
      },
      space_rocket_2: {
        cost: { credits: 550, bricks: 160 },
        rocketTier: 2,
        rocketCitizens: 10,
        rocketMaxBricks: 600
      }
    },

    research: {
      // Mining
      reinforced_masonry: { cost: 15, bricksBonus: 0.25 },
      cryo_drilling: { cost: 35, bricksBonus: 0.35 },
      thermal_sintering: { cost: 60, deepMegaBricksBonus: 0.50 },
      mantle_excavation: { cost: 95, bricksBonus: 0.50 },

      // Power
      solar_cells: { cost: 15, energyBonus: 0.20 },
      hydro_grid: { cost: 40, energyBonus: 0.25 },
      superconductors: { cost: 75, energyBonus: 0.35 },

      // Colony
      habitat_insulation: { cost: 15, citizenBonus: 0.20 },
      biodome_recycling: { cost: 40, citizenBonus: 0.25 },
      arcology_habitats: { cost: 75, citizenBonus: 0.35 },

      // Science
      orbital_telemetry: { cost: 20, researchBonus: 0.25 },
      stellar_optics: { cost: 45, researchBonus: 0.35 },
      quantum_computing: { cost: 70 },
      neural_archivists: { cost: 110, researchBonus: 0.50 },
      ore_synthesis: { cost: 280 },

      // Planetary
      surface_surveying: { cost: 25, bricksBonus: 0.15, researchBonus: 0.15 },
      oceanic_adaptation: { cost: 55, energyBonus: 0.20, citizenBonus: 0.20 },
      volcanic_shielding: { cost: 90, bricksBonus: 0.30, energyBonus: 0.30, citizenBonus: 0.30, researchBonus: 0.30 },

      // Aerospace
      hull_metallurgy: { cost: 40, researchBonus: 0.15 },
      cryo_propellant: { cost: 80, energyBonus: 0.20 },
      orbital_rocketry: { cost: 140 },
      heavy_starship: { cost: 240 },

      // Track 2: Solar Optics, Self-Sustaining Homes, Civic Decorations & Terraforming
      helio_optics: { cost: 30 },
      solar_habitats: { cost: 55 },
      arcology_grids: { cost: 120 },
      civic_gardens: { cost: 25 },
      modular_prefabs: { cost: 55 },
      civic_prosperity: { cost: 95, citizenGrowthBonus: 0.30 },
      planetary_terraforming: { cost: 45 },
      crust_stabilization: { cost: 95, bricksBonus: 0.20, energyBonus: 0.20 }
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
