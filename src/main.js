/**
 * Master Application Entry Point
 * 
 * Coordinates module initialization, dynamic object spawning, click events,
 * continuous physics simulation stepping, coordinate syncing, and boundary cleanup.
 */

import { initRenderer, createBoxGraphic } from "./core/renderer.js";
import { initPhysics, createGround, createDynamicBox } from "./core/physics.js";
import { setupDragInteraction, makeDraggable } from "./core/input.js";
import { setupUI } from "./core/ui.js";
import { toPixels } from "./config.js";

async function bootstrap() {
  // 1. Initialize Pixi.js Renderer and Rapier Physics WASM World
  const app = await initRenderer();
  const world = await initPhysics();

  // 2. Setup HUD counters and interactive Help Modal
  const ui = setupUI(app);

  // Master tracking list storing pairs of physical bodies and visual graphics
  let physicsObjects = [];

  /**
   * Helper function to instantiate both physical body and visual graphic as a paired entity.
   */
  function spawnBox(x, y, width, height, color) {
    const body = createDynamicBox(world, x, y, width, height);
    const graphic = createBoxGraphic(app, width, height, color);

    // Attach dragging pointer event listeners
    makeDraggable(graphic, body);

    // Align initial pixel position
    graphic.x = x;
    graphic.y = y;

    // Store pair in master tracking array
    physicsObjects.push({ body, graphic });
  }

  // 3. Register global pointer drag listeners
  setupDragInteraction(app, world);

  // 4. Create Static Ground Platform (Centered near bottom of canvas)
  const groundX = 400;
  const groundY = 550;
  const groundW = 700;
  const groundH = 40;

  createGround(world, groundX, groundY, groundW, groundH);
  const groundGraphic = createBoxGraphic(app, groundW, groundH, 0x27ae60);
  groundGraphic.x = groundX;
  groundGraphic.y = groundY;

  // 5. Spawn an initial starter block
  spawnBox(400, 100, 60, 60, 0xe74c3c);

  // 6. Click empty stage background to spawn randomized dynamic boxes
  app.stage.on('pointerdown', (event) => {
    // Guard Clause: Only spawn if user clicks empty background stage (not an existing shape)
    if (event.target !== app.stage) return;

    const spawnX = event.global.x;
    const spawnY = event.global.y;

    // Randomize dimensions (between 30px and 80px) and hex colors
    const w = 30 + Math.random() * 50;
    const h = 30 + Math.random() * 50;
    const color = Math.floor(Math.random() * 0xffffff);

    spawnBox(spawnX, spawnY, w, h, color);
  });

  // 7. Master Game Loop (Executes ~60 times per second)
  app.ticker.add((ticker) => {
    // Step the Rapier physics world forward by 1 frame (~16.6ms)
    world.step();

    // Refresh HUD stats display
    ui.updateStats(ticker.FPS, physicsObjects.length);

    // Array to collect living objects that stay within playable bounds
    const aliveObjects = [];

    // Iterate through all active physics objects
    for (const item of physicsObjects) {
      // Query physical body translation (meters) and rotation (radians)
      const position = item.body.translation();
      const rotation = item.body.rotation();

      // Convert meters to screen pixel coordinates
      const pixelX = toPixels(position.x);
      const pixelY = toPixels(position.y);

      // Boundary Check: Despawn shapes that fall off screen or fly past side walls
      // 1. Below screen: Y > 700 (100px below bottom)
      // 2. Off left side: X < -100
      // 3. Off right side: X > 900
      const isOutOfBounds = pixelY > 700 || pixelX < -100 || pixelX > 900;

      if (isOutOfBounds) {
        // Destroy physical body from Rapier simulation
        world.removeRigidBody(item.body);
        // Destroy visual graphic and free WebGL memory
        item.graphic.destroy();
      } else {
        // Update visual position and rotation to match physical body
        item.graphic.x = pixelX;
        item.graphic.y = pixelY;
        item.graphic.rotation = rotation;
        
        // Retain living object for next frame
        aliveObjects.push(item);
      }
    }

    // Replace master list with array of living objects
    physicsObjects = aliveObjects;
  });
}

bootstrap();