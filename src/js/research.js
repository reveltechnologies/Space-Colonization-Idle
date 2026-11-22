/**
 * Space Colonization: Idle
 * Research Points Accumulation, Multipliers, Category-Tabbed Progression Track & Modal Controller
 */

(function () {
  "use strict";

  function t(key, params) {
    if (window.GameLang && typeof window.GameLang.t === "function") {
      return window.GameLang.t(key, params);
    }
    return String(key || "");
  }

  const RESEARCH_CATEGORIES = [
    {
      id: "mining",
      labelKey: "research.categories.mining",
      iconSrc: "./assets/ui/cat-mining.svg",
      accent: "#ffb13b"
    },
    {
      id: "power",
      labelKey: "research.categories.power",
      iconSrc: "./assets/ui/cat-power.svg",
      accent: "#ffc83a"
    },
    {
      id: "colony",
      labelKey: "research.categories.colony",
      iconSrc: "./assets/ui/cat-colony.svg",
      accent: "#ff6b5a"
    },
    {
      id: "science",
      labelKey: "research.categories.science",
      iconSrc: "./assets/ui/cat-science.svg",
      accent: "#37a8ff"
    },
    {
      id: "planetary",
      labelKey: "research.categories.planetary",
      iconSrc: "./assets/ui/planet-oceanic.svg",
      accent: "#38bdf8"
    },
    {
      id: "aerospace",
      labelKey: "research.categories.aerospace",
      iconSrc: "./assets/ui/bld-space-rocket-1.svg",
      accent: "#f43f5e"
    }
  ];

  const RESEARCH_NODES = [
    // Mining
    {
      id: "reinforced_masonry",
      category: "mining",
      order: 1,
      cost: 15,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/icon-bricks.svg",
      accent: "#e85d3f"
    },
    {
      id: "cryo_drilling",
      category: "mining",
      order: 2,
      cost: 35,
      requiredPlanetType: "rocky",
      prereq: "reinforced_masonry",
      iconSrc: "./assets/ui/bld-deep-mine.svg",
      accent: "#cbd5e1"
    },
    {
      id: "thermal_sintering",
      category: "mining",
      order: 3,
      cost: 60,
      requiredPlanetType: "volcanic",
      prereq: "cryo_drilling",
      iconSrc: "./assets/ui/bld-mega-quarry.svg",
      accent: "#fb923c"
    },
    {
      id: "mantle_excavation",
      category: "mining",
      order: 4,
      cost: 95,
      requiredPlanetType: "rocky",
      prereq: "thermal_sintering",
      iconSrc: "./assets/ui/bld-mine.svg",
      accent: "#f59e0b"
    },

    // Power
    {
      id: "solar_cells",
      category: "power",
      order: 1,
      cost: 15,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/bld-solar-panel.svg",
      accent: "#ffc83a"
    },
    {
      id: "hydro_grid",
      category: "power",
      order: 2,
      cost: 40,
      requiredPlanetType: "oceanic",
      prereq: "solar_cells",
      iconSrc: "./assets/ui/icon-energy.svg",
      accent: "#38bdf8"
    },
    {
      id: "superconductors",
      category: "power",
      order: 3,
      cost: 75,
      requiredPlanetType: "volcanic",
      prereq: "hydro_grid",
      iconSrc: "./assets/ui/bld-solar-tower.svg",
      accent: "#ff7b1c"
    },

    // Colony
    {
      id: "habitat_insulation",
      category: "colony",
      order: 1,
      cost: 15,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/bld-house.svg",
      accent: "#ff6b5a"
    },
    {
      id: "biodome_recycling",
      category: "colony",
      order: 2,
      cost: 40,
      requiredPlanetType: "oceanic",
      prereq: "habitat_insulation",
      iconSrc: "./assets/ui/bld-big-house.svg",
      accent: "#22c55e"
    },
    {
      id: "arcology_habitats",
      category: "colony",
      order: 3,
      cost: 75,
      requiredPlanetType: "rocky",
      prereq: "biodome_recycling",
      iconSrc: "./assets/ui/bld-villa.svg",
      accent: "#14b8a6"
    },

    // Science
    {
      id: "orbital_telemetry",
      category: "science",
      order: 1,
      cost: 20,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/icon-research.svg",
      accent: "#38bdf8"
    },
    {
      id: "stellar_optics",
      category: "science",
      order: 2,
      cost: 45,
      requiredPlanetType: "volcanic",
      prereq: "orbital_telemetry",
      iconSrc: "./assets/ui/bld-observatory.svg",
      accent: "#6366f1"
    },
    {
      id: "quantum_computing",
      category: "science",
      order: 3,
      cost: 70,
      requiredPlanetType: "oceanic",
      prereq: "stellar_optics",
      iconSrc: "./assets/ui/bld-quantum-array.svg",
      accent: "#ec4899",
      unlocksBuilding: "quantum_array"
    },
    {
      id: "neural_archivists",
      category: "science",
      order: 4,
      cost: 110,
      requiredPlanetType: "rocky",
      prereq: "quantum_computing",
      iconSrc: "./assets/ui/bld-research-center.svg",
      accent: "#a855f7"
    },
    {
      id: "ore_synthesis",
      category: "science",
      order: 5,
      cost: 280,
      requiredPlanetType: "volcanic",
      prereq: "neural_archivists",
      iconSrc: "./assets/ui/bld-ore-research-station.svg",
      accent: "#22d3ee",
      unlocksBuilding: "ore_research_station"
    },

    // Planetary
    {
      id: "surface_surveying",
      category: "planetary",
      order: 1,
      cost: 25,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/terrain-surface.svg",
      accent: "#84e148"
    },
    {
      id: "oceanic_adaptation",
      category: "planetary",
      order: 2,
      cost: 55,
      requiredPlanetType: "oceanic",
      prereq: "surface_surveying",
      iconSrc: "./assets/ui/planet-oceanic.svg",
      accent: "#38bdf8"
    },
    {
      id: "volcanic_shielding",
      category: "planetary",
      order: 3,
      cost: 90,
      requiredPlanetType: "volcanic",
      prereq: "oceanic_adaptation",
      iconSrc: "./assets/ui/planet-volcanic.svg",
      accent: "#fb923c"
    },

    // Aerospace (High-tier unlocks for Space Rocket I & II)
    {
      id: "hull_metallurgy",
      category: "aerospace",
      order: 1,
      cost: 40,
      requiredPlanetType: "rocky",
      prereq: null,
      iconSrc: "./assets/ui/icon-ore.svg",
      accent: "#cbd5e1"
    },
    {
      id: "cryo_propellant",
      category: "aerospace",
      order: 2,
      cost: 80,
      requiredPlanetType: "rocky",
      prereq: "hull_metallurgy",
      iconSrc: "./assets/ui/biome-glacier.svg",
      accent: "#5fd8f8"
    },
    {
      id: "orbital_rocketry",
      category: "aerospace",
      order: 3,
      cost: 140,
      requiredPlanetType: "rocky",
      prereq: "cryo_propellant",
      iconSrc: "./assets/ui/bld-space-rocket-1.svg",
      accent: "#ff5a4d",
      unlocksBuilding: "space_rocket_1"
    },
    {
      id: "heavy_starship",
      category: "aerospace",
      order: 4,
      cost: 240,
      requiredPlanetType: "oceanic",
      prereq: "orbital_rocketry",
      iconSrc: "./assets/ui/bld-space-rocket-2.svg",
      accent: "#f59e0b",
      unlocksBuilding: "space_rocket_2"
    },

    // Track 2: Solar Optics, Self-Sustaining Homes, Civic Decorations & Terraforming
    {
      id: "helio_optics",
      category: "power",
      track: 2,
      order: 1,
      cost: 30,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/bld-helio-mirror.svg",
      accent: "#fbbf24",
      unlocksBuilding: "helio_mirror"
    },
    {
      id: "solar_habitats",
      category: "power",
      track: 2,
      order: 2,
      cost: 55,
      requiredPlanetType: null,
      prereq: "helio_optics",
      iconSrc: "./assets/ui/bld-eco-dome.svg",
      accent: "#22c55e",
      unlocksBuilding: "eco_dome"
    },
    {
      id: "arcology_grids",
      category: "power",
      track: 2,
      order: 3,
      cost: 120,
      requiredPlanetType: "oceanic",
      prereq: "solar_habitats",
      iconSrc: "./assets/ui/bld-eco-arcology.svg",
      accent: "#14b8a6",
      unlocksBuilding: "eco_arcology"
    },
    {
      id: "civic_gardens",
      category: "colony",
      track: 2,
      order: 1,
      cost: 25,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/bld-botanical-garden.svg",
      accent: "#34d399",
      unlocksBuilding: "botanical_garden"
    },
    {
      id: "modular_prefabs",
      category: "colony",
      track: 2,
      order: 2,
      cost: 55,
      requiredPlanetType: null,
      prereq: "civic_gardens",
      iconSrc: "./assets/ui/bld-builders-plaza.svg",
      accent: "#f59e0b",
      unlocksBuilding: "builders_plaza"
    },
    {
      id: "civic_prosperity",
      category: "colony",
      track: 2,
      order: 3,
      cost: 95,
      requiredPlanetType: "oceanic",
      prereq: "modular_prefabs",
      citizenGrowthBonus: 0.30,
      iconSrc: "./assets/ui/icon-citizen.svg",
      accent: "#38bdf8"
    },
    {
      id: "planetary_terraforming",
      category: "planetary",
      track: 2,
      order: 1,
      cost: 45,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/bld-geo-terraformer.svg",
      accent: "#14b8a6",
      unlocksBuilding: "geo_terraformer"
    },
    {
      id: "crust_stabilization",
      category: "planetary",
      track: 2,
      order: 2,
      cost: 95,
      requiredPlanetType: "oceanic",
      prereq: "planetary_terraforming",
      bricksBonus: 0.20,
      energyBonus: 0.20,
      iconSrc: "./assets/ui/cat-terraforming.svg",
      accent: "#10b981"
    }
  ];

  if (window.GameEconomy && typeof window.GameEconomy.getResearchNode === "function") {
    for (let i = 0; i < RESEARCH_NODES.length; i++) {
      const node = RESEARCH_NODES[i];
      const econ = window.GameEconomy.getResearchNode(node.id);
      if (!econ) continue;
      for (const prop in econ) {
        if (Object.prototype.hasOwnProperty.call(econ, prop)) {
          node[prop] = econ[prop];
        }
      }
    }
  }

  const PLANET_DEFAULTS = {
    rocky: {
      nameKey: "planets.planet_1.default_name",
      iconSrc: "./assets/ui/planet-rocky.svg",
      accent: "#cbd5e1"
    },
    oceanic: {
      nameKey: "planets.planet_2.default_name",
      iconSrc: "./assets/ui/planet-oceanic.svg",
      accent: "#38bdf8"
    },
    volcanic: {
      nameKey: "planets.planet_3.default_name",
      iconSrc: "./assets/ui/planet-volcanic.svg",
      accent: "#fb923c"
    }
  };

  const STARTING_RP =
    window.GameEconomy && typeof window.GameEconomy.get === "function"
      ? Number(window.GameEconomy.get("planets.startingResearchPoints", 0)) || 0
      : 0;
  let researchPoints = STARTING_RP;
  let currentRpPerSec = 0;
  const researched = Object.create(null);
  let modalOpen = false;
  let openedFromPlanet = null;
  let activeCategoryId = "mining";
  let selectedNodeId = null;
  let planetProvider = null;
  const listeners = [];

  let lastRenderedRpInt = -1;
  let lastRenderedRateText = "";

  const modalEl = document.getElementById("research-modal");
  const backdropEl = modalEl ? modalEl.querySelector(".research-modal-backdrop") : null;
  const terminalPillEl = document.getElementById("research-terminal-pill");
  const rpValEl = document.getElementById("val-research-points");
  const rpRateEl = document.getElementById("rate-research-points");
  const closeBtn = document.getElementById("btn-close-research");
  const categoriesEl = document.getElementById("research-categories");
  const treeBodyEl = document.getElementById("research-tree-body");
  const detailPanelEl = document.getElementById("research-detail-panel");

  function notifyChange() {
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }

  function onChange(fn) {
    if (typeof fn === "function") {
      listeners.push(fn);
    }
  }

  function setPlanetProvider(fn) {
    planetProvider = typeof fn === "function" ? fn : null;
  }

  function getNode(id) {
    for (let i = 0; i < RESEARCH_NODES.length; i++) {
      if (RESEARCH_NODES[i].id === id) {
        return RESEARCH_NODES[i];
      }
    }
    return null;
  }

  function isResearched(id) {
    return Boolean(id && researched[id]);
  }

  function getResearchForBuilding(buildingId) {
    for (let i = 0; i < RESEARCH_NODES.length; i++) {
      if (RESEARCH_NODES[i].unlocksBuilding === buildingId) {
        return RESEARCH_NODES[i];
      }
    }
    return null;
  }

  function isBuildingUnlocked(buildingId) {
    const req = getResearchForBuilding(buildingId);
    if (!req) return true;
    return isResearched(req.id);
  }

  function sumResearchedBonus(bonusKey) {
    let mult = 1;
    for (let i = 0; i < RESEARCH_NODES.length; i++) {
      const node = RESEARCH_NODES[i];
      if (isResearched(node.id) && node[bonusKey]) {
        mult += node[bonusKey];
      }
    }
    return mult;
  }

  function getBrickMultiplier(buildingId) {
    let mult = 1;
    const isDeepOrMega = buildingId === "deep_mine" || buildingId === "mega_quarry";
    for (let i = 0; i < RESEARCH_NODES.length; i++) {
      const node = RESEARCH_NODES[i];
      if (!isResearched(node.id)) continue;
      if (node.bricksBonus) mult += node.bricksBonus;
      if (isDeepOrMega && node.deepMegaBricksBonus) mult += node.deepMegaBricksBonus;
    }
    return mult;
  }

  function getResearchMultiplier() {
    return sumResearchedBonus("researchBonus");
  }

  function getEnergyMultiplier() {
    return sumResearchedBonus("energyBonus");
  }

  function getCitizenMultiplier() {
    return sumResearchedBonus("citizenBonus");
  }

  function getCitizenGrowthMultiplier() {
    return sumResearchedBonus("citizenGrowthBonus");
  }

  function formatNumber(val) {
    if (window.GameCurrencies && typeof window.GameCurrencies.formatNumber === "function") {
      return window.GameCurrencies.formatNumber(val);
    }
    return String(Math.floor(val || 0));
  }

  function formatRate(perSec) {
    if (window.GameBuildings && typeof window.GameBuildings.formatProductionRate === "function") {
      return window.GameBuildings.formatProductionRate(perSec);
    }
    return perSec > 0 ? "+" + perSec.toFixed(1) + "/s" : "";
  }

  function resolvePlanetMeta(typeId) {
    const def = PLANET_DEFAULTS[typeId];
    const fallbackName = def ? t(def.nameKey) : t("planets.planet_1.default_name");
    if (typeof planetProvider === "function") {
      const list = planetProvider();
      if (Array.isArray(list)) {
        for (let i = 0; i < list.length; i++) {
          if (list[i] && list[i].typeId === typeId) {
            return {
              name: list[i].name || list[i].defaultName || fallbackName,
              iconSrc: list[i].iconSrc,
              accent: list[i].accent
            };
          }
        }
      }
    }
    if (def) {
      return {
        name: fallbackName,
        iconSrc: def.iconSrc,
        accent: def.accent
      };
    }
    return {
      name: fallbackName,
      iconSrc: "./assets/ui/planet-rocky.svg",
      accent: "#cbd5e1"
    };
  }

  function getPlanetNameParams() {
    return {
      planet_1: resolvePlanetMeta("rocky").name,
      planet_2: resolvePlanetMeta("oceanic").name,
      planet_3: resolvePlanetMeta("volcanic").name
    };
  }

  function getNodeName(id) {
    return t("research.nodes." + id + ".name", getPlanetNameParams());
  }

  function getNodeEffect(id) {
    return t("research.nodes." + id + ".effect");
  }

  function getNodeDescription(id) {
    return t("research.nodes." + id + ".description", getPlanetNameParams());
  }

  function showToast(html) {
    if (window.GameBuildings && typeof window.GameBuildings.showErrorToast === "function") {
      window.GameBuildings.showErrorToast(html);
    }
  }

  function syncRpHeader(force) {
    const shownInt = Math.floor(researchPoints);
    const rateText = formatRate(currentRpPerSec);
    const changed = force || shownInt !== lastRenderedRpInt || rateText !== lastRenderedRateText;
    if (!changed) return false;

    lastRenderedRpInt = shownInt;
    lastRenderedRateText = rateText;

    if (rpValEl) {
      rpValEl.textContent = formatNumber(shownInt);
    }
    if (rpRateEl) {
      rpRateEl.textContent = rateText;
    }
    return true;
  }

  function renderTerminalPill() {
    if (!terminalPillEl || !openedFromPlanet) return;
    terminalPillEl.innerHTML = "";
    const img = document.createElement("img");
    img.className = "research-terminal-icon";
    img.src = openedFromPlanet.iconSrc;
    img.alt = "";
    img.draggable = false;
    const lbl = document.createElement("span");
    lbl.className = "research-terminal-label";
    const resolvedName =
      openedFromPlanet.name ||
      resolvePlanetMeta(openedFromPlanet.typeId).name ||
      t("planets.planet_1.default_name");
    lbl.textContent = t("research.terminal_from", {
      planet: resolvedName
    });
    terminalPillEl.style.setProperty("--terminal-accent", openedFromPlanet.accent || "#38bdf8");
    terminalPillEl.appendChild(img);
    terminalPillEl.appendChild(lbl);
  }

  function attemptPurchase(node, shakeTargetEl) {
    if (!node || isResearched(node.id)) return;

    const nodeName = getNodeName(node.id);
    const prereqMet = !node.prereq || isResearched(node.prereq);
    const planetMet =
      !node.requiredPlanetType ||
      (openedFromPlanet && openedFromPlanet.typeId === node.requiredPlanetType);
    const affordable = researchPoints >= node.cost;

    if (!prereqMet || !planetMet || !affordable) {
      if (shakeTargetEl) {
        shakeTargetEl.classList.remove("is-shake");
        void shakeTargetEl.offsetWidth;
        shakeTargetEl.classList.add("is-shake");
        window.setTimeout(function () {
          shakeTargetEl.classList.remove("is-shake");
        }, 280);
      }

      const iconImg = '<img class="game-toast-icon" src="' + node.iconSrc + '" alt="" draggable="false" />';
      const nodeStrong = '<strong class="game-toast-strong">' + nodeName + "</strong>";

      if (!prereqMet) {
        const prereqNode = getNode(node.prereq);
        const prereqPill =
          '<span class="game-toast-pill">' +
          (prereqNode
            ? '<img class="game-toast-pill-icon" src="' + prereqNode.iconSrc + '" alt="" draggable="false" /> '
            : "") +
          getNodeName(node.prereq) +
          "</span>";
        showToast(
          "<span>" +
            iconImg +
            t("toast.research_need_prereq", { prereq: prereqPill, research: nodeStrong }) +
            "</span>"
        );
      } else if (!planetMet) {
        const pMeta = resolvePlanetMeta(node.requiredPlanetType);
        const planetPill =
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="' +
          pMeta.iconSrc +
          '" alt="" draggable="false" /> ' +
          pMeta.name +
          "</span>";
        showToast(
          "<span>" +
            iconImg +
            t("toast.research_wrong_planet", { research: nodeStrong, planet: planetPill }) +
            "</span>"
        );
      } else {
        const diff = Math.max(1, Math.ceil(node.cost - researchPoints));
        const missingPill =
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="./assets/ui/icon-research.svg" alt="" draggable="false" /> ' +
          formatNumber(diff) +
          " " +
          t("research.rp_unit") +
          "</span>";
        showToast(
          "<span>" +
            iconImg +
            t("toast.research_need_rp", { missing: missingPill, research: nodeStrong }) +
            "</span>"
        );
      }
      return;
    }

    researchPoints = Math.max(0, researchPoints - node.cost);
    researched[node.id] = true;
    syncRpHeader(true);
    renderCategories();
    renderTree();
    renderDetailPanel();
    notifyChange();
    if (window.GameSave && typeof window.GameSave.requestSave === "function") {
      window.GameSave.requestSave("research_purchase", true);
    }
  }

  function renderCategories() {
    if (!categoriesEl) return;
    categoriesEl.innerHTML = "";

    for (let i = 0; i < RESEARCH_CATEGORIES.length; i++) {
      const cat = RESEARCH_CATEGORIES[i];
      let total = 0;
      let doneCount = 0;
      for (let k = 0; k < RESEARCH_NODES.length; k++) {
        if (RESEARCH_NODES[k].category === cat.id) {
          total++;
          if (isResearched(RESEARCH_NODES[k].id)) {
            doneCount++;
          }
        }
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "research-cat-btn" + (cat.id === activeCategoryId ? " active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", cat.id === activeCategoryId ? "true" : "false");
      btn.setAttribute("data-research-category", cat.id);

      const icon = document.createElement("img");
      icon.className = "research-cat-icon";
      icon.src = cat.iconSrc;
      icon.alt = "";
      icon.draggable = false;

      const label = document.createElement("span");
      label.className = "research-cat-label";
      label.textContent = t(cat.labelKey);

      const count = document.createElement("span");
      count.className = "research-cat-count";
      count.textContent = doneCount + "/" + total;

      btn.appendChild(icon);
      btn.appendChild(label);
      btn.appendChild(count);

      btn.addEventListener("click", function () {
        if (activeCategoryId === cat.id) return;
        activeCategoryId = cat.id;
        selectedNodeId = null;
        renderCategories();
        renderTree();
        renderDetailPanel();
      });

      categoriesEl.appendChild(btn);
    }
  }

  function renderDetailPanel() {
    if (!detailPanelEl) return;
    const node = selectedNodeId ? getNode(selectedNodeId) : null;
    if (!node) {
      detailPanelEl.classList.add("is-hidden");
      detailPanelEl.innerHTML = "";
      return;
    }

    detailPanelEl.classList.remove("is-hidden");
    detailPanelEl.innerHTML = "";

    const done = isResearched(node.id);
    const prereqMet = !node.prereq || isResearched(node.prereq);
    const planetMet =
      !node.requiredPlanetType ||
      (openedFromPlanet && openedFromPlanet.typeId === node.requiredPlanetType);
    const affordable = researchPoints >= node.cost;
    const canBuy = !done && prereqMet && planetMet && affordable;

    const card = document.createElement("div");
    card.className =
      "research-detail-card" +
      (done ? " is-researched" : "") +
      (!done && !prereqMet ? " is-prereq-locked" : "") +
      (!done && prereqMet && !planetMet ? " is-wrong-planet" : "") +
      (!done && prereqMet && planetMet && !affordable ? " is-unaffordable" : "");
    card.style.setProperty("--node-accent", node.accent || "#38bdf8");

    const top = document.createElement("div");
    top.className = "research-detail-top";

    const stage = document.createElement("div");
    stage.className = "research-detail-stage";
    const icon = document.createElement("img");
    icon.className = "research-detail-icon";
    icon.src = node.iconSrc;
    icon.alt = "";
    icon.draggable = false;
    stage.appendChild(icon);
    top.appendChild(stage);

    const meta = document.createElement("div");
    meta.className = "research-detail-meta";

    const headRow = document.createElement("div");
    headRow.className = "research-detail-head";

    const title = document.createElement("h4");
    title.className = "research-detail-name";
    title.textContent = getNodeName(node.id);
    headRow.appendChild(title);

    const effectBadge = document.createElement("span");
    effectBadge.className = "research-effect-chip";
    effectBadge.textContent = getNodeEffect(node.id);
    headRow.appendChild(effectBadge);

    meta.appendChild(headRow);

    const badges = document.createElement("div");
    badges.className = "research-node-badges";

    if (node.requiredPlanetType) {
      const pMeta = resolvePlanetMeta(node.requiredPlanetType);
      const pChip = document.createElement("span");
      pChip.className = "research-planet-badge " + (planetMet || done ? "is-met" : "is-required");
      const pImg = document.createElement("img");
      pImg.className = "research-badge-icon";
      pImg.src = pMeta.iconSrc;
      pImg.alt = "";
      pImg.draggable = false;
      const pLbl = document.createElement("span");
      pLbl.textContent = t("research.requires_planet", {
        planet: pMeta.name
      });
      pChip.appendChild(pImg);
      pChip.appendChild(pLbl);
      badges.appendChild(pChip);
    } else {
      const anyChip = document.createElement("span");
      anyChip.className = "research-planet-badge is-any";
      anyChip.textContent = t("research.any_planet");
      badges.appendChild(anyChip);
    }

    if (node.prereq && !done) {
      const preChip = document.createElement("span");
      preChip.className = "research-prereq-badge " + (prereqMet ? "is-met" : "is-missing");
      preChip.textContent = t("research.requires_prereq", { prereq: getNodeName(node.prereq) });
      badges.appendChild(preChip);
    }

    meta.appendChild(badges);

    const desc = document.createElement("p");
    desc.className = "research-detail-desc";
    desc.textContent = getNodeDescription(node.id);
    meta.appendChild(desc);

    top.appendChild(meta);

    const closeDetailBtn = document.createElement("button");
    closeDetailBtn.type = "button";
    closeDetailBtn.className = "research-detail-close";
    closeDetailBtn.setAttribute("aria-label", t("research.close_details"));
    const closeImg = document.createElement("img");
    closeImg.src = "./assets/ui/icon-close.svg";
    closeImg.alt = "";
    closeImg.draggable = false;
    closeDetailBtn.appendChild(closeImg);
    closeDetailBtn.addEventListener("click", function () {
      selectedNodeId = null;
      renderTree();
      renderDetailPanel();
    });
    top.appendChild(closeDetailBtn);

    card.appendChild(top);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "research-node-btn";
    btn.setAttribute("aria-disabled", canBuy || done ? "false" : "true");

    if (done) {
      btn.textContent = t("research.btn_researched");
    } else {
      const btnLbl = document.createElement("span");
      btnLbl.className = "research-node-btn-label";
      if (!prereqMet) {
        btnLbl.textContent = t("research.btn_locked");
      } else if (!planetMet) {
        const pMeta = resolvePlanetMeta(node.requiredPlanetType);
        btnLbl.textContent = t("research.btn_wrong_planet", { planet: pMeta.name });
      } else {
        btnLbl.textContent = t("research.btn_research");
      }

      const costWrap = document.createElement("span");
      costWrap.className = "research-node-cost" + (affordable ? "" : " is-short");
      const rpImg = document.createElement("img");
      rpImg.className = "research-cost-icon";
      rpImg.src = "./assets/ui/icon-research.svg";
      rpImg.alt = "";
      rpImg.draggable = false;
      const rpVal = document.createElement("span");
      rpVal.textContent = formatNumber(node.cost) + " " + t("research.rp_unit");
      costWrap.appendChild(rpImg);
      costWrap.appendChild(rpVal);

      btn.appendChild(btnLbl);
      btn.appendChild(costWrap);
    }

    btn.addEventListener("click", function () {
      attemptPurchase(node, card);
    });

    card.appendChild(btn);
    detailPanelEl.appendChild(card);
  }

  function renderTree() {
    if (!treeBodyEl) return;
    treeBodyEl.innerHTML = "";

    const tracksMap = Object.create(null);
    for (let i = 0; i < RESEARCH_NODES.length; i++) {
      const n = RESEARCH_NODES[i];
      if (n.category !== activeCategoryId) continue;
      const trackNum = n.track || 1;
      if (!tracksMap[trackNum]) {
        tracksMap[trackNum] = [];
      }
      tracksMap[trackNum].push(n);
    }

    const trackKeys = Object.keys(tracksMap)
      .map(function (k) { return Number(k); })
      .sort(function (a, b) { return a - b; });
    treeBodyEl.classList.toggle("is-multi-track", trackKeys.length > 1);

    for (let tIdx = 0; tIdx < trackKeys.length; tIdx++) {
      const catNodes = tracksMap[trackKeys[tIdx]];
      catNodes.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      });

      const track = document.createElement("div");
      track.className = "research-chain-track";

      for (let j = 0; j < catNodes.length; j++) {
        const node = catNodes[j];
        const done = isResearched(node.id);
        const prereqMet = !node.prereq || isResearched(node.prereq);
        const planetMet =
          !node.requiredPlanetType ||
          (openedFromPlanet && openedFromPlanet.typeId === node.requiredPlanetType);
        const affordable = researchPoints >= node.cost;
        const isSelected = selectedNodeId === node.id;

        if (j > 0) {
          const prevDone = isResearched(node.prereq || catNodes[j - 1].id);
          const conn = document.createElement("span");
          conn.className = "research-connector" + (prevDone ? " is-unlocked" : "");
          conn.setAttribute("aria-hidden", "true");
          track.appendChild(conn);
        }

        const nodeBtn = document.createElement("button");
        nodeBtn.type = "button";
        nodeBtn.className =
          "research-icon-node" +
          (done ? " is-researched" : "") +
          (!done && !prereqMet ? " is-prereq-locked" : "") +
          (!done && prereqMet && !planetMet ? " is-wrong-planet" : "") +
          (!done && prereqMet && planetMet && affordable ? " is-ready" : "") +
          (!done && prereqMet && planetMet && !affordable ? " is-unaffordable" : "") +
          (isSelected ? " is-selected" : "");
        nodeBtn.setAttribute("data-research", node.id);
        nodeBtn.setAttribute("aria-label", getNodeName(node.id));
        nodeBtn.style.setProperty("--node-accent", node.accent || "#38bdf8");

        const iconBox = document.createElement("span");
        iconBox.className = "research-icon-box";

        const stepBadge = document.createElement("span");
        stepBadge.className = "research-step-badge" + (done ? " is-done" : "");
        stepBadge.textContent = done ? "✓" : String(node.order || j + 1);
        iconBox.appendChild(stepBadge);

        const icon = document.createElement("img");
        icon.className = "research-icon-img";
        icon.src = node.iconSrc;
        icon.alt = "";
        icon.draggable = false;
        iconBox.appendChild(icon);

        if (node.requiredPlanetType) {
          const pMeta = resolvePlanetMeta(node.requiredPlanetType);
          const pBadge = document.createElement("span");
          pBadge.className = "research-mini-planet " + (planetMet || done ? "is-met" : "is-required");
          const pImg = document.createElement("img");
          pImg.src = pMeta.iconSrc;
          pImg.alt = "";
          pImg.draggable = false;
          pBadge.appendChild(pImg);
          iconBox.appendChild(pBadge);
        }

        if (!done && !prereqMet) {
          const lock = document.createElement("span");
          lock.className = "research-mini-status is-locked";
          lock.textContent = "🔒";
          iconBox.appendChild(lock);
        }

        const costChip = document.createElement("span");
        costChip.className = "research-icon-cost" + (!done && !affordable ? " is-short" : "");
        costChip.textContent = done ? "✓" : formatNumber(node.cost) + " " + t("research.rp_unit");

        nodeBtn.appendChild(iconBox);
        nodeBtn.appendChild(costChip);

        nodeBtn.addEventListener("click", function () {
          selectedNodeId = selectedNodeId === node.id ? null : node.id;
          renderTree();
          renderDetailPanel();
        });

        track.appendChild(nodeBtn);
      }

      treeBodyEl.appendChild(track);
    }
  }

  function open(planet) {
    const defMeta = resolvePlanetMeta("rocky");
    openedFromPlanet = planet
      ? {
          id: planet.id,
          name: planet.name || planet.defaultName || defMeta.name,
          typeId: planet.typeId,
          iconSrc: planet.iconSrc,
          accent: planet.accent
        }
      : {
          id: 0,
          name: defMeta.name,
          typeId: "rocky",
          iconSrc: "./assets/ui/planet-rocky.svg",
          accent: "#cbd5e1"
        };

    selectedNodeId = null;
    modalOpen = true;
    renderTerminalPill();
    syncRpHeader(true);
    renderCategories();
    renderTree();
    renderDetailPanel();

    if (modalEl) {
      modalEl.classList.remove("is-hidden");
      modalEl.classList.add("is-open");
      modalEl.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("research-modal-open");
  }

  function close() {
    if (!modalOpen && (!modalEl || !modalEl.classList.contains("is-open"))) {
      return;
    }
    modalOpen = false;
    selectedNodeId = null;
    if (modalEl) {
      modalEl.classList.remove("is-open");
      modalEl.classList.add("is-hidden");
      modalEl.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("research-modal-open");
  }

  function isOpen() {
    return modalOpen;
  }

  function syncAffordabilityState() {
    if (treeBodyEl) {
      const nodeBtns = treeBodyEl.querySelectorAll("[data-research]");
      for (let i = 0; i < nodeBtns.length; i++) {
        const nodeBtn = nodeBtns[i];
        const node = getNode(nodeBtn.getAttribute("data-research"));
        if (!node) continue;

        const done = isResearched(node.id);
        const prereqMet = !node.prereq || isResearched(node.prereq);
        const planetMet =
          !node.requiredPlanetType ||
          (openedFromPlanet && openedFromPlanet.typeId === node.requiredPlanetType);
        const affordable = researchPoints >= node.cost;

        nodeBtn.classList.toggle("is-ready", !done && prereqMet && planetMet && affordable);
        nodeBtn.classList.toggle("is-unaffordable", !done && prereqMet && planetMet && !affordable);

        const costChip = nodeBtn.querySelector(".research-icon-cost");
        if (costChip) {
          costChip.classList.toggle("is-short", !done && !affordable);
        }
      }
    }

    if (detailPanelEl && selectedNodeId) {
      const node = getNode(selectedNodeId);
      if (!node) return;

      const done = isResearched(node.id);
      const prereqMet = !node.prereq || isResearched(node.prereq);
      const planetMet =
        !node.requiredPlanetType ||
        (openedFromPlanet && openedFromPlanet.typeId === node.requiredPlanetType);
      const affordable = researchPoints >= node.cost;
      const canBuy = !done && prereqMet && planetMet && affordable;

      const card = detailPanelEl.querySelector(".research-detail-card");
      if (card) {
        card.classList.toggle("is-unaffordable", !done && prereqMet && planetMet && !affordable);
      }

      const costWrap = detailPanelEl.querySelector(".research-node-cost");
      if (costWrap) {
        costWrap.classList.toggle("is-short", !done && !affordable);
      }

      const btn = detailPanelEl.querySelector(".research-node-btn");
      if (btn) {
        btn.setAttribute("aria-disabled", canBuy || done ? "false" : "true");
      }
    }
  }

  function tick(dtSec, rpPerSec) {
    const rate = Math.max(0, Number(rpPerSec) || 0);
    currentRpPerSec = rate;
    if (rate > 0 && dtSec > 0) {
      researchPoints += rate * dtSec;
    }
    if (modalOpen) {
      const updated = syncRpHeader(false);
      if (updated) {
        syncAffordabilityState();
      }
    }
  }

  function addPoints(delta) {
    const val = Number(delta);
    if (!Number.isFinite(val) || val <= 0) return researchPoints;
    researchPoints = Math.max(0, researchPoints + val);
    if (modalOpen) {
      const updated = syncRpHeader(false);
      if (updated) {
        syncAffordabilityState();
      }
    }
    return researchPoints;
  }

  function exportState() {
    const list = [];
    const keys = Object.keys(researched);
    for (let i = 0; i < keys.length; i++) {
      const id = keys[i];
      if (researched[id] && getNode(id)) {
        list.push(id);
      }
    }
    list.sort();
    return {
      points: Math.max(0, Number(researchPoints) || 0),
      researched: list
    };
  }

  function importState(data) {
    const existingKeys = Object.keys(researched);
    for (let i = 0; i < existingKeys.length; i++) {
      delete researched[existingKeys[i]];
    }
    if (data && typeof data === "object") {
      if (data.points !== undefined && data.points !== null) {
        const pts = Number(data.points);
        researchPoints = Number.isFinite(pts) && pts >= 0 ? pts : STARTING_RP;
      } else {
        researchPoints = STARTING_RP;
      }
      if (Array.isArray(data.researched)) {
        for (let i = 0; i < data.researched.length; i++) {
          const id = data.researched[i];
          if (typeof id === "string" && getNode(id)) {
            researched[id] = true;
          }
        }
      }
    } else {
      researchPoints = STARTING_RP;
    }

    syncRpHeader(true);
    if (modalOpen) {
      renderCategories();
      renderTree();
      renderDetailPanel();
    }
    notifyChange();
  }

  function resetState() {
    const existingKeys = Object.keys(researched);
    for (let i = 0; i < existingKeys.length; i++) {
      delete researched[existingKeys[i]];
    }
    researchPoints = STARTING_RP;
    currentRpPerSec = 0;
    syncRpHeader(true);
    if (modalOpen) {
      renderCategories();
      renderTree();
      renderDetailPanel();
    }
    notifyChange();
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", close);
  }
  if (backdropEl) {
    backdropEl.addEventListener("click", close);
  }

  window.GameResearch = {
    CATEGORIES: RESEARCH_CATEGORIES,
    NODES: RESEARCH_NODES,
    open: open,
    close: close,
    isOpen: isOpen,
    tick: tick,
    addPoints: addPoints,
    getPoints: function () {
      return researchPoints;
    },
    getRate: function () {
      return currentRpPerSec;
    },
    isResearched: isResearched,
    getNode: getNode,
    isBuildingUnlocked: isBuildingUnlocked,
    getResearchForBuilding: getResearchForBuilding,
    getBrickMultiplier: getBrickMultiplier,
    getResearchMultiplier: getResearchMultiplier,
    getEnergyMultiplier: getEnergyMultiplier,
    getCitizenMultiplier: getCitizenMultiplier,
    getCitizenGrowthMultiplier: getCitizenGrowthMultiplier,
    setPlanetProvider: setPlanetProvider,
    onChange: onChange,
    exportState: exportState,
    importState: importState,
    resetState: resetState
  };
})();
