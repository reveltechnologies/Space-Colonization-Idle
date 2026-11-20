# Space Colonization: Idle

A mobile-first HTML5 idle strategy game designed for landscape mode and Google Play release (.aab).

## Development

All game code is in `src/`. Open `src/index.html` in a browser or serve it with any local static server.

## Local Save System & Google Play (`.aab`)

`src/js/save.js` (`window.GameSave`) automatically persists all colony currencies, planets, buildings, trade rocket states, in-flight rockets, and research progress locally across redundant storage layers with checksum validation and offline idle progression (up to 24h):

- **Capacitor `.aab`**: Install `@capacitor/filesystem` and/or `@capacitor/preferences` and `@capacitor/app` — saves write atomically to Android `Directory.DATA` (`Context.getFilesDir()`, no runtime storage permissions required, survives WebView cache clear and Play Store updates, backed up by Android Auto Backup when `android:allowBackup="true"`).
- **Cordova `.aab`**: Supports `cordova-plugin-file` (`cordova.file.dataDirectory`) and `cordova-plugin-nativestorage`, including delayed `deviceready` hydration.
- **TWA / PWA `.aab`**: Persists in `IndexedDB` (`sci_save_db`) + `localStorage` and automatically requests `navigator.storage.persist()` to prevent eviction.
- **Custom Android WebView `.aab`**: Exposing a `@JavascriptInterface` named `window.AndroidSave` (or `SpaceColonyStorage` / `AndroidStorage`) with `save(key, json)` and `load(key)` methods is detected automatically for direct native `SharedPreferences` / file persistence.

## License

GPLv3 only. See [LICENSE](LICENSE).
