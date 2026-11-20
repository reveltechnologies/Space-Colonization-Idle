/**
 * Space Colonization: Idle
 * Research Points Accumulation, Multipliers, Categorized Icon Chains & Modal Controller
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
      id: "construction",
      labelKey: "research.categories.construction",
      iconSrc: "./assets/ui/icon-bricks.svg",
      accent: "#e85d3f"
    },
    {
      id: "colony",
      labelKey: "research.categories.colony",
      iconSrc: "./assets/ui/icon-citizen.svg",
      accent: "#14b8a6"
    },
    {
      id: "science",
      labelKey: "research.categories.science",
      iconSrc: "./assets/ui/icon-research.svg",
      accent: "#38bdf8"
    }
  ];

  const RESEARCH_NODES = [
    // Construction Chain
    {
      id: "reinforced_masonry",
      category: "construction",
      order: 1,
      cost: 15,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/icon-bricks.svg",
      accent: "#e85d3f",
      effect: { type: "brick_mult", value: 0.25 }
    },
    {
      id: "cryo_drilling",
      category: "construction",
      order: 2,
      cost: 35,
      requiredPlanetType: "rocky",
      prereq: "reinforced_masonry",
      iconSrc: "./assets/ui/bld-deep-mine.svg",
      accent: "#cbd5e1",
      effect: { type: "brick_mult", value: 0.35 }
    },
    {
      id: "thermal_sintering",
      category: "construction",
      order: 3,
      cost: 50,
      requiredPlanetType: "volcanic",
      prereq: "cryo_drilling",
      iconSrc: "./assets/ui/bld-mega-quarry.svg",
      accent: "#fb923c",
      effect: { type: "advanced_mine_mult", value: 0.50 }
    },

    // Colony Chain
    {
      id: "habitat_insulation",
      category: "colony",
      order: 1,
      cost: 15,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/bld-house.svg",
      accent: "#ff6b5a",
      effect: { type: "citizen_mult", value: 0.20 }
    },
    {
      id: "hydro_grid",
      category: "colony",
      order: 2,
      cost: 40,
      requiredPlanetType: "oceanic",
      prereq: "habitat_insulation",
      iconSrc: "./assets/ui/icon-energy.svg",
      accent: "#38bdf8",
      effect: { type: "energy_mult", value: 0.25 }
    },
    {
      id: "arcology_habitats",
      category: "colony",
      order: 3,
      cost: 75,
      requiredPlanetType: "rocky",
      prereq: "hydro_grid",
      iconSrc: "./assets/ui/bld-villa.svg",
      accent: "#14b8a6",
      effect: { type: "citizen_mult", value: 0.25 }
    },

    // Science Chain
    {
      id: "orbital_telemetry",
      category: "science",
      order: 1,
      cost: 20,
      requiredPlanetType: null,
      prereq: null,
      iconSrc: "./assets/ui/icon-research.svg",
      accent: "#38bdf8",
      effect: { type: "research_mult", value: 0.25 }
    },
    {
      id: "stellar_optics",
      category: "science",
      order: 2,
      cost: 45,
      requiredPlanetType: "volcanic",
      prereq: "orbital_telemetry",
      iconSrc: "./assets/ui/bld-observatory.svg",
      accent: "#6366f1",
      effect: { type: "research_mult", value: 0.35 }
    },
    {
      id: "quantum_computing",
      category: "science",
      order: 3,
      cost: 65,
      requiredPlanetType: "oceanic",
      prereq: "stellar_optics",
      iconSrc: "./assets/ui/bld-quantum-array.svg",
      accent: "#ec4899",
      unlocksBuilding: "quantum_array"
    }
  ];

  const PLANET_DEFAULTS = {
    rocky: {
      nameKey: "planets.planet_1.default_name",
      typeKey: "planets.planet_1.type_label",
      iconSrc: "./assets/ui/planet-rocky.svg",
      accent: "#cbd5e1"
    },
    oceanic: {
      nameKey: "planets.planet_2.default_name",
      typeKey: "planets.planet_2.type_label",
      iconSrc: "./assets/ui/planet-oceanic.svg",
      accent: "#38bdf8"
    },
    volcanic: {
      nameKey: "planets.planet_3.default_name",
      typeKey: "planets.planet_3.type_label",
      iconSrc: "./assets/ui/planet-volcanic.svg",
      accent: "#fb923c"
    }
  };

  let researchPoints = 0;
  let currentRpPerSec = 0;
  const researched = Object.create(null);
  let modalOpen = false;
  let openedFromPlanet = null;
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

  function getBrickMultiplier(buildingId) {
    let mult = 1;
    if (isResearched("reinforced_masonry")) mult += 0.25;
    if (isResearched("cryo_drilling")) mult += 0.35;
    if (isResearched("thermal_sintering") && (buildingId === "deep_mine" || buildingId === "mega_quarry")) {
      mult += 0.50;
    }
    return mult;
  }

  function getResearchMultiplier() {
    let mult = 1;
    if (isResearched("orbital_telemetry")) mult += 0.25;
    if (isResearched("stellar_optics")) mult += 0.35;
    return mult;
  }

  function getEnergyMultiplier() {
    return isResearched("hydro_grid") ? 1.25 : 1;
  }

  function getCitizenMultiplier() {
    let mult = 1;
    if (isResearched("habitat_insulation")) mult += 0.20;
    if (isResearched("arcology_habitats")) mult += 0.25;
    return mult;
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
    if (typeof planetProvider === "function") {
      const list = planetProvider();
      if (Array.isArray(list)) {
        for (let i = 0; i < list.length; i++) {
          if (list[i] && list[i].typeId === typeId) {
            return {
              name: list[i].name || list[i].defaultName,
              typeLabel: list[i].typeLabel || typeId,
              iconSrc: list[i].iconSrc,
              accent: list[i].accent
            };
          }
        }
      }
    }
    const def = PLANET_DEFAULTS[typeId];
    if (def) {
      return {
        name: t(def.nameKey),
        typeLabel: t(def.typeKey),
        iconSrc: def.iconSrc,
        accent: def.accent
      };
    }
    return {
      name: typeId,
      typeLabel: typeId,
      iconSrc: "./assets/ui/planet-rocky.svg",
      accent: "#cbd5e1"
    };
  }

  function getNodeName(id) {
    return t("research.nodes." + id + ".name");
  }

  function getNodeEffect(id) {
    return t("research.nodes." + id + ".effect");
  }

  function getNodeDescription(id) {
    return t("research.nodes." + id + ".description");
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
    lbl.textContent = t("research.terminal_from", {
      planet: openedFromPlanet.name,
      type: openedFromPlanet.typeLabel
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
          " (" +
          pMeta.typeLabel +
          ")</span>";
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
    renderTree();
    renderDetailPanel();
    notifyChange();
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
        planet: pMeta.name,
        type: pMeta.typeLabel
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

    for (let ci = 0; ci < RESEARCH_CATEGORIES.length; ci++) {
      const cat = RESEARCH_CATEGORIES[ci];
      const catNodes = [];
      for (let i = 0; i < RESEARCH_NODES.length; i++) {
        if (RESEARCH_NODES[i].category === cat.id) {
          catNodes.push(RESEARCH_NODES[i]);
        }
      }
      catNodes.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      });
      if (catNodes.length === 0) continue;

      const row = document.createElement("div");
      row.className = "research-category-row";
      row.style.setProperty("--cat-accent", cat.accent);

      const catTag = document.createElement("div");
      catTag.className = "research-category-tag";
      const catIcon = document.createElement("img");
      catIcon.className = "research-category-icon";
      catIcon.src = cat.iconSrc;
      catIcon.alt = "";
      catIcon.draggable = false;
      const catLbl = document.createElement("span");
      catLbl.className = "research-category-label";
      catLbl.textContent = t(cat.labelKey);
      catTag.appendChild(catIcon);
      catTag.appendChild(catLbl);
      row.appendChild(catTag);

      const chain = document.createElement("div");
      chain.className = "research-chain";

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
          const prevDone = isResearched(catNodes[j - 1].id);
          const conn = document.createElement("span");
          conn.className = "research-connector" + (prevDone ? " is-unlocked" : "");
          conn.setAttribute("aria-hidden", "true");
          chain.appendChild(conn);
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

        if (done) {
          const check = document.createElement("span");
          check.className = "research-mini-status is-done";
          check.textContent = "✓";
          iconBox.appendChild(check);
        } else if (!prereqMet) {
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

        chain.appendChild(nodeBtn);
      }

      row.appendChild(chain);
      treeBodyEl.appendChild(row);
    }
  }

  function open(planet) {
    openedFromPlanet = planet
      ? {
          id: planet.id,
          name: planet.name || planet.defaultName,
          typeId: planet.typeId,
          typeLabel: planet.typeLabel,
          iconSrc: planet.iconSrc,
          accent: planet.accent
        }
      : {
          id: 0,
          name: t("planets.planet_1.default_name"),
          typeId: "rocky",
          typeLabel: t("planets.planet_1.type_label"),
          iconSrc: "./assets/ui/planet-rocky.svg",
          accent: "#cbd5e1"
        };

    selectedNodeId = null;
    modalOpen = true;
    renderTerminalPill();
    syncRpHeader(true);
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

  function tick(dtSec, rpPerSec) {
    const rate = Math.max(0, Number(rpPerSec) || 0);
    currentRpPerSec = rate;
    if (rate > 0 && dtSec > 0) {
      researchPoints += rate * dtSec;
    }
    if (modalOpen) {
      const updated = syncRpHeader(false);
      if (updated) {
        renderTree();
        renderDetailPanel();
      }
    }
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
    setPlanetProvider: setPlanetProvider,
    onChange: onChange
  };
})();
