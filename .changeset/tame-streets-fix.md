---
'@nvl/egal': patch
---

Fixes incorrect outputs when using the HCT color space in the background. The incorrect outputs were caused by bad handling of the lightness parameter. OkLCh and HCT have two different input ranges for this parameter (0-1 for OkLCh and 0-100 for HCT), and the library was not handling this correctly both when calculating the maximum chroma nor when generating the output color.

Now, only lightness parameters between 0 and 1 (both inclusive) are accepted, regardless of whether OkLCh or HCT is being used in the background. For HCT, the lightness parameter will be multiplied by 100 to yield the HCT "tone" value.
