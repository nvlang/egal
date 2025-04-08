import { expect, test } from '@playwright/test';

test('home page has expected h1 with expected color', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveCSS(
        'color',
        'oklch(0.8 0.10012 175)',
    );
});
