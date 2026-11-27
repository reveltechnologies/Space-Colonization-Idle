# Build

## Prerequisites
1. Python 3
2. JDK 17+ (`JAVA_HOME` configured or installed in a standard system location)
3. Android SDK (`ANDROID_HOME` / `ANDROID_SDK_ROOT` configured, or installed in `%LOCALAPPDATA%\Android\Sdk` / `~/Android/Sdk`)
4. Release signing credentials in `build/`:
   - `spacecolonizationidle.keystore`
   - `spacecolonizationidle.properties`:
     ```properties
     KEYSTORE_FILE=spacecolonizationidle.keystore
     KEYSTORE_PASSWORD=your_password_here
     KEY_ALIAS=spacecolonization
     KEY_PASSWORD=your_password_here
     ```

## How to Build
Run from the repository root:
```bash
python build/build_release_aab.py
```

The script syncs `src/` into `build/android/app/src/main/assets/public/`, builds a Google Play-compliant release Android App Bundle via Gradle (`bundleRelease`), and copies the signed bundle to:

`build/release/app-release.aab`
