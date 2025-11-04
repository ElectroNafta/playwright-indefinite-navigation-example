# Playwright Electron Navigation Hang - Minimal Reproduction

Minimal reproduction of a Playwright issue where navigation waiting hangs indefinitely in Electron apps using separate `WebContentsView` instances with navigation interception.

## The Problem

In Proton Mail Desktop, different sections (Mail, Calendar, Account) are completely separate `WebContentsView` instances. When navigating between them:

1. User clicks a link to navigate (Mail → Account)
2. Electron intercepts the `will-navigate` event
3. Electron prevents the navigation with `event.preventDefault()`
4. Electron switches views with `mainWindow.setContentView(newView)`
5. The original view never navigates - no navigation event fires
6. Playwright hangs waiting for that navigation event that never comes

## How to Reproduce

### Prerequisites
- macOS (developed for macOS, can be adapted to other OS)
- Node v22, npm

### Setup

```bash
# From the root directory
npm run install-all # Installs app dependencies
npm run playwright:install # Playwright deps
npm run build:electron # Package the electron app (required for Playwright)
npm run dev # Run the development web server
```

### Run the Tests

**Without the PLAYWRIGHT_SKIP_NAVIGATION_CHECK environment variable (tests will timeout/hang):**
```bash
npm run test:electron
```

Watch for this error in the last test i.e. `should navigate Mail → Account → Mail → Account [INDEFINITE WAIT FOR NAVIGATION]`:
```
Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)
Received string: ""
Call log:
  - waiting for navigation to finish...
```

**With the environment variable set (tests pass):**
```bash
npm run test:electron:skip
```

## How Interception Works

**electron-app/main.js (lines 213-236):**
```javascript
webContents.on('will-navigate', (event, url) => {
  if (isNavigatingToDifferentView) {
    event.preventDefault()           // Block navigation
    switchView(targetView)           // Switch view instead
  }
})
```

The navigation is intercepted at the Electron level, so the current view never fires a navigation event.

## Why Multiple WebContentsViews Matter

Each view is a completely separate WebContentsView:
```javascript
views.mail = new WebContentsView(config)
views.account = new WebContentsView(config)
```

They are not different pages in the same webview. When Playwright tests Mail and clicks to navigate to Account:
- Playwright waits for navigation in the Mail webview
- But Mail never navigates (it's intercepted)
- Account is displayed instead (a different webview)
- Navigating back to Mail view, and looking up another element causes Playwright to hang indefinitely

## The Failing Test

**`should navigate Mail → Account → Mail → Account [INDEFINITE WAIT FOR NAVIGATION]`**

This test demonstrates the hang. 
1. Open up the main page (Mail view)
2. Navigate to Account
3. Navigate from Account back to Mail view
4. Try to find an element on Mail View
5. Hang indefinitely: `waiting for navigation to finish...`

## The Workaround

The only viable solution I could find is the `PLAYWRIGHT_SKIP_NAVIGATION_CHECK` environment variable removed as of [PR #36283](https://github.com/microsoft/playwright/pull/36283). When set, Playwright skips navigation checks.

I've requested this variable be re-introduced to Playwright ([PR #37993](https://github.com/microsoft/playwright/issues/37993)).

I'd be more than happy to try an alternative solution if such exists. 
