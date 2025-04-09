import { expect, test } from '@playwright/test';

test('home page has expected headers with expected colors', async ({
    page,
}) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveCSS(
        'color',
        'oklch(0.8 0.10012 175 / 0.5)',
    );
    await expect(page.locator('h1')).toHaveCSS(
        'border-color',
        'oklch(0.8 0.10012 175)',
    );
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('h2')).toHaveCSS('color', 'oklch(0.6 0.10201 0)');
});
