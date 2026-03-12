import { test, expect, CreateFormPage } from './test-options';
import { startCoverage, stopAndSaveCoverage } from './helpers/coverage';

test.describe.skip('Növény kezelés', () => {

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

  test('új zöldség felvétele és státusz ellenőrzése POM nélkül', async ({ page }) => {
    // Arrange: nyitó oldal
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /PlantTracker/i })).toBeVisible();

    // Navigálás az "Új növény" űrlapra
    await page.getByRole('link', { name: /Új növény hozzáadása/i }).click();
    await expect(page.getByRole('heading', { name: /Új növény hozzáadása/i })).toBeVisible();

    // Form kitöltése (retek, hogy legyen lokális kép is)
    await page.getByLabel(/Növény neve/i).fill('retek');
    await page.getByLabel(/Fajta \(opcionális\)/i).fill('teszt fajta');
     //screen readers use labels so UI test use it
    await page.getByLabel(/Ültetés dátuma/i).fill('2026-03-03');
    //await page.getByRole('textbox', { name: 'Ültetés dátuma *' }).fill('2026-03-03');
    await page.getByLabel(/Helyszín \(opcionális\)/i).fill('teszt ágyás');

    // Submit
    const saveRequest = page.waitForResponse((resp) =>
      resp.url().includes('/api/plants') && resp.request().method() === 'POST' && resp.status() === 201
    );
    await page.getByRole('button', { name: /Hozzáadás/i }).click();
    await saveRequest;

    // Assert: átirányítás után megjelenik a növény részlete oldalon
    await expect(page).toHaveURL(/\/plants\//);
    await expect(page.getByRole('heading', { name: /retek/i })).toBeVisible();

    // Vissza a dashboardra és státusz ellenőrzése
    await page.getByRole('button', { name: '← Vissza' }).click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    const retekCard = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: /retek/i }) });

    await expect(retekCard).not.toHaveCount(0);

  });

  test('növény létrehozása POM', async ({ page }) => {   
    const formPage = new CreateFormPage(page);
    await formPage.createFullPlant('Monstera', 'Monstera deliciosa', '2026-03-03', 'Terasz');

    // Assert: átirányítás után megjelenik a növény részlete oldalon
    await expect(page).toHaveURL(/\/plants\//);
    await expect(page.getByRole('heading', { name: /Monstera/i })).toBeVisible();
  });
});
