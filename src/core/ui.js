/**
 * User Interface Overlay Module (HUD & Help Modal)
 * 
 * Renders real-time performance stats (FPS counter, shape count)
 * and an interactive instructions overlay with depth z-index sorting.
 */

import { Text, TextStyle, Container, Graphics } from 'pixi.js';
import { CONFIG } from '../config.js';

/**
 * Builds and mounts all UI elements onto the stage.
 * 
 * @param {import('pixi.js').Application} app - The Pixi application instance
 * @returns {{ updateStats: Function }} Public interface to update HUD counters
 */
export function setupUI(app) {
  // Enable z-index depth sorting across the stage so UI layers stay on top
  app.stage.sortableChildren = true;

  // Typography style for HUD counters
  const textStyle = new TextStyle({
    fontFamily: 'sans-serif',
    fontSize: 14,
    fill: '#ffffff',
    fontWeight: 'bold',
  });

  // 1. Help Button (?) — Mounted in TOP-LEFT Corner
  const infoButton = new Container();
  infoButton.x = 15;
  infoButton.y = 15;
  infoButton.eventMode = 'static';
  infoButton.cursor = 'pointer';
  infoButton.zIndex = 100; // Render above physics shapes

  const buttonBg = new Graphics();
  buttonBg.circle(12, 12, 16);
  buttonBg.fill({ color: 0xffffff, alpha: 0.2 });

  const btnStyle = new TextStyle({
    fontFamily: 'sans-serif',
    fontSize: 18,
    fill: '#ffffff',
    fontWeight: 'bold',
  });
  const buttonText = new Text({ text: '?', style: btnStyle });
  buttonText.x = 7;
  buttonText.y = 1;

  infoButton.addChild(buttonBg, buttonText);
  app.stage.addChild(infoButton);

  // 2. Stats Counter Text — Mounted in TOP-RIGHT Corner
  const statsText = new Text({ text: 'FPS: 60 | Shapes: 0', style: textStyle });
  statsText.anchor.set(1, 0); // Right-aligned anchor
  statsText.x = CONFIG.width - 15;
  statsText.y = 15;
  statsText.zIndex = 100;
  app.stage.addChild(statsText);

  // 3. Modal Overlay Window (Instructions Card)
  const modalContainer = new Container();
  modalContainer.visible = false; // Hidden by default
  modalContainer.zIndex = 1000;   // Highest zIndex to sit above all gameplay elements

  // Fullscreen dark backdrop captures clicks outside the card
  const backdrop = new Graphics();
  backdrop.rect(0, 0, CONFIG.width, CONFIG.height);
  backdrop.fill({ color: 0x000000, alpha: 0.5 });
  backdrop.eventMode = 'static';
  backdrop.cursor = 'default';

  // Centered Modal Card Box Dimensions
  const cardWidth = 320;
  const cardHeight = 170;
  const cardX = (CONFIG.width - cardWidth) / 2;
  const cardY = (CONFIG.height - cardHeight) / 2;

  const cardContainer = new Container();
  cardContainer.x = cardX;
  cardContainer.y = cardY;
  cardContainer.eventMode = 'static'; // Prevents clicks on card from bubbling to backdrop

  const cardBg = new Graphics();
  cardBg.roundRect(0, 0, cardWidth, cardHeight, 12);
  cardBg.fill({ color: 0x111827, alpha: 0.98 });
  cardBg.stroke({ width: 2, color: 0x3b82f6 });

  // Modal Card Title
  const modalTitleStyle = new TextStyle({
    fontFamily: 'sans-serif',
    fontSize: 16,
    fill: '#60a5fa',
    fontWeight: 'bold',
  });
  const title = new Text({ text: '🎮 How to Interact', style: modalTitleStyle });
  title.x = 20;
  title.y = 16;

  // Modal Card Body Instructions
  const modalBodyStyle = new TextStyle({
    fontFamily: 'sans-serif',
    fontSize: 13,
    fill: '#e5e7eb',
    lineHeight: 20,
  });
  const instructions = new Text({
    text: 
      '• Click empty space to spawn shapes\n' +
      '• Click & drag shapes to move them\n' +
      '• Release shapes to let gravity act\n' +
      '• Stack shapes as high as you can!',
    style: modalBodyStyle,
  });
  instructions.x = 20;
  instructions.y = 48;

  // Close (X) Button in Top-Right Corner of Card
  const closeButton = new Container();
  closeButton.x = cardWidth - 30;
  closeButton.y = 12;
  closeButton.eventMode = 'static';
  closeButton.cursor = 'pointer';

  const closeStyle = new TextStyle({
    fontFamily: 'sans-serif',
    fontSize: 14,
    fill: '#ef4444',
    fontWeight: 'bold',
  });
  const closeText = new Text({ text: '✕', style: closeStyle });
  closeButton.addChild(closeText);

  // Assemble Card and Modal Overlay Hierarchy
  cardContainer.addChild(cardBg, title, instructions, closeButton);
  modalContainer.addChild(backdrop, cardContainer);
  app.stage.addChild(modalContainer);

  // --- Modal Event Handlers ---

  infoButton.on('pointerdown', (event) => {
    event.stopPropagation();
    modalContainer.visible = true;
  });

  closeButton.on('pointerdown', (event) => {
    event.stopPropagation();
    modalContainer.visible = false;
  });

  backdrop.on('pointerdown', (event) => {
    event.stopPropagation();
    modalContainer.visible = false;
  });

  cardContainer.on('pointerdown', (event) => {
    event.stopPropagation(); // Stops backdrop click handler
  });

  /**
   * Updates HUD statistics counter text every frame.
   * 
   * @param {number} fps - Current frames per second
   * @param {number} shapeCount - Total active physics shapes in memory
   */
  function updateStats(fps, shapeCount) {
    statsText.text = `FPS: ${Math.round(fps)} | Shapes: ${shapeCount}`;
  }

  return { updateStats };
}