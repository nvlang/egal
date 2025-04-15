// External dependencies
import { LRUCache } from 'lru-cache';
import Color from 'colorjs.io';
import { inspect } from 'node:util';

// Internal dependencies
import type {
    CacheKey,
    FindChromaOptions,
    EgalOptions,
    OutputColor,
    OutputFormat,
    ColorSpace,
} from './types.js';

/**
 * Cache for the chroma floor calculations.
 *
 * -   **Keys:** Format: `"lightness_hues_space_gamut_precision"`.
 * -   **Values:** The chroma floor for the lightness and options encoded in the
 *     key.
 *
 * @example
 * ```ts
 * const cache = new LRUCache<CacheKey, number>({ max: 360 * 100 });
 * cache.set('50_0,123,300_hct_srgb_0.1', 10.3);
 * cache.set('20_10_oklch_p3_1', 5);
 * ```
 */
const cache = new LRUCache<CacheKey, number>({ max: 360 * 100 });

export const ColorSpaceConstants = {
    /**
     * Globals set by HCT; do not modify unless changes to the HCT color system
     * are made.
     */
    hct: {
        hue: { min: 0, max: 360 },
        chroma: { min: 0, max: 200 },
        lightness: { min: 0, max: 100 }, // "Tone" in HCT
        bgLstar: { min: 0, max: 100 },
        props: { hueProp: 'h', chromaProp: 'c', lightnessProp: 't' },
    },
    /**
     * Globals set by OkLCh; do not modify unless changes to the OkLCh color
     * system are made.
     */
    oklch: {
        hue: { min: 0, max: 360 },
        chroma: { min: 0, max: 1 },
        lightness: { min: 0, max: 1 },
        props: { hueProp: 'h', chromaProp: 'c', lightnessProp: 'l' },
    },
} as const;

export const defaults = {
    hueStep: 1,
    gamut: 'srgb',
    space: 'oklch',
    precision: {
        oklch: 0.00001,
        hct: 0.01,
    },
} as const;

/**
 * Given a specific hue and lightness, returns the maximum chroma that a color
 * with those hue and lightness values can have while still remaining
 * displayable in the specified color gamut (by default, `'srgb'`).
 *
 * @param hue - The hue of the color, in degrees. Must be between 0 and 360.
 * @param lightness - The lightness of the color. Must be between 0 and 100.
 * @param opts - Options for calculating the maximum chroma.
 * @returns The maximum chroma that a color with the specified hue and lightness
 * can have in the specified viewing conditions.
 */
export function findMaxChroma(
    hue: number,
    lightness: number,
    opts: Required<FindChromaOptions>,
): number {
    const { precision, gamut, space }: Required<FindChromaOptions> = {
        ...{
            gamut: defaults.gamut,
            space: defaults.space,
            precision: defaults.precision[opts.space],
        },
        ...opts,
    };
    // Binary search for the maximum chroma.
    let { min, max }: { min: number; max: number } =
        ColorSpaceConstants[space].chroma;
    const { hueProp, lightnessProp, chromaProp } =
        ColorSpaceConstants[space].props;
    let err = Infinity;

    const color = new Color({ space, coords: [0, 0, 0] });
    color[hueProp] = hue;
    color[lightnessProp] = lightness;

    let chroma = 0;

    // Binary search for the maximum chroma.
    while (err > precision) {
        chroma = (min + max) / 2;
        color[chromaProp] = chroma;
        if (color.inGamut(gamut)) {
            min = chroma;
        } else {
            max = chroma;
        }
        err = max - min;
    }

    return chroma;
}

/**
 * Given a specific lightness, returns the maximum chroma that *all* colors with
 * that lightness can have across the specified hues.
 *
 * @param lightness - The lightness for which to find the "chroma floor". Must
 * be between 0 and 100, both inclusive.
 * @param opts - Options for the calculation the chroma floor.
 * @returns The chroma floor, i.e., the minimum of the maximum chromas for each
 * hue-lightness pair.
 */
