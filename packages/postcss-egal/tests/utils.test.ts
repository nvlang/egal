import { defaultParse } from '../src/utils.js';
import { describe, test, expect } from 'vitest';

describe('defaultParse', () => {
    test('parses valid egal string with percentages', () => {
        const input = 'egal(50% 30% 10)';
        const result = defaultParse(input, {});
        expect(result).toEqual({ l: 50, c: 30, h: 10 });
    });

    test('parses valid egal string without percentages', () => {
        const input = 'egal(50 30 10)';
        const result = defaultParse(input, {});
        expect(result).toEqual({ l: 50, c: 30, h: 10 });
    });

    test('returns null for invalid egal string', () => {
        const input = 'invalid(50 30 10)';
        const result = defaultParse(input, {});
        expect(result).toBeNull();
    });

    test('returns null for missing values', () => {
        const input = 'egal(50 30)';
        const result = defaultParse(input, {});
        expect(result).toBeNull();
    });

    test('returns null for non-numeric values', () => {
        const input = 'egal(50% abc 10)';
        const result = defaultParse(input, {});
        expect(result).toBeNull();
    });

    test('parses valid egal string with extra spaces', () => {
        const input = 'egal(  50%   30%   10  )';
        const result = defaultParse(input, {});
        expect(result).toEqual({ l: 50, c: 30, h: 10 });
    });
});
