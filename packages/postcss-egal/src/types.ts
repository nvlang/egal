import type { EgalOptions, OutputFormat } from '@nvl/egal';

export type Parser = (
    value: string,
    otherPluginOptions: Omit<PluginOptions, 'parse'>,
) => {
    /** Parsed lightness. Should be a number between 0 and 100, inclusive. */
    l: number;

    /** Parsed chroma. Should be nonnegative. */
    c: number;

    /** Parsed hue. */
    h: number;

    /** Ad hoc overrides of egal options. */
    overrideOptions?: EgalOptions<OutputFormat> | undefined;
} | null;

export interface PluginOptions extends EgalOptions<OutputFormat> {
    /**
     * In essence, a function that parses a string like `'egal(12% 34% 56)'`
     * into `{ l: 12, c: 34, h: 56 }`.
     *
     * It can optionally also output a 4-tuple, where the last element are
     * options to pass to the `egal` function. This might be useful if, for
     * example, you'd like to extend the parser to parse `'egalHCT(12% 34% 56)'`
     * into `{ l: 12, c: 34, h: 56, overrideOptions: { space: 'hct' }}`.
     *
     * @param value - The string to parse. This will generally be a string
     * representing a CSS color, and might or might not be using the `egal`
     * syntax.
     * @param otherPluginOptions - The options passed to the plugin, other than
     * the `parse` function.
     * @returns Object containing the parsed values, or `null` if the string
     * isn't using the `egal` syntax (or custom syntax) or could otherwise not
     * be parsed.
     *
     * @remarks
     * It's important that, if the string to be parsed is already a valid CSS
     * color, it be left alone.
     */
    parse?: Parser;

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
