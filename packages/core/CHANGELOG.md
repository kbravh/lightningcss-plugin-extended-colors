# lightningcss-plugin-extended-colors

## 2.0.0

### Major Changes

- [#5](https://github.com/kbravh/lightningcss-plugin-extended-colors/pull/5) [`5826932`](https://github.com/kbravh/lightningcss-plugin-extended-colors/commit/58269325624b8c2d8c6fe31ba382eb660d9f3f05) Thanks [@kbravh](https://github.com/kbravh)! - Colormaps have been split into separate packages. The core plugin can now accept custom colormaps.

### Migrating from v1

In v1, all colormaps were bundled with the core plugin and selected by name:

```ts
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';

extendedColorsVisitor({ colorLibrary: 'crayola' });
```

In v2, colormaps are installed separately and passed to the `colorspaces` option as objects:

```bash
npm install lightningcss-plugin-extended-colors

# Install one or more colorspace packages:
npm install @lightningcss-plugin-extended-colors/crayola
npm install @lightningcss-plugin-extended-colors/encycolorpedia
npm install @lightningcss-plugin-extended-colors/lego
```

```ts
import extendedColorsVisitor from 'lightningcss-plugin-extended-colors';
import crayola from '@lightningcss-plugin-extended-colors/crayola';

extendedColorsVisitor({ colorspaces: [crayola] });
```

#### Key changes

- The `colorLibrary` option has been replaced by `colorspaces`, which accepts an array of colormap objects.
- Colormaps are now imported from separate packages (`@lightningcss-plugin-extended-colors/crayola`, etc.) instead of being selected by string name.
- Multiple colorspaces can be combined. Later entries take precedence in case of name collisions:
  ```ts
  import encycolorpedia from '@lightningcss-plugin-extended-colors/encycolorpedia';
  import crayola from '@lightningcss-plugin-extended-colors/crayola';

  extendedColorsVisitor({ colorspaces: [encycolorpedia, crayola] });
  ```
- You can now define custom colorspaces as plain objects mapping color names to CSS color values:
  ```ts
  const brandColors = {
    "primary": "#0066ff",
    "secondary": "#ff6600",
  };

  extendedColorsVisitor({ colorspaces: [brandColors] });
  ```
- Color values can now be arrays to provide fallback declarations for older browsers:
  ```ts
  const brandColors = {
    "primary": ["#0066ff", "oklch(0.6 0.2 250)"],
  };
  ```
