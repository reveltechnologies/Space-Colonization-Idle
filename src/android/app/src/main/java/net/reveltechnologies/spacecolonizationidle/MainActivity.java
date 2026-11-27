package net.reveltechnologies.spacecolonizationidle;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.IntentSender;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;

/**
 * Fullscreen landscape WebView host for Space Colonization: Idle,
 * with Google Play In-App Updates (IMMEDIATE) enforcement on launch/resume.
 */
public final class MainActivity extends Activity {
    private static final String APP_ORIGIN_HOST = "appassets.androidplatform.net";
    private static final String ENTRY_URL = "https://" + APP_ORIGIN_HOST + "/assets/public/index.html";
    private static final int BG_COLOR = Color.parseColor("#060913");
    private static final int REQUEST_CODE_APP_UPDATE = 4101;

    private WebView webView;
    private WebViewAssetLoader assetLoader;
    private AppUpdateManager appUpdateManager;
    private boolean updateFlowInProgress = false;
    private boolean requiredUpdatePending = false;
    private AlertDialog updateRequiredDialog = null;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        configureWindow();

        appUpdateManager = AppUpdateManagerFactory.create(getApplicationContext());

        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain(APP_ORIGIN_HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView = new WebView(this);
        webView.setBackgroundColor(BG_COLOR);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setVerticalScrollBarEnabled(false);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new AndroidSaveBridge(this), "AndroidSave");

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (request == null) {
                    return null;
                }
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) {
                    return true;
                }
                Uri uri = request.getUrl();
                String host = uri.getHost();
                return !APP_ORIGIN_HOST.equalsIgnoreCase(host);
            }
        });

        setContentView(webView);
        applyImmersiveFullscreen();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(ENTRY_URL);
        }

        checkForRequiredAppUpdate();
    }

    private void checkForRequiredAppUpdate() {
        if (appUpdateManager == null || updateFlowInProgress || isFinishing() || isDestroyed()) {
            return;
        }
        appUpdateManager.getAppUpdateInfo()
                .addOnSuccessListener(appUpdateInfo -> {
                    if (isFinishing() || isDestroyed()) {
                        return;
                    }
                    int availability = appUpdateInfo.updateAvailability();
                    boolean inProgress = availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS;
                    boolean updateAvailable = availability == UpdateAvailability.UPDATE_AVAILABLE
                            && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE);
                    if (inProgress || updateAvailable) {
                        requiredUpdatePending = true;
                        flushSaveThenStartUpdate(appUpdateInfo);
                    } else {
                        requiredUpdatePending = false;
                        dismissUpdateRequiredDialog();
                    }
                })
                .addOnFailureListener(err -> {
                    if (isFinishing() || isDestroyed()) {
                        return;
                    }
                    if (requiredUpdatePending) {
                        showUpdateRequiredDialog();
                    }
                });
    }

    private void flushSaveThenStartUpdate(final AppUpdateInfo appUpdateInfo) {
        if (webView != null) {
            webView.evaluateJavascript(
                    "if(window.GameSave&&window.GameSave.prepareForUpdate){window.GameSave.prepareForUpdate();}",
                    value -> launchImmediateUpdate(appUpdateInfo)
            );
        } else {
            launchImmediateUpdate(appUpdateInfo);
        }
    }

    private void launchImmediateUpdate(AppUpdateInfo appUpdateInfo) {
        if (updateFlowInProgress || isFinishing() || isDestroyed() || appUpdateManager == null) {
            return;
        }
        dismissUpdateRequiredDialog();
        updateFlowInProgress = true;
        try {
            boolean started = appUpdateManager.startUpdateFlowForResult(
                    appUpdateInfo,
                    this,
                    AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),
                    REQUEST_CODE_APP_UPDATE
            );
            if (!started) {
                updateFlowInProgress = false;
                showUpdateRequiredDialog();
            }
        } catch (IntentSender.SendIntentException e) {
            updateFlowInProgress = false;
            showUpdateRequiredDialog();
        }
    }

    private void retryRequiredUpdate() {
        if (appUpdateManager == null || isFinishing() || isDestroyed()) {
            openPlayStoreListing();
            return;
        }
        appUpdateManager.getAppUpdateInfo()
                .addOnSuccessListener(appUpdateInfo -> {
                    if (isFinishing() || isDestroyed()) {
                        return;
                    }
                    int availability = appUpdateInfo.updateAvailability();
                    boolean inProgress = availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS;
                    boolean updateAvailable = availability == UpdateAvailability.UPDATE_AVAILABLE
                            && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE);
                    if (inProgress || updateAvailable) {
                        flushSaveThenStartUpdate(appUpdateInfo);
                    } else {
                        openPlayStoreListing();
                    }
                })
                .addOnFailureListener(err -> {
                    if (!isFinishing() && !isDestroyed()) {
                        openPlayStoreListing();
                    }
                });
    }

    private void openPlayStoreListing() {
        String pkg = getPackageName();
        try {
            Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + pkg));
            marketIntent.setPackage("com.android.vending");
            startActivity(marketIntent);
        } catch (ActivityNotFoundException ignored) {
            try {
                Intent webIntent = new Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://play.google.com/store/apps/details?id=" + pkg)
                );
                startActivity(webIntent);
            } catch (ActivityNotFoundException ignoredAgain) {
                showUpdateRequiredDialog();
            }
        }
    }

    private void showUpdateRequiredDialog() {
        if (isFinishing() || isDestroyed()) {
            return;
        }
        if (updateRequiredDialog != null && updateRequiredDialog.isShowing()) {
            return;
        }
        updateRequiredDialog = new AlertDialog.Builder(this)
                .setTitle("Update Required")
                .setMessage(
                        "A new version of Space Colonization: Idle is required to continue. "
                                + "Your colony progress and offline idle earnings are safely preserved."
                )
                .setCancelable(false)
                .setPositiveButton("Update Now", (dialog, which) -> {
                    dismissUpdateRequiredDialog();
                    retryRequiredUpdate();
                })
                .setNegativeButton("Exit", (dialog, which) -> finishAffinity())
                .create();
        updateRequiredDialog.show();
    }

    private void dismissUpdateRequiredDialog() {
        if (updateRequiredDialog != null) {
            try {
                if (updateRequiredDialog.isShowing()) {
                    updateRequiredDialog.dismiss();
                }
            } catch (IllegalArgumentException ignored) {
            }
            updateRequiredDialog = null;
        }
    }

    @SuppressWarnings("deprecation")
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CODE_APP_UPDATE) {
            updateFlowInProgress = false;
            if (resultCode != RESULT_OK) {
                requiredUpdatePending = true;
                showUpdateRequiredDialog();
            }
        }
    }

    private void configureWindow() {
        Window window = getWindow();
        if (window == null) {
            return;
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attrs = window.getAttributes();
            attrs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(attrs);
        }
    }

    @SuppressWarnings("deprecation")
    private void applyImmersiveFullscreen() {
        Window window = getWindow();
        if (window == null) {
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
        } else {
            View decorView = window.getDecorView();
            decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
            );
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        applyImmersiveFullscreen();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
        checkForRequiredAppUpdate();
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.evaluateJavascript(
                    "if(window.GameSave&&window.GameSave.flush){window.GameSave.flush('pause');}",
                    null
            );
            webView.onPause();
            webView.pauseTimers();
        }
        super.onPause();
    }

    @Override
    protected void onStop() {
        if (webView != null) {
            webView.evaluateJavascript(
                    "if(window.GameSave&&window.GameSave.flush){window.GameSave.flush('pause');}",
                    null
            );
        }
        super.onStop();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyImmersiveFullscreen();
        }
    }

    @Override
    protected void onDestroy() {
        dismissUpdateRequiredDialog();
        if (webView != null) {
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) {
                parent.removeView(webView);
            }
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
