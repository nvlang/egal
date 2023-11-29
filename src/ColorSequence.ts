// External dependencies
import { Hct, ViewingConditions } from '@material/material-color-utilities';

// Internal dependencies
import { HctConstants, findChromaFloorProgression } from './utilities';
import { ColorPalette } from './ColorPalette';
import { Color } from './Color';

/**
 * A helper class representing a map from tones to chroma values. To be used
 * internally by {@link ColorSequence}.
 */
export class ChromaProgression {
    public cap: ChromaCap = new ChromaCap(this);
    private _type!: 'singleTarget' | 'progression' | 'max' | 'min';
    private _progression: Map<number, number> = new Map<number, number>();
    private _target?: number;
    public tones: number[];

    public hues: Hue[];
    public viewingConditions: ViewingConditions;

    readonly parentColorSequence?: ColorSequence;

    public copy(): ChromaProgression {
        const copy = new ChromaProgression(
            this.parentColorSequence || {
                hues: [...this.hues],
                tones: [...this.tones],
                defaultViewingConditions: this.viewingConditions,
            }
        );
        copy._progression = new Map(this._progression);
        copy.cap = this.cap;
        copy.type = this._type;
        copy._target = this._target;
        return copy;
    }

    /**
     * The parent color sequence.
     */
    constructor(
        parentColorSequence:
            | ColorSequence
            | {
                  tones: number[];
                  hues: Hue[];
                  defaultViewingConditions: ViewingConditions;
              }
    ) {
        if (parentColorSequence instanceof ColorSequence) {
            this.parentColorSequence = parentColorSequence;
            this.hues = parentColorSequence.parentColorPalette.hues;
            this.viewingConditions = parentColorSequence.viewingConditions;
        } else {
            this.hues = parentColorSequence.hues;
            this.viewingConditions = parentColorSequence.defaultViewingConditions;
        }
        this.tones = parentColorSequence.tones;
        this.type = 'max';
    }

    /**
     * Sets the chroma progression type. Clears the chroma progression
     * progression if necessary.
     * @param type The desired progression type.
     * - `'singleTarget'` indicates that a single value for chroma should be
     *   targeted for all tones. This value must be set separately via
     *   {@link ChromaProgression.target}.
     * - `'progression'` indicates that a "hardcoded" progression of chroma
     *   values should be used. This progression must be set separately via
     *   {@link ChromaProgression.progression}.
     * - `'max'` indicates that the chroma should be set to the maximum value
     *   possible (subject to {@link ChromaCap}, if defined) for all tones. This
     *   is the initial type.
     * - `'min'` indicates that the chroma should be set to the minimum value
     *   possible for all tones. The output will be grayscale.
     */
    set type(type: 'singleTarget' | 'progression' | 'max' | 'min') {
        if (type === 'max' || type === 'min') {
            /**
             * Temporarily set the type to 'singleTarget' to trick the
             * this.target setter into accepting our "manually set" target
             * value.
             */
            this._type = 'singleTarget';
            this.target = type === 'max' ? HctConstants.chroma.max : HctConstants.chroma.min;
        }
        if (type === 'progression') {
            this._target = undefined;
        }
        this._type = type;
    }

    /**
     * The chroma progression type.
     */
    get type() {
        return this._type;
    }

    /**
     * Manually set the chroma target. Only valid if `ChromaProgression.type ===
     * 'singleTarget'`.
     *
     * @remarks
     * The target will be overwritten if {@link ChromaProgression.type} is
     * changed.
     *
     * @remarks
     * The target is still subject to {@link ChromaCap}, if one is defined.
     */
    set target(target: number | undefined) {
        if (this._type === 'singleTarget') {
            this._target = target;

            if (target !== undefined) {
                this.tones.forEach((tone) => {
                    this._progression.set(tone, target);
                });
            }
        } else {
            throw new Error(
                "The `target` property can only be manually set when `ChromaProgression.type` is 'singleTarget'."
            );
        }
    }

