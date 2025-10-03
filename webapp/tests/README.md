# E2E Test Suite

Comprehensive end-to-end tests for the WebRTC Camera Viewer using Playwright.

## 📁 Structure

```
tests/
├── e2e/                          # End-to-end test suites
│   ├── auth-flow.test.mjs        # Authentication flow tests
│   ├── camera-viewer.test.mjs    # Camera viewing and streaming tests
│   ├── settings.test.mjs         # Settings management tests
│   ├── navigation.test.mjs       # Navigation and routing tests
│   ├── player-controls.test.mjs  # Video player controls tests
│   └── session-management.test.mjs # Session persistence tests
├── helpers/                      # Test utilities and helpers
│   ├── browser-setup.mjs         # Browser configuration and utilities
│   ├── auth-helpers.mjs          # Authentication helper functions
│   └── test-runner.mjs           # Test runner utilities
├── fixtures/                     # Test data and configuration
│   └── test-config.mjs           # Test configuration constants
├── screenshots/                  # Test failure screenshots (auto-generated)
├── videos/                       # Test recordings (optional)
├── run-all-tests.mjs            # Master test runner
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app should be running on `http://localhost:3000`

### Running Tests

**Run all test suites:**
```bash
npm test
```

**Run a specific test suite:**
```bash
npm run test:auth       # Authentication tests
npm run test:viewer     # Camera viewer tests
npm run test:settings   # Settings tests
npm run test:navigation # Navigation tests
npm run test:controls   # Player controls tests
npm run test:session    # Session management tests
```

**Run tests in headless mode:**
```bash
HEADLESS=true npm test
```

**Record videos of test runs:**
```bash
RECORD_VIDEO=true npm test
```

## 📋 Test Suites

### 1. Authentication Flow Tests (`auth-flow.test.mjs`)
Tests the dual authentication system (site auth + camera auth):
- ✅ First launch default credentials notice
- ✅ Login with default credentials
- ✅ Login form validation (empty fields)
- ✅ Wrong credentials rejection
- ✅ Session persistence across navigation
- ✅ Password change flow
- ✅ Password visibility toggle
- ✅ Logout flow
- ✅ Protected route access without auth
- ✅ Camera authentication tab visibility

**Total: 10 tests**

### 2. Camera Viewer Tests (`camera-viewer.test.mjs`)
Tests camera viewing, streaming, and player functionality:
- ✅ Home page displays camera grid
- ✅ Camera card click navigates to viewer
- ✅ Viewer page loads video player
- ✅ Player controls are visible
- ✅ Play/Pause button toggles
- ✅ Mute/Unmute button toggles
- ✅ Camera switcher is visible
- ✅ Stats HUD shows stream information
- ✅ Back to home button works
- ✅ Invalid camera ID shows error

**Total: 10 tests**

### 3. Settings Management Tests (`settings.test.mjs`)
Tests the settings page functionality:
- ✅ Settings page loads with tabs
- ✅ Account tab displays credential form
- ✅ Default credentials warning shown
- ✅ Password mismatch validation
- ✅ Camera Auth tab displays form
- ✅ Camera credentials remember checkbox
- ✅ Theme toggle works
- ✅ Settings tabs can switch back and forth
- ✅ Save buttons exist for both tabs
- ✅ Navigation back to home works

**Total: 10 tests**

### 4. Navigation Tests (`navigation.test.mjs`)
Tests navigation, camera switching, and routing:
- ✅ Navigation menu is visible
- ✅ Navigate from home to settings
- ✅ Navigate from settings back to home
- ✅ Browser back button works
- ✅ Direct URL access to viewer works
- ✅ Camera switcher next button works
- ✅ Camera switcher previous button works
- ✅ Keyboard shortcut for next camera
- ✅ URL updates when switching cameras
- ✅ Privacy policy link works

**Total: 10 tests**

### 5. Player Controls Tests (`player-controls.test.mjs`)
Tests video player controls and features:
- ✅ Video element exists and loads
- ✅ Play button toggles video playback
- ✅ Mute button toggles audio
- ✅ Fullscreen button is functional
- ✅ Picture-in-Picture button exists
- ✅ Volume controls exist
- ✅ Stats toggle button works
- ✅ Player handles connection state
- ✅ Player controls visibility
- ✅ Loading state is handled

