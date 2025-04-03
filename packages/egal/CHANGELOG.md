# @nvl/egal

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
