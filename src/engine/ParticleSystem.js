// Particle System for Woodchips, Sparks, Smoke, and Floating RPG Text

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.projectiles = [];
  }

  emitWoodChips(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30, // upward pop
        gravity: 160,
        color: Math.random() > 0.5 ? '#d29649' : '#8c5529',
        size: 2 + Math.random() * 2,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        type: 'chip'
      });
    }
  }

  emitSparks(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 90;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: 200,
        color: Math.random() > 0.4 ? '#fcd036' : '#ff7a22',
        size: 2,
        life: 0.3 + Math.random() * 0.25,
        maxLife: 0.5,
        type: 'spark'
      });
    }
  }

  emitSmoke(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: -20 - Math.random() * 15,
      gravity: -5, // buoyancy
      color: '#e0dcd3',
      size: 4 + Math.random() * 3,
      life: 0.8 + Math.random() * 0.6,
      maxLife: 1.4,
      type: 'smoke'
    });
  }

  addFloatingText(text, x, y, color = '#ffeb3b') {
    this.floatingTexts.push({
      text,
      x: x + (Math.random() - 0.5) * 10,
      y: y - 10,
      vy: -35,
      color,
      life: 1.0,
      maxLife: 1.0
    });
  }

  spawnArrow(startX, startY, targetX, targetY, damage = 15, onHit = null) {
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    const speed = 280;

    this.projectiles.push({
      x: startX,
      y: startY,
      targetX,
      targetY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      distRemaining: dist,
      angle: Math.atan2(dy, dx),
      damage,
      onHit
    });
  }

  update(dt) {
    // Update regular particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      if (p.type === 'smoke') {
        p.size += dt * 3;
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const step = Math.hypot(proj.vx * dt, proj.vy * dt);
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.distRemaining -= step;

      if (proj.distRemaining <= 0) {
        if (proj.onHit) proj.onHit(proj.targetX, proj.targetY, proj.damage);
        this.emitWoodChips(proj.targetX, proj.targetY, 4);
        this.projectiles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // Render particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(Math.round(p.x), Math.round(p.y), p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.size), Math.round(p.size));
      }
      ctx.restore();
    }

    // Render projectiles (Arrows)
    for (const proj of this.projectiles) {
      ctx.save();
      ctx.translate(Math.round(proj.x), Math.round(proj.y));
      ctx.rotate(proj.angle);
      
      // Arrow shaft
      ctx.strokeStyle = '#5a3517';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#b0b8c4';
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(2, -3);
      ctx.lineTo(2, 3);
      ctx.fill();

      // Feathers
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -2, 2, 4);

      ctx.restore();
    }

    // Render floating RPG text with crisp dark outline
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 12px "Cinzel", monospace, sans-serif';
      ctx.textAlign = 'center';
      
      // Dark outline
      ctx.strokeStyle = '#100a04';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, Math.round(ft.x), Math.round(ft.y));

      // Crisp text color
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
      ctx.restore();
    }
  }
}
