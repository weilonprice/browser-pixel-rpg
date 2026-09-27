// Enemy Raider & Monster Classes (Bandits, Goblins, Wolves)

import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor(x, y, type = 'bandit') {
    super(x, y, 20, 22);
    this.type = type;
    this.speed = type === 'wolf' ? 75 : 55;
    this.health = type === 'goblin' ? 35 : type === 'wolf' ? 45 : 60;
    this.maxHealth = this.health;
    this.damage = type === 'bandit' ? 12 : 8;

    this.direction = 'down';
    this.animTimer = 0;
    this.animFrame = 0;
    this.attackCooldown = 0;
  }

  takeDamage(amount, game) {
    super.takeDamage(amount);
    if (this.isDead) {
      this.onKilled(game);
    }
  }

  onKilled(game) {
    // Drop loot
    const goldDrop = Math.floor(10 + Math.random() * 20);
    const woodDrop = Math.floor(2 + Math.random() * 5);
    game.resources.gold += goldDrop;
    game.resources.wood += woodDrop;

    game.sound.playCoin();
    game.particles.addFloatingText(`+${goldDrop} 🪙`, this.x, this.y - 12, '#f1c40f');
    game.particles.emitWoodChips(this.x, this.y, 12);
  }

  update(dt, game) {
    if (this.isDead) return;

    this.animTimer += dt * 5;
    this.animFrame = this.animTimer % 1;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    // Find closest target (Player, Villagers, or Town Center)
    let target = game.player;
    let minDist = Math.hypot(game.player.x - this.x, game.player.y - this.y);

    // Also check villagers
    for (const v of game.villagers) {
      if (v.isDead) continue;
      const dist = Math.hypot(v.x - this.x, v.y - this.y);
      if (dist < minDist) {
        minDist = dist;
        target = v;
      }
    }

    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 22) {
        // Move towards target
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
        this.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      } else if (this.attackCooldown <= 0) {
        // Attack target
        this.attackCooldown = 1.0;
        target.takeDamage(this.damage);
        game.sound.playSlash();
        game.particles.addFloatingText(`-${this.damage}`, target.x, target.y - 10, '#e74c3c');
        game.particles.emitSparks(target.x, target.y, 6);
      }
    }
  }

  render(ctx, art) {
    art.drawEnemy(ctx, this.x, this.y, this.type, this.direction, this.animFrame);

    // Health Bar above enemy head
    if (this.health < this.maxHealth) {
      const barW = 20;
      const barH = 3;
      const barX = this.x - barW / 2;
      const barY = this.y - 28;

      ctx.fillStyle = '#000';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      ctx.fillStyle = '#c0392b';
      const pct = Math.max(0, this.health / this.maxHealth);
      ctx.fillRect(barX, barY, barW * pct, barH);
    }
  }
}
