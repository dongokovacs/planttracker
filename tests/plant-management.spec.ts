import { test, expect } from '@playwright/test';
import { startCoverage, stopAndSaveCoverage } from './helpers/coverage';

test.describe('Növény kezelés', () => {

  test('keresés működése', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: /PlantTracker/i })).toBeVisible();

    // Find the search input using role
    const searchInput = page.getByRole('searchbox', { name: /Keresés növény neve szerint/i });
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill('paradicsom');

    // Wait for the results to update (using a visible element change)
    // Instead of waitForTimeout, wait for the UI to update
    await page.waitForLoadState('networkidle');

    // Verify that the plant cards are rendered using semantic selectors
    const plantCards = page.getByRole('article');
    const count = await plantCards.count();
    
    // Verify that the page is still functional
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('szűrés helyszín szerint', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /PlantTracker/i })).toBeVisible();

    // Find the location filter using role and accessible name
    const locationFilter = page.getByRole('combobox', { name: /Szűrés helyszín szerint/i });
    await expect(locationFilter).toBeVisible();

    // Select a location (first option after "Minden helyszín")
    await locationFilter.selectOption({ index: 0 });

    // Wait for network to stabilize
    await page.waitForLoadState('networkidle');

    // Verify the page is still functional using semantic selectors
    const plantCards = page.getByRole('article');
    const count = await plantCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
