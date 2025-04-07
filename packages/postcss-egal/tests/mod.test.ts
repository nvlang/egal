import { describe, test, expect } from 'vitest';
import egalPlugin from '../src/mod.js';
import postcss from 'postcss';
import { egal } from '@nvl/egal';
import { test as fuzzyTest, fc } from '@fast-check/vitest';
import type { PluginOptions } from '../src/types.js';

const src = await import('../src/mod.js');

describe('src+mod', () => {
    test('is an object', () => {
        expect(src).toBeDefined();
        expect(src).toBeTypeOf('object');
    });

    test('has default export', () => {
        expect(src).toHaveProperty('default');
        expect(src.default).toBeDefined();
    });
});

describe('warnings', () => {
    const processor = postcss([egalPlugin()]);
    test.each([
        [
            'color: egal(none% 40% 10);',
            [['none%', 'none% is not a valid value']],
        ],
        [
            'border: 1px solid egal(none% 40% 10);',
            [['none%', 'none% is not a valid value']],
        ],
        [
            "background: linear-gradient(egal(1 1 0), egal(1 1 0, 'p3'));",
            [["'p3'", "Don't use quotes around gamut"]],
            "background: linear-gradient(oklch(100% 0 none), egal(1 1 0, 'p3'));",
        ],
        [
            'background: linear-gradient(egal(1 1 0), egal((1 1 0)));',
            [['egal((1 1 0))', "Couldn't parse egal color"]],
            'background: linear-gradient(oklch(100% 0 none), egal((1 1 0)));',
        ],
        ['color: egal(());', [['egal(())', "Couldn't parse egal color"]]],
        [
            'color: egal(1(23)456);',
            [['egal(1(23)456)', "Couldn't parse egal color"]],
        ],
        [
            'color: egal(1 % 2 % 3 / none) !important;',
            [['1 %', 'Whitespace between number and % is forbidden']],
        ],
        [
            'background: linear-gradient(egal(1 1 0, "{"key":123}"), egal(1 1 0, \'p3\'));',
            [
                ['"{"key":123}"', 'Use single quotes around JSON object'],
                ["'p3'", "Don't use quotes around gamut"],
            ],
        ],
    ] as [string, [string, string][], string?][])(
        '%s',
        (input, problems, output) => {
            const result = processor.process(input, { from: undefined });
            output ??= input;
            expect(result.css).toEqual(output);
            const warnings = result.warnings();
            expect(warnings.length).toEqual(problems.length);
            problems.forEach(([problem, warning], i) => {
                expect(warnings[i]?.text).toEqual(warning);
                expect(
                    output.slice(
                        (warnings[i]?.column ?? 1) - 1,
                        (warnings[i]?.endColumn ?? 1) - 1,
                    ),
                ).toEqual(problem);
                expect(warnings[i]?.line).toEqual(1);
                expect(warnings[i]?.endLine).toEqual(1);
                expect(warnings[i]?.plugin).toEqual('postcss-egal');
                expect(warnings[i]?.type).toEqual('warning');
            });
        },
    );
});

describe('processing', () => {
    const processor = postcss([egalPlugin()]);
    describe.each([
        [
            'egal(0 0 0)',
            /^color: egal\((none|0|0%|0\.0|\.0) (none|0|0%|0\.0|\.0) (none|0|0(deg|turn|rad|grad)|0\.0|\.0)\);$/u,
            /^\s*color: oklch\((0%?|none) (0|none) (0|none)\);\s*$/u,
        ],
        [
            'linear-gradient(egal(50% 100% 0), egal(80% 100% 0));',
            /^background: linear-gradient\(egal\((\.5|0\.5|50%) (1|1\.0|100%|100\.0%) (none|0|0(deg|turn|rad|grad)|0\.0|\.0)\), egal\((\.8|0\.8|80%) (1|1\.0|100%|100\.0%) (none|0|0(deg|turn|rad|grad)|0\.0|\.0)\)\);$/u,
            `background: linear-gradient(${egal(0.5, 1, 0)}, ${egal(0.8, 1, 0)});`,
        ],
        [
            'egal(70% 150% 360deg / none);',
            /^color: egal\((\.7|0\.7|70%) (1\.5|150%|150\.0%) (360|360deg|400grad|1turn|1\.0turn|6\.2831853072rad) \/ (0%|0\.0%|0\.0|0|none|\.0)\);$/u,
            `color: ${egal(0.7, 1.5, 360, { opacity: 0 })};`,
        ],
        [
            'egal(10% 1 180deg / 50%, p3, \'{"gamut": "rec2020", "opacity": 0.3}\');',
            /^color: egal\((\.1|0\.1|10%) (1|1\.0|100%|100\.0%) (180|180deg|200grad|0\.5turn|\.5turn|3\.14159265359rad) \/ (50%|50\.0%|0\.5|\.5), p3, '\{[ ]?"gamut": "(rec2020|srgb)",[ ]?"opacity": 0\.3[ ]?\}'\);$/u,
            `color: ${egal(0.1, 1, 180, { gamut: 'p3', opacity: 0.5 })};`,
        ],
        [
            // invalid JSON
            "egal(70% 150% 360deg / none, '{p3}');",
            /^color: egal\((\.7|0\.7|70%) (1\.5|150%|150\.0%) (360|360deg|400grad|1turn|1\.0turn|6\.2831853072rad) \/ (0%|0\.0%|0\.0|0|none|\.0), '\{("|"key":|"key",|\[\]|p3|'p3'|"p3"|gamut: p3|gamut: "p3"|"gamut": "p3"[,;])\}'\);$/u,
        ],
    ] as [string, RegExp, (string | RegExp | undefined)?][])(
        '%s',
        (_label, inputRegExp, expectedRegExp) => {
            fuzzyTest.prop([fc.stringMatching(inputRegExp)])(
                inputRegExp.source,
                (input) => {
                    const result = processor.process(input, {
                        from: undefined,
                    });
                    expect(result.css).toMatch(expectedRegExp ?? input);
                    if (expectedRegExp) {
                        const warnings = result.warnings();
                        expect(warnings.length).toEqual(0);
                    }
                },
            );
        },
    );
});

describe('plugin options', () => {
    test.each([
        [
            { checkVariables: true },
            '--my-color: egal(50% 30% 10);',
            `--my-color: ${egal(0.5, 0.3, 10)};`,
        ],
        [{ checkVariables: false }, '--my-color: egal(50% 30% 10);'],
        [
            { properties: ['color'] },
            'color: egal(50% 30% 10);',
            `color: ${egal(0.5, 0.3, 10)};`,
        ],
        [{ properties: ['background'] }, 'color: egal(50% 30% 10);'],
    ] as [PluginOptions, string, string?][])('%o', (opts, input, output) => {
        output ??= input;
        const processor = postcss([egalPlugin(opts)]);
        const result = processor.process(input, { from: undefined });
        expect(result.css).toEqual(output);
        expect(result.warnings().length).toEqual(0);
    });

    test.each([
        { hues: 10 },
        { gamut: 'rec2020' },
        { opacity: 0.7 },
        { output: 'lab' },
        { precision: 0.01 },
        { space: 'hct' },
        { toeFunction: (l: number) => 0.9 * l },
    ] as PluginOptions[])('%o', (opts) => {
        const input = 'color: egal(50% 30% 10);';
        const output = `color: ${egal(0.5, 0.3, 10, opts)};`;
        const processor = postcss([egalPlugin(opts)]);
        const result = processor.process(input, { from: undefined });
        expect(result.css).toEqual(output);
        expect(result.warnings().length).toEqual(0);
    });
});
