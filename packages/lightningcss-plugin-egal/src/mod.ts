/* eslint-disable tsdoc/syntax */
/**
 * @packageDocumentation
 * The `@nvl/lightningcss-plugin-egal` module has just one non-type export (a
 * default export, in fact), which is a Lightning CSS visitor (i.e., plugin)
 * that replaces `egal` colors with their equivalent CSS color.
 *
 * @module egalVisitor
 */
/* eslint-enable tsdoc/syntax */

import type { Angle, CustomAtRules, TokenOrValue, Visitor } from 'lightningcss';
import { egal, type EgalOptions, type OutputFormat } from '@nvl/egal';

/**
 * Options for the egal visitor (i.e., plugin).
 */
export type VisitorOptions = EgalOptions<OutputFormat>;

/**
 * A visitor (i.e., plugin) for Lightning CSS that transforms calls to the
 * `egal` CSS function into the output of the corresponding `egal` function
 * call.
 *
 * @param options - Default options for the egal function.
 * @returns A visitor that transforms `egal` function calls in CSS.
 */
function egalVisitor(options?: VisitorOptions): Visitor<CustomAtRules> {
    return {
        Function: {
            egal(fn) {
                const args = astArgumentsToEgalArguments(fn.arguments);
                if (args) {
                    if (options) args[3] = { ...options, ...args[3] };
                    return { raw: egal(...args) };
                } else {
                    return undefined;
                }
            },
        },
    };
}

function astArgumentsToEgalArguments(
    args: TokenOrValue[],
): Parameters<typeof egal> | null {
    let pos = 0;
    const next = (): TokenOrValue | undefined => args[pos++];
    const peek = (): TokenOrValue | undefined => args[pos];

    // Parse required tokens: lightness, chroma, hue.
    const lightness = parseNumberOrPercentageOrNone(next());
    const sep1 = next();
    const chroma = parseNumberOrPercentageOrNone(next());
    const sep2 = next();
    const hue = parseHue(next());

    if (
        lightness === null ||
        chroma === null ||
        hue === null ||
        !isWhitespaceOrComma(sep1) ||
        !isWhitespaceOrComma(sep2)
    ) {
        return null;
    }

    let overrideOptions: EgalOptions<OutputFormat> = {};

    // Process remaining tokens for optional arguments
    while (pos < args.length) {
        const token = next();
        if (isSlash(token)) {
            // The slash indicates that the next token is opacity.
            const opacityToken = next();
            const opacity = parseNumberOrPercentageOrNone(opacityToken);
            if (opacity === null) return null;
            overrideOptions.opacity = opacity;
        } else if (isWhitespaceOrComma(token)) {
            // Look ahead at the next token to decide if it's a gamut or a JSON options string.
            const candidate = next();
            const gamut = parseGamut(candidate);
            if (gamut) {
                overrideOptions.gamut = gamut;
                // Optionally, check if there is a following JSON options segment
                if (peek() && isWhitespaceOrComma(peek())) {
                    // Consume the delimiter and then try parsing JSON options
                    next();
                    const json = parseJsonOptions(next());
                    if (json) {
                        overrideOptions = mergeJsonOptions(
                            json,
                            overrideOptions,
                        );
                    }
                }
            } else {
                // If the candidate isn’t a gamut then it might be JSON
                const json = parseJsonOptions(candidate);
                if (json) {
                    overrideOptions = mergeJsonOptions(json, overrideOptions);
                }
            }
        } else {
            // Unrecognized token pattern in the optional arguments.
            return null;
        }
    }

    return [lightness, chroma, hue, overrideOptions];
}

const gamutRegexes: Record<Gamut, RegExp> = {
    srgb: /s?rgb/iu,
    p3: /p3/iu,
    rec2020: /rec\.?2020/iu,
};

function mergeJsonOptions(
    json: Partial<EgalOptions<OutputFormat>>,
    overrideOptions: EgalOptions<OutputFormat>,
) {
    const { gamut, opacity, ...jsonWithoutGamutAndOpacity } = json;
    const opts = { ...overrideOptions };

    // Only merge 'opacity' if not already set by a directly parsed value.
    if (opacity !== undefined && overrideOptions.opacity === undefined) {
        opts.opacity = opacity;
    }

    // Only merge 'gamut' if not already set by a directly parsed value.
    if (gamut !== undefined && overrideOptions.gamut === undefined) {
        opts.gamut = gamut;
    }

    return { ...opts, ...jsonWithoutGamutAndOpacity };
}

type Gamut = Exclude<EgalOptions<OutputFormat>['gamut'], undefined>;
function parseGamut(token: TokenOrValue | undefined): Gamut | null {
    if (token?.type === 'token' && token.value.type === 'ident') {
        const gamut: string = token.value.value;
        for (const [key, regex] of Object.entries(gamutRegexes)) {
            if (regex.test(gamut)) return key as Gamut;
        }
    }
    return null;
}

function parseJsonOptions(
    token: TokenOrValue | undefined,
): EgalOptions<OutputFormat> | null {
    if (token?.type === 'token' && token.value.type === 'string') {
        const json: string = token.value.value;
        try {
            return JSON.parse(json) as EgalOptions<OutputFormat>;
        } catch (e) {
            console.error('Invalid JSON in egal function:', e);
            return null;
        }
    }
    return null;
}

const cssAngleUnitsToDegrees: Record<Angle['type'], number> = {
    deg: 1,
    grad: 360 / 400,
    rad: 180 / Math.PI,
    turn: 360,
};

function parseNumberOrPercentageOrNone(
    token: TokenOrValue | undefined,
): number | null {
    if (!token) return null;
    if (
        token.type === 'token' &&
        (token.value.type === 'number' || token.value.type === 'percentage')
    ) {
        return token.value.value;
    } else if (token.type === 'token' && token.value.type === 'ident') {
        if (token.value.value === 'none') return 0;
    }
    return null;
}

function parseHue(token: TokenOrValue | undefined): number | null {
    if (!token) return null;
    if (token.type === 'token' && token.value.type === 'number') {
        return token.value.value;
    } else if (token.type === 'angle') {
        return token.value.value * cssAngleUnitsToDegrees[token.value.type];
    } else if (token.type === 'token' && token.value.type === 'ident') {
        if (token.value.value === 'none') return 0;
    }
    return null;
}

function isWhitespaceOrComma(
    token: TokenOrValue | undefined,
): token is
    | { type: 'token'; value: { type: 'white-space'; value: string } }
    | { type: 'token'; value: { type: 'comma' } } {
    return (
        token?.type === 'token' &&
        (token.value.type === 'white-space' || token.value.type === 'comma')
    );
}

function isSlash(
    token: TokenOrValue | undefined,
): token is { type: 'token'; value: { type: 'delim'; value: '/' } } {
    return (
        token?.type === 'token' &&
        token.value.type === 'delim' &&
        token.value.value === '/'
    );
}

export default egalVisitor;