    /**
     * The chroma target. Only defined when `ChromaProgression.type ===
     * 'singleTarget'`.
     */
    get target() {
        return this._target;
    }

    /**
     * Manually set the chroma progression. Only valid if
     * `ChromaProgression.type === 'progression'`.
     *
     * @remarks
     * The progression will be overwritten if {@link ChromaProgression.type} is
     * changed.
     *
     * @remarks
     * The progression is still subject to {@link ChromaCap}, if one is defined.
     */
    set progression(progression: Map<number, number>) {
        if (this._type === 'progression') {
            this._progression = progression;
        } else {
            throw new Error(
                "The `progression` property can only be set manually when `ChromaProgression.type` is 'progression'."
            );
        }
    }

    /**
     * The chroma progression. The getter ensures that the {@link ChromaCap} is
     * respected.
     */
    get progression(): Map<number, number> | undefined {
        if (this._progression) {
            let rv = new Map<number, number>();
            for (let [key, value] of this._progression.entries()) {
                if (
                    this.cap &&
                    this.cap.progression &&
                    this.cap.progression.has(key) &&
                    value > this.cap.progression.get(key)!
                ) {
                    rv.set(key, this.cap.progression.get(key)!);
                } else {
                    rv.set(key, value);
                }
            }
            return rv;
        }
        return this._progression;
    }
}

/**
 * A helper class representing a chroma cap or progression thereof. To be used
 * internally by {@link ChromaProgression}.
 */
class ChromaCap {
    /**
     * The chroma cap type.
     * - `'fixed'` indicates that the chroma cap should be fixed to a single
     *   value. {@link ChromaCap.val} must be set separately.
     * - `'progression'` indicates that the chroma cap should be a progression
     *   of values. {@link ChromaCap.progression} must be set separately.
     * - `MinMaxChroma` indicates that the chroma cap should be calculated as
     *   the min-max chroma possible for each tone, subject to the specified
     *   viewing conditions, hues, and tones.
     */
    private _type!: 'fixed' | 'progression' | 'minmax';
    private _val?: number;
    private _progression!: Map<number, number>;

    /**
     * The parent chroma sequence.
     */
    public parentChromaProgression: ChromaProgression;

    constructor(parentChromaProgression: ChromaProgression) {
        this.parentChromaProgression = parentChromaProgression;
        this.type = 'minmax';
    }

    /**
     * Sets the chroma cap type. Clears the chroma cap value if necessary.
     */
    set type(type: 'fixed' | 'progression' | 'minmax') {
        if (type === 'minmax') {
            this._progression = findChromaFloorProgression(
                this.parentChromaProgression.viewingConditions,
                this.parentChromaProgression.hues,
                this.parentChromaProgression.tones
            );
        }
        if (type !== 'fixed') {
            this._val = undefined;
        }
        this._type = type;
    }

    get type() {
        return this._type;
    }

    /**
     * Manually set the chroma cap value. Only valid if `ChromaCap.type ===
     * 'fixed'`.
     *
     * @remarks
     * The value will be overwritten if {@link ChromaCap.type} is changed.
     */
    set val(val: number | undefined) {
        if (this._type !== 'fixed') {
            throw new Error(
                "The `val` property can only be manually set when `ChromaCap.type` is 'fixed'."
            );
        }
        this._val = val;
        if (val) {
            const tones = this.parentChromaProgression.tones;
            const progression = new Map<number, number>();
            tones.forEach((tone) => {
                progression.set(tone, val);
            });
            this._progression = progression;
        }
    }

    /**
     * The chroma cap value. Only defined when `ChromaCap.type === 'fixed'`.
     */
    get val() {
        if (this._type !== 'fixed') {
            throw new Error(`\`ChromaCap.val\` is only defined when \`ChromaCap.type == 'fixed'\``);
        }
        return this._val;
    }

