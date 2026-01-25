import { transform } from 'lightningcss';
import { describe, expect, it } from 'vitest';
import extendedNamedColorsPlugin from '../src/index';

describe('extendedNamedColorsPlugin', () => {
  it('should throw an error for invalid colorspace', () => {
    expect(() => {
      transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from('.test { color: red; }'),
        // @ts-expect-error testing invalid colorspace
        visitor: extendedNamedColorsPlugin({
          colorspaces: ['invalid-colorspace'],
        }),
      });
    }).toThrow('Invalid colorspace: invalid-colorspace');
  });

  it('should transform encycolorpedia colors by default', () => {
    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: acajou;
          background: zomp;
        }
      `),
      visitor: extendedNamedColorsPlugin(),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:#4c2f27;background:#39a78e}',
    );
  });
  it('should transform crayola colors', () => {
    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: macaroniandcheese;
          background: wildblueyonder;
        }
      `),
      visitor: extendedNamedColorsPlugin({ colorspaces: ['crayola'] }),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:#ffb97b;background:#7a89b8}',
    );
  });
  it('should transform lego colors', () => {
    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: modulexviolet;
          background: pearlred;
        }
      `),
      visitor: extendedNamedColorsPlugin({ colorspaces: ['lego'] }),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:#bd7d85;background:#d60026}',
    );
  });
  it('should respect the colorspace order', () => {
    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: beaver;         /* Encycolorpedia: #9f8170, Crayola: #926f5b */
          background: wisteria;  /* Encycolorpedia: #89729e, Crayola: #c9a0dc */
        }
      `),
      visitor: extendedNamedColorsPlugin({
        colorspaces: ['encycolorpedia', 'crayola'],
      }),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:#926f5b;background:#c9a0dc}',
    );
  });
});

describe('context-aware transformation', () => {
  describe('should NOT transform non-color contexts', () => {
    it('should NOT transform animation names', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            animation: acajou 2s ease-in-out;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // Animation name "acajou" should be preserved, not converted to #4c2f27
      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should NOT transform animation-name property', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            animation-name: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should NOT transform keyframe names', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          @keyframes acajou {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // Keyframe name should be preserved
      expect(result.code.toString()).toContain('@keyframes acajou');
    });

    it('should NOT transform counter-reset names', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            counter-reset: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should NOT transform counter-increment names', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            counter-increment: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should NOT transform font-family names', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            font-family: acajou, sans-serif;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should NOT transform grid-area names', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            grid-area: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should NOT transform will-change values', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            will-change: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });
  });

  describe('should transform color contexts', () => {
    it('should transform colors in background shorthand', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            background: acajou url(bg.png) no-repeat;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
      expect(result.code.toString()).not.toMatch(/background:[^;]*acajou/);
    });

    it('should transform colors in border shorthand', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            border: 1px solid acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform colors in outline', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            outline: 2px dashed acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform colors in box-shadow', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            box-shadow: 2px 2px 4px acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform colors in text-shadow', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            text-shadow: 1px 1px 2px acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform border-color', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            border-color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform outline-color', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            outline-color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform text-decoration-color', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            text-decoration-color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform caret-color', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            caret-color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform accent-color', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            accent-color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform fill (SVG)', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            fill: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should transform stroke (SVG)', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            stroke: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      expect(result.code.toString()).toContain('#4c2f27');
    });

    it('should pass through standard CSS colors unchanged (fully parsed declarations)', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            color: red;
            background-color: blue;
            border-color: green;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // Standard CSS colors are fully parsed by LightningCSS, not unparsed,
      // so they pass through the handler unchanged
      const output = result.code.toString();
      expect(output).toContain('red');
      expect(output).toContain('#00f'); // blue minified
      expect(output).toContain('green');
    });

    it('should pass through unparsed color properties with no extended colors', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            color: var(--my-color);
            background-color: var(--bg, fallback);
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // CSS variables create unparsed declarations but have no extended colors
      const output = result.code.toString();
      expect(output).toContain('var(--my-color)');
      expect(output).toContain('var(--bg');
    });
  });

  describe('custom properties', () => {
    it('should NOT transform colors in custom properties without @property', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          :root {
            --my-color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // Custom properties without @property are not transformed
      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should transform colors in custom properties with @property syntax: "<color>"', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          @property --my-color {
            syntax: "<color>";
            inherits: false;
            initial-value: black;
          }
          :root {
            --my-color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // With @property defining it as a color, it should be transformed
      expect(result.code.toString()).toContain('#4c2f27');
      expect(result.code.toString()).not.toContain('--my-color:acajou');
    });

    it('should NOT transform custom properties with non-color @property syntax', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          @property --my-ident {
            syntax: "<custom-ident>";
            inherits: false;
            initial-value: none;
          }
          :root {
            --my-ident: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // Not a color syntax, so should not be transformed
      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should handle mixed custom properties (some with @property, some without)', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          @property --theme-color {
            syntax: "<color>";
            inherits: true;
            initial-value: black;
          }
          :root {
            --theme-color: acajou;
            --other-value: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      const output = result.code.toString();
      // --theme-color should be transformed (has @property with color syntax)
      expect(output).toContain('--theme-color:#4c2f27');
      // --other-value should NOT be transformed (no @property)
      expect(output).toContain('--other-value:acajou');
    });

    it('should NOT transform custom properties with @property syntax: "*"', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          @property --my-value {
            syntax: "*";
            inherits: false;
          }
          :root {
            --my-value: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // Universal syntax "*" is not a color, should not be transformed
      expect(result.code.toString()).toContain('acajou');
      expect(result.code.toString()).not.toContain('#4c2f27');
    });

    it('should NOT transform custom property with color syntax but standard CSS color value', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          @property --theme-color {
            syntax: "<color>";
            inherits: false;
            initial-value: black;
          }
          :root {
            --theme-color: red;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      // Standard CSS color "red" is not an extended color, no transformation needed
      const output = result.code.toString();
      expect(output).toContain('--theme-color');
      // Should not contain "acajou" or any extended color hex
      expect(output).not.toContain('acajou');
    });
  });

  describe('mixed contexts', () => {
    it('should only transform color in mixed rule', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          .test {
            animation: acajou 2s;
            color: acajou;
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      const output = result.code.toString();
      // Color property should be transformed
      expect(output).toContain('color:#4c2f27');
      // Animation should keep the name (may be reordered by minification)
      expect(output).toMatch(/animation:[^;]*acajou/);
    });

    it('should handle keyframes with color inside', () => {
      const result = transform({
        filename: 'test.css',
        minify: true,
        code: Buffer.from(`
          @keyframes acajou {
            0% { color: acajou; }
            100% { color: zomp; }
          }
        `),
        visitor: extendedNamedColorsPlugin(),
      });

      const output = result.code.toString();
      // Keyframe name should be preserved
      expect(output).toContain('@keyframes acajou');
      // Colors inside should be transformed
      expect(output).toContain('#4c2f27');
      expect(output).toContain('#39a78e');
    });
  });
});
