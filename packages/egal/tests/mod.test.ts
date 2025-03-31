import { describe, it, expect } from 'vitest';

const src = await import('../src/mod.js');

describe('src+mod', () => {
    it('is an object', () => {
        expect(src).toBeDefined();
        expect(src).toBeTypeOf('object');
    });

    it('exports `egal`', () => {
        expect(src).toHaveProperty('egal');
    });
});
