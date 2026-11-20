/**
 * Space Colonization: Idle
 * Resilient Multi-Layer Local Persistence Engine (Browser + Google Play Android App Bundle / PWA / Capacitor / Cordova)
 */

(function () {
  "use strict";

  const SAVE_MAGIC = "SCI_SAVE";
  const SAVE_VERSION = 1;
  const STORAGE_KEY = "sci_save_v1";
  const BACKUP_KEY = "sci_save_v1_bak";
  const LEGACY_NAMES_KEY = "sci_planet_names_v1";
  const IDB_DB_NAME = "sci_save_db";
  const IDB_STORE_NAME = "saves";
  const IDB_TIMEOUT_MS = 2500;
  const CAP_PRIMARY_FILE = "space_colonization_save_v1.json";
  const CAP_BACKUP_FILE = "space_colonization_save_v1.bak.json";
  const CORDOVA_PRIMARY_FILE = "space_colonization_save_v1.json";
  const CORDOVA_BACKUP_FILE = "space_colonization_save_v1.bak.json";
  const EXPORT_PREFIX = "SCI1:";

  const MUTATING_REASONS = {
    planet_rename: true,
    build: true,
    demolish: true,
    launch_rocket: true,
    rocket_landed: true,
    trade_toggle: true,
    cargo_change: true,
    research_purchase: true,
    import_string: true,
    reset: true
  };

  let booted = false;
  let isHydrating = false;
  let asyncReady = false;
  let hasUserMutatedSinceBoot = false;
  let dirtyWhileBooting = false;
  let cordovaResynced = false;
  let lifecycleBound = false;

  let currentRevision = 0;
  let lastSavedAt = 0;
  let hiddenAt = 0;
  let debounceTimer = 0;
  let autosaveTimer = 0;

  let asyncWriteInFlight = false;
  let pendingAsyncPair = null;

  let bestSyncEnvelope = null;

  function readConfigNumber(path, fallback) {
    if (window.GameEconomy && typeof window.GameEconomy.get === "function") {
      const v = Number(window.GameEconomy.get(path, fallback));
      if (Number.isFinite(v) && v > 0) return v;
    }
    return fallback;
  }

  // --- Deterministic Canonical JSON & Checksum ---

  function stableStringify(val) {
    if (val === null || val === undefined) {
      return "null";
    }
    const type = typeof val;
    if (type === "number") {
      return Number.isFinite(val) ? JSON.stringify(val) : "null";
    }
    if (type === "boolean" || type === "string") {
      return JSON.stringify(val);
    }
    if (Array.isArray(val)) {
      const parts = [];
      for (let i = 0; i < val.length; i++) {
        const el = val[i];
        if (el === undefined || typeof el === "function" || typeof el === "symbol") {
          parts.push("null");
        } else {
          parts.push(stableStringify(el));
        }
      }
      return "[" + parts.join(",") + "]";
    }
    if (type === "object") {
      const keys = Object.keys(val).sort();
      const props = [];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = val[k];
        if (v === undefined || typeof v === "function" || typeof v === "symbol") {
          continue;
        }
        props.push(JSON.stringify(k) + ":" + stableStringify(v));
      }
      return "{" + props.join(",") + "}";
    }
    return "null";
  }

  function fnv1a32(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function createEnvelope(data, bumpRevision) {
    const rev = bumpRevision ? currentRevision + 1 : Math.max(1, currentRevision);
    const savedAt = Date.now();
    const canonical = stableStringify(data);
    const checksum = fnv1a32(canonical);
    return {
      magic: SAVE_MAGIC,
      version: SAVE_VERSION,
      savedAt: savedAt,
      revision: rev,
      checksum: checksum,
      data: data
    };
  }

  function parseAndValidate(raw) {
    if (!raw) return null;
    try {
      const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!obj || typeof obj !== "object") return null;
      if (obj.magic !== SAVE_MAGIC || obj.version !== SAVE_VERSION) return null;
      if (!obj.data || typeof obj.data !== "object") return null;
      if (typeof obj.checksum !== "string") return null;
      const savedAt = Number(obj.savedAt);
      const revision = Number(obj.revision);
      if (!Number.isFinite(savedAt) || savedAt <= 0 || !Number.isFinite(revision) || revision < 0) {
        return null;
      }
      const expected = fnv1a32(stableStringify(obj.data));
      if (expected !== obj.checksum) {
        return null;
      }
      return {
        magic: obj.magic,
        version: obj.version,
        savedAt: savedAt,
        revision: revision,
        checksum: obj.checksum,
        data: obj.data
      };
    } catch (_) {
      return null;
    }
  }

  function isNewerEnvelope(candidate, current) {
    if (!candidate) return false;
    if (!current) return true;
    if (candidate.revision !== current.revision) {
      return candidate.revision > current.revision;
    }
    return candidate.savedAt > current.savedAt;
  }

  // --- Base64 UTF-8 Helpers for Portable Export/Import ---

  function utf8ToBase64(str) {
    if (typeof TextEncoder !== "undefined") {
      const bytes = new TextEncoder().encode(str);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) {
        bin += String.fromCharCode(bytes[i]);
      }
      return window.btoa(bin);
    }
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function base64ToUtf8(b64) {
    const bin = window.atob(b64);
    if (typeof TextDecoder !== "undefined") {
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    }
    return decodeURIComponent(escape(bin));
  }

  // --- Sync Storage Backends ---

  function getNativeBridge() {
    const b = window.AndroidSave || window.SpaceColonyStorage || window.AndroidStorage;
    if (b && typeof b === "object") {
      return b;
    }
    return null;
  }

  function nativeBridgeRead(key) {
    const b = getNativeBridge();
    if (!b) return null;
    try {
      if (typeof b.load === "function") return b.load(key) || null;
      if (typeof b.getItem === "function") return b.getItem(key) || null;
    } catch (_) { }
    return null;
  }

  function nativeBridgeWrite(key, value) {
    const b = getNativeBridge();
    if (!b) return false;
    try {
      if (typeof b.save === "function") {
        b.save(key, value);
        return true;
      }
      if (typeof b.setItem === "function") {
        b.setItem(key, value);
        return true;
      }
    } catch (_) { }
    return false;
  }

  function nativeBridgeRemove(key) {
    const b = getNativeBridge();
    if (!b) return;
    try {
      if (typeof b.remove === "function") b.remove(key);
      else if (typeof b.removeItem === "function") b.removeItem(key);
      else if (typeof b.save === "function") b.save(key, "");
    } catch (_) { }
  }

  function getLocalStorageSafe() {
    try {
      return window.localStorage || null;
    } catch (_) {
      return null;
    }
  }

  function localStorageRead(key) {
    const ls = getLocalStorageSafe();
    if (!ls) return null;
    try {
      return ls.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function localStorageWrite(key, value) {
    const ls = getLocalStorageSafe();
    if (!ls) return false;
    try {
      ls.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  }

  function localStorageRemove(key) {
    const ls = getLocalStorageSafe();
    if (!ls) return;
    try {
      ls.removeItem(key);
    } catch (_) { }
  }

  function readAllSyncCandidates() {
    const raws = [];
    const bridge = getNativeBridge();
    if (bridge) {
      raws.push(nativeBridgeRead(STORAGE_KEY));
      raws.push(nativeBridgeRead(BACKUP_KEY));
    }
    raws.push(localStorageRead(STORAGE_KEY));
    raws.push(localStorageRead(BACKUP_KEY));

    let best = null;
    for (let i = 0; i < raws.length; i++) {
      const env = parseAndValidate(raws[i]);
      if (isNewerEnvelope(env, best)) {
        best = env;
      }
    }
    return best;
  }

  function writeSyncBackends(primaryStr, backupStr) {
    localStorageWrite(STORAGE_KEY, primaryStr);
    localStorageWrite(BACKUP_KEY, backupStr);
    if (getNativeBridge()) {
      nativeBridgeWrite(STORAGE_KEY, primaryStr);
      nativeBridgeWrite(BACKUP_KEY, backupStr);
    }
  }

  function clearSyncBackends() {
    localStorageRemove(STORAGE_KEY);
    localStorageRemove(BACKUP_KEY);
    localStorageRemove(LEGACY_NAMES_KEY);
    if (getNativeBridge()) {
      nativeBridgeRemove(STORAGE_KEY);
      nativeBridgeRemove(BACKUP_KEY);
      nativeBridgeRemove(LEGACY_NAMES_KEY);
    }
  }

  // --- Async Native & IndexedDB Backends ---

  function getCapacitorFilesystem() {
    const cap = window.Capacitor;
    const plugins = cap && cap.Plugins;
    if (plugins && plugins.Filesystem && typeof plugins.Filesystem.readFile === "function") {
      return plugins.Filesystem;
    }
    return null;
  }

  function getCapacitorPreferences() {
    const cap = window.Capacitor;
    const plugins = cap && cap.Plugins;
    const pref = plugins && (plugins.Preferences || plugins.Storage);
    if (pref && typeof pref.get === "function" && typeof pref.set === "function") {
      return pref;
    }
    return null;
  }

  function getCapacitorApp() {
    const cap = window.Capacitor;
    const plugins = cap && cap.Plugins;
    if (plugins && plugins.App && typeof plugins.App.addListener === "function") {
      return plugins.App;
    }
    return null;
  }

  function getCordovaFileDir() {
    if (
      window.cordova &&
      window.cordova.file &&
      window.cordova.file.dataDirectory &&
      typeof window.resolveLocalFileSystemURL === "function"
    ) {
      return window.cordova.file.dataDirectory;
    }
    return null;
  }

  function getCordovaNativeStorage() {
    if (
      window.NativeStorage &&
      typeof window.NativeStorage.getItem === "function" &&
      typeof window.NativeStorage.setItem === "function"
    ) {
      return window.NativeStorage;
    }
    return null;
  }

  function capFsRead(filePath) {
    const fs = getCapacitorFilesystem();
    if (!fs) return Promise.resolve(null);
    return Promise.resolve()
      .then(function () {
        return fs.readFile({
          path: filePath,
          directory: "DATA",
          encoding: "utf8"
        });
      })
      .then(function (res) {
        return res && typeof res.data === "string" ? res.data : null;
      })
      .catch(function () {
        return null;
      });
  }

  function capFsWrite(filePath, content) {
    const fs = getCapacitorFilesystem();
    if (!fs || typeof fs.writeFile !== "function") return Promise.resolve(false);
    return Promise.resolve()
      .then(function () {
        return fs.writeFile({
          path: filePath,
          data: content,
          directory: "DATA",
          encoding: "utf8",
          recursive: true
        });
      })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function capFsDelete(filePath) {
    const fs = getCapacitorFilesystem();
    if (!fs || typeof fs.deleteFile !== "function") return Promise.resolve();
    return Promise.resolve()
      .then(function () {
        return fs.deleteFile({
          path: filePath,
          directory: "DATA"
        });
      })
      .catch(function () { });
  }

  function capPrefRead(key) {
    const pref = getCapacitorPreferences();
    if (!pref) return Promise.resolve(null);
    return Promise.resolve()
      .then(function () {
        return pref.get({ key: key });
      })
      .then(function (res) {
        return res && typeof res.value === "string" ? res.value : null;
      })
      .catch(function () {
        return null;
      });
  }

  function capPrefWrite(key, value) {
    const pref = getCapacitorPreferences();
    if (!pref) return Promise.resolve(false);
    return Promise.resolve()
      .then(function () {
        return pref.set({ key: key, value: value });
      })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function capPrefRemove(key) {
    const pref = getCapacitorPreferences();
    if (!pref || typeof pref.remove !== "function") return Promise.resolve();
    return Promise.resolve()
      .then(function () {
        return pref.remove({ key: key });
      })
      .catch(function () { });
  }

  function cordovaNativeRead(key) {
    const ns = getCordovaNativeStorage();
    if (!ns) return Promise.resolve(null);
    return new Promise(function (resolve) {
      try {
        ns.getItem(
          key,
          function (val) {
            resolve(typeof val === "string" ? val : null);
          },
          function () {
            resolve(null);
          }
        );
      } catch (_) {
        resolve(null);
      }
    });
  }

  function cordovaNativeWrite(key, value) {
    const ns = getCordovaNativeStorage();
    if (!ns) return Promise.resolve(false);
    return new Promise(function (resolve) {
      try {
        ns.setItem(
          key,
          value,
          function () {
            resolve(true);
          },
          function () {
            resolve(false);
          }
        );
      } catch (_) {
        resolve(false);
      }
    });
  }

  function cordovaNativeRemove(key) {
    const ns = getCordovaNativeStorage();
    if (!ns || typeof ns.remove !== "function") return Promise.resolve();
    return new Promise(function (resolve) {
      try {
        ns.remove(key, resolve, resolve);
      } catch (_) {
        resolve();
      }
    });
  }

  function cordovaFileRead(fileName) {
    const dir = getCordovaFileDir();
    if (!dir) return Promise.resolve(null);
    return new Promise(function (resolve) {
      try {
        window.resolveLocalFileSystemURL(
          dir + fileName,
          function (fileEntry) {
            fileEntry.file(
              function (file) {
                const reader = new FileReader();
                reader.onloadend = function () {
                  resolve(typeof reader.result === "string" ? reader.result : null);
                };
                reader.onerror = function () {
                  resolve(null);
                };
                reader.readAsText(file);
              },
              function () {
                resolve(null);
              }
            );
          },
          function () {
            resolve(null);
          }
        );
      } catch (_) {
        resolve(null);
      }
    });
  }

  function cordovaFileWrite(fileName, content) {
    const dir = getCordovaFileDir();
    if (!dir) return Promise.resolve(false);
    return new Promise(function (resolve) {
      try {
        window.resolveLocalFileSystemURL(
          dir,
          function (dirEntry) {
            dirEntry.getFile(
              fileName,
              { create: true, exclusive: false },
              function (fileEntry) {
                fileEntry.createWriter(
                  function (writer) {
                    writer.onwriteend = function () {
                      resolve(true);
                    };
                    writer.onerror = function () {
                      resolve(false);
                    };
                    const blob = new Blob([content], { type: "application/json" });
                    writer.write(blob);
                  },
                  function () {
                    resolve(false);
                  }
                );
              },
              function () {
                resolve(false);
              }
            );
          },
          function () {
            resolve(false);
          }
        );
      } catch (_) {
        resolve(false);
      }
    });
  }

  function cordovaFileDelete(fileName) {
    const dir = getCordovaFileDir();
    if (!dir) return Promise.resolve();
    return new Promise(function (resolve) {
      try {
        window.resolveLocalFileSystemURL(
          dir + fileName,
          function (fileEntry) {
            fileEntry.remove(resolve, resolve);
          },
          resolve
        );
      } catch (_) {
        resolve();
      }
    });
  }

  // IndexedDB wrapper with timeout protection so sluggish Android WebViews never hang boot
  function withIdbStore(mode, fn) {
    if (!window.indexedDB) {
      return Promise.resolve(null);
    }
    return new Promise(function (resolve) {
      let settled = false;
      const timer = window.setTimeout(function () {
        if (!settled) {
          settled = true;
          resolve(null);
        }
      }, IDB_TIMEOUT_MS);

      function done(val) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(val);
      }

      try {
        const req = window.indexedDB.open(IDB_DB_NAME, 1);
        req.onupgradeneeded = function (e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
            db.createObjectStore(IDB_STORE_NAME);
          }
        };
        req.onerror = function () {
          done(null);
        };
        req.onblocked = function () {
          done(null);
        };
        req.onsuccess = function (e) {
          const db = e.target.result;
          try {
            const tx = db.transaction(IDB_STORE_NAME, mode);
            const store = tx.objectStore(IDB_STORE_NAME);
            fn(store, tx, db, done);
          } catch (_) {
            try {
              db.close();
            } catch (__) { }
            done(null);
          }
        };
      } catch (_) {
        done(null);
      }
    });
  }

  function idbRead(key) {
    return withIdbStore("readonly", function (store, _tx, db, done) {
      const req = store.get(key);
      req.onsuccess = function () {
        const val = typeof req.result === "string" ? req.result : null;
        try {
          db.close();
        } catch (_) { }
        done(val);
      };
      req.onerror = function () {
        try {
          db.close();
        } catch (_) { }
        done(null);
      };
    });
  }

  function idbWritePair(primaryStr, backupStr) {
    return withIdbStore("readwrite", function (store, tx, db, done) {
      store.put(primaryStr, STORAGE_KEY);
      store.put(backupStr, BACKUP_KEY);
      tx.oncomplete = function () {
        try {
          db.close();
        } catch (_) { }
        done(true);
      };
      tx.onerror = function () {
        try {
          db.close();
        } catch (_) { }
        done(false);
      };
      tx.onabort = function () {
        try {
          db.close();
        } catch (_) { }
        done(false);
      };
    });
  }

  function idbClearAll() {
    return withIdbStore("readwrite", function (store, tx, db, done) {
      store.delete(STORAGE_KEY);
      store.delete(BACKUP_KEY);
      tx.oncomplete = function () {
        try {
          db.close();
        } catch (_) { }
        done(true);
      };
      tx.onerror = function () {
        try {
          db.close();
        } catch (_) { }
        done(false);
      };
    });
  }

  function requestPersistentStorage() {
    try {
      if (navigator.storage && typeof navigator.storage.persist === "function") {
        navigator.storage.persist().catch(function () { });
      }
    } catch (_) { }
  }

  function readAllAsyncCandidates() {
    const tasks = [
      idbRead(STORAGE_KEY),
      idbRead(BACKUP_KEY),
      capFsRead(CAP_PRIMARY_FILE),
      capFsRead(CAP_BACKUP_FILE),
      capPrefRead(STORAGE_KEY),
      capPrefRead(BACKUP_KEY),
      cordovaNativeRead(STORAGE_KEY),
      cordovaNativeRead(BACKUP_KEY),
      cordovaFileRead(CORDOVA_PRIMARY_FILE),
      cordovaFileRead(CORDOVA_BACKUP_FILE)
    ];

    return Promise.all(tasks).then(function (results) {
      let best = null;
      for (let i = 0; i < results.length; i++) {
        const env = parseAndValidate(results[i]);
        if (isNewerEnvelope(env, best)) {
          best = env;
        }
      }
      return best;
    });
  }

  function writeAllAsyncBackends(primaryStr, backupStr) {
    const writes = [idbWritePair(primaryStr, backupStr)];

    if (getCapacitorFilesystem()) {
      writes.push(
        capFsWrite(CAP_PRIMARY_FILE, primaryStr).then(function () {
          return capFsWrite(CAP_BACKUP_FILE, backupStr);
        })
      );
    }
    if (getCapacitorPreferences()) {
      writes.push(
        capPrefWrite(STORAGE_KEY, primaryStr).then(function () {
          return capPrefWrite(BACKUP_KEY, backupStr);
        })
      );
    }
    if (getCordovaNativeStorage()) {
      writes.push(
        cordovaNativeWrite(STORAGE_KEY, primaryStr).then(function () {
          return cordovaNativeWrite(BACKUP_KEY, backupStr);
        })
      );
    }
    if (getCordovaFileDir()) {
      writes.push(
        cordovaFileWrite(CORDOVA_PRIMARY_FILE, primaryStr).then(function () {
          return cordovaFileWrite(CORDOVA_BACKUP_FILE, backupStr);
        })
      );
    }

    return Promise.all(writes);
  }

  function enqueueAsyncWrite(primaryStr, backupStr) {
    pendingAsyncPair = { primary: primaryStr, backup: backupStr };
    if (asyncWriteInFlight) return;

    function drain() {
      if (!pendingAsyncPair) {
        asyncWriteInFlight = false;
        return;
      }
      const next = pendingAsyncPair;
      pendingAsyncPair = null;
      asyncWriteInFlight = true;
      writeAllAsyncBackends(next.primary, next.backup)
        .then(drain)
        .catch(drain);
    }

    drain();
  }

  // --- Core Game State Bridge ---

  function collectGameState() {
    const currencies =
      window.GameCurrencies && typeof window.GameCurrencies.exportState === "function"
        ? window.GameCurrencies.exportState()
        : { credits: 0, ore: 0 };
    const research =
      window.GameResearch && typeof window.GameResearch.exportState === "function"
        ? window.GameResearch.exportState()
        : { points: 0, researched: [] };
    const planets =
      window.GamePlanets && typeof window.GamePlanets.exportState === "function"
        ? window.GamePlanets.exportState()
        : null;
    return {
      currencies: currencies,
      research: research,
      planets: planets
    };
  }

  function hydrateFromEnvelope(env, applyOffline) {
    if (!env || !env.data) return;
    isHydrating = true;
    try {
      currentRevision = Math.max(currentRevision, Number(env.revision) || 0);
      lastSavedAt = Number(env.savedAt) || Date.now();
      const elapsedMs = Math.max(0, Date.now() - lastSavedAt);

      // Hydrate Currencies & Research BEFORE Planets so bonuses/multipliers are active when cloning citizen caps
      if (window.GameCurrencies && typeof window.GameCurrencies.importState === "function") {
        window.GameCurrencies.importState(env.data.currencies);
      }
      if (window.GameResearch && typeof window.GameResearch.importState === "function") {
        window.GameResearch.importState(env.data.research);
      }

      let landedCount = 0;
      if (window.GamePlanets && typeof window.GamePlanets.importState === "function") {
        const res = window.GamePlanets.importState(env.data.planets, elapsedMs);
        if (res && res.landedCount > 0) {
          landedCount = res.landedCount;
        }
      }

      if (applyOffline && window.GamePlanets && typeof window.GamePlanets.applyOfflineProgress === "function") {
        window.GamePlanets.applyOfflineProgress(elapsedMs / 1000, landedCount);
      }
    } finally {
      isHydrating = false;
    }
  }

  function saveNow(reason, forceImmediateWrite) {
    if (isHydrating) return false;
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
      debounceTimer = 0;
    }

    if (reason && MUTATING_REASONS[reason]) {
      hasUserMutatedSinceBoot = true;
    }

    const data = collectGameState();
    const env = createEnvelope(data, true);
    currentRevision = env.revision;
    lastSavedAt = env.savedAt;
    bestSyncEnvelope = env;

    const str = JSON.stringify(env);
    writeSyncBackends(str, str);

    if (asyncReady) {
      enqueueAsyncWrite(str, str);
    } else if (forceImmediateWrite !== false) {
      dirtyWhileBooting = true;
    }

    return true;
  }

  function requestSave(reason, immediate) {
    if (!booted || isHydrating) return;
    if (reason && MUTATING_REASONS[reason]) {
      hasUserMutatedSinceBoot = true;
    }
    if (!asyncReady) {
      dirtyWhileBooting = true;
    }

    if (immediate) {
      saveNow(reason, true);
      return;
    }

    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
    const debounceMs = readConfigNumber("save.debounceMs", 500);
    debounceTimer = window.setTimeout(function () {
      debounceTimer = 0;
      saveNow(reason || "debounced", true);
    }, debounceMs);
  }

  // --- Mobile & Page Lifecycle Hooks ---

  function onAppBackground() {
    if (!booted || isHydrating) return;
    if (!hiddenAt) {
      hiddenAt = Date.now();
    }
    if (window.GamePlanets && typeof window.GamePlanets.onBackground === "function") {
      window.GamePlanets.onBackground();
    }
    saveNow("lifecycle_background", true);
  }

  function onAppForeground() {
    if (!booted || isHydrating) return;
    if (!hiddenAt) {
      if (window.GamePlanets && typeof window.GamePlanets.resetFrameClock === "function") {
        window.GamePlanets.resetFrameClock();
      }
      if (window.GameCurrencies && typeof window.GameCurrencies.resetTickClock === "function") {
        window.GameCurrencies.resetTickClock();
      }
      return;
    }

    const prevHiddenAt = hiddenAt;
    hiddenAt = 0;
    const awaySec = Math.max(0, (Date.now() - prevHiddenAt) / 1000);

    if (window.GameCurrencies && typeof window.GameCurrencies.resetTickClock === "function") {
      window.GameCurrencies.resetTickClock();
    }
    if (window.GamePlanets && typeof window.GamePlanets.resetFrameClock === "function") {
      window.GamePlanets.resetFrameClock();
    }

    if (window.GamePlanets && typeof window.GamePlanets.applyOfflineProgress === "function") {
      window.GamePlanets.applyOfflineProgress(awaySec, 0);
    }

    saveNow("lifecycle_foreground", true);
  }

  function bindLifecycleListeners() {
    if (lifecycleBound) return;
    lifecycleBound = true;

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        onAppBackground();
      } else if (document.visibilityState === "visible") {
        onAppForeground();
      }
    });

    window.addEventListener("pagehide", onAppBackground);
    window.addEventListener("pageshow", function (e) {
      if (e && e.persisted) {
        onAppForeground();
      }
    });
    document.addEventListener("freeze", onAppBackground);
    document.addEventListener("resume", onAppForeground);
    document.addEventListener("pause", onAppBackground);
    window.addEventListener("blur", function () {
      if (booted && !isHydrating) {
        saveNow("window_blur", true);
      }
    });
    window.addEventListener("beforeunload", onAppBackground);

    // Capacitor Android native app lifecycle integration (for Google Play .aab builds)
    const capApp = getCapacitorApp();
    if (capApp) {
      try {
        capApp.addListener("appStateChange", function (state) {
          if (state && state.isActive === false) {
            onAppBackground();
          } else if (state && state.isActive === true) {
            onAppForeground();
          }
        });
      } catch (_) { }
      try {
        capApp.addListener("pause", onAppBackground);
        capApp.addListener("resume", onAppForeground);
      } catch (_) { }
    }

    // Cordova deviceready recovery in case native filesystem/plugins initialize asynchronously after DOMContentLoaded
    document.addEventListener("deviceready", function () {
      if (cordovaResynced) return;
      cordovaResynced = true;
      hydrateFromAsyncBackends();
    });
  }

  function hydrateFromAsyncBackends() {
    return readAllAsyncCandidates()
      .then(function (bestAsyncEnv) {
        asyncReady = true;

        if (!hasUserMutatedSinceBoot && !dirtyWhileBooting && isNewerEnvelope(bestAsyncEnv, bestSyncEnvelope)) {
          hydrateFromEnvelope(bestAsyncEnv, true);
          bestSyncEnvelope = bestAsyncEnv;
          const mirrorStr = JSON.stringify(bestAsyncEnv);
          writeSyncBackends(mirrorStr, mirrorStr);
          enqueueAsyncWrite(mirrorStr, mirrorStr);
          return;
        }

        if (dirtyWhileBooting || hasUserMutatedSinceBoot) {
          dirtyWhileBooting = false;
          saveNow("post_boot_flush", true);
          return;
        }

        if (bestSyncEnvelope && !isNewerEnvelope(bestAsyncEnv, bestSyncEnvelope)) {
          // Sync storage was newer or async was empty: mirror current state into async backends
          const str = JSON.stringify(bestSyncEnvelope);
          enqueueAsyncWrite(str, str);
        }
      })
      .catch(function () {
        asyncReady = true;
        if (dirtyWhileBooting) {
          dirtyWhileBooting = false;
          saveNow("post_boot_flush", true);
        }
      });
  }

  function boot() {
    if (booted) return;
    booted = true;

    requestPersistentStorage();
    bindLifecycleListeners();

    bestSyncEnvelope = readAllSyncCandidates();
    if (bestSyncEnvelope) {
      hydrateFromEnvelope(bestSyncEnvelope, true);
    }

    const autosaveMs = readConfigNumber("save.autosaveIntervalMs", 10000);
    if (autosaveTimer) {
      window.clearInterval(autosaveTimer);
    }
    autosaveTimer = window.setInterval(function () {
      if (booted && !isHydrating && document.visibilityState !== "hidden") {
        saveNow("autosave", true);
      }
    }, autosaveMs);

    hydrateFromAsyncBackends();
  }

  // --- Portable Save String Export / Import & Progress Reset ---

  function exportSaveString() {
    const env = createEnvelope(collectGameState(), false);
    const json = JSON.stringify(env);
    return EXPORT_PREFIX + utf8ToBase64(json);
  }

  function importSaveString(rawString) {
    if (typeof rawString !== "string") return false;
    let payload = rawString.trim();
    if (payload.indexOf(EXPORT_PREFIX) === 0) {
      try {
        payload = base64ToUtf8(payload.slice(EXPORT_PREFIX.length));
      } catch (_) {
        return false;
      }
    }
    const env = parseAndValidate(payload);
    if (!env) return false;

    env.revision = Math.max(currentRevision + 1, env.revision);
    env.savedAt = Date.now();
    hasUserMutatedSinceBoot = true;
    hydrateFromEnvelope(env, false);
    saveNow("import_string", true);
    return true;
  }

  function resetProgress() {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
      debounceTimer = 0;
    }

    isHydrating = true;
    try {
      currentRevision = 0;
      lastSavedAt = 0;
      hiddenAt = 0;
      bestSyncEnvelope = null;
      pendingAsyncPair = null;
      dirtyWhileBooting = false;
      hasUserMutatedSinceBoot = true;

      clearSyncBackends();
      idbClearAll();
      capFsDelete(CAP_PRIMARY_FILE);
      capFsDelete(CAP_BACKUP_FILE);
      capPrefRemove(STORAGE_KEY);
      capPrefRemove(BACKUP_KEY);
      cordovaNativeRemove(STORAGE_KEY);
      cordovaNativeRemove(BACKUP_KEY);
      cordovaFileDelete(CORDOVA_PRIMARY_FILE);
      cordovaFileDelete(CORDOVA_BACKUP_FILE);

      if (window.GameCurrencies && typeof window.GameCurrencies.resetState === "function") {
        window.GameCurrencies.resetState();
      }
      if (window.GameResearch && typeof window.GameResearch.resetState === "function") {
        window.GameResearch.resetState();
      }
      if (window.GamePlanets && typeof window.GamePlanets.resetState === "function") {
        window.GamePlanets.resetState();
      }
    } finally {
      isHydrating = false;
    }
    return true;
  }

  function getStatus() {
    return {
      booted: booted,
      asyncReady: asyncReady,
      revision: currentRevision,
      lastSavedAt: lastSavedAt,
      backends: {
        localStorage: Boolean(getLocalStorageSafe()),
        indexedDB: Boolean(window.indexedDB),
        androidBridge: Boolean(getNativeBridge()),
        capacitorFilesystem: Boolean(getCapacitorFilesystem()),
        capacitorPreferences: Boolean(getCapacitorPreferences()),
        capacitorAppLifecycle: Boolean(getCapacitorApp()),
        cordovaFile: Boolean(getCordovaFileDir()),
        cordovaNativeStorage: Boolean(getCordovaNativeStorage())
      }
    };
  }

  window.GameSave = {
    boot: boot,
    saveNow: function (reason) {
      return saveNow(reason || "manual", true);
    },
    requestSave: requestSave,
    exportSaveString: exportSaveString,
    importSaveString: importSaveString,
    resetProgress: resetProgress,
    getStatus: getStatus,
    getLastSavedAt: function () {
      return lastSavedAt;
    }
  };
})();
