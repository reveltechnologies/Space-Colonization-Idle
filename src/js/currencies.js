/**
 * Space Colonization: Idle
 * Colony Currencies State, Idle Formatting & HUD Sync
 */

(function () {
  "use strict";

  function t(key, params) {
    if (window.GameLang && typeof window.GameLang.t === "function") {
      return window.GameLang.t(key, params);
    }
    return String(key || "");
  }

  const SUFFIXES =
    (window.GameLang && typeof window.GameLang.get === "function" && window.GameLang.get("currencies.suffixes")) ||
    [""];

  const econCredits =
    window.GameEconomy && typeof window.GameEconomy.get === "function"
      ? window.GameEconomy.get("currencies.credits")
      : null;
  const econOre =
    window.GameEconomy && typeof window.GameEconomy.get === "function"
      ? window.GameEconomy.get("currencies.ore")
      : null;

  const STARTING_AMOUNTS = {
    credits: econCredits && econCredits.startingAmount !== undefined ? Number(econCredits.startingAmount) || 0 : 500,
    ore: econOre && econOre.startingAmount !== undefined ? Number(econOre.startingAmount) || 0 : 100
  };
  const STARTING_RATES = {
    credits: econCredits && econCredits.baseRatePerSec ? Number(econCredits.baseRatePerSec) || 0 : 0,
    ore: econOre && econOre.baseRatePerSec ? Number(econOre.baseRatePerSec) || 0 : 0
  };

  const state = {
    credits: {
      amount: STARTING_AMOUNTS.credits,
      rate: STARTING_RATES.credits,
      displayRate: 0
    },
    ore: {
      amount: STARTING_AMOUNTS.ore,
      rate: STARTING_RATES.ore,
      displayRate: 0
    }
  };

  const listeners = [];

  function notifyChange() {
    const snap = getAll();
    for (let i = 0; i < listeners.length; i++) {
      listeners[i](snap);
    }
  }

  function onChange(fn) {
    if (typeof fn === "function") {
      listeners.push(fn);
    }
  }

  const dom = {
    credits: {
      valEl: document.getElementById("val-credits"),
      rateEl: document.getElementById("rate-credits"),
      lastVal: "",
      lastRate: "",
      bumpTimer: 0
    },
    ore: {
      valEl: document.getElementById("val-ore"),
      rateEl: document.getElementById("rate-ore"),
      lastVal: "",
      lastRate: "",
      bumpTimer: 0
    }
  };

  let tickerId = 0;
  let lastTickTime = 0;

  function formatNumber(value) {
    const n = Math.max(0, Number(value) || 0);
    if (n < 1000) {
      return Math.floor(n).toString();
    }

    let scaled = n;
    let tier = 0;
    while (scaled >= 1000 && tier < SUFFIXES.length - 1) {
      scaled /= 1000;
      tier++;
    }

    if (scaled >= 1000) {
      return n.toExponential(2);
    }

    let decimals = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;
    let str = scaled.toFixed(decimals);
    if (Number(str) >= 1000 && tier < SUFFIXES.length - 1) {
      tier++;
      str = "1.00";
    }

    return str + SUFFIXES[tier];
  }

  function formatRateNum(val) {
    if (val >= 1000) {
      return formatNumber(val);
    }
    if (val >= 100) {
      return String(Math.round(val));
    }
    const rounded = Math.round(val * 10) / 10;
    return rounded % 1 === 0 ? String(rounded | 0) : rounded.toFixed(1);
  }

  function formatRate(rate) {
    const r = Math.max(0, Number(rate) || 0);
    if (r <= 0) {
      return "";
    }
    if (r >= 10) {
      return t("rates.per_second", { rate: r < 1000 ? String(Math.floor(r)) : formatNumber(r) });
    }
    if (r >= 1) {
      return t("rates.per_second", { rate: formatRateNum(r) });
    }
    const perMin = r * 60;
    if (perMin >= 1) {
      return t("rates.per_minute", { rate: formatRateNum(perMin) });
    }
    const perHour = r * 3600;
    if (perHour >= 1) {
      return t("rates.per_hour", { rate: formatRateNum(perHour) });
    }
    const perDay = Math.max(0.1, r * 86400);
    return t("rates.per_day", { rate: formatRateNum(perDay) });
  }

  function renderCurrency(key) {
    const entry = state[key];
    const ui = dom[key];
    if (!entry || !ui) return false;

    let changed = false;
    const valText = formatNumber(entry.amount);
    if (ui.valEl && valText !== ui.lastVal) {
      ui.lastVal = valText;
      ui.valEl.textContent = valText;
      changed = true;
    }

    const rateText = formatRate((entry.rate || 0) + (entry.displayRate || 0));
    if (ui.rateEl && rateText !== ui.lastRate) {
      ui.lastRate = rateText;
      ui.rateEl.textContent = rateText;
    }

    return changed;
  }

  function bumpValueElement(key) {
    const ui = dom[key];
    if (!ui || !ui.valEl) return;

    ui.valEl.classList.add("is-bumped");
    if (ui.bumpTimer) {
      window.clearTimeout(ui.bumpTimer);
    }
    ui.bumpTimer = window.setTimeout(function () {
      ui.valEl.classList.remove("is-bumped");
      ui.bumpTimer = 0;
    }, 160);
  }

  function hasActiveIncome() {
    return state.credits.rate > 0 || state.ore.rate > 0;
  }

  function tick(now) {
    if (!hasActiveIncome()) {
      tickerId = 0;
      return;
    }

    const dtSec = Math.min((now - lastTickTime) / 1000, 1);
    lastTickTime = now;

    if (dtSec > 0) {
      let changed = false;
      if (state.credits.rate > 0) {
        state.credits.amount += state.credits.rate * dtSec;
        if (renderCurrency("credits")) changed = true;
      }
      if (state.ore.rate > 0) {
        state.ore.amount += state.ore.rate * dtSec;
        if (renderCurrency("ore")) changed = true;
      }
      if (changed) {
        notifyChange();
      }
    }

    tickerId = window.requestAnimationFrame(tick);
  }

  function ensureTicker() {
    if (hasActiveIncome() && !tickerId) {
      lastTickTime = performance.now();
      tickerId = window.requestAnimationFrame(tick);
    }
  }

  function get(key) {
    return state[key] ? state[key].amount : 0;
  }

  function getAll() {
    return {
      credits: state.credits.amount,
      ore: state.ore.amount
    };
  }

  function set(key, amount) {
    if (!state[key]) return;
    state[key].amount = Math.max(0, Number(amount) || 0);
    renderCurrency(key);
    notifyChange();
  }

  function add(key, delta, silent) {
    if (!state[key]) return 0;
    const val = Number(delta) || 0;
    if (val === 0) return state[key].amount;

    state[key].amount = Math.max(0, state[key].amount + val);
    renderCurrency(key);
    if (!silent) {
      bumpValueElement(key);
    }
    notifyChange();
    return state[key].amount;
  }

  function canAfford(costs) {
    if (!costs) return true;
    for (const key in costs) {
      if (Object.prototype.hasOwnProperty.call(costs, key)) {
        const req = Math.max(0, Number(costs[key]) || 0);
        if (!state[key] || state[key].amount < req) {
          return false;
        }
      }
    }
    return true;
  }

  function spend(costs) {
    if (!canAfford(costs)) {
      return false;
    }
    for (const key in costs) {
      if (Object.prototype.hasOwnProperty.call(costs, key)) {
        const req = Math.max(0, Number(costs[key]) || 0);
        if (req > 0 && state[key]) {
          state[key].amount = Math.max(0, state[key].amount - req);
          renderCurrency(key);
          bumpValueElement(key);
        }
      }
    }
    notifyChange();
    return true;
  }

  function setRate(key, ratePerSec) {
    if (!state[key]) return;
    state[key].rate = Math.max(0, Number(ratePerSec) || 0);
    renderCurrency(key);
    ensureTicker();
  }

  function setDisplayRate(key, ratePerSec) {
    if (!state[key]) return;
    state[key].displayRate = Math.max(0, Number(ratePerSec) || 0);
    renderCurrency(key);
  }

  function getRate(key) {
    const entry = state[key];
    return entry ? (entry.rate || 0) + (entry.displayRate || 0) : 0;
  }

  function resetTickClock() {
    lastTickTime = performance.now();
  }

  function exportState() {
    return {
      credits: Math.max(0, Number(state.credits.amount) || 0),
      ore: Math.max(0, Number(state.ore.amount) || 0)
    };
  }

  function importState(data) {
    if (data && typeof data === "object") {
      if (data.credits !== undefined && data.credits !== null) {
        const cr = Number(data.credits);
        if (Number.isFinite(cr) && cr >= 0) {
          state.credits.amount = cr;
        }
      }
      if (data.ore !== undefined && data.ore !== null) {
        const ore = Number(data.ore);
        if (Number.isFinite(ore) && ore >= 0) {
          state.ore.amount = ore;
        }
      }
    }
    lastTickTime = performance.now();
    renderCurrency("credits");
    renderCurrency("ore");
    notifyChange();
  }

  function resetState() {
    state.credits.amount = STARTING_AMOUNTS.credits;
    state.credits.rate = STARTING_RATES.credits;
    state.credits.displayRate = 0;
    state.ore.amount = STARTING_AMOUNTS.ore;
    state.ore.rate = STARTING_RATES.ore;
    state.ore.displayRate = 0;
    lastTickTime = performance.now();
    renderCurrency("credits");
    renderCurrency("ore");
    ensureTicker();
    notifyChange();
  }

  function init() {
    renderCurrency("credits");
    renderCurrency("ore");
    ensureTicker();
  }

  window.GameCurrencies = {
    formatNumber: formatNumber,
    get: get,
    getAll: getAll,
    getRate: getRate,
    set: set,
    add: add,
    spend: spend,
    canAfford: canAfford,
    setRate: setRate,
    setDisplayRate: setDisplayRate,
    onChange: onChange,
    exportState: exportState,
    importState: importState,
    resetState: resetState,
    resetTickClock: resetTickClock
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
