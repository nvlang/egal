/* eslint-disable tsdoc/syntax */
/**
 * @packageDocumentation
 * The `egal` module exports a function `egal` that can be used to generate
 * colors which are perceptually uniform with respect to both lightness and
 * chroma (saturation).
 *
 * @example
 * ```ts
 * import { egal } from 'egal';
 * console.log(egal(50, 100, 0));
 * console.log(egal(50, 100, 100));
 * ```
 *
 * This will output two colors in the OkLCh color space (one with hue 0 and
 * one with hue 100), which have the same perceived lightness and saturation,
 * and where, if the chroma were increased at all, some hues would not be able
 * to "keep up" with the chroma increase at the same lightness.
 *
 * @module egal
 */

export { egal } from './egal.js';
export type { EgalOptions, OutputColor, OutputFormat } from './types.js';
