import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import plugin from '../../..';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    css: { postcss: { plugins: [plugin] } },
    build: { minify: false, target: 'esnext' },
});
