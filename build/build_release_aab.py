#!/usr/bin/env python3
"""
Build & Release Script for Space Colonization: Idle
Bootstraps the gitignored build/android workspace from tracked src/android sources,
generates launcher mipmap PNGs, syncs web assets from src/ (excluding src/android),
and builds a Google Play-compliant signed Android App Bundle (.aab).
"""

import json
import math
import os
import shutil
import struct
import subprocess
import sys
import zlib
from pathlib import Path

BUILD_DIR = Path(__file__).resolve().parent
ROOT_DIR = BUILD_DIR.parent
SRC_DIR = ROOT_DIR / "src"
ANDROID_SRC_DIR = SRC_DIR / "android"
ANDROID_WORK_DIR = BUILD_DIR / "android"
OUTPUT_DIR = BUILD_DIR / "release"
OUTPUT_AAB = OUTPUT_DIR / "app-release.aab"

PROPERTIES_FILE = BUILD_DIR / "spacecolonizationidle.properties"
MANIFEST_FILE = SRC_DIR / "manifest.json"
APP_ID = "net.reveltechnologies.spacecolonizationidle"


def load_app_version():
    """Reads version and version_code from src/manifest.json."""
    version_name = "0.3.1-beta.1"
    version_code = 2
    if MANIFEST_FILE.is_file():
        data = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
        if isinstance(data.get("version"), str) and data["version"].strip():
            version_name = data["version"].strip()
        if data.get("version_code") is not None:
            parsed_code = int(data["version_code"])
            if parsed_code < 1:
                raise ValueError(f"version_code must be >= 1, got {parsed_code}")
            version_code = parsed_code
    return {"version": version_name, "version_code": version_code}


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
        if (cand / "bin" / exe_name).is_file():
            return cand.resolve()

    return None


def find_gradle_command(android_dir):
    """Locates gradlew or a compatible Gradle 8.x binary."""
    wrapper_name = "gradlew.bat" if sys.platform == "win32" else "gradlew"
    wrapper_path = android_dir / wrapper_name
    if wrapper_path.is_file():
        return str(wrapper_path)

    on_path = shutil.which("gradle")
    if on_path:
        return on_path

    gradle_exe = "gradle.bat" if sys.platform == "win32" else "gradle"
    dists_dir = Path.home() / ".gradle" / "wrapper" / "dists"
    if dists_dir.is_dir():
        for pattern in ("gradle-8.14*", "gradle-8.*"):
            for dist in sorted(dists_dir.glob(pattern), reverse=True):
                for candidate in dist.rglob(gradle_exe):
                    if candidate.parent.name == "bin" and candidate.is_file():
                        return str(candidate.resolve())

    raise FileNotFoundError(
        "Gradle executable not found. Install Gradle 8.x on PATH or initialize the Gradle wrapper."
    )


def sync_android_wrapper():
    """Copies tracked src/android/ wrapper sources into gitignored build/android/."""
    if not ANDROID_SRC_DIR.is_dir():
        raise FileNotFoundError(f"Tracked Android wrapper directory not found: {ANDROID_SRC_DIR}")

    print("-> Syncing Android wrapper sources from src/android/...")
    ANDROID_WORK_DIR.mkdir(parents=True, exist_ok=True)

    # Clear Java & XML source trees in build/android so deleted/renamed sources never linger
    java_dir = ANDROID_WORK_DIR / "app" / "src" / "main" / "java"
    if java_dir.exists():
        shutil.rmtree(java_dir)
    res_dir = ANDROID_WORK_DIR / "app" / "src" / "main" / "res"
    if res_dir.exists():
        shutil.rmtree(res_dir)

    shutil.copytree(ANDROID_SRC_DIR, ANDROID_WORK_DIR, dirs_exist_ok=True)
    print(f"   Android workspace ready at: {ANDROID_WORK_DIR}")


def _write_png(path, width, height, rgba_bytes):
    """Encodes raw RGBA bytes into a valid PNG file using only Python stdlib."""
    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + rgba_bytes[y * width * 4 : (y + 1) * width * 4] for y in range(height))
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def _blend_rgba(dst, src):
    sa = src[3] / 255.0
    da = dst[3] / 255.0
    oa = sa + da * (1.0 - sa)
    if oa <= 0.0:
        return (0, 0, 0, 0)
    r = (src[0] * sa + dst[0] * da * (1.0 - sa)) / oa
    g = (src[1] * sa + dst[1] * da * (1.0 - sa)) / oa
    b = (src[2] * sa + dst[2] * da * (1.0 - sa)) / oa
    return (int(round(r)), int(round(g)), int(round(b)), int(round(oa * 255.0)))


