// Tilemap World Generation & Collision Grid

import { CONFIG } from '../config.js';

export class Tilemap {
  constructor(art) {
    this.art = art;
    this.cols = CONFIG.WORLD_COLS;
    this.rows = CONFIG.WORLD_ROWS;
    this.tileSize = CONFIG.TILE_SIZE;

    this.groundTiles = []; // 2D array of tile types
    this.collisionMap = []; // 2D boolean array

    this.generateWorld();
  }

  generateWorld() {
    this.groundTiles = Array.from({ length: this.rows }, () => new Array(this.cols).fill('grass'));
    this.collisionMap = Array.from({ length: this.rows }, () => new Array(this.cols).fill(false));

    const centerCol = Math.floor(this.cols / 2);
    const centerRow = Math.floor(this.rows / 2);

    // 1. Generate Town Square Plaza (Cobblestones in center)
    for (let r = centerRow - 6; r <= centerRow + 6; r++) {
      for (let c = centerCol - 8; c <= centerCol + 8; c++) {
        this.groundTiles[r][c] = 'cobble';
      }
    }

    // 2. Generate Dirt Crossroads (Matching Image 4)
    // North-South Main Road
    for (let r = 4; r < this.rows - 4; r++) {
      for (let c = centerCol - 1; c <= centerCol + 1; c++) {
        this.groundTiles[r][c] = 'dirt';
      }
    }
    // East-West Main Road
    for (let c = 4; c < this.cols - 4; c++) {
      for (let r = centerRow - 1; r <= centerRow + 1; r++) {
        this.groundTiles[r][c] = 'dirt';
      }
    }

    // 3. Flower and Grass variations
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.groundTiles[r][c] === 'grass') {
          const rand = Math.random();
          if (rand < 0.08) {
            this.groundTiles[r][c] = 'grass_flowers_blue';
          } else if (rand < 0.15) {
            this.groundTiles[r][c] = 'grass_flowers_red';
          }
        }
      }
    }

    // 4. Perimeter River / Moat (Bordering the map)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (r <= 2 || r >= this.rows - 3 || c <= 2 || c >= this.cols - 3) {
          this.groundTiles[r][c] = 'water';
          this.collisionMap[r][c] = true;
        }
      }
    }
    // Add wooden bridges over the river on the roads
    for (let c = centerCol - 1; c <= centerCol + 1; c++) {
      this.groundTiles[0][c] = 'dirt';
      this.groundTiles[1][c] = 'dirt';
      this.groundTiles[2][c] = 'dirt';
      this.groundTiles[this.rows - 3][c] = 'dirt';
      this.groundTiles[this.rows - 2][c] = 'dirt';
      this.groundTiles[this.rows - 1][c] = 'dirt';
      this.collisionMap[0][c] = false;
      this.collisionMap[1][c] = false;
      this.collisionMap[2][c] = false;
      this.collisionMap[this.rows - 3][c] = false;
      this.collisionMap[this.rows - 2][c] = false;
      this.collisionMap[this.rows - 1][c] = false;
    }
  }

  isBlocked(tileX, tileY) {
    if (tileX < 0 || tileX >= this.cols || tileY < 0 || tileY >= this.rows) return true;
    return this.collisionMap[tileY][tileX];
  }

  setBlocked(tileX, tileY, blocked = true) {
    if (tileX >= 0 && tileX < this.cols && tileY >= 0 && tileY < this.rows) {
      this.collisionMap[tileY][tileX] = blocked;
    }
  }

  render(ctx, camera, time = 0) {
    const bounds = camera.getVisibleBounds();
    const startCol = Math.max(0, Math.floor(bounds.left / this.tileSize));
    const endCol = Math.min(this.cols - 1, Math.ceil(bounds.right / this.tileSize));
    const startRow = Math.max(0, Math.floor(bounds.top / this.tileSize));
    const endRow = Math.min(this.rows - 1, Math.ceil(bounds.bottom / this.tileSize));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const x = c * this.tileSize;
        const y = r * this.tileSize;
        const type = this.groundTiles[r][c];

        if (type === 'dirt') {
          this.art.drawDirtPathTile(ctx, x, y, this.tileSize);
        } else if (type === 'cobble') {
          this.art.drawCobblestoneTile(ctx, x, y, this.tileSize);
        } else if (type === 'water') {
          this.art.drawWaterTile(ctx, x, y, this.tileSize, time);
        } else if (type === 'grass_flowers_blue') {
          this.art.drawGrassTile(ctx, x, y, this.tileSize, 1);
        } else if (type === 'grass_flowers_red') {
          this.art.drawGrassTile(ctx, x, y, this.tileSize, 2);
        } else {
          this.art.drawGrassTile(ctx, x, y, this.tileSize, 0);
        }
      }
    }
  }
}
