// Buildings System & Cutaway Interior Rendering

import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';

export class Building extends Entity {
  constructor(type, tileX, tileY) {
    const def = CONFIG.BUILDINGS[type];
    const pixelW = def.width * CONFIG.TILE_SIZE;
    const pixelH = def.height * CONFIG.TILE_SIZE;
    const centerX = (tileX * CONFIG.TILE_SIZE) + (pixelW / 2);
    const centerY = (tileY * CONFIG.TILE_SIZE) + (pixelH / 2);

    super(centerX, centerY, pixelW, pixelH);

    this.type = type;
    this.tileX = tileX;
    this.tileY = tileY;
    this.tileWidth = def.width;
    this.tileHeight = def.height;
    this.isCutaway = !!def.isCutaway;
    this.isSolid = true;
    this.health = def.health;
    this.maxHealth = def.health;

    // Specialized properties
    this.lightRadius = def.lightRadius || (type === 'tavern' ? 140 : type === 'blacksmith' ? 120 : 0);
    this.attackRange = def.attackRange || 0;
    this.attackCooldown = def.attackCooldown || 0;
    this.attackTimer = 0;

    this.smokeTimer = 0;
    this.productionTimer = 0;
  }

  update(dt, game) {
    // 1. Chimney Smoke Generation for Tavern and Blacksmith
    if (this.type === 'tavern' || this.type === 'blacksmith') {
      this.smokeTimer += dt;
      if (this.smokeTimer >= 0.35) {
        this.smokeTimer = 0;
        const chimneyX = this.type === 'tavern' ? this.x - this.width / 2 + 26 : this.x;
        const chimneyY = this.y - this.height / 2 + 4;
        game.particles.emitSmoke(chimneyX, chimneyY);
      }
    }

    // 2. Watchtower Archer Defense: Shoots arrows at nearby night raiders!
    if (this.type === 'watchtower') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        // Find closest enemy
        let closestEnemy = null;
        let minDist = this.attackRange;

        for (const enemy of game.enemies) {
          if (enemy.isDead) continue;
          const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (dist < minDist) {
            minDist = dist;
            closestEnemy = enemy;
          }
        }

        if (closestEnemy) {
          this.attackTimer = this.attackCooldown;
          // Shoot arrow from tower platform
          game.sound.playSlash();
          game.particles.spawnArrow(
            this.x, this.y - 20,
            closestEnemy.x, closestEnemy.y,
            18,
            (hitX, hitY, dmg) => {
              if (!closestEnemy.isDead) {
                closestEnemy.takeDamage(dmg, game);
                game.sound.playHit();
                game.particles.addFloatingText(`-${dmg}`, hitX, hitY - 10, '#ffcc00');
              }
            }
          );
        }
      }
    }

    // 3. Automated Resource Production from Farm and Lumber Camp
    this.productionTimer += dt;
    if (this.productionTimer >= 4.0) {
      this.productionTimer = 0;
      if (this.type === 'farm') {
        game.resources.food += 1;
        game.particles.addFloatingText('+1 Food', this.x, this.y - 10, '#2ecc71');
      } else if (this.type === 'lumber_camp') {
        game.resources.wood += 2;
        game.particles.addFloatingText('+2 Wood', this.x, this.y - 10, '#e67e22');
      }
    }
  }

  render(ctx, art, time = 0) {
    const left = this.x - this.width / 2;
    const top = this.y - this.height / 2;

    switch (this.type) {
      case 'tavern':
        art.drawTavern(ctx, left, top, this.width, this.height, time);
        break;
      case 'barn':
        art.drawBarn(ctx, left, top, this.width, this.height);
        break;
      case 'cottage':
        art.drawCottage(ctx, left, top, this.width, this.height);
        break;
      case 'blacksmith':
        art.drawBlacksmith(ctx, left, top, this.width, this.height, time);
        break;
      case 'watchtower':
        art.drawWatchtower(ctx, left, top, this.width, this.height);
        break;
      case 'farm':
        art.drawFarm(ctx, left, top, this.width, this.height);
        break;
      case 'lumber_camp':
        art.drawLumberCamp(ctx, left, top, this.width, this.height);
        break;
      case 'wall':
        art.drawWall(ctx, left, top, CONFIG.TILE_SIZE);
        break;
      case 'street_lamp':
        art.drawStreetLamp(ctx, left, top, time);
        break;
    }
  }
}
