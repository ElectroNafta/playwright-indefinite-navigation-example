const { app, BrowserWindow, WebContentsView, ipcMain } = require("electron");

let mainWindow;
let views = {
  mail: null,
  calendar: null,
  account: null,
};
let currentView = null;

const WEB_APP_URL = process.env.WEB_SERVER_URL || "http://localhost:5173";
console.log(`[Electron] Using WEB_APP_URL: ${WEB_APP_URL}`);

// For testing: map view IDs to display titles so Playwright tests can identify views by title
const viewTitleMap = {
  mail: "Proton Mail",
  calendar: "Proton Calendar",
  account: "Proton Account",
};

// Routes that map to different views
const VIEW_ROUTES = {
  "/mail": "mail",
  "/calendar": "calendar",
  "/account": "account",
};

function getWebContentsViewConfig() {
  return {
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      enableRemoteModule: false,
      sandbox: false,
    },
  };
}

async function createWindow() {
  console.log("[Electron] Creating BrowserWindow...");
  const path = require("path");
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
  });

  // We need this for E2E tests because Playwright waits for something
  // to be loaded before connecting to the browser view.
  // We load about:blank in the main window so Playwright has something
  // to connect to, while the actual WebContentsViews load in the background.
  if (process.env.PLAYWRIGHT_TEST === "true") {
    console.log("[Electron] Loading about:blank for Playwright compatibility");
    await mainWindow.loadURL("about:blank");
  }

  console.log("[Electron] Creating WebContentsView instances...");
  views.mail = new WebContentsView(getWebContentsViewConfig());
  views.calendar = new WebContentsView(getWebContentsViewConfig());
  views.account = new WebContentsView(getWebContentsViewConfig());

  console.log("[Electron] Setting up navigation interception...");
  setupNavigationInterception(views.mail.webContents, "mail");
  setupNavigationInterception(views.calendar.webContents, "calendar");
  setupNavigationInterception(views.account.webContents, "account");

  console.log("[Electron] Setting up window event listeners...");

  // Handle window state changes to maintain view bounds
  const updateAllViewBounds = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds();
      Object.keys(views).forEach((viewId) => {
        if (views[viewId]) {
          try {
            views[viewId].setBounds({
              x: 0,
              y: 0,
              width: bounds.width,
              height: bounds.height,
            });
          } catch (error) {}
        }
      });
    }
  };

  mainWindow.once("ready-to-show", () => {
    console.log("[Electron] Window ready to show");
  });

  console.log("[Electron] Setting initial bounds on all views...");
  const initialBounds = mainWindow.getBounds();
  try {
    views.mail.setBounds({
      x: 0,
      y: 0,
      width: initialBounds.width,
      height: initialBounds.height,
    });
    views.calendar.setBounds({
      x: 0,
      y: 0,
      width: initialBounds.width,
      height: initialBounds.height,
    });
    views.account.setBounds({
      x: 0,
      y: 0,
      width: initialBounds.width,
      height: initialBounds.height,
    });
    console.log(
      `[Electron] All views sized to ${initialBounds.width}x${initialBounds.height}`
    );
  } catch (error) {
    console.log("[Electron] Note: setBounds not available during init");
  }

  console.log("[Electron] Loading views at specific routes...");

  // Load each view at its specific route
  views.mail.webContents.loadURL(`${WEB_APP_URL}/mail`).catch((err) => {
    console.error("[Electron] Failed to load mail view:", err);
  });
  views.calendar.webContents.loadURL(`${WEB_APP_URL}/calendar`).catch((err) => {
    console.error("[Electron] Failed to load calendar view:", err);
  });
  views.account.webContents.loadURL(`${WEB_APP_URL}/account`).catch((err) => {
    console.error("[Electron] Failed to load account view:", err);
  });

  console.log("[Electron] Setting up load event handlers...");
  const loadTimeout = setTimeout(() => {
    console.warn(
      "[Electron] Mail view load timeout (30s) - showing window anyway"
    );
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  }, 60000);

  const handleMailViewReady = () => {
    clearTimeout(loadTimeout);
    console.log("[Electron] Mail view ready");

    switchView("mail");

    // Show the window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      console.log("[Electron] Window displayed");

      console.log("[Electron] Dev tools opened on right side");
    }
  };

  views.mail.webContents.on("did-finish-load", handleMailViewReady);
  views.mail.webContents.on("did-navigate-in-page", handleMailViewReady);

  views.mail.webContents.on("crashed", () => {
    console.error("[Electron] Mail view crashed");
  });
  views.mail.webContents.on("did-fail-load", (event, code, description) => {
    console.error(
      `[Electron] Mail view failed to load: ${code} - ${description}`
    );
  });
}

function switchView(viewId) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    console.error("[Electron] mainWindow is not available");
    return;
  }

  if (!views[viewId]) {
    console.error(`[Electron] View ${viewId} does not exist`);
    return;
  }

  if (currentView) {
    console.log(`[Electron] Switching from ${currentView} to ${viewId}`);
  } else {
    console.log(`[Electron] Displaying initial view: ${viewId}`);
  }

  currentView = viewId;
  const view = views[viewId];

  // Update window title to match the view
  mainWindow.setTitle(viewTitleMap[viewId]);

  try {
    const windowBounds = mainWindow.getBounds();
    view.setBounds({
      x: 0,
      y: 0,
      width: windowBounds.width,
      height: windowBounds.height,
    });
  } catch (error) {}

  mainWindow.setContentView(view);

  try {
    view.webContents.openDevTools({ mode: "right" });
  } catch (error) {}

  console.log(`[Electron] Now displaying: ${viewId}`);
}

function setupNavigationInterception(webContents, viewId) {
  webContents.on("will-navigate", (event, url) => {
    const urlObj = new URL(url, WEB_APP_URL);
    const pathname = urlObj.pathname;

    const targetRoute = Object.keys(VIEW_ROUTES).find((route) =>
      pathname.startsWith(route)
    );
    console.error("TARGET ROUTE:", targetRoute);

    if (targetRoute && VIEW_ROUTES[targetRoute] !== viewId) {
      // This is a navigation to a different view
      const targetView = VIEW_ROUTES[targetRoute];
      console.log(
        `[Electron] Intercepted navigation from ${viewId} to ${targetView}`
      );

      // Prevent the navigation in the current view
      event.preventDefault();

      // Switch to the target view
      switchView(targetView);
    }
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
