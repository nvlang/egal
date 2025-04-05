import { defaultParse } from '../src/utils.js';
import { describe, test, expect } from 'vitest';
import { test as fuzzyTest, fc } from '@fast-check/vitest';

describe('defaultParse', () => {
    test.each([
        ['egal(none none none)', { l: 0, c: 0, h: 0, overrideOptions: {} }],
        [
            'egal(none% none none)',
            {
                message: 'none% is not a valid lightness',
                postcssWarningOptions: {
                    word: 'none%',
                },
            },
        ],
        [
            'egal(none none% none)',
            {
                message: 'none% is not a valid chroma',
                postcssWarningOptions: {
                    word: 'none%',
                },
            },
        ],
        [
            'egal(none none nonedeg)',
            {
                message: 'nonedeg is not a valid hue',
                postcssWarningOptions: {
                    word: 'nonedeg',
                },
            },
        ],
        ['egal(1 1 none)', { l: 1, c: 1, h: 0, overrideOptions: {} }],
        ['egal(1 1 0)', { l: 1, c: 1, h: 0, overrideOptions: {} }],
        ['egal(1. 1 0)', { l: 1, c: 1, h: 0, overrideOptions: {} }],
        ['egal(1 1. 0)', { l: 1, c: 1, h: 0, overrideOptions: {} }],
        ['egal(1 none 0)', { l: 1, c: 0, h: 0, overrideOptions: {} }],
        ['egal(1 1 60deg)', { l: 1, c: 1, h: 60, overrideOptions: {} }],
        ['egal(1 1 60grad)', { l: 1, c: 1, h: 54, overrideOptions: {} }],
        [
            'egal(50% 80% 143 / .5)',
            { l: 0.5, c: 0.8, h: 143, overrideOptions: { opacity: 0.5 } },
        ],
        [
            'egal(50% 80% 143 / 0.5)',
            { l: 0.5, c: 0.8, h: 143, overrideOptions: { opacity: 0.5 } },
        ],
        [
            'egal(50% 80% 143 / 50%)',
            { l: 0.5, c: 0.8, h: 143, overrideOptions: { opacity: 0.5 } },
        ],
        [
            'egal(50% 80% 143 / 0)',
            { l: 0.5, c: 0.8, h: 143, overrideOptions: { opacity: 0 } },
        ],
        [
            'egal(50% 80% 143 / 0%)',
            { l: 0.5, c: 0.8, h: 143, overrideOptions: { opacity: 0 } },
        ],
        [
            'egal(50% 80% 143 / none)',
            { l: 0.5, c: 0.8, h: 143, overrideOptions: { opacity: 0 } },
        ],
        [
            'egal(50% 80% 143 / none%)',
            {
                message: 'none% is not a valid opacity',
                postcssWarningOptions: {
                    word: 'none%',
                },
            },
        ],
        [
            'egal(1 1 1rad)',
            { l: 1, c: 1, h: 180 / Math.PI, overrideOptions: {} },
        ],
        ['egal(1 1 0.5turn)', { l: 1, c: 1, h: 180, overrideOptions: {} }],
        [
            'egal(1 1 0, p3)',
            { l: 1, c: 1, h: 0, overrideOptions: { gamut: 'p3' } },
        ],
        [
            'egal(1 1 0, \'{"gamut": "p3"}\')',
            { l: 1, c: 1, h: 0, overrideOptions: { gamut: 'p3' } },
        ],
        ['égal(1 1 0, \'{"gamut": "p3"}\')', null],
        [
            'egal()',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 11,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(NaN NaN NaN)',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 22,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(NaN NaN 0)',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 20,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(NaN 0 NaN)',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 20,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(NaN 0 0)',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 18,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(0 NaN NaN)',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 20,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(0 NaN 0)',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 18,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(0 0 NaN)',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 18,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
        [
            'egal(()',
            {
                message: "Couldn't parse egal color",
                postcssWarningOptions: {
                    endIndex: 10,
                    index: 5,
                    plugin: '@nvl/postcss-egal',
                },
            },
        ],
    ] as [string, object][])('%s', (input, exected) => {
        const result = defaultParse(input, {}, { prop: 'color', value: input });
        expect(result).toEqual(exected);
    });

    fuzzyTest.concurrent.prop([
        fc.constantFrom(...numbers, ...percentages),
        fc.constantFrom(...whitespaces),
        fc.constantFrom(...numbers, ...percentages),
        fc.constantFrom(...whitespaces),
        fc.constantFrom(...numbers),
    ])('random LCh input', (l, ws1, c, ws2, h) => {
        const input = `egal(${l[0] + ws1 + c[0] + ws2 + h[0]})`;
        expect(
            defaultParse(input, {}, { prop: 'color', value: input }),
        ).toEqual({ l: l[1], c: c[1], h: h[1], overrideOptions: {} });
    });

    fuzzyTest.concurrent.prop([
        fc.constantFrom(...numbers, ...percentages),
        fc.constantFrom(...whitespaces),
        fc.constantFrom(...numbers, ...percentages),
        fc.constantFrom(...whitespaces),
        fc.constantFrom(...numbers),
        fc.constantFrom(...whitespaces, ','),
        fc.constantFrom(...gamuts),
    ])('random LCh + gamut input', (l, ws1, c, ws2, h, sep3, gamut) => {
        const input = `egal(${l[0] + ws1 + c[0] + ws2 + h[0] + sep3 + gamut[0]})`;
        expect(
            defaultParse(input, {}, { prop: 'color', value: input }),
        ).toEqual({
            l: l[1],
            c: c[1],
            h: h[1],
            overrideOptions: { gamut: gamut[1] },
        });
    });
});

const whitespaces = [' ', '\n', '\t', '\n\t', '\n  '] as const;

const gamuts = [
    ['srgb', 'srgb'],
    ['p3', 'p3'],
    ['rec2020', 'rec2020'],
    ['sRGB', 'srgb'],
    ['P3', 'p3'],
    ['Rec2020', 'rec2020'],
    ['Rec.2020', 'rec2020'],
    ['rec.2020', 'rec2020'],
] as const;

const numbers: [string, number][] = [
    ['1', 1],
    ['1.', 1],
    ['1.0', 1],
    ['01', 1],
    ['01.', 1],
    ['01.0', 1],
    ['0', 0],
    ['0.', 0],
    ['0.0', 0],
    ['.0', 0],
    ['100', 100],
    ['100.', 100],
    ['100.0', 100],
    ['42', 42],
    ['42.', 42],
    ['42.0', 42],
    ['0.5', 0.5],
    ['.5', 0.5],
    ['0.50', 0.5],
    ['0.05', 0.05],
    ['0.050', 0.05],
];

const percentages: [string, number][] = numbers.map(([str, num]) => [
    `${str}%`,
    num / 100,
]);
