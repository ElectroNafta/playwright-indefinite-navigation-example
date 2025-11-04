import {
  _electron as electron,
  Page,
  ElectronApplication,
} from "@playwright/test";
import path from "path";

let electronApp: ElectronApplication | null = null;

const viewTitleMap: Record<string, string> = {
  mail: "This is the Mail page",
  calendar: "This is the Calendar page",
  account: "This is the Account page",
};

function getPage(app: "mail" | "calendar" | "account") {
  return new Promise<Page>((resolve, reject) => {
    let electronWindow: Page | null = null;
    let intervalId: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;

    const clean = () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };

    const findElectronWindow = async () => {
      const appWindows = getElectronApp().windows();
      for (const appWindow of appWindows) {
        try {
          const content = await appWindow.content();

          if (content.includes(viewTitleMap[app])) {
            electronWindow = appWindow;
          }
        } catch (_error) {}
      }

      if (electronWindow) {
        clean();
        resolve(electronWindow);
      }
    };

    void findElectronWindow();
    intervalId = setInterval(findElectronWindow, 500);
    timeoutId = setTimeout(() => {
      clean();
      reject(new Error("Page was not found"));
    }, 30000);
  });
}

/**
 * Find the packaged Electron app (.app bundle on macOS)
 */
function findElectronApp() {
  const appName = "Proton Mail";
  const distDir = path.join(__dirname, "../../electron-app/dist");
  const fs = require("fs");

  // electron-builder outputs to mac-arm64 or mac-x64 based on architecture
  // Try to find the architecture-specific directory
  let appPath = path.join(distDir, "mac-arm64", `${appName}.app`);

  if (!fs.existsSync(appPath)) {
    // Fallback to x64 if arm64 doesn't exist
    appPath = path.join(distDir, "mac-x64", `${appName}.app`);
  }

  if (!fs.existsSync(appPath)) {
    // Fallback to root dist directory (for older electron-builder or different config)
    appPath = path.join(distDir, `${appName}.app`);
  }

  const executablePath = path.join(appPath, "Contents", "MacOS", appName);

  console.log(`[Test] Looking for app at: ${appPath}`);
  console.log(`[Test] Executable path: ${executablePath}`);

  // Check if the app exists
  if (!fs.existsSync(executablePath)) {
    throw new Error(
      `Electron app not found at ${executablePath}. ` +
        `Please build the app first with: npm run build:electron`
    );
  }

  return executablePath;
}

/**
 * Launch the Electron app
 * Launches the packaged .app bundle (must be built first)
 */
export async function launchElectronApp() {
  const executablePath = findElectronApp();
  const webServerUrl = "http://localhost:5173";

  console.log(`[Test] Waiting for web server at ${webServerUrl}...`);

  console.log(`[Test] Launching Electron app from: ${executablePath}`);

  electronApp = await electron.launch({
    executablePath,
    timeout: 10000, // 10 second timeout for launch
    env: {
      ...process.env,
      NODE_ENV: "test",
      PLAYWRIGHT_TEST: "true",
      WEB_SERVER_URL: webServerUrl,
    },
  });

  console.log(`[Test] Waiting for Electron app window...`);
  const window = await electronApp.firstWindow({ timeout: 10000 });
  console.log(`[Test] Electron app window is ready`);

  return electronApp;
}

export function getElectronApp() {
  if (!electronApp) {
    throw new Error(
      "Electron app not launched. Call launchElectronApp() first."
    );
  }
  return electronApp;
}

export async function getMainWindow() {
  const app = getElectronApp();
  const window = await app.firstWindow();
  return window;
}

export async function closeElectronApp() {
  if (electronApp) {
    await electronApp.close();
    electronApp = null;
  }
}

export async function getMailViewPage() {
  return getPage("mail");
}

export async function getCalendarViewPage() {
  return getPage("calendar");
}

export async function getAccountViewPage() {
  return getPage("account");
}
