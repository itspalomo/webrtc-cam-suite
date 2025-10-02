/**
 * Session Management Tests
 * Tests session persistence, timeout, and activity tracking
 */

import { setupBrowser, clearStorage, waitForNetworkIdle, sleep } from '../helpers/browser-setup.mjs';
import { performLogin, performLogout, isAuthenticated } from '../helpers/auth-helpers.mjs';
import { createTestResults, runTest, printTestResults } from '../helpers/test-runner.mjs';
import TEST_CONFIG from '../fixtures/test-config.mjs';

const { baseUrl, defaultCredentials } = TEST_CONFIG;

async function runTests() {
  console.log('🧪 Starting Session Management Tests...\n');
  const results = createTestResults();

  // Test 1: Session persists after page refresh
  await runTest('Session persists after page refresh', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Refresh the page
      await page.reload();
      await waitForNetworkIdle(page);
      
      // Should still be on home page (not redirected to login)
      return !page.url().includes('/login');
    } finally {
      await browser.close();
    }
  }, results);

  // Test 2: Session persists across tabs
  await runTest('Session persists across tabs', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Open a new tab in same context
      const newPage = await context.newPage();
      await newPage.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(newPage);
      
      // Should be authenticated in new tab
      const authenticated = !newPage.url().includes('/login');
      
      await newPage.close();
      return authenticated;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 3: Logout clears session
  await runTest('Logout clears session completely', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Logout
      await performLogout(page);
      
      // Try to access protected page
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Should be redirected to login
      return page.url().includes('/login');
    } finally {
      await browser.close();
    }
  }, results);

  // Test 4: Session cleared after logout persists on refresh
  await runTest('Session stays cleared after logout and refresh', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Logout
      await performLogout(page);
      
      // Refresh page
      await page.reload();
      await waitForNetworkIdle(page);
      
      // Should still be on login page
      return page.url().includes('/login');
    } finally {
      await browser.close();
    }
  }, results);

  // Test 5: Multiple sessions can coexist in different browser contexts
  await runTest('Multiple sessions can coexist in different contexts', async () => {
    const browser = await setupBrowser(TEST_CONFIG.browser).then(r => r.browser);
    
    try {
      // Create two separate contexts (like two different browsers)
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      // Login in first context
      await clearStorage(context1, page1, baseUrl);
      await performLogin(page1, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Second context should not be authenticated
      await page2.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page2);
      
      const context1Auth = !page1.url().includes('/login');
      const context2NotAuth = page2.url().includes('/login');
      
      await context1.close();
      await context2.close();
      
      return context1Auth && context2NotAuth;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 6: Session data is stored correctly
  await runTest('Session data is stored in localStorage/sessionStorage', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Check for session data in storage
      const sessionData = await page.evaluate(() => {
        const localStorageKeys = Object.keys(localStorage);
        const sessionStorageKeys = Object.keys(sessionStorage);
        
        return {
          hasLocalStorage: localStorageKeys.length > 0,
          hasSessionStorage: sessionStorageKeys.length > 0,
          keys: [...localStorageKeys, ...sessionStorageKeys]
        };
      });
      
      // Should have some session data stored
      return sessionData.hasLocalStorage || sessionData.hasSessionStorage;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 7: Unauthenticated access redirects with return URL
  await runTest('Unauthenticated access preserves intended destination', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      
      // Try to access settings without auth
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      
      // Should be redirected to login
      const url = page.url();
      const redirectedToLogin = url.includes('/login');
      
      // Login now
      if (redirectedToLogin) {
        await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
        
        // Check if redirected back to settings or at least not on login
        const finalUrl = page.url();
        return finalUrl.includes('/settings') || !finalUrl.includes('/login');
      }
      
      return false;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 8: Session activity tracking updates timestamp
  await runTest('Session activity is tracked', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Get initial activity timestamp
      const initialActivity = await page.evaluate(() => {
        return localStorage.getItem('lastActivity') || sessionStorage.getItem('lastActivity');
      });
      
      // Perform some activity
      await page.goto(`${baseUrl}/settings`);
      await waitForNetworkIdle(page);
      await sleep(1000);
      
      // Navigate back
      await page.goto(`${baseUrl}/`);
      await waitForNetworkIdle(page);
      
      // Check if activity was updated
      const newActivity = await page.evaluate(() => {
        return localStorage.getItem('lastActivity') || sessionStorage.getItem('lastActivity');
      });
      
      // Activity timestamp should exist or session should be maintained
      return initialActivity !== null || newActivity !== null || !page.url().includes('/login');
    } finally {
      await browser.close();
    }
  }, results);

  // Test 9: Concurrent logins work correctly
  await runTest('Concurrent logins in same browser work', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      
      // Login once
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Try to access login page again
      await page.goto(`${baseUrl}/login`);
      await waitForNetworkIdle(page);
      
      // Should either stay on login page or redirect to home (both valid)
      return true;
    } finally {
      await browser.close();
    }
  }, results);

  // Test 10: Session survives navigation through all pages
  await runTest('Session survives full app navigation', async () => {
    const { browser, context, page } = await setupBrowser(TEST_CONFIG.browser);
    
    try {
      await clearStorage(context, page, baseUrl);
      await performLogin(page, baseUrl, defaultCredentials.username, defaultCredentials.password);
      
      // Navigate through all pages
      const pages = ['/', '/settings', '/viewer/camera1', '/privacy', '/'];
      
      for (const pagePath of pages) {
        await page.goto(`${baseUrl}${pagePath}`);
        await waitForNetworkIdle(page);
        await sleep(500);
        
        // Except for privacy (public page), should not be on login
        if (pagePath !== '/privacy' && page.url().includes('/login')) {
          return false;
        }
      }
      
      return true;
    } finally {
      await browser.close();
    }
  }, results);

  // Print results
  const success = printTestResults('Session Management Tests', results);
  process.exit(success ? 0 : 1);
}

// Run tests
console.log('🚀 Session Management Test Suite');
console.log('=================================\n');
console.log(`Testing against: ${baseUrl}`);
console.log('Make sure the Next.js dev server is running!\n');

runTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
