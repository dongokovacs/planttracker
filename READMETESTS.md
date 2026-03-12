# PlantTracker - Test Architecture & Guidelines

## Executive Summary

PlantTracker uses a **Page Object Model (POM)** pattern for E2E testing with Playwright. Tests are organized by features with reusable page objects that abstract UI selectors and interactions through convenience methods and step-by-step interactions. This architecture ensures maintainability, readability, and scalability.

**Key Features:**
- Convenience methods for complete workflows (`createFullPlant()`)
- Step-by-step interactions for intermediate assertions
- Semantic selectors with accessibility-first priority
- Guardian rules for AI-generated tests

**Test Stack:**
- Framework: Playwright (TypeScript)
- Pattern: Page Object Model (POM)
- Structure: Feature-based organization
- CI/CD: GitHub Actions ready

---

## Scope & Limitations

**⚠️ This is a demo application with basic UI/E2E testing only.**

### What's Included ✅
- **UI/E2E Testing**: User interaction flows (navigation, form filling, submission)
- **Basic Validation**: Visual assertions and navigation verification
- **Page Object Model**: Reusable components for UI interaction abstraction
- **Accessibility Patterns**: Semantic selectors and WCAG-compliant locators

### What's NOT Included ❌
- **API Schema Response Validation**: No database schema verification tests
- **Load/Stress Testing**: No performance under heavy load
- **Security Testing**: No XSS, CSRF, or authentication penetration tests
- **Visual Regression Testing**: No screenshot comparisons

### Future Enhancements
For production use, consider adding:
- API unit tests with Jest (backend)
- API integration tests
- Database schema validation
- Visual regression testing (Percy, Chromatic)
- Performance/load testing (k6, Artillery)
- Security scanning (OWASP, Snyk)

## Test Architecture

### 1. **Page Object Model (POM)**

Tests use page objects that abstract UI selectors and interactions. Locators are initialized in the constructor for performance and maintainability.

```typescript
// ✅ Good: Page Object with pre-initialized Locators
export class CreateFormPage {
  private readonly submitButton: Locator;
  private readonly plantNameInput: Locator;

  constructor(private readonly page: Page) {
    this.submitButton = page.getByRole('button', { name: /Hozzáadás/i });
    this.plantNameInput = page.getByLabel(/Növény neve/i);
  }

  async fillPlantName(name: string): Promise<void> {
    await this.plantNameInput.fill(name);
  }
}

// ✅ Good: Single method for complete workflow
await formPage.createFullPlant(
  'Monstera',
  'Monstera deliciosa',
  '2026-03-03',
  'Window'
);

// ✅ Also good: Step-by-step with intermediate assertions
await formPage.navigateToForm();
await expect(page.getByRole('heading', { name: /Új növény/i })).toBeVisible();
await formPage.fillPlantName('Monstera');
await formPage.submitForm();

// ❌ Bad: Raw selectors scattered in tests
await page.getByLabel(/Növény neve/i).fill('Monstera');
```

**Benefits:**
- **Maintainability**: UI changes only affect page objects
- **Performance**: Locators created once, reused many times
- **Readability**: Tests read like documentation
- **Reusability**: Page objects shared across multiple tests
- **Scalability**: Easy to add new interactions

### 2. **Directory Structure**

```
tests/
├── plant-management.spec.ts    # Feature test suite
├── test-options.ts             # Fixtures & imports
├── pages/
│   └── createForm.page.ts       # Page Object for form
├── helpers/
│   └── coverage.ts              # Test utilities
└── reporters/
    └── ai-bug-analyzer-reporter.ts  # Custom reporter
```

### 3. **Selector Priority**

Always follow this hierarchy for maximum accessibility compliance:

```typescript
1. getByRole()         // Best: Semantic, accessible
2. getByLabel()        // Labels for form fields
3. getByPlaceholder()  // Placeholder text
4. getByText()         // Visible text content
5. getByTestId()       // Last resort: data-testid
```

❌ **NEVER use XPath or CSS selectors in tests**

---

## Guardian Rules for AI-Generated Tests

### Core Rules

#### 1. **No `any` Types**
```typescript
// ❌ Bad
const data: any = {};

// ✅ Good
interface PlantData {
  name: string;
  species?: string;
}
const data: PlantData = {};
```

