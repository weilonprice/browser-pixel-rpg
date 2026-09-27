// Dynamic Day/Night Cycle with Ambient Lighting & Radial Light Sources

import { CONFIG } from '../config.js';

export class DayNightCycle {
  constructor(game) {
    this.game = game;
    this.time = 0.1; // 0.0 = morning start
    this.dayCount = 1;
    this.duration = CONFIG.DAY_CYCLE.DURATION;
    this.currentPhase = 'day'; // 'morning', 'afternoon', 'dusk', 'night', 'dawn'

    this.raidTriggered = false;
    this.dawnTriggered = false;
  }

  update(dt) {
    this.time += dt / this.duration;
    if (this.time >= 1.0) {
      this.time = 0.0;
      this.dayCount++;
      this.raidTriggered = false;
      this.dawnTriggered = false;
    }

    const prevPhase = this.currentPhase;

    if (this.time < 0.3) {
      this.currentPhase = 'morning';
    } else if (this.time < 0.6) {
      this.currentPhase = 'afternoon';
    } else if (this.time < 0.75) {
      this.currentPhase = 'dusk';
    } else if (this.time < 0.95) {
      this.currentPhase = 'night';
    } else {
      this.currentPhase = 'dawn';
    }

    // Trigger Night Raid Alert at Dusk
    if (this.currentPhase === 'dusk' && !this.raidTriggered) {
      this.raidTriggered = true;
      this.game.sound.playWarHorn();
      this.game.ui.showRaidAlert();
    }

    // Spawn Enemy Waves at Night
    if (this.currentPhase === 'night' && prevPhase !== 'night') {
      this.game.spawnNightRaid(this.dayCount);
    }

    // Trigger Dawn Victory Fanfare
    if (this.currentPhase === 'dawn' && !this.dawnTriggered) {
      this.dawnTriggered = true;
      this.game.sound.playDawnTrumpet();
      this.game.onDawnVictory();
    }
  }

  getAmbientColor() {
    // Return darkness alpha and color
    if (this.currentPhase === 'morning') {
      return { r: 255, g: 240, b: 200, a: 0.0 };
    } else if (this.currentPhase === 'afternoon') {
      return { r: 255, g: 255, b: 255, a: 0.0 };
    } else if (this.currentPhase === 'dusk') {
      const progress = (this.time - 0.6) / 0.15;
      return { r: 230, g: 110, b: 50, a: progress * 0.35 };
    } else if (this.currentPhase === 'night') {
      return { r: 12, g: 18, b: 42, a: 0.78 };
    } else {
      // dawn transition
      const progress = 1.0 - ((this.time - 0.95) / 0.05);
      return { r: 240, g: 170, b: 90, a: progress * 0.4 };
    }
  }

  renderLighting(ctx, camera, lightSources) {
    const ambient = this.getAmbientColor();
    if (ambient.a <= 0.02) return; // No darkness during broad daylight

    ctx.save();
    
    // We create a lighting mask over the viewport
    const bounds = camera.getVisibleBounds();
    const w = bounds.right - bounds.left;
    const h = bounds.bottom - bounds.top;

    // Use an offscreen canvas or compositing destination-out
    // For fast 60fps in browser canvas:
    // Create darkness layer
    const darknessCanvas = document.createElement('canvas');
    darknessCanvas.width = ctx.canvas.width;
    darknessCanvas.height = ctx.canvas.height;
    const dctx = darknessCanvas.getContext('2d');

    // Fill darkness
    dctx.fillStyle = `rgba(${ambient.r}, ${ambient.g}, ${ambient.b}, ${ambient.a})`;
    dctx.fillRect(0, 0, darknessCanvas.width, darknessCanvas.height);

    // Cut out light circles using 'destination-out'
    dctx.globalCompositeOperation = 'destination-out';

    for (const light of lightSources) {
      const screenPos = camera.worldToScreen(light.x, light.y);
      const radius = light.radius * camera.zoom;

      const grad = dctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, radius
      );
      grad.addColorStop(0, `rgba(0, 0, 0, ${light.intensity || 1.0})`);
      grad.addColorStop(0.5, `rgba(0, 0, 0, ${(light.intensity || 1.0) * 0.6})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      dctx.fillStyle = grad;
      dctx.beginPath();
      dctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
      dctx.fill();
    }

    // Draw the composite darkness back to the main screen
    ctx.restore(); // back to screen space
    ctx.drawImage(darknessCanvas, 0, 0);
    camera.applyTransform(ctx); // reapply camera
  }
}
