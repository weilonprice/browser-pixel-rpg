// Grid-Snapping Building Placement System

import { CONFIG } from '../config.js';
import { Building } from '../entities/Building.js';

export class BuildingSystem {
  constructor(game) {
    this.game = game;
    this.isPlacing = false;
    this.selectedType = null;
  }

  startPlacement(type) {
    if (!CONFIG.BUILDINGS[type]) return;
    this.selectedType = type;
    this.isPlacing = true;
  }

  cancelPlacement() {
    this.isPlacing = false;
    this.selectedType = null;
  }

  canAfford(type) {
    const cost = CONFIG.BUILDINGS[type].cost;
    return (
      this.game.resources.wood >= cost.wood &&
      this.game.resources.stone >= cost.stone &&
      this.game.resources.gold >= cost.gold
    );
  }

  canPlaceAt(tileX, tileY, def) {
    // Check bounds
    if (tileX < 3 || tileX + def.width > CONFIG.WORLD_COLS - 3 ||
        tileY < 3 || tileY + def.height > CONFIG.WORLD_ROWS - 3) {
      return false;
    }

    // Check collision with water or blocked tiles
    for (let r = tileY; r < tileY + def.height; r++) {
      for (let c = tileX; c < tileX + def.width; c++) {
        if (this.game.tilemap.isBlocked(c, r)) return false;
      }
    }

    // Check collision with existing buildings
    for (const b of this.game.buildings) {
      if (
        tileX < b.tileX + b.tileWidth &&
        tileX + def.width > b.tileX &&
        tileY < b.tileY + b.tileHeight &&
        tileY + def.height > b.tileY
      ) {
        return false;
      }
    }

    return true;
  }

  update(dt) {
    if (!this.isPlacing) return;

    // Right click cancels
    if (this.game.input.mouse.justRightPressed || this.game.input.isKeyJustPressed('Escape')) {
      this.cancelPlacement();
      return;
    }

    // Left click attempts placement
    if (this.game.input.mouse.justPressed) {
      const def = CONFIG.BUILDINGS[this.selectedType];
      const tileX = this.game.input.mouse.tileX;
      const tileY = this.game.input.mouse.tileY;

      if (!this.canAfford(this.selectedType)) {
        this.game.particles.addFloatingText('Not enough resources!', this.game.player.x, this.game.player.y - 20, '#e74c3c');
        return;
      }

      if (this.canPlaceAt(tileX, tileY, def)) {
        // Deduct resources
        this.game.resources.wood -= def.cost.wood;
        this.game.resources.stone -= def.cost.stone;
        this.game.resources.gold -= def.cost.gold;

        // Create building
        const newBuilding = new Building(this.selectedType, tileX, tileY);
        this.game.buildings.push(newBuilding);

        // Mark tiles as blocked if solid and not cutaway
        if (newBuilding.isSolid && !newBuilding.isCutaway) {
          for (let r = tileY; r < tileY + def.height; r++) {
            for (let c = tileX; c < tileX + def.width; c++) {
              this.game.tilemap.setBlocked(c, r, true);
            }
          }
        }

        // Feedback
        this.game.sound.playBuild();
        this.game.particles.emitWoodChips(newBuilding.x, newBuilding.y, 16);
        this.game.particles.addFloatingText(`${def.name} Constructed!`, newBuilding.x, newBuilding.y - 20, '#2ecc71');

        // Quest updates
        this.game.questSystem.onBuildingConstructed(this.selectedType);

        // Reset placement
        this.cancelPlacement();
      } else {
        this.game.particles.addFloatingText('Invalid placement!', this.game.player.x, this.game.player.y - 20, '#e74c3c');
      }
    }
  }

  renderPreview(ctx, art) {
    if (!this.isPlacing || !this.selectedType) return;

    const def = CONFIG.BUILDINGS[this.selectedType];
    const tileX = this.game.input.mouse.tileX;
    const tileY = this.game.input.mouse.tileY;
    const px = tileX * CONFIG.TILE_SIZE;
    const py = tileY * CONFIG.TILE_SIZE;
    const w = def.width * CONFIG.TILE_SIZE;
    const h = def.height * CONFIG.TILE_SIZE;

    const valid = this.canPlaceAt(tileX, tileY, def) && this.canAfford(this.selectedType);

    ctx.save();
    // Grid box
    ctx.fillStyle = valid ? 'rgba(76, 217, 100, 0.4)' : 'rgba(231, 76, 60, 0.4)';
    ctx.fillRect(px, py, w, h);

    ctx.strokeStyle = valid ? '#4cd964' : '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, w, h);

    // Semi-transparent ghost building
    ctx.globalAlpha = 0.75;
    const tempBuilding = new Building(this.selectedType, tileX, tileY);
    tempBuilding.render(ctx, art, 0);

    ctx.restore();
  }
}
