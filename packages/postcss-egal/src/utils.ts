import { egal, type EgalOptions, type OutputFormat } from '@nvl/egal';
import type { PluginOptions, Transformer } from './types.js';
import { regex } from 'regex';
import MagicString from 'magic-string';
import type { Declaration, Helpers } from 'postcss';

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

const falseMatchRegex: RegExp = regex('gim')`
    (?<![^\s:;,\(])
    egal
    \(
`;

const realMatchRegex: RegExp = regex('gim')`
    (?<![^\s:;,\(])
    egal
    \s* \( \s*
    (?<lightness>           \g<float> | none )
    (?<lightness_percent>   (?<!none) %      )?
    \s+
    (?<chroma>              \g<float> | none )
    (?<chroma_percent>      (?<!none) %      )?
    \s+
    (?<hue>                 \g<float> | none )
    (?<hue_unit>            (?<!none) ( deg | grad | rad | turn ) )?
    (                                           # optionally, alpha value
        \s*? / \s*
        (?<alpha>           \g<float> | none )
        (?<alpha_percent>   (?<!none) %       )?
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

interface RegexGroups {
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

export const transformer: Transformer = (
    decl,
    { result },
    otherPluginOptions,
) => {
    let value = decl.value;
    const s = new MagicString(value);
    let realMatch: RegExpExecArray | null;
    let falseMatch: RegExpExecArray | null;

    // First pass, where stuff is actually modified
    while ((realMatch = realMatchRegex.exec(value))) {
        processRealMatch({ magicString: s, realMatch, otherPluginOptions });
    }

    value = s.toString();
    decl.value = value;

    while ((falseMatch = falseMatchRegex.exec(value))) {
        processFalseMatch({
            value,
            falseMatch,
            otherPluginOptions,
            decl,
            result,
        });
    }
};

function processFalseMatch({
    value,
    falseMatch,
    decl,
    result,
}: {
    value: string;
    falseMatch: RegExpExecArray;
    otherPluginOptions: PluginOptions;
    decl: Declaration;
    result: Helpers['result'];
}) {
    let index = falseMatch.index;
    let endIndex =
        indexOfClosingParenthesis(value, value.indexOf('(', index)) + 1;

    // I'm not sure how `decl.raws.between` would ever be `undefined`, so I'm
    // choosing to exclude it from the test coverage report.
    /* v8 ignore next 1 */
    const shift = decl.prop.length + (decl.raws.between?.length ?? 0);

    const problemString = value.slice(index, endIndex);
    for (const [ppr, message] of potentialProblems) {
        const match: RegExpExecArray | null = ppr.exec(problemString);
        if (match) {
            index += match.index;
            endIndex = index + match[0].length;

            index += shift;
            endIndex += shift;

            decl.warn(result, message, { index, endIndex });
            return;
        }
    }

    index += shift;
    endIndex += shift;

    decl.warn(result, "Couldn't parse egal color", { index, endIndex });
}

const potentialProblems: [RegExp, string][] = [
    [/none\s*%/u, 'none% is not a valid value'],
    [
        /(\d+\.?\d*|\d*\.\d+)\s+%/u,
        'Whitespace between number and % is forbidden',
    ],
    [
        regex('i')`['"](
            ${gamutRegexes.srgb}|${gamutRegexes.p3}|${gamutRegexes.rec2020}
        )['"]`,
        "Don't use quotes around gamut",
    ],
    [regex('i')`"\{.*\}"`, 'Use single quotes around JSON object'],
];

export function indexOfClosingParenthesis(
    str: string,
    indexOfOpeningParenthesis: number,
): number {
    let depth = 0;
    for (let i = indexOfOpeningParenthesis + 1; i < str.length; i++) {
        if (str[i] === '(') {
            depth++;
        } else if (str[i] === ')') {
            if (depth === 0) {
                return i;
            }
            depth--;
        }
    }
    return -1; // No closing parenthesis found
}

function processRealMatch({
    magicString,
    realMatch,
    otherPluginOptions,
}: {
    magicString: MagicString;
    realMatch: RegExpExecArray;
    otherPluginOptions: PluginOptions;
}) {
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
    } = realMatch.groups as unknown as RegexGroups;

    let l: number = lightness === 'none' ? 0 : parseFloat(lightness);
    if (lightness_percent) l /= 100;

    let c: number = chroma === 'none' ? 0 : parseFloat(chroma);
    if (chroma_percent) c /= 100;

    let h: number = hue === 'none' ? 0 : parseFloat(hue);
    if (hue_unit) h *= cssAngleUnitsToDegrees[hue_unit];

    let overrideOptions: EgalOptions<OutputFormat> = {};

    if (json) {
        try {
            overrideOptions = JSON.parse(json) as EgalOptions<OutputFormat>;
        } catch {
            return;
        }
    }

    if (alpha) {
        let a: number = alpha === 'none' ? 0 : parseFloat(alpha);
        if (alpha_percent) a /= 100;
        overrideOptions.opacity = a;
    }

    if (gamut) {
        const g = Object.keys(gamutRegexes).find((key) =>
            gamutRegexes[key as Gamut].test(gamut),
        ) as Gamut | undefined;
        if (g) overrideOptions.gamut = g;
    }

    magicString.overwrite(
        realMatch.index,
        realMatch.index + realMatch[0].length,
        egal(l, c, h, {
            ...otherPluginOptions,
            ...overrideOptions,
        }),
    );
}
