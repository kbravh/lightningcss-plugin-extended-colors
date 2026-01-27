import crayolaColors from '@lightningcss-plugin-extended-colors/crayola';
import encycolorpediaColors from '@lightningcss-plugin-extended-colors/encycolorpedia';
import legoColors from '@lightningcss-plugin-extended-colors/lego';
import { transform } from 'lightningcss';
import { describe, expect, it } from 'vitest';
import extendedColorsVisitor from '../src/index';

describe('extendedColorsVisitor', () => {
  it('should transform encycolorpedia colors', () => {
    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: acajou;
          background: zomp;
        }
      `),
      visitor: extendedColorsVisitor({ colorspaces: [encycolorpediaColors] }),
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
      visitor: extendedColorsVisitor({ colorspaces: [crayolaColors] }),
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
      visitor: extendedColorsVisitor({ colorspaces: [legoColors] }),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:#bd7d85;background:#d60026}',
    );
  });

  it('should respect the colorspace order (later wins)', () => {
    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: beaver;         /* Encycolorpedia: #9f8170, Crayola: #926f5b */
          background: wisteria;  /* Encycolorpedia: #89729e, Crayola: #c9a0dc */
        }
      `),
      visitor: extendedColorsVisitor({
        colorspaces: [encycolorpediaColors, crayolaColors],
      }),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:#926f5b;background:#c9a0dc}',
    );
  });
});

describe('custom colorspaces', () => {
  it('should support a custom colorspace object', () => {
    const myColors = {
      'brand-red': '#ff0000',
      'brand-blue': '#0000ff',
    };

    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: brand-red;
          background-color: brand-blue;
        }
      `),
      visitor: extendedColorsVisitor({ colorspaces: [myColors] }),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:red;background-color:#00f}',
    );
  });

  it('should support mixing built-in and custom colorspaces', () => {
    const myColors = {
      primary: '#0066ff',
    };

    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: primary;
          background-color: acajou;
        }
      `),
      visitor: extendedColorsVisitor({
        colorspaces: [encycolorpediaColors, myColors],
      }),
    });

    expect(result.code.toString()).toEqual(
      '.test{color:#06f;background-color:#4c2f27}',
    );
  });

  it('should allow custom colorspace to override built-in colors', () => {
    const overrides = {
      acajou: '#111111',
    };

    const result = transform({
      filename: 'test.css',
      minify: true,
      code: Buffer.from(`
        .test {
          color: acajou;
        }
      `),
      visitor: extendedColorsVisitor({
        colorspaces: [encycolorpediaColors, overrides],
      }),
    });

    expect(result.code.toString()).toEqual('.test{color:#111}');
  });
});

describe('multi-format color values (arrays)', () => {
  // LightningCSS deduplicates same-property declarations when it knows the
  // target browsers support the modern value. Setting older browser targets
  // ensures fallback declarations are preserved.
  const targets = { chrome: 50 << 16 };

  it('should output multiple declarations for array values', () => {
    const myColors = {
      fancy: ['#0066ff', 'oklch(0.6 0.2 250)'],
    };

    const result = transform({
      filename: 'test.css',
      minify: false,
      targets,
      code: Buffer.from(`
        .test {
          color: fancy;
        }
      `),
      visitor: extendedColorsVisitor({ colorspaces: [myColors] }),
    });

    const output = result.code.toString();
    // LightningCSS normalizes hex (#0066ff → #06f) and oklch values
    expect(output).toContain('color: #06f');
    expect(output).toContain('color: oklch(');
  });

  it('should output fallback first, modern last', () => {
    const myColors = {
      fancy: ['#0066ff', 'oklch(0.6 0.2 250)'],
    };

    const result = transform({
      filename: 'test.css',
      minify: true,
      targets,
      code: Buffer.from(`
        .test {
          color: fancy;
        }
      `),
      visitor: extendedColorsVisitor({ colorspaces: [myColors] }),
    });

    const output = result.code.toString();
    // Both values should appear, fallback before modern
    const fallbackIndex = output.indexOf('#06f');
    const modernIndex = output.indexOf('oklch');
    expect(fallbackIndex).toBeGreaterThan(-1);
    expect(modernIndex).toBeGreaterThan(-1);
    expect(fallbackIndex).toBeLessThan(modernIndex);
  });

  it('should handle single-string values alongside array values', () => {
    const myColors = {
      simple: '#ff0000',
      fancy: ['#0066ff', 'oklch(0.6 0.2 250)'],
    };

    const result = transform({
      filename: 'test.css',
      minify: true,
      targets,
      code: Buffer.from(`
        .test {
          color: simple;
          background-color: fancy;
        }
      `),
      visitor: extendedColorsVisitor({ colorspaces: [myColors] }),
    });

    const output = result.code.toString();
    expect(output).toContain('color:red');
    expect(output).toContain('background-color:#06f');
    expect(output).toContain('background-color:oklch(');
  });

  it('should support non-hex CSS color formats', () => {
    const myColors = {
      themed: 'oklch(0.63 0.26 29)',
    };

    const result = transform({
      filename: 'test.css',
      minify: false,
      targets,
      code: Buffer.from(`
        .test {
          color: themed;
        }
      `),
      visitor: extendedColorsVisitor({ colorspaces: [myColors] }),
    });

    const output = result.code.toString();
    // LightningCSS parses and re-serializes the raw value
    expect(output).toContain('color:');
    expect(output).not.toContain('themed');
  });

  it('should deduplicate fallbacks when targets support modern syntax', () => {
    const myColors = {
      fancy: ['#0066ff', 'oklch(0.6 0.2 250)'],
    };

    // Without targets, LightningCSS assumes modern browsers and removes fallbacks
    const result = transform({
      filename: 'test.css',
      minify: false,
      code: Buffer.from(`
        .test {
          color: fancy;
        }
      `),
      visitor: extendedColorsVisitor({ colorspaces: [myColors] }),
    });

    const output = result.code.toString();
    // Only the modern value should remain (LightningCSS deduplicates)
    expect(output).toContain('oklch(');
    expect(output).not.toContain('#06f');
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
      });

      // Standard CSS color "red" is not an extended color, no transformation needed
      const output = result.code.toString();
      expect(output).toContain('--theme-color');
      // Should not contain "acajou" or any extended color hex
      expect(output).not.toContain('acajou');
    });

    it('should transform array color values in custom properties with @property', () => {
      const myColors = {
        fancy: ['#0066ff', 'oklch(0.6 0.2 250)'],
      };

      const result = transform({
        filename: 'test.css',
        minify: true,
        targets: { chrome: 50 << 16 },
        code: Buffer.from(`
          @property --my-color {
            syntax: "<color>";
            inherits: false;
            initial-value: black;
          }
          :root {
            --my-color: fancy;
          }
        `),
        visitor: extendedColorsVisitor({ colorspaces: [myColors] }),
      });

      const output = result.code.toString();
      expect(output).toContain('--my-color:');
      expect(output).not.toContain('fancy');
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
        visitor: extendedColorsVisitor({
          colorspaces: [encycolorpediaColors],
        }),
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
