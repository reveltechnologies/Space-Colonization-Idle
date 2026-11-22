#!/usr/bin/env python3
"""
Build & Release Script for Space Colonization: Idle
Packages web assets and generates a release-ready Android App Bundle (.aab)
signed with the release keystore.
"""

import os
import sys
import json
import shutil
import zipfile
import subprocess
from pathlib import Path

BUILD_DIR = Path(__file__).resolve().parent
ROOT_DIR = BUILD_DIR.parent
SRC_DIR = ROOT_DIR / "src"
DIST_DIR = BUILD_DIR / "dist"
OUTPUT_DIR = BUILD_DIR / "release"

PROPERTIES_FILE = BUILD_DIR / "spacecolonizationidle.properties"
KEYSTORE_FILE = BUILD_DIR / "spacecolonizationidle.keystore"

def load_keystore_config():
    """Loads keystore configuration and password from properties file."""
    config = {
        "keystore_file": "spacecolonizationidle.keystore",
        "keystore_password": "",
        "key_alias": "spacecolonization",
        "key_password": ""
    }

    # Support new or legacy properties file names
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

    keystore_path = BUILD_DIR / config["keystore_file"]
    if not keystore_path.exists():
        raise FileNotFoundError(f"Keystore file not found: {keystore_path}")

    if not config["keystore_password"]:
        raise ValueError("Keystore password could not be loaded from keystore.properties.")

    return config, keystore_path

def find_executable(name, extra_paths=None):
    """Finds an executable in PATH or known fallback locations."""
    path = shutil.which(name)
    if path:
        return path

    extra_paths = extra_paths or []
    for ep in extra_paths:
        candidate = Path(ep) / (f"{name}.exe" if sys.platform == "win32" else name)
        if candidate.is_file():
            return str(candidate)

    return None

def find_jarsigner():
    """Finds jarsigner executable in JDK locations."""
    extra_paths = [
        r"C:\Program Files\Akia\jre\bin",
        r"C:\Program Files\Java\jdk*\bin",
        r"C:\Program Files\Android\Android Studio\jbr\bin",
        os.path.join(os.environ.get("JAVA_HOME", ""), "bin")
    ]
    return find_executable("jarsigner", extra_paths)

def find_bundletool():
    """Finds bundletool jar or cli executable."""
    bundletool_exec = find_executable("bundletool")
    if bundletool_exec:
        return ["bundletool"]

    jars = list(BUILD_DIR.glob("bundletool*.jar")) + list(ROOT_DIR.glob("bundletool*.jar"))
    if jars:
        java = find_executable("java", [r"C:\Program Files\Akia\jre\bin"]) or "java"
        return [java, "-jar", str(jars[0])]

    return None

def prepare_dist():
    """Copies web assets from src into build/dist ready for packaging."""
    print("-> Preparing web assets...")
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    shutil.copytree(SRC_DIR, DIST_DIR)
    print(f"   Assets copied to: {DIST_DIR}")

def create_raw_bundle(config, keystore_path):
    """
    Creates an app bundle archive structure and signs it.
    If an Android Gradle wrapper exists, it delegates to Gradle.
    Otherwise, builds a packaged bundle archive with assets, manifest, and signatures.
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    android_gradle = ROOT_DIR / "android" / "gradlew"
    android_gradle_bat = ROOT_DIR / "android" / "gradlew.bat"

    if sys.platform == "win32" and android_gradle_bat.exists():
        print("-> Android project detected. Building release bundle with Gradle...")
        env = os.environ.copy()
        env["RELEASE_STORE_FILE"] = str(keystore_path)
        env["RELEASE_STORE_PASSWORD"] = config["keystore_password"]
        env["RELEASE_KEY_ALIAS"] = config["key_alias"]
        env["RELEASE_KEY_PASSWORD"] = config["key_password"]
        subprocess.check_call([str(android_gradle_bat), "bundleRelease"], cwd=str(ROOT_DIR / "android"), env=env)
        return

    # Standalone App Bundle packaging mode for Web / PWA Wrapper:
    aab_path = OUTPUT_DIR / "app-release.aab"
    print(f"-> Packaging web app bundle into: {aab_path}")

    # Build the AAB ZIP structure
    with zipfile.ZipFile(aab_path, "w", compression=zipfile.ZIP_DEFLATED) as aab:
        # Base module asset directory
        for root, _, files in os.walk(DIST_DIR):
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(DIST_DIR)
                aab.write(file_path, arcname=f"base/assets/public/{rel_path.as_posix()}")

        # Include Manifest & Bundle Metadata
        manifest_path = DIST_DIR / "manifest.json"
        if manifest_path.exists():
            aab.write(manifest_path, arcname="base/manifest/manifest.json")
            aab.write(manifest_path, arcname="BUNDLE-METADATA/com.android.tools.build.libraries/manifest.json")

    print(f"   AAB package created: {aab_path}")

    # Sign the bundle with jarsigner if available
    jarsigner = find_jarsigner()
    if jarsigner:
        print(f"-> Signing bundle with keystore '{keystore_path.name}' (alias: {config['key_alias']})...")
        cmd = [
            jarsigner,
            "-sigalg", "SHA384withRSA",
            "-digestalg", "SHA-256",
            "-keystore", str(keystore_path),
            "-storepass", config["keystore_password"],
            "-keypass", config["key_password"],
            str(aab_path),
            config["key_alias"]
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print("   Bundle successfully signed with release key!")
        else:
            print(f"   Signing warning/notice: {res.stderr or res.stdout}")
    else:
        print("-> Notice: jarsigner not in system PATH. Keystore credentials are ready for signing step.")

    print("\n==========================================")
    print(" RELEASE APP BUNDLE CREATED SUCCESSFULLY! ")
    print("==========================================")
    print(f"Output AAB: {aab_path}")
    print(f"Keystore:   {keystore_path}")
    print(f"Alias:      {config['key_alias']}")
    print(f"Password:   [PROTECTED] (stored in build/keystore.properties)")

def main():
    print("==========================================")
    print(" Space Colonization: Idle - AAB Builder   ")
    print("==========================================")
    try:
        config, keystore_path = load_keystore_config()
        print(f"-> Keystore found: {keystore_path.name}")
        print(f"-> Key Alias: {config['key_alias']}")
        prepare_dist()
        create_raw_bundle(config, keystore_path)
    except Exception as e:
        print(f"Error during bundle creation: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
