/**
 * Test runner utilities
 */
import { captureScreenshotOnFailure } from './browser-setup.mjs';

/**
 * Create a test result tracker
 */
export function createTestResults() {
  return {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };
}

/**
 * Run a single test with error handling
 */
export async function runTest(testName, testFn, results, page = null) {
  console.log(`\n📝 ${testName}`);
  
  try {
    const result = await testFn();
    
    if (result === 'skip') {
      console.log(`⏭️  SKIPPED: ${testName}\n`);
      results.skipped++;
      results.tests.push({ name: testName, status: 'skipped' });
      return;
    }
    
    if (result) {
      console.log(`✅ PASSED: ${testName}\n`);
      results.passed++;
      results.tests.push({ name: testName, status: 'passed' });
    } else {
      console.log(`❌ FAILED: ${testName}\n`);
      results.failed++;
      results.tests.push({ name: testName, status: 'failed' });
      
      if (page) {
        await captureScreenshotOnFailure(page, testName.replace(/\s+/g, '-'));
      }
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    results.failed++;
    results.tests.push({ 
      name: testName, 
      status: 'failed', 
      error: error.message 
    });
    
    if (page) {
      await captureScreenshotOnFailure(page, testName.replace(/\s+/g, '-'));
    }
  }
}

/**
 * Print test results summary
 */
export function printTestResults(suiteName, results) {
  const total = results.passed + results.failed + results.skipped;
  const successRate = total > 0 
    ? ((results.passed / (results.passed + results.failed)) * 100).toFixed(1) 
    : 0;
  
  console.log('\n' + '='.repeat(70));
  console.log(`📊 ${suiteName} - TEST RESULTS SUMMARY`);
  console.log('='.repeat(70));
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log('='.repeat(70));
  
  console.log('\n📝 Detailed Results:');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'passed' ? '✅' : test.status === 'skipped' ? '⏭️' : '❌';
    console.log(`${index + 1}. ${icon} ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  return results.failed === 0;
}
