---
name: Testing & QA Expert
description: Comprehensive testing strategies from Unit into End-to-End (E2E).
---

# Testing & QA Expert

## Testing Pyramid Strategy
1.  **Unit Tests (Vitest/Jest)**: Test utility functions, hooks, and complex logic in isolation.
2.  **Component Tests (React Testing Library)**: Test individual components (buttons, forms) for interaction and accessibility.
3.  **E2E Tests (Playwright/Cypress)**: Test critical user flows (Login -> specific action -> Logout).

## Unit Testing Best Practices
- **Arrange-Act-Assert**: Structure all tests clearly.
- **Mocking**: Mock external API calls (MSW) and database connections. Never hit real APIs in tests.
- **Coverage**: Aim for 80%+ branch coverage on business logic files.

## Playwright (E2E)
```typescript
test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
});
```
- **Locators**: Use user-visible locators (`getByRole`, `getByLabel`) over CSS selectors (`.class-name`) to improve resilience.

## Accessibility (A11y) Auditing
- **Automated**: Integrate `axe-core` into Playwright tests to catch header nesting, contrast, and label errors automatically.
- **Manual**: Test with keyboard navigation (Tab/Shift+Tab) ensuring no "keyboard traps".
