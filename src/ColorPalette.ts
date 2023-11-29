// External dependencies
import { ViewingConditions } from '@material/material-color-utilities';
import ase from 'ase-utils';

// Internal dependencies
import { Hue, ColorSequence, ChromaProgression } from './ColorSequence';
import { writeToFile } from './utilities';
import { ColorFormat } from './Color';

export class ColorPalette {
    /**
     * The hues of the palette.
     */
    get hues(): Hue[] {
        return this.colorSequences.map((cs) => cs.hue);
    }

    /**
     * The (default) tones of the palette.
     */
    public tones: number[];

    /**
     * The color sequences of the palette.
     */
    public colorSequences: ColorSequence[] = [];

    /**
     * The default viewing conditions to be used by all color sequences of the
     * palette.
     *
     * @defaultValue {@link ViewingConditions.DEFAULT}
     */
    public defaultViewingConditions: ViewingConditions;

    /**
     * The default chroma progression to be used by all color sequences of the
     * palette.
     */

    /**
     * We want to be able to adjust the chroma progression of all elements of
     * {@link colorSequences} at once, while maintaining intellisense and
     * type-safety. To achieve this, we define a private property
     * {@link _chromaProgression}, which will act as the "default" chroma
     * progression that all color sequences of the palette should use, and a
     * public property {@link chromaProgression}, which acts as a proxy for
     * {@link _chromaProgression}. The user will interact with
     * {@link chromaProgression}, and the proxy handler will make sure that the
     * interactions are propagated not only to {@link _chromaProgression}, but
     * also to the chroma progressions of all color sequences of the palette.
     *
     * @remarks
     * The user can override the chroma progression of individual color
     * sequences. This is the advantage of using a proxy, as opposed to using a
     * single property `defaultChromaProgression` and then referencing it from
     * all color sequences. If we did that, a modification to the chroma
     * progression of a single color sequence would be propagated to all color
     * sequences (since we passed by reference). So, instead, we pass by value
     * and use a proxy to propagate changes to the palette's chroma progression
     * to those of its color sequences.
     *
     * @example
     * // This will change the chroma progression of all color sequences of the palette.
     * palette.chromaProgression.type = 'singleTarget';
     * palette.chromaProgression.target = 5;
     */
    private _defaultChromaProgression: ChromaProgression;
    public defaultChromaProgression: ChromaProgression;

    constructor(
        hues: Hue[],
        tones: number[],
        defaultViewingConditions: ViewingConditions = ViewingConditions.DEFAULT
    ) {
        this.tones = tones;
        this.defaultViewingConditions = defaultViewingConditions;
        this.defaultChromaProgression = new ChromaProgression({
            tones,
            hues,
            defaultViewingConditions,
        });
        for (const hue of hues) {
            const cs = new ColorSequence(this, hue);
            this.colorSequences.push(cs);
        }

        this._defaultChromaProgression = new ChromaProgression({
            tones,
            hues,
            defaultViewingConditions,
        });
        this.defaultChromaProgression = new Proxy(this._defaultChromaProgression, {
            set: (target: ChromaProgression, property: keyof ChromaProgression, value: any) => {
                this.propagateChange(property, target[property]);
                return true;
            },
        });
    }

    // Helper method to propagate changes to all colorSequences
    propagateChange<K extends keyof ChromaProgression>(property: K, value: ChromaProgression[K]) {
        this._defaultChromaProgression[property] = value;
        this.colorSequences.forEach((colorSequence) => {
            colorSequence.chromaProgression[property] = value;
        });
    }

    /**
     * Generates the JSON file for the color palette.
     * @param fileName The path of the file to be generated. Defaults to
     * `../out/json/egal.json`.
     * @param format The {@link ColorFormat} in which the colors should be
     * instantiated. Defaults to {@link ColorFormat.Hex}.
     *
     * @example
     * This is an example of the format of the generated JSON file:
     * ```json
     * {
     *     "0": {
     *         "0": "#000000",
     *         "50": "#e0a0a0",
     *         ...
     *     },
     *     "30": {
     *         "0": "#000000",
     *         "50": "#e0c0a0",
     *         ...
     *     },
     *     ...
     * }
     * ```
     */
    public generateJson(
        fileName: string = `../out/json/egal.json`,
        format: ColorFormat = ColorFormat.Hex
    ) {
        const json: Record<string, any> = {};
        this.colorSequences.forEach((cs) => {
            const colorSequenceJson: Record<string, string> = {};
            cs?.getColors()?.forEach((color) => {
                colorSequenceJson[color.colorSuffix] = color.instantiate(
                    format,
                    cs.viewingConditions
                );
            });
            json[cs.hue.name] = colorSequenceJson;
        });
        writeToFile(fileName, JSON.stringify(json, null, 4));
    }

    /**
     * Generates the CSS file for the color palette.
     * @param fileName The path of the file to be generated. Defaults to
     * `../out/css/egal.css`.
     * @param format The {@link ColorFormat} in which the colors should be
     * instantiated. Defaults to {@link ColorFormat.Hex}.
     *
     * @example
     * This is an example of the format of the generated CSS file:
     * ```css
     * :root {
     *     --0-0: #000000;
     *     --0-50: #e0a0a0;
     *     ...
     *     --30-0: #000000;
     *     --30-50: #e0c0a0;
     *     ...
     * }
     * ```
     */
    public generateCss(
        fileName: string = `../out/css/egal.css`,
        format: ColorFormat = ColorFormat.Hex
    ) {
        const css: string[] = [':root {'];
        this.colorSequences.forEach((cs) => {
            cs?.getColors()?.forEach((color) => {
                css.push(
                    `\t--${color.colorName}-${color.colorSuffix}: ${color.instantiate(
                        format,
                        cs.viewingConditions
                    )};`
                );
            });
        });
        css.push('}');
        writeToFile(fileName, css.join('\n'));
    }

    /**
     * Generates the ASE file for the color palette.
     * @param fileName The path of the file to be generated. Defaults to `../out/ase/egal.ase`.
     *
     * This method uses the [`ase-utils`](https://www.npmjs.com/package/ase-utils) package.
     */
    public generateAse(fileName: string = `../out/ase/egal.ase`) {
        const data: {
            version: string;
            groups: string[];
            colors: {
                name: string;
                model: string;
                color: number[];
                type: string;
            }[];
        } = {
            version: '1.0',
            groups: [],
            colors: [],
        };
        this.colorSequences.forEach((cs) => {
            cs?.getColors()?.forEach((color) => {
                data.colors.push({
                    name: `${color.colorName}-${color.colorSuffix}`,
                    model: 'RGB',
                    color: color.instantiateRgbArray(cs.viewingConditions),
                    type: 'global',
                });
            });
        });
        writeToFile(fileName, ase.encode(data));
    }
}
