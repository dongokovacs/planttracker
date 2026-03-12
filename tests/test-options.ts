import { test as base, expect, Page } from '@playwright/test';
import { CreateFormPage } from './pages/createForm.page';

// Extend base fixtures here later if needed.
// For now we just re-export Playwright's default `test` and `expect`
// so tests can import from './test-options' as required by project guidelines.

export { expect, Page, CreateFormPage };
export const test = base;

