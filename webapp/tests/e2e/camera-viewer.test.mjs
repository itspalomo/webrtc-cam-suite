/**
 * Camera Viewer Tests
 * Tests the camera viewing, streaming, and player functionality
 */

import { setupBrowser, clearStorage, waitForNetworkIdle, sleep } from '../helpers/browser-setup.mjs';
import { performLogin } from '../helpers/auth-helpers.mjs';
import { createTestResults, runTest, printTestResults } from '../helpers/test-runner.mjs';
import TEST_CONFIG from '../fixtures/test-config.mjs';

const { baseUrl, defaultCredentials, mockCameras } = TEST_CONFIG;

async function runTests() {
  console.log('🧪 Starting Camera Viewer Tests...\n');
  const results = createTestResults();

  // Test 1: Home page displays camera grid
  await runTest('Home page displays camera grid', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      // Check for camera grid
      const cameraGrid = await page.locator('[data-testid="camera-grid"], .camera-grid').isVisible().catch(() => false);
      const cameraCards = await page.locator('[data-testid="camera-card"], .camera-card').count();
      
      return cameraGrid || cameraCards > 0;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 2: Camera card click navigates to viewer
  await runTest('Camera card click navigates to viewer', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      // Click "View Stream" link on first camera card
      const viewStreamLink = page.locator('a:has-text("View Stream")').first();
      if (await viewStreamLink.isVisible()) {
        await viewStreamLink.click();
        await sleep(1000);
        
        // Should navigate to viewer page
        const url = page.url();
        return url.includes('/viewer/');
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 3: Viewer page loads video player (SKIPPED - requires live stream)
  await runTest('Viewer page loads video player (SKIPPED - requires live stream)', async () => {
    // Skip this test - requires actual MediaMTX stream
    return 'skip';
  }, results);

  // Test 4: Player controls are visible (SKIPPED - requires live stream)
  await runTest('Player controls are visible (SKIPPED - requires live stream)', async () => {
    // Skip this test - requires actual MediaMTX stream
    return 'skip';
  }, results);

  // Test 5: Play/Pause button works (SKIPPED - requires live stream)
  await runTest('Play/Pause button toggles (SKIPPED - requires live stream)', async () => {
    // Skip this test - requires actual MediaMTX stream
    return 'skip';
  }, results);

  // Test 6: Mute/Unmute button works (SKIPPED - requires live stream)
  await runTest('Mute/Unmute button toggles (SKIPPED - requires live stream)', async () => {
    // Skip this test - requires actual MediaMTX stream
    return 'skip';
  }, results);

  // Test 7: Camera switcher is visible (SKIPPED - requires live stream)
  await runTest('Camera switcher is visible (SKIPPED - requires live stream)', async () => {
    // Skip this test - requires actual MediaMTX stream
    return 'skip';
  }, results);

  // Test 8: Stats HUD shows stream information (SKIPPED - requires live stream)
  await runTest('Stats HUD shows stream information (SKIPPED - requires live stream)', async () => {
    // Skip this test - requires actual MediaMTX stream
    return 'skip';
  }, results);

  // Test 9: Back to home button works
  await runTest('Back to home button works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera-0`);
      await waitForNetworkIdle(page);
      
      // Find and click back/home button
      const backButton = page.locator('button:has-text("Back"), a[href="/"], button[aria-label*="back"]').first();
      
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

  // Test 10: Invalid camera ID shows error
  await runTest('Invalid camera ID shows error or fallback', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/invalid-camera-999`);
      await waitForNetworkIdle(page);
      await sleep(1000);
      
      // Should show error or redirect to home
      const errorMessage = await page.locator('text=/not found|invalid|error/i').isVisible().catch(() => false);
      const redirectedHome = page.url() === `${baseUrl}/`;
      
      return errorMessage || redirectedHome;
    } finally {
      await browser.close();
    }
  }, results);

  // Print results
  const success = printTestResults('Camera Viewer Tests', results);
  process.exit(success ? 0 : 1);
}

// Run tests
console.log('🚀 Camera Viewer Test Suite');
console.log('============================\n');
console.log(`Testing against: ${baseUrl}`);
console.log('Make sure the Next.js dev server is running!\n');

runTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
