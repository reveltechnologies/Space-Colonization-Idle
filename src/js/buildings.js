/**
 * Space Colonization: Idle
 * Building Menu UI Controller & Procedural 3D Colony Building Renderer
 */

(function () {
  "use strict";

  const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "power", label: "Power" },
    { id: "mining", label: "Mining" },
    { id: "colony", label: "Colony" },
    { id: "science", label: "Science" }
  ];

  const BUILDINGS = [
    {
      id: "mine",
      name: "Mine",
      category: "mining",
      tag: "Mining",
      accent: "#ffb13b",
      iconSrc: "./assets/ui/bld-mine.svg"
    },
    {
      id: "research_lab",
      name: "Research Lab",
      category: "science",
      tag: "Science",
      accent: "#37a8ff",
      iconSrc: "./assets/ui/bld-research-lab.svg"
    },
    {
      id: "house",
      name: "House",
      category: "colony",
      tag: "Colony",
      accent: "#ff6b5a",
      iconSrc: "./assets/ui/bld-house.svg"
    },
    {
      id: "windmill",
      name: "Windmill",
      category: "power",
      tag: "Power",
      accent: "#3fd6c4",
      iconSrc: "./assets/ui/bld-windmill.svg"
    },
    {
      id: "solar_panel",
      name: "Solar Panel",
      category: "power",
      tag: "Power",
      accent: "#ffc83a",
      iconSrc: "./assets/ui/bld-solar-panel.svg"
    }
  ];

  const BIOMES = {
    mountains: { id: "mountains", name: "Mountains", accent: "#94a3b8", badgeBg: "#edf4ff", iconSrc: "./assets/ui/biome-mountains.svg" },
    glacier:   { id: "glacier",   name: "Glacier",   accent: "#5fd8f8", badgeBg: "#e6faff", iconSrc: "./assets/ui/biome-glacier.svg" },
    highlands: { id: "highlands", name: "Highlands", accent: "#a78bfa", badgeBg: "#f2eeff", iconSrc: "./assets/ui/biome-highlands.svg" },
    crater:    { id: "crater",    name: "Crater",    accent: "#7c8ba8", badgeBg: "#eceff8", iconSrc: "./assets/ui/biome-crater.svg" },
    forest:    { id: "forest",    name: "Forest",    accent: "#22c55e", badgeBg: "#e8fce9", iconSrc: "./assets/ui/biome-forest.svg" },
    plains:    { id: "plains",    name: "Plains",    accent: "#84e148", badgeBg: "#f2ffe4", iconSrc: "./assets/ui/biome-plains.svg" },
    ocean:     { id: "ocean",     name: "Ocean",     accent: "#37a8ff", badgeBg: "#e3f5ff", iconSrc: "./assets/ui/biome-ocean.svg" },
    lava:      { id: "lava",      name: "Lava",      accent: "#ff8c2a", badgeBg: "#fff0dc", iconSrc: "./assets/ui/biome-lava.svg" },
    volcano:   { id: "volcano",   name: "Volcano",   accent: "#ff5a4d", badgeBg: "#ffe8e6", iconSrc: "./assets/ui/biome-volcano.svg" },
    canyon:    { id: "canyon",    name: "Canyon",    accent: "#e87d3e", badgeBg: "#ffefe3", iconSrc: "./assets/ui/biome-canyon.svg" },
    ashlands:  { id: "ashlands",  name: "Ashlands",  accent: "#8d7ab8", badgeBg: "#f0ecf9", iconSrc: "./assets/ui/biome-ashlands.svg" }
  };

  function getBiome(biomeId) {
    return (biomeId && BIOMES[biomeId]) || BIOMES.highlands;
  }

  // --- Drawer UI References & State ---

  const drawerEl = document.getElementById("build-drawer");
  const biomeBadgeEl = document.getElementById("build-biome-badge");
  const biomeIconEl = document.getElementById("build-biome-icon");
  const titleEl = document.getElementById("build-tile-title");
  const categoriesEl = document.getElementById("build-categories");
  const listEl = document.getElementById("build-list");
  const closeBtn = document.getElementById("btn-close-build");
  const removeBtn = document.getElementById("btn-remove-building");

  let activeCategory = "all";
  let currentPlanetId = 0;
  let currentTileId = null;
  let currentPlacedId = null;
  let currentBiomeId = null;
  let menuOpen = false;
  let callbacks = {
    onPlace: null,
    onRemove: null,
    onClose: null
  };

  function renderCategories() {
    if (!categoriesEl) return;
    categoriesEl.innerHTML = "";

    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "build-cat-btn" + (cat.id === activeCategory ? " active" : "");
      btn.textContent = cat.label;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", cat.id === activeCategory ? "true" : "false");
      btn.setAttribute("data-category", cat.id);
      btn.addEventListener("click", function () {
        activeCategory = cat.id;
        renderCategories();
        renderBuildingCards();
      });
      categoriesEl.appendChild(btn);
    }
  }

  function renderBuildingCards() {
    if (!listEl) return;
    listEl.innerHTML = "";

    for (let i = 0; i < BUILDINGS.length; i++) {
      const b = BUILDINGS[i];
      if (activeCategory !== "all" && b.category !== activeCategory) {
        continue;
      }

      const isBuilt = currentPlacedId === b.id;
      const card = document.createElement("button");
      card.type = "button";
      card.className = "build-card" + (isBuilt ? " is-built" : "");
      card.setAttribute("data-building", b.id);
      card.setAttribute("data-category", b.category);
      card.style.setProperty("--cat-accent", b.accent);

      const preview = document.createElement("span");
      preview.className = "build-card-preview";
      const icon = document.createElement("img");
      icon.className = "build-card-icon";
      icon.src = b.iconSrc;
      icon.alt = "";
      icon.draggable = false;
      preview.appendChild(icon);

      const info = document.createElement("span");
      info.className = "build-card-info";

      const nameEl = document.createElement("span");
      nameEl.className = "build-card-name";
      nameEl.textContent = b.name;

      const tagEl = document.createElement("span");
      tagEl.className = "build-card-tag";
      tagEl.textContent = b.tag;
      tagEl.style.background = b.accent;

      info.appendChild(nameEl);
      info.appendChild(tagEl);

      const actionBtn = document.createElement("span");
      actionBtn.className = "build-card-action";
      actionBtn.textContent = isBuilt ? "BUILT" : "BUILD";

      card.appendChild(preview);
      card.appendChild(info);
      card.appendChild(actionBtn);

      card.addEventListener("click", function () {
        if (typeof callbacks.onPlace === "function") {
          callbacks.onPlace(b.id);
        }
      });

      listEl.appendChild(card);
    }
  }

  function syncRemoveButton() {
    if (removeBtn) {
      removeBtn.classList.toggle("is-hidden", !currentPlacedId);
    }
  }

  function openForTile(planetId, tileId, placedBuildingId, biomeId) {
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

    syncRemoveButton();
    renderCategories();
    renderBuildingCards();
    if (listEl) {
      listEl.scrollTop = 0;
    }

    menuOpen = true;
    if (drawerEl) {
      drawerEl.setAttribute("data-biome", biome.id);
      drawerEl.classList.add("is-open");
      drawerEl.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("build-menu-open");
  }

  function updateCurrentBuilding(placedBuildingId) {
    currentPlacedId = placedBuildingId || null;
    syncRemoveButton();
    if (menuOpen) {
      renderBuildingCards();
    }
  }

  function close(notifyHandler) {
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
    const isBottomSheet = window.innerWidth < 520 || window.innerHeight > window.innerWidth;
    return {
      open: true,
      mode: isBottomSheet ? "bottom" : "right",
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
      if (typeof callbacks.onRemove === "function") {
        callbacks.onRemove();
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

  function buildHouseModel(m, time, phase, pxScale) {
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

  function renderBuilding3D(ctx, buildingId, frame, time, buildScale, opts) {
    if (!ctx || !frame) return;

    const collector = createMeshCollector(frame, buildScale, opts);
    const pxScale = frame.scale * (frame.focalLength / 3.8);
    const phase = frame.phase || 0;

    if (buildingId === "mine") {
      buildMineModel(collector, time, phase, pxScale);
    } else if (buildingId === "research_lab") {
      buildResearchLabModel(collector, time, phase, pxScale);
    } else if (buildingId === "house") {
      buildHouseModel(collector, time, phase, pxScale);
    } else if (buildingId === "windmill") {
      buildWindmillModel(collector, time, phase, pxScale);
    } else if (buildingId === "solar_panel") {
      buildSolarPanelModel(collector, time, phase, pxScale);
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
      research_lab: 0.38,
      house: 0.36,
      windmill: 0.75,
      solar_panel: 0.32
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
    }
  }

  window.GameBuildings = {
    CATEGORIES: CATEGORIES,
    BUILDINGS: BUILDINGS,
    BIOMES: BIOMES,
    getBiome: getBiome,
    setHandlers: setHandlers,
    openForTile: openForTile,
    updateCurrentBuilding: updateCurrentBuilding,
    close: close,
    isOpen: isOpen,
    getLayoutBounds: getLayoutBounds,
    renderBuilding3D: renderBuilding3D,
    renderTileEffect: renderTileEffect
  };
})();
