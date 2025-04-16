# @nvl/egal

## 1.0.3

### Patch Changes

- [`6199b36`](https://github.com/nvlang/egal/commit/6199b3655442dc2420a6c5b20ceebca16d6d4f9d)
  Thanks [@nvlang](https://github.com/nvlang)! - Fixes incorrect outputs when
  using the HCT color space in the background. The incorrect outputs were caused
  by bad handling of the lightness parameter. OkLCh and HCT have two different
  input ranges for this parameter (0-1 for OkLCh and 0-100 for HCT), and the
  library was not handling this correctly both when calculating the maximum
  chroma nor when generating the output color.

    Now, only lightness parameters between 0 and 1 (both inclusive) are
    accepted, regardless of whether OkLCh or HCT is being used in the
    background. For HCT, the lightness parameter will be multiplied by 100 to
    yield the HCT "tone" value.

## 1.0.2

### Patch Changes

- [`1e0777d`](https://github.com/nvlang/egal/commit/1e0777d401d59f852ca9a4c31df124718702039e)
  Thanks [@nvlang](https://github.com/nvlang)! - Correct parameter description
  for chroma in TSDoc, and make some further small clarifications.

## 1.0.1

### Patch Changes

- [`a5d9126`](https://github.com/nvlang/egal/commit/a5d91266b053dc49b02cdb251b886d59faca9b17)
  Thanks [@nvlang](https://github.com/nvlang)! - Correct outdated values for
  lightness and chroma in README example.

- [`644e398`](https://github.com/nvlang/egal/commit/644e3988fcfb0a202667a75c43ccb00c8dbf6a2e)
  Thanks [@nvlang](https://github.com/nvlang)! - Clarify in TSDoc comment that
  the default precision depends on the color space being used in the background.
  Also, use a better example value for the precision.

- [`9f9be3b`](https://github.com/nvlang/egal/commit/9f9be3b7e2c4ece9f77a7dcf02302fbd9a084a50)
  Thanks [@nvlang](https://github.com/nvlang)! - Clarify in warnings that the
  default precision depends on the color space being used in the background.

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

## 0.1.3

### Patch Changes

- [`9ee5659`](https://github.com/nvlang/egal/commit/9ee565944d03f3da0107720860dc1a7820e1be1c)
  Thanks [@nvlang](https://github.com/nvlang)! - Improve package descriptions
  and keywords.

## 0.1.2

### Patch Changes

- [`3421039`](https://github.com/nvlang/egal/commit/3421039717086b53cf152e690cee0ef15f085410)
  Thanks [@nvlang](https://github.com/nvlang)! - Re-release with updated CI.

## 0.1.1

### Patch Changes

- [`9e90f9e`](https://github.com/nvlang/egal/commit/9e90f9e7dc101deed1cc557ca928f80151e5abad)
  Thanks [@nvlang](https://github.com/nvlang)! - Re-release (hopefully with a
  fixed CI).

## 0.1.0

### Minor Changes

- [`8798b93`](https://github.com/nvlang/egal/commit/8798b9305fe118470d355d0c9e6d8ff103126ccd)
  Thanks [@nvlang](https://github.com/nvlang)! - Add README.

## 0.0.1

### Patch Changes

- [`f2d9697`](https://github.com/nvlang/egal/commit/f2d96977462fac82988b083007c93297598f7687)
  Thanks [@nvlang](https://github.com/nvlang)! - Testing
