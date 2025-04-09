import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: [
            '**/e2e/**',
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        ],
        coverage: {
            reporter: ['text', 'json', 'html', 'lcov'],
            enabled: true,
            include: ['src'],
            ignoreEmptyLines: true,
            reportOnFailure: true,
        },
        reporters: ['default', 'github-actions', 'html'],
        env: { NODE_ENV: 'development' },
    },
});
