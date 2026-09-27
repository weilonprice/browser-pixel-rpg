// Harvestable Tree & Rock Resources

import { Entity } from './Entity.js';

export class Tree extends Entity {
  constructor(x, y, variant = 'pine') {
    super(x, y, 32, 44);
    this.variant = variant;
    this.health = 3;
    this.maxHealth = 3;
    this.isDepleted = false;
    this.hitShake = 0;
  }

  chop(game) {
    if (this.isDepleted) return;

    this.health--;
    this.hitShake = 4;
    game.sound.playChop();
    game.particles.emitWoodChips(this.x, this.y - 12, 10);

    // Yield wood
    game.resources.wood += 2;
    game.particles.addFloatingText('+2 Wood', this.x, this.y - 20, '#d49b42');
    game.questSystem.onGatherWood(2);

    if (this.health <= 0) {
      this.isDepleted = true;
      game.resources.wood += 4; // bonus on felling
      game.particles.addFloatingText('+4 Wood!', this.x, this.y - 24, '#f1c40f');
      game.questSystem.onGatherWood(4);
    }
  }

  update(dt) {
    if (this.hitShake > 0) {
      this.hitShake -= dt * 20;
      if (this.hitShake < 0) this.hitShake = 0;
    }
  }

  render(ctx, art) {
    const shake = this.hitShake > 0 ? (Math.sin(this.hitShake * 10) * 3) : 0;
    if (this.isDepleted) {
      art.drawTreeStump(ctx, this.x - 16, this.y - 20);
    } else if (this.variant === 'pine') {
      art.drawPineTree(ctx, this.x - 16, this.y - 36, shake);
    } else {
      art.drawOakTree(ctx, this.x - 16, this.y - 36, shake);
    }
  }
}

export class Rock extends Entity {
  constructor(x, y) {
    super(x, y, 32, 28);
    this.health = 4;
    this.maxHealth = 4;
    this.isDepleted = false;
    this.hitShake = 0;
  }

  mine(game) {
    if (this.isDepleted) return;

    this.health--;
    this.hitShake = 4;
    game.sound.playMine();
    game.particles.emitSparks(this.x, this.y - 6, 8);

    // Yield stone
    game.resources.stone += 1;
    game.particles.addFloatingText('+1 Stone', this.x, this.y - 16, '#95a5a6');

    if (this.health <= 0) {
      this.isDepleted = true;
      game.resources.stone += 3;
      game.particles.addFloatingText('+3 Stone!', this.x, this.y - 20, '#bdc3c7');
    }
  }

  update(dt) {
    if (this.hitShake > 0) {
      this.hitShake -= dt * 20;
      if (this.hitShake < 0) this.hitShake = 0;
    }
  }

  render(ctx, art) {
    if (this.isDepleted) return;
    const shake = this.hitShake > 0 ? (Math.sin(this.hitShake * 10) * 2) : 0;
    art.drawRock(ctx, this.x - 16, this.y - 16, shake);
  }
}
