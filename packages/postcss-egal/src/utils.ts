import type { EgalOptions, OutputFormat } from '@nvl/egal';
import type { Parser } from './types.js';
import { regex } from 'regex';

type Gamut = Exclude<EgalOptions<OutputFormat>['gamut'], undefined>;

/**
 * @see https://developer.mozilla.org/docs/Web/CSS/angle
 */
type CssAngleUnits = 'deg' | 'grad' | 'rad' | 'turn';

const cssAngleUnitsToDegrees: Record<CssAngleUnits, number> = {
    deg: 1,
    grad: 360 / 400,
    rad: 180 / Math.PI,
    turn: 360,
};

const gamutRegexes: Record<Gamut, RegExp> = {
    srgb: /s?rgb/iu,
    p3: /p3/iu,
    rec2020: /rec\.?2020/iu,
};

const re: RegExp = regex('im')`
    (^|\b)
    egal
    \s* \( \s*
    (?<lightness>           \g<float> | none )
    (?<lightness_percent>   %                )?
    \s+
    (?<chroma>              \g<float> | none )
    (?<chroma_percent>      %                )?
    \s+
    (?<hue>                 \g<float> | none )
    (?<hue_unit>            deg | grad | rad | turn )?
    (                                           # optionally, alpha value
        \s*? / \s*
        (?<alpha>           \g<float> | none )
        (?<alpha_percent>   %                )?
    )?
    (                                           # optionally, target gamut
        \g<sep>
        (?<gamut>
            ${gamutRegexes.srgb}
          | ${gamutRegexes.p3}
          | ${gamutRegexes.rec2020}
        )
    )?
    (                                           # optionally, json options
        \g<sep>
        (
            ''
          | '
            (?<json>
                \s* \{ \s*
                ( [^'] | \g<escaped_single_quote> )*
                \s* \} \s*
            )
            \g<nonescaped_single_quote>
        )
    )?
    \s* \)

    (?(DEFINE)
        (?<float> [\+\-]?\d+\.? | [\+\-]?\d*\.\d+ )
        (?<sep> \s*? [,\s] \s* )
        (?<escaped_single_quote> (?<! \\ ) \\ (\\\\)* ' )
        (?<nonescaped_single_quote> (?<! \\ ) (\\\\)* ' )
    )
`;

interface ParseResult {
    lightness: `${number}` | 'none';
    lightness_percent?: '%' | undefined;
    chroma: `${number}` | 'none';
    chroma_percent?: '%' | undefined;
    hue: `${number}` | 'none';
    hue_unit?: CssAngleUnits | undefined;
    alpha?: `${number}` | 'none' | undefined;
    alpha_percent?: '%' | undefined;
    gamut?: Gamut | undefined;
    json?: string | undefined;
}

export const defaultParse: Parser = (val) => {
    const res: RegExpExecArray | null = re.exec(val);
    if (res?.groups) {
        const {
            lightness,
            lightness_percent,
            chroma,
            chroma_percent,
            hue,
            hue_unit,
            alpha,
            alpha_percent,
            gamut,
            json,
        } = res.groups as unknown as ParseResult;
        let l: number = lightness === 'none' ? 0 : parseFloat(lightness);
        if (lightness_percent) {
            if (lightness === 'none') return null; // 'none%' is invalid
            l /= 100;
        }
        let c: number = chroma === 'none' ? 0 : parseFloat(chroma);
        if (chroma_percent) {
            if (chroma === 'none') return null; // 'none%' is invalid
            c /= 100;
        }
        let h: number = hue === 'none' ? 0 : parseFloat(hue);
        if (hue_unit) {
            if (hue === 'none') return null; // 'nonedeg' etc. is invalid
            h *= cssAngleUnitsToDegrees[hue_unit];
        }
        const overrideOptions = (
            json ? JSON.parse(json) : {}
        ) as EgalOptions<OutputFormat>;
        if (alpha) {
            let a: number = alpha === 'none' ? 0 : parseFloat(alpha);
            if (alpha_percent) {
                if (alpha === 'none') return null; // 'none%' is invalid
                a /= 100;
            }
            overrideOptions.opacity = a;
        }
        if (gamut) {
            const g = Object.keys(gamutRegexes).find((key) =>
                gamutRegexes[key as Gamut].test(gamut),
            ) as Gamut | undefined;
            if (g) overrideOptions.gamut = g;
        }
        return { l, c, h, overrideOptions };
    }
    return null;
};
