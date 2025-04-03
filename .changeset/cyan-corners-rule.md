---
'@nvl/postcss-egal': major
'@nvl/egal': major
---

In CSS, `oklch(1 0 0)` and `oklch(100% 0 0)` are equivalent. We want this same
behavior for egal. However, the CSS syntax should mirror the JS/TS syntax for
the function, i.e., calling `egal(1, 0, 0)` in JS/TS should be the same as
writing `egal(1 0 0)` in CSS. This was currently not the case, however, since
the inputs of the egal function were always being interpreted as percentages,
both in JS/TS, but also in CSS (in the case of CSS, this was independent of
whether a percentage sign was appended to the value or not). To fix this, we
make the JS/TS function interpret its inputs as fractions, i.e., if we call
`egal(1, 0, 0)` in JS/TS, it'll be equivalent to writing `egal(100% 0 0)` or
`egal(1 0 0)` in CSS.
