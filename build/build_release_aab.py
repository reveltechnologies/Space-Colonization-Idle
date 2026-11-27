#!/usr/bin/env python3
"""
Build & Release Script for Space Colonization: Idle
Packages web assets into the Android Gradle wrapper project and builds a
Google Play-compliant signed Android App Bundle (.aab).
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

BUILD_DIR = Path(__file__).resolve().parent
ROOT_DIR = BUILD_DIR.parent
SRC_DIR = ROOT_DIR / "src"
OUTPUT_DIR = BUILD_DIR / "release"
OUTPUT_AAB = OUTPUT_DIR / "app-release.aab"

PROPERTIES_FILE = BUILD_DIR / "spacecolonizationidle.properties"
APP_ID = "net.reveltechnologies.spacecolonizationidle"


def load_keystore_config():
    """Loads keystore configuration and password from properties file."""
    config = {
        "keystore_file": "spacecolonizationidle.keystore",
        "keystore_password": "",
        "key_alias": "spacecolonization",
        "key_password": "",
    }

    props_file = PROPERTIES_FILE
    if not props_file.exists():
        legacy = BUILD_DIR / "keystore.properties"
        if legacy.exists():
            props_file = legacy

    if props_file.exists():
        with open(props_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip().upper()
                    val = val.strip()
                    if key == "KEYSTORE_FILE":
                        config["keystore_file"] = val
                    elif key == "KEYSTORE_PASSWORD":
                        config["keystore_password"] = val
                    elif key == "KEY_ALIAS":
                        config["key_alias"] = val
                    elif key == "KEY_PASSWORD":
                        config["key_password"] = val

    if not config["key_password"]:
        config["key_password"] = config["keystore_password"]

    keystore_path = Path(config["keystore_file"])
    if not keystore_path.is_absolute():
        keystore_path = BUILD_DIR / keystore_path

    if not keystore_path.exists():
        raise FileNotFoundError(f"Keystore file not found: {keystore_path}")

    if not config["keystore_password"]:
        raise ValueError(
            "Keystore password could not be loaded from spacecolonizationidle.properties."
        )

    return config, keystore_path.resolve()


def find_android_project():
    """Finds the Android Gradle wrapper project directory."""
    for candidate in (BUILD_DIR / "android", ROOT_DIR / "android"):
        if (candidate / "settings.gradle").exists() or (candidate / "settings.gradle.kts").exists():
            return candidate
    raise FileNotFoundError(
        f"Android Gradle project not found in {BUILD_DIR / 'android'} or {ROOT_DIR / 'android'}."
    )


def find_android_sdk():
    """Locates an installed Android SDK directory."""
    candidates = []
    for env_var in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
        val = os.environ.get(env_var)
        if val:
            candidates.append(Path(val))

    if sys.platform == "win32":
        local_app_data = os.environ.get("LOCALAPPDATA")
        if local_app_data:
            candidates.append(Path(local_app_data) / "Android" / "Sdk")
        candidates.append(Path("C:/Android/Sdk"))
    elif sys.platform == "darwin":
        candidates.append(Path.home() / "Library" / "Android" / "sdk")
    else:
        candidates.append(Path.home() / "Android" / "Sdk")

    for sdk in candidates:
        if sdk.is_dir() and (sdk / "platforms").is_dir():
            return sdk.resolve()

    raise FileNotFoundError(
        "Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT to a valid Android SDK path."
    )


def find_java_home():
    """Locates a JDK 17+ installation directory for running Gradle and AGP."""
    candidates = []
    env_java = os.environ.get("JAVA_HOME")
    if env_java:
        candidates.append(Path(env_java))

    if sys.platform == "win32":
        candidates.extend([
            Path(r"C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"),
            Path(r"C:\Program Files\Java\jdk-17"),
            Path(r"C:\Program Files\Android\Android Studio\jbr"),
        ])
        for base in (Path(r"C:\Program Files\Eclipse Adoptium"), Path(r"C:\Program Files\Java")):
            if base.is_dir():
                for child in sorted(base.iterdir(), reverse=True):
                    if child.is_dir():
                        candidates.append(child)
    else:
        java_bin = shutil.which("java")
        if java_bin:
            candidates.append(Path(java_bin).resolve().parent.parent)

    exe_name = "java.exe" if sys.platform == "win32" else "java"
    seen = set()
    for cand in candidates:
        resolved = str(cand)
        if resolved in seen:
            continue
        seen.add(resolved)
        java_exe = cand / "bin" / exe_name
        if java_exe.is_file():
            return cand.resolve()

    return None


def sync_web_assets(android_dir):
    """Copies web assets from src/ into the Android assets/public directory."""
    assets_public = android_dir / "app" / "src" / "main" / "assets" / "public"
    print("-> Syncing web assets into Android project...")
    if assets_public.exists():
        shutil.rmtree(assets_public)
    assets_public.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(SRC_DIR, assets_public)
    print(f"   Web assets synced to: {assets_public}")


def write_local_properties(android_dir, sdk_dir):
    """Writes build/android/local.properties pointing to the detected Android SDK."""
    local_props = android_dir / "local.properties"
    sdk_line = f"sdk.dir={sdk_dir.as_posix()}\n"
    local_props.write_text(sdk_line, encoding="utf-8")
    print(f"-> Configured Android SDK: {sdk_dir}")


def build_gradle_bundle(android_dir, config, keystore_path, sdk_dir):
    """Builds the signed release .aab using the Android Gradle wrapper."""
    gradlew = android_dir / ("gradlew.bat" if sys.platform == "win32" else "gradlew")
    if not gradlew.is_file():
        raise FileNotFoundError(f"Gradle wrapper script not found: {gradlew}")

    env = os.environ.copy()
    env["ANDROID_HOME"] = str(sdk_dir)
    env["ANDROID_SDK_ROOT"] = str(sdk_dir)
    env["RELEASE_STORE_FILE"] = str(keystore_path)
    env["RELEASE_STORE_PASSWORD"] = config["keystore_password"]
    env["RELEASE_KEY_ALIAS"] = config["key_alias"]
    env["RELEASE_KEY_PASSWORD"] = config["key_password"]

    java_home = find_java_home()
    if java_home is not None:
        env["JAVA_HOME"] = str(java_home)
        env["PATH"] = f"{java_home / 'bin'}{os.pathsep}{env.get('PATH', '')}"
        print(f"-> Using JDK: {java_home}")

    print("-> Running Gradle :app:bundleRelease...")
    subprocess.check_call([str(gradlew), "bundleRelease"], cwd=str(android_dir), env=env)

    gradle_aab = android_dir / "app" / "build" / "outputs" / "bundle" / "release" / "app-release.aab"
    if not gradle_aab.is_file():
        raise FileNotFoundError(f"Expected Gradle bundle output not found: {gradle_aab}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(gradle_aab, OUTPUT_AAB)

    print("\n==========================================")
    print(" RELEASE APP BUNDLE CREATED SUCCESSFULLY! ")
    print("==========================================")
    print(f"Output AAB: {OUTPUT_AAB}")
    print(f"Package:    {APP_ID}")
    print(f"Keystore:   {keystore_path}")
    print(f"Alias:      {config['key_alias']}")
    print("Password:   [PROTECTED] (stored in build/spacecolonizationidle.properties)")


def main():
    print("==========================================")
    print(" Space Colonization: Idle - AAB Builder   ")
    print("==========================================")
    try:
        config, keystore_path = load_keystore_config()
        print(f"-> Keystore found: {keystore_path.name}")
        print(f"-> Key Alias: {config['key_alias']}")

        android_dir = find_android_project()
        sdk_dir = find_android_sdk()

        sync_web_assets(android_dir)
        write_local_properties(android_dir, sdk_dir)
        build_gradle_bundle(android_dir, config, keystore_path, sdk_dir)
    except Exception as e:
        print(f"Error during bundle creation: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
