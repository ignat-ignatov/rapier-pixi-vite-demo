/**
 * Pixi.js Rendering Module
 * 
 * Handles WebGL/WebGPU application initialization, canvas mounting,
 * and primitive visual graphic generation.
 */

import { Application, Graphics } from "pixi.js";
import { CONFIG } from '../config.js';

/**
 * Asynchronously boots up the Pixi.js rendering engine and attaches the canvas to the document.
 * 
 * @returns {Promise<Application>} The initialized Pixi Application instance
 */
export async function initRenderer() {
  const app = new Application();

  // Initialize WebGL context and set viewport resolution & background color
  await app.init({
    width: CONFIG.width,
    height: CONFIG.height,
    backgroundColor: 0x2c3e50 // Dark blue slate color
  });

  // Append the newly created HTML <canvas> element to the document body
  document.body.appendChild(app.canvas);

  return app;
}

/**
 * Creates a vector rectangle visual graphic representing a box object.
 * 
 * @param {Application} app - The active Pixi application instance
 * @param {number} width - Box width in pixels
 * @param {number} height - Box height in pixels
 * @param {number} color - Hexadecimal color code (e.g., 0x3498db)
 * @returns {Graphics} The visual Pixi Graphics object
 */
export function createBoxGraphic(app, width, height, color = 0x3498db) {
  const graphic = new Graphics();

  // Draw the rectangle centered around its local origin (0, 0).
  // Centering drawing coordinates simplifies syncing position & rotation with Rapier bodies!
  graphic.rect(-width / 2, -height / 2, width, height);
  graphic.fill(color);

  // Set default low depth index so boxes render underneath UI elements
  graphic.zIndex = 1;

  // Add the graphic to Pixi's active rendering stage
  app.stage.addChild(graphic);

  return graphic;
}