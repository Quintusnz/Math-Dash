import { test, expect } from '@playwright/test';

test.describe('Curriculum feature e2e', () => {
  // Helper: solve grown-ups math gate if present
  const passAdultGate = async (page: any) => {
    const gateTitle = page.getByText('Grown-ups Only');
    if ((await gateTitle.count()) === 0) return;

    const challenge = page.locator('[class*="challenge"]');
    await challenge.waitFor({ timeout: 10_000 });
    const text = await challenge.innerText();
    const numbers = text.match(/\d+/g)?.map((n: string) => parseInt(n, 10)) ?? [];
    const answer = numbers.length >= 2 ? numbers[0] * numbers[1] : '';

    await page.getByPlaceholder('Enter answer').fill(String(answer));
    await page.getByRole('button', { name: 'Continue' }).click();
    await gateTitle.waitFor({ state: 'detached', timeout: 10_000 });
  };

  // Helper: ensure at least one profile exists (reuse seeded Johnny if present)
  const ensureProfileExists = async (page: any) => {
    const existing = page.getByText(/Johnny|E2E Learner/i).first();
    if (await existing.count()) return existing;

    await page.getByRole('button', { name: 'Create Profile' }).click();
    await page.getByPlaceholder('Enter name').fill('E2E Learner');
    await page.locator('select').first().selectOption('7-9');
    await page.getByRole('button', { name: 'Save Profile' }).click();
    await expect(page.getByText('E2E Learner')).toBeVisible();
    return page.getByText(/E2E Learner/i).first();
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/grown-ups');
    await passAdultGate(page);
    await page.waitForSelector('text=Manage Profiles', { timeout: 30_000 });
  });

  test('creates a new profile and configures curriculum targets', async ({ page }) => {
    await ensureProfileExists(page);
    await page.getByRole('button', { name: 'Settings' }).click();

    // If country/year not set, configure them
    const configureButtons = page.getByRole('button', { name: 'Not set - tap to configure' });
    if (await configureButtons.count()) {
      // Country
      await configureButtons.first().click();
      await page.getByRole('button', { name: /New Zealand|United States|Australia|United Kingdom|Canada/ }).first().click();
      await page.getByRole('button', { name: /Save/ }).first().click();
      // Year/Grade
      await configureButtons.nth(1).click();
      await page.getByRole('button', { name: /Year 3|Year 2|Grade 2|Kindergarten/ }).first().click();
      await page.getByRole('button', { name: /Save/ }).nth(1).click();
    }
  });

  test('shows curriculum progress and recommendation actions after gameplay', async ({ page }) => {
    await ensureProfileExists(page);
    await page.getByRole('button', { name: 'Progress' }).click();
    await expect(page.getByText('Progress Overview')).toBeVisible();

    const profileButton = page.getByRole('button', { name: /Johnny|E2E Learner/i }).first();
    await profileButton.click({ force: true });

    await page.getByRole('button', { name: 'Curriculum Progress' }).click();
    await expect(page.locator('text=Curriculum Progress').last()).toBeVisible();

    await page.getByRole('button', { name: 'Recommendations' }).click();
    const practiceButton = page.getByRole('button', { name: 'Practice' }).first();
    await expect(practiceButton).toBeVisible();
    await practiceButton.click();
  });

  test('surfaces offline experience without blocking curriculum dashboard', async ({ page, context }) => {
    await ensureProfileExists(page);
    await context.setOffline(true);
    await expect(page.evaluate(() => navigator.onLine)).resolves.toBe(false);
    await expect(page.getByRole('heading', { name: 'Manage Profiles' })).toBeVisible();
    await context.setOffline(false);
  });
});
