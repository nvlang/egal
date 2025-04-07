/* eslint-disable tsdoc/syntax */
/**
 * @packageDocumentation
 * The `postcss-egal` module has just one export (a default export, in fact),
 * which is a PostCSS plugin that replaces `egal` colors with their equivalent
 * CSS color.
 *
 * @example
 * ```ts
 * // postcss.config.js
 * export default {
 *     plugins: {
 *         '@nvl/postcss-egal': {},
 *     }
 * }
 * ```
 *
 * @module egalPlugin
 */

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
const plugin: PluginCreator<PluginOptions> = (opts: PluginOptions = {}) => {
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

plugin.postcss = true;

export default plugin;
