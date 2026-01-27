# LightningCSS Plugin Extended Colors

## Overview

Ever get tired of CSS having such a limited set of named colors? Well not anymore!

Have fun styling your pages with any color from `acajou` to `zomp`.

## Installation

Install the core plugin and one or more colorspace packages:

```bash
npm install lightningcss-plugin-extended-colors

# Install one or more colorspace packages:
npm install @lightningcss-plugin-extended-colors/crayola
npm install @lightningcss-plugin-extended-colors/encycolorpedia
npm install @lightningcss-plugin-extended-colors/lego
```

## Usage

Import the plugin and a colorspace, then pass the colorspace as an object to the `colorspaces` option:

```ts
import { transform, composeVisitors } from 'lightningcss';
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';
import crayola from '@lightningcss-plugin-extended-colors/crayola';

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
    extendedColorsVisitor({ colorspaces: [crayola] })
  ])
});

assert.equal(res.code.toString(), '.foo{color:#ffb97b;background:#7a89b8}');
```

### Colorspaces

To see all available colors, please see the respective doc for each colorspace:

| Colorspace | Package | Colors |
| --- | --- | --- |
| Crayola | `@lightningcss-plugin-extended-colors/crayola` | [169 named colors](./docs/crayola-colors.md) |
| Encycolorpedia | `@lightningcss-plugin-extended-colors/encycolorpedia` | [1489 named colors](./docs/encycolorpedia-colors.md) |
| Lego | `@lightningcss-plugin-extended-colors/lego` | [265 named colors](./docs/lego-colors.md) |

### Custom Colorspaces

You can define your own colorspace as a plain object mapping color names to CSS values:

```ts
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';

const brandColors = {
  "primary": "#0066ff",
  "secondary": "#ff6600",
};

extendedColorsVisitor({ colorspaces: [brandColors] });
```

### Color Fallbacks (Arrays)

Color values can be arrays to provide fallback declarations for older browsers:

```ts
const brandColors = {
  "primary": ["#0066ff", "oklch(0.6 0.2 250)"],
};
```

This produces multiple declarations with the fallback first and the modern value last:

```css
.test {
  color: #0066ff;
  color: oklch(0.6 0.2 250);
}
```

> **Note:** LightningCSS deduplicates same-property declarations based on `targets`. Without `targets`, it assumes modern browsers and keeps only the last (most modern) value. Set `targets` to older browsers to preserve fallback declarations.

### Mixing Colorspaces

You can pass multiple colorspaces. They are merged in order, so later colorspaces take precedence in case of name collisions:

```ts
import encycolorpedia from '@lightningcss-plugin-extended-colors/encycolorpedia';
import crayola from '@lightningcss-plugin-extended-colors/crayola';

extendedColorsVisitor({
  colorspaces: [encycolorpedia, crayola]
});
// If both define "wisteria", crayola's value wins.
```

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

### Note on Native CSS Colors

Native CSS colors (like `red`, `blue`, `green`, etc.) always take precedence over extended colors. This is because LightningCSS parses standard CSS colors before this plugin processes them. If a color library defines a color with the same name as a native CSS color, the native color will be used instead.

## Contributing

Build the library:

```bash
npm run build --workspaces  # Build colorspace packages
npm run build               # Build core plugin
```

Build the library in watch mode:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

### Adding a Changeset

Before opening a PR, run `npx changeset` to describe your changes. This creates a markdown file in `.changeset/` that tracks which packages changed and what kind of version bump is needed. The CI will handle versioning and publishing after merge.

### Project Structure

```
├── src/index.ts              # Core plugin
├── packages/
│   ├── crayola/              # @lightningcss-plugin-extended-colors/crayola
│   ├── encycolorpedia/       # @lightningcss-plugin-extended-colors/encycolorpedia
│   └── lego/                 # @lightningcss-plugin-extended-colors/lego
```

## Color Charts

This plugin provides access to hundreds of named colors from three main sources:

- [Crayola Colors](./docs/crayola-colors.md) - 169 named colors from the famous crayon manufacturer
- [Encycolorpedia Colors](./docs/encycolorpedia-colors.md) - 1489 named colors from various sources
- [Lego Colors](./docs/lego-colors.md) - 265 named colors from the LEGO brand

## Data Sources

- [Encycolorpedia](https://encycolorpedia.com/named) - Collection of named colors from various sources
- [Crayola](https://en.m.wikipedia.org/wiki/List_of_Crayola_crayon_colors) - Collection of named colors from the crayon manufacturer
- [Lego](https://rebrickable.com/colors/) - Collection of named colors from the LEGO brand
