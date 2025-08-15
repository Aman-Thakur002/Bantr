/**
 * Converts a hex color string to an RGB object.
 * @param {string} hex - The hex color string (e.g., "#RRGGBB").
 * @returns {{r: number, g: number, b: number} | null} An object with r, g, b values, or null if invalid.
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts a hex color string to a CSS rgb string "r, g, b".
 * @param {string} hex - The hex color string.
 * @returns {string | null} A string "r, g, b" or null if invalid.
 */
export function hexToRgbString(hex) {
    const rgb = hexToRgb(hex);
    return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : null;
}
