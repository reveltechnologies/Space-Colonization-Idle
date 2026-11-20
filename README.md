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

## Reset Cheat & Testing

To reset your entire game progress as if you are a completely new player (to experience the opening story cinematic and initial crash landing again):
- On the main game screen, press **`K` 5 times** followed immediately by **`O` 5 times** within 8 seconds (case-insensitive: `K-K-K-K-K-O-O-O-O-O`).
- A confirmation dialog will pop up asking: *"Would you like to reset your progress?"*.
- Confirming will wipe all local save slots, reset currencies, research, and buildings, and immediately launch the opening cinematic intro.

## License

GPLv3 only. See [LICENSE](LICENSE).
