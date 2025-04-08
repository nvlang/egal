# @nvl/postcss-egal

## 2.0.0

### Major Changes

- [`8f562b6`](https://github.com/nvlang/egal/commit/8f562b63eef05b22b88160399b5d2204c73bc3be)
  Thanks [@nvlang](https://github.com/nvlang)! - Revamp the transformer, fixing
  some bugs and improving warnings.

    **BREAKING CHANGE**: Custom parsers are no longer supported. This is to
    simplify the API and code a bit, and because the transformer supports ad hoc
    options by now.

### Patch Changes

- [`8052354`](https://github.com/nvlang/egal/commit/8052354f43269b67eb10d721c8afd03f12a37b29)
  Thanks [@nvlang](https://github.com/nvlang)! - Improve module documentation
  and README.

- Updated dependencies
  [[`a5d9126`](https://github.com/nvlang/egal/commit/a5d91266b053dc49b02cdb251b886d59faca9b17),
  [`644e398`](https://github.com/nvlang/egal/commit/644e3988fcfb0a202667a75c43ccb00c8dbf6a2e),
  [`9f9be3b`](https://github.com/nvlang/egal/commit/9f9be3b7e2c4ece9f77a7dcf02302fbd9a084a50)]:
    - @nvl/egal@1.0.1

## 1.0.0

### Major Changes

- [`8ecb516`](https://github.com/nvlang/egal/commit/8ecb5164adc4a19a6b56d514dab49808644e1993)
  Thanks [@nvlang](https://github.com/nvlang)! - In CSS, `oklch(1 0 0)` and
  `oklch(100% 0 0)` are equivalent. We want this same behavior for egal.
  However, the CSS syntax should mirror the JS/TS syntax for the function, i.e.,
  calling `egal(1, 0, 0)` in JS/TS should be the same as writing `egal(1 0 0)`
  in CSS. This was currently not the case, however, since the inputs of the egal
  function were always being interpreted as percentages, both in JS/TS, but also
  in CSS (in the case of CSS, this was independent of whether a percentage sign
  was appended to the value or not). To fix this, we make the JS/TS function
  interpret its inputs as fractions, i.e., if we call `egal(1, 0, 0)` in JS/TS,
  it'll be equivalent to writing `egal(100% 0 0)` or `egal(1 0 0)` in CSS.

- [`f0aa004`](https://github.com/nvlang/egal/commit/f0aa004b2d756e8cecb78dee852cb202c6b6fe82)
  Thanks [@nvlang](https://github.com/nvlang)! - Make default parser stricter:

    - Forbid using commas between the lightness, chroma, and hue values.
    - Forbid whitespace between the lightness and the optional percentage sign.
    - Forbid whitespace between the chroma and the optional percentage sign.
    - Forbid whitespace between the hue and the optional angle unit.

### Minor Changes

- [`f0aa004`](https://github.com/nvlang/egal/commit/f0aa004b2d756e8cecb78dee852cb202c6b6fe82)
  Thanks [@nvlang](https://github.com/nvlang)! - Make the default parser support
  `none` values for lightness or chroma.

- [`8ecb516`](https://github.com/nvlang/egal/commit/8ecb5164adc4a19a6b56d514dab49808644e1993)
  Thanks [@nvlang](https://github.com/nvlang)! - Improves the parser for the
  PostCSS plugin, adding support for specifying the targeted color gamut or even
  arbitrary ad hoc egal options in each occurrence of egal in CSS. Also makes
  the parser more maintainable by using the amazing
  [`regex`](https://www.npmjs.com/package/regex) package.

- [`7d49103`](https://github.com/nvlang/egal/commit/7d49103de80e10f1c3f0a08fb76307879819a953)
  Thanks [@nvlang](https://github.com/nvlang)! - Print a warning when the plugin
  suspects that the user tried to specify a color with egal, but the parsing
  failed.

- [`f0aa004`](https://github.com/nvlang/egal/commit/f0aa004b2d756e8cecb78dee852cb202c6b6fe82)
  Thanks [@nvlang](https://github.com/nvlang)! - Make default parser support
  angle units for hues.

- [`f0aa004`](https://github.com/nvlang/egal/commit/f0aa004b2d756e8cecb78dee852cb202c6b6fe82)
  Thanks [@nvlang](https://github.com/nvlang)! - Make default parser support
  specifying color opacity via the usual `... / <alpha>` CSS syntax.

### Patch Changes

- Updated dependencies
  [[`8ecb516`](https://github.com/nvlang/egal/commit/8ecb5164adc4a19a6b56d514dab49808644e1993)]:
    - @nvl/egal@1.0.0

## 0.1.3

### Patch Changes

- [`9ee5659`](https://github.com/nvlang/egal/commit/9ee565944d03f3da0107720860dc1a7820e1be1c)
  Thanks [@nvlang](https://github.com/nvlang)! - Improve package descriptions
  and keywords.

- Updated dependencies
  [[`9ee5659`](https://github.com/nvlang/egal/commit/9ee565944d03f3da0107720860dc1a7820e1be1c)]:
    - @nvl/egal@0.1.3

## 0.1.2

### Patch Changes

- [`3421039`](https://github.com/nvlang/egal/commit/3421039717086b53cf152e690cee0ef15f085410)
  Thanks [@nvlang](https://github.com/nvlang)! - Re-release with updated CI.

- Updated dependencies
  [[`3421039`](https://github.com/nvlang/egal/commit/3421039717086b53cf152e690cee0ef15f085410)]:
    - @nvl/egal@0.1.2

## 0.1.1

### Patch Changes

- [`9e90f9e`](https://github.com/nvlang/egal/commit/9e90f9e7dc101deed1cc557ca928f80151e5abad)
  Thanks [@nvlang](https://github.com/nvlang)! - Re-release (hopefully with a
  fixed CI).

- Updated dependencies
  [[`9e90f9e`](https://github.com/nvlang/egal/commit/9e90f9e7dc101deed1cc557ca928f80151e5abad)]:
    - @nvl/egal@0.1.1

## 0.1.0

### Minor Changes

- [`d4863a0`](https://github.com/nvlang/egal/commit/d4863a0def03af5a863583b31c2e6bdd19f96be9)
  Thanks [@nvlang](https://github.com/nvlang)! - Initial release.

### Patch Changes

- Updated dependencies
  [[`8798b93`](https://github.com/nvlang/egal/commit/8798b9305fe118470d355d0c9e6d8ff103126ccd)]:
    - @nvl/egal@0.1.0
