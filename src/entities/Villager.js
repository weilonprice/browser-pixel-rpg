// Villager NPC Class with Daily Roles & AI Schedules

import { Entity } from './Entity.js';

export class Villager extends Entity {
  constructor(x, y, role = 'lumberjack') {
    super(x, y, 18, 22);
    this.role = role;
    this.speed = 45;
    this.direction = 'down';
    this.state = 'idle';
    this.animTimer = 0;
    this.animFrame = 0;

    this.wanderTimer = Math.random() * 3;
    this.targetX = x;
    this.targetY = y;

    this.workTimer = 0;
    this.attackTimer = 0;
  }

  setRole(newRole) {
    this.role = newRole;
  }

  update(dt, game) {
    this.animTimer += dt * 4;
    this.animFrame = this.animTimer % 1;

    // Combat Behavior for Militia (Archers & Swordsmen)
    if (this.role === 'archer' || this.role === 'swordsman') {
      this.updateCombatAI(dt, game);
      return;
    }

    // Work & Wandering Behavior for Civilian Villagers
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = 3 + Math.random() * 4;
      // Pick a wander point near settlement
      const range = 80;
      this.targetX = this.x + (Math.random() - 0.5) * range;
      this.targetY = this.y + (Math.random() - 0.5) * range;
    }

    // Move toward target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 6) {
      this.state = 'walk';
      const moveStep = this.speed * dt;
      this.x += (dx / dist) * moveStep;
      this.y += (dy / dist) * moveStep;
      this.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    } else {
      this.state = 'idle';
    }

    // Periodic Resource Generation based on role
    this.workTimer += dt;
    if (this.workTimer >= 6.0) {
      this.workTimer = 0;
      if (this.role === 'lumberjack') {
        game.resources.wood += 2;
        game.particles.addFloatingText('+2 Wood', this.x, this.y - 12, '#deb887');
      } else if (this.role === 'farmer') {
        game.resources.food += 1;
        game.particles.addFloatingText('+1 Food', this.x, this.y - 12, '#2ecc71');
      } else if (this.role === 'blacksmith') {
        game.resources.stone += 1;
        game.particles.addFloatingText('+1 Stone', this.x, this.y - 12, '#95a5a6');
      }
    }
  }

  updateCombatAI(dt, game) {
    // Find nearest enemy
    let closestEnemy = null;
    let minDist = this.role === 'archer' ? 140 : 80;

    for (const enemy of game.enemies) {
      if (enemy.isDead) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < minDist) {
        minDist = dist;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      this.attackTimer -= dt;

      if (this.role === 'archer') {
        // Stand ground and shoot
        if (this.attackTimer <= 0) {
          this.attackTimer = 1.3;
          game.sound.playSlash();
          game.particles.spawnArrow(
            this.x, this.y - 8,
            closestEnemy.x, closestEnemy.y,
            12,
            (hx, hy, dmg) => {
              if (!closestEnemy.isDead) {
                closestEnemy.takeDamage(dmg, game);
                game.sound.playHit();
                game.particles.addFloatingText(`-${dmg}`, hx, hy - 8, '#ffcc00');
              }
            }
          );
        }
      } else if (this.role === 'swordsman') {
        // Charge toward enemy
        const dx = closestEnemy.x - this.x;
        const dy = closestEnemy.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 20) {
          this.x += (dx / dist) * this.speed * 1.5 * dt;
          this.y += (dy / dist) * this.speed * 1.5 * dt;
          this.direction = dx > 0 ? 'right' : 'left';
        } else if (this.attackTimer <= 0) {
          this.attackTimer = 0.8;
          game.sound.playSlash();
          closestEnemy.takeDamage(15, game);
          game.sound.playHit();
          game.particles.emitSparks(closestEnemy.x, closestEnemy.y, 6);
          game.particles.addFloatingText('-15', closestEnemy.x, closestEnemy.y - 10, '#ff4444');
        }
      }
    }
  }

  render(ctx, art) {
    art.drawVillager(ctx, this.x, this.y, this.role, this.direction, this.animFrame);
  }
}
