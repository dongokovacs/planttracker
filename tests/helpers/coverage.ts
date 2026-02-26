import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function startCoverage(page: Page): Promise<void> {
  await page.coverage.startJSCoverage();
  await page.coverage.startCSSCoverage();
}

export async function stopAndSaveCoverage(
  page: Page,
  testName: string
): Promise<void> {
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ]);

  // Create coverage directory
  const coverageDir = path.join(process.cwd(), 'coverage', 'raw');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  // Save JS coverage
  fs.writeFileSync(
    path.join(coverageDir, `${testName}-js.json`),
    JSON.stringify(jsCoverage, null, 2)
  );

  // Save CSS coverage
  fs.writeFileSync(
    path.join(coverageDir, `${testName}-css.json`),
    JSON.stringify(cssCoverage, null, 2)
  );

  // Calculate and log JS coverage percentage
  let totalBytes = 0;
  let usedBytes = 0;
  for (const entry of jsCoverage) {
    totalBytes += entry.text.length;
    for (const range of entry.ranges) {
      usedBytes += range.end - range.start;
    }
  }
  
  const coveragePercentage = totalBytes > 0 
    ? ((usedBytes / totalBytes) * 100).toFixed(2) 
    : '0.00';
  
  console.log(`📊 ${testName} - JS Coverage: ${coveragePercentage}%`);
}
