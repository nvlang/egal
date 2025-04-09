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
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=a3acb7&label=&labelColor=21262d&color=21262d&filter=@nvl/lightningcss-plugin-egal@*">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=24292f&label=&labelColor=eaeef2&color=eaeef2&filter=@nvl/lightningcss-plugin-egal@*">
    <img alt="GitHub version tag" src="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=24292f&label=&labelColor=eaeef2&color=eaeef2&filter=@nvl/lightningcss-plugin-egal@*">
</picture>
](https://github.com/nvlang/egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/@nvl/lightningcss-plugin-egal-_?style=flat-square&logo=npm&logoColor=a3acb7&labelColor=21262d&color=21262d&logoSize=auto)">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/@nvl/lightningcss-plugin-egal-_?style=flat-square&logo=npm&logoColor=24292f&labelColor=eaeef2&color=eaeef2&logoSize=auto)">
    <img alt="NPM package name" src="https://img.shields.io/badge/@nvl/lightningcss-plugin-egal-_?style=flat-square&logo=npm&logoColor=24292f&labelColor=eaeef2&color=eaeef2&logoSize=auto)">
</picture>
](https://npmjs.com/@nvl/lightningcss-plugin-egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/@nvl/lightningcss-plugin-egal-_?style=flat-square&labelColor=21262d&color=21262d&logo=jsr&logoColor=a3acb7&logoSize=auto">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/@nvl/lightningcss-plugin-egal-_?style=flat-square&labelColor=eaeef2&color=eaeef2&logo=jsr&logoColor=24292f&logoSize=auto">
    <img alt="JSR package name" src="https://img.shields.io/badge/@nvl/lightningcss-plugin-egal-_?style=flat-square&labelColor=eaeef2&color=eaeef2&logo=jsr&logoColor=24292f&logoSize=auto">
</picture>
](https://jsr.io/@nvl/lightningcss-plugin-egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://jsr.io/badges/@nvl/lightningcss-plugin-egal/score?style=flat-square&labelColor=21262d&color=21262d&logoColor=a3acb7">
    <source media="(prefers-color-scheme: light)" srcset="https://jsr.io/badges/@nvl/lightningcss-plugin-egal/score?style=flat-square&labelColor=eaeef2&color=eaeef2&logoColor=24292f">
    <img alt="JSR score" src="https://jsr.io/badges/@nvl/lightningcss-plugin-egal/score?style=flat-square&labelColor=eaeef2&color=eaeef2&logoColor=24292f">
</picture>
](https://jsr.io/@nvl/lightningcss-plugin-egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/codecov/c/github/nvlang/egal?flag=lightningcss-plugin-egal&style=flat-square&logo=codecov&label=&logoColor=a3acb7&labelColor=21262d&color=21262d">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/codecov/c/github/nvlang/egal?flag=lightningcss-plugin-egal&style=flat-square&logo=codecov&label=&logoColor=24292f&labelColor=eaeef2&color=eaeef2">
    <img alt="CodeCov coverage" src="https://img.shields.io/codecov/c/github/nvlang/egal?flag=lightningcss-plugin-egal&style=flat-square&logo=codecov&label=&logoColor=24292f&labelColor=eaeef2&color=eaeef2">
</picture>
](https://codecov.io/gh/nvlang/egal)

</div>
</div>

## Getting Started

**Note**: This package is [ESM-only].

### Installation

```sh
pnpm add -D @nvl/lightningcss-plugin-egal     # If using PNPM
bun  add -D @nvl/lightningcss-plugin-egal     # If using Bun
npm  add -D @nvl/lightningcss-plugin-egal     # If using NPM
yarn add -D @nvl/lightningcss-plugin-egal     # If using Yarn
deno add -D jsr:@nvl/lightningcss-plugin-egal # If using Deno
```

**NB:** Make sure you've also installed [`lightningcss`](https://www.npmjs.com/package/lightningcss) itself.

### Usage

You can add `@nvl/lightningcss-plugin-egal` to your project as you would any other [Lightning CSS plugin](https://lightningcss.dev/transforms.html#using-plugins):

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import egalVisitor from '@nvl/lightningcss-plugin-egal';

export default defineConfig({
    css: {
        transformer: 'lightningcss',
        lightningcss: { visitor: egalVisitor },
    },
});
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

-   You can specify the **lightness** and **chroma** as percentages or plain
    numbers.
-   You can specify the **hue** as a unitless number, in which case it will be
    interpreted as degrees, or as an angle with a unit that CSS understands
    (`deg`, `grad`, `rad`, or `turn`, where `360deg = 400grad = 2π rad =
    1turn`).
-   You can optionally specify the **opacity** with the `/ <alpha>` syntax.
-   You can optionally specify the target **gamut** by passing `srgb`, `p3`, or
    `rec2020` as an additional argument. The default target gamut is to `srgb`.
-   You can optionally specify additional options by passing a JSON object
    surrounded by single quotes as the last argument. Note that if you specify a
    target gamut in the JSON object while a different gamut is specified in the
    preceding argument to the `egal` function, the gamut from the preceding
    argument will take precedence.

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


### Example Usage

You can then, for example, use `egal` to define a color palette in your CSS:

```css
:root {
    --testcolor-50: egal(95% 1 30);
    --testcolor-100: egal(90% 1 30);
    /* ... */
    --testcolor-900: egal(10% 1 30);
    --testcolor-950: egal(5% 1 30);
}

/* If P3 is supported */
@media (color-gamut: p3) {
    :root {
        --testcolor-50: egal(95% 1 30, p3);
        --testcolor-100: egal(90% 1 30, p3);
        /* ... */
        --testcolor-900: egal(10% 1 30, p3);
        --testcolor-950: egal(5% 1 30, p3);
    }
}
```

You could then incorporate these variables into your TailwindCSS or UnoCSS configuration:

<details>
<summary><b>TailwindCSS (v4)</b></summary>

Either [`@import`](https://tailwindcss.com/docs/functions-and-directives#import-directive)
the colors into the CSS file containing the
[`@theme` directive](https://tailwindcss.com/docs/functions-and-directives#theme-directive),
or define them directly there. Then, you can
[add the variables to the TailwindCSS theme](https://tailwindcss.com/docs/theme):

```css
@import 'tailwindcss';

@theme {
    --color-testcolor-50: var(--testcolor-50);
    --color-testcolor-100: var(--testcolor-100);
    /* ... */
    --color-testcolor-900: var(--testcolor-900);
    --color-testcolor-950: var(--testcolor-950);
}
```
</details>

<details>
<summary><b>UnoCSS</b></summary>

You can add the colors to your UnoCSS configuration via the
[`theme` property](https://unocss.dev/config/theme):

```ts
// uno.config.ts
import { defineConfig } from 'unocss';

export default defineConfig({
    theme: {
        colors: {
            testcolor: {
                50: 'var(--testcolor-50)',
                100: 'var(--testcolor-100)',
                // ...
                900: 'var(--testcolor-900)',
                950: 'var(--testcolor-950)',
            },
        },
    },
});
```

</details>


[ESM-only]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
