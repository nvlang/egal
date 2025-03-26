export type ColorSpace = 'hct' | 'oklch';
export type Gamut = 'srgb' | 'p3' | 'rec2020';

/**
 * Possible output color formats.
 */
export type OutputFormat =
    | 'hsl'
    | 'hwb'
    | 'lch'
    | 'lab'
    | 'oklch'
    | 'oklab'
    | 'srgb';

export type CacheKey = `${number}_${string}_${ColorSpace}_${Gamut}_${number}`;

/**
 * Template string type for CSS-parsable string representation of color in type
 * parameter's format.
 *
 * @example
 * ```ts
 * const color1: OutputColor<'hsl'> = 'hsl(10 10% 10%)';
 * const color2: OutputColor<'hsl'> = 'hsl(10 10% 10% / 0.5)';
 * ```
 */
export type OutputColor<OF extends OutputFormat> = OF extends 'hsl'
    ? HslColor
    : OF extends 'hwb'
      ? HwbColor
      : OF extends 'lch'
        ? LchColor
        : OF extends 'lab'
          ? LabColor
          : OF extends 'oklch'
            ? OklchColor
            : OF extends 'oklab'
              ? OklabColor
              : OF extends 'srgb'
                ? SrgbColor
                : never;

export type HslColor =
    | `hsl(${number} ${number}% ${number}%)`
    | `hsl(${number} ${number}% ${number}% / ${number})`;
export type HwbColor =
    | `hwb(${number} ${number}% ${number}%)`
    | `hwb(${number} ${number}% ${number}% / ${number})`;
export type LchColor =
    | `lch(${number} ${number} ${number})`
    | `lch(${number} ${number} ${number} / ${number})`;
export type LabColor =
    | `lab(${number} ${number} ${number})`
    | `lab(${number} ${number} ${number} / ${number})`;
export type OklchColor =
    | `oklch(${number}% ${number} ${number})`
    | `oklch(${number}% ${number} ${number} / ${number})`;
export type OklabColor =
    | `oklab(${number}% ${number} ${number})`
    | `oklab(${number}% ${number} ${number} / ${number})`;
export type SrgbColor =
    | `rgb(${number}% ${number}% ${number}%)`
    | `rgb(${number}% ${number}% ${number}% / ${number})`;

export type FindChromaOptions = Pick<
    EgalOptions<OutputFormat>,
    'gamut' | 'precision' | 'space'
>;

/**
 * Options for the `egal` function.
 *
 * @typeParam OF - Output format.
 */
export interface EgalOptions<OF extends OutputFormat> {
    /**
     * Hues to target when calculating the chroma floor. Can also be a number,
     * in which case it is interpreted as a step value (e.g., passing `10` would
     * be equivalent to passing `[0, 10, 20, ..., 350]`).
     *
     * @remarks
     * Values below 1 are not recommended, as they may lead to performance
     * issues.
     *
     * @defaultValue
     * ```ts
     * 1
     * ```
     */
    hues?: number | number[];

    /**
     * Opacity. Ranges from 0 to 1. Doesn't influence the chroma floor
     * calculation, and is basically just added as-is to the output (after some
     * sanitization).
     *
     * @defaultValue
     * ```ts
     * 1
     * ```
     */
    opacity?: number;

    /**
     * Output format.
     *
     * @defaultValue `'oklch'`
     *
     * @example
     * ```ts
     * 'hsl(10 10% 10%)'      // 'hsl' format
     * 'hwb(10 10% 10%)'      // 'hwb' format
     * 'lch(10 10 10)'        // 'lch' format
     * 'lab(10 110 -110)'     // 'lab' format
     * 'oklch(10% 0.1 100)'   // 'oklch' format
     * 'oklab(10% 0.1 -0.1)'  // 'oklab' format
     * 'rgb(10% 10% 10%)'     // 'srgb' format
     * ```
     *
     * @remarks
     * Some output formats may not be able to represent all colors of a given
     * gamut. Specifically, for the `'p3'` and `'rec2020'` gamuts, only the
     * `'oklch'` and `'oklab'` formats will be able to represent all colors.
     */
    output?: OF;

    /**
     * An optional toe function to the luminosity. In other words, a function to
     * apply to the lightness parameter before any calculations involving it are
     * performed.
     *
     * @remarks
     * If not provided (or set to `undefined`), no function is applied to the
     * lightness parameter, i.e., it's used as-is.
     *
     * @defaultValue
     * ```ts
     * undefined
     * ```
     *
     * @example
     * Taken from [this post](https://facelessuser.github.io/coloraide/playground/?notebook=https%3A%2F%2Fgist.githubusercontent.com%2Ffacelessuser%2F0235cb0fecc35c4e06a8195d5e18947b%2Fraw%2F3ca56c388735535de080f1974bfa810f4934adcd%2Fexploring-tonal-palettes.md) by Isaac Muse:
     *
     * ```ts
     * const k1 = 0.173;
     * const k2 = 0.004;
     * const k3 = (1.0 + k1) / (1.0 + k2);
     *
     * function toeFunction(x: number): number {
     *     return (x ** 2 + k1 * x) / (k3 * (x + k2))
     * }
     * ```
     */
    toeFunction?:
        | ((
              lightness: number,
              opts: Exclude<EgalOptions<OF>, 'toeFunction'>,
          ) => number)
        | undefined;

    /**
     * By default, very high precisions and very small step values for hues are
     * overriden to prevent extremely slow calculations. Set this to `false` to
     * overrule these guardrails.
     */
    guardrails?: boolean;

    /**
     * Color space within which the `hue` and `luminosity` are to be
     * interpreted.
     *
     * @defaultValue
     * ```ts
     * 'oklch'
     * ```
     */
    space?: ColorSpace;

    /**
     * Target gamut. For example, the max chroma (such that the color is still
     * in the target gamut) for a given hue and luminosity will be different for
     * sRGB, P3, and Rec. 2020.
     *
     * @defaultValue
     * ```ts
     * 'srgb'
     * ```
     */
    gamut?: Gamut;

    /**
     * Precision with which to find the chroma. For example, a precision of
     * `0.1` would ensure that the returned maximum chroma is within `0.1` of
     * the actual maximum chroma.
     *
     * @defaultValue
     * ```ts
     * 0.1
     * ```
     */
    precision?: number;
}
