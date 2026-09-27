// Real-Time Kingdom Minimap (Matching Image 4 Bottom Right)

import { CONFIG } from '../config.js';

export class Minimap {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.scale = canvas.width / (CONFIG.WORLD_COLS * CONFIG.TILE_SIZE);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Render Scene Map onto Minimap
    if (this.game.mapCanvas) {
      ctx.drawImage(this.game.mapCanvas, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#2f5e27';
      ctx.fillRect(0, 0, w, h);
    }

    // 6. Camera Viewport Rectangle
    const camBounds = this.game.camera.getVisibleBounds();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      camBounds.left * this.scale,
      camBounds.top * this.scale,
      (camBounds.right - camBounds.left) * this.scale,
      (camBounds.bottom - camBounds.top) * this.scale
    );

    // 7. Player Hero Star (Matching Image 4 Star Marker)
    const px = this.game.player.x * this.scale;
    const py = this.game.player.y * this.scale;

    ctx.fillStyle = '#f1c40f';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', px, py);
  }
}
