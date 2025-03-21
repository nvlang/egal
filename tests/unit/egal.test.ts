import { describe, expect, expectTypeOf, test } from 'vitest';
import { test as fuzzyTest, fc } from '@fast-check/vitest';

import {
    ColorSpaceConstants,
    defaultOptions,
    defaults,
    egal,
    ensureInRange,
    sanitizeChroma,
    sanitizeHue,
    sanitizeHues,
    sanitizeLightness,
    sanitizePrecision,
    Thresholds,
} from '$egal.js';
import Color from 'colorjs.io';
import type {
    ColorSpace,
    EgalOptions,
    FindChromaOptions,
    Gamut,
    OutputFormat,
} from '$types.js';

describe('egal', () => {
    test.concurrent.each([
        [50, 100, 0, undefined, 'oklch(50% 0.085 0)'],
        [50, 100, 100, undefined, 'oklch(50% 0.085 100)'],

        // hues parameter
        [12, 34, 56, { hues: 100 }, 'oklch(12% 0.00696 56)'],
        // zero hue step value
        [12, 34, 56, { hues: 0 }, 'oklch(12% 0.00696 56)'],
        [12, 34, 56, { hues: 360 }, 'oklch(12% 0.00696 56)'],
        // small hue step value
        [12, 34, 56, { hues: 0.00001 }, 'oklch(12% 0.00696 56)'],
        [12, 34, 56, { hues: 360 - 0.00001 }, 'oklch(12% 0.01659 56)'],
        [12, 34, 56, { hues: 2 * 360 - 0.00001 }, 'oklch(12% 0.01659 56)'],
        // out of range hue step value
        [12, 34, 56, { hues: -123 }, 'oklch(12% 0.00894 56)'],
        [12, 34, 56, { hues: 475.73096 }, 'oklch(12% 0.0083 56)'],
        [12, 34, 56, { hues: 475.73097 }, 'oklch(12% 0.0083 56)'],
        [12, 34, 56, { hues: 115.73096 }, 'oklch(12% 0.0083 56)'],
        [12, 34, 56, { hues: 115.73097 }, 'oklch(12% 0.0083 56)'],
        // empty array
        [12, 34, 56, { hues: [] }, 'oklch(12% 0.00696 56)'],
        // normal array
        [12, 34, 56, { hues: [10, 20, 30] }, 'oklch(12% 0.01636 56)'],
        [12, 34, 56, { hues: [0, 100, 200, 300] }, 'oklch(12% 0.00696 56)'],
        // out of range arrays
        [12, 34, 56, { hues: [0, 0.00001, 300, 400] }, 'oklch(12% 0.01287 56)'],
        [12, 34, 56, { hues: [-123, 0, 123] }, 'oklch(12% 0.00894 56)'],
    ] as [
        number,
        number,
        number,
        (EgalOptions<OutputFormat> & FindChromaOptions) | undefined,
        string,
    ][])('egal(%o, %o, %o, %o) = %o', (l, c, h, opts, expected) => {
        expect(egal(l, c, h, opts)).toEqual(expected);
    });
});

fuzzyTest.concurrent.prop(
    [
        fc.oneof(
            fc.double(),
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(-Infinity),
        ),
        fc.oneof(
            fc.double(),
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(-Infinity),
        ),
        fc.oneof(
            fc.double(),
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(-Infinity),
        ),
        fc.record({
            output: fc.constantFrom(
                'hsl',
                'hwb',
                'lch',
                'lab',
                'oklch',
                'oklab',
                'srgb',
            ),
            hues: fc.oneof(fc.double(), fc.constant(undefined)),
            opacity: fc.oneof(
                fc.double(),
                fc.constant(undefined),
                fc.constant(NaN),
                fc.constant(Infinity),
                fc.constant(-Infinity),
            ),
            precision: fc.oneof(
                fc.double(),
                fc.constant(undefined),
                fc.constant(NaN),
                fc.constant(Infinity),
                fc.constant(-Infinity),
            ),
            gamut: fc.constantFrom('srgb', 'p3', 'rec2020', undefined),
            space: fc.constantFrom('hct', 'oklch', undefined),
            toeFunction: fc.constantFrom(
                undefined,
                (x: number) =>
                    (x ** 2 + 0.173 * x) / ((1.173 / 1.004) * (x + 0.004)),
            ),
        }),
    ],
    { errorWithCause: true, verbose: 2 },
)('egal output is within gamut', (l, c, h, opts) => {
    const color = new Color(
        egal(l, c, h, opts as EgalOptions<'oklch'> & FindChromaOptions),
    );
    console.log(color.toString({ inGamut: false }));
    expect(color.inGamut(opts.gamut ?? 'srgb')).toEqual(true);
});

