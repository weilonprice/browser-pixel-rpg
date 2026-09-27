// Player Hero Character with 8-Way Movement, Chopping, and Combat

import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 20, 24);
    this.speed = CONFIG.PLAYER.SPEED;
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;

    this.direction = 'down';
    this.state = 'idle'; // 'idle', 'walk', 'swing'
    this.animTimer = 0;
    this.animFrame = 0;

    this.currentTool = 'axe'; // 'axe' or 'sword'
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.28;

    this.interactCooldown = 0;
  }

  update(dt, game) {
    if (this.interactCooldown > 0) this.interactCooldown -= dt;

    // Handle Attack / Swing Animation
    if (this.isAttacking) {
      this.attackTimer += dt;
      this.animFrame = this.attackTimer / this.attackDuration;
      if (this.attackTimer >= this.attackDuration) {
        this.isAttacking = false;
        this.attackTimer = 0;
        this.state = 'idle';
      }
      return; // pause movement while executing swing
    }

    const move = game.input.movement;
    const isMoving = move.x !== 0 || move.y !== 0;

    if (isMoving) {
      this.state = 'walk';
      this.animTimer += dt * 8;
      this.animFrame = this.animTimer % 1;

      // Update facing direction
      if (Math.abs(move.x) > Math.abs(move.y)) {
        this.direction = move.x > 0 ? 'right' : 'left';
      } else {
        this.direction = move.y > 0 ? 'down' : 'up';
      }

      // Smooth collision movement with sliding
      const dx = move.x * this.speed * dt;
      const dy = move.y * this.speed * dt;

      this.moveWithCollision(dx, dy, game.tilemap, game.buildings);
    } else {
      this.state = 'idle';
      this.animTimer += dt * 2;
      this.animFrame = (Math.sin(this.animTimer) + 1) / 2;
    }

    // Trigger attack on Space or Left-Click (when not placing a building)
    if ((game.input.isKeyJustPressed('Space') || (game.input.mouse.justPressed && !game.buildingSystem.isPlacing)) && !this.isAttacking && this.interactCooldown <= 0) {
      this.performAction(game);
    }
  }

  moveWithCollision(dx, dy, tilemap, buildings) {
    // Try X movement
    const newX = this.x + dx;
    if (!this.checkCollisionAt(newX, this.y, tilemap, buildings)) {
      this.x = newX;
    }
    // Try Y movement
    const newY = this.y + dy;
    if (!this.checkCollisionAt(this.x, newY, tilemap, buildings)) {
      this.y = newY;
    }
  }

  checkCollisionAt(x, y, tilemap, buildings) {
    const halfW = 8;
    const halfH = 6;
    const footY = y + 4;

    // Check corners
    const corners = [
      { x: x - halfW, y: footY - halfH },
      { x: x + halfW, y: footY - halfH },
      { x: x - halfW, y: footY + halfH },
      { x: x + halfW, y: footY + halfH }
    ];

    // Check map boundaries
    if (x < 24 || x > 1000 || y < 24 || y > 1000) return true;

    return false;
  }

  performAction(game) {
    this.isAttacking = true;
    this.attackTimer = 0;
    this.state = 'swing';
    this.interactCooldown = 0.25;

    // Check interaction target in front of player
    const reach = 36;
    let targetX = this.x;
    let targetY = this.y;

    if (this.direction === 'right') targetX += reach;
    else if (this.direction === 'left') targetX -= reach;
    else if (this.direction === 'down') targetY += reach;
    else if (this.direction === 'up') targetY -= reach;

    // If mouse was clicked, also allow targeting near mouse world pos
    if (game.input.mouse.justPressed) {
      const mouseDist = Math.hypot(game.input.mouse.worldX - this.x, game.input.mouse.worldY - this.y);
      if (mouseDist < 60) {
        targetX = game.input.mouse.worldX;
        targetY = game.input.mouse.worldY;
      }
    }

    // 1. Check for Trees to Chop
    let choppedTree = false;
    for (const tree of game.trees) {
      if (tree.isDepleted) continue;
      const dist = Math.hypot(targetX - tree.x, targetY - tree.y);
      if (dist < 32) {
        this.currentTool = 'axe';
        tree.chop(game);
        choppedTree = true;
        break;
      }
    }

    if (choppedTree) return;

    // 2. Check for Rocks to Mine
    let minedRock = false;
    for (const rock of game.rocks) {
      if (rock.isDepleted) continue;
      const dist = Math.hypot(targetX - rock.x, targetY - rock.y);
      if (dist < 30) {
        this.currentTool = 'axe';
        rock.mine(game);
        minedRock = true;
        break;
      }
    }

    if (minedRock) return;

    // 3. Check for Enemies to Attack (Sword Slash)
    this.currentTool = 'sword';
    game.sound.playSlash();
    let hitEnemy = false;

    for (const enemy of game.enemies) {
      if (enemy.isDead) continue;
      const dist = Math.hypot(targetX - enemy.x, targetY - enemy.y);
      if (dist < 36) {
        enemy.takeDamage(CONFIG.PLAYER.DAMAGE, game);
        game.sound.playHit();
        game.particles.emitSparks(enemy.x, enemy.y, 8);
        game.particles.addFloatingText(`-${CONFIG.PLAYER.DAMAGE}`, enemy.x, enemy.y - 12, '#ff4444');
        hitEnemy = true;
        break;
      }
    }

    if (!hitEnemy) {
      game.particles.emitWoodChips(targetX, targetY, 4);
    }
  }

  render(ctx, art) {
    art.drawHero(ctx, this.x, this.y, this.state, this.direction, this.animFrame, this.currentTool);
  }
}
