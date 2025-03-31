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
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=a3acb7&label=&labelColor=21262d&color=21262d&filter=@nvl/egal@*">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=24292f&label=&labelColor=eaeef2&color=eaeef2&filter=@nvl/egal@*">
    <img alt="GitHub version tag" src="https://img.shields.io/github/v/tag/nvlang/egal?style=flat-square&logo=GitHub&logoColor=24292f&label=&labelColor=eaeef2&color=eaeef2&filter=@nvl/egal@*">
</picture>
](https://github.com/nvlang/egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/@nvl/egal-_?style=flat-square&logo=npm&logoColor=a3acb7&labelColor=21262d&color=21262d&logoSize=auto)">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/@nvl/egal-_?style=flat-square&logo=npm&logoColor=24292f&labelColor=eaeef2&color=eaeef2&logoSize=auto)">
    <img alt="NPM package name" src="https://img.shields.io/badge/@nvl/egal-_?style=flat-square&logo=npm&logoColor=24292f&labelColor=eaeef2&color=eaeef2&logoSize=auto)">
</picture>
](https://npmjs.com/@nvl/egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/@nvl/egal-_?style=flat-square&labelColor=21262d&color=21262d&logo=jsr&logoColor=a3acb7&logoSize=auto">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/@nvl/egal-_?style=flat-square&labelColor=eaeef2&color=eaeef2&logo=jsr&logoColor=24292f&logoSize=auto">
    <img alt="JSR package name" src="https://img.shields.io/badge/@nvl/egal-_?style=flat-square&labelColor=eaeef2&color=eaeef2&logo=jsr&logoColor=24292f&logoSize=auto">
</picture>
](https://jsr.io/@nvl/egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://jsr.io/badges/@nvl/egal/score?style=flat-square&labelColor=21262d&color=21262d&logoColor=a3acb7">
    <source media="(prefers-color-scheme: light)" srcset="https://jsr.io/badges/@nvl/egal/score?style=flat-square&labelColor=eaeef2&color=eaeef2&logoColor=24292f">
    <img alt="JSR score" src="https://jsr.io/badges/@nvl/egal/score?style=flat-square&labelColor=eaeef2&color=eaeef2&logoColor=24292f">
</picture>
](https://jsr.io/@nvl/egal)
[
<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/codecov/c/github/nvlang/egal?flag=egal&style=flat-square&logo=codecov&label=&logoColor=a3acb7&labelColor=21262d&color=21262d">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/codecov/c/github/nvlang/egal?flag=egal&style=flat-square&logo=codecov&label=&logoColor=24292f&labelColor=eaeef2&color=eaeef2">
    <img alt="CodeCov coverage" src="https://img.shields.io/codecov/c/github/nvlang/egal?flag=egal&style=flat-square&logo=codecov&label=&logoColor=24292f&labelColor=eaeef2&color=eaeef2">
</picture>
](https://codecov.io/gh/nvlang/egal)

</div>
</div>

## Getting Started

**Note**: This package is [ESM-only].

### Installation

```sh
pnpm add @nvl/egal # If using PNPM
bun  add @nvl/egal # If using Bun
npm  add @nvl/egal # If using NPM
yarn add @nvl/egal # If using Yarn
deno add @nvl/egal # If using Deno
```

### Usage

For example:

```ts
import { egal } from '@nvl/egal';

const hues = [0, 60, 120, 180, 240, 300];
const lightnesses = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const palette = hues.map((hue) =>
    lightnesses.map((lightness) => egal(lightness, 100, hue, { hues }))
);
console.log(palette);
```

<!-- TODO: Expand this -->

[ESM-only]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
