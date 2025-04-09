import { describe, test, expect } from 'vitest';
import egalVisitor, { type VisitorOptions } from '../src/mod.js';
import { egal } from '@nvl/egal';
import { test as fuzzyTest, fc } from '@fast-check/vitest';
import { transform } from 'lightningcss';

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

function process(input: string, options?: VisitorOptions) {
    return transform({
        code: Buffer.from(input),
        filename: 'test.css',
        minify: false,
        visitor: egalVisitor(options),
    });
}

describe('bad input', () => {
    test.each([
        ['color: egal(none% 40% 10);'],
        ['border: 1px solid egal(none% 40% 10);'],
        [
            "background: linear-gradient(egal(1 1 0), egal(1 1 0, 'p3'));",
            'background: linear-gradient(oklch(100% 0 none), oklch(100% 0 none));',
        ],
        [
            'background: linear-gradient(egal(1 1 0), egal((1 1 0)));',
            'background: linear-gradient(oklch(100% 0 none), egal((1 1 0)));',
        ],
        ['color: egal(());'],
        ['color: egal(1(23)456);', 'color: egal(1(23) 456);'],
        [
            'color: egal(1 % 2 % 3 / none) !important;',
            'color: egal(1% 2% 3 / none) !important;',
        ],
        [
            'background: linear-gradient(egal(1 1 0, "{"key":123}"), egal(1 1 0, \'p3\'));',
            'background: linear-gradient(egal(1 1 0, "{"key":123}"), oklch(100% 0 none));',
        ],
        ['color: egal(70% 150% 360deg / something);'],
    ] as [string, string?][])('%s', (input, output) => {
        const result = process(`p{${input}}`);
        output ??= input;
        expect(result.code.toString()).toContain(output);
    });
});

describe('processing', () => {
    describe.each([
        [
            'egal(0 0 0)',
            /^p\{color: egal\((none|0|0%|0\.0|\.0) (none|0|0%|0\.0|\.0) (none|0|0(deg|turn|rad|grad)|0\.0|\.0)\);\}$/u,
            /^p\s*\{\s*color: oklch\((0%?|none) (0|none) (0|none)\);\s*\}\s*$/u,
        ],
        [
            'linear-gradient(egal(50% 100% 0), egal(80% 100% 0));',
            /^p\{background: linear-gradient\(egal\((\.5|0\.5|50%) (1|1\.0|100%|100\.0%) (none|0|0(deg|turn|rad|grad)|0\.0|\.0)\), egal\((\.8|0\.8|80%) (1|1\.0|100%|100\.0%) (none|0|0(deg|turn|rad|grad)|0\.0|\.0)\)\);\n*\}$/u,
            `background: linear-gradient(${egal(0.5, 1, 0).replaceAll(' 0.', ' .')}, ${egal(0.8, 1, 0).replaceAll(' 0.', ' .')});`,
        ],
        [
            'egal(70% 150% 360deg / none);',
            /^p\{color: egal\((\.7|0\.7|70%) (1\.5|150%|150\.0%) (360|360deg|400grad|1turn|1\.0turn|0rad) \/ (0%|0\.0%|0\.0|0|none|\.0)\);\n*\}$/u,
            `color: ${egal(0.7, 1.5, 360, { opacity: 0 }).replaceAll(' 0.', ' .')};`,
        ],
        [
            'egal(70% 150% 360deg,,);',
            /^p\{color: egal\((\.7|0\.7|70%) (1\.5|150%|150\.0%) (360|360deg|400grad|1turn|1\.0turn|0rad)[, ]+\);\n*\}$/u,
            `color: ${egal(0.7, 1.5, 360).replaceAll(' 0.', ' .')};`,
        ],
        [
            'egal(70% 150% 360deg, something);',
            /^p\{color: egal\((\.7|0\.7|70%) (1\.5|150%|150\.0%) (360|360deg|400grad|1turn|1\.0turn|0rad), something\);\n*\}$/u,
            `color: ${egal(0.7, 1.5, 360).replaceAll(' 0.', ' .')};`,
        ],
        [
            'egal(10% 1 180deg / 50%, p3, \'{"gamut": "rec2020", "opacity": 0.3}\');',
            /^p\{color: egal\((\.1|0\.1|10%) (1|1\.0|100%|100\.0%) (180|180deg|200grad|0\.5turn|\.5turn|3\.14159265359rad) \/ (50%|50\.0%|0\.5|\.5), p3, '\{[ ]?"gamut": "(rec2020|srgb)",[ ]?"opacity": 0\.3[ ]?\}'\);\n*\}$/u,
            `color: ${egal(0.1, 1, 180, { gamut: 'p3', opacity: 0.5 }).replaceAll(' 0.', ' .')};`,
        ],
        [
            'egal(10% 1 180deg, \'{"gamut": "rec2020", "opacity": 0.3}\');',
            /^p\{color: egal\((\.1|0\.1|10%) (1|1\.0|100%|100\.0%) (180|180deg|200grad|0\.5turn|\.5turn|3\.14159265359rad), '\{[ ]?"gamut": "rec2020",[ ]?"opacity": 0\.3[ ]?\}'\);\n*\}$/u,
            `color: ${egal(0.1, 1, 180, { gamut: 'rec2020', opacity: 0.3 }).replaceAll(' 0.', ' .')};`,
        ],
        [
            // invalid JSON
            "egal(70% 150% 360deg / none, '{p3}');",
            /^p\{color: egal\((\.7|0\.7|70%) (1\.5|150%|150\.0%) (360|360deg|400grad|1turn|1\.0turn|0rad) \/ (0%|0\.0%|0\.0|0|none|\.0), '\{("|"key":|"key",|\[\]|p3|"p3"|gamut: p3|gamut: "p3"|"gamut": "p3"[,;])\}'\);\n*\}$/u,
            `color: ${egal(0.7, 1.5, 0, { opacity: 0 }).replaceAll(' 0.', ' .')};`,
        ],
    ] as [string, RegExp, (string | RegExp | undefined)?][])(
        '%s',
        (_label, inputRegExp, expectedRegExp) => {
            fuzzyTest.prop([fc.stringMatching(inputRegExp)])(
                inputRegExp.source,
                (input) => {
                    const result = process(input);
                    expect(result.code.toString()).toMatch(
                        expectedRegExp ?? input,
                    );
                    if (expectedRegExp) {
                        expect(result.warnings.length).toEqual(0);
                    }
                },
            );
        },
    );
});

describe('plugin options', () => {
    test.each([
        { hues: 10 },
        { gamut: 'rec2020' },
        { opacity: 0.7 },
        { output: 'lab' },
        { precision: 0.01 },
        { space: 'hct' },
        { toeFunction: (l: number) => 0.9 * l },
    ] as VisitorOptions[])('%o', (opts) => {
        const input = 'p{color: egal(50% 30% 10);}';
        const output = `color: ${egal(0.5, 0.3, 10, opts).replaceAll(' 0.', ' .')};`;
        const result = process(input, opts);
        expect(result.code.toString()).toContain(output);
        expect(result.warnings.length).toEqual(0);
    });
});
