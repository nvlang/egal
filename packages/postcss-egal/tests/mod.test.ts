import { describe, test, expect } from 'vitest';
import egalPlugin from '../src/mod.js';
import postcss from 'postcss';
import { egal } from '@nvl/egal';

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

describe('plugin', () => {
    const processor = postcss([egalPlugin()]);

    test('processes egal color', async () => {
        expect(
            (
                await processor.process('.egal { color: egal(.5 .3 10); }', {
                    from: undefined,
                })
            ).css,
        ).toEqual(`.egal { color: ${egal(0.5, 0.3, 10)}; }`);
    });

    test('processes egal in variable declaration', async () => {
        expect(
            (
                await processor.process(
                    ':root { --my-color: egal(50% 30% 10); }',
                    { from: undefined },
                )
            ).css,
        ).toEqual(`:root { --my-color: ${egal(0.5, 0.3, 10)}; }`);
    });

    test('ignores incorrectly used egal', async () => {
        const p = postcss([egalPlugin()]);

        const str = '.my-class { color: egal(none% 0 0 / none%); }';
        const res = await p.process(str, {
            from: undefined,
        });
        expect(res.css).toEqual(str);
        const warnings = res.warnings();
        expect(warnings.length).toEqual(1);
        expect(warnings[0]?.column).toEqual(25);
        expect(warnings[0]?.endColumn).toEqual(30);
        expect(warnings[0]?.text).toEqual('none% is not a valid lightness');

        expect(
            (
                await p.process(':root { --my-color: egal; }', {
                    from: undefined,
                })
            ).css,
        ).toEqual(`:root { --my-color: egal; }`);
    });

    test('warning for `egal(())`', async () => {
        const p = postcss([egalPlugin()]);

        const str = '.my-class { color: egal(()); }';
        const res = await p.process(str, {
            from: undefined,
        });
        expect(res.css).toEqual(str);
        const warnings = res.warnings();
        expect(warnings.length).toEqual(1);
        expect(warnings[0]?.column).toEqual(20);
        expect(warnings[0]?.endColumn).toEqual(28);
        expect(warnings[0]?.text).toEqual("Couldn't parse egal color");
    });

    test('warning for `egal(aaaaa(aaa)aa)`', async () => {
        const p = postcss([egalPlugin()]);

        const str = '.my-class { color: egal(aaaaa(aaa)aa); }';
        const res = await p.process(str, {
            from: undefined,
        });
        expect(res.css).toEqual(str);
        const warnings = res.warnings();
        expect(warnings.length).toEqual(1);
        expect(warnings[0]?.column).toEqual(20);
        expect(warnings[0]?.endColumn).toEqual(38);
        expect(warnings[0]?.text).toEqual("Couldn't parse egal color");
    });
});

describe('plugin (with custom parser)', () => {
    test('processes egal color', async () => {
        const processor = postcss([
            egalPlugin({ parse: () => ({ l: 0.42, c: 1, h: 0 }) }),
        ]);
        expect(
            (
                await processor.process('.egal { color: egal(.5 .3 10); }', {
                    from: undefined,
                })
            ).css,
        ).toEqual(`.egal { color: ${egal(0.42, 1, 0)}; }`);
    });

    test('has default warning text', async () => {
        const processor = postcss([egalPlugin({ parse: () => ({}) })]);
        expect(
            (
                await processor.process('.egal { color: egal(.5 .3 10); }', {
                    from: undefined,
                })
            ).warnings()[0]?.text,
        ).toEqual("Couldn't parse egal color");
    });
});
