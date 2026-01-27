# LightningCSS Plugin Extended Colors

Ever get tired of CSS having such a limited set of named colors? Well not anymore!

Have fun styling your pages with any color from `acajou` to `zomp`.

## Quick Start

```bash
npm install lightningcss-plugin-extended-colors @lightningcss-plugin-extended-colors/crayola
```

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

For full usage documentation including custom colorspaces, color fallbacks, mixing colorspaces, and custom properties, see the [core package README](./packages/core/README.md).

## Packages

| Package | Description |
| --- | --- |
| [`lightningcss-plugin-extended-colors`](./packages/core) | Core plugin |
| [`@lightningcss-plugin-extended-colors/crayola`](./packages/crayola) | 169 named colors from the famous crayon manufacturer |
| [`@lightningcss-plugin-extended-colors/encycolorpedia`](./packages/encycolorpedia) | 1489 named colors from various sources |
| [`@lightningcss-plugin-extended-colors/lego`](./packages/lego) | 265 named colors from the LEGO brand |

## Color Charts

- [Crayola Colors](./docs/crayola-colors.md) - 169 named colors
- [Encycolorpedia Colors](./docs/encycolorpedia-colors.md) - 1489 named colors
- [Lego Colors](./docs/lego-colors.md) - 265 named colors

## Contributing

Build all packages:

```bash
npm run build
```

Run tests:

```bash
npm test
```

### Adding a Changeset

Before opening a PR, run `npx changeset` to describe your changes. This creates a markdown file in `.changeset/` that tracks which packages changed and what kind of version bump is needed. The CI will handle versioning and publishing after merge.

### Project Structure

```
├── packages/
│   ├── core/                # lightningcss-plugin-extended-colors
│   ├── crayola/             # @lightningcss-plugin-extended-colors/crayola
│   ├── encycolorpedia/      # @lightningcss-plugin-extended-colors/encycolorpedia
│   └── lego/                # @lightningcss-plugin-extended-colors/lego
```

## Data Sources

- [Encycolorpedia](https://encycolorpedia.com/named) - Collection of named colors from various sources
- [Crayola](https://en.m.wikipedia.org/wiki/List_of_Crayola_crayon_colors) - Collection of named colors from the crayon manufacturer
- [Lego](https://rebrickable.com/colors/) - Collection of named colors from the LEGO brand
