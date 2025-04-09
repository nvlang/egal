import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

import egalVisitor from '../../..';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    css: {
        transformer: 'lightningcss',
        lightningcss: {
            visitor: egalVisitor,
            targets: browserslistToTargets(browserslist('last 2 versions')),
        },
    },
    build: { minify: false, target: 'esnext' },
});
