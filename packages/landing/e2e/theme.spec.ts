import { expect, test, type Page } from '@playwright/test';

/** The theme lives in one attribute on the root element. */
const theme = (page: Page) =>
  page.evaluate(() => document.documentElement.getAttribute('data-theme'));

/** The colour of the page background. */
const paper = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

/** The theme toggle in the footer. */
const toggle = (page: Page) => page.getByRole('button', { name: /Switch to the/ });

test('the footer toggle switches the theme and remembers it', async ({ page }) => {
  await page.goto('/');

  // The default follows the system, and Chromium asks for the light one.
  expect(await theme(page)).toBe('light');
  const light = await paper(page);

  // The toggle names the theme it switches to.
  await expect(toggle(page)).toHaveAccessibleName('Switch to the dark theme');

  await toggle(page).click();

  expect(await theme(page)).toBe('dark');
  expect(await paper(page)).not.toBe(light);
  await expect(toggle(page)).toHaveAccessibleName('Switch to the light theme');

  // The choice is remembered, so the reload keeps the dark theme.
  await page.reload();
  expect(await theme(page)).toBe('dark');
  expect(await paper(page)).not.toBe(light);

  // And the toggle brings it back.
  await toggle(page).click();
  expect(await theme(page)).toBe('light');
  expect(await paper(page)).toBe(light);
});
