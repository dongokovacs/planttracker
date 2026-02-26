# Instructions Directory

This directory contains project-wide coding standards and testing guidelines.

## 📚 Available Instructions

### 1. **playwright-testing.md** - Playwright E2E Testing Rules ⭐
Comprehensive guide for writing Playwright tests:
- MUST rules (mandatory)
- WON'T patterns (forbidden)
- Selector priority order
- Best practices
- PlantTracker-specific examples
- Pre-commit checklist

**When to read:** Before writing any E2E test

### 2. **playwright-test-generation.md** - Test Generation Prompt
Quick reference for generating tests with GitHub Copilot:
- Template structure
- Selector examples by element type
- Common patterns
- Forbidden patterns

**When to use:** When using Copilot to generate test code

```prompt
@workspace Generate a Playwright test for [feature]. Follow .github/instructions/playwright-test-generation.md
```

## 🎯 For Developers

### Writing Tests
1. Read: `playwright-testing.md` (full rules)
2. Follow selector priority: `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()`
3. Check pre-commit list before committing

### Using Copilot
- Copilot automatically reads `.github/copilot-instructions.md`
- For test generation, reference `playwright-test-generation.md` in your prompt

## 🔗 Related Files

- **`.github/copilot-instructions.md`** - Main Copilot instructions (references this directory)
- **`README.md`** - Project overview with links to these instructions
- **`tests/`** - Test files following these rules

## 📖 Documentation Structure

```
.github/
├── copilot-instructions.md       # Main Copilot config (auto-loaded)
└── instructions/
    ├── README.md                  # This file
    ├── playwright-testing.md      # Detailed E2E testing rules
    └── playwright-test-generation.md  # Quick generation prompt
```

---

**Keep these instructions up to date as the project evolves!** 🚀
