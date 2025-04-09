import { expect, test } from '@playwright/test';

test('home page has expected headers with expected colors', async ({
    page,
}) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveCSS(
        'color',
        'lab(0.699238 -0.186153 0.0428379 / 0.5)',
    );
    await expect(page.locator('h1')).toHaveCSS(
        'border-color',
        'lab(78.096 -34.72 3.0306)',
    );
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('h2')).toHaveCSS(
        'color',
        'lab(52.3173 33.6408 0.407755)',
    );
});
