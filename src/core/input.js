/**
 * Interactive Input & Pointer Dragging Module
 * 
 * Translates screen pointer coordinates into physics world coordinates,
 * toggling rigid body types between Dynamic and Kinematic to allow smooth dragging.
 */

import RAPIER from '@dimforge/rapier2d-compat';
import { toMeters } from '../config.js';

// State tracking for active dragging interactions
let draggedBody = null;
let isDragging = false;

/**
 * Registers global stage pointer listeners to track mouse movement and release events.
 * 
 * @param {import('pixi.js').Application} app - The Pixi Application instance
 * @param {RAPIER.World} world - The Rapier physics world instance
 */
export function setupDragInteraction(app, world) {
  // Make the entire stage interactive across the full screen area
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  // Global move listener: updates the kinematic target position while dragging
  app.stage.on('globalpointermove', (event) => {
    if (!isDragging || !draggedBody) return;

    // Convert mouse pixel coordinates into physics meters
    const mouseX = toMeters(event.global.x);
    const mouseY = toMeters(event.global.y);

    // Command Rapier to move the kinematic body smoothly to the cursor position
    draggedBody.setNextKinematicTranslation({ x: mouseX, y: mouseY });
  });

  // Global mouse-up listener: handles releasing the shape anywhere on screen
  window.addEventListener('pointerup', () => {
    if (isDragging && draggedBody) {
      // Revert body type back to Dynamic so gravity and forces take over again
      draggedBody.setBodyType(RAPIER.RigidBodyType.Dynamic);

      // Reset internal tracking references
      draggedBody = null;
      isDragging = false;
    }
  });
}

/**
 * Makes an individual visual shape interactive and grabbable with pointer clicks.
 * 
 * @param {import('pixi.js').Graphics} graphic - The visual shape container
 * @param {RAPIER.RigidBody} body - The matching physical body instance
 */
export function makeDraggable(graphic, body) {
  graphic.eventMode = 'static';
  graphic.cursor = 'pointer';

  // Mouse down on shape: switch body to Kinematic so user can control position directly
  graphic.on('pointerdown', (event) => {
    isDragging = true;
    draggedBody = body;

    // Kinematic bodies do not react to gravity or momentum while being held
    draggedBody.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased);
  });
}