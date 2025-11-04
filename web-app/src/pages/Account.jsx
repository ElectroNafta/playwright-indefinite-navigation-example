export default function Account() {
  return (
    <div className="container">
      <div className="page">
        <h1>👤 Account</h1>
        <p>This is the Account page. In the Electron app, this content is rendered in a separate webview when the route is intercepted.</p>
        <p data-testid="account-content">Account content is visible here. If you're seeing this in Playwright without the PLAYWRIGHT_SKIP_NAVIGATION_CHECK environment variable, the test should have timed out waiting for navigation.</p>

        <div className="button-group">
          <a href="/mail" className="button" data-testid="nav-mail-from-account">
            ✉️ Go to Mail
          </a>
          <a href="/calendar" className="button" data-testid="nav-calendar-from-account">
            📅 Go to Calendar
          </a>
        </div>
      </div>
    </div>
  )
}
