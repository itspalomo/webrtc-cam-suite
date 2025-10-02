/**
 * Test configuration and constants
 */

export const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  
  // Default credentials
  defaultCredentials: {
    username: 'admin',
    password: 'changeme'
  },
  
  // Test credentials for credential updates
  testCredentials: {
    username: 'testuser',
    password: 'testpass123'
  },
  
  // Camera credentials
  cameraCredentials: {
    username: 'camera',
    password: 'camerapass'
  },
  
  // Browser options
  browser: {
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '0'),
    viewport: {
      width: 1280,
      height: 720
    }
  },
  
  // Test cameras (mock data)
  mockCameras: [
    { id: 'camera1', name: 'Front Door', path: '/camera1' },
    { id: 'camera2', name: 'Backyard', path: '/camera2' },
    { id: 'camera3', name: 'Garage', path: '/camera3' }
  ]
};

export default TEST_CONFIG;
