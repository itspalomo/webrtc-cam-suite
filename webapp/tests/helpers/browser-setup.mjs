/**
 * Browser setup and utilities for Playwright tests
 */
import { chromium } from 'playwright';

/**
 * Launch a new browser instance with optional configuration
 */
export async function setupBrowser(options = {}) {
  const {
    headless = false,
    slowMo = 0,
    viewport = { width: 1280, height: 720 },
    ...rest
  } = options;

  const browser = await chromium.launch({ 
    headless, 
    slowMo,
    ...rest 
  });
  
  const context = await browser.newContext({
    viewport,
    recordVideo: process.env.RECORD_VIDEO ? {
      dir: 'webapp/tests/videos/',
      size: viewport
    } : undefined
  });
  
  const page = await context.newPage();
  
  return { browser, context, page };
}

/**
 * Clear browser storage (cookies, localStorage, sessionStorage)
 */
export async function clearStorage(context, page, baseUrl) {
  await context.clearCookies();
  await page.goto(baseUrl);
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore security errors
    }
  });
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (e) {
    console.warn('Network idle timeout - continuing anyway');
  }
}

/**
 * Take a screenshot on failure
 */
export async function captureScreenshotOnFailure(page, testName) {
  try {
    await page.screenshot({
      path: `webapp/tests/screenshots/${testName}-failure-${Date.now()}.png`,
      fullPage: true
    });
  } catch (e) {
    console.warn('Failed to capture screenshot:', e.message);
  }
}

/**
 * Utility to sleep/wait
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