def _sample_icon_pixel(u, v, is_round):
    dx = u - 0.5
    dy = v - 0.5
    if is_round:
        if dx * dx + dy * dy > 0.48 * 0.48:
            return (0, 0, 0, 0)
    else:
        ax = max(abs(dx) - 0.28, 0.0)
        ay = max(abs(dy) - 0.28, 0.0)
        if abs(dx) > 0.48 or abs(dy) > 0.48 or (ax * ax + ay * ay > 0.20 * 0.20):
            return (0, 0, 0, 0)

    col = (6, 9, 19, 255)
    dist = math.hypot(dx, dy)
    if dist < 0.44:
        col = _blend_rgba(col, (17, 27, 54, 255))
    if dist < 0.34:
        col = _blend_rgba(col, (203, 213, 225, 72))

    r_planet = 0.285
    if dist < r_planet:
        p = (166, 183, 206, 255)
        if dy < -0.14 + 0.03 * math.sin((u - 0.5) * 14.0):
            p = (228, 242, 254, 255)
        if math.hypot(u - 0.39, v - 0.49) < 0.058:
            p = (100, 116, 139, 255)
        elif math.hypot(u - 0.60, v - 0.58) < 0.075:
            p = (100, 116, 139, 255)
        elif math.hypot(u - 0.48, v - 0.67) < 0.042:
            p = (100, 116, 139, 255)
        if math.hypot(u - 0.44, v - 0.44) > 0.265 and (dx + dy) > 0.04:
            p = _blend_rgba(p, (91, 108, 136, 145))
        if 0.195 < dist < 0.23 and dx < -0.02 and dy < -0.02:
            p = _blend_rgba(p, (255, 255, 255, 200))
        col = _blend_rgba(col, p)

    if r_planet - 0.022 <= dist <= r_planet + 0.018:
        col = _blend_rgba(col, (27, 17, 71, 255))

    sx = abs(u - 0.76)
    sy = abs(v - 0.24)
    if (sx < 0.085 and sy < 0.085) and (sx * 0.35 + sy < 0.042 or sy * 0.35 + sx < 0.042):
        col = _blend_rgba(col, (255, 255, 255, 255))

    return col


def _render_icon(size, is_round):
    buf = bytearray(size * size * 4)
    offsets = (0.25, 0.75)
    idx = 0
    for y in range(size):
        for x in range(size):
            r = g = b = a = 0
            for oy in offsets:
                for ox in offsets:
                    pr, pg, pb, pa = _sample_icon_pixel((x + ox) / size, (y + oy) / size, is_round)
                    r += pr
                    g += pg
                    b += pb
                    a += pa
            buf[idx] = r >> 2
            buf[idx + 1] = g >> 2
            buf[idx + 2] = b >> 2
            buf[idx + 3] = a >> 2
            idx += 4
    return bytes(buf)


def generate_launcher_mipmaps(android_dir):
    """Generates legacy PNG launcher mipmaps inside build/android/app/src/main/res."""
    print("-> Generating launcher PNG mipmaps...")
    res_dir = android_dir / "app" / "src" / "main" / "res"
    densities = [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]
    for density, size in densities:
        _write_png(res_dir / f"mipmap-{density}" / "ic_launcher.png", size, size, _render_icon(size, False))
        _write_png(res_dir / f"mipmap-{density}" / "ic_launcher_round.png", size, size, _render_icon(size, True))


def sync_web_assets(android_dir):
    """Copies web assets from src/ into Android assets/public/, excluding src/android/."""
    assets_public = android_dir / "app" / "src" / "main" / "assets" / "public"
    print("-> Syncing web assets into Android project...")
    if assets_public.exists():
        shutil.rmtree(assets_public)
    assets_public.parent.mkdir(parents=True, exist_ok=True)

    src_resolved = SRC_DIR.resolve()

    def ignore_android_source(directory, names):
        if Path(directory).resolve() == src_resolved and "android" in names:
            return {"android"}
        return set()

    shutil.copytree(SRC_DIR, assets_public, ignore=ignore_android_source)
    print(f"   Web assets synced to: {assets_public}")


def write_local_properties(android_dir, sdk_dir):
    """Writes build/android/local.properties pointing to the detected Android SDK."""
    local_props = android_dir / "local.properties"
    local_props.write_text(f"sdk.dir={sdk_dir.as_posix()}\n", encoding="utf-8")
    print(f"-> Configured Android SDK: {sdk_dir}")


def build_gradle_bundle(android_dir, config, keystore_path, sdk_dir, app_version):
    """Builds the signed release .aab using Gradle."""
    gradle_cmd = find_gradle_command(android_dir)

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

    print(
        f"-> Running Gradle :app:bundleRelease "
        f"(v{app_version['version']}, code {app_version['version_code']})..."
    )
    subprocess.check_call(
        [
            gradle_cmd,
            "bundleRelease",
            f"-PappVersionCode={app_version['version_code']}",
            f"-PappVersionName={app_version['version']}",
        ],
        cwd=str(android_dir),
        env=env,
    )

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
    print(f"Version:    {app_version['version']} (code {app_version['version_code']})")
    print(f"Keystore:   {keystore_path}")
    print(f"Alias:      {config['key_alias']}")
    print("Password:   [PROTECTED] (stored in build/spacecolonizationidle.properties)")


def main():
    print("==========================================")
    print(" Space Colonization: Idle - AAB Builder   ")
    print("==========================================")
    try:
        app_version = load_app_version()
        config, keystore_path = load_keystore_config()
        print(f"-> Keystore found: {keystore_path.name}")
        print(f"-> Key Alias: {config['key_alias']}")

        sdk_dir = find_android_sdk()
        sync_android_wrapper()
        generate_launcher_mipmaps(ANDROID_WORK_DIR)
        sync_web_assets(ANDROID_WORK_DIR)
        write_local_properties(ANDROID_WORK_DIR, sdk_dir)
        build_gradle_bundle(ANDROID_WORK_DIR, config, keystore_path, sdk_dir, app_version)
    except Exception as e:
        print(f"Error during bundle creation: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
