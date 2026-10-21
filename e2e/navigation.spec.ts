import { expect, test, type Page } from '@playwright/test';
import { topics } from '../src/content/ts/design-system';
import { framework, problems } from '../src/content/ts/system-design';

/** The three-way toggle in the header. */
const navbar = (page: Page) => page.getByRole('navigation', { name: 'Primary' });

/** The colour of the pill, which is the colour of the active mode. */
const pillColour = async (page: Page) =>
  page.evaluate(() => getComputedStyle(document.querySelector('.toggle-pill')!).backgroundColor);

/** The size of the pill, which grows with the number of lit buttons. */
const pillSize = async (page: Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.querySelector('.toggle-pill')!);
    return { left: style.left, width: parseFloat(style.width) };
  });

/**
 * Records the pill frame by frame. More than one distinct geometry means the
 * spring animation ran, not just a jump to the new position.
 */
const startRecording = (page: Page) =>
  page.evaluate(() => {
    const store = window as unknown as {
      __pill?: { samples: Set<string>; running: boolean };
    };
    const element = document.querySelector('.toggle-pill')!;
    const samples = new Set<string>();

    const record = () => {
      const style = getComputedStyle(element);
      samples.add(`${style.left}|${style.width}|${style.transform}`);
      if (store.__pill?.running) requestAnimationFrame(record);
    };

    store.__pill = { samples, running: true };
    requestAnimationFrame(record);
  });

/** Stops the recording and returns how many different frames it saw. */
const stopRecording = (page: Page) =>
  page.evaluate(() => {
    const store = window as unknown as {
      __pill?: { samples: Set<string>; running: boolean };
    };
    if (store.__pill) store.__pill.running = false;
    return store.__pill?.samples.size ?? 0;
  });

test('the navbar walks from the landing page to both chapters', async ({ page }) => {
  // 1. The landing page.
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Design system.');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('System design.');
  await expect(page.getByText('Two subjects, one word apart')).toBeVisible();

  // The two cards carry the content: the topics NOT numbered, the problems not.
  const cardItems = page.locator('main ol');
  await expect(cardItems.first().locator('li')).toHaveText(topics.map((topic) => topic.title));
  await expect(cardItems.last().locator('li')).toHaveText(problems.map((problem) => problem.title));
  await expect(page.locator('main a[href$="/design-system"]')).toHaveAttribute(
    'href',
    '/design.system.design/design-system',
  );
  await expect(page.locator('main a[href$="/system-design"]')).toHaveAttribute(
    'href',
    '/design.system.design/system-design',
  );

  // The home button is the lit one.
  await expect(navbar(page).getByLabel('System (home)')).toHaveAttribute('aria-current', 'page');
  expect(await pillColour(page)).toBe('rgba(17, 24, 39, 0.92)');
  await page.waitForTimeout(1200);

  // 2. The design system chapter, opened from the navbar.
  await startRecording(page);
  await navbar(page).getByLabel('Design System').click();
  await page.waitForURL('**/design-system');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Build it in layers, from tokens to pages.',
  );
  await expect(page.getByRole('heading', { name: 'Chapters', exact: true })).toBeVisible();
  await expect(page.locator('main h3')).toHaveText(topics.map((topic) => topic.title));
  for (const topic of topics) {
    await expect(page.getByText(topic.tagline).first()).toBeVisible();
  }
  await expect(navbar(page).getByLabel('Design System')).toHaveAttribute('aria-current', 'page');

  // The pill slides to the left and turns the design system colour.
  await page.waitForTimeout(1500);
  expect(await stopRecording(page)).toBeGreaterThan(2);
  expect(await pillColour(page)).toBe('rgba(194, 37, 92, 0.95)');
  expect((await pillSize(page)).left).toBe('0px');
  expect((await pillSize(page)).width).toBeGreaterThan(200);
  await page.waitForTimeout(1200);

  // 3. The system design problems, opened from the navbar.
  await startRecording(page);
  await navbar(page).getByLabel('System Design').click();
  await page.waitForURL('**/system-design');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Popular problems, with the questions interviewers ask next.',
  );
  await expect(page.getByRole('heading', { name: 'Problems', exact: true })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="problems"] h3')).toHaveText(
    problems.map((problem) => problem.title),
  );
  for (const problem of problems) {
    await expect(page.getByText(problem.tagline).first()).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: 'A framework for any question' })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="framework"] h3')).toHaveText(
    framework.map((step) => step.step),
  );
  await expect(navbar(page).getByLabel('System Design')).toHaveAttribute('aria-current', 'page');

  // The pill slides to the right and turns the system design colour.
  await page.waitForTimeout(1500);
  expect(await stopRecording(page)).toBeGreaterThan(2);
  expect(await pillColour(page)).toBe('rgba(31, 79, 216, 0.95)');
  expect((await pillSize(page)).width).toBeGreaterThan(200);
  await page.waitForTimeout(1200);
});
