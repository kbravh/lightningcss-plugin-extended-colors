# LightningCSS Plugin Extended Colors

## Overview
Every get tired of CSS having such a limited set of named colors? Well not anymore!

Have fun styling your pages with any color from `acajou` to `zomp`.

## Installation
Install the plugin with `npm`:

```bash
npm install lightningcss-plugin-extended-colors
```

## Usage

Once installed, you can include it as a [`lightningcss` plugin](https://lightningcss.dev/transforms.html#using-plugins):

```ts
import { transform, composeVisitors } from 'lightningcss';
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';

let res = transform({
    filename: 'test.css',
  minify: true,
  code: Buffer.from(`
    .foo {
      color: acajou;
      background: zomp;
    }
  `),
  visitor: composeVisitors([
    extendedColorsVisitor
  ])
});

assert.equal(res.code.toString(), '.foo{color:#4c2f27; background:#39a78e}');
```

### Colorspaces

To see all available colors, please see the respective doc for each colorspace:

| Colorspace | Colors |
| --- | --- |
| `crayola` | [169 named colors](./docs/crayola-colors.md) |
| `encycolorpedia` | [1489 named colors](./docs/encycolorpedia-colors.md) |
| `lego` | [265 named colors](./docs/lego-colors.md) |

By default, the plugin will use the `encycolorpedia` colorspace. You can specify other colorspaces by passing an array of colorspace names to the `colorspaces` option:

```ts
import { transform, composeVisitors } from 'lightningcss';
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';

let res = transform({
    filename: 'test.css',
  minify: true,
  code: Buffer.from(`
    .foo {
      color: macaroniandcheese;
      background: wildblueyonder;
    }
  `),
  visitor: composeVisitors([
    extendedColorsVisitor({ colorspaces: ['crayola'] })
  ])
});

assert.equal(res.code.toString(), '.foo{color:#ffb97b; background:#7a89b8}');
```

If you pass more than one colorspace, they will be merged. In the case of color name collisions (for example, if the colorspaces `crayola` and `encycolorpedia` both contain a color named `macaroniandcheese`), the last colorspace will take precedence.

> **Note:** Native CSS colors (like `red`, `blue`, `green`, etc.) always take precedence over extended colors. This is because LightningCSS parses standard CSS colors before this plugin processes them. If a color library defines a color with the same name as a native CSS color, the native color will be used instead.

### Custom Properties

By default, CSS custom properties (variables) are **not** transformed. This is because custom properties can hold any value, and the plugin cannot determine whether a value is intended to be a color or something else (like an animation name or font family).

```css
:root {
  --my-color: acajou; /* NOT transformed - stays as "acajou" */
}

.test {
  color: acajou; /* Transformed to #4c2f27 */
}
```

To enable transformation for custom properties, use the CSS `@property` rule to define the property with `syntax: "<color>"`:

```css
@property --my-color {
  syntax: "<color>";
  inherits: false;
  initial-value: black;
}

:root {
  --my-color: acajou; /* Transformed to #4c2f27 */
}
```

This approach ensures that only custom properties explicitly defined as colors will have their values transformed, while other custom properties remain unchanged.

## Contributing

Build the library:

```bash
npm run build
```

Build the library in watch mode:

```bash
npm run dev
```

### Project Structure

- `src/` - Source code for the plugin
  - `src/data/` - Data files used by the plugin, including the extended color definitions
  - `src/index.ts` - Main plugin entry point

## Color Charts

This plugin provides access to hundreds of named colors from three main sources:

- [Crayola Colors](./docs/crayola-colors.md) - 169 named colors from the famous crayon manufacturer
- [Encycolorpedia Colors](./docs/encycolorpedia-colors.md) - 1489 named colors from various sources
- [Lego Colors](./docs/lego-colors.md) - 265 named colors from the LEGO brand

## Data Sources

- [Encycolorpedia](https://encycolorpedia.com/named) - Collection of named colors from various sources
- [Crayola](https://en.m.wikipedia.org/wiki/List_of_Crayola_crayon_colors) - Collection of named colors from the crayon manufacturer
- [Lego](https://rebrickable.com/colors/) - Collection of named colors from the LEGO brand
