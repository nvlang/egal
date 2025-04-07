import { indexOfClosingParenthesis } from '../src/utils.js';
import { describe, test, expect } from 'vitest';

describe('indexOfClosingParenthesis', () => {
    test('returns -1 if no closing parenthesis is found', () => {
        expect(indexOfClosingParenthesis('foo(bar', 3)).toBe(-1);
    });

    test('returns the index of the closing parenthesis', () => {
        expect(indexOfClosingParenthesis('foo(bar)', 3)).toBe(7);
    });

    test('returns the index of the closing parenthesis matching the indicated opening parenthesis', () => {
        expect(indexOfClosingParenthesis('foo(bar(baz))', 3)).toBe(12);
    });

    test('returns -1 if there are no closing parenthesis matching the indicated opening parenthesis', () => {
        expect(indexOfClosingParenthesis('foo(bar(baz)', 3)).toBe(-1);
    });
});
