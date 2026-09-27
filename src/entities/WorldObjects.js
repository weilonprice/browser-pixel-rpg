// Specialized World Props & Livestock Animals

import { Entity } from './Entity.js';

export class Animal extends Entity {
  constructor(x, y, type = 'cow') {
    super(x, y, type === 'cow' ? 26 : type === 'sheep' ? 18 : 10, type === 'cow' ? 18 : type === 'sheep' ? 14 : 10);
    this.type = type;
    this.animTimer = Math.random() * 5;
    this.wanderTimer = 2 + Math.random() * 4;
    this.targetX = x;
    this.targetY = y;
    this.speed = type === 'chicken' ? 25 : 15;
  }

  update(dt, game) {
    this.animTimer += dt * 2;
    this.wanderTimer -= dt;

    if (this.wanderTimer <= 0) {
      this.wanderTimer = 3 + Math.random() * 5;
      const range = this.type === 'chicken' ? 40 : 60;
      this.targetX = this.x + (Math.random() - 0.5) * range;
      this.targetY = this.y + (Math.random() - 0.5) * range;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
  }

  render(ctx, art) {
    const frame = this.animTimer % 1;
    if (this.type === 'cow') {
      art.drawCow(ctx, this.x, this.y, frame);
    } else if (this.type === 'sheep') {
      art.drawSheep(ctx, this.x, this.y, frame);
    } else {
      art.drawChicken(ctx, this.x, this.y, frame);
    }
  }
}

export class WorldProp extends Entity {
  constructor(x, y, propType = 'scarecrow', variant = null) {
    super(x, y, 24, 24);
    this.propType = propType;
    this.variant = variant;
  }

  render(ctx, art) {
    switch (this.propType) {
      case 'scarecrow':
        art.drawScarecrow(ctx, this.x, this.y);
        break;
      case 'archery_target':
        art.drawArcheryTarget(ctx, this.x, this.y);
        break;
      case 'training_dummy':
        art.drawTrainingDummy(ctx, this.x, this.y);
        break;
      case 'stone_well':
        art.drawStoneWell(ctx, this.x, this.y);
        break;
      case 'handcart':
        art.drawHandcart(ctx, this.x, this.y, this.variant || 'potatoes');
        break;
    }
  }
}
