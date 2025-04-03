import type { EgalOptions, OutputFormat } from '@nvl/egal';
import type { Parser } from './types.js';
import { regex } from 'regex';

type Gamut = Exclude<EgalOptions<OutputFormat>['gamut'], undefined>;

const gamutRegexes: Record<Gamut, RegExp> = {
    srgb: /s?rgb/iu,
    p3: /p3/iu,
    rec2020: /rec\.?2020/iu,
};

const re: RegExp = regex('im')`
    (^|\b)
    egal
    \s* \( \s*
    (?<lightness>           \g<float>   ) \s*
    (?<lightness_percent>   %           )?
    \g<sep>
    (?<chroma>              \g<float>   ) \s*
    (?<chroma_percent>      %           )?
    \g<sep>
    (?<hue>                 \g<float> | none )
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
    lightness: `${number}`;
    lightness_percent?: '%' | undefined;
    chroma: `${number}`;
    chroma_percent?: '%' | undefined;
    hue: `${number}` | 'none';
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
            gamut,
            json,
        } = res.groups as unknown as ParseResult;
        let l: number = parseFloat(lightness);
        if (lightness_percent) l /= 100;
        let c: number = parseFloat(chroma);
        if (chroma_percent) c /= 100;
        const h: number = hue === 'none' ? 0 : parseFloat(hue);
        const overrideOptions = (
            json ? JSON.parse(json) : {}
        ) as EgalOptions<OutputFormat>;
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
