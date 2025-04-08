/* eslint-disable tsdoc/syntax */
/**
 * @packageDocumentation
 * The `@nvl/postcss-egal` module has just one export (a default export, in
 * fact), which is a PostCSS plugin that replaces `egal` colors with their
 * equivalent CSS color.
 *
 * @example
 * Usage in a PostCSS configuration file:
 * ```ts
 * // postcss.config.js
 * export default {
 *     plugins: {
 *         '@nvl/postcss-egal': {},
 *     }
 * }
 * ```
 *
 * @example
 * Usage in a Vite configuration file:
 * ```
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import postcssEgal from '@nvl/postcss-egal';
 *
 * export default defineConfig({
 *     // ...
 *     css: {
 *         postcss: {
 *             plugins: [postcssEgal({
 *                 // Options...
 *             })]
 *         }
 *     },
 *     // ...
 * });
 * ```
 *
 * @module postcssEgal
 */
/* eslint-enable tsdoc/syntax */

// External dependencies
import type { PluginCreator } from 'postcss';

// Internal dependencies
import type { PluginOptions } from './types.js';
import { cssColorProperties } from './data.js';
import { transformer } from './utils.js';

/**
 * PostCSS plugin that replaces `egal` colors with their equivalent CSS
 * colors.
 */
const postcssEgal: PluginCreator<PluginOptions> = (
    opts: PluginOptions = {},
) => {
    let { properties, checkVariables } = opts;
    properties ??= cssColorProperties;
    checkVariables ??= true;
    return {
        postcssPlugin: 'postcss-egal',
        Declaration: (decl, helpers) => {
            if (processedDeclarations.has(decl)) return;
            processedDeclarations.add(decl);
            if (
                properties.includes(decl.prop) ||
                (checkVariables && decl.variable)
            ) {
                transformer(decl, helpers, opts);
            }
        },
    };
};

const processedDeclarations = new WeakSet();

postcssEgal.postcss = true;

export default postcssEgal;
