import type { EgalOptions, OutputFormat } from '@nvl/egal';
import type { Declaration, Helpers } from 'postcss';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { cssColorProperties } from './data.js';

export type Transformer = (
    decl: Declaration,
    helpers: Helpers,
    pluginOptions: PluginOptions,
) => void;

/**
 * The options for the plugin.
 *
 * This interface extends the {@link EgalOptions | `EgalOptions`} interface from
 * the `@nvl/egal` package. This is to allow the user to set custom defaults for
 * the `egal` function, such as the color space to use.
 *
 * Other than that, there are a few options that are specific to the plugin,
 * namely `parse`, `properties`, and `checkVariables`.
 */
export interface PluginOptions extends EgalOptions<OutputFormat> {
    /**
     * CSS properties to check for `egal` colors. If not provided, the plugin
     * will check for
     * {@link cssColorProperties | all CSS properties that are known to accept colors}.
     * This is useful if you want to limit the plugin to only certain
     * properties.
     */
    properties?: string[];

    /**
     * Whether to check CSS variable declarations (e.g.,
     * `--my-color: egal(12% 34% 56);`) for `egal` colors.
     *
     * @defaultValue
     * ```ts
     * true
     * ```
     */
    checkVariables?: boolean;
}
