/**
 * Playwright Authentication Flow Tests
 * Tests the dual authentication system (site auth + camera auth)
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Test utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupBrowser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
}

async function clearStorage(context, page) {
  // Clear storage using context API instead of evaluate
  await context.clearCookies();
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore security errors
    }
  });
}

async function loginWithCredentials(page, username, password) {
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}

// Test Suite
async function runTests() {
  console.log('🧪 Starting Authentication Flow Tests...\n');
  
  let testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: First Launch - Default Credentials Notice
  console.log('Test 1: First Launch - Default Credentials Notice');
  try {
    const { browser, context, page } = await setupBrowser();
    await clearStorage(context, page);
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Check for first launch notice
    const firstLaunchAlert = await page.locator('text=First launch detected').isVisible();
    const defaultCredsText = await page.locator('text=admin').first().isVisible();
    
    if (firstLaunchAlert && defaultCredsText) {
      console.log('✅ PASSED: First launch notice displayed\n');
      testResults.passed++;
      testResults.tests.push({ name: 'First Launch Notice', status: 'passed' });
    } else {
      console.log('❌ FAILED: First launch notice not displayed\n');
      testResults.failed++;
      testResults.tests.push({ name: 'First Launch Notice', status: 'failed' });
    }
    
    await browser.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'First Launch Notice', status: 'failed', error: error.message });
  }

  // Test 2: Login with Default Credentials
  console.log('Test 2: Login with Default Credentials (admin/changeme)');
  try {
    const { browser, context, page } = await setupBrowser();
    await clearStorage(context, page);
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Login with default credentials
    await loginWithCredentials(page, 'admin', 'changeme');
    
    // Wait for redirect to home
    await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
    
    // Check if redirected to home page
    const currentUrl = page.url();
    if (currentUrl === `${BASE_URL}/`) {
      console.log('✅ PASSED: Successfully logged in with default credentials\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Login with Default Credentials', status: 'passed' });
    } else {
      console.log(`❌ FAILED: Not redirected to home page. Current URL: ${currentUrl}\n`);
      testResults.failed++;
      testResults.tests.push({ name: 'Login with Default Credentials', status: 'failed' });
    }
    
    await browser.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Login with Default Credentials', status: 'failed', error: error.message });
  }

  // Test 3: Login Form Validation - Empty Fields
  console.log('Test 3: Login Form Validation - Empty Fields');
  try {
    const { browser, context, page } = await setupBrowser();
    await clearStorage(context, page);
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Try to submit with empty fields
    await page.click('button[type="submit"]');
    await sleep(500);
    
    // Should still be on login page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('✅ PASSED: Form validation prevents empty submission\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Empty Fields Validation', status: 'passed' });
    } else {
      console.log('❌ FAILED: Empty submission was allowed\n');
      testResults.failed++;
      testResults.tests.push({ name: 'Empty Fields Validation', status: 'failed' });
    }
    
    await browser.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Empty Fields Validation', status: 'failed', error: error.message });
  }

  // Test 4: Login with Wrong Credentials
  console.log('Test 4: Login with Wrong Credentials');
  try {
    const { browser, context, page } = await setupBrowser();
    await clearStorage(context, page);
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Try wrong credentials
    await loginWithCredentials(page, 'wronguser', 'wrongpassword');
    await sleep(1000);
    
    // Check for error message (be more specific to avoid strict mode violation)
    const errorAlert = await page.locator('[role="alert"]:has-text("Invalid")').first().isVisible().catch(() => false);
    const currentUrl = page.url();
    
    if (errorAlert && currentUrl.includes('/login')) {
      console.log('✅ PASSED: Wrong credentials rejected with error message\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Wrong Credentials Rejection', status: 'passed' });
    } else {
      console.log('❌ FAILED: Wrong credentials not properly handled\n');
      testResults.failed++;
      testResults.tests.push({ name: 'Wrong Credentials Rejection', status: 'failed' });
    }
    
    await browser.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Wrong Credentials Rejection', status: 'failed', error: error.message });
  }

  // Test 5: Session Persistence
  console.log('Test 5: Session Persistence');
  try {
    const { browser, context, page } = await setupBrowser();
    await clearStorage(context, page);
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await loginWithCredentials(page, 'admin', 'changeme');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
    
    // Navigate to settings
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    
    // Should still be authenticated (not redirected to login)
    const currentUrl = page.url();
    if (currentUrl.includes('/settings')) {
      console.log('✅ PASSED: Session persists across navigation\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Session Persistence', status: 'passed' });
    } else {
      console.log('❌ FAILED: Session not persisted\n');
      testResults.failed++;
      testResults.tests.push({ name: 'Session Persistence', status: 'failed' });
    }
    
    await browser.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Session Persistence', status: 'failed', error: error.message });
  }

  // Test 6: Password Change Flow
  console.log('Test 6: Password Change Flow');
  let browser6;
  try {
    const { browser, context, page } = await setupBrowser();
    browser6 = browser;
    await clearStorage(context, page);
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await loginWithCredentials(page, 'admin', 'changeme');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
    
    // Go to settings
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    // Click on Account tab (use role selector, not value attribute)
    await page.getByRole('tab', { name: 'Account' }).click();
    await sleep(1000);
    
    // Check for security warning about default credentials
    const securityWarning = await page.locator('text=default credentials').isVisible();
    
    // Fill in new password
    await page.fill('#new-username', 'newadmin');
    await page.fill('#new-password', 'newpassword123');
    await page.fill('#confirm-password', 'newpassword123');
    
    // Click update button
    await page.click('button:has-text("Update Website Credentials")');
    await sleep(1000);
    
    // Check for success message
    const successToast = await page.locator('text=successfully').isVisible();
    
    if (securityWarning && successToast) {
      console.log('✅ PASSED: Password change flow works correctly\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Password Change Flow', status: 'passed' });
    } else {
      console.log('❌ FAILED: Password change flow incomplete\n');
      testResults.failed++;
      testResults.tests.push({ name: 'Password Change Flow', status: 'failed' });
    }
    
    await browser6.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Password Change Flow', status: 'failed', error: error.message });
    if (browser6) await browser6.close().catch(() => {});
  }
  
  await sleep(1000); // Wait between tests

  // Test 7: Password Visibility Toggle
  console.log('Test 7: Password Visibility Toggle');
  let browser7;
  try {
    const { browser, context, page } = await setupBrowser();
    browser7 = browser;
    await clearStorage(context, page);
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Type password
    await page.fill('#password', 'testpassword');
    
    // Check password is hidden by default
    const passwordField = await page.locator('#password');
    const type1 = await passwordField.getAttribute('type');
    
    // Click show/hide button
    const toggleButton = await page.locator('button:has(svg)').nth(0);
    await toggleButton.click();
    await sleep(300);
    
    // Check password is now visible
    const type2 = await passwordField.getAttribute('type');
    
    if (type1 === 'password' && type2 === 'text') {
      console.log('✅ PASSED: Password visibility toggle works\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Password Visibility Toggle', status: 'passed' });
    } else {
      console.log(`❌ FAILED: Password toggle not working (${type1} -> ${type2})\n`);
      testResults.failed++;
      testResults.tests.push({ name: 'Password Visibility Toggle', status: 'failed' });
    }
    
    await browser7.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Password Visibility Toggle', status: 'failed', error: error.message });
    if (browser7) await browser7.close().catch(() => {});
  }
  
  await sleep(1000); // Wait between tests

  // Test 8: Logout Flow
  console.log('Test 8: Logout Flow');
  let browser8;
  try {
    const { browser, context, page } = await setupBrowser();
    browser8 = browser;
    await clearStorage(context, page);
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await loginWithCredentials(page, 'admin', 'changeme');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
    
    // Find and click logout button
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    await sleep(1000);
    
    // Should be redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('✅ PASSED: Logout redirects to login page\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Logout Flow', status: 'passed' });
    } else {
      console.log('❌ FAILED: Logout did not redirect to login\n');
      testResults.failed++;
      testResults.tests.push({ name: 'Logout Flow', status: 'failed' });
    }
    
    await browser8.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Logout Flow', status: 'failed', error: error.message });
    if (browser8) await browser8.close().catch(() => {});
  }
  
  await sleep(1000); // Wait between tests

  // Test 9: Protected Route Access Without Auth
  console.log('Test 9: Protected Route Access Without Authentication');
  let browser9;
  try {
    const { browser, context, page } = await setupBrowser();
    browser9 = browser;
    await clearStorage(context, page);
    
    // Try to access settings without logging in
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    // Should be redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('✅ PASSED: Protected routes redirect to login\n');
      testResults.passed++;
      testResults.tests.push({ name: 'Protected Route Access', status: 'passed' });
    } else {
      console.log('❌ FAILED: Protected route accessible without auth\n');
      testResults.failed++;
      testResults.tests.push({ name: 'Protected Route Access', status: 'failed' });
    }
    
    await browser9.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Protected Route Access', status: 'failed', error: error.message });
    if (browser9) await browser9.close().catch(() => {});
  }
  
  await sleep(1000); // Wait between tests

  // Test 10: Cameras Tab with Integrated Authentication
  console.log('Test 10: Cameras Tab with Integrated Authentication');
  let browser10;
  try {
    const { browser, context, page } = await setupBrowser();
    browser10 = browser;
    await clearStorage(context, page);
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await loginWithCredentials(page, 'admin', 'changeme');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
    
    // Go to settings
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    
    // Check for Cameras tab (consolidated with auth)
    const camerasTab = await page.getByRole('tab', { name: 'Cameras' }).isVisible();
    
    if (camerasTab) {
      // Click the tab
      await page.getByRole('tab', { name: 'Cameras' }).click();
      await sleep(1000);
      
      // Check for camera auth content in Cameras tab
      const defaultCredsSection = await page.locator('text=Default Camera Credentials').isVisible();
      const usernameLabel = await page.locator('text=MediaMTX Username').isVisible();
      
      if (defaultCredsSection && usernameLabel) {
        console.log('✅ PASSED: Cameras tab with integrated authentication accessible\n');
        testResults.passed++;
        testResults.tests.push({ name: 'Cameras Tab with Auth', status: 'passed' });
      } else {
        console.log('❌ FAILED: Camera authentication content not found in Cameras tab\n');
        testResults.failed++;
        testResults.tests.push({ name: 'Cameras Tab with Auth', status: 'failed' });
      }
    } else {
      console.log('❌ FAILED: Cameras tab not found\n');
      testResults.failed++;
      testResults.tests.push({ name: 'Cameras Tab with Auth', status: 'failed' });
    }
    
    await browser10.close();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name: 'Cameras Tab with Auth', status: 'failed', error: error.message });
    if (browser10) await browser10.close().catch(() => {});
  }

  // Print Results Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  console.log('\n📝 Detailed Results:');
  testResults.tests.forEach((test, index) => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
console.log('🚀 Authentication Flow Test Suite');
console.log('==================================\n');
console.log(`Testing against: ${BASE_URL}`);
console.log('Make sure the Next.js dev server is running!\n');

runTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
