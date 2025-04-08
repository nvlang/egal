import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    webServer: {
        command: 'pnpm run build && pnpm run preview',
        port: 4173,
    },
    testDir: 'e2e',
    projects: [
        { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        // For some reason, webkit was messing with Playwright? I kept getting
        // the error "Error: could not decode image as PNG.". I'm not sure why.
        // I'll try to investigate this at some later point in time.
        // {
        //     name: 'webkit',
        //     use: {
        //         ...devices['Desktop Safari'],
        //     },
        // },
        // {
        //     name: 'iPhone SE',
        //     use: {
        //         ...devices['iPhone SE'],
        //         colorScheme: 'dark',
        //         // browserName: 'chromium',
        //     },
        // },
        {
            name: 'Galaxy S9+',
            use: {
                ...devices['Galaxy S9+'],
                colorScheme: 'no-preference',
                browserName: 'chromium',
            },
        },
    ],
});
