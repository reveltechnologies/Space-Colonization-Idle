/**
 * Space Colonization: Idle
 * 3D Rotating Geodesic Hex Spheres (Goldberg Polyhedra), Carousel & QoL Controls
 */

(function () {
  "use strict";

  const canvas = document.getElementById("planet-stage");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const dotsContainer = document.getElementById("planet-dots");
  const dotButtons = dotsContainer ? Array.from(dotsContainer.querySelectorAll(".planet-dot")) : [];
  const prevBtn = document.getElementById("btn-prev-planet");
  const nextBtn = document.getElementById("btn-next-planet");
  const zoomInBtn = document.getElementById("btn-zoom-in");
  const zoomOutBtn = document.getElementById("btn-zoom-out");
  const zoomLevelLabel = document.getElementById("zoom-level-label");
  const zoomGaugeFill = document.getElementById("zoom-gauge-fill");
  const planetStatsDeckEl = document.getElementById("planet-stats-deck");
  const planetDeckHeaderEl = document.getElementById("planet-deck-header");
  const renamePlanetBtn = document.getElementById("btn-rename-planet");
  const planetHudNameInputEl = document.getElementById("planet-hud-name-input");
  const planetHudEmblemEl = document.getElementById("planet-hud-emblem");
  const planetHudIconEl = document.getElementById("planet-hud-icon");
  const planetHudNameEl = document.getElementById("planet-hud-name");
  const citizensCurrEl = document.getElementById("val-citizens-curr");
  const citizensMaxEl = document.getElementById("val-citizens-max");
  const citizensStatBar = document.getElementById("planet-stat-citizens");
  const citizensMeterFillEl = document.getElementById("meter-citizens-fill");
  const energyCurrEl = document.getElementById("val-energy-curr");
  const energyMaxEl = document.getElementById("val-energy-max");
  const energyStatBar = document.getElementById("planet-stat-energy");
  const energyMeterFillEl = document.getElementById("meter-energy-fill");

  const PLANET_COUNT = 3;
  const PLANET_NAMES_STORAGE_KEY = "sci_planet_names_v1";
  const MAX_PLANET_NAME_LEN = 12;
  const CAM_DIST = 4.2;
  const MIN_ZOOM = 1.0;
  const MAX_ZOOM = 2.2;
  const ZOOM_STEP = 0.35;
  const DOUBLE_TAP_MS = 320;
  const IDLE_SPIN_DELAY_MS = 2500;
  const MAX_PITCH = 1.35;
  const PULSE_DURATION_MS = 360;

  // --- 3D Vector Math Helpers ---

  function vec3(x, y, z) {
    return { x: x, y: y, z: z };
  }

  function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  function sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  function scale(v, s) {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  }

  function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  function cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function len(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  function normalize(v) {
    const l = len(v) || 1;
    return { x: v.x / l, y: v.y / l, z: v.z / l };
  }

  const CAM_VEC = vec3(0, 0, CAM_DIST);
  const LIGHT_DIR = normalize(vec3(-0.60, 0.45, 0.66));
  const HALF_VEC = normalize(add(LIGHT_DIR, vec3(0, 0, 1)));

  // --- Deterministic 3D Surface Noise ---

  function noise3D(x, y, z, seed) {
    const s1 = seed * 0.137;
    const s2 = seed * 0.293;
    const s3 = seed * 0.479;
    const n1 = Math.sin(x * 3.1 + s1) * Math.cos(y * 2.9 + s2) * Math.sin(z * 3.3 + s3);
    const n2 = 0.55 * Math.sin((x + y) * 5.2 + s2) * Math.cos((z - x) * 4.8 + s1);
    const n3 = 0.28 * Math.cos((y - z) * 8.1 + s3) * Math.sin((x + z) * 7.4 + s1);
    return (n1 + n2 + n3) / 1.4;
  }

  // --- Geodesic Hex Sphere (Goldberg Polyhedron) Generator ---

  function buildGoldbergSphere(freq) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVerts = [
      vec3(-1, phi, 0), vec3(1, phi, 0), vec3(-1, -phi, 0), vec3(1, -phi, 0),
      vec3(0, -1, phi), vec3(0, 1, phi), vec3(0, -1, -phi), vec3(0, 1, -phi),
      vec3(phi, 0, -1), vec3(phi, 0, 1), vec3(-phi, 0, -1), vec3(-phi, 0, 1)
    ].map(normalize);

    const baseFaces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    // Enforce outward winding on every base icosahedron face
    for (let f = 0; f < baseFaces.length; f++) {
      const face = baseFaces[f];
      const A = baseVerts[face[0]];
      const B = baseVerts[face[1]];
      const C = baseVerts[face[2]];
      const faceCenter = add(add(A, B), C);
      if (dot(cross(sub(B, A), sub(C, A)), faceCenter) < 0) {
        const tmp = face[1];
        face[1] = face[2];
        face[2] = tmp;
      }
    }

    const vertices = [];
    const triangles = [];

    function addOrFindVertex(p) {
      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        const dx = v.x - p.x;
        const dy = v.y - p.y;
        const dz = v.z - p.z;
        if (dx * dx + dy * dy + dz * dz < 1e-6) {
          return i;
        }
      }
      vertices.push(p);
      return vertices.length - 1;
    }

    // Subdivide each icosahedron face into freq * freq sub-triangles
    for (let f = 0; f < baseFaces.length; f++) {
      const face = baseFaces[f];
      const A = baseVerts[face[0]];
      const B = baseVerts[face[1]];
      const C = baseVerts[face[2]];
      const grid = [];

      for (let i = 0; i <= freq; i++) {
        grid[i] = [];
        for (let j = 0; j <= freq - i; j++) {
          const wA = (freq - i - j) / freq;
          const wB = i / freq;
          const wC = j / freq;
          const pt = normalize({
            x: A.x * wA + B.x * wB + C.x * wC,
            y: A.y * wA + B.y * wB + C.y * wC,
            z: A.z * wA + B.z * wB + C.z * wC
          });
          grid[i][j] = addOrFindVertex(pt);
        }
      }

      for (let i = 0; i < freq; i++) {
        for (let j = 0; j < freq - i; j++) {
          triangles.push([grid[i][j], grid[i + 1][j], grid[i][j + 1]]);
          if (i + j < freq - 1) {
            triangles.push([grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]);
          }
        }
      }
    }

    // Build dual Goldberg polyhedron: each geodesic vertex becomes a 5- or 6-sided tile
    const vertexToCentroids = new Array(vertices.length);
    for (let i = 0; i < vertices.length; i++) {
      vertexToCentroids[i] = [];
    }

    for (let t = 0; t < triangles.length; t++) {
      const tri = triangles[t];
      const v0 = vertices[tri[0]];
      const v1 = vertices[tri[1]];
      const v2 = vertices[tri[2]];
      const centroid = normalize({
        x: v0.x + v1.x + v2.x,
        y: v0.y + v1.y + v2.y,
        z: v0.z + v1.z + v2.z
      });
      vertexToCentroids[tri[0]].push(centroid);
      vertexToCentroids[tri[1]].push(centroid);
      vertexToCentroids[tri[2]].push(centroid);
    }

    const tiles = [];

    for (let vIdx = 0; vIdx < vertices.length; vIdx++) {
      const N = vertices[vIdx];
      const rawCorners = vertexToCentroids[vIdx];
      const ref = Math.abs(N.y) < 0.9 ? vec3(0, 1, 0) : vec3(1, 0, 0);
      const U = normalize(cross(ref, N));
      const W = cross(N, U);

      const withAngles = rawCorners.map(function (c) {
        const diff = sub(c, N);
        return {
          point: c,
          angle: Math.atan2(dot(diff, W), dot(diff, U))
        };
      });

      withAngles.sort(function (a, b) {
        return a.angle - b.angle;
      });

      const outerCorners = withAngles.map(function (item) {
        return item.point;
      });

      let faceNormal = normalize(
        cross(sub(outerCorners[1], outerCorners[0]), sub(outerCorners[2], outerCorners[0]))
      );
      if (dot(faceNormal, N) < 0) {
        outerCorners.reverse();
        faceNormal = scale(faceNormal, -1);
      }

      let avg = vec3(0, 0, 0);
      for (let k = 0; k < outerCorners.length; k++) {
        avg = add(avg, outerCorners[k]);
      }
      const planeCenter = scale(avg, 1 / outerCorners.length);

      const innerCorners = outerCorners.map(function (c) {
        return add(scale(planeCenter, 0.11), scale(c, 0.89));
      });

      const rawT = sub(outerCorners[0], planeCenter);
      const tangentT = normalize(sub(rawT, scale(faceNormal, dot(rawT, faceNormal))));
      const tangentB = normalize(cross(faceNormal, tangentT));
      const hexScale = len(rawT);

      tiles.push({
        id: String(vIdx),
        center: normalize(avg),
        planeCenter: planeCenter,
        normal: faceNormal,
        tangentT: tangentT,
        tangentB: tangentB,
        hexScale: hexScale,
        outerCorners: outerCorners,
        innerCorners: innerCorners,
        sides: outerCorners.length,
        phase: (vIdx * 1.37) % (Math.PI * 2),
        biome: "highlands",
        rgb: [148, 163, 184],
        baseElev: 1.0,
        currentElev: 1.0,
        spec: 0.1,
        emissive: 0
      });
    }

    return tiles;
  }

  // --- Planet Biome Styling ---

  function styleRockyTiles(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const nx = tile.normal.x;
      const ny = tile.normal.y;
      const nz = tile.normal.z;
      const n = noise3D(nx, ny, nz, 101);
      const polar = Math.abs(ny);

      if (polar > 0.83) {
        tile.biome = "glacier";
        tile.rgb = [216, 236, 250];
        tile.baseElev = 1.028;
        tile.spec = 0.34;
        tile.emissive = 0;
      } else if (n > 0.22) {
        tile.biome = "mountains";
        tile.rgb = [192, 206, 224];
        tile.baseElev = 1.038;
        tile.spec = 0.20;
        tile.emissive = 0;
      } else if (n < -0.15) {
        tile.biome = "crater";
        tile.rgb = [71, 85, 105];
        tile.baseElev = 1.0;
        tile.spec = 0.05;
        tile.emissive = 0;
      } else {
        tile.biome = "highlands";
        tile.rgb = [140, 154, 176];
        tile.baseElev = 1.018;
        tile.spec = 0.08;
        tile.emissive = 0;
      }
      tile.currentElev = tile.baseElev;
    }
    return tiles;
  }

  function styleOceanicTiles(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const nx = tile.normal.x;
      const ny = tile.normal.y;
      const nz = tile.normal.z;
      const n = noise3D(nx, ny, nz, 207);
      const polar = Math.abs(ny);

      if (polar > 0.88) {
        tile.biome = "glacier";
        tile.rgb = [226, 238, 248];
        tile.baseElev = 1.024;
        tile.spec = 0.32;
        tile.emissive = 0;
      } else if (n > 0.34) {
        tile.biome = "mountains";
        tile.rgb = [148, 163, 184];
        tile.baseElev = 1.044;
        tile.spec = 0.18;
        tile.emissive = 0;
      } else if (n > 0.16) {
        tile.biome = "forest";
        tile.rgb = [16, 152, 104];
        tile.baseElev = 1.028;
        tile.spec = 0.09;
        tile.emissive = 0;
      } else if (n > 0.04) {
        tile.biome = "plains";
        tile.rgb = [64, 212, 134];
        tile.baseElev = 1.020;
        tile.spec = 0.12;
        tile.emissive = 0;
      } else if (n > -0.12) {
        tile.biome = "ocean";
        tile.rgb = [14, 165, 233];
        tile.baseElev = 1.0;
        tile.spec = 0.45;
        tile.emissive = 0;
      } else {
        tile.biome = "ocean";
        tile.rgb = [2, 132, 199];
        tile.baseElev = 1.0;
        tile.spec = 0.55;
        tile.emissive = 0;
      }
      tile.currentElev = tile.baseElev;
    }
    return tiles;
  }

  function styleVolcanicTiles(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const nx = tile.normal.x;
      const ny = tile.normal.y;
      const nz = tile.normal.z;
      const n = noise3D(nx, ny, nz, 319);
      const ridge = Math.abs(noise3D(nx * 1.4, ny * 1.4, nz * 1.4, 733));

      if (ridge < 0.13 || n < -0.35) {
        tile.biome = "lava";
        tile.rgb = n < -0.40 ? [251, 191, 36] : [245, 158, 11];
        tile.baseElev = 1.0;
        tile.spec = 0.18;
        tile.emissive = 0.65;
      } else if (n > 0.28) {
        tile.biome = "volcano";
        tile.rgb = [194, 65, 12];
        tile.baseElev = 1.040;
        tile.spec = 0.10;
        tile.emissive = 0.08;
      } else if (n > 0.06) {
        tile.biome = "canyon";
        tile.rgb = [154, 52, 18];
        tile.baseElev = 1.028;
        tile.spec = 0.10;
        tile.emissive = 0.04;
      } else {
        tile.biome = "ashlands";
        tile.rgb = [59, 24, 18];
        tile.baseElev = 1.016;
        tile.spec = 0.15;
        tile.emissive = 0.02;
      }
      tile.currentElev = tile.baseElev;
    }
    return tiles;
  }

  function buildTileMap(tiles) {
    const map = Object.create(null);
    for (let i = 0; i < tiles.length; i++) {
      map[tiles[i].id] = tiles[i];
    }
    return map;
  }

  // Three distinct 3D geodesic planets (Small -> Medium -> Large)
  const planets = [
    {
      id: 0,
      defaultName: "Planet 1",
      name: "Planet 1",
      typeId: "rocky",
      typeLabel: "Rocky",
      accent: "#cbd5e1",
      accentBg: "#25344d",
      iconSrc: "./assets/ui/planet-rocky.svg",
      freq: 2,
      atmosphere: { r: 203, g: 213, b: 225 },
      coreScale: 0.92,
      roll: 0.21,
      basePitch: 0.24,
      pitchOffset: 0,
      spinY: 0.35,
      spinSpeed: 0.20,
      zoom: 1.0,
      targetZoom: 1.0,
      spinVelY: 0,
      pitchVelX: 0,
      lookTarget: null,
      autoSpinBlend: 1,
      getBaseRadius: function (w, h) {
        return Math.min(h * 0.25, w * 0.20);
      },
      tiles: styleRockyTiles(buildGoldbergSphere(2)),
      tileById: null
    },
    {
      id: 1,
      defaultName: "Planet 2",
      name: "Planet 2",
      typeId: "oceanic",
      typeLabel: "Oceanic",
      accent: "#38bdf8",
      accentBg: "#0f3a5c",
      iconSrc: "./assets/ui/planet-oceanic.svg",
      freq: 3,
      atmosphere: { r: 56, g: 189, b: 248 },
      coreScale: 0.955,
      roll: -0.26,
      basePitch: 0.30,
      pitchOffset: 0,
      spinY: 0.85,
      spinSpeed: 0.16,
      zoom: 1.0,
      targetZoom: 1.0,
      spinVelY: 0,
      pitchVelX: 0,
      lookTarget: null,
      autoSpinBlend: 1,
      getBaseRadius: function (w, h) {
        return Math.min(h * 0.315, w * 0.25);
      },
      tiles: styleOceanicTiles(buildGoldbergSphere(3)),
      tileById: null
    },
    {
      id: 2,
      defaultName: "Planet 3",
      name: "Planet 3",
      typeId: "volcanic",
      typeLabel: "Volcanic",
      accent: "#fb923c",
      accentBg: "#571e12",
      iconSrc: "./assets/ui/planet-volcanic.svg",
      freq: 4,
      atmosphere: { r: 251, g: 146, b: 60 },
      coreScale: 0.97,
      roll: 0.18,
      basePitch: 0.26,
      pitchOffset: 0,
      spinY: 1.40,
      spinSpeed: 0.13,
      zoom: 1.0,
      targetZoom: 1.0,
      spinVelY: 0,
      pitchVelX: 0,
      lookTarget: null,
      autoSpinBlend: 1,
      getBaseRadius: function (w, h) {
        return Math.min(h * 0.375, w * 0.30);
      },
      tiles: styleVolcanicTiles(buildGoldbergSphere(4)),
      tileById: null
    }
  ];

  for (let i = 0; i < planets.length; i++) {
    planets[i].tileById = buildTileMap(planets[i].tiles);
  }

  // Viewport & scroll state
  let width = window.innerWidth;
  let height = window.innerHeight;
  let scrollPos = 0;
  let targetIndex = 0;
  let activeDotIndex = 0;

  // Interactive hex, buildings & QoL state
  const selectedHexByPlanet = [null, null, null];
  const buildingsByPlanet = [Object.create(null), Object.create(null), Object.create(null)];
  const tileEffectsByPlanet = [Object.create(null), Object.create(null), Object.create(null)];
  const BUILD_VFX_MS = 760;
  const DEMOLISH_VFX_MS = 900;
  let drawerShiftX = 0;
  let drawerShiftY = 0;
  let drawerScale = 1;
  let hoveredHexId = null;
  let isHoveringPlanet = false;
  let focusedHitPolys = [];
  let selectionPulse = null;
  let lastInteractionTime = 0;
  let lastZoomLabel = "";
  let lastZoomGaugeKey = -1;
  const citizensHudState = { planet: -1, max: -1, curr: -1, bumpTimer: 0 };
  const energyHudState = { planet: -1, max: -1, curr: -1, bumpTimer: 0 };
  let lastHeaderPlanet = -1;
  let emblemPopTimer = 0;
  let isRenamingPlanet = false;
  let renamingPlanetIndex = -1;

  function sanitizePlanetName(raw, fallback) {
    const cleaned = String(raw || "").replace(/\s+/g, " ").trim().slice(0, MAX_PLANET_NAME_LEN);
    return cleaned || fallback;
  }

  function loadSavedPlanetNames() {
    try {
      const raw = window.localStorage && window.localStorage.getItem(PLANET_NAMES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (let i = 0; i < planets.length; i++) {
            planets[i].name = sanitizePlanetName(parsed[i], planets[i].defaultName);
          }
        }
      }
    } catch (_) { }

    for (let i = 0; i < dotButtons.length && i < planets.length; i++) {
      dotButtons[i].setAttribute("aria-label", planets[i].name);
    }
  }

  function savePlanetNames() {
    try {
      if (!window.localStorage) return;
      const list = [];
      for (let i = 0; i < planets.length; i++) {
        list.push(planets[i].name);
      }
      window.localStorage.setItem(PLANET_NAMES_STORAGE_KEY, JSON.stringify(list));
    } catch (_) { }
  }

  function startPlanetRename() {
    if (!planetDeckHeaderEl || !planetHudNameInputEl) return;
    if (isRenamingPlanet) {
      finishPlanetRename(true);
    }
    const p = planets[activeDotIndex];
    if (!p) return;

    isRenamingPlanet = true;
    renamingPlanetIndex = activeDotIndex;
    planetHudNameInputEl.value = p.name;
    planetDeckHeaderEl.classList.add("is-editing");

    if (renamePlanetBtn) {
      renamePlanetBtn.title = "Save Planet Name";
      renamePlanetBtn.setAttribute("aria-label", "Save Planet Name");
    }

    planetHudNameInputEl.focus();
    planetHudNameInputEl.select();
  }

  function finishPlanetRename(commit) {
    if (!isRenamingPlanet) return;
    const idx = renamingPlanetIndex;
    isRenamingPlanet = false;
    renamingPlanetIndex = -1;

    if (planetDeckHeaderEl) {
      planetDeckHeaderEl.classList.remove("is-editing");
    }
    if (renamePlanetBtn) {
      renamePlanetBtn.title = "Rename Planet";
      renamePlanetBtn.setAttribute("aria-label", "Rename Planet");
    }

    if (commit && planets[idx] && planetHudNameInputEl) {
      planets[idx].name = sanitizePlanetName(planetHudNameInputEl.value, planets[idx].defaultName);
      savePlanetNames();
      if (dotButtons[idx]) {
        dotButtons[idx].setAttribute("aria-label", planets[idx].name);
      }
    }

    updatePlanetHeaderHud(true);
  }

  function formatPlanetStat(val) {
    if (window.GameCurrencies && typeof window.GameCurrencies.formatNumber === "function") {
      return window.GameCurrencies.formatNumber(val);
    }
    return String(val);
  }

  /** Update top-right planet medallion, name, and accent colors. */
  function updatePlanetHeaderHud(force) {
    if (!force && activeDotIndex === lastHeaderPlanet) return;
    if (isRenamingPlanet && renamingPlanetIndex !== activeDotIndex) {
      finishPlanetRename(true);
    }
    const p = planets[activeDotIndex];
    if (!p) return;

    const switched = lastHeaderPlanet !== -1 && lastHeaderPlanet !== activeDotIndex;
    lastHeaderPlanet = activeDotIndex;

    if (planetHudIconEl) {
      planetHudIconEl.src = p.iconSrc;
    }
    if (planetHudNameEl) {
      planetHudNameEl.textContent = p.name;
    }
    if (planetStatsDeckEl) {
      planetStatsDeckEl.setAttribute("data-planet", String(activeDotIndex));
      planetStatsDeckEl.setAttribute("data-planet-type", p.typeId);
      planetStatsDeckEl.style.setProperty("--planet-accent", p.accent);
      planetStatsDeckEl.style.setProperty("--planet-accent-bg", p.accentBg);
    }
    if (planetHudEmblemEl) {
      planetHudEmblemEl.title = p.name;
      if (switched) {
        planetHudEmblemEl.classList.remove("is-switched");
        void planetHudEmblemEl.offsetWidth;
        planetHudEmblemEl.classList.add("is-switched");
        if (emblemPopTimer) window.clearTimeout(emblemPopTimer);
        emblemPopTimer = window.setTimeout(function () {
          planetHudEmblemEl.classList.remove("is-switched");
          emblemPopTimer = 0;
        }, 260);
      }
    }
  }

  /** Sum a per-building capacity property (e.g. citizenSlots or energySlots) on a planet. */
  function calculatePlanetStatCapacity(planetIdx, slotKey) {
    const buildings = buildingsByPlanet[planetIdx];
    if (!buildings || !window.GameBuildings) return 0;
    let cap = 0;
    const keys = Object.keys(buildings);
    for (let i = 0; i < keys.length; i++) {
      const bInfo = buildings[keys[i]];
      if (!bInfo || !bInfo.id) continue;
      const bDef = window.GameBuildings.getBuilding(bInfo.id);
      if (bDef && bDef[slotKey]) {
        cap += bDef[slotKey];
      }
    }
    return cap;
  }

  /** Sync a top-right planet HUD stat cell, progress meter, and bump animation. */
  function syncStatBarHud(currEl, maxEl, statBar, meterFillEl, hudState, currCount, maxCap, force) {
    if (!currEl || !maxEl) return;
    const activeIdx = activeDotIndex;
    const changed = force || activeIdx !== hudState.planet || maxCap !== hudState.max || currCount !== hudState.curr;
    if (!changed) return;

    const hadPrior = hudState.planet !== -1 && hudState.planet === activeIdx;
    const valueChanged = hadPrior && (maxCap !== hudState.max || currCount !== hudState.curr);

    hudState.planet = activeIdx;
    hudState.max = maxCap;
    hudState.curr = currCount;

    currEl.textContent = formatPlanetStat(currCount);
    maxEl.textContent = formatPlanetStat(maxCap);

    if (statBar) {
      statBar.classList.toggle("is-empty", maxCap <= 0);
    }
    if (meterFillEl) {
      const ratio = maxCap > 0 ? clamp(currCount / maxCap, 0, 1) * 100 : 0;
      meterFillEl.style.width = ratio.toFixed(1) + "%";
    }

    if (valueChanged && statBar) {
      const valWrap = statBar.querySelector(".planet-stat-value");
      if (valWrap) {
        valWrap.classList.remove("is-bumped");
        void valWrap.offsetWidth;
        valWrap.classList.add("is-bumped");
        if (hudState.bumpTimer) window.clearTimeout(hudState.bumpTimer);
        hudState.bumpTimer = window.setTimeout(function () {
          valWrap.classList.remove("is-bumped");
          hudState.bumpTimer = 0;
        }, 160);
      }
    }
  }

  function calculatePlanetCitizenCapacity(planetIdx) {
    return calculatePlanetStatCapacity(planetIdx, "citizenSlots");
  }

  function getPlanetCitizenCount(planetIdx) {
    // Current citizen population fills available capacity
    return calculatePlanetCitizenCapacity(planetIdx);
  }

  function updatePlanetCitizenHud(force) {
    syncStatBarHud(
      citizensCurrEl,
      citizensMaxEl,
      citizensStatBar,
      citizensMeterFillEl,
      citizensHudState,
      getPlanetCitizenCount(activeDotIndex),
      calculatePlanetCitizenCapacity(activeDotIndex),
      force
    );
  }

  function calculatePlanetEnergyCapacity(planetIdx) {
    return calculatePlanetStatCapacity(planetIdx, "energySlots");
  }

  function getPlanetEnergyCount(planetIdx) {
    // Current energy supply fills available capacity
    return calculatePlanetEnergyCapacity(planetIdx);
  }

  function updatePlanetEnergyHud(force) {
    syncStatBarHud(
      energyCurrEl,
      energyMaxEl,
      energyStatBar,
      energyMeterFillEl,
      energyHudState,
      getPlanetEnergyCount(activeDotIndex),
      calculatePlanetEnergyCapacity(activeDotIndex),
      force
    );
  }

  function updatePlanetStatsHud(force) {
    updatePlanetHeaderHud(force);
    updatePlanetCitizenHud(force);
    updatePlanetEnergyHud(force);
  }

  // Multi-touch & pointer tracking
  const activePointers = new Map();
  let isDragging = false;
  let activePointerId = null;
  let gestureMode = null; // null | "orbit" | "scroll" | "pinch"
  let wasPinchGesture = false;
  let pinchStartDist = 0;
  let pinchStartZoom = 1.0;

  let startSnapIndex = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastPointerTime = 0;
  let pointerVelocity = 0; // px / ms for carousel flick
  let totalDragDistance = 0;
  let wheelCooldownUntil = 0;
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  let lastFrameTime = performance.now();

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function updateIndicatorDots() {
    const clamped = clamp(scrollPos, 0, PLANET_COUNT - 1);
    const nearest = Math.round(clamped);
    if (nearest !== activeDotIndex || (dotButtons.length > 0 && !dotButtons[nearest].classList.contains("active"))) {
      activeDotIndex = nearest;
      for (let i = 0; i < dotButtons.length; i++) {
        const btn = dotButtons[i];
        if (i === activeDotIndex) {
          btn.classList.add("active");
          btn.setAttribute("aria-current", "true");
        } else {
          btn.classList.remove("active");
          btn.removeAttribute("aria-current");
        }
      }
    }
  }

  function updateControlStates() {
    if (prevBtn) {
      prevBtn.classList.toggle("is-hidden", activeDotIndex <= 0);
    }
    if (nextBtn) {
      nextBtn.classList.toggle("is-hidden", activeDotIndex >= PLANET_COUNT - 1);
    }

    const activePlanet = planets[activeDotIndex];
    if (!activePlanet) return;

    if (zoomInBtn) {
      zoomInBtn.disabled = activePlanet.targetZoom >= MAX_ZOOM - 0.02;
    }
    if (zoomOutBtn) {
      zoomOutBtn.disabled = activePlanet.targetZoom <= MIN_ZOOM + 0.02;
    }

    const zoomText = activePlanet.zoom.toFixed(1) + "×";
    if (zoomLevelLabel && zoomText !== lastZoomLabel) {
      lastZoomLabel = zoomText;
      zoomLevelLabel.textContent = zoomText;
    }

    const zoomNorm = clamp((activePlanet.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM), 0, 1);
    const zoomGaugeKey = Math.round(zoomNorm * 1000);
    if (zoomGaugeFill && zoomGaugeKey !== lastZoomGaugeKey) {
      lastZoomGaugeKey = zoomGaugeKey;
      zoomGaugeFill.style.transform = "scaleX(" + (zoomGaugeKey / 1000).toFixed(3) + ")";
    }

    updatePlanetStatsHud(false);
  }

  function goToPlanet(index) {
    if (isRenamingPlanet) {
      finishPlanetRename(true);
    }
    const nextIdx = clamp(Math.round(index), 0, PLANET_COUNT - 1);
    if (nextIdx !== targetIndex) {
      selectedHexByPlanet[targetIndex] = null;
      selectionPulse = null;
      if (window.GameBuildings) {
        window.GameBuildings.close(false);
      }
      for (let i = 0; i < planets.length; i++) {
        planets[i].targetZoom = MIN_ZOOM;
        if (i !== nextIdx) {
          planets[i].lookTarget = null;
        }
      }
      targetIndex = nextIdx;
      hoveredHexId = null;
      isHoveringPlanet = false;
    }
  }

  // Smooth shortest-arc focus rotation bringing a tile toward front center
  function focusOnTile(planet, tile) {
    const px = tile.center.x;
    const py = tile.center.y;
    const pz = tile.center.z;
    const rXZ = Math.hypot(px, pz);

    let targetSpinY = planet.spinY;
    if (rXZ > 0.001) {
      const rawSpinY = Math.atan2(-px, pz);
      let deltaY = rawSpinY - planet.spinY;
      deltaY = ((((deltaY + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
      targetSpinY = planet.spinY + deltaY;
    }

    const targetPitchX = Math.atan2(py, rXZ);
    const targetPitchOffset = clamp(
      targetPitchX - planet.basePitch,
      -MAX_PITCH - planet.basePitch,
      MAX_PITCH - planet.basePitch
    );

    planet.lookTarget = {
      spinY: targetSpinY,
      pitchOffset: targetPitchOffset
    };
    planet.spinVelY = 0;
    planet.pitchVelX = 0;
  }

  function adjustZoom(delta) {
    const activePlanet = planets[targetIndex];
    if (!activePlanet) return;
    activePlanet.targetZoom = clamp(activePlanet.targetZoom + delta, MIN_ZOOM, MAX_ZOOM);
    lastInteractionTime = performance.now();
  }

  // Compute planet screen placement & scale (incorporating zoom) for current scrollPos
  function getPlanetTransform(planet, i) {
    const rel = i - scrollPos;
    const absRel = Math.min(1, Math.abs(rel));
    const focus = 0.5 * (1 + Math.cos(Math.PI * absRel));
    const scaleFactor = 0.35 + 0.65 * focus;
    const baseRadius = planet.getBaseRadius(width, height);
    const effectiveRadius = baseRadius * planet.zoom * drawerScale;
    const travelDistance = width * 0.68 + effectiveRadius;

    return {
      rel: rel,
      absRel: absRel,
      scale: scaleFactor,
      alpha: Math.pow(Math.max(0, 1 - absRel), 0.75),
      baseRadius: baseRadius,
      effectiveRadius: effectiveRadius,
      scaledRadius: effectiveRadius * scaleFactor,
      x: width * 0.5 + drawerShiftX + rel * travelDistance,
      y: height * 0.47 + drawerShiftY
    };
  }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const inv = t - 1;
    return 1 + c3 * inv * inv * inv + c1 * inv * inv;
  }

  function isPointOnPlanet(clientX, clientY) {
    const idx = Math.round(clamp(scrollPos, 0, PLANET_COUNT - 1));
    if (Math.abs(idx - scrollPos) >= 0.18) {
      return false;
    }
    const planet = planets[idx];
    const transform = getPlanetTransform(planet, idx);
    const dx = clientX - transform.x;
    const dy = clientY - transform.y;
    const hitRadius = transform.scaledRadius * 1.12;
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }

  // --- 3D Rotation & Perspective Projection ---

  function createRotator(spinY, pitchX, rollZ) {
    const cosY = Math.cos(spinY);
    const sinY = Math.sin(spinY);
    const cosX = Math.cos(pitchX);
    const sinX = Math.sin(pitchX);
    const cosZ = Math.cos(rollZ);
    const sinZ = Math.sin(rollZ);

    return function rotatePoint(p) {
      const x1 = p.x * cosY + p.z * sinY;
      const y1 = p.y;
      const z1 = -p.x * sinY + p.z * cosY;

      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      return {
        x: x2 * cosZ - y2 * sinZ,
        y: x2 * sinZ + y2 * cosZ,
        z: z2
      };
    };
  }

  function project(p, cx, cy, focalLength) {
    const inv = focalLength / (CAM_DIST - p.z);
    return {
      x: cx + p.x * inv,
      y: cy - p.y * inv
    };
  }

  function tracePolygon(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
  }

  function signedArea2D(pts) {
    let area = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      area += pts[j].x * pts[i].y - pts[i].x * pts[j].y;
    }
    return area * 0.5;
  }

  function computeShadedColor(rgb, lightAmt, specAmt, fresnelAmt, atmo) {
    const r = Math.min(255, Math.round(rgb[0] * lightAmt + 255 * specAmt + (atmo.r - rgb[0] * lightAmt) * fresnelAmt));
    const g = Math.min(255, Math.round(rgb[1] * lightAmt + 255 * specAmt + (atmo.g - rgb[1] * lightAmt) * fresnelAmt));
    const b = Math.min(255, Math.round(rgb[2] * lightAmt + 255 * specAmt + (atmo.b - rgb[2] * lightAmt) * fresnelAmt));
    return `rgb(${clamp(r, 0, 255)}, ${clamp(g, 0, 255)}, ${clamp(b, 0, 255)})`;
  }

  // Render a single 3D geodesic hex planet
  function drawPlanet(planet, transform, time, dtSec) {
    const r = transform.scaledRadius;
    const cx = transform.x;
    const cy = transform.y;
    const atmo = planet.atmosphere;
    const isFocused = Math.abs(transform.rel) < 0.15;
    const focalLength = r * Math.sqrt(CAM_DIST * CAM_DIST - 1);
    const selectedId = selectedHexByPlanet[planet.id];
    const elevLerp = 1 - Math.exp(-14 * dtSec);

    if (isFocused) {
      focusedHitPolys = [];
    }

    ctx.save();
    ctx.globalAlpha = transform.alpha;

    // 1. Outer 3D Atmospheric Halo
    const haloRadius = r * 1.28;
    const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, haloRadius);
    haloGrad.addColorStop(0, `rgba(${atmo.r}, ${atmo.g}, ${atmo.b}, 0.28)`);
    haloGrad.addColorStop(0.55, `rgba(${atmo.r}, ${atmo.g}, ${atmo.b}, 0.08)`);
    haloGrad.addColorStop(1, `rgba(${atmo.r}, ${atmo.g}, ${atmo.b}, 0)`);
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Dark Inner Core Sphere
    const coreRadius = r * planet.coreScale;
    const coreGrad = ctx.createRadialGradient(
      cx - coreRadius * 0.3,
      cy - coreRadius * 0.3,
      coreRadius * 0.1,
      cx,
      cy,
      coreRadius
    );
    coreGrad.addColorStop(0, "#141d31");
    coreGrad.addColorStop(0.65, "#070b15");
    coreGrad.addColorStop(1, "#02040a");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Collect, Backface-Cull, and Depth-Sort Visible 3D Tiles
    const pitchX = clamp(planet.basePitch + planet.pitchOffset, -MAX_PITCH, MAX_PITCH);
    const rotatePoint = createRotator(planet.spinY, pitchX, planet.roll);
    const visibleTiles = [];

    for (let i = 0; i < planet.tiles.length; i++) {
      const tile = planet.tiles[i];
      const isSelected = selectedId === tile.id;
      const targetElev = isSelected ? tile.baseElev + 0.055 : tile.baseElev;
      tile.currentElev += (targetElev - tile.currentElev) * elevLerp;

      const rotCenter = rotatePoint(tile.center);
      if (rotCenter.z <= -0.45) {
        continue;
      }

      const rotNormal = rotatePoint(tile.normal);
      const rotPlaneCenter = rotatePoint(tile.planeCenter);
      const elev = tile.currentElev;

      const elevPlaneCenter = scale(rotPlaneCenter, elev);
      const toCam = sub(CAM_VEC, elevPlaneCenter);
      const facing = dot(rotNormal, toCam);
      const needsSides = elev > 1.003;

      const sides = tile.sides;
      const rotBase = new Array(sides);
      const topPts = new Array(sides);
      const basePts = needsSides ? new Array(sides) : null;

      for (let k = 0; k < sides; k++) {
        const rc = rotatePoint(tile.outerCorners[k]);
        rotBase[k] = rc;
        topPts[k] = project(scale(rc, elev), cx, cy, focalLength);
        if (needsSides) {
          basePts[k] = project(rc, cx, cy, focalLength);
        }
      }

      // Front-facing polygons project CCW in 3D -> negative signed area in screen Y-down
      const topVisible = facing > -0.05 && signedArea2D(topPts) < -0.25;
      const placed = buildingsByPlanet[planet.id][tile.id] || null;
      let effect = tileEffectsByPlanet[planet.id][tile.id] || null;
      if (effect && time - effect.startTime >= effect.duration) {
        delete tileEffectsByPlanet[planet.id][tile.id];
        effect = null;
      }
      const hasBuilding = Boolean(placed);
      if (!topVisible && !needsSides && !hasBuilding && !effect) {
        continue;
      }

      const toCamLen = len(toCam) || 1;
      const facingDot = Math.max(0, facing / toCamLen);

      visibleTiles.push({
        tile: tile,
        rotNormal: rotNormal,
        elevPlaneCenter: elevPlaneCenter,
        elev: elev,
        depthZ: rotCenter.z,
        facingDot: facingDot,
        topVisible: topVisible,
        needsSides: needsSides,
        placed: placed,
        effect: effect,
        rotBase: rotBase,
        topPts: topPts,
        basePts: basePts,
        isSelected: isSelected,
        isHovered: isFocused && hoveredHexId === tile.id
      });
    }

    visibleTiles.sort(function (a, b) {
      return a.depthZ - b.depthZ;
    });

    const lineUnit = Math.max(0.75, r / (planet.freq * 68));

    // 4. Draw Sorted 3D Tiles (Side Extrusion Walls + Top Face + Glowing White Hex Frame)
    for (let i = 0; i < visibleTiles.length; i++) {
      const entry = visibleTiles[i];
      const tile = entry.tile;
      const rotNormal = entry.rotNormal;
      const elev = entry.elev;
      const sides = tile.sides;
      const rotBase = entry.rotBase;
      const topPts = entry.topPts;
      const basePts = entry.basePts;
      const isSelected = entry.isSelected;
      const isHovered = entry.isHovered;

      if (entry.needsSides) {
        for (let k = 0; k < sides; k++) {
          const next = (k + 1) % sides;
          const b0 = rotBase[k];
          const b1 = rotBase[next];
          const sideN = cross(sub(b1, b0), rotNormal);
          const midB = scale(add(b0, b1), 0.5);

          if (dot(sideN, sub(CAM_VEC, midB)) <= 0) {
            continue;
          }

          const sideNormUnit = normalize(sideN);
          const sideNdotL = Math.max(0, dot(sideNormUnit, LIGHT_DIR));
          const sideLight =
            0.52 * (0.28 + 0.72 * sideNdotL) +
            tile.emissive * 0.35 +
            (isSelected ? 0.12 : 0);

          const sr = clamp(Math.round(tile.rgb[0] * sideLight), 0, 255);
          const sg = clamp(Math.round(tile.rgb[1] * sideLight), 0, 255);
          const sb = clamp(Math.round(tile.rgb[2] * sideLight), 0, 255);

          ctx.beginPath();
          ctx.moveTo(basePts[k].x, basePts[k].y);
          ctx.lineTo(basePts[next].x, basePts[next].y);
          ctx.lineTo(topPts[next].x, topPts[next].y);
          ctx.lineTo(topPts[k].x, topPts[k].y);
          ctx.closePath();

          ctx.fillStyle = `rgb(${sr}, ${sg}, ${sb})`;
          ctx.fill();
          ctx.lineWidth = 0.6;
          ctx.strokeStyle = `rgb(${sr}, ${sg}, ${sb})`;
          ctx.stroke();

          if (isSelected) {
            ctx.beginPath();
            ctx.moveTo(topPts[k].x, topPts[k].y);
            ctx.lineTo(topPts[next].x, topPts[next].y);
            ctx.lineWidth = Math.max(1.1, lineUnit * 0.9);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
            ctx.stroke();
          }
        }
      }

      if (entry.topVisible) {
        const projCenter = project(entry.elevPlaneCenter, cx, cy, focalLength);

        if (isFocused) {
          const tileR = Math.hypot(topPts[0].x - projCenter.x, topPts[0].y - projCenter.y);
          focusedHitPolys.push({
            id: tile.id,
            pts: topPts,
            cx: projCenter.x,
            cy: projCenter.y,
            tileR: tileR
          });
        }

        // Improved front-hemisphere fill lighting so tiles stay readable near terminator
        const ndotl = Math.max(0, dot(rotNormal, LIGHT_DIR));
        const frontFill = 0.16 * Math.max(0, rotNormal.z);
        const lightAmt = Math.min(1.18, 0.28 + 0.82 * ndotl + frontFill + tile.emissive * (1 - ndotl * 0.6));
        const specAmt = tile.spec * Math.pow(Math.max(0, dot(rotNormal, HALF_VEC)), 18);
        const fresnelAmt = Math.pow(Math.max(0, 1 - Math.max(0, rotNormal.z)), 2.6) * 0.28;
        const topFill = computeShadedColor(tile.rgb, lightAmt, specAmt, fresnelAmt, atmo);

        // Draw Tile Top Face
        tracePolygon(topPts);
        ctx.fillStyle = topFill;
        ctx.fill();
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = topFill;
        ctx.stroke();

        // Project & Draw Glowing White-Light Hexagon Border (flush on tile polygon plane)
        const innerPts = new Array(sides);
        const innerScale = elev + 0.0015;
        for (let k = 0; k < sides; k++) {
          const ri = scale(rotatePoint(tile.innerCorners[k]), innerScale);
          innerPts[k] = project(ri, cx, cy, focalLength);
        }

        const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + tile.phase);
        const rimFade = clamp(entry.facingDot * 1.45, 0.30, 1.0);

        tracePolygon(innerPts);

        if (isSelected) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        } else if (isHovered) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${(0.04 + pulse * 0.025) * rimFade})`;
        }
        ctx.fill();

        if (isSelected || isHovered) {
          ctx.save();
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = isSelected ? 14 : 8;
        }

        ctx.lineWidth = Math.max(2.6, lineUnit * 2.9);
        ctx.strokeStyle = isSelected
          ? `rgba(255, 255, 255, ${0.42 * rimFade})`
          : `rgba(255, 255, 255, ${(0.16 + pulse * 0.07) * rimFade})`;
        ctx.stroke();

        ctx.lineWidth = Math.max(1.4, lineUnit * 1.45);
        ctx.strokeStyle = isSelected
          ? `rgba(255, 255, 255, ${0.78 * rimFade})`
          : `rgba(255, 255, 255, ${(0.45 + pulse * 0.12) * rimFade})`;
        ctx.stroke();

        ctx.lineWidth = Math.max(0.85, lineUnit * 0.72);
        ctx.strokeStyle = isSelected
          ? `rgba(255, 255, 255, ${Math.min(1, 0.96 * rimFade + 0.08)})`
          : `rgba(255, 255, 255, ${(0.92 + pulse * 0.08) * rimFade})`;
        ctx.stroke();

        if (isSelected || isHovered) {
          ctx.restore();
        }

        // Expanding white-light selection pulse ring
        if (selectionPulse && selectionPulse.planetId === planet.id && selectionPulse.tileId === tile.id) {
          const elapsed = time - selectionPulse.startTime;
          if (elapsed >= 0 && elapsed <= PULSE_DURATION_MS) {
            const progress = elapsed / PULSE_DURATION_MS;
            const ringScale = 1 + 0.26 * progress;
            const ringPts = new Array(sides);
            for (let k = 0; k < sides; k++) {
              ringPts[k] = {
                x: projCenter.x + (innerPts[k].x - projCenter.x) * ringScale,
                y: projCenter.y + (innerPts[k].y - projCenter.y) * ringScale
              };
            }
            tracePolygon(ringPts);
            ctx.lineWidth = Math.max(1.5, lineUnit * 2.0) * (1 - progress * 0.5);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - progress) * 0.85})`;
            ctx.stroke();
          } else if (elapsed > PULSE_DURATION_MS) {
            selectionPulse = null;
          }
        }
      }

      if (window.GameBuildings && (entry.placed || entry.effect)) {
        const rotT = rotatePoint(tile.tangentT);
        const rotB = rotatePoint(tile.tangentB);
        const buildingFrame = {
          origin: entry.elevPlaneCenter,
          rotT: rotT,
          rotB: rotB,
          rotN: rotNormal,
          scale: tile.hexScale * elev,
          phase: tile.phase,
          cx: cx,
          cy: cy,
          focalLength: focalLength,
          camVec: CAM_VEC,
          lightDir: LIGHT_DIR,
          halfVec: HALF_VEC,
          atmo: atmo,
          isSelected: isSelected,
          project: project
        };

        const eff = entry.effect;

        if (eff && eff.type === "demolish") {
          const dp = clamp((time - eff.startTime) / eff.duration, 0, 1);
          if (dp < 0.47 && eff.buildingId) {
            if (dp < 0.32) {
              const amp = 0.055 * (dp / 0.32);
              window.GameBuildings.renderBuilding3D(ctx, eff.buildingId, buildingFrame, time, 1, {
                jitterX: Math.sin(dp * 110) * amp,
                jitterY: Math.cos(dp * 95) * amp * 0.85
              });
            } else {
              const k = (dp - 0.32) / 0.15;
              const crushZ = Math.max(0.06, 1 - k * 0.94);
              const crushXY = 1 + Math.sin(k * Math.PI) * 0.34;
              window.GameBuildings.renderBuilding3D(ctx, eff.buildingId, buildingFrame, time, 1, {
                scaleXY: crushXY,
                scaleZ: crushZ
              });
            }
          }
        } else if (entry.placed) {
          if (eff && eff.type === "build") {
            const bp = clamp((time - eff.startTime) / eff.duration, 0, 1);
            if (eff.prevBuildingId && bp < 0.20) {
              const shrink = Math.max(0.06, 1 - bp / 0.20);
              window.GameBuildings.renderBuilding3D(ctx, eff.prevBuildingId, buildingFrame, time, shrink);
            }
            if (bp >= 0.16) {
              const k = clamp((bp - 0.16) / 0.44, 0, 1);
              const pop = easeOutBack(k);
              const stretch = Math.sin(k * Math.PI) * 0.18;
              window.GameBuildings.renderBuilding3D(ctx, entry.placed.id, buildingFrame, time, pop, {
                scaleXY: 1 - stretch * 0.45,
                scaleZ: 1 + stretch
              });
            }
          } else {
            const buildElapsed = time - entry.placed.placedAt;
            const buildScale =
              buildElapsed >= 0 && buildElapsed < 280
                ? easeOutBack(buildElapsed / 280)
                : 1;
            window.GameBuildings.renderBuilding3D(ctx, entry.placed.id, buildingFrame, time, buildScale);
          }
        }

        if (eff && typeof window.GameBuildings.renderTileEffect === "function") {
          window.GameBuildings.renderTileEffect(ctx, eff, buildingFrame, time);
        }
      }
    }

    // 5. Subtle Front Atmospheric Limb Sheen
    const limbGrad = ctx.createRadialGradient(
      cx - r * 0.22,
      cy - r * 0.22,
      r * 0.78,
      cx,
      cy,
      r * 1.01
    );
    limbGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    limbGrad.addColorStop(0.82, `rgba(${atmo.r}, ${atmo.g}, ${atmo.b}, 0.05)`);
    limbGrad.addColorStop(1, `rgba(${atmo.r}, ${atmo.g}, ${atmo.b}, 0.22)`);
    ctx.fillStyle = limbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.01, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Forgiving 3D Tile Hit Testing ---

  function pointInPoly(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x;
      const yi = pts[i].y;
      const xj = pts[j].x;
      const yj = pts[j].y;

      const intersect = (yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  function findHexAtPoint(clientX, clientY, allowFallback) {
    const idx = Math.round(clamp(scrollPos, 0, PLANET_COUNT - 1));
    if (Math.abs(idx - scrollPos) >= 0.15) {
      return null;
    }

    // Pass 1: exact front-to-back point-in-polygon check
    for (let i = focusedHitPolys.length - 1; i >= 0; i--) {
      const poly = focusedHitPolys[i];
      if (pointInPoly(clientX, clientY, poly.pts)) {
        return { planetId: idx, hexId: poly.id };
      }
    }

    if (!allowFallback) {
      return null;
    }

    // Pass 2: forgiving nearest tile center fallback inside planet bounds
    const planet = planets[idx];
    const transform = getPlanetTransform(planet, idx);
    const maxRadius = transform.scaledRadius * 1.08;
    if (Math.hypot(clientX - transform.x, clientY - transform.y) > maxRadius) {
      return null;
    }

    let bestId = null;
    let bestDist = Infinity;
    for (let i = focusedHitPolys.length - 1; i >= 0; i--) {
      const poly = focusedHitPolys[i];
      const maxHitDist = Math.max(18, poly.tileR * 1.35);
      const d = Math.hypot(clientX - poly.cx, clientY - poly.cy);
      if (d <= maxHitDist && d < bestDist) {
        bestDist = d;
        bestId = poly.id;
      }
    }

    return bestId !== null ? { planetId: idx, hexId: bestId } : null;
  }

  // --- Main Render Loop ---

  function render(time) {
    if (!ctx || !canvas) return;

    const dtMs = Math.min(time - lastFrameTime, 60);
    const dtSec = dtMs / 1000;
    lastFrameTime = time;

    const prevScroll = scrollPos;

    let targetShiftX = 0;
    let targetShiftY = 0;
    let targetScale = 1;

    const bounds =
      window.GameBuildings && typeof window.GameBuildings.getLayoutBounds === "function"
        ? window.GameBuildings.getLayoutBounds()
        : null;

    if (bounds && bounds.open) {
      const activePlanet = planets[targetIndex];
      const baseR = activePlanet ? activePlanet.getBaseRadius(width, height) : 0;

      if (bounds.mode === "right") {
        const rightPad = clamp(width * 0.015, 8, 16);
        const leftPad = 10;
        const availW = Math.max(120, width - bounds.width - rightPad - leftPad);
        const targetCenterX = leftPad + availW * 0.5;
        targetShiftX = targetCenterX - width * 0.5;

        const topHudClear = height <= 420 ? 52 : 66;
        const availH = Math.max(120, height - topHudClear - 12);
        const targetCenterY = topHudClear + availH * 0.5;
        targetShiftY = targetCenterY - height * 0.47;

        const maxFitR = Math.min(availW * 0.43, availH * 0.45);
        targetScale = baseR > maxFitR && baseR > 0 ? clamp(maxFitR / baseR, 0.50, 1) : 1;
      } else if (bounds.mode === "bottom") {
        const topHudClear = width >= 1040 ? 20 : 62;
        const bottomPad = 14;
        const availH = Math.max(120, height - bounds.height - bottomPad - topHudClear);
        targetShiftX = 0;
        targetShiftY = topHudClear + availH * 0.5 - height * 0.47;

        const maxFitR = Math.min(width * 0.42, availH * 0.44);
        targetScale = baseR > maxFitR && baseR > 0 ? clamp(maxFitR / baseR, 0.45, 1) : 1;
      }
    }

    const drawerLerp = 1 - Math.exp(-10 * dtSec);
    drawerShiftX += (targetShiftX - drawerShiftX) * drawerLerp;
    drawerShiftY += (targetShiftY - drawerShiftY) * drawerLerp;
    drawerScale += (targetScale - drawerScale) * drawerLerp;
    if (Math.abs(targetShiftX - drawerShiftX) < 0.25) drawerShiftX = targetShiftX;
    if (Math.abs(targetShiftY - drawerShiftY) < 0.25) drawerShiftY = targetShiftY;
    if (Math.abs(targetScale - drawerScale) < 0.001) drawerScale = targetScale;

    if (!isDragging || gestureMode !== "scroll") {
      const diff = targetIndex - scrollPos;
      if (Math.abs(diff) < 0.0005) {
        scrollPos = targetIndex;
      } else {
        scrollPos += diff * (1 - Math.exp(-10 * dtSec));
      }
    }

    const dScroll = scrollPos - prevScroll;
    const zoomLerp = 1 - Math.exp(-10 * dtSec);
    const lookLerp = 1 - Math.exp(-9 * dtSec);
    const inertiaDecay = Math.exp(-5.5 * dtSec);
    const autoBlendLerp = 1 - Math.exp(-4 * dtSec);

    // Update zoom, look-at focus, orbit inertia, and smart auto-spin per planet
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      const zDiff = p.targetZoom - p.zoom;
      if (Math.abs(zDiff) < 0.0005) {
        p.zoom = p.targetZoom;
      } else {
        p.zoom += zDiff * zoomLerp;
      }

      const activelyOrbitingThis = isDragging && gestureMode === "orbit" && i === targetIndex;

      if (p.lookTarget) {
        const syDiff = p.lookTarget.spinY - p.spinY;
        const pxDiff = p.lookTarget.pitchOffset - p.pitchOffset;
        p.spinY += syDiff * lookLerp;
        p.pitchOffset += pxDiff * lookLerp;
        if (Math.abs(syDiff) < 0.002 && Math.abs(pxDiff) < 0.002) {
          p.spinY = p.lookTarget.spinY;
          p.pitchOffset = p.lookTarget.pitchOffset;
          p.lookTarget = null;
        }
      } else if (!activelyOrbitingThis) {
        if (p.spinVelY !== 0 || p.pitchVelX !== 0) {
          p.spinY += p.spinVelY * dtSec;
          p.pitchOffset = clamp(
            p.pitchOffset + p.pitchVelX * dtSec,
            -MAX_PITCH - p.basePitch,
            MAX_PITCH - p.basePitch
          );
          p.spinVelY *= inertiaDecay;
          p.pitchVelX *= inertiaDecay;
          if (Math.abs(p.spinVelY) < 0.002) p.spinVelY = 0;
          if (Math.abs(p.pitchVelX) < 0.002) p.pitchVelX = 0;
        }

        const isActivePlanet = i === targetIndex;
        const shouldAutoSpin =
          !isActivePlanet ||
          (!isDragging &&
            !isHoveringPlanet &&
            p.targetZoom <= 1.04 &&
            selectedHexByPlanet[i] === null &&
            Math.abs(p.spinVelY) <= 0.02 &&
            time - lastInteractionTime >= IDLE_SPIN_DELAY_MS);

        const targetBlend = shouldAutoSpin ? 1 : 0;
        p.autoSpinBlend += (targetBlend - p.autoSpinBlend) * autoBlendLerp;
        p.spinY += p.spinSpeed * p.autoSpinBlend * dtSec;
      }

      p.spinY -= dScroll * 1.6;
    }

    // Subtle background star parallax linked to planet scroll motion
    if (dScroll !== 0 && window.SpaceBackground && typeof window.SpaceBackground.addParallax === "function") {
      window.SpaceBackground.addParallax(-dScroll * Math.max(width * 0.35, 220));
    }

    updateIndicatorDots();
    updateControlStates();

    ctx.clearRect(0, 0, width, height);

    if (Math.abs(Math.round(clamp(scrollPos, 0, PLANET_COUNT - 1)) - scrollPos) >= 0.15) {
      focusedHitPolys = [];
    }

    // Strictly render only planets within (-1, +1) of current scroll position
    for (let i = 0; i < planets.length; i++) {
      const rel = i - scrollPos;
      if (Math.abs(rel) >= 0.999) {
        continue;
      }
      const transform = getPlanetTransform(planets[i], i);
      drawPlanet(planets[i], transform, time, dtSec);
    }

    window.requestAnimationFrame(render);
  }

  // --- Input & Multi-Touch Gesture Handlers ---

  function getPinchDistance() {
    const iter = activePointers.values();
    const p1 = iter.next().value;
    const p2 = iter.next().value;
    if (!p1 || !p2) return 0;
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;

    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) { }
    }

    if (activePointers.size === 2) {
      gestureMode = "pinch";
      wasPinchGesture = true;
      isDragging = true;
      pinchStartDist = Math.max(20, getPinchDistance());
      const activePlanet = planets[targetIndex];
      pinchStartZoom = activePlanet ? activePlanet.zoom : 1.0;
      if (activePlanet) {
        activePlanet.lookTarget = null;
        activePlanet.spinVelY = 0;
        activePlanet.pitchVelX = 0;
      }
      lastInteractionTime = performance.now();
      return;
    }

    if (activePointers.size > 2 || activePointerId !== null) return;

    activePointerId = e.pointerId;
    isDragging = true;
    wasPinchGesture = false;
    startSnapIndex = Math.round(clamp(scrollPos, 0, PLANET_COUNT - 1));
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    lastPointerTime = performance.now();
    pointerVelocity = 0;
    totalDragDistance = 0;
    lastInteractionTime = lastPointerTime;

    if (isPointOnPlanet(e.clientX, e.clientY)) {
      gestureMode = "orbit";
      const activePlanet = planets[startSnapIndex];
      if (activePlanet) {
        activePlanet.lookTarget = null;
        activePlanet.spinVelY = 0;
        activePlanet.pitchVelX = 0;
      }
    } else {
      gestureMode = "scroll";
    }

    canvas.classList.add("is-dragging");
  }

  function onPointerMove(e) {
    if (activePointers.has(e.pointerId)) {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (!isDragging) {
      if (e.pointerType === "mouse") {
        isHoveringPlanet = isPointOnPlanet(e.clientX, e.clientY);
        const hit = isHoveringPlanet ? findHexAtPoint(e.clientX, e.clientY, false) : null;
        hoveredHexId = hit ? hit.hexId : null;
        canvas.style.cursor = hit ? "pointer" : "grab";
      }
      return;
    }

    const now = performance.now();

    if (gestureMode === "pinch" && activePointers.size >= 2) {
      const curDist = getPinchDistance();
      const activePlanet = planets[targetIndex];
      if (activePlanet && pinchStartDist > 0) {
        const nextZoom = clamp(pinchStartZoom * (curDist / pinchStartDist), MIN_ZOOM, MAX_ZOOM);
        activePlanet.targetZoom = nextZoom;
        activePlanet.zoom = nextZoom;
        lastInteractionTime = now;
      }
      return;
    }

    if (e.pointerId !== activePointerId) return;

    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    const dtMs = Math.max(1, now - lastPointerTime);
    const dtSec = dtMs / 1000;

    totalDragDistance += Math.hypot(dx, dy);
    lastInteractionTime = now;

    if (gestureMode === "orbit") {
      const activePlanet = planets[startSnapIndex];
      if (activePlanet) {
        const transform = getPlanetTransform(activePlanet, startSnapIndex);
        const cosZ = Math.cos(activePlanet.roll);
        const sinZ = Math.sin(activePlanet.roll);
        const dx2 = dx * cosZ - dy * sinZ;
        const dy2 = dx * sinZ + dy * cosZ;
        const radPerPx = 1.55 / Math.max(80, transform.scaledRadius);

        const dSpin = dx2 * radPerPx;
        const dPitch = dy2 * radPerPx;

        activePlanet.spinY += dSpin;
        activePlanet.pitchOffset = clamp(
          activePlanet.pitchOffset + dPitch,
          -MAX_PITCH - activePlanet.basePitch,
          MAX_PITCH - activePlanet.basePitch
        );

        const instSpinVel = clamp(dSpin / dtSec, -4.5, 4.5);
        const instPitchVel = clamp(dPitch / dtSec, -4.5, 4.5);
        activePlanet.spinVelY = activePlanet.spinVelY * 0.5 + instSpinVel * 0.5;
        activePlanet.pitchVelX = activePlanet.pitchVelX * 0.5 + instPitchVel * 0.5;

        if (window.SpaceBackground && typeof window.SpaceBackground.addParallax === "function") {
          window.SpaceBackground.addParallax(dx * 0.14);
        }
      }
    } else if (gestureMode === "scroll") {
      pointerVelocity = pointerVelocity * 0.55 + (dx / dtMs) * 0.45;

      const dragScale = Math.max(260, width * 0.52);
      let deltaUnits = -dx / dragScale;

      if ((scrollPos < 0 && deltaUnits < 0) || (scrollPos > PLANET_COUNT - 1 && deltaUnits > 0)) {
        deltaUnits *= 0.3;
      }

      scrollPos = clamp(scrollPos + deltaUnits, -0.22, PLANET_COUNT - 1 + 0.22);
    }

    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    lastPointerTime = now;
  }

  function handleTap(e) {
    const now = performance.now();
    const onPlanet = isPointOnPlanet(e.clientX, e.clientY);
    const activePlanet = planets[startSnapIndex];
    const isDoubleTap =
      onPlanet &&
      now - lastTapTime < DOUBLE_TAP_MS &&
      Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 36;

    const hit = findHexAtPoint(e.clientX, e.clientY, true);

    if (isDoubleTap && activePlanet) {
      activePlanet.targetZoom = activePlanet.targetZoom > 1.25 ? MIN_ZOOM : 1.65;
      if (hit) {
        selectedHexByPlanet[hit.planetId] = hit.hexId;
        const tile = activePlanet.tileById[hit.hexId];
        if (tile) {
          focusOnTile(activePlanet, tile);
        }
        selectionPulse = { planetId: hit.planetId, tileId: hit.hexId, startTime: now };
        if (window.GameBuildings) {
          const placed = buildingsByPlanet[hit.planetId][hit.hexId];
          window.GameBuildings.openForTile(hit.planetId, hit.hexId, placed ? placed.id : null, tile ? tile.biome : null);
        }
      }
      lastTapTime = 0;
      lastInteractionTime = now;
      return;
    }

    lastTapTime = now;
    lastTapX = e.clientX;
    lastTapY = e.clientY;

    if (hit) {
      const currentSelected = selectedHexByPlanet[hit.planetId];
      if (currentSelected === hit.hexId) {
        selectedHexByPlanet[hit.planetId] = null;
        selectionPulse = null;
        if (window.GameBuildings) {
          window.GameBuildings.close(false);
        }
      } else {
        selectedHexByPlanet[hit.planetId] = hit.hexId;
        const planet = planets[hit.planetId];
        const tile = planet && planet.tileById[hit.hexId];
        if (tile) {
          focusOnTile(planet, tile);
        }
        selectionPulse = { planetId: hit.planetId, tileId: hit.hexId, startTime: now };
        if (window.GameBuildings) {
          const placed = buildingsByPlanet[hit.planetId][hit.hexId];
          window.GameBuildings.openForTile(hit.planetId, hit.hexId, placed ? placed.id : null, tile ? tile.biome : null);
        }
      }
    } else if (!onPlanet) {
      selectedHexByPlanet[startSnapIndex] = null;
      selectionPulse = null;
      if (window.GameBuildings) {
        window.GameBuildings.close(false);
      }
    }

    lastInteractionTime = now;
  }

  function finishPointerGesture(e, wasCanceled) {
    activePointers.delete(e.pointerId);

    if (canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) { }
    }

    if (wasPinchGesture) {
      if (activePointers.size === 0) {
        isDragging = false;
        activePointerId = null;
        gestureMode = null;
        wasPinchGesture = false;
        canvas.classList.remove("is-dragging");
      }
      return;
    }

    if (!isDragging || e.pointerId !== activePointerId) return;

    const finishedMode = gestureMode;
    isDragging = false;
    activePointerId = null;
    gestureMode = null;
    canvas.classList.remove("is-dragging");

    const idleAfterMoveMs = performance.now() - lastPointerTime;
    if (idleAfterMoveMs > 80) {
      pointerVelocity = 0;
      const activePlanet = planets[startSnapIndex];
      if (activePlanet) {
        activePlanet.spinVelY = 0;
        activePlanet.pitchVelX = 0;
      }
    }

    if (!wasCanceled && totalDragDistance < 10) {
      handleTap(e);
      targetIndex = startSnapIndex;
      return;
    }

    if (finishedMode === "orbit") {
      return;
    }

    if (pointerVelocity < -0.35) {
      targetIndex = Math.min(PLANET_COUNT - 1, Math.max(startSnapIndex + 1, Math.round(scrollPos)));
    } else if (pointerVelocity > 0.35) {
      targetIndex = Math.max(0, Math.min(startSnapIndex - 1, Math.round(scrollPos)));
    } else {
      targetIndex = clamp(Math.round(scrollPos), 0, PLANET_COUNT - 1);
    }
    hoveredHexId = null;
  }

  function onWheel(e) {
    e.preventDefault();
    const now = performance.now();

    if (isPointOnPlanet(e.clientX, e.clientY)) {
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      adjustZoom(-delta * 0.0015);
      return;
    }

    if (now < wheelCooldownUntil) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 10) return;

    const step = delta > 0 ? 1 : -1;
    goToPlanet(targetIndex + step);
    wheelCooldownUntil = now + 260;
  }

  function onKeyDown(e) {
    const activeTag = document.activeElement && document.activeElement.tagName;
    if (
      isRenamingPlanet ||
      activeTag === "INPUT" ||
      activeTag === "TEXTAREA" ||
      (document.activeElement && document.activeElement.isContentEditable)
    ) {
      return;
    }
    if (e.key === "ArrowRight") {
      goToPlanet(targetIndex + 1);
    } else if (e.key === "ArrowLeft") {
      goToPlanet(targetIndex - 1);
    } else if (e.key === "+" || e.key === "=") {
      adjustZoom(ZOOM_STEP);
    } else if (e.key === "-" || e.key === "_") {
      adjustZoom(-ZOOM_STEP);
    } else if (e.key === "Escape") {
      selectedHexByPlanet[targetIndex] = null;
      selectionPulse = null;
      if (window.GameBuildings) {
        window.GameBuildings.close(false);
      }
    }
  }

  function bindEvents() {
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", onKeyDown);

    if (canvas) {
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", function (e) {
        finishPointerGesture(e, false);
      });
      canvas.addEventListener("pointercancel", function (e) {
        finishPointerGesture(e, true);
      });
      canvas.addEventListener("pointerleave", function () {
        hoveredHexId = null;
        isHoveringPlanet = false;
      });
      canvas.addEventListener("wheel", onWheel, { passive: false });
    }

    for (let i = 0; i < dotButtons.length; i++) {
      dotButtons[i].addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (!Number.isNaN(idx)) {
          goToPlanet(idx);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToPlanet(targetIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToPlanet(targetIndex + 1);
      });
    }
    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", function () {
        adjustZoom(ZOOM_STEP);
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", function () {
        adjustZoom(-ZOOM_STEP);
      });
    }

    if (renamePlanetBtn) {
      renamePlanetBtn.addEventListener("pointerdown", function (e) {
        if (isRenamingPlanet) {
          e.preventDefault();
        }
      });
      renamePlanetBtn.addEventListener("click", function () {
        if (isRenamingPlanet) {
          finishPlanetRename(true);
        } else {
          startPlanetRename();
        }
      });
    }

    if (planetHudNameInputEl) {
      planetHudNameInputEl.addEventListener("input", function () {
        if (this.value.length > MAX_PLANET_NAME_LEN) {
          this.value = this.value.slice(0, MAX_PLANET_NAME_LEN);
        }
      });
      planetHudNameInputEl.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          finishPlanetRename(true);
          planetHudNameInputEl.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          finishPlanetRename(false);
          planetHudNameInputEl.blur();
        }
      });
      planetHudNameInputEl.addEventListener("blur", function () {
        if (isRenamingPlanet) {
          finishPlanetRename(true);
        }
      });
    }
  }

  function init() {
    if (!canvas || !ctx) return;

    if (window.GameBuildings) {
      window.GameBuildings.setHandlers({
        onPlace: function (buildingId) {
          const tileId = selectedHexByPlanet[targetIndex];
          if (!tileId) return;
          const existing = buildingsByPlanet[targetIndex][tileId];
          if (existing && existing.id === buildingId) return;

          const planet = planets[targetIndex];
          const tile = planet && planet.tileById[tileId];
          const bld = window.GameBuildings.getBuilding(buildingId);
          if (!bld || !tile) return;
          if (!window.GameBuildings.canBuildOnBiome(buildingId, tile.biome)) return;
          if (bld.cost && window.GameCurrencies && !window.GameCurrencies.spend(bld.cost)) {
            return;
          }

          const now = performance.now();
          buildingsByPlanet[targetIndex][tileId] = {
            id: buildingId,
            placedAt: now
          };
          tileEffectsByPlanet[targetIndex][tileId] = {
            type: "build",
            prevBuildingId: existing ? existing.id : null,
            startTime: now,
            duration: BUILD_VFX_MS,
            seed: tileId * 1.37 + (now % 97) * 0.013
          };
          selectionPulse = {
            planetId: targetIndex,
            tileId: tileId,
            startTime: now
          };
          lastInteractionTime = now;
          updatePlanetStatsHud(true);
          window.GameBuildings.updateCurrentBuilding(buildingId);
        },
        onRemove: function () {
          const tileId = selectedHexByPlanet[targetIndex];
          if (!tileId) return;
          const removed = buildingsByPlanet[targetIndex][tileId];
          if (!removed) return;

          const now = performance.now();
          delete buildingsByPlanet[targetIndex][tileId];
          tileEffectsByPlanet[targetIndex][tileId] = {
            type: "demolish",
            buildingId: removed.id,
            startTime: now,
            duration: DEMOLISH_VFX_MS,
            seed: tileId * 2.13 + (now % 97) * 0.017
          };
          lastInteractionTime = now;
          updatePlanetStatsHud(true);
          window.GameBuildings.updateCurrentBuilding(null);
        },
        onClose: function () {
          selectedHexByPlanet[targetIndex] = null;
          selectionPulse = null;
          lastInteractionTime = performance.now();
        }
      });
    }

    loadSavedPlanetNames();
    resizeCanvas();
    updateIndicatorDots();
    updateControlStates();
    bindEvents();
    window.requestAnimationFrame(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