    /**
     * Manually set the chroma cap progression. Only valid if `ChromaCap.type
     * === 'progression'`.
     *
     * @remarks
     * The progression will be overwritten if {@link ChromaCap.type} is changed.
     */
    set progression(progression: Map<number, number>) {
        if (this._type !== 'progression') {
            throw new Error(
                "The `progression` property can only be manually set when `ChromaCap.type` is 'progression'."
            );
        }
        this._progression = progression;
    }

    /**
     * The chroma cap progression.
     */
    get progression(): Map<number, number> {
        return this._progression;
    }
}

/**
 * A helper class basically representing the parameters to be used when calling
 * {@link findChromaFloorProgression}. To be used internally by
 * {@link ChromaCap}.
 */
export class _MinMaxChroma {
    /**
     * The hues to be used when calculating the min-max chroma cap progression.
     * Defaults to the parent chroma progression's hues.
     */
    public hues: Hue[];

    /**
     * The tones to be used when calculating the min-max chroma cap progression.
     * Defaults to the parent chroma progression's tones.
     */
    public tones: number[];

    /**
     * The viewing conditions to be used when calculating the min-max chroma cap
     * progression. Defaults to the parent chroma progression's viewing
     * conditions.
     */
    public viewingConditions: ViewingConditions;

    /**
     * The parent chroma progression.
     */
    public parentChromaProgression: ChromaProgression;

    constructor(parentChromaProgression: ChromaProgression) {
        this.parentChromaProgression = parentChromaProgression;

        /**
         * Inherit the parent chroma progression's hues, tones, and viewing
         * conditions.
         */
        this.hues = parentChromaProgression.hues;
        this.tones = parentChromaProgression.tones;
        this.viewingConditions = parentChromaProgression.viewingConditions;
    }
}

/**
 * A class representing a single hue.
 */
export class Hue {
    /**
     * The hue value, as a degree (0–360).
     */
    public deg: number;

    /**
     * The name of the hue. Defaults to the hue value.
     */
    public name: string;

    constructor(hue: number, name?: string) {
        this.deg = hue;
        this.name = name || `${hue}`;
    }
}

/**
 * A class representing a color sequence with fixed hue.
 */
export class ColorSequence {
    /**
     * The tones in this color sequence.
     */
    public tones: number[];

    /**
     * The number of tones in this color sequence.
     */
    private length: number;

    /**
     * The hue of this color sequence.
     */
    public hue: Hue;

    /**
     * The parent color palette.
     */
    readonly parentColorPalette: ColorPalette;

    /**
     * The chroma progression to be used by this color sequence. Defaults to the
     * parent color palette's default chroma progression.
     */
    public chromaProgression: ChromaProgression;

    /**
     * The viewing conditions to be used by this color sequence. Defaults to the
     * parent color palette's default viewing conditions.
     */
    public viewingConditions: ViewingConditions;

    constructor(
        parentColorPalette: ColorPalette,
        hue: Hue,
        tones: number[] = parentColorPalette.tones
    ) {
        this.parentColorPalette = parentColorPalette;
        this.hue = hue;
        this.tones = tones;
        this.length = this.tones.length;

        /**
         * Inherit the parent color palette's default chroma progression and
         * viewing conditions.
         *
         * Careful! We don't want to pass by reference.
         */
        this.chromaProgression = parentColorPalette.defaultChromaProgression.copy();
        this.viewingConditions = parentColorPalette.defaultViewingConditions;
    }

    /**
     * Get the colors in this color sequence as an array of {@link Color}
     * objects.
     */
    public getColors(): Color[] {
        const colors: Color[] = [];
        for (const tone of this.tones) {
            const colorNameRoot = this.hue.name;
            const colorNameSuffix = `${tone * 10}`;
            const hue = this.hue.deg;
            const chroma = this.chromaProgression.progression?.get(tone) || 0;
            const colorHct: Hct = Hct.from(hue, chroma, tone);
            colors.push(new Color(colorNameRoot, colorHct, colorNameSuffix));
        }
        return colors;
    }
}
