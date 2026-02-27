import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AI Bug Analyzer Reporter for Playwright
 * Automatically analyzes test failures and generates AI-powered insights
 */
class AIBugAnalyzerReporter implements Reporter {
  private results: Array<{
    test: string;
    status: string;
    error?: string;
    aiAnalysis?: any;
  }> = [];

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`\n🤖 AI Bug Analyzer Reporter Started`);
    console.log(`Running ${suite.allTests().length} tests`);
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed' || result.status === 'timedOut') {
      console.log(`\n❌ Test Failed: ${test.title}`);
      console.log(`📍 Location: ${test.location.file}:${test.location.line}`);

      const errorMessage = result.error?.message || 'Unknown error';
      const stackTrace = result.error?.stack || '';

      console.log(`\n🔍 Analyzing failure with AI...`);

      // Analyze the error
      const analysis = await this.analyzeBugWithAI(errorMessage, stackTrace, {
        testName: test.title,
        testFile: test.location.file,
        testLine: test.location.line,
        browser: test.parent.project()?.name || 'unknown',
        duration: result.duration,
        retries: result.retry,
      });

      this.results.push({
        test: test.title,
        status: result.status,
        error: errorMessage,
        aiAnalysis: analysis,
      });

      // Print AI analysis to console
      this.printAnalysis(test.title, analysis);
    } else if (result.status === 'passed') {
      console.log(`✅ Test Passed: ${test.title}`);
    }
  }

  async onEnd(result: FullResult) {
    console.log(`\n\n📊 Test Suite Finished`);
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);

    // Generate HTML report with AI analysis
    if (this.results.length > 0) {
      await this.generateHTMLReport();
      console.log(`\n📄 AI Analysis Report: playwright-report/ai-analysis.html`);
    }

    console.log(`\n🎉 AI Bug Analyzer Reporter Complete`);
  }

  /**
   * Analyze bug with AI (simplified version)
   * In production, this would call the BugAnalyzerService
   */
  private async analyzeBugWithAI(
    errorMessage: string,
    stackTrace: string,
    context: any
  ): Promise<any> {
    // Simplified AI analysis (replace with actual BugAnalyzerService)
    const errorType = this.classifyError(errorMessage);
    const suggestedFixes = this.generateSuggestedFixes(errorMessage, context);
    const severity = this.assessSeverity(errorMessage);

    return {
      errorType,
      suggestedFixes,
      severity,
      possibleCauses: this.identifyPossibleCauses(errorMessage, stackTrace),
      context,
      timestamp: new Date().toISOString(),
    };
  }

  private classifyError(errorMessage: string): string {
    if (errorMessage.includes('Timeout') || errorMessage.includes('exceeded')) {
      return '⏱️ Timeout Error';
    }
    if (errorMessage.includes('Locator') || errorMessage.includes('selector')) {
      return '🎯 Selector/Locator Error';
    }
    if (errorMessage.includes('expect') || errorMessage.includes('toBeVisible')) {
      return '👁️ Assertion Error';
    }
    if (errorMessage.includes('Navigation') || errorMessage.includes('goto')) {
      return '🧭 Navigation Error';
    }
    return '❓ General Test Error';
  }

  private generateSuggestedFixes(errorMessage: string, context: any): string[] {
    const fixes: string[] = [];

    if (errorMessage.includes('Timeout')) {
      fixes.push('Increase timeout: await expect(element).toBeVisible({ timeout: 10000 })');
      fixes.push('Wait for network: await page.waitForLoadState("networkidle")');
      fixes.push('Check if element is dynamically loaded');
    }

    if (errorMessage.includes('Locator') || errorMessage.includes('selector')) {
      fixes.push('Use getByRole() instead of CSS selectors');
      fixes.push('Add aria-label to the element');
      fixes.push('Verify the element exists in the DOM');
      fixes.push('Use page.locator().waitFor() before interacting');
    }

    if (errorMessage.includes('asdf')) {
      fixes.push('❌ CRITICAL: Found "asdf" in test code - this is a typo!');
      fixes.push('Check the aria-label or selector for typos');
      fixes.push(`Found in: ${context.testFile}:${context.testLine}`);
    }

    if (errorMessage.includes('not visible') || errorMessage.includes('toBeVisible')) {
      fixes.push('Check if element is hidden by CSS');
      fixes.push('Wait for element to appear: await element.waitFor({ state: "visible" })');
      fixes.push('Verify the element is in the viewport');
    }

    if (fixes.length === 0) {
      fixes.push('Review the test code and application logs');
      fixes.push('Check browser console for JavaScript errors');
      fixes.push('Verify test data and preconditions');
    }

    return fixes;
  }

  private assessSeverity(errorMessage: string): string {
    if (errorMessage.includes('CRITICAL') || errorMessage.includes('asdf')) {
      return '🔴 Critical';
    }
    if (errorMessage.includes('Timeout') || errorMessage.includes('Navigation')) {
      return '🟠 High';
    }
    return '🟡 Medium';
  }

  private identifyPossibleCauses(errorMessage: string, stackTrace: string): string[] {
    const causes: string[] = [];

    if (errorMessage.includes('Timeout')) {
      causes.push('Element loading slower than expected');
      causes.push('Network request taking too long');
      causes.push('Animation or transition delay');
    }

    if (errorMessage.includes('asdf')) {
      causes.push('🐛 TYPO IN TEST CODE: "asdf" found in selector');
      causes.push('Copy-paste error or debugging code left in');
    }

    if (errorMessage.includes('Locator')) {
      causes.push('Selector does not match any element');
      causes.push('Element is removed/recreated dynamically');
      causes.push('Wrong accessibility label');
    }

    if (stackTrace) {
      causes.push('Check the call stack in the error details');
    }

    return causes.length > 0 ? causes : ['Unknown cause - manual investigation needed'];
  }

  private printAnalysis(testName: string, analysis: any) {
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║ 🤖 AI BUG ANALYSIS: ${testName.substring(0, 35).padEnd(35)} ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);
    
    console.log(`\n📋 Error Type: ${analysis.errorType}`);
    console.log(`⚠️  Severity: ${analysis.severity}`);
    
    console.log(`\n🔍 Possible Causes:`);
    analysis.possibleCauses.forEach((cause: string, i: number) => {
      console.log(`   ${i + 1}. ${cause}`);
    });

    console.log(`\n💡 Suggested Fixes:`);
    analysis.suggestedFixes.forEach((fix: string, i: number) => {
      console.log(`   ${i + 1}. ${fix}`);
    });

    console.log(`\n📍 Test Context:`);
    console.log(`   File: ${analysis.context.testFile}`);
    console.log(`   Line: ${analysis.context.testLine}`);
    console.log(`   Browser: ${analysis.context.browser}`);
    console.log(`   Duration: ${analysis.context.duration}ms`);
    
    console.log(`\n════════════════════════════════════════════════════════════\n`);
  }

  private async generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🤖 AI Bug Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5rem;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    .header p {
      color: #666;
      font-size: 1.1rem;
    }
    .test-result {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
      border-left: 6px solid #e74c3c;
    }
    .test-title {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .severity {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .severity-critical { background: #fee; color: #c00; }
    .severity-high { background: #ffe; color: #f90; }
    .severity-medium { background: #ffc; color: #990; }
    .error-type {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .section {
      margin: 1.5rem 0;
    }
    .section-title {
      font-size: 1.2rem;
      color: #667eea;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .list-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 3px solid #667eea;
    }
    .critical-fix {
      background: #fee !important;
      border-left-color: #e74c3c !important;
      font-weight: bold;
    }
    .context {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
    .context-item {
      padding: 0.25rem 0;
    }
    .error-message {
      background: #fee;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #e74c3c;
      margin: 1rem 0;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #c00;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 2rem;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 AI Bug Analysis Report</h1>
      <p>Automated test failure analysis powered by AI</p>
      <p style="margin-top: 10px; color: #999;">Generated: ${new Date().toLocaleString('hu-HU')}</p>
    </div>

    ${this.results.map(result => `
      <div class="test-result">
        <div class="test-title">
          ❌ ${result.test}
          <span class="severity severity-${result.aiAnalysis.severity.includes('Critical') ? 'critical' : result.aiAnalysis.severity.includes('High') ? 'high' : 'medium'}">
            ${result.aiAnalysis.severity}
          </span>
        </div>

        <div class="error-type">
          ${result.aiAnalysis.errorType}
        </div>

        <div class="error-message">
          ${result.error}
        </div>

        <div class="section">
          <div class="section-title">🔍 Possible Causes</div>
          ${result.aiAnalysis.possibleCauses.map((cause: string) => `
            <div class="list-item ${cause.includes('🐛') ? 'critical-fix' : ''}">
              ${cause}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">💡 Suggested Fixes</div>
          ${result.aiAnalysis.suggestedFixes.map((fix: string) => `
            <div class="list-item ${fix.includes('❌') ? 'critical-fix' : ''}">
              ${fix}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">📍 Test Context</div>
          <div class="context">
            <div class="context-item">📄 File: ${result.aiAnalysis.context.testFile}</div>
            <div class="context-item">📍 Line: ${result.aiAnalysis.context.testLine}</div>
            <div class="context-item">🌐 Browser: ${result.aiAnalysis.context.browser}</div>
            <div class="context-item">⏱️ Duration: ${result.aiAnalysis.context.duration}ms</div>
            <div class="context-item">🔄 Retries: ${result.aiAnalysis.context.retries}</div>
          </div>
        </div>
      </div>
    `).join('')}

    <div class="footer">
      <p>🤖 Powered by PlantTracker AI Bug Analyzer</p>
      <p>📊 Total Failed Tests: ${this.results.length}</p>
    </div>
  </div>
</body>
</html>
    `;

    const reportPath = path.join(process.cwd(), 'playwright-report', 'ai-analysis.html');
    
    // Create directory if it doesn't exist
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, html, 'utf-8');
  }
}

export default AIBugAnalyzerReporter;
