#!/usr/bin/env node

/**
 * Run All Tests
 * Executes all E2E test suites in sequence
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_SUITES = [
  'e2e/auth-flow.test.mjs',
  'e2e/camera-viewer.test.mjs',
  'e2e/settings.test.mjs',
  'e2e/navigation.test.mjs',
  'e2e/player-controls.test.mjs',
  'e2e/session-management.test.mjs'
];

const results = {
  passed: [],
  failed: [],
  total: TEST_SUITES.length
};

function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🧪 Running: ${testFile}`);
    console.log('='.repeat(70));
    
    const testPath = join(__dirname, testFile);
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        results.passed.push(testFile);
      } else {
        results.failed.push(testFile);
      }
      resolve(code);
    });
    
    child.on('error', (error) => {
      console.error(`Error running ${testFile}:`, error);
      results.failed.push(testFile);
      resolve(1);
    });
  });
}

async function runAllTests() {
  console.log('🚀 Starting Full E2E Test Suite');
  console.log('================================\n');
  console.log(`Total test suites to run: ${TEST_SUITES.length}\n`);
  
  const startTime = Date.now();
  
  for (const testFile of TEST_SUITES) {
    await runTest(testFile);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 FULL TEST SUITE RESULTS');
  console.log('='.repeat(70));
  console.log(`Total Suites: ${results.total}`);
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('='.repeat(70));
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Suites:');
    results.passed.forEach(suite => console.log(`  - ${suite}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Suites:');
    results.failed.forEach(suite => console.log(`  - ${suite}`));
  }
  
  console.log('');
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('❌ Test runner crashed:', error);
  process.exit(1);
});
