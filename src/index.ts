import type { Token } from 'lightningcss';
import crayolaColors from './data/crayola.json';
import encycolorpediaColors from './data/encycolorpedia.json';

type Colorspace = 'encycolorpedia' | 'crayola';

type VisitorOptions = {
  colorspaces?: Colorspace[];
};

const colorspaceMap: Record<Colorspace, Record<string, string>> = {
  encycolorpedia: encycolorpediaColors,
  crayola: crayolaColors,
};

/**
 * Builds a color map from the specified colorspaces
 * In case of color naming conflicts, later colorspaces take precedence
 */
function buildColorMap(colorspaces: Colorspace[]): Record<string, string> {
  let colorMap: Record<string, string> = {};

  for (const colorspace of colorspaces) {
    if (!Object.keys(colorspaceMap).includes(colorspace)) {
      throw new Error(`Invalid colorspace: ${colorspace}`);
    }

    colorMap = { ...colorMap, ...colorspaceMap[colorspace] };
  }

  return colorMap;
}

/**
 * Creates a LightningCSS plugin that adds support for extended named colors
 */
export default function extendedNamedColorsPlugin(
  options: VisitorOptions = {},
) {
  // Default to encycolorpedia if no colorspaces are specified
  const colorspaces = options.colorspaces || ['encycolorpedia'];
  const colorMap = buildColorMap(colorspaces);

  return {
    Token(token: Token) {
      if (token.type === 'ident') {
        const color = colorMap[token.value];
        if (color) {
          return { raw: color };
        }
      }
    },
  };
}
