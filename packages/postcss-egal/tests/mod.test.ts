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
        expect(
            (
                await processor.process('.my-class { color: egal; }', {
                    from: undefined,
                })
            ).css,
        ).toEqual('.my-class { color: egal; }');

        expect(
            (
                await processor.process(':root { --my-color: egal; }', {
                    from: undefined,
                })
            ).css,
        ).toEqual(`:root { --my-color: egal; }`);
    });
});

describe('plugin (with custom parser)', () => {
    const processor = postcss([
        egalPlugin({ parse: () => ({ l: 0.42, c: 1, h: 0 }) }),
    ]);

    test('processes egal color', async () => {
        expect(
            (
                await processor.process('.egal { color: egal(.5 .3 10); }', {
                    from: undefined,
                })
            ).css,
        ).toEqual(`.egal { color: ${egal(0.42, 1, 0)}; }`);
    });
});