#### 2. **Initialize Locators in Constructor**
```typescript
// ❌ Bad: Locators created on every method call (performance issue)
private get submitButton() {
  return this.page.getByRole('button', { name: /Hozzáadás/i });
}

// ✅ Good: Locators initialized once in constructor
private readonly submitButton: Locator;

constructor(private readonly page: Page) {
  this.submitButton = page.getByRole('button', { name: /Hozzáadás/i });
}
```

#### 3. **Use Fixtures, Never `new PageObject(page)`**
```typescript
// ❌ Bad
import { CreateFormPage } from './pages/createForm.page';
const formPage = new CreateFormPage(page);

// ✅ Good
import { test, CreateFormPage } from './test-options';
```

#### 4. **No Hard Waits**
```typescript
// ❌ Bad
await page.waitForTimeout(3000);

// ✅ Good
await expect(page.getByRole('button')).toBeVisible();
```

#### 5. **Test One Thing**
Each test should verify a single feature or flow. Use convenience methods for complete workflows or step-by-step methods when you need intermediate assertions:

```typescript
// ✅ Good: Single workflow test
test('plant creation success', async ({ page }) => {
  const formPage = new CreateFormPage(page);
  await formPage.createFullPlant('Monstera', 'Monstera deliciosa', '2026-03-03', 'Window');
  await expect(page).toHaveURL(/\/plants\//);
});

// ✅ Also good: Step-by-step for validation
test('plant creation form validation', async ({ page }) => {
  const formPage = new CreateFormPage(page);
  await formPage.navigateToForm();
  await formPage.fillPlantName('');  // Empty name
  await expect(formPage.submitButton).toBeDisabled();  // Validation works
});
```

---

## Accessibility Testing Rules

**When generating accessibility tests, apply these rules:**

### 1. **Semantic HTML Priority**
- Test that interactive elements use proper roles
- Verify label-input associations
- Check for ARIA attributes where needed

```typescript
test('form has accessible labels', async ({ page }) => {
  const nameInput = page.getByLabel(/Növény neve/i);
  expect(nameInput).toBeDefined();
});
```

### 2. **Keyboard Navigation**
```typescript
test('form is keyboard navigable', async ({ page }) => {
  await page.goto('/plants/new');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeDefined();
  await page.keyboard.press('Tab');
  // Continue for all form fields
});
```

### 3. **Color Contrast (with Axe)**
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('dashboard has proper contrast', async ({ page }) => {
  await page.goto('/dashboard');
  await injectAxe(page);
  await checkA11y(page);
});
```

### 4. **Screen Reader Support**
```typescript
test('heading is announced correctly', async ({ page }) => {
  const heading = page.getByRole('heading', { name: /PlantTracker/i });
  await expect(heading).toBeVisible();
});
```

---

## Performance Testing Rules

**When generating performance tests, follow these guidelines:**

### 1. **Web Vitals Monitoring**
```typescript
test('dashboard meets Core Web Vitals', async ({ page }) => {
  const metrics = await page.evaluate(() => ({
    FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    LCP: performance.getEntriesByName('largest-contentful-paint').pop()?.startTime,
    CLS: 0, // Cumulative Layout Shift
  }));
  
  expect(metrics.FCP).toBeLessThan(1800); // < 1.8s
  expect(metrics.LCP).toBeLessThan(2500); // < 2.5s
});
```

### 2. **Load Time Assertions**
```typescript
test('plant list loads within budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/plants');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // < 3 seconds
});
```

### 3. **Network Activity Limits**
```typescript
test('dashboard uses efficient API calls', async ({ page }) => {
  let requestCount = 0;
  page.on('request', (req) => {
    if (req.url().includes('/api')) requestCount++;
  });
  
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  expect(requestCount).toBeLessThan(5); // Max 5 API calls
});
```

### 4. **Bundle Size Checks**
```typescript
test('initial bundle is optimized', async ({ page }) => {
  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter(r => r.name.includes('main'))
      .reduce((acc, r) => acc + r.transferSize, 0)
  );
  
  expect(resources).toBeLessThan(500000); // < 500KB
});
```

---

## Locator Management Best Practices

Locators are pre-initialized in the constructor for optimal performance and maintainability:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class CreateFormPage {
  // ✅ Pre-initialized locators
  private readonly plantNameInput: Locator;
  private readonly submitButton: Locator;
  private readonly formHeading: Locator;

  constructor(private readonly page: Page) {
    this.plantNameInput = page.getByLabel(/Növény neve/i);
    this.submitButton = page.getByRole('button', { name: /Hozzáadás/i });
    this.formHeading = page.getByRole('heading', { name: /Új növény/i });
  }

  async fillPlantName(name: string): Promise<void> {
    await this.plantNameInput.fill(name);
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }
}
```

