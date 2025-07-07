import { type PlayerColor, type ColorConstraints, DEFAULT_COLOR_CONSTRAINTS } from '../types/core-types';

/**
 * ColorManager handles dynamic player color assignment
 * Generates contrasting colors for players to ensure visual distinction
 */
export class ColorManager {
  private usedColors: Map<string, PlayerColor> = new Map();
  private constraints: ColorConstraints;

  constructor(constraints: ColorConstraints = DEFAULT_COLOR_CONSTRAINTS) {
    this.constraints = constraints;
  }

  /**
   * Assigns a unique, contrasting color to a player
   */
  assignPlayerColor(playerId: string, gameId: string): PlayerColor {
    const gameColors = this.getGameColors(gameId);
    const newColor = this.generateUniqueColor(gameColors);
    
    this.usedColors.set(`${gameId}:${playerId}`, newColor);
    return newColor;
  }

  /**
   * Generates a color that contrasts well with existing colors
   */
  private generateUniqueColor(existingColors: PlayerColor[]): PlayerColor {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const candidate = this.generateRandomColor();
      
      if (this.isColorValid(candidate, existingColors)) {
        return candidate;
      }
      
      attempts++;
    }
    
    // Fallback: use systematic hue distribution
    return this.generateSystematicColor(existingColors);
  }

  /**
   * Generates a random color within constraints
   */
  private generateRandomColor(): PlayerColor {
    let hue: number;
    let validHue = false;
    
    // Find a valid hue not in forbidden ranges
    while (!validHue) {
      hue = Math.random() * 360;
      validHue = !this.constraints.forbiddenRanges.some(range => 
        hue >= range.start && hue <= range.end
      );
    }
    
    const saturation = this.constraints.minSaturation + 
      Math.random() * (this.constraints.maxSaturation - this.constraints.minSaturation);
    
    const lightness = this.constraints.minLightness + 
      Math.random() * (this.constraints.maxLightness - this.constraints.minLightness);
    
    return this.createColorFromHSL(hue!, saturation, lightness);
  }

  /**
   * Validates if a color is sufficiently different from existing colors
   */
  private isColorValid(candidate: PlayerColor, existingColors: PlayerColor[]): boolean {
    return existingColors.every(existing => {
      const hueDiff = Math.abs(candidate.hue - existing.hue);
      const minDiff = Math.min(hueDiff, 360 - hueDiff); // Account for hue wrap-around
      return minDiff >= this.constraints.minHueDifference;
    });
  }

  /**
   * Generates a systematic color when random generation fails
   */
  private generateSystematicColor(existingColors: PlayerColor[]): PlayerColor {
    const hueStep = 360 / (existingColors.length + 1);
    let hue = 0;
    
    // Find the first valid systematic hue
    for (let i = 0; i < 12; i++) {
      hue = (i * hueStep) % 360;
      
      // Check if this hue is valid (not in forbidden ranges)
      const validHue = !this.constraints.forbiddenRanges.some(range => 
        hue >= range.start && hue <= range.end
      );
      
      if (validHue) {
        const candidate = this.createColorFromHSL(hue, 75, 55);
        if (this.isColorValid(candidate, existingColors)) {
          return candidate;
        }
      }
    }
    
    // Ultimate fallback - return a default color
    return this.createColorFromHSL(0, 75, 55);
  }

  /**
   * Creates PlayerColor from HSL values
   */
  private createColorFromHSL(hue: number, saturation: number, lightness: number): PlayerColor {
    const hex = this.hslToHex(hue, saturation, lightness);
    const name = this.generateColorName(hue, saturation, lightness);
    
    return {
      hex,
      hue,
      saturation,
      lightness,
      name
    };
  }

  /**
   * Converts HSL to hex color
   */
  private hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  /**
   * Generates a human-readable color name
   */
  private generateColorName(hue: number, saturation: number, lightness: number): string {
    const hueNames = [
      'Red', 'Orange', 'Yellow', 'Lime', 'Green', 'Teal',
      'Cyan', 'Blue', 'Purple', 'Magenta', 'Pink', 'Rose'
    ];
    
    const hueIndex = Math.floor(hue / 30);
    const baseName = hueNames[hueIndex];
    
    let modifier = '';
    if (lightness > 70) modifier = 'Light ';
    else if (lightness < 50) modifier = 'Dark ';
    
    if (saturation > 80) modifier += 'Vivid ';
    else if (saturation < 40) modifier += 'Muted ';
    
    return `${modifier}${baseName}`.trim();
  }

  /**
   * Gets all colors currently used in a game
   */
  private getGameColors(gameId: string): PlayerColor[] {
    return Array.from(this.usedColors.entries())
      .filter(([key]) => key.startsWith(`${gameId}:`))
      .map(([, color]) => color);
  }

  /**
   * Releases a player's color when they leave
   */
  releasePlayerColor(playerId: string, gameId: string): void {
    this.usedColors.delete(`${gameId}:${playerId}`);
  }

  /**
   * Gets the current color for a player
   */
  getPlayerColor(playerId: string, gameId: string): PlayerColor | null {
    return this.usedColors.get(`${gameId}:${playerId}`) || null;
  }

  /**
   * Updates constraints for color generation
   */
  updateConstraints(constraints: ColorConstraints): void {
    this.constraints = constraints;
  }

  /**
   * Converts a hex color string to a PlayerColor object
   * This is useful when a player manually picks a color.
   */
  hexToPlayerColor(hex: string): PlayerColor {
    const { r, g, b } = this.hexToRgb(hex);
    const { h, s, l } = this.rgbToHsl(r, g, b);
    const name = this.generateColorName(h, s * 100, l * 100);

    return {
      hex: hex.toUpperCase(),
      hue: h,
      saturation: s * 100,
      lightness: l * 100,
      name
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1]!, 16),
          g: parseInt(result[2]!, 16),
          b: parseInt(result[3]!, 16)
        }
      : { r: 0, g: 0, b: 0 };
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }
}

// Export a singleton instance
export const colorManager = new ColorManager(); 