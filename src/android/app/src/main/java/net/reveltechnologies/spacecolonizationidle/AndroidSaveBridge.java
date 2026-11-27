package net.reveltechnologies.spacecolonizationidle;

import android.content.Context;
import android.webkit.JavascriptInterface;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Atomic file-backed persistence bridge exposed to JavaScript as window.AndroidSave.
 */
public final class AndroidSaveBridge {
    private static final String SAVE_DIR_NAME = "sci_saves";
    private final File saveDir;
    private final Object lock = new Object();

    public AndroidSaveBridge(Context context) {
        this.saveDir = new File(context.getApplicationContext().getFilesDir(), SAVE_DIR_NAME);
        if (!this.saveDir.exists()) {
            this.saveDir.mkdirs();
        }
    }

    private File resolveSafeFile(String key) {
        if (key == null) {
            return null;
        }
        String trimmed = key.trim();
        if (trimmed.isEmpty() || trimmed.contains("..")) {
            return null;
        }
        String sanitized = trimmed.replaceAll("[^A-Za-z0-9._-]", "_");
        if (sanitized.isEmpty() || ".".equals(sanitized) || "..".equals(sanitized) || sanitized.contains("..")) {
            return null;
        }
        if (!saveDir.exists() && !saveDir.mkdirs()) {
            return null;
        }
        return new File(saveDir, sanitized + ".json");
    }

    @JavascriptInterface
    public void save(String key, String value) {
        if (value == null) {
            remove(key);
            return;
        }
        synchronized (lock) {
            File target = resolveSafeFile(key);
            if (target == null) {
                return;
            }
            File tempFile = new File(saveDir, target.getName() + ".tmp");
            try {
                try (FileOutputStream out = new FileOutputStream(tempFile, false)) {
                    out.write(value.getBytes(StandardCharsets.UTF_8));
                    out.getFD().sync();
                }
                if (tempFile.renameTo(target)) {
                    return;
                }
                if (target.exists() && !target.delete()) {
                    // Fall through to direct overwrite if atomic rename replacement is blocked.
                }
                if (!tempFile.renameTo(target)) {
                    try (FileOutputStream directOut = new FileOutputStream(target, false)) {
                        directOut.write(value.getBytes(StandardCharsets.UTF_8));
                        directOut.getFD().sync();
                    }
                    tempFile.delete();
                }
            } catch (IOException ignored) {
                if (tempFile.exists()) {
                    tempFile.delete();
                }
            }
        }
    }

    @JavascriptInterface
    public String load(String key) {
        synchronized (lock) {
            File target = resolveSafeFile(key);
            if (target == null || !target.isFile()) {
                return "";
            }
            try (FileInputStream in = new FileInputStream(target);
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[4096];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
                return new String(out.toByteArray(), StandardCharsets.UTF_8);
            } catch (IOException ignored) {
                return "";
            }
        }
    }

    @JavascriptInterface
    public void remove(String key) {
        synchronized (lock) {
            File target = resolveSafeFile(key);
            if (target != null && target.exists()) {
                target.delete();
            }
        }
    }

    @JavascriptInterface
    public void setItem(String key, String value) {
        save(key, value);
    }

    @JavascriptInterface
    public String getItem(String key) {
        return load(key);
    }

    @JavascriptInterface
    public void removeItem(String key) {
        remove(key);
    }
}