describe('sanitizeLightness', () => {
    test.each([
        [NaN, false, NaN, 0],
        [Infinity, false, Infinity, 100],
        [-Infinity, false, -Infinity, 0],
        [-10, false, -10, 0],
        [110, false, 110, 100],
        [50, false, 50, 50],
        [NaN, true, 50, 0],
        [Infinity, true, 50, 100],
        [-Infinity, true, 50, 0],
        [-10, true, 50, 0],
        [110, true, 50, 100],
        [50, true, 50, 50],
    ])(
        'sanitizeLightness(%o, %o, %o) = %o',
        (l, toeFn, lBeforeToeFn, expected) => {
            expect(sanitizeLightness(l, toeFn, lBeforeToeFn)).toEqual(expected);
        },
    );
});

describe('sanitizeHue', () => {
    test.each([
        [NaN, 0],
        [Infinity, 0],
        [-Infinity, 0],
        [-10, 350],
        [370, 10],
        [0, 0],
        [360, 0],
        [720, 0],
        [180, 180],
        [0.00001, 0.00001],
        [359.99999, 359.99999],
        [719.99999, 359.99999],
        [-100, 260],
    ])('sanitizeHue(%o) = %o', (h, expected) => {
        expect(sanitizeHue(h)).toEqual(expected);
    });
});

describe('ensureInRange', () => {
    test.each([
        [5, 0, 10, 5],
        [-5, 0, 10, 0],
        [15, 0, 10, 10],
        [0, 0, 10, 0],
        [10, 0, 10, 10],
        [5, 5, 5, 5],
        [Infinity, 0, 10, 10],
        [-Infinity, 0, 10, 0],
    ])('ensureInRange(%o, %o, %o) = %o', (value, min, max, expected) => {
        expect(ensureInRange(value, min, max)).toEqual(expected);
    });
});

describe('sanitizeHues', () => {
    test.each([
        [0, 1],
        [0.00001, 1],
        [-100, 1],
        [1, 1],
        [359, 359],
        [475.73096, 475.73096],
        [475.73097, 475.73097],
    ])('sanitizeHues(%o) = %o', (h, expected) => {
        expect(sanitizeHues(h)).toEqual(expected);
    });
});

describe('sanitizeChroma', () => {
    test.each([
        [NaN, 0],
        [Infinity, 1000000],
        [-Infinity, 0],
        [-10, 0],
        [1000001, 1000000],
        [0, 0],
        [500000, 500000],
        [1000000, 1000000],
    ])('sanitizeChroma(%o) = %o', (c, expected) => {
        expect(sanitizeChroma(c)).toEqual(expected);
    });
});

describe('sanitizePrecision', () => {
    test.each([
        [NaN, 'oklch', 0.00001],
        [Infinity, 'oklch', 0.00001],
        [-Infinity, 'oklch', 0.00001],
        [0, 'oklch', 0.00001],
        [-0.01, 'oklch', 0.00001],
        [0.000001, 'oklch', 0.00001],
        [0.1, 'oklch', 0.05],
        [0.01, 'oklch', 0.01],
        [NaN, 'hct', 0.01],
        [Infinity, 'hct', 0.01],
        [-Infinity, 'hct', 0.01],
        [0, 'hct', 0.01],
        [-0.01, 'hct', 0.01],
        [0.000001, 'hct', 0.001],
        [10, 'hct', 5],
        [0.01, 'hct', 0.01],
    ] as [number, ColorSpace, number][])(
        'sanitizePrecision(%o, %o) = %o',
        (p, space, expected) => {
            expect(sanitizePrecision(p, space)).toEqual(expected);
        },
    );
});

describe('types', () => {
    test('ColorSpaceConstants', () => {
        expectTypeOf(ColorSpaceConstants).toMatchTypeOf<
            Record<
                ColorSpace,
                {
                    hue: { min: number; max: number };
                    chroma: { min: number; max: number };
                    lightness: { min: number; max: number };
                    props: {
                        hueProp: string;
                        chromaProp: string;
                        lightnessProp: string;
                    };
                }
            >
        >();
    });

    test('defaults', () => {
        expectTypeOf(defaults).toMatchTypeOf<{
            hueStep: number;
            gamut: Gamut;
            space: ColorSpace;
            precision: Record<ColorSpace, number>;
        }>();
    });

    test('Thresholds', () => {
        expectTypeOf(Thresholds).toMatchTypeOf<{
            precision: Record<ColorSpace, { min: number; max: number }>;
            hues: Partial<{ min: number; max: number }>;
            chroma: Partial<{ min: number; max: number }>;
            lightness: Partial<{ min: number; max: number }>;
        }>();
    });

    test('defaultOptions', () => {
        expectTypeOf(defaultOptions).toMatchTypeOf<EgalOptions<OutputFormat>>();
    });
});
