# Build

## Prerequisites
1. Python 3
2. JDK 17+ (`JAVA_HOME` configured or installed in a standard system location)
3. Android SDK (`ANDROID_HOME` / `ANDROID_SDK_ROOT` configured, or installed in `%LOCALAPPDATA%\Android\Sdk` / `~/Android/Sdk`)
4. Gradle 8.x (on `PATH`, or cached under `~/.gradle/wrapper/dists/gradle-8.14*`)
5. Release signing credentials in `build/`:
   - `spacecolonizationidle.keystore`
   - `spacecolonizationidle.properties`:
     ```properties
     KEYSTORE_FILE=spacecolonizationidle.keystore
     KEYSTORE_PASSWORD=your_password_here
     KEY_ALIAS=spacecolonization
     KEY_PASSWORD=your_password_here
     ```

## How It Works & How to Build
The tracked Android wrapper source code lives in `src/android/` and version metadata is read from `src/manifest.json`.

Run from the repository root:
```bash
python build/build_release_aab.py
```

The script automatically materializes the gitignored `build/android/` workspace from `src/android/`, generates legacy launcher PNG mipmaps, syncs web assets from `src/` (excluding `src/android/`), compiles a Google Play-compliant signed Android App Bundle via Gradle (`bundleRelease`), and copies the output to:

`build/release/app-release.aab`
