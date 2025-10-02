/**
 * Navigation and Routing Tests
 * Tests navigation, camera switching, and routing behavior
 */

import { setupBrowser, clearStorage, waitForNetworkIdle, sleep } from '../helpers/browser-setup.mjs';
import { performLogin } from '../helpers/auth-helpers.mjs';
import { createTestResults, runTest, printTestResults } from '../helpers/test-runner.mjs';
import TEST_CONFIG from '../fixtures/test-config.mjs';

const { baseUrl, defaultCredentials } = TEST_CONFIG;

async function runTests() {
  console.log('🧪 Starting Navigation Tests...\n');
  const results = createTestResults();

  // Test 1: Navigation menu is visible
  await runTest('Navigation menu is visible', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      // Check for navigation elements
      const homeLink = await page.locator('a[href="/"], button:has-text("Home")').isVisible().catch(() => false);
      const settingsLink = await page.locator('a[href="/settings"], button:has-text("Settings")').isVisible().catch(() => false);
      
      return homeLink || settingsLink;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 2: Navigate from home to settings
  await runTest('Navigate from home to settings', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      // Click settings link/button
      const settingsLink = page.locator('a[href="/settings"], button:has-text("Settings")').first();
      
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await sleep(1000);
        
        return page.url().includes('/settings');
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 3: Navigate from settings back to home
  await runTest('Navigate from settings back to home', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Click home/back link
      const homeLink = page.locator('a[href="/"], button:has-text("Home"), button:has-text("Back")').first();
      
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await sleep(1000);
        
        return page.url() === `${baseUrl}/` || page.url() === `${baseUrl}`;
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 4: Browser back button works
  await runTest('Browser back button works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Navigate through pages
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Use browser back
      await page.goBack();
      await sleep(500);
      
      return page.url() === `${baseUrl}/` || page.url() === `${baseUrl}`;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 5: Direct URL access to viewer works
  await runTest('Direct URL access to viewer works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Navigate directly to viewer
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      
      return page.url().includes('/viewer/camera1');
    } finally {
      await browser.close();
    }
  }, results);

  // Test 6: Camera switcher next button works
  await runTest('Camera switcher next button works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      
      const initialUrl = page.url();
      
      // Click next button
      const nextButton = page.locator('button:has-text("Next"), button[aria-label*="next"]').first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await sleep(1000);
        
        const newUrl = page.url();
        return initialUrl !== newUrl && newUrl.includes('/viewer/');
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 7: Camera switcher previous button works
  await runTest('Camera switcher previous button works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera2`);
      await waitForNetworkIdle(page);
      
      const initialUrl = page.url();
      
      // Click previous button
      const prevButton = page.locator('button:has-text("Previous"), button[aria-label*="prev"]').first();
      
      if (await prevButton.isVisible()) {
        await prevButton.click();
        await sleep(1000);
        
        const newUrl = page.url();
        return initialUrl !== newUrl && newUrl.includes('/viewer/');
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 8: Keyboard shortcut for next camera
  await runTest('Keyboard shortcut for next camera works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      
      const initialUrl = page.url();
      
      // Press right arrow or 'n' key
      await page.keyboard.press('ArrowRight');
      await sleep(1000);
      
      const newUrl = page.url();
      
      if (initialUrl === newUrl) {
        // Try 'n' key as alternative
        await page.keyboard.press('n');
        await sleep(1000);
        
        return page.url() !== initialUrl;
      }
      
      return true;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 9: URL updates when switching cameras
  await runTest('URL updates when switching cameras', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      // Click on a camera card
      const cameraCard = page.locator('[data-testid="camera-card"], .camera-card').first();
      
      if (await cameraCard.isVisible()) {
        await cameraCard.click();
        await sleep(1000);
        
        return page.url().includes('/viewer/');
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 10: Privacy policy link works
  await runTest('Privacy policy link works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      // Look for privacy link (usually in footer)
      const privacyLink = page.locator('a[href="/privacy"], a:has-text("Privacy")').first();
      
      if (await privacyLink.isVisible()) {
        await privacyLink.click();
        await sleep(1000);
        
        return page.url().includes('/privacy');
      }
      
      return true; // Skip if no privacy link
    } finally {
      await browser.close();
    }
  }, results);

  // Print results
  const success = printTestResults('Navigation Tests', results);
  process.exit(success ? 0 : 1);
}

// Run tests
console.log('🚀 Navigation Test Suite');
console.log('========================\n');
console.log(`Testing against: ${baseUrl}`);
console.log('Make sure the Next.js dev server is running!\n');

runTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
