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
        startingAmount: 100,
        baseRatePerSec: 0
      }
    },

    planets: {
      citizenRegenPerSec: 0.08,
      startingBricks: [0, 0, 0],
      startingCitizens: [0, 0, 0],
      startingResearchPoints: 0,
      tradeFlightBaseMs: 1400
    },

    buildings: {
      // Mining
      mine: {
        cost: { credits: 100 },
        bricksPerSec: 0.2,
        energyRequired: 1
      },
      deep_mine: {
        cost: { credits: 230 },
        bricksPerSec: 0.8,
        energyRequired: 3
      },
      mega_quarry: {
        cost: { credits: 460 },
        bricksPerSec: 2.5,
        energyRequired: 8
      },

      // Automated Trade Rockets
      trade_rocket_1: {
        cost: { credits: 140 },
        bricksPerLaunch: 5,
        creditsPerBrick: 4,
        tradeIntervalSec: 6.0,
        tradeSpeedMult: 1.0,
        energyRequired: 2
      },
      trade_rocket_2: {
        cost: { credits: 290 },
        bricksPerLaunch: 12,
        creditsPerBrick: 5,
        tradeIntervalSec: 4.0,
        tradeSpeedMult: 1.35,
        energyRequired: 5
      },
      trade_rocket_3: {
        cost: { credits: 480 },
        bricksPerLaunch: 25,
        creditsPerBrick: 6,
        tradeIntervalSec: 2.5,
        tradeSpeedMult: 1.75,
        energyRequired: 10
      },

      // Science
      research_center: {
        cost: { credits: 150 },
        researchPerSec: 0.25,
        maxPerPlanet: 1,
        energyRequired: 1
      },
      research_lab: {
        cost: { credits: 200 },
        researchPerSec: 0.5,
        energyRequired: 2
      },
      observatory: {
        cost: { credits: 340 },
        researchPerSec: 1.2,
        energyRequired: 5
      },
      quantum_array: {
        cost: { credits: 450 },
        researchPerSec: 3.5,
        energyRequired: 12
      },

      // Colony Housing
      small_house: {
        cost: { credits: 75 },
        citizenSlots: 2
      },
      big_house: {
        cost: { credits: 200 },
        citizenSlots: 6
      },
      villa: {
        cost: { credits: 450 },
        citizenSlots: 15
      },

      // Solar Power
      solar_panel: {
        cost: { credits: 50 },
        energySlots: 3
      },
      solar_array: {
        cost: { credits: 160 },
        energySlots: 8
      },
      solar_tower: {
        cost: { credits: 400 },
        energySlots: 20
      },

      // Wind Power
      windmill: {
        cost: { credits: 120 },
        energySlots: 6
      },
      wind_turbine: {
        cost: { credits: 280 },
        energySlots: 16
      },
      wind_farm: {
        cost: { credits: 480 },
        energySlots: 35
      },

      // Interplanetary Space Rockets
      space_rocket_1: {
        cost: { credits: 450 },
        rocketTier: 1,
        rocketCitizens: 4,
        rocketMaxBricks: 200
      },
      space_rocket_2: {
        cost: { credits: 500 },
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

      // Planetary
      surface_surveying: { cost: 25, bricksBonus: 0.15, researchBonus: 0.15 },
      oceanic_adaptation: { cost: 55, energyBonus: 0.20, citizenBonus: 0.20 },
      volcanic_shielding: { cost: 90, bricksBonus: 0.30, energyBonus: 0.30, citizenBonus: 0.30, researchBonus: 0.30 },

      // Aerospace
      hull_metallurgy: { cost: 40, researchBonus: 0.15 },
      cryo_propellant: { cost: 80, energyBonus: 0.20 },
      orbital_rocketry: { cost: 140 },
      heavy_starship: { cost: 240 }
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
