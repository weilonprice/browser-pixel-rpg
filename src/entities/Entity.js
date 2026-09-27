// Base Entity Class for Y-Sorted World Simulation

export class Entity {
  constructor(x, y, width = 32, height = 32) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isDead = false;
    this.health = 100;
    this.maxHealth = 100;
  }

  // Y-Depth Sorting value: lower on the screen draws in front
  get depth() {
    return this.y;
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }

  intersects(other) {
    const a = this.getBounds();
    const b = other.getBounds();
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  update(dt, game) {}
  render(ctx, art) {}
}
