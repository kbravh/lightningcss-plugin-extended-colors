# LightningCSS Plugin Extended Named Colors

## Overview
Every get tired of CSS having such a limited set of named colors? Well not anymore!

Have fun styling your pages with any color from `acajou` to `zomp`.

## Installation
Install the plugin with `npm`:

```bash
npm install lightningcss-plugin-extended-named-colors
```

## Usage

Once installed, you can include it as a [`lightningcss` plugin](https://lightningcss.dev/transforms.html#using-plugins):

```ts
import { transform, composeVisitors } from 'lightningcss';
import extendedColorsVisitor from 'lightningcss-plugin-extended-named-colors';

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

## Attribution
- [Encycolorpedia](https://encycolorpedia.com/named)
- Crayola