export function findChromaFloorForLightness(
    lightness: number,
    opts: Required<FindChromaOptions & Pick<EgalOptions<OutputFormat>, 'hues'>>,
): number {
    const { hues, ...findChromaOptions } = opts;
    const space: ColorSpace = findChromaOptions.space;

    // Prepare an array of hues to consider.
    let huesArray: number[];
    if (!Array.isArray(hues)) {
        // If hues is not an array, we interpret it as a step value.
        huesArray = [];
        const step: number = hues;
        for (
            let hue: number = ColorSpaceConstants[space].hue.min;
            hue < ColorSpaceConstants[space].hue.max;
            hue += step
        ) {
            huesArray.push(hue);
        }
    } else {
        huesArray = hues;
    }

    // Find the minimum chroma floor.
    let chromaFloor: number = ColorSpaceConstants[space].chroma.max;
    huesArray.forEach((hue) => {
        const chroma: number = findMaxChroma(hue, lightness, findChromaOptions);
        if (chroma < chromaFloor) {
            chromaFloor = chroma;
        }
    });
    return chromaFloor;
}

export const defaultOptions = {
    hues: 1,
    output: 'oklch',
    opacity: 1,
    guardrails: true,
    toeFunction: undefined,
} as const;

/**
 *
 * @param lightness - The lightness of the color. Must be between 0 and 100. A
 * lightness of 0 will always result in black (`rgb(0%, 0%, 0%)` or equivalent),
 * and a lightness of 100 will always result in white (`rgb(100%, 100%, 100%)`
 * or equivalent).
 * @param chroma - The chroma of the color. Must be a nonnegative number. Values
 * are interpreted as fractions of the maximal chroma _such that the chroma can
 * be maintained across the specified hues_, such that a value of 1 yields said
 * maximal chroma. Values larger than 1 are also allowed, but for some hues they
 * might get clipped by the browser later on. A chroma of 0 will result in a
 * grayscale color.
 * @param hue - The hue of the color, in degrees. Must be between 0 and 360.
 * @param options - Options for the calculation.
 * @returns A string representing the color in the specified output format, such
 * that the color obeys CSS syntax and, if `chroma ≤ 1`, remains within the
 * specified color gamut.
 */
// -   **PRE:**
//     -   `lightness ∈ ℝ ∪ {-∞, ∞, NaN}`
//     -   `chroma ∈ ℝ ∪ {-∞, ∞, NaN}`
//     -   `hue ∈ ℝ ∪ {-∞, ∞, NaN}`
// -   **POST:** `output` is a string as described above.
export function egal<OF extends OutputFormat = OutputFormat>(
    lightness: number,
    chroma: number,
    hue: number,
    options: EgalOptions<OF> = {},
): OutputColor<OF> {
    // Filter out options set to undefined
    const filteredOptions = Object.fromEntries(
        Object.entries(options).filter(([, value]) => value !== undefined),
    ) as EgalOptions<OF>;

    // Merge options with defaults.
    const mergedOptions = {
        ...defaultOptions,
        ...{
            gamut: defaults.gamut,
            space: defaults.space,
            precision: defaults.precision[options.space ?? defaults.space],
        },
        ...filteredOptions,
    };

    const { output, space, gamut, toeFunction, guardrails } = mergedOptions;

    let { hues, opacity, precision } = mergedOptions;

    // Sanitize and process inputs.
    hue = sanitizeHue(hue);
    chroma = sanitizeChroma(chroma);
    lightness = sanitizeLightness(
        toeFunction?.(lightness, { ...options, toeFunction: undefined }) ??
            lightness,
        toeFunction !== undefined,
        lightness,
    );
    opacity = isNaN(opacity) ? 1 : ensureInRange(opacity, 0, 1);

    if (Array.isArray(hues)) {
        if (hues.length === 0) {
            console.warn(
                `The 'hues' option should not be an empty array; using the default instead (a step value of ${defaultOptions.hues}).`,
            );
            hues = defaultOptions.hues;
        } else {
            hues = hues.map(sanitizeHue).sort();
        }
    } else {
        hues = sanitizeHue(hues);
    }

    if (guardrails) {
        precision = sanitizePrecision(precision, space);
        if (typeof hues === 'number') hues = sanitizeHues(hues);
    }

    // Set up the cache key.
    const key: CacheKey = `${lightness}_${
        Array.isArray(hues) ? hues.join(',') : String(hues)
    }_${space}_${gamut}_${precision}`;

    // Calculate the chroma floor, using cache if possible.
    let chromaFloor: number | undefined = cache.get(key);
    if (chromaFloor === undefined) {
        chromaFloor = findChromaFloorForLightness(lightness, {
            hues,
            space,
            gamut,
            precision,
        });
        cache.set(key, chromaFloor);
    }

    // The chroma input should be interpreted as a fraction of the chroma floor.
    // We're defining `adjustedChroma` as the resulting chroma value.
    const adjustedChroma: number = chromaFloor * chroma;

    const color = new Color(space, [0, 0, 0]);
    color[space][ColorSpaceConstants[space].props.lightnessProp] = lightness;
    color[space][ColorSpaceConstants[space].props.chromaProp] = adjustedChroma;
    color[space][ColorSpaceConstants[space].props.hueProp] = hue;

    // Set the opacity.
    color.alpha = opacity;

    return color
        .to(output)
        .toGamut({ method: 'css', jnd: 0, space: gamut })
        .toString() as OutputColor<OF>;
}

