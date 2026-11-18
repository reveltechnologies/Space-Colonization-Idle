/**
 * Space Colonization: Idle
 * Initial Screen & Starfield Bootstrap
 */

(function () {
  "use strict";

  const canvas = document.getElementById("starfield");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const statusIndicator = document.getElementById("status-indicator");
  const startBtn = document.getElementById("btn-start");
  const settingsBtn = document.getElementById("btn-settings");
  const aboutBtn = document.getElementById("btn-about");

  const stars = [];
  const STAR_COUNT = 85;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars.length = 0;
    const width = canvas ? canvas.width : window.innerWidth;
    const height = canvas ? canvas.height : window.innerHeight;

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.25 + 0.05,
      });
    }
  }

  function renderStarfield() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226, 232, 240, ${star.alpha})`;
      ctx.fill();
    }

    window.requestAnimationFrame(renderStarfield);
  }

  function setStatus(message) {
    if (statusIndicator) {
      statusIndicator.textContent = message;
    }
  }

  function bindEvents() {
    window.addEventListener("resize", () => {
      resizeCanvas();
      initStars();
    });

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        setStatus("COLONY INITIALIZATION SEQUENCE READY");
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        setStatus("SETTINGS MODULE // COMING SOON");
      });
    }

    if (aboutBtn) {
      aboutBtn.addEventListener("click", () => {
        setStatus("MISSION LOG // AWAITING FIRST LAUNCH");
      });
    }
  }

  function init() {
    resizeCanvas();
    initStars();
    renderStarfield();
    bindEvents();
    tryLockOrientation();
  }

  function tryLockOrientation() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {
        // Ignored if user hasn't interacted or if unsupported
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
