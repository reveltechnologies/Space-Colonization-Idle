/**
 * Space Colonization: Idle
 * Dynamic Deep Space & Celestial Background Engine
 */

(function () {
  "use strict";

  const canvas = document.getElementById("starfield");
  const ctx = canvas ? canvas.getContext("2d") : null;

  // Visual Collections
  const stars = [];
  const nebulae = [];
  const shootingStars = [];
  const cosmicDust = [];

  // Star palette representing stellar spectral classes (O, B, A, F, G, K, M)
  const STAR_COLORS = [
    { r: 255, g: 255, b: 255 }, // Neutral White
    { r: 215, g: 235, b: 255 }, // Bluish-White
    { r: 165, g: 215, b: 255 }, // Cyan-Blue (Rigel)
    { r: 255, g: 244, b: 214 }, // Soft Yellow (Sun-like)
    { r: 255, g: 210, b: 150 }, // Amber-Orange (Arcturus)
    { r: 255, g: 175, b: 175 }  // Crimson-Red Dwarf
  ];

  const NEBULA_PALETTES = [
    { r: 30, g: 64, b: 175 },  // Deep Cobalt
    { r: 109, g: 40, b: 217 }, // Violet Rift
    { r: 14, g: 116, b: 144 }, // Cyan Void
    { r: 190, g: 24, b: 93 }   // Magenta Nebula
  ];

  let width = window.innerWidth;
  let height = window.innerHeight;
  let lastTime = performance.now();
  let nextShootingStarTime = performance.now() + 2000;
  let parallaxDx = 0;

  window.SpaceBackground = {
    addParallax: function (dx) {
      if (Number.isFinite(dx)) {
        parallaxDx += dx;
      }
    }
  };

  // Device pixel ratio support for crisp high-density screens
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

  // Generate multi-layered stars with twinkling, color temperatures & parallax
  function initStars() {
    stars.length = 0;
    const starCount = Math.floor(Math.max(140, (width * height) / 4500));

    for (let i = 0; i < starCount; i++) {
      const layer = Math.random() < 0.65 ? 0 : Math.random() < 0.88 ? 1 : 2;
      const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

      let baseRadius, speed, baseAlpha;
      if (layer === 0) {
        baseRadius = Math.random() * 0.7 + 0.3;
        speed = Math.random() * 0.08 + 0.03;
        baseAlpha = Math.random() * 0.45 + 0.25;
      } else if (layer === 1) {
        baseRadius = Math.random() * 1.1 + 0.8;
        speed = Math.random() * 0.16 + 0.09;
        baseAlpha = Math.random() * 0.5 + 0.4;
      } else {
        baseRadius = Math.random() * 1.6 + 1.3;
        speed = Math.random() * 0.26 + 0.16;
        baseAlpha = Math.random() * 0.4 + 0.6;
      }

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        layer: layer,
        radius: baseRadius,
        baseAlpha: baseAlpha,
        color: color,
        speedX: -speed,
        speedY: (Math.random() - 0.5) * 0.04,
        twinkleSpeed: Math.random() * 0.003 + 0.0012,
        twinkleOffset: Math.random() * Math.PI * 2,
        hasRays: layer === 2 && Math.random() < 0.45
      });
    }
  }

  // Floating ambient nebulae clouds creating deep space volume
  function initNebulae() {
    nebulae.length = 0;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const palette = NEBULA_PALETTES[i % NEBULA_PALETTES.length];
      nebulae.push({
        x: (width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 150,
        y: (height / 2) + (Math.random() - 0.5) * (height * 0.5),
        radius: Math.min(width, height) * (0.35 + Math.random() * 0.25),
        color: palette,
        baseAlpha: 0.09 + Math.random() * 0.06,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0006 + Math.random() * 0.0004,
        vx: (Math.random() - 0.5) * 0.03,
        vy: (Math.random() - 0.5) * 0.02
      });
    }
  }

  // Subtle floating micro-dust motes
  function initCosmicDust() {
    cosmicDust.length = 0;
    const count = 35;
    for (let i = 0; i < count; i++) {
      cosmicDust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.25 + 0.08,
        vx: (Math.random() - 0.5) * 0.12 - 0.05,
        vy: (Math.random() - 0.5) * 0.1,
        lifeOffset: Math.random() * Math.PI * 2
      });
    }
  }

  // Spawn an occasional dynamic shooting star / meteor
  function spawnShootingStar() {
    const angle = (Math.PI / 6) + (Math.random() * 0.25);
    const speed = Math.random() * 6 + 10;
    const length = Math.random() * 120 + 90;

    const startX = Math.random() * (width * 0.8) + (width * 0.2);
    const startY = Math.random() * (height * 0.4);

    shootingStars.push({
      x: startX,
      y: startY,
      vx: -Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      alpha: 1.0,
      decay: Math.random() * 0.018 + 0.015,
      width: Math.random() * 1.8 + 1.2
    });
  }

  // Render & update space animation loop
  function render(time) {
    if (!ctx || !canvas) return;

    if (
      window.GameIntro &&
      typeof window.GameIntro.coversBackground === "function" &&
      window.GameIntro.coversBackground()
    ) {
      lastTime = time;
      window.requestAnimationFrame(render);
      return;
    }

    lastTime = time;
    const frameParallax = parallaxDx;
    parallaxDx = 0;

    // 1. Dark Void Base Clear with slight gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#040711");
    bgGrad.addColorStop(0.5, "#070b18");
    bgGrad.addColorStop(1, "#03050c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Render Soft Nebulae Glows
    for (let i = 0; i < nebulae.length; i++) {
      const neb = nebulae[i];
      neb.x += neb.vx;
      neb.y += neb.vy;

      if (neb.x < -neb.radius) neb.x = width + neb.radius;
      if (neb.x > width + neb.radius) neb.x = -neb.radius;

      const pulse = Math.sin(time * neb.pulseSpeed + neb.pulseOffset) * 0.03;
      const alpha = Math.max(0.02, neb.baseAlpha + pulse);

      const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
      grad.addColorStop(0, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${alpha * 1.2})`);
      grad.addColorStop(0.45, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${alpha * 0.5})`);
      grad.addColorStop(1, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(neb.x - neb.radius, neb.y - neb.radius, neb.radius * 2, neb.radius * 2);
    }

    // 3. Render Cosmic Dust Motes
    for (let i = 0; i < cosmicDust.length; i++) {
      const p = cosmicDust[i];
      p.x += p.vx + frameParallax * 0.14;
      p.y += p.vy;

      if (width > 0) {
        p.x = ((p.x % width) + width) % width;
      }
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const flicker = Math.sin(time * 0.002 + p.lifeOffset) * 0.08;
      const curAlpha = Math.max(0.04, p.alpha + flicker);

      ctx.fillStyle = `rgba(186, 230, 253, ${curAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Render Stars with Twinkles, Colors, and Diffraction Rays
    const starSpanW = width + 20;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const layerParallax = s.layer === 0 ? 0.06 : s.layer === 1 ? 0.16 : 0.28;

      s.x += s.speedX + frameParallax * layerParallax;
      s.y += s.speedY;

      if (starSpanW > 0 && (s.x < -10 || s.x > width + 10)) {
        s.x = ((((s.x + 10) % starSpanW) + starSpanW) % starSpanW) - 10;
      }
      if (s.y < -10) s.y = height + 10;
      if (s.y > height + 10) s.y = -10;

      const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      const alpha = Math.max(0.12, Math.min(1, s.baseAlpha + twinkle * 0.35));
      const radius = Math.max(0.3, s.radius + twinkle * 0.25);

      const colorStr = `${s.color.r}, ${s.color.g}, ${s.color.b}`;

      if (s.layer >= 1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorStr}, ${alpha * 0.22})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colorStr}, ${alpha})`;
      ctx.fill();

      if (s.hasRays && alpha > 0.6) {
        const rayLen = radius * 4.2;
        ctx.strokeStyle = `rgba(${colorStr}, ${alpha * 0.35})`;
        ctx.lineWidth = 0.8;

        ctx.beginPath();
        ctx.moveTo(s.x - rayLen, s.y);
        ctx.lineTo(s.x + rayLen, s.y);
        ctx.moveTo(s.x, s.y - rayLen);
        ctx.lineTo(s.x, s.y + rayLen);
        ctx.stroke();
      }
    }

    // 5. Shooting Stars / Meteors
    if (time > nextShootingStarTime) {
      spawnShootingStar();
      nextShootingStarTime = time + (Math.random() * 5000 + 3500);
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const m = shootingStars[i];
      m.x += m.vx;
      m.y += m.vy;
      m.alpha -= m.decay;

      if (m.alpha <= 0 || m.x < -100 || m.y > height + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      const tailX = m.x - (m.vx * (m.length / 14));
      const tailY = m.y - (m.vy * (m.length / 14));

      const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, "rgba(56, 189, 248, 0)");
      grad.addColorStop(0.7, `rgba(186, 230, 253, ${m.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.width;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.width * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
      ctx.fill();
    }

    window.requestAnimationFrame(render);
  }

  function bindEvents() {
    window.addEventListener("resize", () => {
      resizeCanvas();
      initStars();
      initNebulae();
      initCosmicDust();
    });
  }

  function tryLockOrientation() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {});
    }
  }

  function init() {
    resizeCanvas();
    initNebulae();
    initStars();
    initCosmicDust();
    bindEvents();
    tryLockOrientation();
    window.requestAnimationFrame(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
