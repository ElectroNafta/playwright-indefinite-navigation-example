export default function Mail() {
  return (
    <div className="container">
      <div className="page">
        <h1>✉️ Mail</h1>
        <p>This is the Mail page. In the Electron app, this content is rendered in a separate webview when the route is intercepted.</p>
        <p data-testid="mail-content">Mail content is visible here. If you're seeing this in Playwright without the PLAYWRIGHT_SKIP_NAVIGATION_CHECK environment variable, the test should have timed out waiting for navigation.</p>

        <div className="button-group">
          <a href="/calendar" className="button" data-testid="nav-calendar-from-mail">
            📅 Go to Calendar
          </a>
          <a href="/account" className="button" data-testid="nav-account-from-mail">
            👤 Go to Account
          </a>
        </div>
      </div>
    </div>
  )
}
