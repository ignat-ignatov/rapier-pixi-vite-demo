/**
 * Global Configuration Constants & Unit Conversion Utilities
 * 
 * Physics engines (like Rapier) calculate movement in real-world metric units (meters, kilograms, seconds),
 * whereas rendering engines (like Pixi.js) position visual objects using screen pixels.
 * This file establishes the fixed ratio and conversion helper functions between the two coordinate spaces.
 */

export const CONFIG = {
  width: 800,  // Canvas width in pixels
  height: 600, // Canvas height in pixels
  ppm: 30      // Pixels Per Meter (PPM) ratio: 30 pixels = 1 physics meter
};

/**
 * Converts screen pixels to physics meters.
 * Example: 30px / 30 = 1.0 meter
 * 
 * @param {number} pixels - Coordinate or measurement in pixels
 * @returns {number} Distance in physics meters
 */
export function toMeters(pixels) {
  return pixels / CONFIG.ppm;
}

/**
 * Converts physics meters back to screen pixels.
 * Example: 1.0 meter * 30 = 30px
 * 
 * @param {number} meters - Distance or coordinate in physics meters
 * @returns {number} Position in screen pixels
 */
export function toPixels(meters) {
  return meters * CONFIG.ppm;
}