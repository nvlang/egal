// External dependencies
import { Hct, ViewingConditions, hexFromArgb } from '@material/material-color-utilities';
import path from 'path';
import * as fs from 'fs';

// Internal dependencies
import { Hue } from './ColorSequence';

/**
 * Globals set by HCT — do not modify unless changes to the HCT color system are made.
 */
export const HctConstants = {
    hue: {
        min: 0,
        max: 360,
    },
    tone: {
        min: 0,
        max: 100,
    },
    chroma: {
        min: 0,
        max: 999,
    },
    lstar: {
        min: 0,
        max: 100,
    },
};

const defaultHueStep = 1;
const defaultToneStep = 2.5;

/**
 * Given a specific hue and tone, returns the maximum chroma that a HCT color
 * with those hue and tone values can have in the specified viewing conditions.
 *
 * @param hue The hue of the color, in degrees. Must be between 0 and 360.
 * @param tone The tone of the color. Must be between 0 and 100.
 * @param vc The viewing conditions to use when calculating the maximum chroma.
 * Defaults to HCT's default viewing conditions if unspecified.
 */
export function findMaxChromaForHueAndTone(
    hue: number,
    tone: number,
    vc?: ViewingConditions
): number {
    let hct = Hct.from(hue, HctConstants.chroma.max, tone);
    return vc ? hct.inViewingConditions(vc).chroma : hct.chroma;
}

/**
 * Given a specific tone, returns the maximum chroma that *all* HCT colors with
 * that tone can have in the specified viewing conditions and across the
 * specified hues. The returned chroma is the minimum of the maximum chromas for
 * each hue-tone pair.
 *
 * @param tone The tone for which to find the "chroma floor". Must be between 0
 * and 100.
 * @param vc The viewing conditions to use when calculating the "chroma floor".
 * Defaults to HCT's default viewing conditions if unspecified.
 * @param hues The hues for which to find the "chroma floor". Can be a number,
 * in which case an array ranging from 0 (inclusive) to 360 (exclusive) in steps
 * of `hues` will be used, or an array of numbers, in which case the array will
 * be used as-is.
 *
 * @example
 * ```typescript
 * const vc10 = ViewingConditions.make(undefined, undefined, 10);
 * console.log(findChromaFloorForTone(10)); // 5.077887072036628
 * ```
 * This means that all of these evaluate to `true` (and that any number above
 * 5.077887072036628 would not satisfy this property):
 * ```typescript
 * Hct.from(0, 5.077, 10).inViewingConditions(vc10).chroma === 5.077;
 * Hct.from(10, 5.077, 10).inViewingConditions(vc10).chroma === 5.077;
 * Hct.from(20, 5.077, 10).inViewingConditions(vc10).chroma === 5.077;
 * // ...
 * Hct.from(350, 5.077, 10).inViewingConditions(vc10).chroma === 5.077;
 * ```
 */
export function findChromaFloorForTone(
    tone: number,
    vc?: ViewingConditions,
    hues?: number[]
): number {
    let huesArray: number[];
    if (!hues) {
        // If no hues are specified, we use the default hues (0, 1, ..., 359).
        huesArray = [];
        for (let hue = HctConstants.hue.min; hue < HctConstants.hue.max; hue += defaultHueStep) {
            huesArray.push(hue);
        }
    } else {
        huesArray = hues;
    }
    let chromaFloor = HctConstants.chroma.max;
    huesArray.forEach((hue) => {
        const chroma = findMaxChromaForHueAndTone(hue, tone, vc);
        if (chroma < chromaFloor) {
            chromaFloor = chroma;
        }
    });
    return chromaFloor;
}

/**
 * Returns a map with tones as keys and "chroma floors" as values.
 *
 * The tones for which to find the "chroma floors" can be specified in two ways:
 * - If `tones` is an array, it will be interpreted as an array of tones to use.
 * - If `tones` is a number, it will be interpreted as the step value to use in
 *   generating an array of tones from 0 (inclusive) to 100 (inclusive).
 *
 * The hues used to calculate the chroma floors can also be specified, in the
 * same way as described in {@link findChromaFloorForTone}.
 *
 * @param vc The viewing conditions to use when calculating the "chroma floors".
 * Defaults to HCT's default viewing conditions if unspecified. It's also
 * possible to provide a map, with tones (i.e., numbers) as keys and
 * {@link ViewingConditions} objects as values.
 * @param hues The hues with which to find the "chroma floors" (if an array is
 * provided), or the hue step value to use. Defaults to `[0,10,...,350]`.
 * @param tones The tones for which to find the "chroma floors" (if an array is
 * provided), or the tone step value to use. Defaults to 2.5.
 */
