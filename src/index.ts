import type {
  CustomProperty,
  Declaration,
  PropertyRule,
  Rule,
  TokenOrValue,
} from 'lightningcss';
import crayolaColors from './data/crayola.json';
import encycolorpediaColors from './data/encycolorpedia.json';
import legoColors from './data/lego.json';

type Colorspace = 'encycolorpedia' | 'crayola' | 'lego';

type VisitorOptions = {
  colorspaces?: Colorspace[];
};

const colorspaceMap: Record<Colorspace, Record<string, string>> = {
  encycolorpedia: encycolorpediaColors,
  crayola: crayolaColors,
  lego: legoColors,
};

/**
 * Checks if a @property rule defines a color syntax
 */
function isColorPropertyRule(rule: PropertyRule): boolean {
  if (rule.syntax.type !== 'components') {
    return false;
  }
  return rule.syntax.value.some((component) => component.kind.type === 'color');
}

// CSS properties that accept color values
const COLOR_PROPERTIES: string[] = [
  // Direct color properties
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-bottom-color',
  'border-left-color',
  'border-right-color',
  'border-block-color',
  'border-block-start-color',
  'border-block-end-color',
  'border-inline-color',
  'border-inline-start-color',
  'border-inline-end-color',
  'outline-color',
  'text-decoration-color',
  'text-emphasis-color',
  'caret-color',
  'accent-color',
  'fill',
  'stroke',
  // Shorthand properties with color components
  'background',
  'border',
  'border-top',
  'border-bottom',
  'border-left',
  'border-right',
  'border-block',
  'border-block-start',
  'border-block-end',
  'border-inline',
  'border-inline-start',
  'border-inline-end',
  'outline',
  'text-decoration',
  'box-shadow',
  'text-shadow',
];

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
 * Transforms extended color names in a list of tokens.
 * Returns a modified TokenOrValue array with color idents replaced by hash tokens,
 * or null if no changes were made.
 *
 * For unparsed declarations, LightningCSS stores values as TokenOrValue[].
 * We iterate through looking for ident tokens that match our color names,
 * and replace them with hash tokens. LightningCSS handles serialization.
 */
function transformTokens(
  tokens: TokenOrValue[],
  colorMap: Record<string, string>,
): TokenOrValue[] | null {
  let hasChanges = false;
  const result: TokenOrValue[] = [];

  for (const tokenOrValue of tokens) {
    if (tokenOrValue.type === 'token') {
      const token = tokenOrValue.value;
      // Check if this ident is one of our extended color names
      if (token.type === 'ident') {
        const hexColor = colorMap[token.value];
        if (hexColor) {
          // Replace ident with hash token (remove # prefix for hash token value)
          result.push({
            type: 'token',
            value: { type: 'hash', value: hexColor.slice(1) },
          } as TokenOrValue);
          hasChanges = true;
          continue;
        }
      }
    }
    // Keep token unchanged - no serialization needed
    result.push(tokenOrValue);
  }

  return hasChanges ? result : null;
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

  // Track custom properties defined as colors via @property
  const colorCustomProperties = new Set<string>();

  // Handler for unparsed declarations - shared by all color properties
  const handleUnparsedDeclaration = (decl: Declaration) => {
    if (decl.property === 'unparsed') {
      const transformedTokens = transformTokens(decl.value.value, colorMap);
      if (transformedTokens) {
        return {
          property: 'unparsed',
          value: {
            propertyId: decl.value.propertyId,
            value: transformedTokens,
          },
        } as Declaration;
      }
    }
    return undefined;
  };

  // Handler for custom properties defined as colors via @property
  const handleCustomProperty = (decl: CustomProperty) => {
    // Only transform if this property was defined as a color via @property
    if (!colorCustomProperties.has(decl.name)) {
      return undefined;
    }

    const transformedTokens = transformTokens(decl.value, colorMap);
    if (transformedTokens) {
      return {
        property: 'custom',
        value: {
          name: decl.name,
          value: transformedTokens,
        },
      } as Declaration;
    }
    return undefined;
  };

  // Build declaration visitors - all color properties share the same handler
  const declarationVisitors: Record<string, unknown> = {};
  for (const prop of COLOR_PROPERTIES) {
    declarationVisitors[prop] = handleUnparsedDeclaration;
  }
  declarationVisitors.custom = handleCustomProperty;

  return {
    Rule: {
      property(rule: Rule & { type: 'property'; value: PropertyRule }) {
        // Track @property rules that define color syntax
        if (isColorPropertyRule(rule.value)) {
          colorCustomProperties.add(rule.value.name);
        }
        // Return undefined to keep the rule unchanged
        return undefined;
      },
    },
    Declaration: declarationVisitors,
  };
}
