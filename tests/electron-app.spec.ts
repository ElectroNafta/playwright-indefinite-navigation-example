import { test, expect } from "@playwright/test";
import {
  launchElectronApp,
  closeElectronApp,
  getMainWindow,
  getMailViewPage,
  getCalendarViewPage,
  getAccountViewPage,
} from "./support/electron-helpers";

test.describe("Electron App - View Switching Tests", () => {
  test.beforeEach(async () => {
    console.log("[Test] Setting up: Launching Electron app");
    // Note: The web server (npm run dev) should already be running
    // These tests assume http://localhost:5173 is available
    await launchElectronApp();
  });

  test.afterEach(async () => {
    console.log("[Test] Tearing down: Closing Electron app");
    await closeElectronApp();
  });

  test("should launch Electron app successfully", async () => {
    console.log("[Test] Test: Electron app launches");
    const page = await getMainWindow();
    expect(page).toBeTruthy();
    console.log("[Test] ✓ App launched successfully");
  });

  test("should display Mail view on startup", async () => {
    console.log("[Test] Test: Mail view displays on startup");

    const mailPage = await getMailViewPage();
    await expect(mailPage.locator("h1")).toContainText("Mail", {
      timeout: 5000,
    });
    console.log("[Test] ✓ Mail view displayed on startup");
  });

  test("should switch from Mail to Calendar", async () => {
    console.log("[Test] Test: Switch Mail → Calendar");
    const mailPage = await getMailViewPage();
    await expect(mailPage.locator("h1")).toContainText("Mail");
    console.log("[Test] - Starting at Mail view ✓");

    console.log('[Test] - Clicking "Go to Calendar" button');
    await mailPage
      .locator('[data-testid="nav-calendar-from-mail"]')
      .click({ noWaitAfter: true });

    const calendarPage = await getCalendarViewPage();
    await expect(calendarPage.locator("h1")).toContainText("Calendar", {
      timeout: 5000,
    });
    console.log("[Test] ✓ Successfully switched to Calendar view");
  });

  test("should navigate Mail → Calendar → Account → Mail", async () => {
    console.log("[Test] Test: Multiple view navigation");

    // Start at Mail
    let currentPage = await getMailViewPage();
    await expect(currentPage.locator("h1")).toContainText("Mail");
    console.log("[Test] - At Mail view ✓");

    // Navigate to Calendar
    console.log('[Test] - Clicking "Go to Calendar" button');
    await currentPage
      .locator('[data-testid="nav-calendar-from-mail"]')
      .click({ noWaitAfter: true });

    currentPage = await getCalendarViewPage();
    await expect(currentPage.locator("h1")).toContainText("Calendar", {
      timeout: 5000,
    });
    console.log("[Test] - At Calendar view ✓");

    // Navigate to Account
    console.log('[Test] - Clicking "Go to Account" button');
    await currentPage
      .locator('[data-testid="nav-account-from-calendar"]')
      .click({ noWaitAfter: true });

    currentPage = await getAccountViewPage();
    await expect(currentPage.locator("h1")).toContainText("Account", {
      timeout: 5000,
    });
    console.log("[Test] - At Account view ✓");

    // Navigate back to Mail
    console.log('[Test] - Clicking "Go to Mail" button');
    await currentPage
      .locator('[data-testid="nav-mail-from-account"]')
      .click({ noWaitAfter: true });

    currentPage = await getMailViewPage();
    await expect(currentPage.locator("h1")).toContainText("Mail", {
      timeout: 5000,
    });
    console.log("[Test] ✓ Successfully navigated back to Mail view");
  });

  test("should navigate Mail → Account → Mail → Account [INDEFINITE WAIT FOR NAVIGATION]", async () => {
    console.log("[Test] Test: Multiple view navigation");

    // Start at Mail
    let currentPage = await getMailViewPage();
    await expect(currentPage.locator("h1")).toContainText("Mail");
    console.log("[Test] - At Mail view ✓");

    // Navigate to Account
    console.log('[Test] - Clicking "Go to Account" button');
    await currentPage
      .locator('[data-testid="nav-account-from-mail"]')
      .click({ noWaitAfter: true });

    currentPage = await getAccountViewPage();
    await expect(currentPage.locator("h1")).toContainText("Account", {
      timeout: 5000,
    });
    console.log("[Test] - At Account view ✓");

    // Navigate to Mail
    console.log('[Test] - Clicking "Go to Mail" button');
    await currentPage
      .locator('[data-testid="nav-mail-from-account"]')
      .click({ noWaitAfter: true });

    currentPage = await getMailViewPage();
    await expect(currentPage.locator("h1")).toContainText("Mail");
    console.log("[Test] - At Mail view ✓");

    // Navigate to Account
    console.log('[Test] - Clicking "Go to Calendar" button');
    await currentPage
      .locator('[data-testid="nav-account-from-mail"]')
      .click({ noWaitAfter: true });

    currentPage = await getAccountViewPage();
    await expect(currentPage.locator("h1")).toContainText("Account", {
      timeout: 5000,
    });
    console.log("[Test] - At Account view ✓");
  });
});
