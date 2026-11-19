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

  // --- Drawer UI References & State ---

  const drawerEl = document.getElementById("build-drawer");
  const planetBadgeEl = document.getElementById("build-planet-badge");
  const titleEl = document.getElementById("build-tile-title");
  const categoriesEl = document.getElementById("build-categories");
  const listEl = document.getElementById("build-list");
  const closeBtn = document.getElementById("btn-close-build");
  const removeBtn = document.getElementById("btn-remove-building");

  let activeCategory = "all";
  let currentPlanetId = 0;
  let currentTileId = null;
  let currentPlacedId = null;
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

  function openForTile(planetId, tileId, placedBuildingId) {
    currentPlanetId = planetId;
    currentTileId = tileId;
    currentPlacedId = placedBuildingId || null;

    if (planetBadgeEl) {
      planetBadgeEl.textContent = "Planet " + (planetId + 1);
    }
    if (titleEl) {
      titleEl.textContent = "Tile #" + tileId;
    }

    syncRemoveButton();
    renderCategories();
    renderBuildingCards();
    if (listEl) {
      listEl.scrollTop = 0;
    }

    menuOpen = true;
    if (drawerEl) {
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

  function createMeshCollector(frame, buildScale) {
    const primitives = [];
    const s = frame.scale * Math.max(0.05, buildScale);
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
      return {
        x: ox + (t.x * lx + b.x * ly + n.x * lz) * s,
        y: oy + (t.y * lx + b.y * ly + n.y * lz) * s,
        z: oz + (t.z * lx + b.z * ly + n.z * lz) * s
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

  function renderBuilding3D(ctx, buildingId, frame, time, buildScale) {
    if (!ctx || !frame) return;

    const collector = createMeshCollector(frame, buildScale);
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

  window.GameBuildings = {
    CATEGORIES: CATEGORIES,
    BUILDINGS: BUILDINGS,
    setHandlers: setHandlers,
    openForTile: openForTile,
    updateCurrentBuilding: updateCurrentBuilding,
    close: close,
    isOpen: isOpen,
    getLayoutBounds: getLayoutBounds,
    renderBuilding3D: renderBuilding3D
  };
})();
