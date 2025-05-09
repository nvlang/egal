import {
    describe,
    expect,
    // expectTypeOf,
    test,
} from 'vitest';
import { test as fuzzyTest, fc } from '@fast-check/vitest';
import Color from 'colorjs.io';
import {
    // ColorSpaceConstants,
    // defaultOptions,
    // defaults,
    egal,
    ensureInRange,
    sanitizeChroma,
    sanitizeHue,
    sanitizeHues,
    sanitizeLightness,
    sanitizePrecision,
    // Thresholds,
} from '../src/egal.js';
import type {
    ColorSpace,
    EgalOptions,
    FindChromaOptions,
    // Gamut,
    OutputFormat,
} from '../src/types.js';

describe('egal', () => {
    const toeFunction = (x: number) =>
        (x ** 2 + 0.173 * x) / ((1.173 / 1.004) * (x + 0.004));
    test.concurrent.each([
        [0.5, 1, 0, undefined, 'oklch(50% 0.08501 0)'],
        [0.5, 1, 100, undefined, 'oklch(50% 0.08501 100)'],

        // hues parameter
        [0.12, 0.34, 56, { hues: 100 }, 'oklch(12% 0.00696 56)'],
        // zero hue step value
        [0.12, 0.34, 56, { hues: 0 }, 'oklch(12% 0.00696 56)'],
        [0.12, 0.34, 56, { hues: 360 }, 'oklch(12% 0.00696 56)'],
        // small hue step value
        [0.12, 0.34, 56, { hues: 0.00001 }, 'oklch(12% 0.00696 56)'],
        [0.12, 0.34, 56, { hues: 360 - 0.00001 }, 'oklch(12% 0.01659 56)'],
        [0.12, 0.34, 56, { hues: 2 * 360 - 0.00001 }, 'oklch(12% 0.01659 56)'],
        // out of range hue step value
        [0.12, 0.34, 56, { hues: -123 }, 'oklch(12% 0.00894 56)'],
        [0.12, 0.34, 56, { hues: 475.73096 }, 'oklch(12% 0.0083 56)'],
        [0.12, 0.34, 56, { hues: 475.73097 }, 'oklch(12% 0.0083 56)'],
        [0.12, 0.34, 56, { hues: 115.73096 }, 'oklch(12% 0.0083 56)'],
        [0.12, 0.34, 56, { hues: 115.73097 }, 'oklch(12% 0.0083 56)'],
        // empty array
        [0.12, 0.34, 56, { hues: [] }, 'oklch(12% 0.00696 56)'],
        // normal array
        [0.12, 0.34, 56, { hues: [10, 20, 30] }, 'oklch(12% 0.01637 56)'],
        [0.12, 0.34, 56, { hues: [0, 100, 200, 300] }, 'oklch(12% 0.00696 56)'],
        // out of range arrays
        [
            0.12,
            0.34,
            56,
            { hues: [0, 0.00001, 300, 400] },
            'oklch(12% 0.01287 56)',
        ],
        [0.12, 0.34, 56, { hues: [-123, 0, 123] }, 'oklch(12% 0.00894 56)'],
        [0.12, 0.34, 56, { space: 'oklch' }, 'oklch(12% 0.00696 56)'],
        [0.12, 0.34, 56, { toeFunction }, 'oklch(24.27% 0.01404 56)'],
        [0.12, 0.34, 56, { space: 'hct' }, 'oklch(24.255% 0.01784 56.423)'],
        [0.9, 1, 100, { toeFunction }, 'oklch(91.434% 0.04099 100)'],
        [0.9, 1, 100, { space: 'hct' }, 'oklch(91.315% 0.04199 93.457)'],
        [0.5, 1, 100, { toeFunction }, 'oklch(57.147% 0.09716 100)'],
        [0.5, 1, 100, { space: 'hct' }, 'oklch(56.767% 0.10681 98.597)'],
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
    { verbose: 2 },
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
        [Infinity, false, Infinity, 1],
        [-Infinity, false, -Infinity, 0],
        [-0.1, false, -0.1, 0],
        [1.1, false, 1.1, 1],
        [0.5, false, 0.5, 0.5],
        [NaN, true, 0.5, 0],
        [Infinity, true, 0.5, 1],
        [-Infinity, true, 0.5, 0],
        [-0.1, true, 0.5, 0],
        [1.1, true, 0.5, 1],
        [0.5, true, 0.5, 0.5],
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

describe('README examples', () => {
    test('palette', () => {
        const hues = [0, 60, 120, 180, 240, 300];
        const lightnesses = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        const palette = hues.map((hue) =>
            lightnesses.map((lightness) => egal(lightness, 100, hue, { hues })),
        );
        expect(palette[0]?.[0]).toEqual('oklch(0% 0 none)');
        expect(palette[0]?.[1]).not.toEqual('oklch(0% 0 none)');
        expect(palette[0]?.[1]).not.toEqual('oklch(10% 0 none)');
        expect(palette[0]?.[10]).toEqual('oklch(100% 0 none)');
        expect(palette[5]?.[0]).toEqual('oklch(0% 0 none)');
        expect(palette[5]?.[10]).toEqual('oklch(100% 0 none)');
    });
});

// describe('types', () => {
//     test('ColorSpaceConstants', () => {
//         expectTypeOf(ColorSpaceConstants).toMatchTypeOf<
//             Record<
//                 ColorSpace,
//                 {
//                     hue: { min: number; max: number };
//                     chroma: { min: number; max: number };
//                     lightness: { min: number; max: number };
//                     props: {
//                         hueProp: string;
//                         chromaProp: string;
//                         lightnessProp: string;
//                     };
//                 }
//             >
//         >();
//     });
//
//     test('defaults', () => {
//         expectTypeOf(defaults).toMatchTypeOf<{
//             hueStep: number;
//             gamut: Gamut;
//             space: ColorSpace;
//             precision: Record<ColorSpace, number>;
//         }>();
//     });
//
//     test('Thresholds', () => {
//         expectTypeOf(Thresholds).toMatchTypeOf<{
//             precision: Record<ColorSpace, { min: number; max: number }>;
//             hues: Partial<{ min: number; max: number }>;
//             chroma: Partial<{ min: number; max: number }>;
//             lightness: Partial<{ min: number; max: number }>;
//         }>();
//     });
//
//     test('defaultOptions', () => {
//         expectTypeOf(defaultOptions).toMatchTypeOf<EgalOptions<OutputFormat>>();
//     });
// });
