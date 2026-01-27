# @lightningcss-plugin-extended-colors/encycolorpedia

Encycolorpedia color definitions for [lightningcss-plugin-extended-colors](https://github.com/kbravh/lightningcss-plugin-extended-colors). This collection includes 1489 named colors.

## Installation

```bash
npm install lightningcss-plugin-extended-colors @lightningcss-plugin-extended-colors/encycolorpedia
```

## Usage

```ts
import { transform, composeVisitors } from 'lightningcss';
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';
import encycolorpedia from '@lightningcss-plugin-extended-colors/encycolorpedia';

let res = transform({
  filename: 'test.css',
  minify: true,
  code: Buffer.from(`
    .foo {
      color: vampireblack;
      background: eerieblack;
    }
  `),
  visitor: composeVisitors([
    extendedColorsVisitor({ colorspaces: [encycolorpedia] })
  ])
});

assert.equal(res.code.toString(), '.foo{color:#080808;background:#1b1b1b}');
```

## Available Colors

See the [full color chart](https://github.com/kbravh/lightningcss-plugin-extended-colors/blob/main/docs/encycolorpedia-colors.md) for all 1489 colors.

## Data Source

- [Encycolorpedia](https://encycolorpedia.com/named) - Collection of named colors from various sources
