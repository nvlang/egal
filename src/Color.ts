// External dependencies
import {
    Hct,
    ViewingConditions,
    hexFromArgb,
    rgbaFromArgb,
    labFromArgb,
} from '@material/material-color-utilities';

// Internal dependencies
import { ColorSequence } from './ColorSequence';

/**
 * A color in the Egal color system.
 */
export class Color {
    /**
     * Name of the color.
     */
    public colorName: string;

    /**
     * The HCT color, given in the default viewing conditions:
     * - White point: D65
     * - Adapting luminance: 11.72 cd/m²
     * - Background L*: 50
     * - Surround: 2
     * - Discounting illuminant: `false`
     */
    public colorHct: Hct;

    /**
     * The suffix for this color, representing the luminance, without separator.
     * Examples: `0`, `50`, `100`, `500`, `1000`, etc.
     */
    public colorSuffix: string;

    /**
     * The color sequence within which this color is defined.
     */
    readonly parentColorSequence?: ColorSequence;

    constructor(
        colorName: string,
        colorHct: Hct,
        colorSuffix: string,
        parentColorSequence?: ColorSequence
    ) {
        this.colorName = colorName;
        this.colorHct = colorHct;
        this.colorSuffix = colorSuffix;
        this.parentColorSequence = parentColorSequence;
    }

    /**
     * Instantiates (i.e., prints) the color in the specified format
     * (`ColorFormat.Hex` by default), using the specified viewing conditions (or
     * the `ETheme`'s default viewing conditions, which default to HCT's default
     * viewing conditions if unspecified).
     *
     * @remarks
     * The word "instantiates" is used to emphasize the fact that the color
     * itself doesn't have a single, "definitive" representation per se (like,
     * for example, a specific RGB or even HCT value). Rather, it must always be
     * contextualized with specific viewing conditions.
     */
    public instantiate(
        format: ColorFormat = ColorFormat.Hct,
        viewingConditions: ViewingConditions = this.parentColorSequence?.viewingConditions ||
            ViewingConditions.DEFAULT
    ): string {
        switch (format) {
            case ColorFormat.Hex: {
                return hexFromArgb(this.colorHct.inViewingConditions(viewingConditions).toInt());
            }
            case ColorFormat.Hct: {
                const hct = this.colorHct.inViewingConditions(viewingConditions);
                const hue = hct.hue.toFixed(2);
                const chroma = hct.chroma.toFixed(2);
                const tone = hct.tone.toFixed(2);
                return `hct(${hue}, ${chroma}, ${tone})`;
            }
            case ColorFormat.Rgb: {
                const rgba = rgbaFromArgb(
                    this.colorHct.inViewingConditions(viewingConditions).toInt()
                );
                const r = rgba.r;
                const g = rgba.g;
                const b = rgba.b;
                const a = rgba.a;
                if (a != 255) {
                    throw new Error(
                        `Unexpected alpha value (${a}) when converting HCT to RGBA. Expected 255.`
                    );
                }
                return `rgb(${r}, ${g}, ${b})`;
            }
            case ColorFormat.Lab: {
                const lab = labFromArgb(
                    this.colorHct.inViewingConditions(viewingConditions).toInt()
                );
                return `lab(${lab.join(', ')})`;
            }
            case ColorFormat.Rgb1: {
                const rgba = rgbaFromArgb(
                    this.colorHct.inViewingConditions(viewingConditions).toInt()
                );
                const r = rgba.r / 255;
                const g = rgba.g / 255;
                const b = rgba.b / 255;
                const a = rgba.a / 255;
                if (a != 1) {
                    throw new Error(
                        `Unexpected alpha value (${a}) when converting HCT to RGBA. Expected 1.`
                    );
                }
                return `rgb(${r}, ${g}, ${b})`;
            }
            case ColorFormat.Rgb1Array: {
                const rgba = rgbaFromArgb(
                    this.colorHct.inViewingConditions(viewingConditions).toInt()
                );
                const r = rgba.r / 255;
                const g = rgba.g / 255;
                const b = rgba.b / 255;
                const a = rgba.a / 255;
                if (a != 1) {
                    throw new Error(
                        `Unexpected alpha value (${a}) when converting HCT to RGBA. Expected 1.`
                    );
                }
                return `[${r}, ${g}, ${b}]`;
            }
            default: {
                throw new Error(`Unexpected color format: ${format}`);
            }
        }
    }

    public instantiateRgbArray(vc: ViewingConditions = ViewingConditions.DEFAULT): number[] {
        const rgba = rgbaFromArgb(this.colorHct.inViewingConditions(vc).toInt());
        const r = rgba.r / 255;
        const g = rgba.g / 255;
        const b = rgba.b / 255;
        const a = rgba.a / 255;
        if (a != 1) {
            throw new Error(
                `Unexpected alpha value (${a}) when converting HCT to RGBA. Expected 1.`
            );
        }
        return [r, g, b];
    }
}

/**
 * The format to use when instantiating a color.
 * @see Color.instantiate
 * @example
 * ```typescript
 * const color = new EColor('black', Hct.from(0, 0, 0));
 * console.log(color.instantiate(ColorFormat.Hct)); // hct(0, 0, 0)
 * console.log(color.instantiate(ColorFormat.Hex)); // #000000
 * console.log(color.instantiate(ColorFormat.Rgb)); // rgb(0, 0, 0)
 * console.log(color.instantiate(ColorFormat.Lab)); // lab(0, 0, 0)
 * ```
 */
export enum ColorFormat {
    Hct,
    Hex,
    Rgb,
    Lab,
    Rgb1,
    Rgb1Array,
}
