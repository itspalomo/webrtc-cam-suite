/**
 * Authentication helper functions
 */

/**
 * Login with provided credentials
 */
export async function loginWithCredentials(page, username, password) {
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}

/**
 * Complete login flow and wait for redirect
 */
export async function performLogin(page, baseUrl, username, password) {
  await page.goto(`${baseUrl}/login`);
  await page.waitForLoadState('networkidle');
  
  await loginWithCredentials(page, username, password);
  
  // Wait for redirect to home
  await page.waitForURL(`${baseUrl}/`, { timeout: 5000 });
  
  return page.url() === `${baseUrl}/`;
}

/**
 * Logout and verify redirect to login
 */
export async function performLogout(page) {
  await page.click('button:has-text("Logout"), a:has-text("Logout")');
  await page.waitForURL(/\/login/, { timeout: 3000 });
  return page.url().includes('/login');
}

/**
 * Check if user is authenticated (on a protected page)
 */
export async function isAuthenticated(page, baseUrl) {
  await page.goto(`${baseUrl}/settings`);
  await page.waitForLoadState('networkidle');
  return !page.url().includes('/login');
}

/**
 * Update website credentials in settings
 */
export async function updateWebsiteCredentials(page, newUsername, newPassword) {
  // Navigate to Account tab
  await page.getByRole('tab', { name: 'Account' }).click();
  await page.waitForTimeout(500);
  
  // Fill in new credentials
  await page.fill('#new-username', newUsername);
  await page.fill('#new-password', newPassword);
  await page.fill('#confirm-password', newPassword);
  
  // Submit
  await page.click('button:has-text("Update Website Credentials")');
  await page.waitForTimeout(1000);
  
  // Check for success message
  const successVisible = await page.locator('text=successfully').isVisible();
  return successVisible;
}

/**
 * Update camera credentials in settings
 */
export async function updateCameraCredentials(page, username, password, remember = false) {
  // Navigate to Camera Auth tab
  await page.getByRole('tab', { name: 'Camera Auth' }).click();
  await page.waitForTimeout(500);
  
  // Fill in camera credentials
  await page.fill('#camera-username', username);
  await page.fill('#camera-password', password);
  
  if (remember) {
    await page.check('#remember-credentials');
  }
  
  // Submit
  await page.click('button:has-text("Save Camera Credentials")');
  await page.waitForTimeout(1000);
  
  // Check for success message
  const successVisible = await page.locator('text=successfully').isVisible();
  return successVisible;
}
