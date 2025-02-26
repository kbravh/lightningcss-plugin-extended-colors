import { Plugin } from 'lightningcss';
import extendedColors from './data/extended-colors.json';
import crayolaColors from './data/crayola.json';

/**
 * Color source types
 */
export enum ColorSource {
  EXTENDED = 'extended',
  CRAYOLA = 'crayola',
  ALL = 'all'
}

/**
 * Plugin options
 */
export interface ExtendedNamedColorsOptions {
  /**
   * Which color sources to include
   * @default ColorSource.ALL
   */
  sources?: ColorSource | ColorSource[];
}

/**
 * Create a LightningCSS plugin that adds support for extended named colors
 * 
 * @param options Plugin options
 * @returns LightningCSS plugin
 */
export default function extendedNamedColorsPlugin(
  options: ExtendedNamedColorsOptions = {}
): Plugin {
  // Default to including all color sources
  const sources = options.sources || ColorSource.ALL;
  
  // Build the color map based on the selected sources
  const colorMap: Record<string, string> = {};
  
  // Helper function to determine if a source should be included
  const includeSource = (source: ColorSource): boolean => {
    if (sources === ColorSource.ALL) return true;
    if (Array.isArray(sources)) return sources.includes(source);
    return sources === source;
  };
  
  // Add extended colors if selected
  if (includeSource(ColorSource.EXTENDED)) {
    Object.entries(extendedColors).forEach(([name, value]) => {
      colorMap[name] = value;
    });
  }
  
  // Add Crayola colors if selected
  if (includeSource(ColorSource.CRAYOLA)) {
    Object.entries(crayolaColors).forEach(([name, value]) => {
      colorMap[name] = value;
    });
  }
  
  return {
    name: 'lightningcss-plugin-extended-named-colors',
    visitor: {
      // TODO: Implement the actual color transformation logic
      // This will need to hook into LightningCSS's visitor API
      // to transform named colors to their hex values
    }
  };
}