**Why this approach:**
- Locators created once → better performance
- Type-safe: explicit `Locator` types
- Selective exposure: Only expose necessary actions
- Central location: All selectors in one place

---

## Test Writing Best Practices

### 1. **Use Convenience Methods for Complete Workflows**
```typescript
test('create and verify plant', async ({ page }) => {
  const formPage = new CreateFormPage(page);
  
  // Complete workflow in one call
  await formPage.createFullPlant(
    'Monstera',
    'Monstera deliciosa',
    '2026-03-03',
    'Window'
  );
  
  await expect(page.getByRole('heading', { name: /Monstera/i }))
    .toBeVisible();
});
```

### 2. **Use Step-by-Step Methods for Intermediate Assertions**
```typescript
test('form validation', async ({ page }) => {
  const formPage = new CreateFormPage(page);
  
  // When you need to assert between steps
  await formPage.navigateToForm();
  await expect(page.getByRole('heading', { name: /Új növény/i }))
    .toBeVisible();
  
  await formPage.fillPlantName('Test');
  await expect(page.getByDisplayValue('Test')).toBeVisible();
});
```

### 3. **Avoid Test Interdependencies**
```typescript
// ❌ Bad: Tests depend on each other
test('step 1: create plant', async ({ page }) => { ... });
test('step 2: edit plant', async ({ page }) => { ... });

// ✅ Good: Tests are independent
test('full plant lifecycle', async ({ page }) => {
  const formPage = new CreateFormPage(page);
  
  // Create
  await formPage.createFullPlant(...);
  
  // Edit
  await formPage.editPlant(...);
  
  // Delete
  await formPage.deletePlant(...);
});
```

### 4. **Include Assertions**
```typescript
test('plant card displays correct info', async ({ page }) => {
  const formPage = new CreateFormPage(page);
  
  await formPage.createFullPlant(
    'Monstera',
    'Monstera deliciosa',
    '2026-03-03',
    'Window'
  );
  
  const card = formPage.getPlantCard('Monstera');
  
  // Multiple assertions in one test
  await expect(card).toBeVisible();
  await expect(card.getByText('Monstera')).toBeVisible();
  await expect(card.getByText('deliciosa')).toBeVisible();
});
```

---

## Guardian Rules Summary

| Rule | Enforce | Why |
|------|---------|-----|
| Use POM pattern | ✅ Always | Maintainability |
| Initialize Locators in constructor | ✅ Always | Performance & clarity |
| Use `private readonly Locator` | ✅ Always | Type safety & efficiency |
| Fixtures only | ✅ Always | Clean imports |
| No hard waits | ✅ Always | Reliability |
| Selector priority | ✅ Always | Accessibility first |
| No `any` types | ✅ Always | Type safety |
| Convenience methods | ✅ When possible | Readability for complete workflows |
| Intermediate assertions | ✅ When needed | Debugging & validation |
| One test = one feature | ✅ Always | Clarity |
| Accessibility first | ✅ For UI changes | Inclusive design |
| Perf budgets | ✅ Critical paths | User experience |
| Independent tests | ✅ Always | Parallel execution |

---

## Running Tests

### Local Development
```bash
# Run all tests
npm run test

# Run specific test file
npx playwright test tests/plant-management.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### CI/CD
Tests automatically run on:
- Pull requests
- Commits to main branch
- Scheduled runs (see GitHub Actions)

---

## Resources

- **Playwright Docs**: https://playwright.dev
- **Best Practices**: [.github/instructions/playwright-testing.md](.github/instructions/playwright-testing.md)
- **Page Objects**: [tests/pages/](tests/pages/)
- **Test Examples**: [tests/plant-management.spec.ts](tests/plant-management.spec.ts)

---

**Last Updated**: March 12, 2026
