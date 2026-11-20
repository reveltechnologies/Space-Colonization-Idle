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
  const planetHudLockEl = document.getElementById("planet-hud-lock");
  const planetHudNameEl = document.getElementById("planet-hud-name");
  const citizensCurrEl = document.getElementById("val-citizens-curr");
  const citizensMaxEl = document.getElementById("val-citizens-max");
  const citizensStatBar = document.getElementById("planet-stat-citizens");
  const citizensMeterFillEl = document.getElementById("meter-citizens-fill");
  const energyCurrEl = document.getElementById("val-energy-curr");
  const energyMaxEl = document.getElementById("val-energy-max");
  const energyStatBar = document.getElementById("planet-stat-energy");
  const energyMeterFillEl = document.getElementById("meter-energy-fill");
  const bricksValEl = document.getElementById("val-bricks");
  const bricksRateEl = document.getElementById("rate-bricks");
  const bricksStatBar = document.getElementById("planet-stat-bricks");
  const tileResearchBtn = document.getElementById("btn-tile-research-tree");
  const tileRocketActionsEl = document.getElementById("tile-rocket-actions");
  const tileRocketCargoBtn = document.getElementById("btn-tile-rocket-cargo");
  const tileRocketCargoLabelEl = document.getElementById("tile-rocket-cargo-label");
  const tileRocketLaunchBtn = document.getElementById("btn-tile-rocket-launch");
  const tileRocketLaunchIconEl = document.getElementById("tile-rocket-launch-icon");
  const tileTradeActionsEl = document.getElementById("tile-trade-actions");
  const tileTradeToggleBtn = document.getElementById("btn-tile-trade-toggle");
  const tileTradeToggleIconEl = document.getElementById("tile-trade-toggle-icon");
  const tileTradeToggleLabelEl = document.getElementById("tile-trade-toggle-label");
  const tileTradeUpgradeBtn = document.getElementById("btn-tile-trade-upgrade");
  const tileTradeUpgradeIconEl = document.getElementById("tile-trade-upgrade-icon");
  const tileTradeUpgradeLabelEl = document.getElementById("tile-trade-upgrade-label");
  const followRocketBtn = document.getElementById("btn-follow-rocket");
  const followRocketIconEl = document.getElementById("follow-rocket-icon");
  const followRocketLabelEl = document.getElementById("follow-rocket-label");
  const rocketCargoModalEl = document.getElementById("rocket-cargo-modal");
  const rocketCargoBackdropEl = rocketCargoModalEl
    ? rocketCargoModalEl.querySelector(".rocket-cargo-backdrop")
    : null;
  const rocketCargoIconEl = document.getElementById("rocket-cargo-icon");
  const rocketCargoTitleEl = document.getElementById("rocket-cargo-title");
  const rocketCargoDestPillEl = document.getElementById("rocket-cargo-dest-pill");
  const closeRocketCargoBtn = document.getElementById("btn-close-rocket-cargo");
  const rocketCargoCrewValEl = document.getElementById("rocket-cargo-crew-val");
  const rocketCargoCrewAvailEl = document.getElementById("rocket-cargo-crew-avail");
  const rocketCargoBricksValEl = document.getElementById("rocket-cargo-bricks-val");
  const rocketCargoBricksStockEl = document.getElementById("rocket-cargo-bricks-stock");
  const rocketCargoSliderEl = document.getElementById("rocket-cargo-bricks-slider");
  const cargoEmptyBtn = document.getElementById("btn-cargo-empty");
  const cargoMinusBtn = document.getElementById("btn-cargo-minus");
  const cargoPlusBtn = document.getElementById("btn-cargo-plus");
  const cargoMaxBtn = document.getElementById("btn-cargo-max");
  const cargoDoneBtn = document.getElementById("btn-cargo-done");
  const cargoLaunchBtn = document.getElementById("btn-cargo-launch");
  const hudResourceTooltipEl = document.getElementById("hud-resource-tooltip");
  const hudTooltipIconEl = document.getElementById("hud-resource-tooltip-icon");
  const hudTooltipTitleEl = document.getElementById("hud-resource-tooltip-title");
  const hudTooltipTagEl = document.getElementById("hud-resource-tooltip-tag");
  const hudTooltipStatEl = document.getElementById("hud-resource-tooltip-stat");
  const hudTooltipDescEl = document.getElementById("hud-resource-tooltip-desc");
  const resourceTooltipTriggers = Array.from(document.querySelectorAll("[data-resource-tooltip]"));

  const PLANET_COUNT = 3;
  const PLANET_NAMES_STORAGE_KEY = "sci_planet_names_v1";
  const MAX_PLANET_NAME_LEN = 28;
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

  function t(key, params) {
    if (window.GameLang && typeof window.GameLang.t === "function") {
      return window.GameLang.t(key, params);
    }
    return String(key || "");
  }

  // Three distinct 3D geodesic planets (Small -> Medium -> Large)
  const planets = [
    {
      id: 0,
      defaultName: t("planets.planet_1.default_name"),
      name: t("planets.planet_1.default_name"),
      typeId: "rocky",
      accent: "#cbd5e1",
      accentBg: "#25344d",
      iconSrc: "./assets/ui/planet-rocky.svg",
      freq: 2,
      unlocked: true,
      requiredRocketTier: 0,
      shadowAmount: 0,
      unlockVfx: null,
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
      defaultName: t("planets.planet_2.default_name"),
      name: t("planets.planet_2.default_name"),
      typeId: "oceanic",
      accent: "#38bdf8",
      accentBg: "#0f3a5c",
      iconSrc: "./assets/ui/planet-oceanic.svg",
      freq: 3,
      unlocked: false,
      requiredRocketTier: 1,
      shadowAmount: 1,
      unlockVfx: null,
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
      defaultName: t("planets.planet_3.default_name"),
      name: t("planets.planet_3.default_name"),
      typeId: "volcanic",
      accent: "#fb923c",
      accentBg: "#571e12",
      iconSrc: "./assets/ui/planet-volcanic.svg",
      freq: 4,
      unlocked: false,
      requiredRocketTier: 2,
      shadowAmount: 1,
      unlockVfx: null,
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
  let lastRenderScrollPos = 0;
  let targetIndex = 0;
  let activeDotIndex = 0;

  function readEconomyNumber(path, fallback) {
    if (!window.GameEconomy || typeof window.GameEconomy.get !== "function") {
      return fallback;
    }
    const val = window.GameEconomy.get(path, fallback);
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  }

  const startingBricksCfg = window.GameEconomy ? window.GameEconomy.get("planets.startingBricks") : null;
  const baseCitizensCfg = window.GameEconomy ? window.GameEconomy.get("planets.baseCitizens") : null;
  const startingCitizensCfg = window.GameEconomy ? window.GameEconomy.get("planets.startingCitizens") : null;
  const baseCitizensByPlanet = Array.isArray(baseCitizensCfg)
    ? [
        Math.max(0, Number(baseCitizensCfg[0]) || 0),
        Math.max(0, Number(baseCitizensCfg[1]) || 0),
        Math.max(0, Number(baseCitizensCfg[2]) || 0)
      ]
    : [1, 0, 0];

  // Interactive hex, buildings & QoL state
  const selectedHexByPlanet = [null, null, null];
  const buildingsByPlanet = [Object.create(null), Object.create(null), Object.create(null)];
  const tileEffectsByPlanet = [Object.create(null), Object.create(null), Object.create(null)];
  const bricksByPlanet = Array.isArray(startingBricksCfg)
    ? [Number(startingBricksCfg[0]) || 0, Number(startingBricksCfg[1]) || 0, Number(startingBricksCfg[2]) || 0]
    : [0, 0, 0];
  const citizensByPlanet = Array.isArray(startingCitizensCfg)
    ? [
        Math.max(baseCitizensByPlanet[0], Number(startingCitizensCfg[0]) || 0),
        Math.max(baseCitizensByPlanet[1], Number(startingCitizensCfg[1]) || 0),
        Math.max(baseCitizensByPlanet[2], Number(startingCitizensCfg[2]) || 0)
      ]
    : [baseCitizensByPlanet[0], baseCitizensByPlanet[1], baseCitizensByPlanet[2]];
  const CITIZEN_REGEN_PER_SEC = readEconomyNumber("planets.citizenRegenPerSec", 0.08);
  const BASE_ORE_RATE_PER_SEC = Math.max(0, readEconomyNumber("currencies.ore.baseRatePerSec", 0));
  let lastSyncedOreRate = -1;
  const BUILD_VFX_MS = 760;
  const DEMOLISH_VFX_MS = 900;
  const UNLOCK_SHATTER_MS = 1550;
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
  const bricksHudState = { planet: -1, amount: -1, rateText: "", bumpTimer: 0 };
  const researchButtonAnchor = {
    visible: false,
    x: 0,
    y: 0,
    isBelow: false,
    planetId: -1
  };
  const rocketActionAnchor = {
    visible: false,
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
    minY: 0,
    maxY: 0,
    halfClearX: 48,
    halfClearY: 48,
    planetId: -1,
    tileId: null,
    buildingId: null
  };
  const tradeActionAnchor = {
    visible: false,
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
    minY: 0,
    maxY: 0,
    halfClearX: 48,
    halfClearY: 48,
    planetId: -1,
    tileId: null,
    buildingId: null
  };
  const activeFlights = [];
  const activeTradeFlights = [];
  const TRADE_FLIGHT_BASE_MS = readEconomyNumber("planets.tradeFlightBaseMs", 1400);
  let nextFlightId = 1;
  let nextBuildingOrder = 1;
  let lastBackgroundPerfMs = 0;
  let followingFlightId = null;

  function notifySave(reason, immediate) {
    if (window.GameSave && typeof window.GameSave.requestSave === "function") {
      window.GameSave.requestSave(reason, Boolean(immediate));
    }
  }
  const cargoModalState = { open: false, planetId: -1, tileId: null };
  const RESOURCE_TOOLTIP_META = {
    credits: { iconSrc: "./assets/ui/icon-credits.svg", scope: "global" },
    ore: { iconSrc: "./assets/ui/icon-ore.svg", scope: "global" },
    citizens: { iconSrc: "./assets/ui/icon-citizen.svg", scope: "planet" },
    energy: { iconSrc: "./assets/ui/icon-energy.svg", scope: "planet" },
    bricks: { iconSrc: "./assets/ui/icon-bricks.svg", scope: "planet" }
  };
  const resourceTooltipState = { open: false, key: null, triggerEl: null };
  const blockedOverlayIcons = {
    energy: (function () {
      const img = new Image();
      img.src = "./assets/ui/icon-energy.svg";
      return img;
    })(),
    citizens: (function () {
      const img = new Image();
      img.src = "./assets/ui/icon-citizen.svg";
      return img;
    })(),
    bricks: (function () {
      const img = new Image();
      img.src = "./assets/ui/icon-bricks.svg";
      return img;
    })()
  };
  let lastHeaderPlanet = -1;
  let emblemPopTimer = 0;
  let isRenamingPlanet = false;
  let renamingPlanetIndex = -1;

  function sanitizePlanetName(raw, fallback) {
    const cleaned = String(raw || "").replace(/\s+/g, " ").trim().slice(0, MAX_PLANET_NAME_LEN);
    return cleaned || fallback;
  }

  function getPlanetName(planet, fallbackIdx) {
    if (planet) {
      if (planet.name) return planet.name;
      if (planet.defaultName) return planet.defaultName;
    }
    const idx = clamp(Math.round(fallbackIdx || 0), 0, PLANET_COUNT - 1);
    return t("planets.planet_" + (idx + 1) + ".default_name");
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
    if (!p || !p.unlocked) return;

    isRenamingPlanet = true;
    renamingPlanetIndex = activeDotIndex;
    planetHudNameInputEl.value = p.name;
    planetDeckHeaderEl.classList.add("is-editing");

    if (renamePlanetBtn) {
      const saveLabel = t("planet.save_name");
      renamePlanetBtn.title = saveLabel;
      renamePlanetBtn.setAttribute("aria-label", saveLabel);
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
      const renameLabel = t("planet.rename");
      renamePlanetBtn.title = renameLabel;
      renamePlanetBtn.setAttribute("aria-label", renameLabel);
    }

    if (commit && planets[idx] && planetHudNameInputEl) {
      planets[idx].name = sanitizePlanetName(planetHudNameInputEl.value, planets[idx].defaultName);
      savePlanetNames();
      if (dotButtons[idx]) {
        dotButtons[idx].setAttribute("aria-label", planets[idx].name);
      }
      notifySave("planet_rename", true);
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
    if (planetHudLockEl) {
      planetHudLockEl.classList.toggle("is-hidden", Boolean(p.unlocked));
    }
    if (planetHudNameEl) {
      planetHudNameEl.textContent = getPlanetName(p, activeDotIndex);
    }
    if (planetStatsDeckEl) {
      planetStatsDeckEl.setAttribute("data-planet", String(activeDotIndex));
      planetStatsDeckEl.setAttribute("data-planet-type", p.typeId);
      planetStatsDeckEl.classList.toggle("is-locked", !p.unlocked);
      planetStatsDeckEl.style.setProperty("--planet-accent", p.accent);
      planetStatsDeckEl.style.setProperty("--planet-accent-bg", p.accentBg);
    }
    if (planetHudEmblemEl) {
      planetHudEmblemEl.title = p.unlocked
        ? p.name
        : t("planet.requires_rocket_tier", { tier: p.requiredRocketTier || 1 });
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

  function countBuildingOnPlanet(planetIdx, buildingId) {
    const buildings = buildingsByPlanet[planetIdx];
    if (!buildings) return 0;
    let count = 0;
    const keys = Object.keys(buildings);
    for (let i = 0; i < keys.length; i++) {
      const bInfo = buildings[keys[i]];
      if (bInfo && bInfo.id === buildingId) {
        count++;
      }
    }
    return count;
  }

  function countBuildingGlobal(buildingId) {
    let total = 0;
    for (let i = 0; i < PLANET_COUNT; i++) {
      total += countBuildingOnPlanet(i, buildingId);
    }
    return total;
  }

  function calculateLandedRocketCitizenCapacity(planetIdx) {
    const buildings = buildingsByPlanet[planetIdx];
    if (!buildings) return 0;
    let cap = 0;
    const keys = Object.keys(buildings);
    for (let i = 0; i < keys.length; i++) {
      const bInfo = buildings[keys[i]];
      if (bInfo && bInfo.isLanded && bInfo.landedCitizens > 0) {
        cap += bInfo.landedCitizens;
      }
    }
    return cap;
  }

  function getPlanetBaseCitizenCount(planetIdx) {
    return Math.max(0, Math.floor(baseCitizensByPlanet[planetIdx] || 0));
  }

  function calculatePlanetCitizenCapacity(planetIdx) {
    const base = calculatePlanetStatCapacity(planetIdx, "citizenSlots");
    const mult =
      window.GameResearch && typeof window.GameResearch.getCitizenMultiplier === "function"
        ? window.GameResearch.getCitizenMultiplier()
        : 1;
    return getPlanetBaseCitizenCount(planetIdx) + Math.round(base * mult) + calculateLandedRocketCitizenCapacity(planetIdx);
  }

  function getPlanetCitizenCount(planetIdx) {
    const base = getPlanetBaseCitizenCount(planetIdx);
    const cap = calculatePlanetCitizenCapacity(planetIdx);
    const cur = Math.floor(citizensByPlanet[planetIdx] || 0);
    return Math.max(base, Math.min(cap, cur));
  }

  function allocatePlanetConsumers(planetIdx, reqField, totalSupply) {
    const buildings = buildingsByPlanet[planetIdx];
    const consumers = [];
    if (buildings && window.GameBuildings) {
      const keys = Object.keys(buildings);
      for (let i = 0; i < keys.length; i++) {
        const tileId = keys[i];
        const bInfo = buildings[tileId];
        if (!bInfo || !bInfo.id) continue;
        const bDef = window.GameBuildings.getBuilding(bInfo.id);
        if (bDef && bDef[reqField] > 0) {
          consumers.push({
            tileId: tileId,
            placedOrder: Number.isFinite(bInfo.placedOrder) ? bInfo.placedOrder : (bInfo.placedAt || 0),
            req: bDef[reqField]
          });
        }
      }
    }

    consumers.sort(function (a, b) {
      if (a.placedOrder !== b.placedOrder) return a.placedOrder - b.placedOrder;
      return Number(a.tileId) - Number(b.tileId);
    });

    let remaining = totalSupply;
    let used = 0;
    let required = 0;
    const activeTiles = Object.create(null);
    const blockedTiles = Object.create(null);

    for (let i = 0; i < consumers.length; i++) {
      const c = consumers[i];
      required += c.req;
      if (remaining >= c.req) {
        remaining -= c.req;
        used += c.req;
        activeTiles[c.tileId] = true;
      } else {
        blockedTiles[c.tileId] = true;
      }
    }

    return {
      available: remaining,
      used: used,
      required: required,
      activeTiles: activeTiles,
      blockedTiles: blockedTiles
    };
  }

  function getPlanetCitizenStatus(planetIdx) {
    const maxCitizens = calculatePlanetCitizenCapacity(planetIdx);
    const totalCitizens = getPlanetCitizenCount(planetIdx);
    const alloc = allocatePlanetConsumers(planetIdx, "citizensRequired", totalCitizens);
    return {
      maxCitizens: maxCitizens,
      totalCitizens: totalCitizens,
      availableCitizens: alloc.available,
      usedCitizens: alloc.used,
      requiredCitizens: alloc.required,
      staffedTiles: alloc.activeTiles,
      citizenBlockedTiles: alloc.blockedTiles
    };
  }

  function showGameToast(messageHtml, variant) {
    if (!window.GameBuildings) return;
    if (typeof window.GameBuildings.showToast === "function") {
      window.GameBuildings.showToast(messageHtml, variant);
    } else if (typeof window.GameBuildings.showErrorToast === "function") {
      window.GameBuildings.showErrorToast(messageHtml);
    }
  }

  function updatePlanetCitizenHud(force) {
    const cit = getPlanetCitizenStatus(activeDotIndex);
    syncStatBarHud(
      citizensCurrEl,
      citizensMaxEl,
      citizensStatBar,
      citizensMeterFillEl,
      citizensHudState,
      cit.availableCitizens,
      cit.maxCitizens,
      force
    );
  }

  function calculatePlanetEnergyCapacity(planetIdx) {
    const base = calculatePlanetStatCapacity(planetIdx, "energySlots");
    const mult =
      window.GameResearch && typeof window.GameResearch.getEnergyMultiplier === "function"
        ? window.GameResearch.getEnergyMultiplier()
        : 1;
    return Math.round(base * mult);
  }

  function getPlanetPowerStatus(planetIdx) {
    const maxEnergy = calculatePlanetEnergyCapacity(planetIdx);
    const alloc = allocatePlanetConsumers(planetIdx, "energyRequired", maxEnergy);
    return {
      maxEnergy: maxEnergy,
      availableEnergy: alloc.available,
      usedEnergy: alloc.used,
      requiredEnergy: alloc.required,
      poweredTiles: alloc.activeTiles,
      energyBlockedTiles: alloc.blockedTiles
    };
  }

  function isTileOperational(tileId, bDef, power, cit) {
    if (!bDef) return false;
    if (bDef.energyRequired > 0 && power.energyBlockedTiles[tileId]) return false;
    if (bDef.citizensRequired > 0 && cit.citizenBlockedTiles[tileId]) return false;
    return true;
  }

  function getPlanetEnergyCount(planetIdx) {
    return getPlanetPowerStatus(planetIdx).availableEnergy;
  }

  function updatePlanetEnergyHud(force) {
    const power = getPlanetPowerStatus(activeDotIndex);
    syncStatBarHud(
      energyCurrEl,
      energyMaxEl,
      energyStatBar,
      energyMeterFillEl,
      energyHudState,
      power.availableEnergy,
      power.maxEnergy,
      force
    );
  }

  function calculatePlanetBrickRate(planetIdx) {
    const buildings = buildingsByPlanet[planetIdx];
    if (!buildings || !window.GameBuildings) return 0;
    const power = getPlanetPowerStatus(planetIdx);
    const cit = getPlanetCitizenStatus(planetIdx);
    let rate = 0;
    const keys = Object.keys(buildings);
    for (let i = 0; i < keys.length; i++) {
      const tileId = keys[i];
      const bInfo = buildings[tileId];
      if (!bInfo || !bInfo.id) continue;
      const bDef = window.GameBuildings.getBuilding(bInfo.id);
      if (bDef && bDef.bricksPerSec) {
        if (!isTileOperational(tileId, bDef, power, cit)) continue;
        const mult =
          window.GameResearch && typeof window.GameResearch.getBrickMultiplier === "function"
            ? window.GameResearch.getBrickMultiplier(bDef.id)
            : 1;
        rate += bDef.bricksPerSec * mult;
      }
    }
    return rate;
  }

  function calculatePlanetResearchRate(planetIdx) {
    const buildings = buildingsByPlanet[planetIdx];
    if (!buildings || !window.GameBuildings) return 0;
    const power = getPlanetPowerStatus(planetIdx);
    const cit = getPlanetCitizenStatus(planetIdx);
    let base = 0;
    const keys = Object.keys(buildings);
    for (let i = 0; i < keys.length; i++) {
      const tileId = keys[i];
      const bInfo = buildings[tileId];
      if (!bInfo || !bInfo.id) continue;
      const bDef = window.GameBuildings.getBuilding(bInfo.id);
      if (bDef && bDef.researchPerSec) {
        if (!isTileOperational(tileId, bDef, power, cit)) continue;
        base += bDef.researchPerSec;
      }
    }
    const mult =
      window.GameResearch && typeof window.GameResearch.getResearchMultiplier === "function"
        ? window.GameResearch.getResearchMultiplier()
        : 1;
    return base * mult;
  }

  function calculateTotalResearchRate() {
    let total = 0;
    for (let i = 0; i < PLANET_COUNT; i++) {
      total += calculatePlanetResearchRate(i);
    }
    return total;
  }

  function calculatePlanetOreRate(planetIdx) {
    const buildings = buildingsByPlanet[planetIdx];
    if (!buildings || !window.GameBuildings) return 0;
    const power = getPlanetPowerStatus(planetIdx);
    const cit = getPlanetCitizenStatus(planetIdx);
    let total = 0;
    const keys = Object.keys(buildings);
    for (let i = 0; i < keys.length; i++) {
      const tileId = keys[i];
      const bInfo = buildings[tileId];
      if (!bInfo || !bInfo.id) continue;
      const bDef = window.GameBuildings.getBuilding(bInfo.id);
      if (!bDef) continue;
      const perSec =
        typeof window.GameBuildings.getBuildingOrePerSec === "function"
          ? window.GameBuildings.getBuildingOrePerSec(bDef)
          : bDef.orePerSec > 0
            ? bDef.orePerSec
            : bDef.orePerDay > 0
              ? bDef.orePerDay / 86400
              : 0;
      if (perSec > 0) {
        if (!isTileOperational(tileId, bDef, power, cit)) continue;
        total += perSec;
      }
    }
    return total;
  }

  function calculateTotalOreRate() {
    let total = 0;
    for (let i = 0; i < PLANET_COUNT; i++) {
      total += calculatePlanetOreRate(i);
    }
    return total;
  }

  function syncOreProductionRate(force) {
    const totalRate = BASE_ORE_RATE_PER_SEC + calculateTotalOreRate();
    if (!force && Math.abs(totalRate - lastSyncedOreRate) <= 1e-12) {
      return;
    }
    lastSyncedOreRate = totalRate;
    if (window.GameCurrencies && typeof window.GameCurrencies.setRate === "function") {
      window.GameCurrencies.setRate("ore", totalRate);
    }
  }

  function formatPlanetBrickRate(ratePerSec) {
    if (window.GameBuildings && typeof window.GameBuildings.formatProductionRate === "function") {
      return window.GameBuildings.formatProductionRate(ratePerSec);
    }
    return "";
  }

  function updatePlanetBricksHud(force) {
    if (!bricksValEl) return;
    const activeIdx = activeDotIndex;
    const shownAmount = Math.floor(bricksByPlanet[activeIdx] || 0);
    const rateText = formatPlanetBrickRate(calculatePlanetBrickRate(activeIdx));
    const changed =
      force ||
      activeIdx !== bricksHudState.planet ||
      shownAmount !== bricksHudState.amount ||
      rateText !== bricksHudState.rateText;
    if (!changed) return;

    const hadPrior = bricksHudState.planet !== -1 && bricksHudState.planet === activeIdx;
    const gained = hadPrior && shownAmount > bricksHudState.amount;

    bricksHudState.planet = activeIdx;
    bricksHudState.amount = shownAmount;
    bricksHudState.rateText = rateText;

    bricksValEl.textContent = formatPlanetStat(shownAmount);
    if (bricksRateEl) {
      bricksRateEl.textContent = rateText;
    }
    if (bricksStatBar) {
      bricksStatBar.classList.toggle("is-empty", shownAmount <= 0 && !rateText);
    }

    if (gained && bricksStatBar) {
      const valWrap = bricksStatBar.querySelector(".planet-stat-value");
      if (valWrap) {
        valWrap.classList.remove("is-bumped");
        void valWrap.offsetWidth;
        valWrap.classList.add("is-bumped");
        if (bricksHudState.bumpTimer) window.clearTimeout(bricksHudState.bumpTimer);
        bricksHudState.bumpTimer = window.setTimeout(function () {
          valWrap.classList.remove("is-bumped");
          bricksHudState.bumpTimer = 0;
        }, 160);
      }
    }
  }

  function updatePlanetStatsHud(force) {
    updatePlanetHeaderHud(force);
    updatePlanetCitizenHud(force);
    updatePlanetEnergyHud(force);
    updatePlanetBricksHud(force);
    syncOreProductionRate(force);
    if (resourceTooltipState.open) {
      updateResourceTooltipContent();
    }
  }

  function updateResourceTooltipContent() {
    if (!resourceTooltipState.open || !hudResourceTooltipEl) return;
    const key = resourceTooltipState.key;
    const meta = RESOURCE_TOOLTIP_META[key];
    if (!meta) return;

    hudResourceTooltipEl.setAttribute("data-resource", key);
    if (hudTooltipIconEl) {
      hudTooltipIconEl.src = meta.iconSrc;
    }
    if (hudTooltipTitleEl) {
      hudTooltipTitleEl.textContent = t("resource_tooltips." + key + ".title");
    }
    if (hudTooltipTagEl) {
      hudTooltipTagEl.textContent = t(
        meta.scope === "global" ? "resource_tooltips.global_tag" : "resource_tooltips.planet_tag"
      );
    }
    if (hudTooltipDescEl) {
      hudTooltipDescEl.textContent = t("resource_tooltips." + key + ".description");
    }

    if (hudTooltipStatEl) {
      let statText = "";
      if (key === "credits" || key === "ore") {
        const amt = window.GameCurrencies ? window.GameCurrencies.get(key) : 0;
        const rate =
          window.GameCurrencies && typeof window.GameCurrencies.getRate === "function"
            ? window.GameCurrencies.getRate(key)
            : 0;
        statText = t("resource_tooltips.current_label", { val: formatPlanetStat(amt) });
        if (rate > 0) {
          const rateFmt = formatPlanetBrickRate(rate);
          if (rateFmt) {
            statText += t("resource_tooltips.rate_suffix", { rate: rateFmt });
          }
        }
      } else if (key === "citizens") {
        const cit = getPlanetCitizenStatus(activeDotIndex);
        if (cit.totalCitizens < cit.maxCitizens) {
          statText = t("resource_tooltips.citizens_regen_label", {
            avail: formatPlanetStat(cit.availableCitizens),
            pop: formatPlanetStat(cit.totalCitizens),
            max: formatPlanetStat(cit.maxCitizens),
            used: formatPlanetStat(cit.usedCitizens)
          });
        } else {
          statText = t("resource_tooltips.citizens_avail_label", {
            avail: formatPlanetStat(cit.availableCitizens),
            max: formatPlanetStat(cit.maxCitizens),
            used: formatPlanetStat(cit.usedCitizens)
          });
        }
      } else if (key === "energy") {
        const power = getPlanetPowerStatus(activeDotIndex);
        statText = t("resource_tooltips.energy_avail_label", {
          avail: formatPlanetStat(power.availableEnergy),
          max: formatPlanetStat(power.maxEnergy),
          used: formatPlanetStat(power.usedEnergy)
        });
      } else if (key === "bricks") {
        const amt = Math.floor(bricksByPlanet[activeDotIndex] || 0);
        const rateText = formatPlanetBrickRate(calculatePlanetBrickRate(activeDotIndex));
        statText = t("resource_tooltips.current_label", { val: formatPlanetStat(amt) });
        if (rateText) {
          statText += t("resource_tooltips.rate_suffix", { rate: rateText });
        }
      }
      hudTooltipStatEl.textContent = statText;
    }
  }

  function positionResourceTooltip() {
    if (!resourceTooltipState.open || !hudResourceTooltipEl || !resourceTooltipState.triggerEl) return;
    const rect = resourceTooltipState.triggerEl.getBoundingClientRect();
    const tipW = hudResourceTooltipEl.offsetWidth || Math.min(304, Math.max(180, width - 16));
    const triggerCx = rect.left + rect.width * 0.5;
    const left = Math.round(clamp(triggerCx - tipW * 0.5, 8, Math.max(8, width - tipW - 8)));
    const top = Math.round(clamp(rect.bottom + 12, 12, Math.max(12, height - 140)));
    const arrowX = Math.round(clamp(triggerCx - left, 22, Math.max(22, tipW - 22)));
    hudResourceTooltipEl.style.left = left + "px";
    hudResourceTooltipEl.style.top = top + "px";
    hudResourceTooltipEl.style.setProperty("--arrow-x", arrowX + "px");
  }

  function syncResourceTooltipTriggers() {
    for (let i = 0; i < resourceTooltipTriggers.length; i++) {
      const el = resourceTooltipTriggers[i];
      const isActive = resourceTooltipState.open && el === resourceTooltipState.triggerEl;
      el.classList.toggle("is-tooltip-open", isActive);
      el.setAttribute("aria-expanded", isActive ? "true" : "false");
    }
  }

  function closeResourceTooltip() {
    if (!resourceTooltipState.open) return;
    resourceTooltipState.open = false;
    resourceTooltipState.key = null;
    resourceTooltipState.triggerEl = null;
    syncResourceTooltipTriggers();
    if (hudResourceTooltipEl) {
      hudResourceTooltipEl.classList.add("is-hidden");
      hudResourceTooltipEl.setAttribute("aria-hidden", "true");
    }
  }

  function openResourceTooltip(resourceKey, triggerEl) {
    if (!hudResourceTooltipEl || !triggerEl || !RESOURCE_TOOLTIP_META[resourceKey]) return;
    if (resourceTooltipState.open && resourceTooltipState.key === resourceKey) {
      closeResourceTooltip();
      return;
    }
    resourceTooltipState.open = true;
    resourceTooltipState.key = resourceKey;
    resourceTooltipState.triggerEl = triggerEl;
    syncResourceTooltipTriggers();
    hudResourceTooltipEl.classList.remove("is-hidden");
    hudResourceTooltipEl.setAttribute("aria-hidden", "false");
    updateResourceTooltipContent();
    positionResourceTooltip();
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
    if (resourceTooltipState.open) {
      positionResourceTooltip();
    }
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function updatePlanetLockDots() {
    for (let i = 0; i < dotButtons.length && i < planets.length; i++) {
      dotButtons[i].classList.toggle("is-locked", !planets[i].unlocked);
    }
  }

  function clearSelectionAndCloseBuildMenu() {
    for (let i = 0; i < selectedHexByPlanet.length; i++) {
      selectedHexByPlanet[i] = null;
    }
    selectionPulse = null;
    researchButtonAnchor.visible = false;
    rocketActionAnchor.visible = false;
    tradeActionAnchor.visible = false;
    if (tileResearchBtn) {
      tileResearchBtn.classList.add("is-hidden");
    }
    if (tileRocketActionsEl) {
      tileRocketActionsEl.classList.add("is-hidden");
    }
    if (tileTradeActionsEl) {
      tileTradeActionsEl.classList.add("is-hidden");
    }
    if (cargoModalState.open) {
      closeRocketCargoModal();
    }
    if (window.GameBuildings) {
      window.GameBuildings.close(false);
    }
  }

  function updateIndicatorDots() {
    const clamped = clamp(scrollPos, 0, PLANET_COUNT - 1);
    const nearest = Math.round(clamped);
    const planetChanged = nearest !== activeDotIndex;
    if (planetChanged || (dotButtons.length > 0 && !dotButtons[nearest].classList.contains("active"))) {
      activeDotIndex = nearest;
      if (planetChanged) {
        clearSelectionAndCloseBuildMenu();
      }
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
    updatePlanetLockDots();
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

    const zoomText = t("planet.zoom_format", { zoom: activePlanet.zoom.toFixed(1) });
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

  function goToPlanet(index, preserveFollow) {
    if (!preserveFollow) {
      followingFlightId = null;
    }
    if (isRenamingPlanet) {
      finishPlanetRename(true);
    }
    const nextIdx = clamp(Math.round(index), 0, PLANET_COUNT - 1);
    if (nextIdx !== targetIndex || nextIdx !== activeDotIndex) {
      clearSelectionAndCloseBuildMenu();
      for (let i = 0; i < planets.length; i++) {
        planets[i].targetZoom = MIN_ZOOM;
        if (i !== nextIdx) {
          planets[i].lookTarget = null;
        }
      }
      targetIndex = nextIdx;
      hoveredHexId = null;
      isHoveringPlanet = false;
      notifySave("planet_switch", false);
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

    if (planet.unlockVfx) {
      const unlockP = clamp((time - planet.unlockVfx.startTime) / planet.unlockVfx.duration, 0, 1);
      planet.shadowAmount = 1 - easeOutCubic(clamp(unlockP / 0.52, 0, 1));
      if (unlockP >= 1) {
        planet.shadowAmount = 0;
        planet.unlockVfx = null;
      }
    } else {
      planet.shadowAmount = planet.unlocked ? 0 : 1;
    }

    const shadow = planet.shadowAmount || 0;
    const drawAtmo =
      shadow > 0
        ? {
            r: Math.round(atmo.r + (14 - atmo.r) * shadow * 0.88),
            g: Math.round(atmo.g + (18 - atmo.g) * shadow * 0.88),
            b: Math.round(atmo.b + (34 - atmo.b) * shadow * 0.88)
          }
        : atmo;

    if (isFocused) {
      focusedHitPolys = [];
    }

    ctx.save();
    ctx.globalAlpha = transform.alpha;

    // 1. Outer 3D Atmospheric Halo
    const haloRadius = r * 1.28;
    const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, haloRadius);
    haloGrad.addColorStop(0, `rgba(${drawAtmo.r}, ${drawAtmo.g}, ${drawAtmo.b}, 0.28)`);
    haloGrad.addColorStop(0.55, `rgba(${drawAtmo.r}, ${drawAtmo.g}, ${drawAtmo.b}, 0.08)`);
    haloGrad.addColorStop(1, `rgba(${drawAtmo.r}, ${drawAtmo.g}, ${drawAtmo.b}, 0)`);
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

    const planetPower = getPlanetPowerStatus(planet.id);
    const planetCitizens = getPlanetCitizenStatus(planet.id);
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
            (0.52 * (0.28 + 0.72 * sideNdotL) +
              tile.emissive * (1 - shadow) * 0.35 +
              (isSelected ? 0.12 : 0)) *
            (1 - shadow * 0.84);

          const sr = clamp(Math.round(tile.rgb[0] * sideLight + 4 * shadow), 0, 255);
          const sg = clamp(Math.round(tile.rgb[1] * sideLight + 5 * shadow), 0, 255);
          const sb = clamp(Math.round(tile.rgb[2] * sideLight + 12 * shadow), 0, 255);

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
        const effEmissive = tile.emissive * (1 - shadow);
        const lightAmt =
          Math.min(1.18, 0.28 + 0.82 * ndotl + frontFill + effEmissive * (1 - ndotl * 0.6)) *
          (1 - shadow * 0.82);
        const specAmt = tile.spec * Math.pow(Math.max(0, dot(rotNormal, HALF_VEC)), 18) * (1 - shadow * 0.72);
        const fresnelAmt =
          Math.pow(Math.max(0, 1 - Math.max(0, rotNormal.z)), 2.6) * 0.28 * (1 - shadow * 0.65);
        const shadedRgb =
          shadow > 0
            ? [
                Math.round(tile.rgb[0] + (8 - tile.rgb[0]) * shadow * 0.82),
                Math.round(tile.rgb[1] + (10 - tile.rgb[1]) * shadow * 0.82),
                Math.round(tile.rgb[2] + (20 - tile.rgb[2]) * shadow * 0.82)
              ]
            : tile.rgb;
        const topFill = computeShadedColor(shadedRgb, lightAmt, specAmt, fresnelAmt, drawAtmo);

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
        const rimFade = clamp(entry.facingDot * 1.45, 0.30, 1.0) * (1 - shadow * 0.84);

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
          const placedDef =
            window.GameBuildings && typeof window.GameBuildings.getBuilding === "function"
              ? window.GameBuildings.getBuilding(entry.placed.id)
              : null;
          const isEnergyBlocked = Boolean(
            placedDef && placedDef.energyRequired > 0 && planetPower.energyBlockedTiles[tile.id]
          );
          const isCitizenBlocked = Boolean(
            placedDef && placedDef.citizensRequired > 0 && planetCitizens.citizenBlockedTiles[tile.id]
          );
          const isBricksBlocked = Boolean(
            placedDef &&
            placedDef.tradeVariant &&
            entry.placed.tradeEnabled &&
            Math.floor(bricksByPlanet[planet.id] || 0) <= 0
          );
          const activeFp =
            placedDef && placedDef.tradeVariant
              ? getActiveTradeFlightProgressForTile(planet.id, tile.id, time)
              : null;
          const bOpts =
            placedDef && placedDef.tradeVariant
              ? {
                  tradeEnabled: Boolean(entry.placed.tradeEnabled) && !isEnergyBlocked && !isCitizenBlocked && !isBricksBlocked,
                  tradeProgress:
                    entry.placed.tradeEnabled && !isEnergyBlocked && !isCitizenBlocked && !isBricksBlocked
                      ? clamp01((entry.placed.tradeTimer || 0) / placedDef.tradeIntervalSec)
                      : 0,
                  flightProgress: activeFp !== null ? activeFp : undefined
                }
              : undefined;

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
              const buildOpts = Object.assign({ scaleXY: 1 - stretch * 0.45, scaleZ: 1 + stretch }, bOpts || {});
              window.GameBuildings.renderBuilding3D(ctx, entry.placed.id, buildingFrame, time, pop, buildOpts);
            }
          } else {
            const buildElapsed = time - entry.placed.placedAt;
            const buildScale =
              buildElapsed >= 0 && buildElapsed < 280
                ? easeOutBack(buildElapsed / 280)
                : 1;
            window.GameBuildings.renderBuilding3D(ctx, entry.placed.id, buildingFrame, time, buildScale, bOpts);
          }

          if ((isEnergyBlocked || isCitizenBlocked || isBricksBlocked) && (!eff || eff.type !== "demolish")) {
            const badgeWorld = add(entry.elevPlaneCenter, scale(rotNormal, tile.hexScale * elev * 0.92));
            const badgePt = project(badgeWorld, cx, cy, focalLength);
            drawBuildingBlockedOverlay(
              ctx,
              badgePt.x,
              badgePt.y,
              tile.hexScale * elev,
              r,
              isEnergyBlocked,
              isCitizenBlocked,
              isBricksBlocked,
              time,
              tile.phase,
              (1 - shadow * 0.85) * transform.alpha
            );
          }
        }

        if (eff && typeof window.GameBuildings.renderTileEffect === "function") {
          window.GameBuildings.renderTileEffect(ctx, eff, buildingFrame, time);
        }

        const needsTileActionBounds =
          isFocused &&
          isSelected &&
          entry.placed &&
          (!eff || eff.type !== "demolish");
        if (needsTileActionBounds) {
          const isResearchCenter = entry.placed.id === "research_center";
          const isLaunchRocket =
            !entry.placed.isLanded &&
            (entry.placed.id === "space_rocket_1" || entry.placed.id === "space_rocket_2") &&
            planet.id + 1 < PLANET_COUNT;
          const placedBDef = window.GameBuildings ? window.GameBuildings.getBuilding(entry.placed.id) : null;
          const isTradeBuilding = Boolean(placedBDef && placedBDef.tradeVariant);
          const nextUpgradeDef =
            !entry.placed.isLanded &&
            window.GameBuildings &&
            typeof window.GameBuildings.getNextUpgradeBuilding === "function"
              ? window.GameBuildings.getNextUpgradeBuilding(entry.placed.id, tile.biome)
              : null;
          const hasTradeOrUpgrade = isTradeBuilding || Boolean(nextUpgradeDef);

          if (isResearchCenter || isLaunchRocket || hasTradeOrUpgrade) {
            const bBounds = computeSelectedBuildingScreenBounds(entry, buildingFrame, cx, cy, focalLength);
            if (isResearchCenter) {
              const topY = bBounds.minY - 14;
              const flipBelow = topY < 82;
              researchButtonAnchor.visible = true;
              researchButtonAnchor.planetId = planet.id;
              researchButtonAnchor.isBelow = flipBelow;
              researchButtonAnchor.x = clamp(bBounds.cx, 84, Math.max(84, width - 84));
              researchButtonAnchor.y = flipBelow
                ? Math.min(height - 56, bBounds.maxY + 14)
                : topY;
            }
            if (isLaunchRocket) {
              rocketActionAnchor.visible = true;
              rocketActionAnchor.planetId = planet.id;
              rocketActionAnchor.tileId = tile.id;
              rocketActionAnchor.buildingId = entry.placed.id;
              rocketActionAnchor.cx = bBounds.cx;
              rocketActionAnchor.cy = bBounds.cy;
              rocketActionAnchor.minY = bBounds.minY;
              rocketActionAnchor.maxY = bBounds.maxY;
              rocketActionAnchor.halfClearX = bBounds.halfClearX;
              rocketActionAnchor.halfClearY = bBounds.halfClearY;
              rocketActionAnchor.x = bBounds.cx;
              rocketActionAnchor.y = bBounds.minY - 14;
            }
            if (hasTradeOrUpgrade) {
              tradeActionAnchor.visible = true;
              tradeActionAnchor.planetId = planet.id;
              tradeActionAnchor.tileId = tile.id;
              tradeActionAnchor.buildingId = entry.placed.id;
              tradeActionAnchor.cx = bBounds.cx;
              tradeActionAnchor.cy = bBounds.cy;
              tradeActionAnchor.minY = bBounds.minY;
              tradeActionAnchor.maxY = bBounds.maxY;
              tradeActionAnchor.halfClearX = bBounds.halfClearX;
              tradeActionAnchor.halfClearY = bBounds.halfClearY;
              tradeActionAnchor.x = bBounds.cx;
              tradeActionAnchor.y = bBounds.minY - 14;
            }
          }
        }
      }
    }

    if (shadow > 0.03) {
      ctx.fillStyle = `rgba(3, 5, 14, ${(shadow * 0.56).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.01, 0, Math.PI * 2);
      ctx.fill();
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
    limbGrad.addColorStop(0.82, `rgba(${drawAtmo.r}, ${drawAtmo.g}, ${drawAtmo.b}, 0.05)`);
    limbGrad.addColorStop(1, `rgba(${drawAtmo.r}, ${drawAtmo.g}, ${drawAtmo.b}, 0.22)`);
    ctx.fillStyle = limbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.01, 0, Math.PI * 2);
    ctx.fill();

    if (!planet.unlocked && !planet.unlockVfx) {
      drawPlanetLockOverlay(ctx, cx, cy, r, planet.requiredRocketTier || 1, transform.alpha, time);
    } else if (planet.unlockVfx) {
      drawPlanetUnlockShatter(ctx, cx, cy, r, planet.unlockVfx, time, transform.alpha);
    }

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

  // --- Planet Lock Overlay, Shatter VFX, Rocket Cargo & Flight Systems ---

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function easeOutCubic(t) {
    const inv = 1 - clamp01(t);
    return 1 - inv * inv * inv;
  }

  function easeInOutCubic(t) {
    const x = clamp01(t);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function drawRoundedRectPath(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function drawStar4(ctx, x, y, size, rot, fillCol, outlineCol, alpha) {
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
    ctx.lineWidth = Math.max(1.5, size * 0.30);
    ctx.strokeStyle = outlineCol;
    ctx.stroke();
    ctx.fillStyle = fillCol;
    ctx.fill();
    ctx.restore();
  }

  function drawPadlockVector(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const s = size / 64;
    const inkW = Math.max(2.2, 4 * s);

    // Metallic shackle
    ctx.beginPath();
    ctx.moveTo(-11 * s, -3 * s);
    ctx.lineTo(-11 * s, -12 * s);
    ctx.arc(0, -12 * s, 11 * s, Math.PI, 0, false);
    ctx.lineTo(11 * s, -3 * s);
    ctx.lineWidth = 10.5 * s;
    ctx.strokeStyle = "#1b1147";
    ctx.stroke();
    ctx.lineWidth = 5.5 * s;
    ctx.strokeStyle = "#cbd5e1";
    ctx.stroke();

    // Shackle highlight
    ctx.beginPath();
    ctx.arc(0, -12 * s, 11 * s, Math.PI, Math.PI * 1.48, false);
    ctx.lineWidth = 2.2 * s;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Golden padlock body
    drawRoundedRectPath(ctx, -18 * s, -5 * s, 36 * s, 29 * s, 8 * s);
    ctx.fillStyle = "#ffb129";
    ctx.fill();
    ctx.lineWidth = inkW;
    ctx.strokeStyle = "#1b1147";
    ctx.stroke();

    // Inner bright amber face
    drawRoundedRectPath(ctx, -14.5 * s, -2 * s, 29 * s, 20 * s, 5 * s);
    ctx.fillStyle = "#ffd84d";
    ctx.fill();

    // Highlight streak
    ctx.beginPath();
    ctx.moveTo(-11 * s, 1 * s);
    ctx.lineTo(2 * s, 1 * s);
    ctx.lineWidth = Math.max(1.5, 2.8 * s);
    ctx.strokeStyle = "#fff9d6";
    ctx.stroke();

    // Keyhole
    ctx.fillStyle = "#1b1147";
    ctx.beginPath();
    ctx.arc(0, 7.5 * s, 4.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2.4 * s, 9.5 * s);
    ctx.lineTo(2.4 * s, 9.5 * s);
    ctx.lineTo(3.8 * s, 17.5 * s);
    ctx.lineTo(-3.8 * s, 17.5 * s);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawBuildingBlockedBadge(ctx, bx, by, radiusPx, iconImg, alpha) {
    if (radiusPx < 4 || alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = clamp01(alpha);

    // Dark ink outer circle + bright white interior backing
    ctx.beginPath();
    ctx.arc(bx, by + 2, radiusPx + 2, 0, Math.PI * 2);
    ctx.fillStyle = "#1b1147";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bx, by, radiusPx + 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#1b1147";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bx, by, Math.max(2, radiusPx - 0.5), 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Draw resource SVG icon larger inside the white circle
    if (iconImg && iconImg.complete && iconImg.naturalWidth > 0) {
      const iconSize = radiusPx * 1.38;
      ctx.drawImage(iconImg, bx - iconSize * 0.5, by - iconSize * 0.5, iconSize, iconSize);
    }

    // Cel-shaded red prohibition ring + diagonal slash (⊘)
    const ringR = radiusPx * 0.94;
    const slashOff = ringR * 0.68;

    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(bx, by, ringR, 0, Math.PI * 2);
    ctx.moveTo(bx - slashOff, by + slashOff);
    ctx.lineTo(bx + slashOff, by - slashOff);
    ctx.lineWidth = Math.max(3.6, radiusPx * 0.30);
    ctx.strokeStyle = "#1b1147";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bx, by, ringR, 0, Math.PI * 2);
    ctx.moveTo(bx - slashOff, by + slashOff);
    ctx.lineTo(bx + slashOff, by - slashOff);
    ctx.lineWidth = Math.max(2.2, radiusPx * 0.17);
    ctx.strokeStyle = "#ff3b4e";
    ctx.stroke();

    ctx.restore();
  }

  function drawBuildingBlockedOverlay(ctx, x, y, tileScale, planetR, isEnergyBlocked, isCitizenBlocked, isBricksBlocked, time, phase, alpha) {
    if ((!isEnergyBlocked && !isCitizenBlocked && !isBricksBlocked) || alpha <= 0.04) return;
    const bobY = Math.sin(time * 0.0046 + (phase || 0)) * Math.max(2, planetR * 0.014);
    const badgeR = clamp(planetR * Math.max(0.082, tileScale * 0.36), 15, 24);
    const py = y - badgeR * 1.05 + bobY;

    const icons = [];
    if (isEnergyBlocked) icons.push(blockedOverlayIcons.energy);
    if (isCitizenBlocked) icons.push(blockedOverlayIcons.citizens);
    if (isBricksBlocked) icons.push(blockedOverlayIcons.bricks);

    const step = badgeR * 2.32;
    const startX = x - ((icons.length - 1) * step) * 0.5;
    for (let i = 0; i < icons.length; i++) {
      drawBuildingBlockedBadge(ctx, startX + i * step, py, badgeR, icons[i], alpha);
    }
  }

  function drawPlanetLockOverlay(ctx, cx, cy, r, requiredTier, alpha, time) {
    if (r < 24 || alpha <= 0.02) return;

    const bobY = Math.sin(time * 0.0028) * Math.max(2, r * 0.016);
    const lockSize = clamp(r * 0.36, 40, 68);
    const lockY = cy - lockSize * 0.24 + bobY;

    ctx.save();
    ctx.globalAlpha = clamp01(alpha);

    // Subtle glowing radial ring behind padlock so it pops over deep shadow
    const backGrad = ctx.createRadialGradient(cx, lockY, lockSize * 0.1, cx, lockY, lockSize * 0.95);
    backGrad.addColorStop(0, "rgba(255, 210, 80, 0.24)");
    backGrad.addColorStop(1, "rgba(255, 210, 80, 0)");
    ctx.fillStyle = backGrad;
    ctx.beginPath();
    ctx.arc(cx, lockY, lockSize * 0.95, 0, Math.PI * 2);
    ctx.fill();

    drawPadlockVector(ctx, cx, lockY, lockSize);

    // Label banner right underneath lock
    const label = t("planet.requires_rocket_tier", { tier: requiredTier });
    const fontSize = Math.round(clamp(r * 0.095, 11.5, 16));
    ctx.font = "900 " + fontSize + "px 'Fredoka', 'Nunito', 'Segoe UI', system-ui, sans-serif";
    const textW = ctx.measureText(label).width;
    const padX = Math.max(12, fontSize * 0.95);
    const pillW = Math.min(r * 2.15, textW + padX * 2);
    const pillH = Math.round(fontSize * 1.95);
    const pillX = cx - pillW * 0.5;
    const pillY = lockY + lockSize * 0.56;

    // Shadow lip + dark indigo pill
    drawRoundedRectPath(ctx, pillX, pillY + 3, pillW, pillH, pillH * 0.5);
    ctx.fillStyle = "#1b1147";
    ctx.fill();

    drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH * 0.5);
    ctx.fillStyle = "#2b1d63";
    ctx.fill();
    ctx.lineWidth = Math.max(2.2, fontSize * 0.18);
    ctx.strokeStyle = "#1b1147";
    ctx.stroke();

    drawRoundedRectPath(ctx, pillX + 2, pillY + 2, pillW - 4, pillH - 4, pillH * 0.5);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "#ffd84d";
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2.6, fontSize * 0.22);
    ctx.strokeStyle = "#1b1147";
    ctx.strokeText(label, cx, pillY + pillH * 0.52);
    ctx.fillStyle = "#ffe485";
    ctx.fillText(label, cx, pillY + pillH * 0.52);

    ctx.restore();
  }

  function createUnlockShatterVfx(time) {
    const shards = [];
    const shardCols = ["#090c1a", "#141933", "#1e1b4b", "#0f172a"];
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14 + Math.sin(i * 3.1) * 0.18;
      shards.push({
        angle: a,
        speed: 0.95 + ((i * 37) % 10) * 0.09,
        spin: (i % 2 === 0 ? 1 : -1) * (3.5 + (i % 5) * 1.4),
        size: 0.08 + (i % 4) * 0.025,
        color: shardCols[i % shardCols.length]
      });
    }
    const lockPieces = [
      { vx: -0.68, vy: -0.42, spin: -6.2, w: 0.15, h: 0.16, col: "#ffd84d" },
      { vx: 0.72, vy: -0.34, spin: 5.8, w: 0.15, h: 0.16, col: "#ffb129" },
      { vx: -0.38, vy: -0.88, spin: -7.5, w: 0.14, h: 0.08, col: "#cbd5e1" },
      { vx: 0.44, vy: -0.82, spin: 7.1, w: 0.14, h: 0.08, col: "#e2e8f0" }
    ];
    return {
      startTime: time,
      duration: UNLOCK_SHATTER_MS,
      shards: shards,
      lockPieces: lockPieces
    };
  }

  function drawPlanetUnlockShatter(ctx, cx, cy, r, vfx, time, alpha) {
    const p = clamp01((time - vfx.startTime) / vfx.duration);
    if (p >= 1 || r < 20) return;

    ctx.save();
    ctx.globalAlpha = clamp01(alpha);

    // Expanding luminous sky-gold shatter shockwave
    if (p < 0.72) {
      const rp = easeOutCubic(p / 0.72);
      const ringR = r * (0.28 + 1.08 * rp);
      ctx.save();
      ctx.globalAlpha *= (1 - rp) * 0.92;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(3, r * 0.08 * (1 - rp * 0.6));
      ctx.strokeStyle = "#ffd84d";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, ringR * 0.86, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, r * 0.045 * (1 - rp * 0.5));
      ctx.strokeStyle = "#67e8f9";
      ctx.stroke();
      ctx.restore();
    }

    // Center golden comic starburst flash
    if (p < 0.36) {
      const bp = p / 0.36;
      const spikes = 10;
      const rOut = r * (0.25 + 0.55 * Math.sin(bp * Math.PI));
      const rIn = rOut * 0.42;
      ctx.save();
      ctx.globalAlpha *= 1 - bp;
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? rOut : rIn;
        const a = (i * Math.PI) / spikes + bp * 0.35;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = "#ffe44d";
      ctx.strokeStyle = "#1b1147";
      ctx.lineWidth = Math.max(2, r * 0.02);
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }

    // Flying obsidian darkness shards
    if (p < 0.86) {
      const sp = easeOutCubic(p / 0.86);
      const shardFade = p > 0.45 ? 1 - (p - 0.45) / 0.41 : 1;
      for (let i = 0; i < vfx.shards.length; i++) {
        const sh = vfx.shards[i];
        const dist = r * (0.18 + sh.speed * 1.15 * sp);
        const sx = cx + Math.cos(sh.angle) * dist;
        const sy = cy + Math.sin(sh.angle) * dist;
        const sz = r * sh.size * (1 - sp * 0.35);

        ctx.save();
        ctx.globalAlpha *= clamp01(shardFade);
        ctx.translate(sx, sy);
        ctx.rotate(sh.angle + sp * sh.spin);
        ctx.beginPath();
        ctx.moveTo(-sz, -sz * 0.45);
        ctx.lineTo(sz * 0.75, -sz * 0.8);
        ctx.lineTo(sz * 1.05, sz * 0.35);
        ctx.lineTo(-sz * 0.4, sz * 0.85);
        ctx.closePath();
        ctx.fillStyle = sh.color;
        ctx.fill();
        ctx.lineWidth = Math.max(1.5, sz * 0.25);
        ctx.strokeStyle = "#1b1147";
        ctx.stroke();
        ctx.restore();
      }
    }

    // Shattered golden padlock halves
    if (p < 0.80) {
      const lp = p / 0.80;
      const lFade = p > 0.42 ? 1 - (p - 0.42) / 0.38 : 1;
      for (let i = 0; i < vfx.lockPieces.length; i++) {
        const pc = vfx.lockPieces[i];
        const px = cx + pc.vx * r * lp * 1.25;
        const py = cy + pc.vy * r * lp * 1.1 + 0.55 * r * lp * lp;
        const pw = r * pc.w;
        const ph = r * pc.h;
        ctx.save();
        ctx.globalAlpha *= clamp01(lFade);
        ctx.translate(px, py);
        ctx.rotate(lp * pc.spin);
        ctx.fillStyle = pc.col;
        ctx.strokeStyle = "#1b1147";
        ctx.lineWidth = Math.max(1.8, r * 0.022);
        ctx.fillRect(-pw * 0.5, -ph * 0.5, pw, ph);
        ctx.strokeRect(-pw * 0.5, -ph * 0.5, pw, ph);
        ctx.restore();
      }
    }

    // Celebratory star sparkles
    if (p > 0.12) {
      const kp = clamp01((p - 0.12) / 0.86);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8 + 0.3;
        const dist = r * (0.45 + 0.75 * easeOutCubic(kp));
        const sx = cx + Math.cos(a) * dist;
        const sy = cy + Math.sin(a) * dist;
        const pop = Math.sin(kp * Math.PI);
        drawStar4(
          ctx,
          sx,
          sy,
          Math.max(4, r * 0.08 * pop),
          kp * 2.2 + i,
          i % 2 === 0 ? "#ffd84d" : "#ffffff",
          "#1b1147",
          pop
        );
      }
    }

    ctx.restore();
  }

  function drawSmokePuffCloud(ctx, x, y, radiusPx, alpha, warm) {
    if (radiusPx <= 1 || alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);
    ctx.beginPath();
    ctx.arc(x, y, radiusPx, 0, Math.PI * 2);
    ctx.fillStyle = "#1b1147";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, radiusPx * 0.82, 0, Math.PI * 2);
    ctx.fillStyle = warm ? "#ffedd5" : "#eef6ff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - radiusPx * 0.18, y - radiusPx * 0.2, radiusPx * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
  }

  function buildRotatedRocketBasis(rotT, rotB, rotN, pitchIntoT, rollAngle) {
    const cosP = Math.cos(pitchIntoT);
    const sinP = Math.sin(pitchIntoT);
    const pitchedN = normalize(add(scale(rotN, cosP), scale(rotT, sinP)));
    const pitchedT = normalize(sub(scale(rotT, cosP), scale(rotN, sinP)));
    const pitchedB = normalize(cross(pitchedN, pitchedT));
    const cosR = Math.cos(rollAngle);
    const sinR = Math.sin(rollAngle);
    return {
      rotT: add(scale(pitchedT, cosR), scale(pitchedB, sinR)),
      rotB: sub(scale(pitchedB, cosR), scale(pitchedT, sinR)),
      rotN: pitchedN
    };
  }

  function buildScreenSpace3DFrame(screenX, screenY, angleRad, pxHeight, rollAngle, atmo) {
    const vx = Math.cos(angleRad);
    const vy = Math.sin(angleRad);
    const nWorld = normalize({ x: vx, y: -vy, z: 0.24 });
    const tmp = Math.abs(nWorld.z) < 0.9 ? vec3(0, 0, 1) : vec3(0, 1, 0);
    const t0 = normalize(cross(tmp, nWorld));
    const b0 = cross(nWorld, t0);
    const cosR = Math.cos(rollAngle || 0);
    const sinR = Math.sin(rollAngle || 0);
    const focalLength = 420;
    const scale3D = (pxHeight * CAM_DIST) / focalLength;

    return {
      origin: vec3(0, 0, 0),
      rotT: add(scale(t0, cosR), scale(b0, sinR)),
      rotB: sub(scale(b0, cosR), scale(t0, sinR)),
      rotN: nWorld,
      scale: scale3D,
      phase: 0,
      cx: screenX,
      cy: screenY,
      focalLength: focalLength,
      camVec: CAM_VEC,
      lightDir: LIGHT_DIR,
      halfVec: HALF_VEC,
      atmo: atmo || { r: 165, g: 215, b: 255 },
      isSelected: false,
      project: project
    };
  }

  function getActiveTradeFlightProgressForTile(planetId, tileId, time) {
    for (let i = 0; i < activeTradeFlights.length; i++) {
      const tf = activeTradeFlights[i];
      if (tf.planetIdx === planetId && tf.tileId === tileId) {
        return clamp01((time - tf.startTime) / tf.duration);
      }
    }
    return null;
  }

  function computeSelectedBuildingScreenBounds(entry, buildingFrame, cx, cy, focalLength) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const pts = entry.topPts;
    for (let k = 0; k < pts.length; k++) {
      if (pts[k].x < minX) minX = pts[k].x;
      if (pts[k].x > maxX) maxX = pts[k].x;
      if (pts[k].y < minY) minY = pts[k].y;
      if (pts[k].y > maxY) maxY = pts[k].y;
    }

    const o = buildingFrame.origin;
    const tV = buildingFrame.rotT;
    const bV = buildingFrame.rotB;
    const nV = buildingFrame.rotN;
    const s = buildingFrame.scale;
    const zLevels = [0.48, 1.08];
    const rad = 0.62;
    for (let zi = 0; zi < zLevels.length; zi++) {
      const lz = zLevels[zi];
      for (let a = 0; a < 6; a++) {
        const ang = (Math.PI * 2 * a) / 6;
        const lx = Math.cos(ang) * rad;
        const ly = Math.sin(ang) * rad;
        const sp = project(
          {
            x: o.x + (tV.x * lx + bV.x * ly + nV.x * lz) * s,
            y: o.y + (tV.y * lx + bV.y * ly + nV.y * lz) * s,
            z: o.z + (tV.z * lx + bV.z * ly + nV.z * lz) * s
          },
          cx,
          cy,
          focalLength
        );
        if (sp.x < minX) minX = sp.x;
        if (sp.x > maxX) maxX = sp.x;
        if (sp.y < minY) minY = sp.y;
        if (sp.y > maxY) maxY = sp.y;
      }
    }

    const peakSp = project(
      { x: o.x + nV.x * 1.08 * s, y: o.y + nV.y * 1.08 * s, z: o.z + nV.z * 1.08 * s },
      cx,
      cy,
      focalLength
    );
    if (peakSp.x < minX) minX = peakSp.x;
    if (peakSp.x > maxX) maxX = peakSp.x;
    if (peakSp.y < minY) minY = peakSp.y;
    if (peakSp.y > maxY) maxY = peakSp.y;

    const bCx = (minX + maxX) * 0.5;
    const bCy = (minY + maxY) * 0.5;
    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      cx: bCx,
      cy: bCy,
      halfClearX: Math.max(26, (maxX - minX) * 0.5),
      halfClearY: Math.max(26, (maxY - minY) * 0.5)
    };
  }

  function positionActionGroupAroundBuilding(groupEl, anchor, isSingle, defaultYOffset) {
    if (isSingle) {
      groupEl.classList.add("is-single");
      groupEl.classList.remove("is-arched");
      const baseClear = Math.round(anchor.halfClearY + (defaultYOffset || 14));
      const stackingWithArchedRocket =
        groupEl === tileTradeActionsEl &&
        rocketActionAnchor.visible &&
        tileRocketActionsEl &&
        tileRocketActionsEl.classList.contains("is-arched");
      const rocketBelow = anchor.minY - 14 < 82;
      const topClear = stackingWithArchedRocket && !rocketBelow ? baseClear + 46 : baseClear;
      const botClear = stackingWithArchedRocket && rocketBelow ? baseClear + 46 : baseClear;
      const willFlipBelow = anchor.cy - topClear - 46 < 74;
      groupEl.classList.toggle("is-below", willFlipBelow);
      groupEl.style.setProperty("--top-clear", topClear + "px");
      groupEl.style.setProperty("--bot-clear", botClear + "px");
      groupEl.style.transform =
        "translate3d(" + clamp(anchor.cx, 96, Math.max(96, width - 96)).toFixed(1) + "px, " + anchor.cy.toFixed(1) + "px, 0)";
      return;
    }

    groupEl.classList.remove("is-single");
    groupEl.classList.remove("is-below");
    const halfClear = Math.round(anchor.halfClearX + 16);
    const fitsFlanking =
      anchor.cx - halfClear - 148 >= 8 && anchor.cx + halfClear + 148 <= width - 8;

    if (fitsFlanking) {
      groupEl.classList.remove("is-arched");
      groupEl.style.setProperty("--half-clear", halfClear + "px");
      groupEl.style.transform =
        "translate3d(" +
        anchor.cx.toFixed(1) +
        "px, " +
        clamp(anchor.cy, 78, Math.max(78, height - 48)).toFixed(1) +
        "px, 0)";
    } else {
      groupEl.classList.add("is-arched");
      const topY = anchor.minY - 14;
      const useBelow = topY < 82;
      const archY = useBelow ? Math.min(height - 56, anchor.maxY + 14) : topY;
      groupEl.style.transform =
        "translate3d(" +
        clamp(anchor.cx, 140, Math.max(140, width - 140)).toFixed(1) +
        "px, " +
        archY.toFixed(1) +
        "px, 0) translate(-50%, " +
        (useBelow ? "0" : "-100%") +
        ")";
    }
  }

  function getPlanetTileScreenInfo(planet, transform, tile) {
    const r = transform.scaledRadius;
    const focalLength = r * Math.sqrt(CAM_DIST * CAM_DIST - 1);
    const pitchX = clamp(planet.basePitch + planet.pitchOffset, -MAX_PITCH, MAX_PITCH);
    const rotatePoint = createRotator(planet.spinY, pitchX, planet.roll);
    const rotNormal = rotatePoint(tile.normal);
    const rotPlaneCenter = rotatePoint(tile.planeCenter);
    const elev = tile.currentElev || tile.baseElev || 1.02;
    const elevCenter = scale(rotPlaneCenter, elev);
    const tipWorld = add(elevCenter, scale(rotNormal, tile.hexScale * elev * 0.8));
    const basePt = project(elevCenter, transform.x, transform.y, focalLength);
    const upPt = project(tipWorld, transform.x, transform.y, focalLength);
    const dx = upPt.x - basePt.x;
    const dy = upPt.y - basePt.y;
    const dLen = Math.hypot(dx, dy) || 1;
    return {
      basePt: basePt,
      upPt: upPt,
      nx: dx / dLen,
      ny: dy / dLen,
      z: elevCenter.z
    };
  }

  function findFreeLandingTile(destPlanetId, rocketId) {
    const destPlanet = planets[destPlanetId];
    if (!destPlanet || !Array.isArray(destPlanet.tiles)) return null;
    const candidates = [];
    for (let i = 0; i < destPlanet.tiles.length; i++) {
      const tile = destPlanet.tiles[i];
      if (window.GameBuildings && !window.GameBuildings.canBuildOnBiome(rocketId, tile.biome)) {
        continue;
      }
      if (buildingsByPlanet[destPlanetId][tile.id]) {
        continue;
      }
      let reserved = false;
      for (let f = 0; f < activeFlights.length; f++) {
        if (activeFlights[f].destIdx === destPlanetId && activeFlights[f].destTileId === tile.id) {
          reserved = true;
          break;
        }
      }
      if (!reserved) {
        candidates.push(tile);
      }
    }
    if (candidates.length === 0) return null;
    candidates.sort(function (a, b) {
      return Math.abs(a.center.y) - Math.abs(b.center.y);
    });
    const poolSize = Math.min(4, candidates.length);
    const idx =
      (destPlanetId + activeFlights.length + Object.keys(buildingsByPlanet[destPlanetId]).length) % poolSize;
    return candidates[idx];
  }

  function getRocketLaunchStatus(srcPlanetId, srcTileId, includeHtml) {
    const placed =
      srcPlanetId >= 0 && srcTileId ? buildingsByPlanet[srcPlanetId] && buildingsByPlanet[srcPlanetId][srcTileId] : null;
    const bld = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
    if (!placed || placed.isLanded || !bld || !bld.rocketTier) {
      return { ok: false, reasonKey: "invalid", reasonHtml: "" };
    }

    const destPlanetId = srcPlanetId + 1;
    if (destPlanetId >= PLANET_COUNT) {
      return {
        ok: false,
        reasonKey: "no_destination",
        bld: bld,
        placed: placed,
        reasonHtml: includeHtml ? "<span>" + t("toast.rocket_no_destination") + "</span>" : ""
      };
    }

    const destPlanet = planets[destPlanetId];
    const reqTier = destPlanet.requiredRocketTier || 1;
    if (bld.rocketTier < reqTier) {
      let reasonHtml = "";
      if (includeHtml) {
        const iconImg = '<img class="game-toast-icon" src="' + bld.iconSrc + '" alt="" draggable="false" />';
        const pPill =
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="' +
          destPlanet.iconSrc +
          '" alt="" draggable="false" /> ' +
          destPlanet.name +
          "</span>";
        reasonHtml =
          "<span>" + iconImg + t("toast.rocket_tier_too_low", { planet: pPill, tier: reqTier }) + "</span>";
      }
      return {
        ok: false,
        reasonKey: "tier_too_low",
        bld: bld,
        placed: placed,
        destPlanetId: destPlanetId,
        reasonHtml: reasonHtml
      };
    }

    const currCitizens = getPlanetCitizenCount(srcPlanetId);
    if (currCitizens < bld.rocketCitizens) {
      let reasonHtml = "";
      if (includeHtml) {
        const iconImg = '<img class="game-toast-icon" src="./assets/ui/icon-citizen.svg" alt="" draggable="false" />';
        const rStrong = '<strong class="game-toast-strong">' + bld.name + "</strong>";
        const srcPlanet = planets[srcPlanetId];
        const pName = '<strong class="game-toast-strong">' + srcPlanet.name + "</strong>";
        reasonHtml =
          "<span>" +
          iconImg +
          t("toast.rocket_need_citizens", {
            needed: formatPlanetStat(bld.rocketCitizens),
            planet: pName,
            rocket: rStrong,
            curr: formatPlanetStat(currCitizens)
          }) +
          "</span>";
      }
      return {
        ok: false,
        reasonKey: "need_citizens",
        bld: bld,
        placed: placed,
        destPlanetId: destPlanetId,
        reasonHtml: reasonHtml
      };
    }

    const destTile = findFreeLandingTile(destPlanetId, bld.id);
    if (!destTile) {
      let reasonHtml = "";
      if (includeHtml) {
        const iconImg = '<img class="game-toast-icon" src="' + bld.iconSrc + '" alt="" draggable="false" />';
        const pStrong = '<strong class="game-toast-strong">' + destPlanet.name + "</strong>";
        reasonHtml = "<span>" + iconImg + t("toast.rocket_no_free_tile", { planet: pStrong }) + "</span>";
      }
      return {
        ok: false,
        reasonKey: "no_free_tile",
        bld: bld,
        placed: placed,
        destPlanetId: destPlanetId,
        reasonHtml: reasonHtml
      };
    }

    return {
      ok: true,
      bld: bld,
      placed: placed,
      destPlanetId: destPlanetId,
      destTile: destTile,
      reasonHtml: ""
    };
  }

  function setRocketLoadedBricks(planetId, tileId, desiredAmount) {
    const placed = buildingsByPlanet[planetId] && buildingsByPlanet[planetId][tileId];
    const bld = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
    if (!placed || !bld || !bld.rocketTier) return;

    const currentLoaded = Math.max(0, Math.floor(placed.loadedBricks || 0));
    const availableStock = Math.max(0, Math.floor(bricksByPlanet[planetId] || 0));
    const maxAllowed = Math.min(bld.rocketMaxBricks, currentLoaded + availableStock);
    const target = clamp(Math.round(Number(desiredAmount) || 0), 0, maxAllowed);
    const delta = target - currentLoaded;

    if (delta !== 0) {
      bricksByPlanet[planetId] = Math.max(0, bricksByPlanet[planetId] - delta);
      placed.loadedBricks = target;
      updatePlanetBricksHud(true);
      notifySave("cargo_change", false);
    }
    syncRocketCargoModal();
  }

  let lastCargoUiKey = "";
  let lastCargoDestKey = "";

  function syncRocketCargoModal(force) {
    if (!cargoModalState.open || !rocketCargoModalEl) return;
    const pId = cargoModalState.planetId;
    const tId = cargoModalState.tileId;
    const placed = buildingsByPlanet[pId] && buildingsByPlanet[pId][tId];
    const bld = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
    if (!placed || !bld || !bld.rocketTier || pId + 1 >= PLANET_COUNT) {
      closeRocketCargoModal();
      return;
    }

    const destPlanet = planets[pId + 1];
    const currCitz = getPlanetCitizenCount(pId);
    const capCitz = calculatePlanetCitizenCapacity(pId);
    const loadedBricks = Math.max(0, Math.floor(placed.loadedBricks || 0));
    const availStock = Math.max(0, Math.floor(bricksByPlanet[pId] || 0));
    const status = getRocketLaunchStatus(pId, tId, false);
    const destUnlocked = destPlanet ? Boolean(destPlanet.unlocked) : false;
    const uiKey = [
      pId,
      tId,
      bld.id,
      currCitz,
      capCitz,
      loadedBricks,
      availStock,
      destUnlocked ? 1 : 0,
      status.ok ? 1 : 0
    ].join("|");

    if (!force && uiKey === lastCargoUiKey) {
      return;
    }
    lastCargoUiKey = uiKey;

    const maxFillable = Math.min(bld.rocketMaxBricks, loadedBricks + availStock);
    const fillPct = bld.rocketMaxBricks > 0 ? clamp((loadedBricks / bld.rocketMaxBricks) * 100, 0, 100) : 0;

    const destKey = destPlanet ? destPlanet.id + "|" + getPlanetName(destPlanet, pId + 1) : "";
    if (force || destKey !== lastCargoDestKey) {
      lastCargoDestKey = destKey;
      if (rocketCargoIconEl) {
        rocketCargoIconEl.src = bld.iconSrc;
      }
      if (rocketCargoTitleEl) {
        rocketCargoTitleEl.textContent = bld.name;
      }
      if (rocketCargoDestPillEl && destPlanet) {
        rocketCargoDestPillEl.innerHTML = "";
        rocketCargoDestPillEl.style.setProperty("--dest-accent", destPlanet.accent || "#38bdf8");
        const dImg = document.createElement("img");
        dImg.className = "rocket-cargo-dest-icon";
        dImg.src = destPlanet.iconSrc;
        dImg.alt = "";
        dImg.draggable = false;
        const dLbl = document.createElement("span");
        dLbl.textContent = t("rocket.target_planet", {
          planet: getPlanetName(destPlanet, pId + 1)
        });
        rocketCargoDestPillEl.appendChild(dImg);
        rocketCargoDestPillEl.appendChild(dLbl);
      }
    }

    if (rocketCargoCrewValEl) {
      rocketCargoCrewValEl.textContent = t("rocket.crew_unit", { count: formatPlanetStat(bld.rocketCitizens) });
    }
    if (rocketCargoCrewAvailEl) {
      rocketCargoCrewAvailEl.textContent = t("rocket.crew_available", {
        curr: formatPlanetStat(currCitz),
        max: formatPlanetStat(capCitz)
      });
      rocketCargoCrewAvailEl.classList.toggle("is-short", currCitz < bld.rocketCitizens);
    }

    if (rocketCargoBricksValEl) {
      rocketCargoBricksValEl.textContent = t("rocket.bricks_loaded_fmt", {
        loaded: formatPlanetStat(loadedBricks),
        max: formatPlanetStat(bld.rocketMaxBricks)
      });
    }
    if (rocketCargoBricksStockEl) {
      rocketCargoBricksStockEl.textContent = t("rocket.bricks_stock", {
        stock: formatPlanetStat(availStock)
      });
    }
    if (rocketCargoSliderEl) {
      rocketCargoSliderEl.min = "0";
      rocketCargoSliderEl.max = String(bld.rocketMaxBricks);
      if (Number(rocketCargoSliderEl.value) !== loadedBricks) {
        rocketCargoSliderEl.value = String(loadedBricks);
      }
      rocketCargoSliderEl.style.setProperty("--slider-fill", fillPct.toFixed(1) + "%");
    }

    if (cargoEmptyBtn) cargoEmptyBtn.disabled = loadedBricks <= 0;
    if (cargoMinusBtn) cargoMinusBtn.disabled = loadedBricks <= 0;
    if (cargoPlusBtn) cargoPlusBtn.disabled = loadedBricks >= maxFillable;
    if (cargoMaxBtn) cargoMaxBtn.disabled = loadedBricks >= maxFillable;

    if (cargoLaunchBtn) {
      cargoLaunchBtn.classList.toggle("is-disabled", !status.ok);
    }
  }

  function openRocketCargoModal(planetId, tileId) {
    const placed = buildingsByPlanet[planetId] && buildingsByPlanet[planetId][tileId];
    const bld = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
    if (!placed || !bld || !bld.rocketTier || planetId + 1 >= PLANET_COUNT) return;

    cargoModalState.open = true;
    cargoModalState.planetId = planetId;
    cargoModalState.tileId = tileId;
    lastCargoUiKey = "";
    lastCargoDestKey = "";

    syncRocketCargoModal(true);

    if (rocketCargoModalEl) {
      rocketCargoModalEl.classList.remove("is-hidden");
      rocketCargoModalEl.classList.add("is-open");
      rocketCargoModalEl.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("rocket-cargo-open");
  }

  function closeRocketCargoModal() {
    if (!cargoModalState.open && (!rocketCargoModalEl || !rocketCargoModalEl.classList.contains("is-open"))) {
      return;
    }
    cargoModalState.open = false;
    cargoModalState.planetId = -1;
    cargoModalState.tileId = null;
    if (rocketCargoModalEl) {
      rocketCargoModalEl.classList.remove("is-open");
      rocketCargoModalEl.classList.add("is-hidden");
      rocketCargoModalEl.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("rocket-cargo-open");
  }

  function updateFollowRocketButton() {
    if (!followRocketBtn) return;
    const researchOpen =
      window.GameResearch && typeof window.GameResearch.isOpen === "function" && window.GameResearch.isOpen();
    if (activeFlights.length === 0 || researchOpen || cargoModalState.open) {
      followRocketBtn.classList.add("is-hidden");
      followRocketBtn.classList.remove("is-following");
      return;
    }

    const targetFlight = activeFlights[activeFlights.length - 1];
    const isFollowing = followingFlightId !== null && activeFlights.some(function (f) { return f.id === followingFlightId; });
    followRocketBtn.classList.remove("is-hidden");
    followRocketBtn.classList.toggle("is-following", isFollowing);
    if (followRocketIconEl) {
      followRocketIconEl.src =
        targetFlight.rocketId === "space_rocket_2"
          ? "./assets/ui/bld-space-rocket-2.svg"
          : "./assets/ui/bld-space-rocket-1.svg";
    }
    if (followRocketLabelEl) {
      followRocketLabelEl.textContent = t(isFollowing ? "rocket.following_btn" : "rocket.follow_btn");
    }
  }

  function launchRocket(srcPlanetId, srcTileId) {
    const status = getRocketLaunchStatus(srcPlanetId, srcTileId, true);
    if (!status.ok) {
      if (status.reasonHtml) {
        showGameToast(status.reasonHtml);
      }
      return false;
    }

    const now = performance.now();
    const srcPlanet = planets[srcPlanetId];
    const destPlanet = planets[status.destPlanetId];
    const srcTile = srcPlanet && srcPlanet.tileById[srcTileId];
    const bricksLoaded = Math.max(0, Math.floor(status.placed.loadedBricks || 0));

    // Deduct fixed citizen crew from current citizens on launch
    citizensByPlanet[srcPlanetId] = Math.max(
      getPlanetBaseCitizenCount(srcPlanetId),
      citizensByPlanet[srcPlanetId] - status.bld.rocketCitizens
    );
    delete buildingsByPlanet[srcPlanetId][srcTileId];

    closeRocketCargoModal();
    clearSelectionAndCloseBuildMenu();

    activeFlights.push({
      id: nextFlightId++,
      srcIdx: srcPlanetId,
      destIdx: status.destPlanetId,
      srcTileId: srcTileId,
      srcTile: srcTile,
      destTileId: status.destTile.id,
      destTile: status.destTile,
      rocketId: status.bld.id,
      rocketName: status.bld.name,
      rocketIcon: status.bld.iconSrc,
      tier: status.bld.rocketTier,
      citizens: status.bld.rocketCitizens,
      bricks: bricksLoaded,
      startTime: now,
      liftoffDur: 1350,
      cruiseDur: 2050,
      landDur: 1200,
      trail: [],
      lastTrailAt: 0,
      focusedDest: false
    });

    lastInteractionTime = now;
    updatePlanetStatsHud(true);
    updateFollowRocketButton();

    const rImg = '<img class="game-toast-icon" src="' + status.bld.iconSrc + '" alt="" draggable="false" />';
    const rStrong = '<strong class="game-toast-strong">' + status.bld.name + "</strong>";
    const dStrong =
      '<strong class="game-toast-strong">' +
      getPlanetName(destPlanet, status.destPlanetId) +
      "</strong>";
    showGameToast(
      "<span>" +
        rImg +
        t("toast.rocket_launched", {
          rocket: rStrong,
          planet: dStrong,
          citizens: formatPlanetStat(status.bld.rocketCitizens),
          bricks: formatPlanetStat(bricksLoaded)
        }) +
        "</span>",
      "success"
    );
    notifySave("launch_rocket", true);
    return true;
  }

  function updateFollowCamera(time, dtSec) {
    if (followingFlightId === null) return false;
    let flight = null;
    for (let i = 0; i < activeFlights.length; i++) {
      if (activeFlights[i].id === followingFlightId) {
        flight = activeFlights[i];
        break;
      }
    }
    if (!flight) {
      followingFlightId = null;
      return false;
    }

    const elapsed = time - flight.startTime;
    const zoomLerp = 1 - Math.exp(-8 * dtSec);
    for (let i = 0; i < planets.length; i++) {
      planets[i].targetZoom = MIN_ZOOM;
    }

    if (elapsed < flight.liftoffDur) {
      const diff = flight.srcIdx - scrollPos;
      scrollPos += diff * zoomLerp;
      targetIndex = flight.srcIdx;
      return true;
    }

    if (elapsed < flight.liftoffDur + flight.cruiseDur) {
      const u = clamp01((elapsed - flight.liftoffDur) / flight.cruiseDur);
      const e = easeInOutCubic(u);
      scrollPos = lerp(flight.srcIdx, flight.destIdx, e);
      targetIndex = u >= 0.5 ? flight.destIdx : flight.srcIdx;
      return true;
    }

    const destPlanet = planets[flight.destIdx];
    const diff = flight.destIdx - scrollPos;
    if (Math.abs(diff) < 0.001) {
      scrollPos = flight.destIdx;
    } else {
      scrollPos += diff * (1 - Math.exp(-10 * dtSec));
    }
    targetIndex = flight.destIdx;
    if (!flight.focusedDest && destPlanet && flight.destTile) {
      flight.focusedDest = true;
      focusOnTile(destPlanet, flight.destTile);
    }
    return true;
  }

  function completeRocketFlight(flight, time) {
    const destIdx = flight.destIdx;
    const destPlanet = planets[destIdx];
    const wasLocked = destPlanet && !destPlanet.unlocked;

    buildingsByPlanet[destIdx][flight.destTileId] = {
      id: flight.rocketId,
      placedAt: time,
      placedOrder: nextBuildingOrder++,
      isLanded: true,
      landedCitizens: flight.citizens,
      loadedBricks: 0
    };
    tileEffectsByPlanet[destIdx][flight.destTileId] = {
      type: "build",
      prevBuildingId: null,
      startTime: time,
      duration: BUILD_VFX_MS,
      seed: Number(flight.destTileId) * 1.43 + (time % 97) * 0.013
    };

    if (flight.bricks > 0) {
      bricksByPlanet[destIdx] = (bricksByPlanet[destIdx] || 0) + flight.bricks;
    }
    const newCap = calculatePlanetCitizenCapacity(destIdx);
    citizensByPlanet[destIdx] = Math.max(
      getPlanetBaseCitizenCount(destIdx),
      Math.min(newCap, (citizensByPlanet[destIdx] || 0) + flight.citizens)
    );

    if (wasLocked) {
      destPlanet.unlocked = true;
      destPlanet.unlockVfx = createUnlockShatterVfx(time);
      updatePlanetLockDots();
      updatePlanetHeaderHud(true);
    }

    lastInteractionTime = time;
    updatePlanetStatsHud(true);

    const pImg = '<img class="game-toast-icon" src="' + destPlanet.iconSrc + '" alt="" draggable="false" />';
    const pStrong = '<strong class="game-toast-strong">' + destPlanet.name + "</strong>";
    const rStrong = '<strong class="game-toast-strong">' + flight.rocketName + "</strong>";
    const msgKey = wasLocked ? "toast.rocket_landed_unlocked" : "toast.rocket_landed_delivered";
    showGameToast(
      "<span>" +
        pImg +
        t(msgKey, {
          planet: pStrong,
          rocket: rStrong,
          citizens: formatPlanetStat(flight.citizens),
          bricks: formatPlanetStat(flight.bricks)
        }) +
        "</span>",
      "success"
    );
    notifySave("rocket_landed", true);
  }

  function updateAndDrawActiveFlights(time) {
    if (activeFlights.length === 0) return;

    for (let i = activeFlights.length - 1; i >= 0; i--) {
      const flight = activeFlights[i];
      const elapsed = time - flight.startTime;
      const totalDur = flight.liftoffDur + flight.cruiseDur + flight.landDur;

      if (elapsed >= totalDur) {
        const finished = flight;
        activeFlights.splice(i, 1);
        if (followingFlightId === finished.id) {
          followingFlightId = null;
        }
        completeRocketFlight(finished, time);
        updateFollowRocketButton();
        continue;
      }

      const srcPlanet = planets[flight.srcIdx];
      const destPlanet = planets[flight.destIdx];
      const srcTr = getPlanetTransform(srcPlanet, flight.srcIdx);
      const destTr = getPlanetTransform(destPlanet, flight.destIdx);

      const exitX = srcTr.x + srcTr.scaledRadius * 0.72;
      const exitY = srcTr.y - srcTr.scaledRadius * 1.15;
      const entryX = destTr.x - destTr.scaledRadius * 0.72;
      const entryY = destTr.y - destTr.scaledRadius * 1.18;

      let rx = 0;
      let ry = 0;
      let rAngle = -Math.PI * 0.35;
      let rScale = 18;
      let rAlpha = 1;
      let thrust = 1;

      if (elapsed < flight.liftoffDur) {
        const p = clamp01(elapsed / flight.liftoffDur);
        const e = p * p;
        const tInfo = flight.srcTile ? getPlanetTileScreenInfo(srcPlanet, srcTr, flight.srcTile) : null;
        const padX = tInfo && tInfo.z > -0.15 ? tInfo.basePt.x : srcTr.x + srcTr.scaledRadius * 0.35;
        const padY = tInfo && tInfo.z > -0.15 ? tInfo.basePt.y : srcTr.y - srcTr.scaledRadius * 0.25;
        const padNx = tInfo && tInfo.z > -0.15 ? tInfo.nx : 0.45;
        const padNy = tInfo && tInfo.z > -0.15 ? tInfo.ny : -0.89;

        const climb = srcTr.scaledRadius * 1.05 * e;
        const rawX = padX + padNx * climb;
        const rawY = padY + padNy * climb;
        const blend = clamp01((p - 0.55) / 0.45);
        rx = lerp(rawX, exitX, blend * blend);
        ry = lerp(rawY, exitY, blend * blend);

        const baseAng = Math.atan2(padNy, padNx);
        const targetAng = Math.atan2(exitY - rawY, exitX - rawX);
        rAngle = lerp(baseAng, targetAng, blend);
        rScale = clamp(srcTr.scaledRadius * 0.145 * lerp(1, 0.78, e), 14, 34);
        rAlpha = srcTr.alpha;
        thrust = 1.1;

        // Pad smoke billows right around launchpad during liftoff
        if (p < 0.75) {
          const smP = p / 0.75;
          for (let s = 0; s < 5; s++) {
            const ang = s * 1.25 + smP * 0.4;
            const spread = srcTr.scaledRadius * (0.06 + 0.22 * easeOutCubic(smP));
            drawSmokePuffCloud(
              ctx,
              padX + Math.cos(ang) * spread,
              padY + Math.sin(ang) * spread * 0.7,
              rScale * (0.36 + 0.25 * (1 - smP)),
              srcTr.alpha * (1 - smP) * 0.85,
              true
            );
          }
        }
      } else if (elapsed < flight.liftoffDur + flight.cruiseDur) {
        const u = clamp01((elapsed - flight.liftoffDur) / flight.cruiseDur);
        const e = easeInOutCubic(u);
        const arcPeakY = Math.min(exitY, entryY) - Math.min(height * 0.16, 110);
        const midX = (exitX + entryX) * 0.5;
        const omt = 1 - e;

        rx = omt * omt * exitX + 2 * omt * e * midX + e * e * entryX;
        ry = omt * omt * exitY + 2 * omt * e * arcPeakY + e * e * entryY;

        const vx = 2 * omt * (midX - exitX) + 2 * e * (entryX - midX);
        const vy = 2 * omt * (arcPeakY - exitY) + 2 * e * (entryY - arcPeakY);
        rAngle = Math.atan2(vy, vx);
        rScale = clamp(Math.min(width, height) * 0.044, 18, 32);
        rAlpha = 1;
        thrust = 1.0;

        if (time - flight.lastTrailAt > 42) {
          flight.lastTrailAt = time;
          flight.trail.push({
            x: rx - Math.cos(rAngle) * rScale * 0.65,
            y: ry - Math.sin(rAngle) * rScale * 0.65,
            r: rScale * 0.34,
            born: time
          });
        }
      } else {
        const q = clamp01((elapsed - flight.liftoffDur - flight.cruiseDur) / flight.landDur);
        const e = easeOutCubic(q);
        const tInfo = flight.destTile ? getPlanetTileScreenInfo(destPlanet, destTr, flight.destTile) : null;
        const landX = tInfo && tInfo.z > -0.15 ? tInfo.basePt.x : destTr.x;
        const landY = tInfo && tInfo.z > -0.15 ? tInfo.basePt.y : destTr.y;
        const landNx = tInfo && tInfo.z > -0.15 ? tInfo.nx : 0;
        const landNy = tInfo && tInfo.z > -0.15 ? tInfo.ny : -1;

        const approachDist = destTr.scaledRadius * 1.12;
        const startX = lerp(entryX, landX + landNx * approachDist, clamp01(q * 2.1));
        const startY = lerp(entryY, landY + landNy * approachDist, clamp01(q * 2.1));
        rx = lerp(startX, landX, e);
        ry = lerp(startY, landY, e);

        const uprightAng = Math.atan2(landNy, landNx);
        rAngle = q < 0.35 ? lerp(0.1, uprightAng, q / 0.35) : uprightAng;
        rScale = clamp(destTr.scaledRadius * 0.125, 14, 30);
        rAlpha = destTr.alpha;
        thrust = q < 0.9 ? 0.72 * (1 - q * 0.6) : 0;

        if (q > 0.72) {
          const dustP = (q - 0.72) / 0.28;
          for (let d = 0; d < 4; d++) {
            const da = d * 1.57 + dustP * 0.5;
            const spread = destTr.scaledRadius * (0.04 + 0.14 * dustP);
            drawSmokePuffCloud(
              ctx,
              landX + Math.cos(da) * spread,
              landY + Math.sin(da) * spread * 0.7,
              rScale * 0.32 * (1 - dustP * 0.5),
              destTr.alpha * (1 - dustP) * 0.85,
              false
            );
          }
        }
      }

      // Draw smoke trail puffs behind cruising rocket
      for (let tIdx = flight.trail.length - 1; tIdx >= 0; tIdx--) {
        const pt = flight.trail[tIdx];
        const age = (time - pt.born) / 680;
        if (age >= 1) {
          flight.trail.splice(tIdx, 1);
          continue;
        }
        drawSmokePuffCloud(ctx, pt.x, pt.y, pt.r * (0.7 + age * 0.75), (1 - age) * 0.78, false);
      }

      if (rAlpha > 0.02 && rx > -120 && rx < width + 120 && ry > -120 && ry < height + 120 && window.GameBuildings && typeof window.GameBuildings.renderRocketVessel3D === "function") {
        const atmoTint = elapsed < flight.liftoffDur ? srcPlanet.atmosphere : destPlanet.atmosphere;
        const rollSpin = (elapsed * 0.0022) % (Math.PI * 2);
        const vesselFrame = buildScreenSpace3DFrame(rx, ry, rAngle, rScale * 1.45, rollSpin, atmoTint);
        ctx.save();
        ctx.globalAlpha *= clamp01(rAlpha);
        window.GameBuildings.renderRocketVessel3D(ctx, flight.rocketId, vesselFrame, time, 1, {
          thrust: thrust,
          zOffset: -0.44
        });
        ctx.restore();
      }
    }
  }

  function updateRocketActionOverlay() {
    if (!tileRocketActionsEl) return;
    const modalBlocking =
      (window.GameResearch && typeof window.GameResearch.isOpen === "function" && window.GameResearch.isOpen()) ||
      cargoModalState.open;
    if (!rocketActionAnchor.visible || modalBlocking) {
      tileRocketActionsEl.classList.add("is-hidden");
      return;
    }

    const placed =
      buildingsByPlanet[rocketActionAnchor.planetId] &&
      buildingsByPlanet[rocketActionAnchor.planetId][rocketActionAnchor.tileId];
    const bld = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
    if (!placed || !bld || !bld.rocketTier) {
      tileRocketActionsEl.classList.add("is-hidden");
      return;
    }

    const loaded = Math.max(0, Math.floor(placed.loadedBricks || 0));
    if (tileRocketCargoLabelEl) {
      tileRocketCargoLabelEl.textContent =
        loaded > 0
          ? t("rocket.cargo_btn_loaded", {
              loaded: formatPlanetStat(loaded),
              max: formatPlanetStat(bld.rocketMaxBricks)
            })
          : t("rocket.cargo_btn");
    }
    if (tileRocketLaunchIconEl) {
      tileRocketLaunchIconEl.src = bld.iconSrc;
    }
    if (tileRocketLaunchBtn) {
      const status = getRocketLaunchStatus(rocketActionAnchor.planetId, rocketActionAnchor.tileId, false);
      tileRocketLaunchBtn.classList.toggle("is-disabled", !status.ok);
    }

    tileRocketActionsEl.classList.remove("is-hidden");
    positionActionGroupAroundBuilding(tileRocketActionsEl, rocketActionAnchor, false, 14);
  }

  function showTradeNoticeToast(bDef, planetIdx, templateKey, variant) {
    const pName = '<strong class="game-toast-strong">' + getPlanetName(planets[planetIdx], planetIdx) + "</strong>";
    const bStrong = '<strong class="game-toast-strong">' + bDef.name + "</strong>";
    const iconImg = '<img class="game-toast-icon" src="' + bDef.iconSrc + '" alt="" draggable="false" />';
    showGameToast(
      "<span>" + iconImg + t(templateKey, { building: bStrong, planet: pName }) + "</span>",
      variant
    );
  }

  function spawnTradeRocketFlight(planetIdx, tileId, bDef, sold, earned, time) {
    const planet = planets[planetIdx];
    const tile = planet && planet.tileById[tileId];
    activeTradeFlights.push({
      planetIdx: planetIdx,
      tileId: tileId,
      tile: tile,
      rocketId: bDef.id,
      speedMult: bDef.tradeSpeedMult || 1,
      sold: sold,
      earned: earned,
      startTime: time,
      duration: Math.round(TRADE_FLIGHT_BASE_MS / (bDef.tradeSpeedMult || 1))
    });
  }

  function tickTradeRockets(time, dtSec) {
    let totalActiveCreditsPerSec = 0;

    for (let pIdx = 0; pIdx < PLANET_COUNT; pIdx++) {
      const buildings = buildingsByPlanet[pIdx];
      if (!buildings || !window.GameBuildings) continue;
      const power = getPlanetPowerStatus(pIdx);
      const cit = getPlanetCitizenStatus(pIdx);
      const keys = Object.keys(buildings);
      for (let i = 0; i < keys.length; i++) {
        const tileId = keys[i];
        const bInfo = buildings[tileId];
        if (!bInfo || !bInfo.id) continue;
        const bDef = window.GameBuildings.getBuilding(bInfo.id);
        if (!bDef || !bDef.tradeVariant) continue;

        if (!bInfo.tradeEnabled) continue;

        if (!isTileOperational(tileId, bDef, power, cit)) {
          continue;
        }

        const avail = Math.floor(bricksByPlanet[pIdx] || 0);
        if (avail <= 0) {
          bInfo.tradeTimer = 0;
          continue;
        }

        bInfo.tradeTimer = (bInfo.tradeTimer || 0) + dtSec;
        if (bInfo.tradeTimer >= bDef.tradeIntervalSec) {
          bInfo.tradeTimer = 0;
          const sold = Math.min(avail, bDef.bricksPerLaunch);
          const earned = sold * bDef.creditsPerBrick;
          bricksByPlanet[pIdx] = Math.max(0, bricksByPlanet[pIdx] - sold);
          if (window.GameCurrencies && typeof window.GameCurrencies.add === "function") {
            window.GameCurrencies.add("credits", earned);
          }
          spawnTradeRocketFlight(pIdx, tileId, bDef, sold, earned, time);
        }

        totalActiveCreditsPerSec += (bDef.bricksPerLaunch * bDef.creditsPerBrick) / bDef.tradeIntervalSec;
      }
    }

    if (window.GameCurrencies && typeof window.GameCurrencies.setDisplayRate === "function") {
      window.GameCurrencies.setDisplayRate("credits", totalActiveCreditsPerSec);
    }
  }

  function updateAndDrawTradeFlights(time) {
    if (activeTradeFlights.length === 0) return;

    for (let i = activeTradeFlights.length - 1; i >= 0; i--) {
      const tf = activeTradeFlights[i];
      const p = (time - tf.startTime) / tf.duration;
      if (p >= 1) {
        activeTradeFlights.splice(i, 1);
        continue;
      }

      if (Math.abs(tf.planetIdx - scrollPos) >= 0.999) {
        continue;
      }

      const planet = planets[tf.planetIdx];
      const tr = getPlanetTransform(planet, tf.planetIdx);
      const tInfo = tf.tile ? getPlanetTileScreenInfo(planet, tr, tf.tile) : null;
      const padX = tInfo && tInfo.z > -0.15 ? tInfo.basePt.x : tr.x;
      const padY = tInfo && tInfo.z > -0.15 ? tInfo.basePt.y : tr.y - tr.scaledRadius * 0.4;

      if (p < 0.78 && window.GameBuildings && typeof window.GameBuildings.renderRocketVessel3D === "function" && tf.tile) {
        const pitchX = clamp(planet.basePitch + planet.pitchOffset, -MAX_PITCH, MAX_PITCH);
        const rotatePoint = createRotator(planet.spinY, pitchX, planet.roll);
        const rotNormal = rotatePoint(tf.tile.normal);
        const rotT = rotatePoint(tf.tile.tangentT);
        const rotB = rotatePoint(tf.tile.tangentB);
        const rotPlaneCenter = rotatePoint(tf.tile.planeCenter);
        const elev = tf.tile.currentElev || tf.tile.baseElev || 1.02;
        const elevCenter = scale(rotPlaneCenter, elev);
        const unitScale = tf.tile.hexScale * elev;

        const climbN = (0.56 + 6.2 * tf.speedMult * p * p) * unitScale;
        const turnT = 1.45 * tf.speedMult * p * p * p * unitScale;
        const worldOrigin = add(add(elevCenter, scale(rotNormal, climbN)), scale(rotT, turnT));

        if (worldOrigin.z > -0.35 && worldOrigin.z < 2.55) {
          const focalLength = tr.scaledRadius * Math.sqrt(CAM_DIST * CAM_DIST - 1);
          const basis = buildRotatedRocketBasis(rotT, rotB, rotNormal, Math.min(0.68, p * 0.85), p * Math.PI * 1.4);
          const vesselFrame = {
            origin: worldOrigin,
            rotT: basis.rotT,
            rotB: basis.rotB,
            rotN: basis.rotN,
            scale: unitScale * lerp(1, 0.72, p),
            phase: tf.tile.phase || 0,
            cx: tr.x,
            cy: tr.y,
            focalLength: focalLength,
            camVec: CAM_VEC,
            lightDir: LIGHT_DIR,
            halfVec: HALF_VEC,
            atmo: planet.atmosphere,
            isSelected: false,
            project: project
          };
          const fadeAlpha = p > 0.56 ? 1 - (p - 0.56) / 0.22 : 1;
          ctx.save();
          ctx.globalAlpha *= clamp01(tr.alpha * fadeAlpha);
          window.GameBuildings.renderRocketVessel3D(ctx, tf.rocketId, vesselFrame, time, 1, {
            thrust: 1.15,
            zOffset: -0.44
          });
          ctx.restore();
        }
      }

      if (p < 0.55) {
        const smP = p / 0.55;
        const smokeScale = clamp(tr.scaledRadius * 0.115, 11, 24);
        for (let s = 0; s < 3; s++) {
          const ang = s * 2.1 + smP * 0.4;
          const spread = tr.scaledRadius * (0.04 + 0.12 * smP);
          drawSmokePuffCloud(
            ctx,
            padX + Math.cos(ang) * spread,
            padY + Math.sin(ang) * spread * 0.7,
            smokeScale * 0.34 * (1 - smP * 0.4),
            tr.alpha * (1 - smP) * 0.78,
            true
          );
        }
      }
    }
  }

  function updateTradeActionOverlay() {
    if (!tileTradeActionsEl) return;
    const modalBlocking =
      (window.GameResearch && typeof window.GameResearch.isOpen === "function" && window.GameResearch.isOpen()) ||
      cargoModalState.open;
    if (!tradeActionAnchor.visible || modalBlocking) {
      tileTradeActionsEl.classList.add("is-hidden");
      return;
    }

    const placed =
      buildingsByPlanet[tradeActionAnchor.planetId] &&
      buildingsByPlanet[tradeActionAnchor.planetId][tradeActionAnchor.tileId];
    const bDef = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
    const planet = planets[tradeActionAnchor.planetId];
    const tile = planet && planet.tileById ? planet.tileById[tradeActionAnchor.tileId] : null;
    const biomeId = tile ? tile.biome : null;
    const isTrade = Boolean(bDef && bDef.tradeVariant);
    const nextDef =
      placed && !placed.isLanded && bDef && window.GameBuildings && typeof window.GameBuildings.getNextUpgradeBuilding === "function"
        ? window.GameBuildings.getNextUpgradeBuilding(bDef.id, biomeId)
        : null;

    if (!placed || !bDef || (!isTrade && !nextDef)) {
      tileTradeActionsEl.classList.add("is-hidden");
      return;
    }

    if (tileTradeToggleBtn) {
      if (isTrade) {
        const enabled = Boolean(placed.tradeEnabled);
        tileTradeToggleBtn.classList.remove("is-hidden");
        tileTradeToggleBtn.classList.toggle("is-active", enabled);
        tileTradeToggleBtn.classList.toggle("is-stopped", !enabled);
        if (tileTradeToggleLabelEl) {
          tileTradeToggleLabelEl.textContent = t(enabled ? "trade.btn_stop" : "trade.btn_enable");
        }
      } else {
        tileTradeToggleBtn.classList.add("is-hidden");
      }
    }

    if (tileTradeUpgradeBtn) {
      if (nextDef) {
        tileTradeUpgradeBtn.classList.remove("is-hidden");
        const canAfford =
          window.GameBuildings && typeof window.GameBuildings.canAffordBuilding === "function"
            ? window.GameBuildings.canAffordBuilding(nextDef.id, planet.id)
            : true;
        const researchLocked =
          window.GameBuildings && typeof window.GameBuildings.isBuildingResearchLocked === "function"
            ? window.GameBuildings.isBuildingResearchLocked(nextDef.id)
            : false;
        tileTradeUpgradeBtn.classList.toggle("is-disabled", !canAfford || researchLocked);
        if (tileTradeUpgradeIconEl) {
          tileTradeUpgradeIconEl.src = nextDef.iconSrc;
        }
        if (tileTradeUpgradeLabelEl) {
          tileTradeUpgradeLabelEl.textContent = t("trade.btn_upgrade", { name: nextDef.name });
        }
      } else {
        tileTradeUpgradeBtn.classList.add("is-hidden");
      }
    }

    tileTradeActionsEl.classList.remove("is-hidden");
    positionActionGroupAroundBuilding(tileTradeActionsEl, tradeActionAnchor, !(isTrade && nextDef), 14);
  }

  // --- Main Render Loop ---

  function render(time) {
    if (!ctx || !canvas) return;

    const dtMs = Math.min(time - lastFrameTime, 60);
    const dtSec = dtMs / 1000;
    lastFrameTime = time;

    let citizenRegenChanged = false;
    for (let i = 0; i < PLANET_COUNT; i++) {
      const brickRate = calculatePlanetBrickRate(i);
      if (brickRate > 0) {
        bricksByPlanet[i] += brickRate * dtSec;
      }
      if (planets[i] && planets[i].unlocked) {
        const minCit = getPlanetBaseCitizenCount(i);
        const maxCit = calculatePlanetCitizenCapacity(i);
        const prevFloorCit = Math.floor(citizensByPlanet[i] || 0);
        if (citizensByPlanet[i] < minCit) {
          citizensByPlanet[i] = minCit;
        }
        if (maxCit > 0 && citizensByPlanet[i] < maxCit) {
          citizensByPlanet[i] = Math.min(maxCit, citizensByPlanet[i] + CITIZEN_REGEN_PER_SEC * dtSec);
        } else if (citizensByPlanet[i] > maxCit) {
          citizensByPlanet[i] = Math.max(minCit, maxCit);
        }
        if (Math.floor(citizensByPlanet[i] || 0) !== prevFloorCit) {
          citizenRegenChanged = true;
        }
      }
    }
    tickTradeRockets(time, dtSec);
    updatePlanetBricksHud(false);
    updatePlanetCitizenHud(false);
    if (citizenRegenChanged) {
      syncOreProductionRate(false);
      if (resourceTooltipState.open && resourceTooltipState.key === "citizens") {
        updateResourceTooltipContent();
      }
    }
    if (cargoModalState.open) {
      syncRocketCargoModal();
    }

    if (window.GameResearch && typeof window.GameResearch.tick === "function") {
      window.GameResearch.tick(dtSec, calculateTotalResearchRate());
    }

    researchButtonAnchor.visible = false;
    rocketActionAnchor.visible = false;
    tradeActionAnchor.visible = false;

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

    const followingActive = updateFollowCamera(time, dtSec);
    if (!followingActive && (!isDragging || gestureMode !== "scroll")) {
      const diff = targetIndex - scrollPos;
      if (Math.abs(diff) < 0.0005) {
        scrollPos = targetIndex;
      } else {
        scrollPos += diff * (1 - Math.exp(-10 * dtSec));
      }
    }

    const dScroll = scrollPos - lastRenderScrollPos;
    lastRenderScrollPos = scrollPos;
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

    updateAndDrawActiveFlights(time);
    updateAndDrawTradeFlights(time);

    if (tileResearchBtn) {
      const modalActive =
        (window.GameResearch && typeof window.GameResearch.isOpen === "function" && window.GameResearch.isOpen()) ||
        cargoModalState.open;
      if (researchButtonAnchor.visible && !modalActive) {
        tileResearchBtn.classList.remove("is-hidden");
        tileResearchBtn.classList.toggle("is-below", Boolean(researchButtonAnchor.isBelow));
        tileResearchBtn.style.transform =
          "translate3d(" +
          researchButtonAnchor.x.toFixed(1) +
          "px, " +
          researchButtonAnchor.y.toFixed(1) +
          "px, 0) translate(-50%, " +
          (researchButtonAnchor.isBelow ? "0" : "-100%") +
          ")";
      } else {
        tileResearchBtn.classList.add("is-hidden");
      }
    }

    updateRocketActionOverlay();
    updateTradeActionOverlay();
    updateFollowRocketButton();

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
      followingFlightId = null;
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
        const idx = Math.round(clamp(scrollPos, 0, PLANET_COUNT - 1));
        const unlocked = planets[idx] && planets[idx].unlocked;
        const hit = isHoveringPlanet && unlocked ? findHexAtPoint(e.clientX, e.clientY, false) : null;
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

    if (onPlanet && activePlanet && !activePlanet.unlocked) {
      const reqTier = activePlanet.requiredRocketTier || 1;
      const rocketImgName = reqTier >= 2 ? "bld-space-rocket-2.svg" : "bld-space-rocket-1.svg";
      const prevPlanet = planets[Math.max(0, startSnapIndex - 1)];
      const lockIcon = '<img class="game-toast-icon" src="./assets/ui/icon-lock.svg" alt="" draggable="false" />';
      const planetPill =
        '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="' +
        activePlanet.iconSrc +
        '" alt="" draggable="false" /> ' +
        getPlanetName(activePlanet, startSnapIndex) +
        "</span>";
      const tierPill =
        '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="./assets/ui/' +
        rocketImgName +
        '" alt="" draggable="false" /> ' +
        t("rocket.tier_chip", { tier: reqTier }) +
        "</span>";
      const prevPill =
        '<strong class="game-toast-strong">' +
        getPlanetName(prevPlanet, Math.max(0, startSnapIndex - 1)) +
        "</strong>";
      showGameToast(
        "<span>" +
          lockIcon +
          t("toast.planet_locked_requires_rocket", {
            planet: planetPill,
            tier: tierPill,
            prevPlanet: prevPill
          }) +
          "</span>"
      );
      lastInteractionTime = now;
      return;
    }
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

    let nextTarget;
    if (pointerVelocity < -0.35) {
      nextTarget = Math.min(PLANET_COUNT - 1, Math.max(startSnapIndex + 1, Math.round(scrollPos)));
    } else if (pointerVelocity > 0.35) {
      nextTarget = Math.max(0, Math.min(startSnapIndex - 1, Math.round(scrollPos)));
    } else {
      nextTarget = clamp(Math.round(scrollPos), 0, PLANET_COUNT - 1);
    }
    goToPlanet(nextTarget);
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
    if (window.GameResearch && typeof window.GameResearch.isOpen === "function" && window.GameResearch.isOpen()) {
      if (e.key === "Escape") {
        window.GameResearch.close();
      }
      return;
    }
    if (cargoModalState.open) {
      if (e.key === "Escape") {
        closeRocketCargoModal();
      }
      return;
    }
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
      if (resourceTooltipState.open) {
        closeResourceTooltip();
        return;
      }
      if (window.GameBuildings && typeof window.GameBuildings.isConfirming === "function" && window.GameBuildings.isConfirming()) {
        window.GameBuildings.cancelConfirm();
        return;
      }
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
    if (tileResearchBtn) {
      tileResearchBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (window.GameResearch && typeof window.GameResearch.open === "function") {
          window.GameResearch.open(planets[activeDotIndex]);
        }
      });
    }

    if (tileRocketCargoBtn) {
      tileRocketCargoBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (rocketActionAnchor.planetId >= 0 && rocketActionAnchor.tileId) {
          openRocketCargoModal(rocketActionAnchor.planetId, rocketActionAnchor.tileId);
        }
      });
    }

    if (tileRocketLaunchBtn) {
      tileRocketLaunchBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (rocketActionAnchor.planetId >= 0 && rocketActionAnchor.tileId) {
          launchRocket(rocketActionAnchor.planetId, rocketActionAnchor.tileId);
        }
      });
    }

    if (tileTradeToggleBtn) {
      tileTradeToggleBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const pId = tradeActionAnchor.planetId;
        const tId = tradeActionAnchor.tileId;
        const placed = pId >= 0 && tId ? buildingsByPlanet[pId] && buildingsByPlanet[pId][tId] : null;
        const bDef = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
        if (!placed || !bDef || !bDef.tradeVariant) return;

        if (placed.tradeEnabled) {
          placed.tradeEnabled = false;
          placed.tradeTimer = 0;
          showTradeNoticeToast(bDef, pId, "toast.trade_stopped");
        } else {
          placed.tradeEnabled = true;
          placed.tradeTimer = 0;
          showTradeNoticeToast(bDef, pId, "toast.trade_started", "success");
        }
        updateTradeActionOverlay();
        notifySave("trade_toggle", true);
      });
    }

    if (tileTradeUpgradeBtn) {
      tileTradeUpgradeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const pId = tradeActionAnchor.planetId;
        const tId = tradeActionAnchor.tileId;
        const placed = pId >= 0 && tId ? buildingsByPlanet[pId] && buildingsByPlanet[pId][tId] : null;
        const bDef = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
        if (!placed || placed.isLanded || !bDef || !window.GameBuildings) return;

        const planet = planets[pId];
        const tile = planet && planet.tileById ? planet.tileById[tId] : null;
        const biomeId = tile ? tile.biome : null;
        const nextDef =
          typeof window.GameBuildings.getNextUpgradeBuilding === "function"
            ? window.GameBuildings.getNextUpgradeBuilding(bDef.id, biomeId)
            : null;
        if (!nextDef) return;

        let ok = false;
        if (typeof window.GameBuildings.requestUpgradeForTile === "function") {
          ok = window.GameBuildings.requestUpgradeForTile(pId, tId, placed.id, biomeId, nextDef.id);
        } else if (typeof window.GameBuildings.openConfirmForBuilding === "function") {
          window.GameBuildings.openConfirmForBuilding(nextDef.id);
          ok = true;
        }

        if (!ok) {
          tileTradeUpgradeBtn.classList.remove("is-shake");
          void tileTradeUpgradeBtn.offsetWidth;
          tileTradeUpgradeBtn.classList.add("is-shake");
          window.setTimeout(function () {
            tileTradeUpgradeBtn.classList.remove("is-shake");
          }, 280);
        }
      });
    }

    if (followRocketBtn) {
      followRocketBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (activeFlights.length === 0) {
          followingFlightId = null;
          updateFollowRocketButton();
          return;
        }
        const targetFlight = activeFlights[activeFlights.length - 1];
        if (followingFlightId === targetFlight.id) {
          followingFlightId = null;
        } else {
          followingFlightId = targetFlight.id;
          isDragging = false;
          activePointerId = null;
          gestureMode = null;
          clearSelectionAndCloseBuildMenu();
        }
        updateFollowRocketButton();
      });
    }

    if (closeRocketCargoBtn) {
      closeRocketCargoBtn.addEventListener("click", closeRocketCargoModal);
    }
    if (rocketCargoBackdropEl) {
      rocketCargoBackdropEl.addEventListener("click", closeRocketCargoModal);
    }
    if (cargoDoneBtn) {
      cargoDoneBtn.addEventListener("click", closeRocketCargoModal);
    }
    if (cargoLaunchBtn) {
      cargoLaunchBtn.addEventListener("click", function () {
        if (cargoModalState.open && cargoModalState.planetId >= 0 && cargoModalState.tileId) {
          launchRocket(cargoModalState.planetId, cargoModalState.tileId);
        }
      });
    }
    if (rocketCargoSliderEl) {
      rocketCargoSliderEl.addEventListener("input", function () {
        if (cargoModalState.open) {
          setRocketLoadedBricks(cargoModalState.planetId, cargoModalState.tileId, Number(this.value));
        }
      });
    }
    if (cargoEmptyBtn) {
      cargoEmptyBtn.addEventListener("click", function () {
        if (cargoModalState.open) {
          setRocketLoadedBricks(cargoModalState.planetId, cargoModalState.tileId, 0);
        }
      });
    }
    if (cargoMinusBtn) {
      cargoMinusBtn.addEventListener("click", function () {
        if (!cargoModalState.open) return;
        const placed =
          buildingsByPlanet[cargoModalState.planetId] &&
          buildingsByPlanet[cargoModalState.planetId][cargoModalState.tileId];
        setRocketLoadedBricks(
          cargoModalState.planetId,
          cargoModalState.tileId,
          ((placed && placed.loadedBricks) || 0) - 10
        );
      });
    }
    if (cargoPlusBtn) {
      cargoPlusBtn.addEventListener("click", function () {
        if (!cargoModalState.open) return;
        const placed =
          buildingsByPlanet[cargoModalState.planetId] &&
          buildingsByPlanet[cargoModalState.planetId][cargoModalState.tileId];
        setRocketLoadedBricks(
          cargoModalState.planetId,
          cargoModalState.tileId,
          ((placed && placed.loadedBricks) || 0) + 10
        );
      });
    }
    if (cargoMaxBtn) {
      cargoMaxBtn.addEventListener("click", function () {
        if (!cargoModalState.open) return;
        const placed =
          buildingsByPlanet[cargoModalState.planetId] &&
          buildingsByPlanet[cargoModalState.planetId][cargoModalState.tileId];
        const bld = placed && window.GameBuildings ? window.GameBuildings.getBuilding(placed.id) : null;
        if (bld && bld.rocketMaxBricks) {
          setRocketLoadedBricks(cargoModalState.planetId, cargoModalState.tileId, bld.rocketMaxBricks);
        }
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

    for (let i = 0; i < resourceTooltipTriggers.length; i++) {
      const triggerEl = resourceTooltipTriggers[i];
      triggerEl.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
      });
      triggerEl.addEventListener("click", function (e) {
        e.stopPropagation();
        const key = triggerEl.getAttribute("data-resource-tooltip");
        openResourceTooltip(key, triggerEl);
      });
      triggerEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          const key = triggerEl.getAttribute("data-resource-tooltip");
          openResourceTooltip(key, triggerEl);
        }
      });
    }

    document.addEventListener("pointerdown", function (e) {
      if (!resourceTooltipState.open) return;
      const target = e.target;
      if (target && typeof target.closest === "function") {
        if (target.closest("[data-resource-tooltip]") || target.closest("#hud-resource-tooltip")) {
          return;
        }
      }
      closeResourceTooltip();
    });
  }

  function init() {
    if (!canvas || !ctx) return;

    if (window.GameResearch) {
      if (typeof window.GameResearch.setPlanetProvider === "function") {
        window.GameResearch.setPlanetProvider(function () {
          return planets;
        });
      }
      if (typeof window.GameResearch.onChange === "function") {
        window.GameResearch.onChange(function () {
          for (let i = 0; i < PLANET_COUNT; i++) {
            const minCit = getPlanetBaseCitizenCount(i);
            const cap = calculatePlanetCitizenCapacity(i);
            citizensByPlanet[i] = clamp(citizensByPlanet[i] || 0, minCit, Math.max(minCit, cap));
          }
          updatePlanetStatsHud(true);
        });
      }
    }

    if (window.GameBuildings) {
      window.GameBuildings.setHandlers({
        getPlanetBricks: function (planetId) {
          const idx = planetId !== undefined && planetId !== null ? planetId : targetIndex;
          return bricksByPlanet[idx] || 0;
        },
        getBuildingCountOnPlanet: countBuildingOnPlanet,
        getBuildingCountGlobal: countBuildingGlobal,
        onPlace: function (buildingId) {
          const tileId = selectedHexByPlanet[targetIndex];
          if (!tileId) return;
          const planet = planets[targetIndex];
          if (!planet || !planet.unlocked) return;
          const existing = buildingsByPlanet[targetIndex][tileId];
          if (existing && existing.id === buildingId) return;

          const tile = planet.tileById[tileId];
          const bld = window.GameBuildings.getBuilding(buildingId);
          if (!bld || !tile) return;
          if (
            bld.requiredResearch &&
            window.GameResearch &&
            typeof window.GameResearch.isResearched === "function" &&
            !window.GameResearch.isResearched(bld.requiredResearch)
          ) {
            return;
          }
          if (bld.maxPerPlanet && countBuildingOnPlanet(targetIndex, buildingId) >= bld.maxPerPlanet) {
            return;
          }
          if (!window.GameBuildings.canBuildOnBiome(buildingId, tile.biome)) return;
          const buildCost =
            typeof window.GameBuildings.getBuildingCost === "function"
              ? window.GameBuildings.getBuildingCost(buildingId)
              : bld.cost;
          if (buildCost) {
            if (buildCost.bricks) {
              const reqBricks = Math.max(0, Number(buildCost.bricks) || 0);
              if ((bricksByPlanet[targetIndex] || 0) < reqBricks) {
                return;
              }
            }
            const globalCosts = {};
            for (const cKey in buildCost) {
              if (cKey !== "bricks" && Object.prototype.hasOwnProperty.call(buildCost, cKey)) {
                globalCosts[cKey] = buildCost[cKey];
              }
            }
            if (window.GameCurrencies && !window.GameCurrencies.spend(globalCosts)) {
              return;
            }
            if (buildCost.bricks) {
              const reqBricks = Math.max(0, Number(buildCost.bricks) || 0);
              bricksByPlanet[targetIndex] = Math.max(0, (bricksByPlanet[targetIndex] || 0) - reqBricks);
              updatePlanetBricksHud(true);
            }
          }

          const existingDef =
            existing && existing.id && window.GameBuildings
              ? window.GameBuildings.getBuilding(existing.id)
              : null;
          let preservedLoadedBricks = 0;
          if (existing && existing.loadedBricks > 0) {
            if (existingDef && existingDef.rocketTier && bld.rocketTier && !existing.isLanded) {
              preservedLoadedBricks = Math.min(existing.loadedBricks, bld.rocketMaxBricks || 0);
              const refundBricks = existing.loadedBricks - preservedLoadedBricks;
              if (refundBricks > 0) {
                bricksByPlanet[targetIndex] = (bricksByPlanet[targetIndex] || 0) + refundBricks;
              }
            } else {
              bricksByPlanet[targetIndex] = (bricksByPlanet[targetIndex] || 0) + existing.loadedBricks;
            }
          }

          const prevCap = calculatePlanetCitizenCapacity(targetIndex);
          const now = performance.now();
          const wasTrade = Boolean(existingDef && existingDef.tradeVariant);
          const initialTradeEnabled =
            bld.tradeVariant
              ? wasTrade
                ? Boolean(existing.tradeEnabled)
                : true
              : false;
          buildingsByPlanet[targetIndex][tileId] = {
            id: buildingId,
            placedAt: now,
            placedOrder: nextBuildingOrder++,
            isLanded: false,
            loadedBricks: preservedLoadedBricks,
            landedCitizens: 0,
            tradeEnabled: initialTradeEnabled,
            tradeTimer: 0
          };
          const minCit = getPlanetBaseCitizenCount(targetIndex);
          const newCap = calculatePlanetCitizenCapacity(targetIndex);
          const capDiff = newCap - prevCap;
          if (capDiff > 0) {
            citizensByPlanet[targetIndex] = clamp((citizensByPlanet[targetIndex] || 0) + capDiff, minCit, Math.max(minCit, newCap));
          } else {
            citizensByPlanet[targetIndex] = clamp(citizensByPlanet[targetIndex] || 0, minCit, Math.max(minCit, newCap));
          }

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
          notifySave("build", true);
        },
        onRemove: function () {
          const tileId = selectedHexByPlanet[targetIndex];
          if (!tileId) return;
          const removed = buildingsByPlanet[targetIndex][tileId];
          if (!removed) return;

          if (removed.loadedBricks > 0) {
            bricksByPlanet[targetIndex] = (bricksByPlanet[targetIndex] || 0) + removed.loadedBricks;
          }
          if (cargoModalState.open && cargoModalState.planetId === targetIndex && cargoModalState.tileId === tileId) {
            closeRocketCargoModal();
          }

          const now = performance.now();
          delete buildingsByPlanet[targetIndex][tileId];
          const minCit = getPlanetBaseCitizenCount(targetIndex);
          const newCap = calculatePlanetCitizenCapacity(targetIndex);
          citizensByPlanet[targetIndex] = clamp(citizensByPlanet[targetIndex] || 0, minCit, Math.max(minCit, newCap));
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
          notifySave("demolish", true);
        },
        onClose: function () {
          selectedHexByPlanet[targetIndex] = null;
          selectionPulse = null;
          lastInteractionTime = performance.now();
        }
      });
    }

    if (window.GameCurrencies && typeof window.GameCurrencies.onChange === "function") {
      window.GameCurrencies.onChange(function () {
        if (resourceTooltipState.open && (resourceTooltipState.key === "credits" || resourceTooltipState.key === "ore")) {
          updateResourceTooltipContent();
        }
      });
    }

    loadSavedPlanetNames();
    if (window.GameSave && typeof window.GameSave.boot === "function") {
      window.GameSave.boot();
    }
    syncOreProductionRate(true);
    resizeCanvas();
    updateIndicatorDots();
    updateControlStates();
    bindEvents();
    window.requestAnimationFrame(render);
  }

  function roundDecimals(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round((Number(num) || 0) * factor) / factor;
  }

  function formatOfflineDuration(sec) {
    const total = Math.max(1, Math.floor(sec));
    if (total < 60) {
      return t("save.duration_sec", { s: total });
    }
    const mins = Math.floor(total / 60);
    if (mins < 60) {
      return t("save.duration_min", { m: mins });
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (remMins === 0) {
      return t("save.duration_hr", { h: hrs });
    }
    return t("save.duration_hr_min", { h: hrs, m: remMins });
  }

  function settleSavedFlightSilently(flightData) {
    if (!flightData || typeof flightData !== "object") return false;
    const destIdx = Math.round(Number(flightData.destIdx));
    if (!Number.isFinite(destIdx) || destIdx < 0 || destIdx >= PLANET_COUNT) return false;
    const destPlanet = planets[destIdx];
    if (!destPlanet) return false;

    const bDef = window.GameBuildings ? window.GameBuildings.getBuilding(flightData.rocketId) : null;
    if (!bDef) return false;

    let destTileId = flightData.destTileId != null ? String(flightData.destTileId) : null;
    if (!destTileId || !destPlanet.tileById || !destPlanet.tileById[destTileId] || buildingsByPlanet[destIdx][destTileId]) {
      const freeTile = findFreeLandingTile(destIdx, bDef.id);
      destTileId = freeTile ? freeTile.id : null;
    }

    const landedCitizens = Math.max(0, Math.floor(Number(flightData.citizens) || bDef.rocketCitizens || 0));
    const deliveredBricks = Math.max(0, Math.floor(Number(flightData.bricks) || 0));

    if (destTileId) {
      buildingsByPlanet[destIdx][destTileId] = {
        id: bDef.id,
        placedAt: -1000,
        placedOrder: nextBuildingOrder++,
        isLanded: true,
        landedCitizens: landedCitizens,
        loadedBricks: 0,
        tradeEnabled: false,
        tradeTimer: 0
      };
    }

    if (deliveredBricks > 0) {
      bricksByPlanet[destIdx] = Math.max(0, (bricksByPlanet[destIdx] || 0) + deliveredBricks);
    }

    destPlanet.unlocked = true;
    destPlanet.shadowAmount = 0;
    destPlanet.unlockVfx = null;

    const minCit = getPlanetBaseCitizenCount(destIdx);
    const newCap = calculatePlanetCitizenCapacity(destIdx);
    citizensByPlanet[destIdx] = Math.max(
      minCit,
      Math.min(Math.max(minCit, newCap), (citizensByPlanet[destIdx] || 0) + landedCitizens)
    );
    return true;
  }

  function exportState() {
    const exportedPlanets = [];
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      const srcBuildings = buildingsByPlanet[i] || {};
      const outBuildings = {};
      const tileKeys = Object.keys(srcBuildings);
      for (let k = 0; k < tileKeys.length; k++) {
        const tileId = tileKeys[k];
        const bInfo = srcBuildings[tileId];
        if (!bInfo || !bInfo.id) continue;
        const bDef = window.GameBuildings ? window.GameBuildings.getBuilding(bInfo.id) : null;
        const entry = {
          id: bInfo.id,
          order: Number.isFinite(bInfo.placedOrder) ? bInfo.placedOrder : 0
        };
        if (bInfo.isLanded) {
          entry.isLanded = true;
          entry.landedCitizens = Math.max(0, Math.floor(bInfo.landedCitizens || 0));
        }
        if (bInfo.loadedBricks > 0) {
          entry.loadedBricks = Math.max(0, Math.floor(bInfo.loadedBricks));
        }
        if (bDef && bDef.tradeVariant) {
          entry.tradeEnabled = Boolean(bInfo.tradeEnabled);
          entry.tradeTimer = roundDecimals(bInfo.tradeTimer || 0, 3);
        }
        outBuildings[tileId] = entry;
      }

      exportedPlanets.push({
        name: p ? p.name : getPlanetName(null, i),
        unlocked: i === 0 ? true : Boolean(p && p.unlocked),
        bricks: roundDecimals(Math.max(0, Number(bricksByPlanet[i]) || 0), 4),
        citizens: roundDecimals(Math.max(getPlanetBaseCitizenCount(i), Number(citizensByPlanet[i]) || 0), 4),
        buildings: outBuildings
      });
    }

    const nowPerf = performance.now();
    const pendingFlights = [];
    for (let f = 0; f < activeFlights.length; f++) {
      const fl = activeFlights[f];
      const totalDur = (fl.liftoffDur || 1350) + (fl.cruiseDur || 2050) + (fl.landDur || 1200);
      const elapsed = Math.max(0, nowPerf - (fl.startTime || nowPerf));
      const remainingMs = Math.max(0, Math.round(totalDur - elapsed));
      pendingFlights.push({
        srcIdx: fl.srcIdx,
        destIdx: fl.destIdx,
        srcTileId: fl.srcTileId,
        destTileId: fl.destTileId,
        rocketId: fl.rocketId,
        tier: fl.tier,
        citizens: fl.citizens,
        bricks: fl.bricks,
        remainingMs: remainingMs
      });
    }

    return {
      activePlanet: clamp(Math.round(targetIndex || 0), 0, PLANET_COUNT - 1),
      nextBuildingOrder: nextBuildingOrder,
      planets: exportedPlanets,
      pendingFlights: pendingFlights
    };
  }

  function importState(data, elapsedOfflineMs) {
    activeFlights.length = 0;
    activeTradeFlights.length = 0;
    followingFlightId = null;
    for (let i = 0; i < PLANET_COUNT; i++) {
      tileEffectsByPlanet[i] = Object.create(null);
      buildingsByPlanet[i] = Object.create(null);
    }
    clearSelectionAndCloseBuildMenu();

    let maxOrderSeen = 0;
    const savedPlanets = data && Array.isArray(data.planets) ? data.planets : [];

    for (let i = 0; i < PLANET_COUNT; i++) {
      const p = planets[i];
      const sp = savedPlanets[i] && typeof savedPlanets[i] === "object" ? savedPlanets[i] : null;
      if (!p) continue;

      p.name = sp && sp.name ? sanitizePlanetName(sp.name, p.defaultName) : p.defaultName;
      p.unlocked = i === 0 ? true : Boolean(sp && sp.unlocked);
      p.shadowAmount = p.unlocked ? 0 : 1;
      p.unlockVfx = null;

      if (dotButtons[i]) {
        dotButtons[i].setAttribute("aria-label", p.name);
      }

      if (sp && sp.bricks !== undefined && Number.isFinite(Number(sp.bricks))) {
        bricksByPlanet[i] = Math.max(0, Number(sp.bricks));
      } else {
        bricksByPlanet[i] = Array.isArray(startingBricksCfg) ? Math.max(0, Number(startingBricksCfg[i]) || 0) : 0;
      }

      const rawBuildings = sp && sp.buildings && typeof sp.buildings === "object" ? sp.buildings : {};
      const tileKeys = Object.keys(rawBuildings);
      for (let k = 0; k < tileKeys.length; k++) {
        const tileId = String(tileKeys[k]);
        const bData = rawBuildings[tileKeys[k]];
        if (!bData || typeof bData !== "object" || !bData.id) continue;
        if (!p.tileById || !p.tileById[tileId]) continue;
        const bDef = window.GameBuildings ? window.GameBuildings.getBuilding(bData.id) : null;
        if (!bDef) continue;

        const ord =
          Number.isFinite(Number(bData.order)) && Number(bData.order) > 0
            ? Math.floor(Number(bData.order))
            : ++maxOrderSeen;
        if (ord > maxOrderSeen) maxOrderSeen = ord;

        const isLanded = Boolean(bData.isLanded);
        buildingsByPlanet[i][tileId] = {
          id: bDef.id,
          placedAt: -1000,
          placedOrder: ord,
          isLanded: isLanded,
          landedCitizens: isLanded ? Math.max(0, Math.floor(Number(bData.landedCitizens) || bDef.rocketCitizens || 0)) : 0,
          loadedBricks: !isLanded && bDef.rocketTier ? clamp(Math.floor(Number(bData.loadedBricks) || 0), 0, bDef.rocketMaxBricks || 0) : 0,
          tradeEnabled: Boolean(bDef.tradeVariant && (bData.tradeEnabled === undefined ? true : bData.tradeEnabled)),
          tradeTimer:
            bDef.tradeVariant && Number.isFinite(Number(bData.tradeTimer))
              ? clamp(Number(bData.tradeTimer), 0, bDef.tradeIntervalSec || 60)
              : 0
        };
      }

      const minCit = getPlanetBaseCitizenCount(i);
      const capCit = calculatePlanetCitizenCapacity(i);
      const rawCit =
        sp && sp.citizens !== undefined && Number.isFinite(Number(sp.citizens))
          ? Number(sp.citizens)
          : Array.isArray(startingCitizensCfg)
            ? Number(startingCitizensCfg[i]) || 0
            : minCit;
      citizensByPlanet[i] = clamp(rawCit, minCit, Math.max(minCit, capCit));
    }

    const savedNextOrder =
      data && Number.isFinite(Number(data.nextBuildingOrder)) ? Math.floor(Number(data.nextBuildingOrder)) : 1;
    nextBuildingOrder = Math.max(savedNextOrder, maxOrderSeen + 1, 1);

    let landedCount = 0;
    const offlineMs = Math.max(0, Number(elapsedOfflineMs) || 0);
    const pending = data && Array.isArray(data.pendingFlights) ? data.pendingFlights : [];
    const nowPerf = performance.now();

    for (let f = 0; f < pending.length; f++) {
      const pf = pending[f];
      if (!pf || typeof pf !== "object") continue;
      const remaining = Math.max(0, Number(pf.remainingMs) || 0) - offlineMs;
      if (remaining <= 250) {
        if (settleSavedFlightSilently(pf)) {
          landedCount++;
        }
      } else {
        const srcIdx = clamp(Math.round(Number(pf.srcIdx) || 0), 0, PLANET_COUNT - 1);
        const destIdx = clamp(Math.round(Number(pf.destIdx) || 0), 0, PLANET_COUNT - 1);
        const srcPlanet = planets[srcIdx];
        const destPlanet = planets[destIdx];
        const bDef = window.GameBuildings ? window.GameBuildings.getBuilding(pf.rocketId) : null;
        if (!srcPlanet || !destPlanet || !bDef) continue;

        const liftoffDur = 1350;
        const cruiseDur = 2050;
        const landDur = 1200;
        const totalDur = liftoffDur + cruiseDur + landDur;
        const clampedRem = Math.min(totalDur, remaining);

        const destTileId = pf.destTileId != null ? String(pf.destTileId) : null;
        const destTile =
          (destTileId &&
            destPlanet.tileById[destTileId] &&
            !buildingsByPlanet[destIdx][destTileId] &&
            destPlanet.tileById[destTileId]) ||
          findFreeLandingTile(destIdx, bDef.id);

        if (destTile) {
          const srcTileId = pf.srcTileId != null ? String(pf.srcTileId) : null;
          activeFlights.push({
            id: nextFlightId++,
            srcIdx: srcIdx,
            destIdx: destIdx,
            srcTileId: srcTileId,
            srcTile: srcTileId && srcPlanet.tileById ? srcPlanet.tileById[srcTileId] || null : null,
            destTileId: destTile.id,
            destTile: destTile,
            rocketId: bDef.id,
            rocketName: bDef.name,
            rocketIcon: bDef.iconSrc,
            tier: bDef.rocketTier || Number(pf.tier) || 1,
            citizens: Math.max(0, Math.floor(Number(pf.citizens) || bDef.rocketCitizens || 0)),
            bricks: Math.max(0, Math.floor(Number(pf.bricks) || 0)),
            startTime: nowPerf - (totalDur - clampedRem),
            liftoffDur: liftoffDur,
            cruiseDur: cruiseDur,
            landDur: landDur,
            trail: [],
            lastTrailAt: 0,
            focusedDest: false
          });
        } else if (settleSavedFlightSilently(pf)) {
          landedCount++;
        }
      }
    }

    const savedActivePlanet =
      data && Number.isFinite(Number(data.activePlanet))
        ? clamp(Math.round(Number(data.activePlanet)), 0, PLANET_COUNT - 1)
        : 0;
    targetIndex = savedActivePlanet;
    scrollPos = savedActivePlanet;
    lastRenderScrollPos = savedActivePlanet;
    activeDotIndex = savedActivePlanet;
    lastHeaderPlanet = -1;
    lastFrameTime = nowPerf;
    lastBackgroundPerfMs = 0;

    savePlanetNames();
    syncOreProductionRate(true);
    updateIndicatorDots();
    updatePlanetLockDots();
    updateControlStates();
    updatePlanetStatsHud(true);
    updateFollowRocketButton();

    return { landedCount: landedCount };
  }

  function applyOfflineProgress(elapsedSec, extraLandedCount) {
    const minOfflineSec = Math.max(1, readEconomyNumber("save.minOfflineSeconds", 5));
    const toastMinOfflineSec = Math.max(minOfflineSec, readEconomyNumber("save.toastMinOfflineSeconds", 60));
    const maxOfflineSec = Math.max(60, readEconomyNumber("save.maxOfflineSeconds", 86400));

    const rawSec = Math.max(0, Number(elapsedSec) || 0);
    const dtTotal = clamp(rawSec, 0, maxOfflineSec);
    let landedOffline = Math.max(0, Math.floor(Number(extraLandedCount) || 0));

    const nowPerf = performance.now();
    if (lastBackgroundPerfMs > 0 && activeFlights.length > 0 && rawSec > 0) {
      const perfAdvanced = Math.max(0, nowPerf - lastBackgroundPerfMs);
      const frozenMs = Math.max(0, rawSec * 1000 - perfAdvanced);
      for (let i = activeFlights.length - 1; i >= 0; i--) {
        const fl = activeFlights[i];
        fl.startTime -= frozenMs;
        const totalDur = (fl.liftoffDur || 1350) + (fl.cruiseDur || 2050) + (fl.landDur || 1200);
        if (nowPerf - fl.startTime >= totalDur) {
          activeFlights.splice(i, 1);
          if (followingFlightId === fl.id) {
            followingFlightId = null;
          }
          if (settleSavedFlightSilently(fl)) {
            landedOffline++;
          }
        }
      }
    }
    lastBackgroundPerfMs = 0;

    if (dtTotal < minOfflineSec && landedOffline === 0) {
      return { applied: false, landedCount: 0 };
    }

    let gainedCredits = 0;
    let gainedOre = 0;
    let gainedRp = 0;
    let initialBricksSum = 0;
    for (let i = 0; i < PLANET_COUNT; i++) {
      initialBricksSum += Math.max(0, bricksByPlanet[i] || 0);
    }

    if (dtTotal >= minOfflineSec) {
      let maxRegenSec = 0;
      if (CITIZEN_REGEN_PER_SEC > 0) {
        for (let i = 0; i < PLANET_COUNT; i++) {
          if (!planets[i] || !planets[i].unlocked) continue;
          const cap = calculatePlanetCitizenCapacity(i);
          const cur = citizensByPlanet[i] || 0;
          if (cur < cap) {
            maxRegenSec = Math.max(maxRegenSec, (cap - cur) / CITIZEN_REGEN_PER_SEC);
          }
        }
      }

      const chunks = [];
      const regenPhase = Math.min(dtTotal, maxRegenSec);
      if (regenPhase > 0) {
        const steps = regenPhase > 8 ? 8 : Math.max(1, Math.ceil(regenPhase));
        const stepSec = regenPhase / steps;
        for (let s = 0; s < steps; s++) {
          chunks.push(stepSec);
        }
      }
      const steadyPhase = dtTotal - regenPhase;
      if (steadyPhase > 0) {
        chunks.push(steadyPhase);
      }

      for (let c = 0; c < chunks.length; c++) {
        const chunkSec = chunks[c];
        if (chunkSec <= 0) continue;

        for (let pIdx = 0; pIdx < PLANET_COUNT; pIdx++) {
          if (!planets[pIdx] || !planets[pIdx].unlocked) continue;

          const minCit = getPlanetBaseCitizenCount(pIdx);
          const maxCit = calculatePlanetCitizenCapacity(pIdx);
          if (citizensByPlanet[pIdx] < minCit) {
            citizensByPlanet[pIdx] = minCit;
          }
          if (maxCit > 0 && citizensByPlanet[pIdx] < maxCit) {
            citizensByPlanet[pIdx] = Math.min(maxCit, citizensByPlanet[pIdx] + CITIZEN_REGEN_PER_SEC * chunkSec);
          } else if (citizensByPlanet[pIdx] > maxCit) {
            citizensByPlanet[pIdx] = Math.max(minCit, maxCit);
          }

          const brickRate = calculatePlanetBrickRate(pIdx);
          const producedBricks = brickRate * chunkSec;
          const totalBricksAvail = Math.max(0, (bricksByPlanet[pIdx] || 0) + producedBricks);

          const power = getPlanetPowerStatus(pIdx);
          const cit = getPlanetCitizenStatus(pIdx);
          const buildings = buildingsByPlanet[pIdx];
          let totalDemandRate = 0;
          let totalCreditRate = 0;
          if (buildings && window.GameBuildings) {
            const keys = Object.keys(buildings);
            for (let k = 0; k < keys.length; k++) {
              const tileId = keys[k];
              const bInfo = buildings[tileId];
              if (!bInfo || !bInfo.id || !bInfo.tradeEnabled) continue;
              const bDef = window.GameBuildings.getBuilding(bInfo.id);
              if (!bDef || !bDef.tradeVariant || !bDef.tradeIntervalSec) continue;
              if (!isTileOperational(tileId, bDef, power, cit)) continue;
              const launchBricks = bDef.bricksPerLaunch || 0;
              const cpb = bDef.creditsPerBrick || 0;
              if (launchBricks > 0 && cpb > 0) {
                totalDemandRate += launchBricks / bDef.tradeIntervalSec;
                totalCreditRate += (launchBricks * cpb) / bDef.tradeIntervalSec;
              }
            }
          }

          if (totalDemandRate > 0 && totalCreditRate > 0 && totalBricksAvail >= 1) {
            const demandBricks = totalDemandRate * chunkSec;
            const bricksToSell = Math.min(Math.floor(totalBricksAvail), Math.floor(demandBricks + 1e-6));
            if (bricksToSell > 0) {
              const weightedCpb = totalCreditRate / totalDemandRate;
              const earnedCr = Math.floor(bricksToSell * weightedCpb);
              gainedCredits += earnedCr;
              bricksByPlanet[pIdx] = Math.max(0, totalBricksAvail - bricksToSell);
            } else {
              bricksByPlanet[pIdx] = totalBricksAvail;
            }
          } else {
            bricksByPlanet[pIdx] = totalBricksAvail;
          }

          gainedRp += calculatePlanetResearchRate(pIdx) * chunkSec;
          gainedOre += calculatePlanetOreRate(pIdx) * chunkSec;
        }

        gainedOre += BASE_ORE_RATE_PER_SEC * chunkSec;
      }
    }

    let finalBricksSum = 0;
    for (let i = 0; i < PLANET_COUNT; i++) {
      finalBricksSum += Math.max(0, bricksByPlanet[i] || 0);
    }
    const gainedBricks = Math.max(0, finalBricksSum - initialBricksSum);

    if (window.GameCurrencies) {
      if (gainedCredits > 0 && typeof window.GameCurrencies.add === "function") {
        window.GameCurrencies.add("credits", gainedCredits, true);
      }
      if (gainedOre > 0 && typeof window.GameCurrencies.add === "function") {
        window.GameCurrencies.add("ore", gainedOre, true);
      }
      if (typeof window.GameCurrencies.resetTickClock === "function") {
        window.GameCurrencies.resetTickClock();
      }
    }
    if (gainedRp > 0 && window.GameResearch && typeof window.GameResearch.addPoints === "function") {
      window.GameResearch.addPoints(gainedRp);
    }

    lastFrameTime = performance.now();
    syncOreProductionRate(true);
    updatePlanetLockDots();
    updatePlanetStatsHud(true);
    updateFollowRocketButton();

    if (landedOffline > 0) {
      showGameToast(
        "<span>" +
          '<img class="game-toast-icon" src="./assets/ui/bld-space-rocket-1.svg" alt="" draggable="false" />' +
          t("save.offline_landed", { count: formatPlanetStat(landedOffline) }) +
          "</span>",
        "success"
      );
    }

    if (dtTotal >= toastMinOfflineSec) {
      const gainParts = [];
      if (Math.floor(gainedCredits) >= 1) {
        gainParts.push(
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="./assets/ui/icon-credits.svg" alt="" draggable="false" /> ' +
            t("save.gain_credits", { val: formatPlanetStat(gainedCredits) }) +
            "</span>"
        );
      }
      if (Math.floor(gainedBricks) >= 1) {
        gainParts.push(
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="./assets/ui/icon-bricks.svg" alt="" draggable="false" /> ' +
            t("save.gain_bricks", { val: formatPlanetStat(gainedBricks) }) +
            "</span>"
        );
      }
      if (Math.floor(gainedRp) >= 1) {
        gainParts.push(
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="./assets/ui/icon-research.svg" alt="" draggable="false" /> ' +
            t("save.gain_rp", { val: formatPlanetStat(gainedRp) }) +
            "</span>"
        );
      }
      if (gainedOre >= 1) {
        gainParts.push(
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="./assets/ui/icon-ore.svg" alt="" draggable="false" /> ' +
            t("save.gain_ore", { val: formatPlanetStat(gainedOre) }) +
            "</span>"
        );
      } else if (gainedOre >= 0.01) {
        gainParts.push(
          '<span class="game-toast-pill"><img class="game-toast-pill-icon" src="./assets/ui/icon-ore.svg" alt="" draggable="false" /> ' +
            t("save.gain_ore", { val: gainedOre.toFixed(2) }) +
            "</span>"
        );
      }

      if (gainParts.length > 0) {
        showGameToast(
          "<span>" +
            t("save.offline_welcome", {
              duration: formatOfflineDuration(dtTotal),
              gains: gainParts.join(t("save.gain_sep"))
            }) +
            "</span>",
          "success"
        );
      }
    }

    return {
      applied: true,
      landedCount: landedOffline,
      credits: gainedCredits,
      ore: gainedOre,
      bricks: gainedBricks,
      rp: gainedRp
    };
  }

  function resetState() {
    activeFlights.length = 0;
    activeTradeFlights.length = 0;
    followingFlightId = null;
    nextBuildingOrder = 1;
    lastBackgroundPerfMs = 0;

    for (let i = 0; i < PLANET_COUNT; i++) {
      const p = planets[i];
      buildingsByPlanet[i] = Object.create(null);
      tileEffectsByPlanet[i] = Object.create(null);
      bricksByPlanet[i] = Array.isArray(startingBricksCfg) ? Math.max(0, Number(startingBricksCfg[i]) || 0) : 0;
      const startCit = Array.isArray(startingCitizensCfg)
        ? Number(startingCitizensCfg[i]) || 0
        : baseCitizensByPlanet[i];
      citizensByPlanet[i] = Math.max(baseCitizensByPlanet[i], startCit);

      if (p) {
        p.defaultName = t("planets.planet_" + (i + 1) + ".default_name");
        p.name = p.defaultName;
        p.unlocked = i === 0;
        p.shadowAmount = i === 0 ? 0 : 1;
        p.unlockVfx = null;
        p.zoom = MIN_ZOOM;
        p.targetZoom = MIN_ZOOM;
        p.lookTarget = null;
        p.spinVelY = 0;
        p.pitchVelX = 0;
      }
      if (dotButtons[i] && p) {
        dotButtons[i].setAttribute("aria-label", p.name);
      }
    }

    clearSelectionAndCloseBuildMenu();
    targetIndex = 0;
    scrollPos = 0;
    lastRenderScrollPos = 0;
    activeDotIndex = 0;
    lastHeaderPlanet = -1;
    lastFrameTime = performance.now();

    syncOreProductionRate(true);
    updateIndicatorDots();
    updatePlanetLockDots();
    updateControlStates();
    updatePlanetStatsHud(true);
    updateFollowRocketButton();
  }

  window.GamePlanets = {
    exportState: exportState,
    importState: importState,
    resetState: resetState,
    applyOfflineProgress: applyOfflineProgress,
    onBackground: function () {
      lastBackgroundPerfMs = performance.now();
    },
    resetFrameClock: function () {
      lastFrameTime = performance.now();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
