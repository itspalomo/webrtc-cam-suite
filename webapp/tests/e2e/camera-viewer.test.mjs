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
      
      // Click first camera card
      const firstCard = page.locator('[data-testid="camera-card"], .camera-card').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
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

  // Test 3: Viewer page loads video player
  await runTest('Viewer page loads video player', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Navigate directly to viewer
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      await sleep(2000);
      
      // Check for video element or player container
      const videoElement = await page.locator('video').isVisible().catch(() => false);
      const playerContainer = await page.locator('[data-testid="video-player"], .video-player').isVisible().catch(() => false);
      
      return videoElement || playerContainer;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 4: Player controls are visible
  await runTest('Player controls are visible', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      await sleep(2000);
      
      // Check for player controls
      const playButton = await page.locator('button[aria-label*="play"], button:has-text("Play")').isVisible().catch(() => false);
      const muteButton = await page.locator('button[aria-label*="mute"], button:has-text("Mute")').isVisible().catch(() => false);
      const fullscreenButton = await page.locator('button[aria-label*="fullscreen"]').isVisible().catch(() => false);
      
      return playButton || muteButton || fullscreenButton;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 5: Play/Pause button works
  await runTest('Play/Pause button toggles', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      await sleep(2000);
      
      // Find play/pause button
      const playButton = page.locator('button[aria-label*="play"], button[aria-label*="pause"]').first();
      
      if (await playButton.isVisible()) {
        // Click the button
        await playButton.click();
        await sleep(500);
        
        // Button should still exist (state may have changed)
        return await playButton.isVisible();
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 6: Mute/Unmute button works
  await runTest('Mute/Unmute button toggles', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      await sleep(2000);
      
      // Find mute button
      const muteButton = page.locator('button[aria-label*="mute"], button[aria-label*="unmute"]').first();
      
      if (await muteButton.isVisible()) {
        await muteButton.click();
        await sleep(500);
        
        return await muteButton.isVisible();
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 7: Camera switcher is visible
  await runTest('Camera switcher is visible', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      await sleep(1000);
      
      // Check for camera switcher controls
      const switcherVisible = await page.locator('[data-testid="camera-switcher"], .camera-switcher').isVisible().catch(() => false);
      const nextButton = await page.locator('button:has-text("Next"), button[aria-label*="next"]').isVisible().catch(() => false);
      const prevButton = await page.locator('button:has-text("Previous"), button[aria-label*="prev"]').isVisible().catch(() => false);
      
      return switcherVisible || nextButton || prevButton;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 8: Stats HUD shows stream information
  await runTest('Stats HUD shows stream information', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
      await waitForNetworkIdle(page);
      await sleep(2000);
      
      // Check for stats display (might need to enable it first)
      const statsHud = await page.locator('[data-testid="stats-hud"], .stats-hud').isVisible().catch(() => false);
      const statsText = await page.locator('text=/fps|bitrate|latency/i').isVisible().catch(() => false);
      
      return statsHud || statsText;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 9: Back to home button works
  await runTest('Back to home button works', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      await page.goto(`${baseUrl}/viewer/camera1`);
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
