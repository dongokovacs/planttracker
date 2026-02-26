# GitHub Copilot Instructions - PlantTracker Project

## Project Overview
Angular 21+ standalone application with Playwright E2E testing.

## General Coding Standards

### TypeScript
- Use strict typing, never use `any`
- Prefer interfaces over types for object shapes
- Use meaningful variable names

### Angular
- Use standalone components
- Use Signals for reactive state
- Follow Angular style guide

## Playwright E2E Testing Rules

**For detailed Playwright instructions, see: `.github/instructions/playwright-testing.md`**

### Quick Reference

#### MUST (Mandatory)
- ✅ Use fixtures, never `new PageObject(page)` in tests
- ✅ Import from `test-options.ts`, never `@playwright/test`
- ✅ Selector priority: `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()`

#### WON'T (Forbidden)
- ❌ Never use XPath selectors
- ❌ Never use `page.waitForTimeout()` (hard waits)
- ❌ Never use `any` type

## File Organization
```
src/app/
  core/         # Services, models, guards
  features/     # Feature modules (standalone components)
  shared/       # Reusable components, pipes, directives
tests/
  *.spec.ts     # E2E tests
  helpers/      # Test utilities
```

## Documentation
- Comment complex logic
- Use JSDoc for public APIs
- Keep README.md updated