/**
 * - **PRE:** `h ∈ ℝ ∪ {-∞, ∞, NaN}`
 * - **POST:** If `h` is finite, then `output ∈ [0, 360)` and
 *   `output ≡ h mod 360`. If `h` is not finite, then `output = 0`.
 */
export function sanitizeHue(h: number): number {
    if (Number.isFinite(h)) {
        if (h < 0) return 360 + (h % 360);
        return h % 360;
    }
    console.warn(
        `Invalid hue value. Expected finite number, got ${inspect(h)} instead. Reverting to 0.`,
    );
    return 0;
}

/**
 * - **PRE:** `value, min, max ∈ ℝ ∪ {-∞, ∞}` and `min ≤ max`
 * - **POST:** `output ∈ [min, max]`, with `output` being the closest value to
 *   `value` within the range `[min, max]`.
 */
export function ensureInRange(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

/**
 * Thresholds for options and input values to use in the sanitization processes.
 */
export const Thresholds = {
    precision: {
        oklch: { min: 0.00001, max: 0.05 },
        hct: { min: 0.001, max: 5 },
    },
    hues: { min: 1 },
    chroma: { max: 1e6 },
    lightness: { max: 100 },
} as const;

/**
 * -   **PRE:** `p ∈ ℝ ∪ {-∞, ∞, NaN}`, `space ∈ {'oklch', 'hct'}`
 * -   **POST:** `output ∈ [Thresholds.precision[space].min, Thresholds.precision[space].max]`
 *
 * @param p - The precision to sanitize.
 * @returns The sanitized precision.
 */
export function sanitizePrecision(p: number, space: ColorSpace): number {
    if (!isFinite(p)) {
        console.warn(
            `The 'precision' option should be a finite, positive number (received ${String(p)}); using the default for ${space.toUpperCase()} instead (${defaults.precision[space]}).`,
        );
        return defaults.precision[space];
    } else if (p === 0) {
        console.warn(
            `The 'precision' option should not be set to 0; using the default for ${space.toUpperCase()} instead (${defaults.precision[space]}).`,
        );
        return defaults.precision[space];
    } else if (p < 0) {
        console.warn(
            `The 'precision' option should not be negative (received ${p}); using the default for ${space.toUpperCase()} instead (${defaults.precision[space]}).`,
        );
        return defaults.precision[space];
    } else if (p < Thresholds.precision[space].min) {
        console.warn(
            `The 'precision' option is very high (received ${p}); this may lead to performance issues. For example, the default precision for ${space.toUpperCase()} is ${defaults.precision[space]}. Using ${Thresholds.precision[space].min} instead. To prevent this behavior, set 'guardrails' to false.`,
        );
        return Thresholds.precision[space].min;
    } else if (p > Thresholds.precision[space].max) {
        console.warn(
            `The 'precision' option is very low (received ${p}); this may lead to bad results. For example, the default precision for ${space.toUpperCase()} is ${defaults.precision[space]}. Using ${Thresholds.precision[space].max} instead. To prevent this behavior, set 'guardrails' to false.`,
        );
        return Thresholds.precision[space].max;
    } else {
        return p;
    }
}

/**
 * - **PRE:** `h ∈ [0, 360)`
 * - **POST:** `output ∈ [Thresholds.hues.min, 360)`
 *
 * @param h - The hue step value to sanitize.
 * @returns The sanitized hue step value.
 */
export function sanitizeHues(h: number): number {
    if (h === 0) {
        console.warn(
            `The 'hues' option should not be set to 0 or a multiple of 360 (received ${h}); using the default instead (${defaultOptions.hues}).`,
        );
        return defaultOptions.hues;
    } else if (h < Thresholds.hues.min) {
        console.warn(
            `The 'hues' step is very small (received ${h}); this may lead to performance issues. For example, the default hue step is ${defaultOptions.hues}. Using ${Thresholds.hues.min} instead. To prevent this behavior, set 'guardrails' to false.`,
        );
        return Thresholds.hues.min;
    } else {
        return h;
    }
}

/**
 * - **PRE:** `c ∈ ℝ ∪ {-∞, ∞, NaN}`
 * - **POST:** `output ∈ [0, Thresholds.chroma.max]`
 *
 * @param c - The chroma to sanitize.
 * @returns The sanitized chroma.
 */
export function sanitizeChroma(c: number): number {
    if (isNaN(c)) {
        console.warn(
            `The chroma value should be a finite nonnegative number (received NaN); using 0 instead.`,
        );
        return 0;
    } else if (!isFinite(c)) {
        const cleanChroma: number = c < 0 ? 0 : Thresholds.chroma.max;
        console.warn(
            `The chroma value should be a finite nonnegative number (received ${c}); using ${cleanChroma} instead.`,
        );
        return cleanChroma;
    } else if (c < 0) {
        console.warn(
            `The chroma value should be a nonnegative number (received ${c}); using 0 instead.`,
        );
        return 0;
    } else if (c > Thresholds.chroma.max) {
        console.warn(
            `The chroma value should be at most ${Thresholds.chroma.max} (received ${c}); using ${Thresholds.chroma.max} instead.`,
        );
        return Thresholds.chroma.max;
    } else {
        return c;
    }
}

/**
 * - **PRE:** `l ∈ ℝ ∪ {-∞, ∞, NaN}`
 * - **POST:** `output ∈ [0, Thresholds.lightness.max]`
 *
 * @param l - The lightness to sanitize.
 * @param toeFn - Whether a toe function was applied to get `l`.
 * @param lBeforeToeFn - If `toeFn` is `true`, this is the lightness before the
 * toe function was applied. If `toeFn` is `false`, this is just `l`.
 * @returns The sanitized lightness.
 *
 * @remarks
 * The `toeFn` and `lBeforeToeFn` parameters are used to provide more
 * informative warning messages, but they are not otherwise used in the
 * sanitization process.
 */
export function sanitizeLightness(
    l: number,
    toeFn: boolean,
    lBeforeToeFn: number,
): number {
    if (isNaN(l)) {
        console.warn(
            `The lightness value should be a finite nonnegative number (received ${
                toeFn
                    ? `${l} (result of applying the toe function to ${lBeforeToeFn})`
                    : String(l)
            }); using 0 instead.`,
        );
        return 0;
    } else if (!isFinite(l)) {
        const cleanLightness: number = l < 0 ? 0 : Thresholds.lightness.max;
        console.warn(
            `The lightness value should be a finite nonnegative number (received ${
                toeFn
                    ? `${l} (result of applying the toe function to ${lBeforeToeFn})`
                    : String(l)
            }); using ${cleanLightness} instead.`,
        );
        return cleanLightness;
    } else if (l < 0) {
        console.warn(
            `The lightness value should be a nonnegative number (received ${
                toeFn
                    ? `${l} (result of applying the toe function to ${lBeforeToeFn})`
                    : String(l)
            }); using 0 instead.`,
        );
        return 0;
    } else if (l > Thresholds.lightness.max) {
        console.warn(
            `The lightness value should be at most ${Thresholds.lightness.max} (received ${
                toeFn
                    ? `${l} (result of applying the toe function to ${lBeforeToeFn})`
                    : String(l)
            }); using ${Thresholds.lightness.max} instead.`,
        );
        return Thresholds.lightness.max;
    } else {
        return l;
    }
}
