import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const APP = '/FamilySearchVisualizer/';

test('the login screen renders and has no serious accessibility violations (TC-51)', async ({
  page,
}) => {
  await page.goto(APP);
  await expect(
    page.getByRole('button', { name: 'Sign in with Google (FamilySearch)' }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(serious).toEqual([]);
});

test('loading the app makes no request to another host (TC-54)', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    const { origin } = new URL(request.url());
    if (origin !== 'http://localhost:4173') foreign.push(origin);
  });

  await page.goto(APP);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(foreign).toEqual([]);
});
