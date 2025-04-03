<br>
<div align="center">
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nvlang/egal/main/res/logotype-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/nvlang/egal/main/res/logotype-light.svg">
    <img alt="Logotype" src="https://raw.githubusercontent.com/nvlang/egal/main/res/logotype-light.svg" width="70%">
</picture>
<br>
<br>
<div>

[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=a3acb7&label=&labelColor=21262d&color=21262d&filter=@nvl/postcss-egal@*">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=24292f&label=&labelColor=eaeef2&color=eaeef2&filter=@nvl/postcss-egal@*">
    <img alt="GitHub version tag" src="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=24292f&label=&labelColor=eaeef2&color=eaeef2&filter=@nvl/postcss-egal@*">
</picture>
](https://github.com/nvlang/egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/@nvl/postcss--egal-_?style=flat-square&logo=npm&logoColor=a3acb7&labelColor=21262d&color=21262d&logoSize=auto)">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/@nvl/postcss--egal-_?style=flat-square&logo=npm&logoColor=24292f&labelColor=eaeef2&color=eaeef2&logoSize=auto)">
    <img alt="NPM package name" src="https://img.shields.io/badge/@nvl/postcss--egal-_?style=flat-square&logo=npm&logoColor=24292f&labelColor=eaeef2&color=eaeef2&logoSize=auto)">
</picture>
](https://npmjs.com/@nvl/postcss-egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/@nvl/postcss--egal-_?style=flat-square&labelColor=21262d&color=21262d&logo=jsr&logoColor=a3acb7&logoSize=auto">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/@nvl/postcss--egal-_?style=flat-square&labelColor=eaeef2&color=eaeef2&logo=jsr&logoColor=24292f&logoSize=auto">
    <img alt="JSR package name" src="https://img.shields.io/badge/@nvl/postcss--egal-_?style=flat-square&labelColor=eaeef2&color=eaeef2&logo=jsr&logoColor=24292f&logoSize=auto">
</picture>
](https://jsr.io/@nvl/postcss-egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://jsr.io/badges/@nvl/postcss-egal/score?style=flat-square&labelColor=21262d&color=21262d&logoColor=a3acb7">
    <source media="(prefers-color-scheme: light)" srcset="https://jsr.io/badges/@nvl/postcss-egal/score?style=flat-square&labelColor=eaeef2&color=eaeef2&logoColor=24292f">
    <img alt="JSR score" src="https://jsr.io/badges/@nvl/postcss-egal/score?style=flat-square&labelColor=eaeef2&color=eaeef2&logoColor=24292f">
</picture>
](https://jsr.io/@nvl/postcss-egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/codecov/c/github/nvlang/egal?flag=postcss-egal&style=flat-square&logo=codecov&label=&logoColor=a3acb7&labelColor=21262d&color=21262d">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/codecov/c/github/nvlang/egal?flag=postcss-egal&style=flat-square&logo=codecov&label=&logoColor=24292f&labelColor=eaeef2&color=eaeef2">
    <img alt="CodeCov coverage" src="https://img.shields.io/codecov/c/github/nvlang/egal?flag=postcss-egal&style=flat-square&logo=codecov&label=&logoColor=24292f&labelColor=eaeef2&color=eaeef2">
</picture>
](https://codecov.io/gh/nvlang/egal)

</div>
</div>

## Getting Started

**Note**: This package is [ESM-only].

### Installation

```sh
pnpm add -D @nvl/postcss-egal     # If using PNPM
bun  add -D @nvl/postcss-egal     # If using Bun
npm  add -D @nvl/postcss-egal     # If using NPM
yarn add -D @nvl/postcss-egal     # If using Yarn
deno add -D jsr:@nvl/postcss-egal # If using Deno
```

### Usage

In `postcss.config.js`, add `@nvl/postcss-egal` to the plugins list:

```js
export default {
    plugins: {
        '@nvl/postcss-egal': {
            // Options...
        },
    }
}
```

### Syntax

<details>
<summary><b>EBNF syntax specification</b></summary>
<p></p>

```ebnf
egal ::=
    "egal("                                     ,
        lightness , ' ' , chroma , ' ' , hue    ,
        [ ' / ' alpha ]                         ,
        [ ( ',' | ' ' ) , gamut ]               ,
        [ ( ',' | ' ' ) , "'" , options , "'" ] ,
    ')'                                         ;

lightness   ::= number | 'none' | percentage    ;
chroma      ::= number | 'none' | percentage    ;
hue         ::= number | 'none' | angle         ;
alpha       ::= number | 'none'                 ;
gamut       ::= 'srgb' | 'p3' | 'rec2020'       ;
percentage  ::= number , ( '%' )                ;
angle       ::= number , angle_unit             ;
angle_unit  ::= 'deg' | 'rad' | 'grad' | 'turn' ;
options     ::= '{' , json_contents , '}'       ; (* JSON object *)
```

</details>

You can specify egal colors much like you would specify `oklch` colors in CSS,
the main difference being that you can be more generous with the chroma value;
`oklch` chroma generally ranges from 0 to 0.4 or so, while `egal` chroma can
easily range from 0 to 4 or more.

-   You can specify the **lightness** and **chroma** as percentages or plain numbers.
-   You can specify the **hue** as a unitless number, in which case it will be
    interpreted as degrees, or as an angle with a unit that CSS understands
    (`deg`, `grad`, `rad`, or `turn`, where
    `360 deg = 400 grad = 2π rad = 1 turn`).
-   You can optionally specify the **opacity** with the `/ <alpha>` syntax, but
    not as a fourth argument.
-   You can optionally specify the target **gamut** by passing `srgb`, `p3`, or
    `rec2020` as a 4th argument. The default target gamut is to `srgb`.
-   You can optionally specify additional options by passing a JSON object
    surrounded by single quotes as the last argument (4th or 5th argument). Note
    that if you specify a target gamut specified in the JSON object and a
    different gamut as a 4th argument to the `egal` function, the gamut from the
    4th argument will be used.

For example:

```css
:root {
    --color-1: egal(50% 0 0);
    --color-2: egal(0.3 2 40 / 0.5, p3);
    --color-3: egal(0.25 100% 100deg, srgb, '{"hues":[20,100,300]}');
    --color-4: egal(0.25 100% 100deg, '{"space":"hct"}');

    /* NB: In the example below, the target gamut will be 'p3'. */
    --color-5: egal(0.25 100% 100deg, p3, '{"gamut":"rec2020"}');
}
```

[ESM-only]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