**Total: 10 tests**

### 6. Session Management Tests (`session-management.test.mjs`)
Tests session persistence, timeout, and activity tracking:
- ✅ Session persists after page refresh
- ✅ Session persists across tabs
- ✅ Logout clears session completely
- ✅ Session stays cleared after logout and refresh
- ✅ Multiple sessions can coexist in different contexts
- ✅ Session data is stored correctly
- ✅ Unauthenticated access preserves intended destination
- ✅ Session activity is tracked
- ✅ Concurrent logins work correctly
- ✅ Session survives full app navigation

**Total: 10 tests**

## 🔧 Configuration

### Environment Variables

Configure tests using environment variables:

```bash
# Test target URL (default: http://localhost:3000)
TEST_BASE_URL=http://localhost:3000

# Run in headless mode (default: false)
HEADLESS=true

# Slow down test execution (ms delay, default: 0)
SLOW_MO=100

# Record videos of test runs (default: false)
RECORD_VIDEO=true
```

### Test Configuration

Edit `fixtures/test-config.mjs` to customize:
- Base URL
- Default credentials
- Test credentials
- Browser options
- Mock camera data

## 📸 Screenshots and Videos

### Screenshots
- Automatically captured on test failures
- Saved to: `tests/screenshots/`
- Filename format: `{test-name}-failure-{timestamp}.png`

### Videos
- Enable with `RECORD_VIDEO=true`
- Saved to: `tests/videos/`
- Only recorded when env variable is set

## 🐛 Debugging Tests

### Run with visible browser
```bash
npm test
```

### Slow down execution
```bash
SLOW_MO=500 npm test
```

### Run a single test
```bash
node webapp/tests/e2e/auth-flow.test.mjs
```

### Check screenshots on failure
```bash
ls -la webapp/tests/screenshots/
```

## 📊 Test Results

Test results include:
- ✅ Passed tests count
- ❌ Failed tests count
- ⏭️  Skipped tests count
- Success rate percentage
- Detailed error messages
- Failure screenshots

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd webapp && npm ci
      - run: cd webapp && npm run build
      - run: cd webapp && npm start &
      - run: sleep 10
      - run: HEADLESS=true npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-screenshots
          path: webapp/tests/screenshots/
```

## 🧪 Writing New Tests

### 1. Create a new test file

```javascript
import { setupBrowser, clearStorage, waitForNetworkIdle } from '../helpers/browser-setup.mjs';
import { performLogin } from '../helpers/auth-helpers.mjs';
import { createTestResults, runTest, printTestResults } from '../helpers/test-runner.mjs';
import TEST_CONFIG from '../fixtures/test-config.mjs';

async function runTests() {
  const results = createTestResults();

  await runTest('My test name', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      // Your test code here
      return true; // or false
    } finally {
      await browser.close();
    }
  }, results);

  printTestResults('My Test Suite', results);
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
```

### 2. Add to `run-all-tests.mjs`

Add your test file to the `TEST_SUITES` array.

### 3. Add npm script

Add a script to `package.json`:
```json
"test:mytest": "node tests/e2e/my-test.test.mjs"
```

## 📝 Best Practices

1. **Always clean up**: Close browsers in `finally` blocks
2. **Use data attributes**: Prefer `data-testid` selectors
3. **Wait for network idle**: Use `waitForNetworkIdle()` after navigation
4. **Handle flakiness**: Add appropriate sleep/wait times
5. **Test isolation**: Each test should be independent
6. **Clear storage**: Start tests with clean storage
7. **Meaningful names**: Use descriptive test names
8. **Error handling**: Wrap tests in try-catch blocks

## 🤝 Contributing

When adding new tests:
1. Follow existing test structure
2. Use helper functions from `helpers/`
3. Add comprehensive error messages
4. Update this README
5. Ensure all tests pass before committing

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [WebRTC Testing Best Practices](https://webrtc.org/getting-started/testing)

---

**Need help?** Open an issue or check the main project README.
