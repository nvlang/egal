import type { Parser } from './types.js';

export const defaultParse: Parser = (val) => {
    const res =
        /egal\s*\(\s*(\d+\.?\d*)\s*%?\s+(\d+\.?\d*)\s*%?\s+(\d+\.?\d*)\s*\)/u.exec(
            val,
        );
    if (res?.[1] && res[2] && res[3]) {
        const l: number = parseFloat(res[1]);
        const c: number = parseFloat(res[2]);
        const h: number = parseFloat(res[3]);
        return { l, c, h };
    }
    return null;
};
