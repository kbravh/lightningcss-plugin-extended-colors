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
 * Returns the transformed CSS string, or null if no changes were made.
 *
 * For unparsed declarations, LightningCSS stores values as TokenOrValue[].
 * We iterate through looking for ident tokens that match our color names,
 * and serialize everything back to a CSS string.
 */
function transformTokens(
  tokens: TokenOrValue[],
  colorMap: Record<string, string>,
): string | null {
  let hasChanges = false;
  const parts: string[] = [];

  for (const tokenOrValue of tokens) {
    if (tokenOrValue.type === 'token') {
      const token = tokenOrValue.value;
      // Check if this ident is one of our extended color names
      if (token.type === 'ident') {
        const color = colorMap[token.value];
        if (color) {
          parts.push(color);
          hasChanges = true;
          continue;
        }
      }
      parts.push(tokenToString(token));
    } else {
      // For non-token types (url, var, function), serialize them
      parts.push(tokenOrValueToString(tokenOrValue, colorMap));
    }
  }

  return hasChanges ? parts.join('') : null;
}

/**
 * Converts a raw Token to its CSS string representation.
 * These are the token types that appear in unparsed declaration values.
 */
function tokenToString(token: Record<string, unknown>): string {
  switch (token.type) {
    case 'ident':
      return token.value as string;
    case 'dimension': {
      const dim = token.value as { value: number; unit: string };
      return `${dim.value}${dim.unit}`;
    }
    case 'number':
      return String(token.value);
    case 'percentage':
      return `${token.value}%`;
    case 'hash':
    case 'id-hash':
      return `#${token.value}`;
    case 'string':
      return `"${token.value}"`;
    case 'white-space':
      return ' ';
    case 'comma':
      return ',';
    case 'delim':
      return token.value as string;
    default:
      return '';
  }
}

/**
 * Converts a TokenOrValue to its CSS string representation.
 * Handles the structured types that can appear in values (url, var, function).
 */
function tokenOrValueToString(
  tov: TokenOrValue,
  colorMap: Record<string, string>,
): string {
  switch (tov.type) {
    case 'token':
      return tokenToString(tov.value as Record<string, unknown>);
    case 'url':
      return `url("${(tov.value as { url: string }).url}")`;
    case 'var': {
      const v = tov.value as {
        name: { ident: string };
        fallback?: TokenOrValue[];
      };
      if (v.fallback && v.fallback.length > 0) {
        const fallbackStr = v.fallback
          .map((f) => tokenOrValueToString(f, colorMap))
          .join('');
        return `var(${v.name.ident}, ${fallbackStr})`;
      }
      return `var(${v.name.ident})`;
    }
    case 'function': {
      const fn = tov.value as { name: string; arguments: TokenOrValue[] };
      const argsStr = fn.arguments
        .map((arg) => tokenOrValueToString(arg, colorMap))
        .join('');
      return `${fn.name}(${argsStr})`;
    }
    default:
      // For any other types, return empty - they shouldn't appear in our context
      return '';
  }
}

/**
 * Creates the declaration handler for a specific property
 */
function createPropertyHandler(
  propertyName: string,
  colorMap: Record<string, string>,
) {
  return (decl: Declaration) => {
    // Handle unparsed declarations (when LightningCSS can't parse the value)
    if (decl.property === 'unparsed') {
      const transformed = transformTokens(decl.value.value, colorMap);
      if (transformed) {
        return {
          property: propertyName,
          raw: transformed,
        };
      }
    }
    // If already parsed or no changes needed, return undefined to keep original
    return undefined;
  };
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

  // Build declaration visitors for each color property
  const declarationVisitors: Record<
    string,
    | ((decl: Declaration) => { property: string; raw: string } | undefined)
    | ((decl: CustomProperty) => { property: string; raw: string } | undefined)
  > = {};

  for (const prop of COLOR_PROPERTIES) {
    declarationVisitors[prop] = createPropertyHandler(prop, colorMap);
  }

  // Add custom property handler for properties defined as colors via @property
  declarationVisitors.custom = (decl: CustomProperty) => {
    // Get the property name (e.g., "--my-color")
    const name = typeof decl.name === 'string' ? decl.name : String(decl.name);

    // Only transform if this property was defined as a color via @property
    if (!colorCustomProperties.has(name)) {
      return undefined;
    }

    const transformed = transformTokens(decl.value, colorMap);
    if (transformed) {
      return {
        property: name,
        raw: transformed,
      };
    }
    return undefined;
  };

  return {
    Rule: {
      property(rule: Rule & { type: 'property'; value: PropertyRule }) {
        // Track @property rules that define color syntax
        if (isColorPropertyRule(rule.value)) {
          const name =
            typeof rule.value.name === 'string'
              ? rule.value.name
              : String(rule.value.name);
          colorCustomProperties.add(name);
        }
        // Return undefined to keep the rule unchanged
        return undefined;
      },
    },
    Declaration: declarationVisitors,
  };
}
