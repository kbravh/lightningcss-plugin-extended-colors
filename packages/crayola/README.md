# @lightningcss-plugin-extended-colors/crayola

Crayola color definitions for [lightningcss-plugin-extended-colors](https://github.com/kbravh/lightningcss-plugin-extended-colors). This collection includes 169 named colors from the famous crayon manufacturer.

## Installation

```bash
npm install lightningcss-plugin-extended-colors @lightningcss-plugin-extended-colors/crayola
```

## Usage

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

## Available Colors

See the [full color chart](https://github.com/kbravh/lightningcss-plugin-extended-colors/blob/main/docs/crayola-colors.md) for all 169 colors.

## Data Source

- [Crayola](https://en.m.wikipedia.org/wiki/List_of_Crayola_crayon_colors) - Collection of named colors from the crayon manufacturer
