// Villager Roster & Job Allocation System

import { Villager } from '../entities/Villager.js';

export class VillagerSystem {
  constructor(game) {
    this.game = game;
    this.roles = {
      lumberjack: 3,
      farmer: 2,
      blacksmith: 1,
      archer: 2,
      swordsman: 2
    };
    this.unassigned = 2;
  }

  initVillagers() {
    const centerCol = Math.floor(this.game.tilemap.cols / 2);
    const centerRow = Math.floor(this.game.tilemap.rows / 2);
    const baseX = centerCol * 32;
    const baseY = centerRow * 32;

    // Spawn starting villagers with assigned roles
    Object.keys(this.roles).forEach(role => {
      const count = this.roles[role];
      for (let i = 0; i < count; i++) {
        const vx = baseX + (Math.random() - 0.5) * 160;
        const vy = baseY + (Math.random() - 0.5) * 160;
        this.game.villagers.push(new Villager(vx, vy, role));
      }
    });

    // Spawn unassigned villagers
    for (let i = 0; i < this.unassigned; i++) {
      const vx = baseX + (Math.random() - 0.5) * 100;
      const vy = baseY + (Math.random() - 0.5) * 100;
      this.game.villagers.push(new Villager(vx, vy, 'unassigned'));
    }
  }

  assignRole(role) {
    if (this.unassigned <= 0) return;

    // Find an unassigned villager
    const villager = this.game.villagers.find(v => v.role === 'unassigned');
    if (villager) {
      villager.setRole(role);
      this.roles[role]++;
      this.unassigned--;

      if (role === 'archer' || role === 'swordsman') {
        this.game.questSystem.onMilitiaTrained();
      }

      this.game.sound.playCoin();
      this.game.particles.addFloatingText(`Assigned ${role.toUpperCase()}!`, villager.x, villager.y - 14, '#2ecc71');
    }
  }

  unassignRole(role) {
    if (this.roles[role] <= 0) return;

    // Find a villager with that role
    const villager = this.game.villagers.find(v => v.role === role);
    if (villager) {
      villager.setRole('unassigned');
      this.roles[role]--;
      this.unassigned++;
      this.game.particles.addFloatingText(`Unassigned ${role}`, villager.x, villager.y - 14, '#f39c12');
    }
  }

  recruitVillager() {
    const cost = 50;
    if (this.game.resources.gold < cost) {
      this.game.particles.addFloatingText('Need 50 Gold to recruit!', this.game.player.x, this.game.player.y - 20, '#e74c3c');
      return;
    }

    if (this.game.villagers.length >= this.game.maxPop - 1) {
      this.game.particles.addFloatingText('Population capacity reached! Build more taverns.', this.game.player.x, this.game.player.y - 20, '#e74c3c');
      return;
    }

    this.game.resources.gold -= cost;
    this.unassigned++;

    const newV = new Villager(this.game.player.x + 20, this.game.player.y + 20, 'unassigned');
    this.game.villagers.push(newV);

    this.game.sound.playCoin();
    this.game.particles.emitWoodChips(newV.x, newV.y, 8);
    this.game.particles.addFloatingText('New Villager Joined! 🧑‍🌾', newV.x, newV.y - 20, '#f1c40f');
  }
}
