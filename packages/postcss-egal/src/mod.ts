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
import { egal } from '@nvl/egal';

// Internal dependencies
import type { PluginOptions } from './types.js';
import { cssColorProperties } from './data.js';
import { defaultParse } from './utils.js';

/**
 * PostCSS plugin that replaces `egal` colors with their equivalent CSS
 * colors.
 */
const plugin: PluginCreator<PluginOptions> = (opts: PluginOptions = {}) => {
    let { properties, checkVariables, parse } = opts;
    if (properties === undefined) properties = cssColorProperties;
    if (checkVariables === undefined) checkVariables = true;
    if (parse === undefined) parse = defaultParse;
    return {
        postcssPlugin: 'postcss-egal',
        Declaration: (decl) => {
            if (
                properties.includes(decl.prop) ||
                (checkVariables && decl.variable)
            ) {
                const parsed = parse(decl.value, opts);
                if (parsed) {
                    const { l, c, h, overrideOptions } = parsed;
                    decl.value = egal(l, c, h, {
                        ...opts,
                        ...(overrideOptions ?? {}),
                    });
                }
            }
        },
    };
};

plugin.postcss = true;

export default plugin;
