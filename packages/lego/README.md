# @lightningcss-plugin-extended-colors/lego

LEGO color definitions for [lightningcss-plugin-extended-colors](https://github.com/kbravh/lightningcss-plugin-extended-colors). This collection includes 265 named colors from the LEGO brand.

## Installation

```bash
npm install lightningcss-plugin-extended-colors @lightningcss-plugin-extended-colors/lego
```

## Usage

```ts
import { transform, composeVisitors } from 'lightningcss';
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';
import lego from '@lightningcss-plugin-extended-colors/lego';

let res = transform({
  filename: 'test.css',
  minify: true,
  code: Buffer.from(`
    .foo {
      color: brightred;
      background: darkturquoise;
    }
  `),
  visitor: composeVisitors([
    extendedColorsVisitor({ colorspaces: [lego] })
  ])
});
```

## Available Colors

See the [full color chart](https://github.com/kbravh/lightningcss-plugin-extended-colors/blob/main/docs/lego-colors.md) for all 265 colors.

## Data Source

- [Lego](https://rebrickable.com/colors/) - Collection of named colors from the LEGO brand
