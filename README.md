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
<br>

> [!NOTE]
> **Getting started**: Refer to the README of the
> [standalone package](./packages/egal/README.md#getting-started),
> [PostCSS plugin](./packages/postcss-egal/README.md#getting-started), or
> [Lightning CSS plugin](./packages/lightningcss-plugin-egal/README.md#getting-started),
> depending on your use case.

## Why?

### Problem

Color spaces like OkLCh and HCT aim to be perceptually uniform, and they can be
incredibly useful if consistency of lightness across hues is important. However,
it can be difficult to ensure consistency of chroma (saturation) across hues.
This is because not all hues can deliver the same chroma at a given lightness.

For example, if you take the color `oklch(50% 0.275 280)`
![#5627f8](https://placehold.co/12/5627f8/0000), you get a very saturated
purple. However, if you shift the hue to 200, you'll find that an sRGB monitor
cannot truly display the color `oklch(50% 0.275 200)`, and instead will silently
fall back to `oklch(50% 0.0848 200)`
![#017176](https://placehold.co/12/017176/0000).

### Idea

Now, how can we make colors of different hues but equal lightness appear equally
saturated? One way, of course, is to set the chroma to zero, but this would just
yield the same shade of gray independent of hue. Alternatively, one can try to
find the largest chroma value that all the different hues can still deliver at
the given lightness. That's precisely what _égal_ (IPA /e.ɡal/ — from French,
meaning "equal" or "indifferent") does. It maps the absolute scale of chroma
embedded in OkLCh into a scale that is relative to the aforementioned maximal
chroma.

<br>
<div align="center">
<figure>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="res/oklch-vs-egal-fixed-lightness-dark.svg">
        <source media="(prefers-color-scheme: light)" srcset="res/oklch-vs-egal-fixed-lightness-light.svg">
        <img alt="Graph titled 'oklch( 0.5, [0,0.35], [0,360) )', with hue as x-axis and chroma as y-axis. The hue ranges from 0 to 360 degrees, and the chroma ranges from 0 to 0.35 on the left side, which is labeled 'oklch', and from 0% to 400% on the right side, which is labeled 'egal'. At coordinate (x,y), the graph shows a pixel of color `oklch(0.5,y,x)`, where y is understood with the oklch scale for chroma. Only colors which are visible in sRGB are shown in the graph, yielding a shape with a colorful but irregular top with occasional spikes, and a monotonous gray bottom. A dashed, white, straight horizontal line is drawn across this colorful shape around y coordinate 0.085 in the oklch scale and 100% in the egal scale, and intersects with the global minimum of the shape, around hue 200 degrees." src="res/oklch-vs-egal-fixed-lightness-light.svg" width="80%">
    </picture>
    <br>
    <figcaption>
        <i>At 50% lightness, the bottleneck for chroma is around hue 200 degrees.</i>
    </figcaption>
</figure>
</div>
<br>

The tradeoff here is that we lose consistency of chroma values across
lightnesses:

<br>
<div align="center">
<figure>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="res/oklch-vs-egal-fixed-hue-dark.svg">
        <source media="(prefers-color-scheme: light)" srcset="res/oklch-vs-egal-fixed-hue-light.svg">
        <img alt="Graph titled 'oklch( [0,1], [0,0.35], 0 )', with lightness as x-axis and chroma as y-axis (both using the OkLCh scale). A pyramid-like shape colored bright magenta at the top, black at the bottom left corner, and white at the bottom right corner, with smooth color gradients between the corners, illustrates which colors in the range referred to by the title are visible in the sRGB gamut. Separately, a white line starting at the bottom left corner goes straight toward a peak at around lightness 80 and chroma 0.1, and then goes to the bottom right corner in a staight line from there. This line illustrates the chroma value on the OkLCh chroma scale that a chroma value of 100% in the egal reparametrization corresponds to as a function of the lightness." src="res/oklch-vs-egal-fixed-hue-light.svg" width="80%">
    </picture>
    <br>
    <figcaption>
        <i>What a chroma of 100% means for egal depends on the lightness.</i>
    </figcaption>
</figure>
</div>
<br>

However, given that the consistency of chroma across lightness was still
vulnerable to being broken by fallbacks arising from the limitations of the sRGB
(or P3, Rec2020, etc.) color gamut, this tradeoff might not be as bas as it
seems, depending on the use case.

### In Detail

As mentioned before, the core idea behind égal is as follows:

> For a given lightness, find the largest chroma such that any hue will be still
> able to deliver that chroma at the given lightness.

Now, this can be generalized into the following:

> For a given lightness $\ell$, provide a _linear_ mapping
> $f_\ell\colon[0,\infty)\to[0,\infty)$ such that $f_\ell(0) = 0$ and
> $f_\ell(100)$ equals the largest chroma such that, at the given lightness, any
> hue will still be able to deliver that chroma.

These functions $f_\ell$ are then used to define a mapping into the input space
of OkLCh as follows:

$$
\begin{aligned}
\texttt{egal} &\colon [0,100]\times[0,\infty)\times[0,360) \to [0,100]\times[0,\infty)\times[0,360), \\
\texttt{egal} &\colon \langle \ell, c, h \rangle \mapsto \langle \ell, f_\ell(c), h \rangle.
\end{aligned}
$$

Note that these functions are sensitive to the color gamut that we are
targeting, since the maximum chroma values directly depend on that gamut. This
is because the gamut is what specifies when a color is no longer considered
displayable. For example, P3 monitors are able to display more saturated colors
than sRGB monitors, and therefore the maximum chroma values for P3 are larger
than those for sRGB. Because of this, the target gamut can be specified as an
option passed to the egal function.

Furthermore, if you prefer to use HCT instead of OkLCh behind the scenes, that's
also supported.

## Other Resources

### Software

-   [color.js](https://github.com/color-js/color.js): "Color conversion &
    manipulation library by the editors of the CSS Color specifications"
-   [ColorAide](https://github.com/facelessuser/coloraide): Object-oriented
    color manipulation library written purely in Python.
-   [OKLCH Color Picker & Converter](https://oklch.com/): Online OkLCh color
    picker and converter.
-   [HCT Color Converter](https://www.hct-color-converter.com): Online HCT color
    converter.
-   [HCT Color Picker](https://www.figma.com/community/plugin/1227923985322908257/hct-color-picker):
    Figma plugin for picking colors in the HCT color space.
-   [Material Color Utilities](https://github.com/material-foundation/material-color-utilities):
    Google's color libraries for Material Design.

### Articles

-   [Color Appearance Model](https://en.wikipedia.org/wiki/Color_appearance_model):
    Wikipedia article on color appearance models.
-   [The Science of Color & Design](https://material.io/blog/science-of-color-design):
    Google's blog post on the HCT color space.
-   [Exploring Tonal Palettes](https://facelessuser.github.io/coloraide/playground/?notebook=https%3A%2F%2Fgist.githubusercontent.com%2Ffacelessuser%2F0235cb0fecc35c4e06a8195d5e18947b%2Fraw%2F3ca56c388735535de080f1974bfa810f4934adcd%2Fexploring-tonal-palettes.md):
    A Jupyter notebook exploring tonal palettes using the ColorAide library, by
    the author of the library.

### Discussions

-   [HCT Color Space](https://news.ycombinator.com/item?id=37308278): Hacker
    News discussion on the HCT color space, involving its creator.

### Color Systems

-   Spot color systems: [PANTONE](https://en.wikipedia.org/wiki/Pantone),
    [RAL](https://en.wikipedia.org/wiki/RAL_colour_standard),
    [ANPA](https://en.wikipedia.org/w/index.php?title=Spot_color&oldid=1180172085#Classification)
-   Widespread digital color systems:
    [X11](https://en.wikipedia.org/wiki/X11_color_names),
    [web colors](https://en.wikipedia.org/wiki/Web_colors)
-   Specialized color systems: [Adobe Spectrum](https://spectrum.adobe.com/page/color-palette/),
    [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/color),
    [Microsoft FluentUI](https://developer.microsoft.com/fluentui#/styles/web/colors/theme-slots),
    [TailwindCSS](https://tailwindcss.com/docs/customizing-colors),
    [IBM Carbon](https://carbondesignsystem.com/guidelines/color/tokens),
    [VMware Clarity](https://clarity.design/documentation/color),
    [Google Material](https://m3.material.io/styles/color/the-color-system/tokens),
    [Github Primer](https://primer.style/foundations/color), etc.
