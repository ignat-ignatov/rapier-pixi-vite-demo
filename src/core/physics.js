/**
 * Rapier Physics Module
 * 
 * Manages the WebAssembly-powered 2D physics world, rigid body instantiation,
 * gravity configuration, and geometric collider creation.
 */

// Import browser-compatible WebAssembly Rapier library
import RAPIER from '@dimforge/rapier2d-compat';
import { toMeters } from '../config.js';

/**
 * Asynchronously initializes the Rapier WASM engine and sets up the 2D physics world.
 * 
 * @returns {Promise<RAPIER.World>} The initialized physics world instance
 */
export async function initPhysics() {
  // Wait for the WebAssembly binary module to compile and load in the browser memory
  await RAPIER.init();

  // Define Earth standard downward gravity along the Y-axis (9.81 m/s²)
  const gravity = { x: 0.0, y: 9.81 };

  // Create and return the physical world container using our gravity vector
  const world = new RAPIER.World(gravity);
  return world;
}

/**
 * Creates a static ground or platform rigid body (immovable surface).
 * 
 * @param {RAPIER.World} world - The active Rapier physics world
 * @param {number} x - Center X position in pixels
 * @param {number} y - Center Y position in pixels
 * @param {number} width - Platform width in pixels
 * @param {number} height - Platform height in pixels
 * @returns {RAPIER.RigidBody} The created static rigid body
 */
export function createGround(world, x, y, width, height) {
  // Define a fixed (immovable) body description converted to physics meters
  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    toMeters(x),
    toMeters(y)
  );
  const body = world.createRigidBody(bodyDesc);

  // Rapier cuboid colliders require HALF-width and HALF-height extents
  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    toMeters(width / 2),
    toMeters(height / 2)
  );
  
  // Attach the collision shape to the static body
  world.createCollider(colliderDesc, body);

  return body;
}

/**
 * Creates a dynamic rigid body that reacts to gravity, mass, velocity, and collisions.
 * 
 * @param {RAPIER.World} world - The active Rapier physics world
 * @param {number} x - Initial spawn center X position in pixels
 * @param {number} y - Initial spawn center Y position in pixels
 * @param {number} width - Box width in pixels
 * @param {number} height - Box height in pixels
 * @returns {RAPIER.RigidBody} The created dynamic rigid body
 */
export function createDynamicBox(world, x, y, width, height) {
  // Define a dynamic (falling/moving) body description positioned in meters
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
    toMeters(x),
    toMeters(y)
  );
  const body = world.createRigidBody(bodyDesc);

  // Attach a cuboid collider using half-extents in meters
  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    toMeters(width / 2),
    toMeters(height / 2)
  );
  world.createCollider(colliderDesc, body);

  return body;
}