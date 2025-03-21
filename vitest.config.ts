import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import os from 'node:os';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ['./tests/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
        exclude: ['./tests/e2e/**/*'],
        // bail: 10,
        // dir: './tests/unit',
        // silent: true,
        // pool: 'threads',
        // poolOptions: {
        //     forks: { maxForks: 10 },
        //     threads: { useAtomics: true, maxThreads: 10000 },
        //     vmThreads: { memoryLimit: 100024 },
        //     vmForks: { memoryLimit: 100024 },
        // },
        // maxConcurrency: 100,
        testTimeout: 20e3,
        coverage: {
            reporter: ['text', 'json', 'html', 'lcov'],
            enabled: true,
            processingConcurrency:
                os.availableParallelism?.() ?? os.cpus().length,
            include: ['packages/**/*.ts'],
            exclude: [
                '**/node_modules/**',
                '**/tests/**',
                '**/dist/**',
                '**/coverage/**',
                '**/*.config.{ts,js,cjs,mjs,jsx,tsx}',
                '**/*.d.ts',
                '**/external/**',
                '**/examples/**',
                '**/e2e-old/**',
                '**/src/types/**',
                '**/legacy/**',
                '**/html/**',
            ],
            ignoreEmptyLines: true,
            reportOnFailure: true,
        },
        reporters: [
            'default',
            'github-actions',
            'html',
            // 'basic',
            // 'dot',
            // 'hanging-process',
            // 'json',
            // 'junit',
            // 'tap',
            // 'tap-flat',
            // 'verbose',
        ],
        // ui: true,
        env: {
            NODE_ENV: 'development',
        },
        // globals: true, // fixes VS Code Vitest extension issues (see https://github.com/vitest-dev/vscode/issues/47)
    },
    // logLevel: 'silent',
    // customLogger: {
    //     error: () => {},
    //     warn: () => {},
    //     info: () => {},
    //     clearScreen: () => {},
    //     hasErrorLogged: () => false,
    //     hasWarned: false,
    //     warnOnce: () => {},
    // },
});
