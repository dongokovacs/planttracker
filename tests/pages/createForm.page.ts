import { Page, Locator, expect } from '@playwright/test';

/**
 * @fileoverview CreateFormPage - Page Object Model with Fluent API
 * 
 * @architecture
 * {
 *   "pattern": "POM (Page Object Model)",
 *   "advantages": {
 *     "maintainability": "UI changes only affect page objects",
 *     "readability": "Tests read like documentation",
 *     "reusability": "Page objects shared across tests",
 *     "scalability": "Easy to add new interactions"
 *   }
 * }
 * 
 * @example
 * // Simple convenience method
 * await formPage.createFullPlant('retek', 'teszt fajta', '2026-03-03', 'teszt ágyás');
 * 
 * // Step-by-step with intermediate assertions
 * await formPage.navigateToForm();
 * await expect(page.getByRole('heading')).toBeVisible();
 */
export class CreateFormPage {
  // Locators
  private readonly addPlantLink: Locator;
  private readonly formHeading: Locator;
  private readonly plantNameInput: Locator;
  private readonly speciesInput: Locator;
  private readonly plantingDateInput: Locator;
  private readonly locationInput: Locator;
  private readonly submitButton: Locator;
  private readonly backButton: Locator;

  constructor(private readonly page: Page) {
    this.addPlantLink = page.getByRole('link', { name: /Új növény hozzáadása/i });
    this.formHeading = page.getByRole('heading', { name: /Új növény hozzáadása/i });
    this.plantNameInput = page.getByLabel(/Növény neve/i);
    this.speciesInput = page.getByLabel(/Fajta \(opcionális\)/i);
    this.plantingDateInput = page.getByLabel(/Ültetés dátuma/i);
    this.locationInput = page.getByLabel(/Helyszín \(opcionális\)/i);
    this.submitButton = page.getByRole('button', { name: /Hozzáadás/i });
    this.backButton = page.getByRole('button', { name: '← Vissza' });
  }

  // Fluent API Methods
  async navigateToForm(): Promise<this> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: /PlantTracker/i })).toBeVisible();
    await this.addPlantLink.click();
    await expect(this.formHeading).toBeVisible();
    return this;
  }

  async fillPlantName(name: string): Promise<this> {
    await this.plantNameInput.fill(name);
    return this;
  }

  async fillSpecies(species: string): Promise<this> {
    await this.speciesInput.fill(species);
    return this;
  }

  async fillPlantingDate(date: string): Promise<this> {
    await this.plantingDateInput.fill(date);
    return this;
  }

  async fillLocation(location: string): Promise<this> {
    await this.locationInput.fill(location);
    return this;
  }

  async submitForm(): Promise<void> {
    const saveRequest = this.page.waitForResponse((resp) =>
      resp.url().includes('/api/plants') &&
      resp.request().method() === 'POST' &&
      resp.status() === 201
    );
    await this.submitButton.click();
    await saveRequest;
    await expect(this.page).toHaveURL(/\/plants\//);
  }

  async createFullPlant(
    plantName: string,
    species: string,
    plantingDate: string,
    location: string
  ): Promise<void> {
    await this.navigateToForm();
    await this.fillPlantName(plantName);
    await this.fillSpecies(species);
    await this.fillPlantingDate(plantingDate);
    await this.fillLocation(location);
    await this.submitForm();
  }

  async goBackToDashboard(): Promise<this> {
    await this.backButton.click();
    await expect(this.page).toHaveURL(/\/dashboard|\/$/);
    return this;
  }

  // Assertion helpers
  async assertPlantCreated(plantName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: new RegExp(plantName, 'i') })).toBeVisible();
  }

  getPlantCard(plantName: string) {
    return this.page
      .getByRole('article')
      .filter({ has: this.page.getByRole('heading', { name: new RegExp(plantName, 'i') }) });
  }
}
