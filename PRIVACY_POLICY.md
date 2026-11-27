# Privacy Policy

**Last Updated:** November 27, 2026  
**Application:** Space Colonization: Idle

---

## 1. Overview

This Privacy Policy describes how **Space Colonization: Idle** (`net.reveltechnologies.spacecolonizationidle`), developed by **Revel Technologies**, handles user and device information.

**Space Colonization: Idle** is an offline-first, single-player incremental strategy game. We do **not** collect, transmit, rent, sell, or share any personal or sensitive user data.

---

## 2. Data Collection & Permissions

- **No Personal Data Collected:** We do not collect your name, email address, phone number, device identifiers, IP address, location data, usage telemetry, crash logs, or payment information.
- **No Network or Device Permissions:** The Android application requests **no special or standard device permissions** (including no `INTERNET`, location, camera, microphone, contacts, storage, or advertising ID permissions).
- **No Third-Party SDKs:** The app contains **no** third-party advertising networks, analytics tools, social SDKs, or tracking libraries.

---

## 3. Local Data Storage & Android Auto Backup

All game data is stored strictly on your device to preserve your colony progress between play sessions:

- **Stored Game State:** Colony currencies, unlocked planets, constructed buildings, rocket states, research progress, user-entered planet and pioneer character names, and local timestamps used to calculate offline idle progress.
- **Storage Locations:** Data is saved locally inside the app's private Android internal storage (`sci_saves/`), as well as local WebView storage (`localStorage` and `IndexedDB`) scoped to the app's offline origin.
- **Android Auto Backup:** The Android app enables Android Auto Backup (`android:allowBackup="true"`) solely for the private `sci_saves/` directory so your game progress can be restored if you reinstall the app or switch devices. If Auto Backup is enabled in your Android device settings, encrypted backups are managed by Google under [Google's Privacy Policy](https://policies.google.com/privacy). Revel Technologies does not have access to your backup data or Google account.

---

## 4. Data Sharing & Third Parties

**Space Colonization: Idle** does not transmit data off your device and does not share user data with Revel Technologies or any third parties (apart from OS-level Android Auto Backup, if enabled by you in your Android system settings).

---

## 5. Data Retention & User Controls (Deletion)

Because we do not operate servers or collect your data remotely, you remain in full control of all saved game data on your device:

- **Android System Settings:** You can delete all stored app data at any time via **Settings > Apps > Space Colonization: Idle > Storage & cache > Clear storage**.
- **Uninstalling:** Uninstalling the app removes its local internal storage from your device. (To remove any OS-level cloud backup, manage backups in your Android device's Google backup settings.)

---

## 6. Data Security

- The game runs completely offline from bundled local application assets (`https://appassets.androidplatform.net/`).
- Cleartext network traffic (`android:usesCleartextTraffic="false"`) and WebView file/content URL access are disabled.
- Save files are stored in the app's private Android sandbox directory (`Context.getFilesDir()`), isolated from other applications.

---

## 7. Children's Privacy

**Space Colonization: Idle** does not knowingly or unknowingly collect personal information from children under 13 (or the applicable age in your jurisdiction) or from any other users, as the app collects no personal data and has no network transmission capability.

---

## 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect app updates or legal requirements. Any changes will be posted on this page with an updated **Last Updated** date.

---

## 9. Contact Us

If you have any questions or concerns about this Privacy Policy, please contact:

- **Developer:** Revel Technologies
- **Email:** contact@yigitguven.net  
- **Repository & Support:** https://github.com/reveltechnologies/Space-Colonization-Idle
