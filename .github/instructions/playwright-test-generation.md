# Playwright Test Generation Prompt

When generating Playwright E2E tests for PlantTracker, follow these strict rules.
**Full documentation: `.github/instructions/playwright-testing.md`**

## Template Structure

```typescript
import { test, expect } from './test-options';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('descriptive test name', async ({ page }) => {
    // Arrange
    
    // Act
    
    // Assert
    await expect(page.getByRole('...')).toBeVisible();
  });
});
```

## Selector Generation Rules

### Priority Order (MUST FOLLOW):
1. **getByRole()** - First choice for all interactive elements
2. **getByLabel()** - For form inputs with labels  
3. **getByPlaceholder()** - For inputs without labels
4. **getByText()** - For static text content
5. **getByTestId()** - Last resort only

### Examples by Element Type:

**Buttons:**
```typescript
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: /save/i }).click(); // Case-insensitive
```

**Form Fields:**
```typescript
await page.getByLabel('Email').fill('test@example.com');
await page.getByLabel('Password').fill('secret');
await page.getByPlaceholder('Search...').fill('tomato');
```

**Headings:**
```typescript
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
```

**Links:**
```typescript
await page.getByRole('link', { name: 'View Details' }).click();
```

**Checkboxes/Radio:**
```typescript
await page.getByLabel('Remember me').check();
await page.getByRole('checkbox', { name: 'Agree' }).check();
```

**Dropdowns:**
```typescript
await page.getByLabel('Location').selectOption('Garden');
```

## Forbidden Patterns

**NEVER generate:**
```typescript
// ❌ XPath
page.locator('//div[@class="test"]')

// ❌ CSS selectors as primary
page.locator('.my-class')
page.locator('#my-id')

// ❌ Hard waits
await page.waitForTimeout(3000)

// ❌ any type
const result: any = ...
```

## Assertion Patterns

**ALWAYS use auto-retrying assertions:**
```typescript
// ✅ Visibility
await expect(page.getByRole('button')).toBeVisible();
await expect(page.getByRole('button')).toBeHidden();

// ✅ Text content
await expect(page.getByRole('heading')).toHaveText('Title');
await expect(page.getByRole('heading')).toContainText('partial');

// ✅ Count
await expect(page.getByRole('listitem')).toHaveCount(5);

// ✅ URL
await expect(page).toHaveURL(/.*dashboard/);
```

## Import Rules

**ALWAYS:**
```typescript
import { test, expect } from './test-options';
```

**NEVER:**
```typescript
import { test, expect } from '@playwright/test'; // ❌ FORBIDDEN
```

## Common PlantTracker Patterns

**Dashboard navigation:**
```typescript
await page.goto('/');
await expect(page.getByRole('heading', { name: 'Your Plants' })).toBeVisible();
```

**Add plant:**
```typescript
await page.getByRole('button', { name: 'Add Plant' }).click();
await page.getByLabel('Plant Name').fill('Tomato');
await page.getByLabel('Species').fill('Solanum lycopersicum');
await page.getByRole('button', { name: 'Save' }).click();
```

**Search:**
```typescript
await page.getByPlaceholder('Search plants...').fill('tomato');
await expect(page.getByRole('article')).toContainText('Tomato');
```

## Coverage Collection

**Include when generating tests:**
```typescript
import { collectCoverage } from './helpers/coverage';

test('example', async ({ page }) => {
  await collectCoverage(page);
  // Test code...
});
```

---

**Remember:** Accessibility-first selectors make tests more resilient and improve app quality!
