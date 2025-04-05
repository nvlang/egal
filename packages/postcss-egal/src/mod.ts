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
    properties ??= cssColorProperties;
    checkVariables ??= true;
    parse ??= defaultParse;
    return {
        postcssPlugin: 'postcss-egal',
        Declaration: (decl, { result }) => {
            if (
                properties.includes(decl.prop) ||
                (checkVariables && decl.variable)
            ) {
                const parsed = parse(decl.value, opts, decl);
                if (parsed) {
                    if ('l' in parsed) {
                        const { l, c, h, overrideOptions } = parsed;
                        decl.value = egal(l, c, h, {
                            ...opts,
                            ...(overrideOptions ?? {}),
                        });
                    } else {
                        decl.warn(
                            result,
                            parsed.message ?? "Couldn't parse egal color",
                            parsed.postcssWarningOptions,
                        );
                    }
                }
            }
        },
    };
};

plugin.postcss = true;

export default plugin;
