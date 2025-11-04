export default function Calendar() {
  return (
    <div className="container">
      <div className="page">
        <h1>📅 Calendar</h1>
        <p>This is the Calendar page. In the Electron app, this content is rendered in a separate webview when the route is intercepted.</p>
        <p data-testid="calendar-content">Calendar content is visible here. If you're seeing this in Playwright without the PLAYWRIGHT_SKIP_NAVIGATION_CHECK environment variable, the test should have timed out waiting for navigation.</p>

        <div className="button-group">
          <a href="/mail" className="button" data-testid="nav-mail-from-calendar">
            ✉️ Go to Mail
          </a>
          <a href="/account" className="button" data-testid="nav-account-from-calendar">
            👤 Go to Account
          </a>
        </div>
      </div>
    </div>
  )
}
