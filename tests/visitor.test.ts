import { transform } from 'lightningcss';
import { describe, expect, it } from 'vitest';
import extendedNamedColorsPlugin from '../src/index';

describe('extendedNamedColorsPlugin', () => {
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
