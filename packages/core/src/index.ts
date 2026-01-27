import type {
  CustomProperty,
  Declaration,
  PropertyRule,
  Rule,
  Visitor,
} from 'lightningcss';

type ColorDefinition = string | string[];

interface Colorspace {
  [colorName: string]: ColorDefinition;
}

interface PluginOptions {
  colorspaces: Colorspace[];
}

export type { ColorDefinition, Colorspace, PluginOptions };

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
 * Builds a color map from the specified colorspaces.
 * In case of color naming conflicts, later colorspaces take precedence.
 */
function buildColorMap(
  colorspaces: Colorspace[],
): Record<string, ColorDefinition> {
  let colorMap: Record<string, ColorDefinition> = {};

  for (const colorspace of colorspaces) {
    colorMap = { ...colorMap, ...colorspace };
  }

  return colorMap;
}

/**
 * Finds an extended color ident in unparsed token values.
 * Returns the color name if a single ident token matches, otherwise null.
 */
function findColorIdent(
  tokens: { type: string; value: unknown }[],
  colorMap: Record<string, ColorDefinition>,
): string | null {
  for (const tokenOrValue of tokens) {
    if (tokenOrValue.type === 'token') {
      const token = tokenOrValue.value as { type: string; value: string };
      if (token.type === 'ident' && colorMap[token.value]) {
        return token.value;
      }
    }
  }
  return null;
}

/**
 * Creates a raw declaration for a given property and CSS value string.
 */
function makeRawDeclaration(property: string, raw: string): Declaration {
  return { property, raw } as unknown as Declaration;
}

/**
 * Creates a LightningCSS plugin that adds support for extended named colors.
 */
export default function extendedColorsVisitor(
  options: PluginOptions,
): Visitor<Record<string, never>> {
  const colorMap = buildColorMap(options.colorspaces);

  // Track custom properties defined as colors via @property
  const colorCustomProperties = new Set<string>();

  const handleUnparsedDeclaration = (
    decl: Declaration,
  ): Declaration | Declaration[] | undefined => {
    if (decl.property !== 'unparsed') {
      return undefined;
    }

    const unparsed = decl.value as {
      propertyId: { property: string };
      value: { type: string; value: unknown }[];
    };
    const propertyName = unparsed.propertyId.property;

    const colorName = findColorIdent(unparsed.value, colorMap);
    if (!colorName) {
      return undefined;
    }

    const colorValue = colorMap[colorName];

    // Single string value: return one raw declaration
    if (typeof colorValue === 'string') {
      return makeRawDeclaration(propertyName, colorValue);
    }

    // Array: return multiple declarations (fallback first, modern last)
    return colorValue.map((value) => makeRawDeclaration(propertyName, value));
  };

  // Handler for custom properties
  const handleCustomProperty = (
    decl: CustomProperty,
  ): Declaration | Declaration[] | undefined => {
    // Only transform if this property was defined as a color via @property
    if (!colorCustomProperties.has(decl.name)) {
      return undefined;
    }

    const tokens = decl.value as { type: string; value: unknown }[];
    const colorName = findColorIdent(tokens, colorMap);
    if (!colorName) {
      return undefined;
    }

    const colorValue = colorMap[colorName];

    if (typeof colorValue === 'string') {
      return makeRawDeclaration(decl.name, colorValue);
    }

    return colorValue.map((value) => makeRawDeclaration(decl.name, value));
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
