/**
 * Space Colonization: Idle
 * True 3D Interactive 8-Step Opening Story Cinematic (60fps Performance Edition + Native Studio Command UI)
 */

(function () {
  "use strict";

  function t(key, params) {
    if (window.GameLang && typeof window.GameLang.t === "function") {
      return window.GameLang.t(key, params);
    }
    return String(key || "");
  }

  const CAM_DIST = 4.2;
  const CAM_VEC = { x: 0, y: 0, z: CAM_DIST };

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

  function vlerp(a, b, u) {
    return {
      x: a.x + (b.x - a.x) * u,
      y: a.y + (b.y - a.y) * u,
      z: a.z + (b.z - a.z) * u
    };
  }

  const LIGHT_DIR = normalize(vec3(-0.60, 0.45, 0.66));
  const HALF_VEC = normalize(add(LIGHT_DIR, vec3(0, 0, 1)));

  function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
  }

  function clamp01(val) {
    return val < 0 ? 0 : val > 1 ? 1 : val;
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function easeOutCubic(u) {
    const inv = 1 - clamp01(u);
    return 1 - inv * inv * inv;
  }

  function easeInOutCubic(u) {
    const x = clamp01(u);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function easeInQuad(u) {
    const x = clamp01(u);
    return x * x;
  }

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

  function rotateAroundAxis(v, axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const k = dot(axis, v) * (1 - c);
    const cr = cross(axis, v);
    return {
      x: v.x * c + cr.x * s + axis.x * k,
      y: v.y * c + cr.y * s + axis.y * k,
      z: v.z * c + cr.z * s + axis.z * k
    };
  }

  function project3D(p, cx, cy, focalLength) {
    const denom = CAM_DIST - p.z;
    const inv = focalLength / (denom < 0.30 ? 0.30 : denom);
    return {
      x: cx + p.x * inv,
      y: cy - p.y * inv
    };
  }

  function signedArea2D(pts) {
    let area = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      area += pts[j].x * pts[i].y - pts[i].x * pts[j].y;
    }
    return area * 0.5;
  }

  function tracePolygon(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
  }

  function computeShadedColor(rgb, lightAmt, specAmt, fresnelAmt, atmo) {
    const r = Math.min(255, Math.round(rgb[0] * lightAmt + 255 * specAmt + (atmo.r - rgb[0] * lightAmt) * fresnelAmt));
    const g = Math.min(255, Math.round(rgb[1] * lightAmt + 255 * specAmt + (atmo.g - rgb[1] * lightAmt) * fresnelAmt));
    const b = Math.min(255, Math.round(rgb[2] * lightAmt + 255 * specAmt + (atmo.b - rgb[2] * lightAmt) * fresnelAmt));
    return "rgb(" + (r < 0 ? 0 : r) + "," + (g < 0 ? 0 : g) + "," + (b < 0 ? 0 : b) + ")";
  }

  function noise3D(x, y, z, seed) {
    const s1 = seed * 0.137;
    const s2 = seed * 0.293;
    const s3 = seed * 0.479;
    const n1 = Math.sin(x * 3.1 + s1) * Math.cos(y * 2.9 + s2) * Math.sin(z * 3.3 + s3);
    const n2 = 0.55 * Math.sin((x + y) * 5.2 + s2) * Math.cos((z - x) * 4.8 + s1);
    const n3 = 0.28 * Math.cos((y - z) * 8.1 + s3) * Math.sin((x + z) * 7.4 + s1);
    return (n1 + n2 + n3) / 1.4;
  }

  function pseudoRand(seed) {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }

  function buildShipBasis(forward3D, upHint3D, rollAngle) {
    const fwd = normalize(forward3D);
    let hint = upHint3D ? normalize(upHint3D) : vec3(0, 1, 0);
    if (Math.abs(dot(fwd, hint)) > 0.96) {
      hint = Math.abs(fwd.y) < 0.8 ? vec3(0, 1, 0) : vec3(0, 0, 1);
    }
    const right0 = normalize(cross(hint, fwd));
    const up0 = normalize(cross(fwd, right0));
    const c = Math.cos(rollAngle || 0);
    const s = Math.sin(rollAngle || 0);
    return {
      rotN: fwd,
      rotT: add(scale(right0, c), scale(up0, s)),
      rotB: sub(scale(up0, c), scale(right0, s))
    };
  }

  // --- DOM References ---

  const overlayEl = document.getElementById("intro-cinematic");
  const canvasEl = document.getElementById("intro-canvas");
  const ctx = canvasEl ? canvasEl.getContext("2d") : null;
  const alarmOverlayEl = document.getElementById("intro-alarm-overlay");
  const flashOverlayEl = document.getElementById("intro-flash-overlay");
  const portraitFrameEl = document.getElementById("intro-portrait-frame");
  const portraitIconEl = document.getElementById("intro-portrait-icon");
  const speakerNameEl = document.getElementById("intro-speaker-name");
  const captionEl = document.getElementById("intro-caption");
  const nameRowEl = document.getElementById("intro-name-row");
  const playerNameInputEl = document.getElementById("intro-player-name-input");
  const nameErrorEl = document.getElementById("intro-name-error");
  const salvageChipsEl = document.getElementById("intro-salvage-chips");
  const continueBtn = document.getElementById("btn-intro-continue");
  const continueIconEl = document.getElementById("intro-continue-icon");
  const continueLabelEl = document.getElementById("intro-continue-label");
  const tapHintEl = document.getElementById("intro-tap-hint");

  // --- 8 Interactive Steps Configuration ---

  const STEP_COUNT = 8;
  const MAX_PLAYER_NAME_LEN = 20;
  const STEPS = [
    {
      idx: 0,
      minReadyMs: 850,
      portrait: "./assets/ui/intro-nova7.svg",
      alert: false,
      btnStyle: "default"
    },
    {
      idx: 1,
      minReadyMs: 1150,
      portrait: "./assets/ui/intro-ai.svg",
      alert: true,
      btnStyle: "urgent"
    },
    {
      idx: 2,
      minReadyMs: 650,
      portrait: "./assets/ui/intro-ai.svg",
      alert: true,
      requiresName: true,
      btnStyle: "urgent",
      btnIcon: "./assets/ui/bld-space-rocket-2.svg"
    },
    {
      idx: 3,
      minReadyMs: 2350,
      portrait: "./assets/ui/icon-citizen.svg",
      alert: true,
      btnStyle: "default"
    },
    {
      idx: 4,
      minReadyMs: 1750,
      portrait: "./assets/ui/intro-ai.svg",
      alert: true,
      btnStyle: "default"
    },
    {
      idx: 5,
      minReadyMs: 1050,
      portrait: "./assets/ui/icon-citizen.svg",
      alert: false,
      btnStyle: "default"
    },
    {
      idx: 6,
      minReadyMs: 1350,
      portrait: "./assets/ui/intro-ai.svg",
      alert: true,
      btnStyle: "urgent"
    },
    {
      idx: 7,
      minReadyMs: 2150,
      portraitPre: "./assets/ui/intro-ai.svg",
      portrait: "./assets/ui/bld-crash-base.svg",
      alert: false,
      btnStyle: "victory"
    }
  ];

  // --- Runtime & Cached DOM State ---

  let playing = false;
  let rafId = 0;
  let sceneIndex = 0;
  let sceneStartWall = 0;
  let playStartWall = 0;
  let stepMs = 0;
  let sceneReady = false;
  let flashFiredInStep3 = false;
  let impactFlashFired = false;
  let preparedFired = false;
  let impactFired = false;
  let step7PostMode = false;
  let fullCaptionText = "";
  let textComplete = false;
  let typewriterStartMs = 0;
  let lastTypedLen = -1;
  let continueVisible = false;
  let lastHintKey = "";
  let lastAlarmActive = false;
  let enteredPlayerName = "";
  let lastNameLockedState = null;

  let currentCallbacks = null;
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Offscreen cached deep-space backdrop canvases (rebuilt only on resize)
  let bgNormalCanvas = null;
  let bgCrisisCanvas = null;

  // Interactive 3D parallax tilt & tap detection
  let targetTiltX = 0;
  let targetTiltY = 0;
  let pointerTiltX = 0;
  let pointerTiltY = 0;
  let tapDownPos = null;

  // 3D Entities
  let stars3D = [];
  let nova7Planet = null;
  let nova7AngleSnapshot = 0.16;
  let nova7PitchSnapshot = 0.28;
  let planet1Data = null;
  let step6Snapshot = null;
  let step7SparkSeeds = [];

  function buildBackdropCache() {
    if (!width || !height) return;
    function makeCanvas(crimsonMode) {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const g = c.getContext("2d");
      const bg = g.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#040612");
      bg.addColorStop(0.55, "#080c20");
      bg.addColorStop(1, "#03050e");
      g.fillStyle = bg;
      g.fillRect(0, 0, width, height);

      const nebR = Math.min(width, height) * 0.56;
      const n1 = g.createRadialGradient(width * 0.25, height * 0.36, 0, width * 0.25, height * 0.36, nebR);
      n1.addColorStop(0, crimsonMode ? "rgba(190, 24, 93, 0.26)" : "rgba(79, 70, 229, 0.24)");
      n1.addColorStop(1, "rgba(79, 70, 229, 0)");
      g.fillStyle = n1;
      g.fillRect(0, 0, width, height);

      const n2 = g.createRadialGradient(width * 0.78, height * 0.54, 0, width * 0.78, height * 0.54, nebR * 0.9);
      n2.addColorStop(0, crimsonMode ? "rgba(234, 88, 12, 0.16)" : "rgba(14, 165, 233, 0.16)");
      n2.addColorStop(1, "rgba(14, 165, 233, 0)");
      g.fillStyle = n2;
      g.fillRect(0, 0, width, height);
      return c;
    }
    bgNormalCanvas = makeCanvas(false);
    bgCrisisCanvas = makeCanvas(true);
  }

  function resizeIntroCanvas() {
    if (!canvasEl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvasEl.width = Math.floor(width * dpr);
    canvasEl.height = Math.floor(height * dpr);
    canvasEl.style.width = width + "px";
    canvasEl.style.height = height + "px";
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    buildBackdropCache();
  }

  function triggerScreenFlash(durationMs) {
    if (!flashOverlayEl) return;
    flashOverlayEl.classList.add("is-flashing");
    window.setTimeout(function () {
      if (flashOverlayEl) {
        flashOverlayEl.classList.remove("is-flashing");
      }
    }, durationMs || 140);
  }

  // --- Homeworld Nova-7 Builder (92 Tiles + Fast 3D Skyline + 18-Segment Rings) ---

  function buildNova7World() {
    if (!window.GamePlanets || typeof window.GamePlanets.buildGoldbergSphere !== "function") {
      return null;
    }

    const tiles = window.GamePlanets.buildGoldbergSphere(3);
    const faultNormals = [
      normalize(vec3(0.75, 0.45, 0.48)),
      normalize(vec3(-0.42, 0.78, 0.46)),
      normalize(vec3(0.18, -0.58, 0.80))
    ];
    const fastModels = [
      "utopia_spire_fast",
      "sky_citadel_fast",
      "utopia_cluster_fast"
    ];

    let launchTile = null;
    let bestLaunchScore = -999;

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const nx = tile.normal.x;
      const ny = tile.normal.y;
      const nz = tile.normal.z;
      const n = noise3D(nx, ny, nz, 412) + 0.26 * Math.max(0, nz);
      const polar = Math.abs(ny);

      if (polar > 0.86) {
        tile.biome = "crystal_pole";
        tile.rgb = [224, 242, 254];
        tile.baseElev = 1.036;
        tile.spec = 0.56;
        tile.emissive = 0.14;
      } else if (n < -0.28) {
        tile.biome = "lumina_sea";
        tile.rgb = [14, 165, 233];
        tile.baseElev = 1.00;
        tile.spec = 0.72;
        tile.emissive = 0.12;
      } else if (n > 0.10) {
        tile.biome = "gold_citadel";
        tile.rgb = [226, 232, 240];
        tile.baseElev = 1.042;
        tile.spec = 0.42;
        tile.emissive = 0.08;
      } else {
        tile.biome = "emerald_terra";
        tile.rgb = [34, 197, 134];
        tile.baseElev = 1.024;
        tile.spec = 0.20;
        tile.emissive = 0.04;
      }
      tile.currentElev = tile.baseElev;

      let maxFault = 0;
      for (let f = 0; f < faultNormals.length; f++) {
        const dPlane = Math.abs(dot(tile.normal, faultNormals[f]));
        const fissure = Math.max(0, 1 - dPlane / 0.26);
        if (fissure > maxFault) maxFault = fissure;
      }
      tile.faultWeight = clamp01(maxFault);

      tile.blastSpeed = 1.4 + pseudoRand(i * 3.17 + 1) * 2.1;
      tile.blastDelay = tile.faultWeight > 0.45 ? 0 : 0.04 + pseudoRand(i * 5.71) * 0.16;
      tile.tumbleAxis = normalize(
        vec3(
          pseudoRand(i * 7.13 + 11) - 0.5,
          pseudoRand(i * 11.31 + 19) - 0.5,
          pseudoRand(i * 13.87 + 23) - 0.5
        )
      );
      tile.tumbleSpeed = (pseudoRand(i * 4.49 + 7) > 0.5 ? 1 : -1) * (2.6 + pseudoRand(i * 9.01) * 4.0);

      if (tile.biome !== "lumina_sea" && tile.biome !== "crystal_pole") {
        const score = nx * 0.36 + nz * 0.88 + ny * 0.24 - polar * 0.3;
        if (score > bestLaunchScore) {
          bestLaunchScore = score;
          launchTile = tile;
        }
      }
    }

    const buildings = Object.create(null);
    let heroCount = 0;
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      if (launchTile && tile.id === launchTile.id) {
        tile.biome = "gold_citadel";
        tile.rgb = [255, 224, 130];
        tile.baseElev = 1.045;
        tile.currentElev = 1.045;
        tile.emissive = 0.22;
        continue;
      }
      if (tile.biome === "lumina_sea") continue;

      const rPick = pseudoRand(i * 17.3 + 5);
      if (tile.biome === "gold_citadel") {
        if (heroCount < 4 && tile.normal.z > 0.35 && i % 5 === 0) {
          buildings[tile.id] = heroCount % 2 === 0 ? "quantum_array" : "space_rocket_2";
          heroCount++;
        } else {
          buildings[tile.id] = fastModels[i % fastModels.length];
        }
      } else if (tile.biome === "emerald_terra" && rPick > 0.28) {
        buildings[tile.id] = fastModels[(i + 1) % fastModels.length];
      } else if (tile.biome === "crystal_pole" && rPick > 0.45) {
        buildings[tile.id] = "utopia_spire_fast";
      }
    }

    // 18-segment twin orbital rings (fast & clean around r = 1.50 / 1.68)
    const ringSegments = [];
    for (let ringIdx = 0; ringIdx < 2; ringIdx++) {
      const segCount = 18;
      const rRing = ringIdx === 0 ? 1.50 : 1.68;
      const halfWidth = ringIdx === 0 ? 0.036 : 0.022;
      const rotTilt =
        ringIdx === 0
          ? createRotator(0.22, 0.06, 0.17)
          : createRotator(-0.38, -0.04, -0.20);
      for (let k = 0; k < segCount; k++) {
        const a0 = (Math.PI * 2 * k) / segCount;
        const a1 = a0 + ((Math.PI * 2) / segCount) * 0.85;
        const midA = (a0 + a1) * 0.5;
        ringSegments.push({
          ringIdx: ringIdx,
          a0: a0,
          a1: a1,
          midA: midA,
          r: rRing,
          hw: halfWidth,
          rotFn: rotTilt,
          col: ringIdx === 0 ? [255, 200, 58] : [56, 189, 248],
          hasSatellite: k % 6 === 0,
          blastSpeed: 1.45 + pseudoRand(ringIdx * 31 + k * 7) * 1.6,
          tumbleAxis: normalize(
            vec3(
              pseudoRand(k * 3.3 + ringIdx) - 0.5,
              pseudoRand(k * 5.7 + 2) - 0.5,
              pseudoRand(k * 8.1 + 5) - 0.5
            )
          ),
          tumbleSpeed: (k % 2 === 0 ? 1 : -1) * (2.2 + pseudoRand(k * 9.1) * 3.0)
        });
      }
    }

    return {
      tiles: tiles,
      buildings: buildings,
      launchTile: launchTile || tiles[0],
      ringSegments: ringSegments,
      atmosphere: { r: 96, g: 196, b: 255 },
      coreScale: 0.94
    };
  }

  function buildSceneEntities() {
    stars3D = [];
    const starCols = ["#ffffff", "#bae6fd", "#e0e7ff", "#fde68a", "#fed7aa"];
    for (let i = 0; i < 110; i++) {
      stars3D.push({
        x: (Math.random() - 0.5) * 2.4,
        y: (Math.random() - 0.5) * 1.6,
        z: 0.30 + Math.random() * 1.85,
        r: 1.0 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        col: starCols[i % starCols.length]
      });
    }

    nova7Planet = buildNova7World();
    planet1Data =
      currentCallbacks && typeof currentCallbacks.getPlanet1Data === "function"
        ? currentCallbacks.getPlanet1Data()
        : null;
    step6Snapshot = null;

    step7SparkSeeds = [];
    for (let i = 0; i < 12; i++) {
      step7SparkSeeds.push({
        ang: (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.25,
        spd: 0.45 + Math.random() * 0.75,
        size: 0.045 + Math.random() * 0.038,
        col: i % 3 === 0 ? "#ffc83a" : i % 3 === 1 ? "#ff7a45" : "#cbd5e1"
      });
    }
  }

  // --- Fast Cached 3D Starfield ---

  function draw3DStarfield(elapsed, bgAlpha, shiftX, shiftY, streakFactor, crimsonMood) {
    if (bgAlpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = clamp01(bgAlpha);

    if (bgNormalCanvas) {
      ctx.drawImage(bgNormalCanvas, 0, 0, width, height);
    }
    if (crimsonMood > 0.05 && bgCrisisCanvas) {
      ctx.save();
      ctx.globalAlpha *= clamp01(crimsonMood);
      ctx.drawImage(bgCrisisCanvas, 0, 0, width, height);
      ctx.restore();
    }

    const fov = Math.max(width, height) * 0.65;
    const parX = pointerTiltY * 16;
    const parY = pointerTiltX * 12;

    for (let i = 0; i < stars3D.length; i++) {
      const s = stars3D[i];
      const depthScale = 1 / s.z;
      const sx = (((s.x * fov * depthScale - shiftX * 155 * depthScale + width * 0.5 + parX * depthScale) % width) + width) % width;
      const sy = (((s.y * fov * depthScale - shiftY * 115 * depthScale + height * 0.5 + parY * depthScale) % height) + height) % height;
      const twinkle = 0.55 + 0.45 * Math.sin(elapsed * 0.004 + s.phase);
      const sz = s.r * clamp(depthScale * 0.85, 0.7, 2.4);

      ctx.globalAlpha = clamp01(bgAlpha * twinkle);
      if (streakFactor > 0.06) {
        const sLen = streakFactor * 16 * depthScale;
        ctx.strokeStyle = s.col;
        ctx.lineWidth = Math.max(1.1, sz * 0.9);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - sLen, sy + sLen * 0.24);
        ctx.stroke();
      } else {
        ctx.fillStyle = s.col;
        ctx.fillRect(sx - sz * 0.5, sy - sz * 0.5, sz, sz);
      }
    }

    ctx.restore();
  }

  function drawSmokeOrb(x, y, r, alpha, isFire) {
    if (r <= 1.2 || alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isFire ? "#ff7a45" : "#cbd5e1";
    ctx.lineWidth = Math.max(1.5, r * 0.22);
    ctx.strokeStyle = "#1b1147";
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  function drawEscapeCraftScreen3D(pos3D, forward3D, upHint3D, rollAngle, scaleWorld, cx, cy, focalLength, time, craftOpts, alpha) {
    if (!window.GameBuildings || typeof window.GameBuildings.renderEscapeCraft3D !== "function") {
      return;
    }
    if (pos3D.z >= CAM_DIST - 0.55) return;
    const basis = buildShipBasis(forward3D, upHint3D, rollAngle);
    const frame = {
      origin: pos3D,
      rotT: basis.rotT,
      rotB: basis.rotB,
      rotN: basis.rotN,
      scale: scaleWorld,
      phase: 0,
      cx: cx,
      cy: cy,
      focalLength: focalLength,
      camVec: CAM_VEC,
      lightDir: LIGHT_DIR,
      halfVec: HALF_VEC,
      atmo: (craftOpts && craftOpts.atmo) || { r: 165, g: 215, b: 255 },
      isSelected: false,
      project: project3D
    };
    ctx.save();
    if (alpha !== undefined) {
      ctx.globalAlpha *= clamp01(alpha);
    }
    window.GameBuildings.renderEscapeCraft3D(ctx, frame, time, 1, craftOpts);
    ctx.restore();
  }

  // --- Nova-7 3D Renderer (Optimized 60fps Path) ---

  function drawNova7OrbitalRings(cx, cy, focalLength, r, baseRotate, time, exT, pass) {
    if (!nova7Planet) return;
    const exEase = easeOutCubic(clamp01(exT));
    const segs = nova7Planet.ringSegments;
    const spinOffset = time * 0.00055;
    const alphaFade = exT > 0 ? clamp01(1 - exT * 0.92) : 1;
    if (alphaFade <= 0.02) return;

    ctx.save();
    ctx.globalAlpha *= alphaFade;

    const ringItems = [];
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const angShift = spinOffset * (seg.ringIdx === 0 ? 1 : -1.25);
      const midA = seg.midA + angShift;
      const localMid = seg.rotFn(vec3(Math.cos(midA) * seg.r, 0, Math.sin(midA) * seg.r));
      const worldMid = baseRotate(localMid);

      let dispCenter = worldMid;
      if (exT > 0) {
        const blastDir = normalize(worldMid);
        dispCenter = add(worldMid, scale(blastDir, exEase * seg.blastSpeed * 1.45));
      }

      if (pass === "back" && dispCenter.z >= 0.15) continue;
      if (pass === "front" && dispCenter.z < 0.15) continue;
      if (dispCenter.z > CAM_DIST - 0.65) continue;

      ringItems.push({
        seg: seg,
        angShift: angShift,
        worldMid: worldMid,
        dispCenter: dispCenter
      });
    }

    ringItems.sort(function (a, b) {
      return a.dispCenter.z - b.dispCenter.z;
    });

    for (let j = 0; j < ringItems.length; j++) {
      const item = ringItems[j];
      const seg = item.seg;
      const angShift = item.angShift;
      const worldMid = item.worldMid;
      const dispCenter = item.dispCenter;

      const a0 = seg.a0 + angShift;
      const a1 = seg.a1 + angShift;
      const rad = seg.r;
      const cornersLocal = [
        seg.rotFn(vec3(Math.cos(a0) * (rad - seg.hw), 0, Math.sin(a0) * (rad - seg.hw))),
        seg.rotFn(vec3(Math.cos(a1) * (rad - seg.hw), 0, Math.sin(a1) * (rad - seg.hw))),
        seg.rotFn(vec3(Math.cos(a1) * (rad + seg.hw), 0, Math.sin(a1) * (rad + seg.hw))),
        seg.rotFn(vec3(Math.cos(a0) * (rad + seg.hw), 0, Math.sin(a0) * (rad + seg.hw)))
      ];

      const pts = new Array(4);
      for (let k = 0; k < 4; k++) {
        let wp = baseRotate(cornersLocal[k]);
        if (exT > 0) {
          const rel = sub(wp, worldMid);
          wp = add(dispCenter, rotateAroundAxis(rel, seg.tumbleAxis, exT * seg.tumbleSpeed));
        }
        pts[k] = project3D(wp, cx, cy, focalLength);
      }

      tracePolygon(pts);
      const col = seg.col;
      ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + ", 0.88)";
      ctx.fill();
      ctx.lineWidth = Math.max(1.2, r * 0.008);
      ctx.strokeStyle = "#1b1147";
      ctx.stroke();

      if (seg.hasSatellite && exT <= 0.02) {
        const sp = project3D(dispCenter, cx, cy, focalLength);
        const satR = clamp(r * 0.025, 2.5, 5.2);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, satR, 0, Math.PI * 2);
        ctx.fillStyle = seg.ringIdx === 0 ? "#ffffff" : "#67e8f9";
        ctx.fill();
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = "#1b1147";
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawNova7Planet3D(cx, cy, r, spinY, pitchX, roll, time, stress, explosionT, alpha, padCraftThrust) {
    if (!nova7Planet || r < 14 || alpha <= 0.01) return;

    const exT = clamp01(explosionT || 0);
    const focalLength = r * Math.sqrt(CAM_DIST * CAM_DIST - 1);
    const baseRotate = createRotator(spinY, pitchX, roll);
    const atmo = nova7Planet.atmosphere;

    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);

    drawNova7OrbitalRings(cx, cy, focalLength, r, baseRotate, time, exT, "back");

    if (exT <= 0) {
      const haloR = r * (1.30 + stress * 0.14);
      const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.84, cx, cy, haloR);
      const hR = Math.round(lerp(atmo.r, 255, stress * 0.85));
      const hG = Math.round(lerp(atmo.g, 92, stress * 0.85));
      const hB = Math.round(lerp(atmo.b, 65, stress * 0.85));
      haloGrad.addColorStop(0, "rgba(" + hR + "," + hG + "," + hB + "," + (0.28 + stress * 0.40).toFixed(2) + ")");
      haloGrad.addColorStop(1, "rgba(" + hR + "," + hG + "," + hB + ", 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fill();

      const coreR = r * nova7Planet.coreScale;
      const coreGrad = ctx.createRadialGradient(cx - coreR * 0.25, cy - coreR * 0.25, coreR * 0.08, cx, cy, coreR);
      if (stress > 0.05) {
        coreGrad.addColorStop(0, stress > 0.6 ? "#fff3b0" : "#ff9a45");
        coreGrad.addColorStop(0.55, "#ff5a4d");
        coreGrad.addColorStop(1, "#3b0a18");
      } else {
        coreGrad.addColorStop(0, "#1e2952");
        coreGrad.addColorStop(1, "#040711");
      }
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const exEase = easeOutCubic(exT);
      if (exT < 0.72) {
        const coreA = 1 - exT / 0.72;
        const coreR = r * (0.55 + 1.60 * exEase);
        const expGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        expGrad.addColorStop(0, "rgba(255, 255, 255, " + coreA.toFixed(2) + ")");
        expGrad.addColorStop(0.35, "rgba(255, 210, 70, " + (coreA * 0.90).toFixed(2) + ")");
        expGrad.addColorStop(1, "rgba(255, 85, 65, 0)");
        ctx.fillStyle = expGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.globalAlpha *= clamp01((1 - exT) * 0.9);
      const swR = r * (0.85 + 2.8 * exEase);
      ctx.translate(cx, cy);
      ctx.rotate(-0.28);
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = Math.max(2, (1 - exT) * 13);
      ctx.beginPath();
      ctx.ellipse(0, 0, swR, swR * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#ff5a4d";
      ctx.lineWidth = Math.max(1.5, (1 - exT) * 7);
      ctx.beginPath();
      ctx.ellipse(0, 0, swR * 0.82, swR * 0.72, 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const visibleTiles = [];
    const tileAlpha = exT > 0.62 ? clamp01(1 - (exT - 0.62) / 0.36) : 1;

    if (tileAlpha > 0.02) {
      for (let i = 0; i < nova7Planet.tiles.length; i++) {
        const tile = nova7Planet.tiles[i];
        const rotCenterBase = baseRotate(tile.center);
        const bId = nova7Planet.buildings[tile.id] || null;
        const isLaunch = Boolean(nova7Planet.launchTile && tile.id === nova7Planet.launchTile.id);
        const hasMount = Boolean(
          bId || (isLaunch && exT <= 0 && padCraftThrust !== undefined && padCraftThrust >= 0)
        );
        const rimPass = exT > 0 || rotCenterBase.z > -0.45;
        if (exT <= 0 && (hasMount ? rotCenterBase.z <= -0.68 : !rimPass)) continue;

        const localFaultHeat = exT > 0 ? 1 : clamp01(stress * 1.15 - (1 - tile.faultWeight) * 0.55);
        const buck = exT <= 0 ? localFaultHeat * 0.042 * (0.6 + 0.4 * Math.sin(time * 0.012 + tile.phase)) : 0;
        const elev = tile.baseElev + buck;

        let rotNormal = baseRotate(tile.normal);
        let rotPlaneCenter = baseRotate(tile.planeCenter);
        let rotT = baseRotate(tile.tangentT);
        let rotB = baseRotate(tile.tangentB);
        let dispWorld = vec3(0, 0, 0);

        const localExT = exT > 0 ? clamp01((exT - tile.blastDelay) / Math.max(0.2, 1 - tile.blastDelay)) : 0;
        const exAng = localExT * tile.tumbleSpeed;
        if (localExT > 0) {
          const exEase = easeOutCubic(localExT);
          dispWorld = scale(rotCenterBase, exEase * tile.blastSpeed * 1.65);
          const rotTileOrigin = add(rotCenterBase, dispWorld);
          if (rotTileOrigin.z > CAM_DIST - 0.75) continue;

          rotNormal = normalize(rotateAroundAxis(rotNormal, tile.tumbleAxis, exAng));
          rotPlaneCenter = rotateAroundAxis(rotPlaneCenter, tile.tumbleAxis, exAng);
          rotT = normalize(rotateAroundAxis(rotT, tile.tumbleAxis, exAng));
          rotB = normalize(rotateAroundAxis(rotB, tile.tumbleAxis, exAng));
        }

        const worldCenter = add(dispWorld, scale(rotPlaneCenter, elev));
        if (worldCenter.z > CAM_DIST - 0.70) continue;

        const toCam = sub(CAM_VEC, worldCenter);
        const facing = dot(rotNormal, toCam);
        const sides = tile.sides;
        let rotBase = null;
        let topPts = null;
        let basePts = null;
        let topVisible = false;

        if (rimPass) {
          rotBase = new Array(sides);
          topPts = new Array(sides);
          basePts = new Array(sides);

          for (let k = 0; k < sides; k++) {
            let rc = baseRotate(tile.outerCorners[k]);
            if (localExT > 0) {
              rc = rotateAroundAxis(rc, tile.tumbleAxis, exAng);
            }
            rotBase[k] = add(dispWorld, rc);
            topPts[k] = project3D(add(dispWorld, scale(rc, elev)), cx, cy, focalLength);
            basePts[k] = project3D(rotBase[k], cx, cy, focalLength);
          }

          topVisible =
            exT > 0 ? signedArea2D(topPts) < -0.05 : facing > -0.08 && signedArea2D(topPts) < -0.05;
        }
        if (!topVisible && !hasMount && exT <= 0) continue;

        const toCamLen = len(toCam) || 1;
        visibleTiles.push({
          idx: i,
          tile: tile,
          rotCenterZ: rotCenterBase.z,
          rotNormal: rotNormal,
          rotT: rotT,
          rotB: rotB,
          worldCenter: worldCenter,
          dispWorld: dispWorld,
          localExT: localExT,
          elev: elev,
          depthZ: worldCenter.z,
          facingDot: Math.max(0, facing / toCamLen),
          rimPass: rimPass,
          topVisible: topVisible,
          isLaunch: isLaunch,
          rotBase: rotBase,
          topPts: topPts,
          basePts: basePts,
          bId: bId,
          faultHeat: localFaultHeat
        });
      }

      visibleTiles.sort(function (a, b) {
        return exT <= 0 ? a.rotCenterZ - b.rotCenterZ : a.depthZ - b.depthZ;
      });

      const lineUnit = Math.max(0.9, r / 170);
      ctx.save();
      ctx.globalAlpha *= tileAlpha;

      for (let i = 0; i < visibleTiles.length; i++) {
        const entry = visibleTiles[i];
        const tile = entry.tile;
        const sides = tile.sides;

        if (entry.rimPass) {
          for (let k = 0; k < sides; k++) {
            const next = (k + 1) % sides;
            const b0 = entry.rotBase[k];
            const b1 = entry.rotBase[next];
            const sideN = cross(sub(b1, b0), entry.rotNormal);
            const midB = scale(add(b0, b1), 0.5);
            const midW =
              exT > 0
                ? add(midB, scale(sub(midB, entry.dispWorld), (entry.elev - 1) * 0.5))
                : scale(midB, 0.5 * (1 + entry.elev));
            if (dot(sideN, sub(CAM_VEC, midW)) <= -0.002) continue;

            const sideNormUnit = normalize(sideN);
            const sideNdotL = Math.max(0, dot(sideNormUnit, LIGHT_DIR));
            const sideLight = 0.54 * (0.30 + 0.70 * sideNdotL) + tile.emissive * 0.35;
            const sr = clamp(Math.round(lerp(tile.rgb[0] * sideLight, 255, entry.faultHeat * 0.85)), 0, 255);
            const sg = clamp(Math.round(lerp(tile.rgb[1] * sideLight, 110, entry.faultHeat * 0.80)), 0, 255);
            const sb = clamp(Math.round(lerp(tile.rgb[2] * sideLight, 45, entry.faultHeat * 0.80)), 0, 255);

            ctx.beginPath();
            ctx.moveTo(entry.basePts[k].x, entry.basePts[k].y);
            ctx.lineTo(entry.basePts[next].x, entry.basePts[next].y);
            ctx.lineTo(entry.topPts[next].x, entry.topPts[next].y);
            ctx.lineTo(entry.topPts[k].x, entry.topPts[k].y);
            ctx.closePath();
            ctx.fillStyle = "rgb(" + sr + "," + sg + "," + sb + ")";
            ctx.fill();
          }
        }

        if (entry.topVisible) {
          const ndotl = Math.max(0, dot(entry.rotNormal, LIGHT_DIR));
          const frontFill = 0.16 * Math.max(0, entry.rotNormal.z);
          const lightAmt = Math.min(1.22, 0.30 + 0.82 * ndotl + frontFill + (tile.emissive + entry.faultHeat * 0.45));
          const specAmt = tile.spec * Math.pow(Math.max(0, dot(entry.rotNormal, HALF_VEC)), 18);
          const fresnelAmt = Math.pow(Math.max(0, 1 - Math.max(0, entry.rotNormal.z)), 2.6) * 0.28;
          const baseRgb =
            entry.faultHeat > 0.25
              ? [
                  Math.round(lerp(tile.rgb[0], 255, entry.faultHeat * 0.42)),
                  Math.round(lerp(tile.rgb[1], 130, entry.faultHeat * 0.42)),
                  Math.round(lerp(tile.rgb[2], 70, entry.faultHeat * 0.42))
                ]
              : tile.rgb;
          const topFill = computeShadedColor(baseRgb, lightAmt, specAmt, fresnelAmt, atmo);

          tracePolygon(entry.topPts);
          ctx.fillStyle = topFill;
          ctx.fill();

          const innerPts = new Array(sides);
          const innerScale = entry.elev + 0.0015;
          for (let k = 0; k < sides; k++) {
            let ri = baseRotate(tile.innerCorners[k]);
            if (entry.localExT > 0) {
              ri = rotateAroundAxis(ri, tile.tumbleAxis, entry.localExT * tile.tumbleSpeed);
            }
            innerPts[k] = project3D(add(entry.dispWorld, scale(ri, innerScale)), cx, cy, focalLength);
          }

          const rimFade = clamp(entry.facingDot * 1.45, 0.34, 1.0);
          const isLaunchTile = entry.isLaunch;

          tracePolygon(innerPts);
          if (isLaunchTile) {
            ctx.fillStyle = "rgba(255, 200, 58, 0.28)";
            ctx.fill();
          }
          ctx.lineWidth = isLaunchTile ? Math.max(2.0, lineUnit * 1.8) : Math.max(1.1, lineUnit * 1.05);
          ctx.strokeStyle = isLaunchTile
            ? "#fff8d6"
            : entry.faultHeat > 0.35
              ? "rgba(255, 160, 75, " + (0.85 * rimFade).toFixed(2) + ")"
              : "rgba(255, 255, 255, " + (0.82 * rimFade).toFixed(2) + ")";
          ctx.stroke();
        } else if (exT > 0 && entry.basePts && signedArea2D(entry.basePts) > 0.05) {
          const magR = Math.round(lerp(185, 255, entry.faultHeat));
          const magG = Math.round(lerp(62, 125, entry.faultHeat));
          const magB = Math.round(lerp(32, 48, entry.faultHeat));
          tracePolygon(entry.basePts);
          ctx.fillStyle = "rgb(" + magR + "," + magG + "," + magB + ")";
          ctx.fill();
          ctx.lineWidth = Math.max(1.0, lineUnit * 0.95);
          ctx.strokeStyle = "rgba(255, 195, 105, 0.72)";
          ctx.stroke();
        }

        if (entry.bId && window.GameBuildings && typeof window.GameBuildings.renderBuilding3D === "function") {
          const bScale = entry.localExT > 0 ? clamp01(1 - entry.localExT * 1.35) : 1;
          if (bScale > 0.04) {
            const bldFrame = {
              origin: entry.worldCenter,
              rotT: entry.rotT,
              rotB: entry.rotB,
              rotN: entry.rotNormal,
              scale: tile.hexScale * entry.elev,
              phase: tile.phase,
              cx: cx,
              cy: cy,
              focalLength: focalLength,
              camVec: CAM_VEC,
              lightDir: LIGHT_DIR,
              halfVec: HALF_VEC,
              atmo: atmo,
              isSelected: false,
              project: project3D
            };
            window.GameBuildings.renderBuilding3D(ctx, entry.bId, bldFrame, time, bScale);
          }
        }

        if (entry.isLaunch && exT <= 0 && padCraftThrust !== undefined && padCraftThrust >= 0) {
          const shipPos = add(entry.worldCenter, scale(entry.rotNormal, 0.14));
          const shipForward = normalize(add(entry.rotT, scale(entry.rotNormal, 0.56)));
          drawEscapeCraftScreen3D(
            shipPos,
            shipForward,
            entry.rotNormal,
            0.18,
            tile.hexScale * 0.72,
            cx,
            cy,
            focalLength,
            time,
            { thrust: padCraftThrust, beacon: true },
            1
          );
        }
      }

      ctx.restore();
    }

    if (exT <= 0) {
      const limbGrad = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.22, r * 0.80, cx, cy, r * 1.01);
      limbGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      limbGrad.addColorStop(0.84, "rgba(" + atmo.r + "," + atmo.g + "," + atmo.b + ", 0.06)");
      limbGrad.addColorStop(1, "rgba(" + atmo.r + "," + atmo.g + "," + atmo.b + ", 0.24)");
      ctx.fillStyle = limbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.01, 0, Math.PI * 2);
      ctx.fill();
    }

    drawNova7OrbitalRings(cx, cy, focalLength, r, baseRotate, time, exT, "front");
    ctx.restore();
  }

  // --- Shared True 3D Rocky Planet 1 Renderer (Optimized 60fps Path) ---

  function drawRockyPlanet3D(cx, cy, r, spinY, pitchX, roll, time, alpha) {
    if (!planet1Data || !Array.isArray(planet1Data.tiles) || r < 14 || alpha <= 0.01) return;

    const atmo = planet1Data.atmosphere || { r: 203, g: 213, b: 225 };
    const focalLength = r * Math.sqrt(CAM_DIST * CAM_DIST - 1);
    const rotatePoint = createRotator(spinY, pitchX, roll);
    const tiles = planet1Data.tiles;

    ctx.save();
    ctx.globalAlpha *= clamp01(alpha);

    const haloRadius = r * 1.28;
    const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, haloRadius);
    haloGrad.addColorStop(0, "rgba(" + atmo.r + "," + atmo.g + "," + atmo.b + ", 0.26)");
    haloGrad.addColorStop(1, "rgba(" + atmo.r + "," + atmo.g + "," + atmo.b + ", 0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    const coreRadius = r * (planet1Data.coreScale || 0.92);
    const coreGrad = ctx.createRadialGradient(cx - coreRadius * 0.3, cy - coreRadius * 0.3, coreRadius * 0.1, cx, cy, coreRadius);
    coreGrad.addColorStop(0, "#141d31");
    coreGrad.addColorStop(1, "#02040a");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    const visibleTiles = [];
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const rotCenter = rotatePoint(tile.center);
      if (rotCenter.z <= -0.45) continue;

      const rotNormal = rotatePoint(tile.normal);
      const rotPlaneCenter = rotatePoint(tile.planeCenter);
      const elev = tile.baseElev || 1.02;
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
        topPts[k] = project3D(scale(rc, elev), cx, cy, focalLength);
        if (needsSides) {
          basePts[k] = project3D(rc, cx, cy, focalLength);
        }
      }

      const topVisible = facing > -0.08 && signedArea2D(topPts) < -0.05;
      if (!topVisible && !needsSides) continue;
      const toCamLen = len(toCam) || 1;

      visibleTiles.push({
        tile: tile,
        rotNormal: rotNormal,
        elev: elev,
        depthZ: rotCenter.z,
        facingDot: Math.max(0, facing / toCamLen),
        topVisible: topVisible,
        needsSides: needsSides,
        rotBase: rotBase,
        topPts: topPts,
        basePts: basePts
      });
    }

    visibleTiles.sort(function (a, b) {
      return a.depthZ - b.depthZ;
    });

    const lineUnit = Math.max(0.85, r / 136);
    for (let i = 0; i < visibleTiles.length; i++) {
      const entry = visibleTiles[i];
      const tile = entry.tile;
      const sides = tile.sides;

      if (entry.needsSides) {
        for (let k = 0; k < sides; k++) {
          const next = (k + 1) % sides;
          const b0 = entry.rotBase[k];
          const b1 = entry.rotBase[next];
          const sideN = cross(sub(b1, b0), entry.rotNormal);
          const midW = scale(add(b0, b1), 0.25 * (1 + entry.elev));
          if (dot(sideN, sub(CAM_VEC, midW)) <= -0.002) continue;

          const sideNormUnit = normalize(sideN);
          const sideNdotL = Math.max(0, dot(sideNormUnit, LIGHT_DIR));
          const sideLight = 0.52 * (0.28 + 0.72 * sideNdotL) + (tile.emissive || 0) * 0.35;
          const sr = clamp(Math.round(tile.rgb[0] * sideLight), 0, 255);
          const sg = clamp(Math.round(tile.rgb[1] * sideLight), 0, 255);
          const sb = clamp(Math.round(tile.rgb[2] * sideLight), 0, 255);

          ctx.beginPath();
          ctx.moveTo(entry.basePts[k].x, entry.basePts[k].y);
          ctx.lineTo(entry.basePts[next].x, entry.basePts[next].y);
          ctx.lineTo(entry.topPts[next].x, entry.topPts[next].y);
          ctx.lineTo(entry.topPts[k].x, entry.topPts[k].y);
          ctx.closePath();
          ctx.fillStyle = "rgb(" + sr + "," + sg + "," + sb + ")";
          ctx.fill();
        }
      }

      if (entry.topVisible) {
        const ndotl = Math.max(0, dot(entry.rotNormal, LIGHT_DIR));
        const frontFill = 0.16 * Math.max(0, entry.rotNormal.z);
        const effEmissive = tile.emissive || 0;
        const lightAmt = Math.min(1.18, 0.28 + 0.82 * ndotl + frontFill + effEmissive * (1 - ndotl * 0.6));
        const specAmt = (tile.spec || 0.1) * Math.pow(Math.max(0, dot(entry.rotNormal, HALF_VEC)), 18);
        const fresnelAmt = Math.pow(Math.max(0, 1 - Math.max(0, entry.rotNormal.z)), 2.6) * 0.28;
        const topFill = computeShadedColor(tile.rgb, lightAmt, specAmt, fresnelAmt, atmo);

        tracePolygon(entry.topPts);
        ctx.fillStyle = topFill;
        ctx.fill();

        const innerPts = new Array(sides);
        const innerScale = entry.elev + 0.0015;
        for (let k = 0; k < sides; k++) {
          innerPts[k] = project3D(scale(rotatePoint(tile.innerCorners[k]), innerScale), cx, cy, focalLength);
        }
        const rimFade = clamp(entry.facingDot * 1.45, 0.30, 1.0);
        tracePolygon(innerPts);
        ctx.lineWidth = Math.max(1.2, lineUnit * 1.1);
        ctx.strokeStyle = "rgba(255, 255, 255, " + (0.85 * rimFade).toFixed(2) + ")";
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // --- Shared Nova-7 Helper for Steps 0..2 ---

  function getNova7CenterAndRadius(zoomMult) {
    const compact = height <= 520;
    const baseR = Math.min(width * 0.25, height * (compact ? 0.27 : 0.29));
    return {
      cx: width * 0.48,
      cy: height * (compact ? 0.39 : 0.41),
      r: baseR * (zoomMult || 1)
    };
  }

  // --- 8 Step Canvas Renderers ---

  function renderStep0GoldenAge(sMs, elapsed) {
    draw3DStarfield(elapsed, 1, sMs * 0.000014, 0, 0, 0);
    const geo = getNova7CenterAndRadius(1.0);
    const spinY = 0.14 + sMs * 0.00016 + pointerTiltY * 0.26;
    const pitchX = 0.34 + pointerTiltX * 0.16;
    const roll = 0.12;
    nova7AngleSnapshot = spinY;
    nova7PitchSnapshot = pitchX;

    drawNova7Planet3D(geo.cx, geo.cy, geo.r, spinY, pitchX, roll, elapsed, 0, 0, 1, 0);

    setAlarmActive(false);
  }

  function renderStep1CoreCrisis(sMs, elapsed) {
    const pStress = clamp01(sMs / 1400);
    const stress = pStress < 1 ? lerp(0.15, 0.88, easeInQuad(pStress)) : 0.84 + 0.12 * Math.sin(sMs * 0.006);
    const tremor = stress * 6.5;
    const sx = (Math.sin(elapsed * 0.085) + Math.cos(elapsed * 0.13)) * tremor * 0.5;
    const sy = (Math.cos(elapsed * 0.105) - Math.sin(elapsed * 0.075)) * tremor * 0.5;

    draw3DStarfield(elapsed, 1, 0.04 + sMs * 0.000018, 0, 0, stress);
    const geo = getNova7CenterAndRadius(1.0);
    const spinY = nova7AngleSnapshot + sMs * 0.00014 + pointerTiltY * 0.24;
    const pitchX = nova7PitchSnapshot + pointerTiltX * 0.18;
    const roll = 0.12;

    drawNova7Planet3D(geo.cx + sx, geo.cy + sy, geo.r, spinY, pitchX, roll, elapsed, stress, 0, 1, 0.15);

    setAlarmActive(true);
  }

  function renderStep2BoardingLaunchpad(sMs, elapsed) {
    const pushP = easeOutCubic(clamp01(sMs / 1100));
    const tremor = 5.0;
    const sx = Math.sin(elapsed * 0.09) * tremor;
    const sy = Math.cos(elapsed * 0.11) * tremor * 0.8;

    draw3DStarfield(elapsed, 1, 0.08, 0, 0, 0.85);
    const geo = getNova7CenterAndRadius(lerp(1.0, 1.24, pushP));
    const spinY = lerp(nova7AngleSnapshot, -0.05, pushP) + pointerTiltY * 0.20;
    const pitchX = lerp(nova7PitchSnapshot, 0.30, pushP) + pointerTiltX * 0.16;
    const roll = 0.12;
    const cx = geo.cx - pushP * width * 0.06 + sx;
    const cy = geo.cy + pushP * height * 0.02 + sy;

    const spool = 0.35 + 0.55 * easeOutCubic(clamp01(sMs / 1000)) + 0.10 * Math.sin(elapsed * 0.03);
    drawNova7Planet3D(cx, cy, geo.r, spinY, pitchX, roll, elapsed, 0.92, 0, 1, spool);

    setAlarmActive(true);
  }

  function renderStep3LiftoffDestruction(sMs, elapsed) {
    const explodeAt = 1050;
    if (sMs >= explodeAt && !flashFiredInStep3) {
      flashFiredInStep3 = true;
      triggerScreenFlash(160);
    }

    const postEx = sMs >= explodeAt ? clamp01((sMs - explodeAt) / 2300) : 0;
    const boomShake =
      sMs >= explodeAt && sMs < explodeAt + 800
        ? (1 - (sMs - explodeAt) / 800) * 14
        : sMs < explodeAt
          ? 5
          : 0;
    const sx = (Math.sin(elapsed * 0.09) + Math.cos(elapsed * 0.14)) * boomShake * 0.5;
    const sy = (Math.cos(elapsed * 0.11) - Math.sin(elapsed * 0.08)) * boomShake * 0.5;

    const escT = clamp01(sMs / 2500);
    draw3DStarfield(elapsed, 1, 0.10 + escT * 0.28, -escT * 0.04, escT < 0.85 ? 0.58 : 0.12, 0.8);

    const geo = getNova7CenterAndRadius(lerp(1.16, 0.84, escT));
    const px = lerp(geo.cx - width * 0.06, width * 0.26, easeOutCubic(escT)) + sx;
    const py = lerp(geo.cy, height * 0.45, easeOutCubic(escT)) + sy;
    const spinY = -0.04 + sMs * 0.0002 + pointerTiltY * 0.16;
    const pitchX = 0.30 + pointerTiltX * 0.12;
    const roll = 0.12;

    drawNova7Planet3D(px, py, geo.r, spinY, pitchX, roll, elapsed, 1.0, postEx, 1, -1);

    // 3D Escape Craft blasts off pad -> foreground right
    const flyEase = easeInOutCubic(escT);
    const rot = createRotator(spinY, pitchX, roll);
    const lTile = nova7Planet ? nova7Planet.launchTile : null;
    const startOrigin = lTile ? scale(rot(lTile.planeCenter), lTile.baseElev + 0.14) : vec3(0.4, 0.2, 0.85);
    const focal = geo.r * Math.sqrt(CAM_DIST * CAM_DIST - 1);
    const startProj = project3D(startOrigin, px, py, focal);

    const shipX = lerp(startProj.x, width * 0.74, flyEase) + pointerTiltY * 14;
    const shipY = lerp(startProj.y, height * 0.30, flyEase) - Math.sin(escT * Math.PI) * height * 0.08 + pointerTiltX * 10;
    const bob = escT >= 0.99 ? Math.sin((sMs - 2500) * 0.003) * 5 : 0;

    if (sMs < 2400) {
      for (let k = 0; k < 4; k++) {
        const age = ((sMs * 0.0034 + k * 0.25) % 1);
        drawSmokeOrb(shipX - (38 + age * 80), shipY + bob + (10 + age * 26), (13 - age * 6) * lerp(0.7, 1.1, flyEase), (1 - age) * 0.78, k < 2);
      }
    }

    const fwd = normalize(vlerp(vec3(0.55, 0.62, 0.56), vec3(0.92, 0.16, 0.36), flyEase));
    const up = normalize(vlerp(vec3(-0.32, 0.76, 0.56), vec3(-0.12, 0.94, 0.30), flyEase));
    drawEscapeCraftScreen3D(
      vec3(0, 0, 0.65),
      fwd,
      up,
      lerp(-0.42, 0.22, Math.sin(escT * Math.PI * 0.7)) + pointerTiltY * 0.16,
      lerp(0.12, 0.40, easeOutCubic(escT)),
      shipX,
      shipY + bob,
      Math.min(width, height) * 1.15,
      elapsed,
      { thrust: 1.0, beacon: true },
      1
    );

    setAlarmActive(true);
  }

  function renderStep4FuelEmpty(sMs, elapsed) {
    const pDrift = clamp01(sMs / 2400);
    const cutAt = 1350;
    const fuelT = 1 - clamp01(sMs / cutAt);
    const fuelPct = Math.round(24 * fuelT);

    draw3DStarfield(elapsed, 1, 0.42 + easeOutCubic(pDrift) * 0.75, 0.02, fuelT * 0.25, 0);

    const sputter = sMs >= 300 && sMs <= cutAt + 120;
    const alive = sMs < cutAt;
    const flicker = sputter ? (Math.sin(elapsed * 0.055) > 0 ? 0.65 : 0.08) : 0.9;
    const shipX = lerp(width * 0.32, width * 0.58, easeOutCubic(pDrift)) + pointerTiltY * 16;
    const shipY = height * (height <= 520 ? 0.39 : 0.42) + Math.sin(elapsed * 0.0016) * 16 + pointerTiltX * 12;

    if (sputter) {
      for (let k = 0; k < 4; k++) {
        const age = ((sMs - 300) / 1100 + k * 0.25) % 1;
        drawSmokeOrb(shipX - (46 + age * 88), shipY + (k % 2 === 0 ? -6 : 8) * age, 16 - age * 8, (1 - age) * 0.80, k === 0);
      }
    }

    const tumble = Math.max(0, sMs - cutAt) * 0.001;
    const rot = createRotator(0.35 + (tumble > 0 ? Math.sin(tumble * 0.6) * 0.35 : 0) + pointerTiltY * 0.25, 0.10 + tumble * 0.4 + pointerTiltX * 0.2, 0);
    drawEscapeCraftScreen3D(
      vec3(0, 0, 0.95),
      normalize(rot(vec3(1, 0, 0))),
      normalize(rot(vec3(0, 1, 0))),
      0.16 + tumble * 0.65,
      clamp(Math.min(width, height) * 0.00084, 0.32, 0.50),
      shipX,
      shipY,
      Math.min(width, height) * 1.15,
      elapsed,
      { thrust: alive ? flicker : 0, sputter: sputter, beacon: true },
      1
    );

    setAlarmActive(fuelPct <= 0);
  }

  function renderStep5AdriftVoid(sMs, elapsed) {
    const driftP = clamp01(sMs / 2400);
    draw3DStarfield(elapsed, 1, 1.18 + sMs * 0.00004, 0.04, 0, 0);

    // Distant emerging 3D rocky Planet 1 silhouettes softly approaching from far right
    const targetSpinY = planet1Data ? planet1Data.targetSpinY : 0.35;
    const targetPitchX = planet1Data ? planet1Data.targetPitchX : 0.24;
    const pBaseR = Math.min(height * 0.25, width * 0.20);
    const pRad = lerp(pBaseR * 0.28, pBaseR * 0.44, easeOutCubic(driftP));
    const px = lerp(width * 0.90, width * 0.78, easeOutCubic(driftP));
    const py = height * (height <= 520 ? 0.38 : 0.42);
    drawRockyPlanet3D(px, py, pRad, targetSpinY - 1.6 + sMs * 0.00012, targetPitchX - 0.32, planet1Data ? planet1Data.roll : 0.21, elapsed, clamp01(driftP * 1.2));

    // Unpowered 3D Escape Craft lazily tumbling in zero gravity with pulsing red beacon
    const tSec = 1.2 + sMs * 0.001;
    const shipX = width * 0.36 + Math.sin(tSec * 0.45) * 18 + pointerTiltY * 16;
    const shipY = height * (height <= 520 ? 0.39 : 0.42) + Math.cos(tSec * 0.55) * 14 + pointerTiltX * 12;
    const rot = createRotator(0.32 + Math.sin(tSec * 0.55) * 0.45 + pointerTiltY * 0.24, 0.12 + Math.sin(tSec * 0.72) * 0.35 + pointerTiltX * 0.18, 0);

    drawEscapeCraftScreen3D(
      vec3(0, 0, 0.95),
      normalize(rot(vec3(1, 0, 0))),
      normalize(rot(vec3(0, 1, 0))),
      0.2 + tSec * 0.62,
      clamp(Math.min(width, height) * 0.00080, 0.30, 0.46),
      shipX,
      shipY,
      Math.min(width, height) * 1.15,
      elapsed,
      { thrust: 0, beacon: true },
      1
    );

    step6Snapshot = {
      px: px,
      py: py,
      pRad: pRad,
      spinY: targetSpinY - 1.6 + sMs * 0.00012,
      pitchX: targetPitchX - 0.32,
      roll: planet1Data ? planet1Data.roll : 0.21
    };

    setAlarmActive(false);
  }

  function renderStep6PlanetCapture(sMs, elapsed) {
    const capT = clamp01(sMs / 2000);
    const pull = easeInOutCubic(capT);

    draw3DStarfield(elapsed, 1, 1.32 + capT * 0.48, 0.12 * capT, pull * 0.36, 0);

    const targetSpinY = planet1Data ? planet1Data.targetSpinY : 0.35;
    const targetPitchX = planet1Data ? planet1Data.targetPitchX : 0.24;
    const roll = planet1Data ? planet1Data.roll : 0.21;
    const spinY = lerp(targetSpinY - 1.35, targetSpinY - 0.32, pull) + pointerTiltY * 0.16;
    const pitchX = lerp(targetPitchX - 0.28, targetPitchX + 0.04, pull) + pointerTiltX * 0.12;

    const pBaseR = Math.min(height * 0.25, width * 0.20);
    const pRad = lerp(pBaseR * 0.50, pBaseR * 0.94, pull);
    const px = lerp(width * 0.76, width * 0.58, pull);
    const py = lerp(height * 0.42, height * 0.45, pull);

    drawRockyPlanet3D(px, py, pRad, spinY, pitchX, roll, elapsed, 1);

    const reentryGlow = clamp01((sMs - 650) / 1100) * 0.68;
    const shipX = lerp(width * 0.24, px - pRad * 0.72, pull) + pointerTiltY * 14;
    const shipY = lerp(height * 0.34, py - pRad * 0.66, easeInQuad(capT)) + Math.sin(elapsed * 0.004) * 3 + pointerTiltX * 10;

    if (reentryGlow > 0.08) {
      for (let k = 0; k < 4; k++) {
        const age = ((elapsed * 0.0048 + k * 0.25) % 1);
        drawSmokeOrb(shipX - (26 + age * 58), shipY - (12 + age * 32), (11 - age * 5) * (0.65 + reentryGlow * 0.45), reentryGlow * (1 - age) * 0.8, true);
      }
    }

    const fwd = normalize(vlerp(vec3(0.90, 0.06, 0.42), vec3(0.68, -0.58, 0.44), pull));
    const up = normalize(vlerp(vec3(0.18, 0.85, 0.48), vec3(0.45, 0.72, 0.52), pull));
    drawEscapeCraftScreen3D(
      vec3(0, 0, 0.8),
      fwd,
      up,
      lerp(0.55, -0.18, pull),
      lerp(0.34, 0.23, pull),
      shipX,
      shipY,
      Math.min(width, height) * 1.15,
      elapsed,
      { thrust: 0, reentryGlow: reentryGlow, beacon: true },
      1
    );

    step6Snapshot = {
      px: px,
      py: py,
      pRad: pRad,
      spinY: spinY,
      pitchX: pitchX,
      roll: roll
    };

    setAlarmActive(pull > 0.45);
  }

  function renderStep7CrashSurvival(sMs, elapsed) {
    if (!preparedFired) {
      preparedFired = true;
      if (currentCallbacks && typeof currentCallbacks.onPreparePlanet === "function") {
        currentCallbacks.onPreparePlanet();
      }
    }

    const IMPACT_MS = 1500;
    const ALIGN_MS = 460;
    const alignP = clamp01(sMs / ALIGN_MS);
    const bgAlpha = 1 - easeOutCubic(alignP);

    if (bgAlpha > 0.01) {
      draw3DStarfield(elapsed, bgAlpha, 1.80 + alignP * 0.12, 0.16, 0.4 * bgAlpha, 0);

      const liveTr =
        planet1Data && typeof planet1Data.getLiveTransform === "function"
          ? planet1Data.getLiveTransform()
          : { x: width * 0.5, y: height * 0.47, scaledRadius: Math.min(height * 0.25, width * 0.20) };
      const snap = step6Snapshot || {
        px: liveTr.x,
        py: liveTr.y,
        pRad: liveTr.scaledRadius,
        spinY: planet1Data ? planet1Data.targetSpinY : 0.35,
        pitchX: planet1Data ? planet1Data.targetPitchX : 0.24,
        roll: planet1Data ? planet1Data.roll : 0.21
      };
      const easeAlign = easeInOutCubic(alignP);

      drawRockyPlanet3D(
        lerp(snap.px, liveTr.x, easeAlign),
        lerp(snap.py, liveTr.y, easeAlign),
        lerp(snap.pRad, liveTr.scaledRadius, easeAlign),
        lerp(snap.spinY, planet1Data ? planet1Data.targetSpinY : snap.spinY, easeAlign),
        lerp(snap.pitchX, planet1Data ? planet1Data.targetPitchX : snap.pitchX, easeAlign),
        lerp(snap.roll, planet1Data ? planet1Data.roll : snap.roll, easeAlign),
        elapsed,
        bgAlpha
      );
    }

    if (sMs >= IMPACT_MS && !impactFired) {
      impactFired = true;
      if (!impactFlashFired) {
        impactFlashFired = true;
        triggerScreenFlash(120);
      }
      if (currentCallbacks && typeof currentCallbacks.onImpact === "function") {
        currentCallbacks.onImpact(true);
      }
    }

    if (sMs >= 1620 && !step7PostMode) {
      step7PostMode = true;
      applyStep7PostSurvivalUI();
    }

    setAlarmActive(!step7PostMode);

    const target =
      currentCallbacks && typeof currentCallbacks.getCrashTarget === "function"
        ? currentCallbacks.getCrashTarget()
        : null;
    if (!target || !target.worldOrigin || !target.rotN) return;

    const focal = target.focalLength;
    const cx = target.cx;
    const cy = target.cy;
    const o = target.worldOrigin;
    const rN = target.rotN;
    const rT = target.rotT || vec3(1, 0, 0);
    const rB = target.rotB || vec3(0, 1, 0);

    const P0 = add(o, add(scale(rN, 1.15), vec3(-1.22, 0.88, 0.18)));
    const P1 = add(o, add(scale(rN, 0.56), vec3(-0.36, 0.26, 0.12)));
    const P2 = add(o, scale(rN, 0.04));

    function evalB3(u) {
      const omt = 1 - u;
      return {
        x: omt * omt * P0.x + 2 * omt * u * P1.x + u * u * P2.x,
        y: omt * omt * P0.y + 2 * omt * u * P1.y + u * u * P2.y,
        z: omt * omt * P0.z + 2 * omt * u * P1.z + u * u * P2.z
      };
    }

    function evalBTan3(u) {
      const omt = 1 - u;
      return {
        x: 2 * omt * (P1.x - P0.x) + 2 * u * (P2.x - P1.x),
        y: 2 * omt * (P1.y - P0.y) + 2 * u * (P2.y - P1.y),
        z: 2 * omt * (P1.z - P0.z) + 2 * u * (P2.z - P1.z)
      };
    }

    if (sMs < IMPACT_MS) {
      const diveU = easeInQuad(clamp01(sMs / IMPACT_MS));
      const shipWorld = evalB3(diveU);
      const tanWorld = normalize(evalBTan3(Math.max(0.02, diveU)));

      for (let k = 0; k < 5; k++) {
        const tp = evalB3(Math.max(0, diveU - (k + 1) * 0.07));
        const sp = project3D(tp, cx, cy, focal);
        drawSmokeOrb(sp.x, sp.y, lerp(20, 8, k / 5) * (0.75 + 0.35 * (1 - diveU)), (1 - k / 5) * 0.85, k < 3);
      }

      drawEscapeCraftScreen3D(
        shipWorld,
        tanWorld,
        rN,
        lerp(-0.35, 0.08, diveU),
        (target.hexScale || 0.25) * lerp(0.95, 0.50, diveU),
        cx,
        cy,
        focal,
        elapsed,
        { thrust: 0, reentryGlow: 1.0, beacon: true },
        1
      );
    } else if (sMs < IMPACT_MS + 880) {
      const flP = clamp01((sMs - IMPACT_MS) / 880);
      const flEase = easeOutCubic(flP);
      const impactPt = project3D(P2, cx, cy, focal);

      const hexR = (target.hexScale || 0.25) * (0.45 + 1.85 * flEase);
      ctx.save();
      ctx.globalAlpha = clamp01((1 - flP) * 0.92);
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI * 2 * k) / 6;
        const w = add(P2, add(scale(rT, Math.cos(a) * hexR), scale(rB, Math.sin(a) * hexR)));
        const sp = project3D(w, cx, cy, focal);
        if (k === 0) ctx.moveTo(sp.x, sp.y);
        else ctx.lineTo(sp.x, sp.y);
      }
      ctx.closePath();
      ctx.lineWidth = Math.max(2.5, (1 - flP) * 9);
      ctx.strokeStyle = "#ffc83a";
      ctx.stroke();

      for (let i = 0; i < step7SparkSeeds.length; i++) {
        const sd = step7SparkSeeds[i];
        const dist = (target.hexScale || 0.25) * flEase * 2.1 * sd.spd;
        const lift = (target.hexScale || 0.25) * (Math.sin(flP * Math.PI) * 1.15);
        const w = add(P2, add(scale(rN, lift), add(scale(rT, Math.cos(sd.ang) * dist), scale(rB, Math.sin(sd.ang) * dist))));
        const sp = project3D(w, cx, cy, focal);
        const sz = clamp(target.radius * sd.size * (1 - flP * 0.5), 2, 9);
        ctx.fillStyle = sd.col;
        ctx.strokeStyle = "#1b1147";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sz, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (flP < 0.55) {
        const bloomAlpha = 1 - flP / 0.55;
        const bloomR = target.radius * (0.20 + 0.34 * flEase);
        const flGrad = ctx.createRadialGradient(impactPt.x, impactPt.y, 0, impactPt.x, impactPt.y, bloomR);
        flGrad.addColorStop(0, "rgba(255, 255, 255, " + (bloomAlpha * 0.94).toFixed(2) + ")");
        flGrad.addColorStop(0.5, "rgba(255, 200, 58, " + (bloomAlpha * 0.65).toFixed(2) + ")");
        flGrad.addColorStop(1, "rgba(255, 90, 77, 0)");
        ctx.fillStyle = flGrad;
        ctx.beginPath();
        ctx.arc(impactPt.x, impactPt.y, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- Cached Studio UI, Pilot Name & Typewriter Sync ---

  function sanitizePlayerName(raw) {
    return String(raw || "").replace(/\s+/g, " ").trim().slice(0, MAX_PLAYER_NAME_LEN);
  }

  function getDisplayPlayerName() {
    return enteredPlayerName || t("intro.default_pioneer");
  }

  function setAlarmActive(active) {
    const next = Boolean(active);
    if (alarmOverlayEl && next !== lastAlarmActive) {
      lastAlarmActive = next;
      alarmOverlayEl.classList.toggle("is-active", next);
    }
  }

  function syncNameStepButtonState() {
    if (!playerNameInputEl) return false;
    const valid = sanitizePlayerName(playerNameInputEl.value).length > 0;
    if (continueBtn) {
      const nextLocked = !valid;
      if (lastNameLockedState !== nextLocked) {
        lastNameLockedState = nextLocked;
        continueBtn.classList.toggle("is-locked", nextLocked);
      }
    }
    if (valid) {
      if (nameErrorEl) nameErrorEl.classList.add("is-hidden");
      playerNameInputEl.classList.remove("is-invalid");
    }
    return valid;
  }

  function submitPlayerNameAndAdvance() {
    if (!playing) return false;
    const raw = playerNameInputEl ? playerNameInputEl.value : "";
    const clean = sanitizePlayerName(raw);
    if (!clean) {
      forceRevealText();
      if (nameErrorEl) nameErrorEl.classList.remove("is-hidden");
      if (playerNameInputEl) {
        playerNameInputEl.classList.remove("is-invalid");
        void playerNameInputEl.offsetWidth;
        playerNameInputEl.classList.add("is-invalid");
        playerNameInputEl.focus();
      }
      syncNameStepButtonState();
      return false;
    }

    enteredPlayerName = clean;
    if (playerNameInputEl) {
      playerNameInputEl.value = clean;
      playerNameInputEl.classList.remove("is-invalid");
      playerNameInputEl.blur();
    }
    if (nameErrorEl) nameErrorEl.classList.add("is-hidden");
    if (currentCallbacks && typeof currentCallbacks.onNameSet === "function") {
      currentCallbacks.onNameSet(clean);
    }
    enterStep(sceneIndex + 1);
    return true;
  }

  function applyStep7PostSurvivalUI() {
    const cfg = STEPS[7];
    const pName = getDisplayPlayerName();
    if (speakerNameEl) speakerNameEl.textContent = t("intro.steps.7.speaker", { name: pName });
    if (portraitIconEl) portraitIconEl.src = cfg.portrait;
    if (portraitFrameEl) portraitFrameEl.classList.remove("is-alert");
    if (salvageChipsEl) salvageChipsEl.classList.remove("is-hidden");
    startTypewriter(t("intro.steps.7.caption", { name: pName }));
  }

  function startTypewriter(textStr) {
    fullCaptionText = String(textStr || "");
    textComplete = false;
    lastTypedLen = -1;
    typewriterStartMs = stepMs;
    updateTapHintUI("intro.tap_to_finish", true);
    tickTypewriter();
  }

  function forceRevealText() {
    if (textComplete) return;
    textComplete = true;
    lastTypedLen = fullCaptionText.length;
    if (captionEl) captionEl.textContent = fullCaptionText;
  }

  function tickTypewriter() {
    if (!textComplete) {
      const elapsedType = Math.max(0, stepMs - typewriterStartMs);
      const count = Math.min(fullCaptionText.length, Math.max(1, Math.floor(elapsedType / 18)));
      if (count !== lastTypedLen) {
        lastTypedLen = count;
        if (captionEl) captionEl.textContent = fullCaptionText.slice(0, count);
      }
      if (count >= fullCaptionText.length) {
        textComplete = true;
      }
    }
  }

  function updateTapHintUI(key, visible) {
    const state = (visible ? "1:" : "0:") + (key || "");
    if (state === lastHintKey) return;
    lastHintKey = state;
    if (!tapHintEl) return;
    tapHintEl.classList.toggle("is-hidden", !visible);
    if (key) {
      tapHintEl.textContent = t(key);
    }
  }

  function setContinueButtonVisible(visible) {
    if (continueVisible === visible) return;
    continueVisible = visible;
    const cfg = STEPS[sceneIndex];
    if (continueBtn) {
      continueBtn.classList.toggle("is-hidden", !visible);
      continueBtn.classList.toggle("is-urgent", visible && cfg.btnStyle === "urgent");
      continueBtn.classList.toggle("is-victory", visible && cfg.btnStyle === "victory");
      if (!visible || !cfg.requiresName) {
        continueBtn.classList.remove("is-locked");
        lastNameLockedState = null;
      }
    }
    if (continueIconEl) {
      if (visible && cfg.btnIcon) {
        continueIconEl.src = cfg.btnIcon;
        continueIconEl.classList.remove("is-hidden");
      } else {
        continueIconEl.classList.add("is-hidden");
      }
    }
    if (continueLabelEl && visible) {
      continueLabelEl.textContent = t("intro.steps." + cfg.idx + ".btn");
    }
  }

  function enterStep(idx) {
    sceneIndex = clamp(idx, 0, STEP_COUNT - 1);
    sceneStartWall = 0;
    stepMs = 0;
    sceneReady = false;
    step7PostMode = false;
    flashFiredInStep3 = false;
    impactFlashFired = false;
    continueVisible = false;
    lastNameLockedState = null;

    const cfg = STEPS[sceneIndex];
    const pName = getDisplayPlayerName();

    if (speakerNameEl) {
      speakerNameEl.textContent =
        sceneIndex === 7
          ? t("intro.steps.7.speaker_pre", { name: pName })
          : t("intro.steps." + cfg.idx + ".speaker", { name: pName });
    }
    if (portraitFrameEl) {
      portraitFrameEl.classList.toggle("is-alert", Boolean(cfg.alert));
    }
    if (portraitIconEl) {
      portraitIconEl.src = cfg.portraitPre || cfg.portrait;
    }
    if (nameRowEl) {
      nameRowEl.classList.toggle("is-hidden", !cfg.requiresName);
    }
    if (nameErrorEl) {
      nameErrorEl.classList.add("is-hidden");
    }
    if (playerNameInputEl) {
      playerNameInputEl.classList.remove("is-invalid");
      if (cfg.requiresName) {
        playerNameInputEl.value = enteredPlayerName;
        if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          window.setTimeout(function () {
            if (playing && STEPS[sceneIndex] && STEPS[sceneIndex].requiresName && playerNameInputEl) {
              playerNameInputEl.focus();
            }
          }, 60);
        }
      } else if (document.activeElement === playerNameInputEl) {
        playerNameInputEl.blur();
      }
    }
    if (salvageChipsEl) {
      salvageChipsEl.classList.add("is-hidden");
    }
    if (continueBtn) {
      continueBtn.classList.add("is-hidden");
      continueBtn.classList.remove("is-urgent", "is-victory", "is-locked");
    }
    if (continueIconEl) {
      continueIconEl.classList.add("is-hidden");
    }

    const startCaption =
      sceneIndex === 7
        ? t("intro.steps.7.caption_pre", { name: pName })
        : t("intro.steps." + cfg.idx + ".caption", { name: pName });
    startTypewriter(startCaption);
  }

  function handleUserTapAdvance() {
    if (!playing) return;
    const cfg = STEPS[sceneIndex];
    if (!textComplete) {
      forceRevealText();
      if (cfg && cfg.requiresName) {
        if (sceneReady) {
          setContinueButtonVisible(true);
          const hasValidName = syncNameStepButtonState();
          updateTapHintUI(hasValidName ? "intro.hint_ready_launch" : "intro.hint_enter_name", true);
        } else {
          updateTapHintUI("", false);
        }
      } else if (sceneReady) {
        setContinueButtonVisible(true);
        updateTapHintUI("intro.tap_to_continue", true);
      } else {
        updateTapHintUI("", false);
      }
      return;
    }
    if (cfg && cfg.requiresName) {
      return;
    }
    if (sceneReady) {
      advanceScene();
    }
  }

  function advanceScene() {
    if (!playing || !sceneReady) return false;
    const cfg = STEPS[sceneIndex];
    if (cfg && cfg.requiresName) {
      return submitPlayerNameAndAdvance();
    }
    if (sceneIndex + 1 < STEP_COUNT) {
      enterStep(sceneIndex + 1);
    } else {
      finishAndHide(420);
    }
    return true;
  }

  function finishAndHide(fadeMs) {
    if (!playing) return;
    playing = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    setAlarmActive(false);

    const cb = currentCallbacks;
    currentCallbacks = null;

    if (overlayEl) {
      overlayEl.classList.add("is-fading");
      window.setTimeout(function () {
        overlayEl.classList.add("is-hidden");
        overlayEl.classList.remove("is-fading");
        overlayEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("intro-active");
        if (cb && typeof cb.onComplete === "function") {
          cb.onComplete();
        }
      }, fadeMs || 380);
    } else {
      document.body.classList.remove("intro-active");
      if (cb && typeof cb.onComplete === "function") {
        cb.onComplete();
      }
    }
  }

  function frame(now) {
    if (!playing || !ctx || !canvasEl) return;

    if (!playStartWall) playStartWall = now;
    if (!sceneStartWall) sceneStartWall = now;
    stepMs = Math.max(0, now - sceneStartWall);
    const elapsed = Math.max(0, now - playStartWall);
    const cfg = STEPS[sceneIndex];

    pointerTiltX += (targetTiltX - pointerTiltX) * 0.08;
    pointerTiltY += (targetTiltY - pointerTiltY) * 0.08;

    tickTypewriter();

    if (!sceneReady && stepMs >= cfg.minReadyMs) {
      sceneReady = true;
    }

    if (cfg.requiresName) {
      if (sceneReady) {
        setContinueButtonVisible(true);
        const hasValidName = syncNameStepButtonState();
        if (textComplete) {
          updateTapHintUI(hasValidName ? "intro.hint_ready_launch" : "intro.hint_enter_name", true);
        } else {
          updateTapHintUI("intro.tap_to_finish", true);
        }
      } else if (!textComplete) {
        updateTapHintUI("intro.tap_to_finish", true);
      } else {
        updateTapHintUI("", false);
      }
    } else if (sceneReady && textComplete) {
      setContinueButtonVisible(true);
      updateTapHintUI("intro.tap_to_continue", true);
    } else if (!textComplete) {
      updateTapHintUI("intro.tap_to_finish", true);
    } else {
      updateTapHintUI("", false);
    }

    ctx.clearRect(0, 0, width, height);

    if (sceneIndex === 0) {
      renderStep0GoldenAge(stepMs, elapsed);
    } else if (sceneIndex === 1) {
      renderStep1CoreCrisis(stepMs, elapsed);
    } else if (sceneIndex === 2) {
      renderStep2BoardingLaunchpad(stepMs, elapsed);
    } else if (sceneIndex === 3) {
      renderStep3LiftoffDestruction(stepMs, elapsed);
    } else if (sceneIndex === 4) {
      renderStep4FuelEmpty(stepMs, elapsed);
    } else if (sceneIndex === 5) {
      renderStep5AdriftVoid(stepMs, elapsed);
    } else if (sceneIndex === 6) {
      renderStep6PlanetCapture(stepMs, elapsed);
    } else {
      renderStep7CrashSurvival(stepMs, elapsed);
    }

    rafId = window.requestAnimationFrame(frame);
  }

  function play(callbacks) {
    if (playing) {
      abortAndHide();
    }
    if (!overlayEl || !canvasEl || !ctx) {
      if (callbacks && typeof callbacks.onPreparePlanet === "function") callbacks.onPreparePlanet();
      if (callbacks && typeof callbacks.onImpact === "function") callbacks.onImpact(false);
      if (callbacks && typeof callbacks.onComplete === "function") callbacks.onComplete();
      return;
    }

    currentCallbacks = callbacks || null;
    preparedFired = false;
    impactFired = false;
    enteredPlayerName = "";
    targetTiltX = 0;
    targetTiltY = 0;
    pointerTiltX = 0;
    pointerTiltY = 0;
    playing = true;
    playStartWall = 0;

    resizeIntroCanvas();
    buildSceneEntities();

    document.body.classList.remove("intro-pending");
    document.body.classList.add("intro-active");
    overlayEl.classList.remove("is-hidden", "is-fading");
    overlayEl.setAttribute("aria-hidden", "false");
    enterStep(0);

    rafId = window.requestAnimationFrame(frame);
  }

  function abortAndHide() {
    playing = false;
    sceneReady = false;
    currentCallbacks = null;
    enteredPlayerName = "";
    lastNameLockedState = null;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    setAlarmActive(false);
    if (playerNameInputEl && document.activeElement === playerNameInputEl) {
      playerNameInputEl.blur();
    }
    document.body.classList.remove("intro-active", "intro-pending");
    if (overlayEl) {
      overlayEl.classList.add("is-hidden");
      overlayEl.classList.remove("is-fading");
      overlayEl.setAttribute("aria-hidden", "true");
    }
  }

  if (playerNameInputEl) {
    playerNameInputEl.addEventListener("input", function () {
      const valid = syncNameStepButtonState();
      if (playing && STEPS[sceneIndex] && STEPS[sceneIndex].requiresName && sceneReady && textComplete) {
        updateTapHintUI(valid ? "intro.hint_ready_launch" : "intro.hint_enter_name", true);
      }
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const cfg = STEPS[sceneIndex];
      if (cfg && cfg.requiresName) {
        forceRevealText();
        submitPlayerNameAndAdvance();
        return;
      }
      handleUserTapAdvance();
    });
  }

  if (overlayEl) {
    overlayEl.addEventListener("pointerdown", function (e) {
      if (!playing) return;
      if (continueBtn && continueBtn.contains(e.target)) return;
      if (nameRowEl && nameRowEl.contains(e.target)) return;
      tapDownPos = { x: e.clientX, y: e.clientY };
    });

    overlayEl.addEventListener("pointermove", function (e) {
      if (!playing) return;
      const nx = clamp((e.clientX / Math.max(1, width)) * 2 - 1, -1, 1);
      const ny = clamp((e.clientY / Math.max(1, height)) * 2 - 1, -1, 1);
      targetTiltY = nx * 0.40;
      targetTiltX = ny * 0.30;
    });

    overlayEl.addEventListener("pointerup", function (e) {
      if (!playing || !tapDownPos) return;
      const dist = Math.hypot(e.clientX - tapDownPos.x, e.clientY - tapDownPos.y);
      tapDownPos = null;
      if (continueBtn && continueBtn.contains(e.target)) return;
      if (nameRowEl && nameRowEl.contains(e.target)) return;
      if (dist < 24) {
        handleUserTapAdvance();
      }
    });

    overlayEl.addEventListener("pointercancel", function () {
      tapDownPos = null;
    });
  }

  window.addEventListener("resize", function () {
    if (playing) {
      resizeIntroCanvas();
    }
  });

  window.addEventListener("keydown", function (e) {
    if (!playing) return;
    const cfg = STEPS[sceneIndex];
    if (cfg && cfg.requiresName) {
      if (e.key === "Enter") {
        e.preventDefault();
        forceRevealText();
        submitPlayerNameAndAdvance();
      }
      return;
    }
    if (e.key === " " || e.key === "Spacebar" || e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      handleUserTapAdvance();
    }
  });

  window.GameIntro = {
    play: play,
    abortAndHide: abortAndHide,
    advanceScene: advanceScene,
    isPlaying: function () {
      return playing;
    },
    coversBackground: function () {
      return playing && (sceneIndex < 7 || stepMs < 460);
    },
    coversStage: function () {
      return playing && sceneIndex < 7;
    },
    getSceneState: function () {
      return {
        playing: playing,
        sceneIndex: sceneIndex,
        sceneReady: sceneReady,
        textComplete: textComplete,
        preparedFired: preparedFired,
        impactFired: impactFired,
        playerName: enteredPlayerName
      };
    }
  };
})();