export function findChromaFloorProgression(
    vc?: ViewingConditions | Map<number, ViewingConditions>,
    hues?: number | number[] | Hue[],
    tones?: number | number[]
): Map<number, number> {
    // Declare the arrays used for the internal calculations.
    let tonesArray: number[] = [];
    let huesArray: number[] = [];
    let vcMap: Map<number, ViewingConditions> = new Map();
    // Initialize tones array
    if (tones && Array.isArray(tones)) {
        // If the `tones` input is an array, we use it as-is.
        tonesArray = tones;
    } else {
        // If the `tones` input is a number, we use it as the step value.
        tones = tones || defaultToneStep;
        for (let tone = HctConstants.tone.min; tone <= HctConstants.tone.max; tone += tones) {
            tonesArray.push(tone);
        }
    }
    // Initialize hues array
    if (hues && Array.isArray(hues)) {
        // If the `hues` input is an array, we use it as-is.
        if (hues[0] instanceof Hue) {
            // If the `hues` input is an array of `Hue` objects, we extract the
            // hue values.
            huesArray = (hues as Hue[]).map((h) => h.deg);
        } else {
            huesArray = hues as number[];
        }
    } else {
        // If the `hues` input is a number, we use it as the step value.
        hues = hues || defaultHueStep;
        for (let hue = HctConstants.hue.min; hue < HctConstants.hue.max; hue += hues) {
            huesArray.push(hue);
        }
    }
    // Initialize vc map
    if (vc && vc instanceof Map) {
        // If the `vc` input is a map, we use it as-is.
        vcMap = vc;
    } else {
        // If the `vc` input is a single viewing conditions object, we use it as
        // the only element of the array.
        tonesArray.forEach((tone) => {
            vcMap.set(tone, vc || ViewingConditions.DEFAULT);
        });
    }
    // Calculate the chroma floors.
    const chromaFloorProgression: Map<number, number> = new Map();
    tonesArray.forEach((tone) => {
        chromaFloorProgression.set(tone, findChromaFloorForTone(tone, vcMap.get(tone), huesArray));
    });
    return chromaFloorProgression;
}

/**
 * Writes a string to a file, creating intermediate directories and/or the file
 * itself if necessary.
 *
 * @param filePath - File path, e.g., "out/json/output.json"
 * @param data - The string to write to the file
 */
export function writeToFile(filePath: string, data: string): void {
    const directoryPath = path.dirname(filePath);

    // Create directories if they don't exist
    directoryPath.split(path.sep).reduce((prevPath, folder) => {
        const currentPath = path.join(prevPath, folder, path.sep);
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }
        return currentPath;
    }, '');

    // Write data to file
    fs.writeFileSync(filePath, data);
}

export function generatePlotData(granularity: number = 1) {
    const plotData: Array<[number, number, number, string]> = [];
    for (let h = 0; h < 360; h += granularity) {
        for (let t = 0; t <= 100; t += granularity) {
            const c = findMaxChromaForHueAndTone(h, t);
            plotData.push([
                h,
                t,
                c,
                hexFromArgb(
                    Hct.from(h, c, t).inViewingConditions(ViewingConditions.DEFAULT).toInt()
                ),
            ]);
        }
    }
    return plotData;
}

export function plotDataToCSV(
    plotData: Array<[number, number, number, string]>,
    fileName: string = 'data.csv'
) {
    writeToFile(fileName, plotData.map((point) => point.join(',')).join('\n'));
}

export function generateHuesByStep(step: number, start: number = HctConstants.hue.min): Hue[] {
    const hues = [];
    for (let hue = start; hue < HctConstants.hue.max; hue += step) {
        hues.push(new Hue(hue));
    }
    return hues;
}

export function generateHuesByNumber(numberOfHues: number) {
    if (numberOfHues < 0) {
        throw new Error('numberOfHues must be nonnegative');
    }
    if (numberOfHues === 0) {
        return [];
    }
    const hueStep = HctConstants.hue.max / numberOfHues;
    return generateHuesByStep(hueStep);
}

export function generateTonesByStep(step: number, start: number = HctConstants.hue.min): number[] {
    const tones = [];
    for (let tone = start; tone <= HctConstants.tone.max; tone += step) {
        tones.push(tone);
    }
    return tones;
}

export function generateTonesByNumber(numberOfTones: number) {
    if (numberOfTones < 0) {
        throw new Error('numberOfTones must be nonnegative');
    }
    if (numberOfTones === 0) {
        return [];
    }
    const toneStep = HctConstants.tone.max / numberOfTones;
    return generateTonesByStep(toneStep);
}

/**
 * To sanitize a tone, we simply ensure that it is within the permissible range
 * (0–100).
 *
 * @param tones Array of tones to be sanitized.
 * @returns A new array of sanitized tones.
 */
export function sanitizeTones(tones: number[]): number[] {
    const tonesSanitized = [];
    for (const tone of tones) {
        tonesSanitized.push(sanitizeTone(tone));
    }
    return tonesSanitized;
}

/**
 * Ensure that the inputted tone is within the permissible range (0–100).
 *
 * @param tone Tone to be sanitized.
 * @returns The sanitized tone.
 */
export function sanitizeTone(tone: number): number {
    if (tone < HctConstants.tone.min) {
        console.warn(
            `Tone ${tone} is less than the smallest permissible tone of ${HctConstants.tone.min} -- using ${HctConstants.tone.min} instead.`
        );
        return HctConstants.tone.min;
    }
    if (tone > HctConstants.tone.max) {
        console.warn(
            `Tone ${tone} is greater than the maximum permissible tone of ${HctConstants.tone.max} -- using ${HctConstants.tone.max} instead.`
        );
        return HctConstants.tone.max;
    }
    return tone;
}

/**
 * Ensure that the inputted tone is within the permissible range (0–100).
 *
 * @param tone Tone to be sanitized.
 * @returns The sanitized tone.
 */
export function sanitizeHue(hue: number): number {
    if (hue < HctConstants.hue.min) {
        console.warn(
            `hue ${hue} is less than the smallest permissible hue of ${HctConstants.hue.min} -- using ${HctConstants.hue.min} instead.`
        );
        return HctConstants.hue.min;
    }
    if (hue > HctConstants.hue.max) {
        console.warn(
            `hue ${hue} is greater than the maximum permissible hue of ${HctConstants.hue.max} -- using ${HctConstants.hue.max} instead.`
        );
        return HctConstants.hue.max;
    }
    return hue;
}
