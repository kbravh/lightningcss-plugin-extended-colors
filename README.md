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

This plugin provides access to hundreds of named colors from two main sources:

- [Crayola Colors](./docs/crayola-colors.md) - 169 named colors from the famous crayon manufacturer
- [Encycolorpedia Colors](./docs/encycolorpedia-colors.md) - 1489 named colors from various sources
- [Lego Colors](./docs/lego-colors.md) - 265 named colors from the LEGO brand

## Data Sources

- [Encycolorpedia](https://encycolorpedia.com/named) - Collection of named colors from various sources
- [Crayola](https://en.m.wikipedia.org/wiki/List_of_Crayola_crayon_colors) - Collection of named colors from the crayon manufacturer
- [Lego](https://rebrickable.com/colors/) - Collection of named colors from the LEGO brand
