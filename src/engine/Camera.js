// Pixel-Perfect Camera with Smooth Tracking & Integer Snapping

import { CONFIG } from '../config.js';

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.zoom = CONFIG.CAMERA.DEFAULT_ZOOM;
    this.lerpSpeed = CONFIG.CAMERA.LERP_SPEED;

    this.worldWidth = CONFIG.WORLD_COLS * CONFIG.TILE_SIZE;
    this.worldHeight = CONFIG.WORLD_ROWS * CONFIG.TILE_SIZE;
  }

  follow(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }

  update(dt) {
    // Smooth interpolation towards target
    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;

    // Viewport dimensions in world space
    const halfViewW = (this.canvas.width / (2 * this.zoom));
    const halfViewH = (this.canvas.height / (2 * this.zoom));

    // Clamp within world borders
    this.x = Math.max(halfViewW, Math.min(this.worldWidth - halfViewW, this.x));
    this.y = Math.max(halfViewH, Math.min(this.worldHeight - halfViewH, this.y));
  }

  applyTransform(ctx) {
    ctx.save();
    
    // Snap to integer pixels to preserve sharp pixel art rendering
    const viewCenterX = Math.round(this.canvas.width / 2);
    const viewCenterY = Math.round(this.canvas.height / 2);
    const snapCamX = Math.round(this.x);
    const snapCamY = Math.round(this.y);

    ctx.translate(viewCenterX, viewCenterY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-snapCamX, -snapCamY);
  }

  restoreTransform(ctx) {
    ctx.restore();
  }

  screenToWorld(screenX, screenY) {
    const viewCenterX = this.canvas.width / 2;
    const viewCenterY = this.canvas.height / 2;

    const relX = (screenX - viewCenterX) / this.zoom;
    const relY = (screenY - viewCenterY) / this.zoom;

    return {
      x: this.x + relX,
      y: this.y + relY
    };
  }

  worldToScreen(worldX, worldY) {
    const viewCenterX = this.canvas.width / 2;
    const viewCenterY = this.canvas.height / 2;

    const relX = (worldX - this.x) * this.zoom;
    const relY = (worldY - this.y) * this.zoom;

    return {
      x: viewCenterX + relX,
      y: viewCenterY + relY
    };
  }

  getVisibleBounds() {
    const halfW = (this.canvas.width / (2 * this.zoom)) + 64;
    const halfH = (this.canvas.height / (2 * this.zoom)) + 64;

    return {
      left: this.x - halfW,
      right: this.x + halfW,
      top: this.y - halfH,
      bottom: this.y + halfH
    };
  }
}
