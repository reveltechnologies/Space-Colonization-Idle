# Build

## What You Need
1. Python 3
2. Put `spacecolonizationidle.keystore` and `spacecolonizationidle.properties` in this folder:
   ```properties
   KEYSTORE_FILE=spacecolonizationidle.keystore
   KEYSTORE_PASSWORD=your_password_here
   KEY_ALIAS=spacecolonization
   KEY_PASSWORD=your_password_here
   ```

## How to Build
Run:
```bash
python build/build_release_aab.py
```

The output file will be at `build/release/app-release.aab`.
