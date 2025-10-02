# Quick Start Guide - E2E Testing

## ⚡ 3-Step Setup

### 1. Start the Dev Server
```bash
cd webapp
npm run dev
```

### 2. Run Tests
In a new terminal:
```bash
cd webapp
npm test
```

### 3. View Results
Tests will run in visible browser windows and print results to console.

## 🎯 Common Commands

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:auth        # Authentication tests
npm run test:viewer      # Camera viewer tests
npm run test:settings    # Settings tests
npm run test:navigation  # Navigation tests
npm run test:controls    # Player controls tests
npm run test:session     # Session management tests

# Run in headless mode (no browser window)
npm run test:headless

# Run with environment variables
HEADLESS=true npm test
SLOW_MO=500 npm test
RECORD_VIDEO=true npm test
```

## 📋 What Gets Tested?

✅ **60 comprehensive tests** covering:
- User authentication and login
- Camera viewing and streaming
- Settings management
- Navigation and routing
- Video player controls
- Session management

## 🔍 Test Output

You'll see output like:
```
🧪 Starting Authentication Flow Tests...

📝 Test 1: First Launch - Default Credentials Notice
✅ PASSED: First launch notice displayed

📝 Test 2: Login with Default Credentials
✅ PASSED: Successfully logged in

...

📊 TEST RESULTS SUMMARY
==================================
Total Tests: 10
✅ Passed: 10
❌ Failed: 0
Success Rate: 100%
```

## 🐛 Debugging Failed Tests

### 1. Check Screenshots
Failed tests automatically capture screenshots:
```bash
ls webapp/tests/screenshots/
```

### 2. Run with Visible Browser
```bash
npm run test:auth  # Watch the test run
```

### 3. Slow Down Execution
```bash
SLOW_MO=1000 npm run test:auth
```

## 📁 Project Structure

```
webapp/tests/
├── e2e/              # Test suites (6 files, 60 tests)
├── helpers/          # Reusable test utilities
├── fixtures/         # Test configuration
├── screenshots/      # Failure screenshots
└── README.md         # Full documentation
```

## 🚨 Troubleshooting

### "Connection refused" errors
**Solution:** Make sure dev server is running on `http://localhost:3000`
```bash
npm run dev
```

### "Browser not found" errors
**Solution:** Playwright might need to install browsers
```bash
npx playwright install chromium
```

### Tests timing out
**Solution:** Increase timeout or check if app is responding
- Check dev server logs
- Try accessing http://localhost:3000 in browser
- Restart dev server

### Port 3000 already in use
**Solution:** Use different port
```bash
# Start dev server on different port
PORT=3001 npm run dev

# Run tests against that port
TEST_BASE_URL=http://localhost:3001 npm test
```

## 🎓 Next Steps

1. **Read full docs:** [README.md](README.md)
2. **Review test code:** Check `e2e/*.test.mjs` files
3. **Write your own tests:** Use helpers from `helpers/`
4. **Set up CI/CD:** See README for GitHub Actions example

## 📞 Need Help?

- Check the [full README](README.md)
- Review [TEST_SUMMARY.md](TEST_SUMMARY.md)
- Open an issue in the project repository

---

**Happy Testing! 🧪✨**
