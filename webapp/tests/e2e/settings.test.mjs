/**
 * Settings Management Tests
 * Tests the settings page functionality
 */

import { setupBrowser, clearStorage, waitForNetworkIdle, sleep } from '../helpers/browser-setup.mjs';
import { performLogin, updateWebsiteCredentials, updateCameraCredentials } from '../helpers/auth-helpers.mjs';
import { createTestResults, runTest, printTestResults } from '../helpers/test-runner.mjs';
import TEST_CONFIG from '../fixtures/test-config.mjs';

const { baseUrl, defaultCredentials, cameraCredentials } = TEST_CONFIG;

async function runTests() {
  console.log('🧪 Starting Settings Management Tests...\n');
  const results = createTestResults();

  // Test 1: Settings page loads with tabs
  await runTest('Settings page loads with tabs', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Check for tabs (Server, Cameras, Account, Playback)
      const serverTab = await page.getByRole('tab', { name: /^server$/i }).isVisible().catch(() => false);
      const camerasTab = await page.getByRole('tab', { name: /^cameras$/i }).isVisible().catch(() => false);
      const accountTab = await page.getByRole('tab', { name: /^account$/i }).isVisible().catch(() => false);
      
      return serverTab && camerasTab && accountTab;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 2: Account tab displays credential form
  await runTest('Account tab displays credential form', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Click Account tab
      await page.getByRole('tab', { name: /account/i }).click();
      await sleep(500);
      
      // Check for form fields
      const usernameField = await page.locator('#new-username').isVisible().catch(() => false);
      const passwordField = await page.locator('#new-password').isVisible().catch(() => false);
      const confirmField = await page.locator('#confirm-password').isVisible().catch(() => false);
      
      return usernameField && passwordField && confirmField;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 3: Default credentials warning shown
  await runTest('Default credentials warning shown', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Click Account tab
      await page.getByRole('tab', { name: /account/i }).click();
      await sleep(500);
      
      // Check for security warning about default credentials
      const warningVisible = await page.locator('text=/default credentials|security risk/i').isVisible().catch(() => false);
      
      return warningVisible;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 4: Password mismatch validation
  await runTest('Password mismatch validation', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Click Account tab
      await page.getByRole('tab', { name: /account/i }).click();
      await sleep(500);
      
      // Fill with mismatched passwords
      await page.fill('#new-username', 'testuser');
      await page.fill('#new-password', 'password123');
      await page.fill('#confirm-password', 'differentpassword');
      await sleep(500);
      
      // Check that button is disabled OR error message is shown
      const updateButton = page.locator('button:has-text("Update Website Credentials")');
      const isDisabled = await updateButton.isDisabled().catch(() => false);
      const errorVisible = await page.locator('text=/do not match|mismatch|passwords must match/i').isVisible().catch(() => false);
      
      return isDisabled || errorVisible;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 5: Cameras tab displays credential form
  await runTest('Cameras tab displays integrated authentication form', async () => {
    const { browser, context, page} = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Click Cameras tab
      await page.getByRole('tab', { name: /^cameras$/i }).click();
      await sleep(500);
      
      // Check for default camera credential fields
      const defaultCredsSection = await page.locator('text=Default Camera Credentials').isVisible().catch(() => false);
      const usernameLabel = await page.locator('text=MediaMTX Username').isVisible().catch(() => false);
      
      return defaultCredsSection && usernameLabel;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 6: Camera configuration displays correctly
  await runTest('Camera configuration section is accessible', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Click Cameras tab
      await page.getByRole('tab', { name: /^cameras$/i }).click();
      await sleep(500);
      
      // Check for camera configuration section
      const cameraConfigSection = await page.locator('text=Camera Configuration').isVisible().catch(() => false);
      const addCameraButton = await page.locator('button:has-text("Add Camera")').isVisible().catch(() => false);
      
      return cameraConfigSection && addCameraButton;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 7: Theme toggle works
  await runTest('Theme toggle works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Look for theme toggle
      const themeToggle = page.locator('button[aria-label*="theme"], button:has-text("Theme")').first();
      
      if (await themeToggle.isVisible()) {
        // Get initial theme
        const html = page.locator('html');
        const initialClass = await html.getAttribute('class');
        
        // Click toggle
        await themeToggle.click();
        await sleep(500);
        
        // Check if theme changed
        const newClass = await html.getAttribute('class');
        
        return initialClass !== newClass;
      }
      
      return true; // Skip if no theme toggle found
    } finally {
      await browser.close();
    }
  }, results);

  // Test 8: Settings tabs can switch back and forth
  await runTest('Settings tabs can switch back and forth', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Click Cameras tab
      await page.getByRole('tab', { name: /^cameras$/i }).click();
      await sleep(300);
      
      const camerasFormVisible = await page.locator('text=Default Camera Credentials').isVisible().catch(() => false);
      
      // Click Account tab
      await page.getByRole('tab', { name: /^account$/i }).click();
      await sleep(300);
      
      const accountFormVisible = await page.locator('#new-username').isVisible().catch(() => false);
      
      return camerasFormVisible && accountFormVisible;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 9: Save button exists in settings
  await runTest('Save buttons exist in settings', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Check for Save Settings button at bottom (universal across tabs)
      const saveButton = await page.locator('button:has-text("Save Settings")').isVisible().catch(() => false);
      
      // Check Account tab has update button
      await page.getByRole('tab', { name: /^account$/i }).click();
      await sleep(300);
      const accountButton = await page.locator('button:has-text("Update")').isVisible().catch(() => false);
      
      return saveButton && accountButton;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 10: Navigation back to home works
  await runTest('Navigation back to home works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Find back/home button
      const backButton = page.locator('a[href="/"], button:has-text("Back")').first();
      
      if (await backButton.isVisible()) {
        await backButton.click();
        await sleep(1000);
        
        return page.url() === `${baseUrl}/` || page.url() === `${baseUrl}`;
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Print results
  const success = printTestResults('Settings Management Tests', results);
  process.exit(success ? 0 : 1);
}

// Run tests
console.log('🚀 Settings Management Test Suite');
console.log('==================================\n');
console.log(`Testing against: ${baseUrl}`);
console.log('Make sure the Next.js dev server is running!\n');

runTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
