# Playwright E2E Test Instructions

This file contains strict rules for writing Playwright tests for the PlantTracker application.

---

## 🚨 MUST (Mandatory Rules)

### 1. Dependency Injection
**✅ REQUIRED:** Use fixtures for Page Objects

```typescript
// ✅ CORRECT
test('example', async ({ dashboardPage }) => {
  await dashboardPage.navigateTo();
});

// ❌ WRONG - Never instantiate in tests
test('example', async ({ page }) => {
  const dashboard = new DashboardPage(page); // FORBIDDEN
});
```

### 2. Imports
**✅ REQUIRED:** Import from `test-options.ts`

```typescript
// ✅ CORRECT
import { test, expect } from './test-options';

// ❌ WRONG
import { test, expect } from '@playwright/test';
```

### 3. Selector Priority (Strict Order)

**Priority hierarchy (top to bottom):**

1. **`getByRole()`** - Accessibility-based (PREFERRED)
2. **`getByLabel()`** - Form inputs with labels
3. **`getByPlaceholder()`** - Inputs without labels
4. **`getByText()`** - Static text content
5. **`getByTestId()`** - Last resort only

```typescript
// ✅ Priority 1: getByRole (BEST - accessibility)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
await page.getByRole('heading', { name: 'Dashboard' }).isVisible();

// ✅ Priority 2: getByLabel (Good for forms)
await page.getByLabel('Password').fill('secret');
await page.getByLabel('Remember me').check();

// ✅ Priority 3: getByPlaceholder (When no label)
await page.getByPlaceholder('Search plants...').fill('tomato');

// ✅ Priority 4: getByText (Static content)
await page.getByText('Welcome back!').isVisible();

// ⚠️ Priority 5: getByTestId (LAST RESORT)
await page.getByTestId('user-avatar').click(); // Only when no semantic option
```

### 4. Typing
**✅ REQUIRED:** Explicit types, never `any`

```typescript
// ✅ CORRECT
const plants: Plant[] = await page.locator('.plant-card').all();
const count: number = await page.getByRole('button').count();

// ❌ WRONG
const plants: any = await page.locator('.plant-card').all();
```

---

## ❌ WON'T (Forbidden Patterns)

### 1. No XPath Selectors
**Never use XPath - always use semantic selectors**

```typescript
// ❌ FORBIDDEN
await page.locator('//div[@id="test"]').click();
await page.locator('//button[contains(text(), "Submit")]').click();

// ✅ CORRECT
await page.getByRole('button', { name: 'Submit' }).click();
```

### 2. No Hard Waits
**Never use arbitrary timeouts**

```typescript
// ❌ FORBIDDEN
await page.waitForTimeout(3000);
await page.waitForTimeout(5000);

// ✅ CORRECT - Use built-in auto-waiting
await expect(page.getByRole('button')).toBeVisible();
await page.getByRole('button').waitFor({ state: 'visible' });
```

### 3. No `any` Type
**Always use explicit types**

```typescript
// ❌ FORBIDDEN
async function getPlants(): Promise<any> {
  return await page.locator('.plant').all();
}

// ✅ CORRECT
import { Locator } from '@playwright/test';

async function getPlants(): Promise<Locator[]> {
  return await page.locator('.plant').all();
}
```

### 4. Avoid CSS Selectors as Primary Strategy
**Only use when semantic selectors are impossible**

```typescript
// ❌ AVOID (unless absolutely necessary)
await page.locator('.btn-primary').click();
await page.locator('#submit-button').click();
await page.locator('button.text-blue-500').click();

// ✅ PREFERRED
await page.getByRole('button', { name: 'Submit' }).click();
```

---

## 📚 Best Practices

### Test Structure
```typescript
import { test, expect } from './test-options';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup per test
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act
    await page.getByRole('button', { name: 'Click me' }).click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Assertions
```typescript
// ✅ Use Playwright's auto-retrying assertions
await expect(page.getByRole('button')).toBeVisible();
await expect(page.getByRole('heading')).toHaveText('Dashboard');
await expect(page).toHaveURL(/.*dashboard/);

// ❌ Avoid manual checks
const isVisible = await page.getByRole('button').isVisible();
expect(isVisible).toBe(true); // Less reliable
```

### Waiting Strategies
```typescript
// ✅ CORRECT - Auto-waiting
await page.getByRole('button').click(); // Auto-waits for element
await expect(page.getByText('Loaded')).toBeVisible(); // Auto-retries

// ✅ CORRECT - Explicit state waiting (when needed)
await page.getByRole('dialog').waitFor({ state: 'visible' });
await page.getByRole('progressbar').waitFor({ state: 'hidden' });

// ❌ WRONG
await page.waitForTimeout(2000);
```

### Network Requests
```typescript
// ✅ Wait for specific network activity
await page.waitForResponse(resp => 
  resp.url().includes('/api/plants') && resp.status() === 200
);

// ✅ Mock API responses (when needed)
await page.route('**/api/plants', route => {
  route.fulfill({ json: mockPlants });
});
```

---

## 🎯 PlantTracker-Specific Patterns

### Common Selectors

```typescript
// Dashboard
await page.getByRole('heading', { name: 'Your Plants' });
await page.getByRole('button', { name: 'Add Plant' });
await page.getByPlaceholder('Search plants...');

// Plant Form
await page.getByLabel('Plant Name').fill('Tomato');
await page.getByLabel('Species').fill('Solanum lycopersicum');
await page.getByLabel('Location').selectOption('Garden');
await page.getByRole('button', { name: 'Save Plant' }).click();

// Plant Cards
await page.getByRole('article').filter({ hasText: 'Tomato' });
await page.getByRole('button', { name: /Delete.*plant/i });
```

### Coverage Collection
```typescript
// Import coverage helper
import { collectCoverage } from './helpers/coverage';

test('example', async ({ page }) => {
  await collectCoverage(page);
  // Test actions...
});
```

---

## 🔧 Configuration

### Base URL
Tests use `baseURL: 'http://localhost:4200'` from `playwright.config.ts`

```typescript
// ✅ Relative paths
await page.goto('/dashboard');
await page.goto('/plants/new');

// ❌ Avoid absolute URLs (unless external)
await page.goto('http://localhost:4200/dashboard');
```

### Timeouts
```typescript
// Default timeout: 30s (playwright.config.ts)
// Override only when necessary

test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60s for this test only
});
```

---

## 📖 References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Selectors](https://playwright.dev/docs/locators#locate-by-role)
- [Auto-waiting](https://playwright.dev/docs/actionability)

---

## ✅ Pre-commit Checklist

Before committing tests, ensure:
- [ ] No XPath selectors
- [ ] No `page.waitForTimeout()`
- [ ] No `any` types
- [ ] Using fixture-based Page Objects
- [ ] Importing from `test-options.ts`
- [ ] Selectors follow priority order
- [ ] All assertions use `expect()` with auto-retry
- [ ] Tests are descriptive and focused
