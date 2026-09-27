// Diegetic UI & HUD Manager

import { CONFIG } from '../config.js';

export class UIManager {
  constructor(game) {
    this.game = game;

    // Top Bar Elements
    this.elGold = document.getElementById('res-gold');
    this.elWood = document.getElementById('res-wood');
    this.elStone = document.getElementById('res-stone');
    this.elFood = document.getElementById('res-food');
    this.elPop = document.getElementById('res-pop');
    this.elCalendarText = document.getElementById('calendar-text');
    this.elTimeBadge = document.getElementById('time-badge');

    // Quest & Objectives Elements
    this.elQuestDesc = document.getElementById('quest-desc');
    this.elQuestCheck = document.getElementById('quest-check');
    this.elTowerPct = document.getElementById('obj-tower-pct');
    this.elTowerBar = document.getElementById('obj-tower-bar');
    this.elMilitiaText = document.getElementById('obj-militia-text');
    this.elMilitiaBar = document.getElementById('obj-militia-bar');
    this.elWoodText = document.getElementById('obj-wood-text');
    this.elWoodBar = document.getElementById('obj-wood-bar');

    // Modals
    this.modalBuild = document.getElementById('modal-build');
    this.modalVillagers = document.getElementById('modal-villagers');
    this.modalQuests = document.getElementById('modal-quests');
    this.modalSettings = document.getElementById('modal-settings');

    // Alerts
    this.raidAlert = document.getElementById('raid-alert');
    this.dawnAlert = document.getElementById('dawn-alert');

    // Tooltip
    this.tooltip = document.getElementById('action-tooltip');
    this.tooltipText = document.getElementById('action-prompt');

    this.setupEventListeners();
  }

  setupEventListeners() {
    // 1. Bottom Action Buttons
    document.getElementById('btn-build').addEventListener('click', () => this.toggleModal('build'));
    document.getElementById('btn-villagers').addEventListener('click', () => this.toggleModal('villagers'));
    document.getElementById('btn-quests').addEventListener('click', () => this.toggleModal('quests'));
    document.getElementById('btn-trade').addEventListener('click', () => this.openTrade());
    document.getElementById('btn-settings').addEventListener('click', () => this.toggleModal('settings'));
    document.getElementById('btn-world-map').addEventListener('click', () => this.toggleWorldMap());

    // 2. Modal Close Buttons
    document.getElementById('close-build-btn').addEventListener('click', () => this.closeAllModals());
    document.getElementById('close-villagers-btn').addEventListener('click', () => this.closeAllModals());
    document.getElementById('close-quests-btn').addEventListener('click', () => this.closeAllModals());
    document.getElementById('close-settings-btn').addEventListener('click', () => this.closeAllModals());

    // 3. Build Card Clicks
    const buildCards = document.querySelectorAll('.build-card');
    buildCards.forEach(card => {
      card.addEventListener('click', () => {
        const buildingType = card.getAttribute('data-building');
        this.closeAllModals();
        this.game.buildingSystem.startPlacement(buildingType);
      });
    });

    // 4. Villager Role Adjustments
    document.querySelectorAll('.btn-role-add').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        this.game.villagerSystem.assignRole(role);
        this.updateVillagerModal();
      });
    });

    document.querySelectorAll('.btn-role-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        this.game.villagerSystem.unassignRole(role);
        this.updateVillagerModal();
      });
    });

    document.getElementById('btn-recruit').addEventListener('click', () => {
      this.game.villagerSystem.recruitVillager();
      this.updateVillagerModal();
    });

    // 5. Settings Controls
    document.getElementById('toggle-sfx').addEventListener('click', (e) => {
      this.game.sound.enabled = !this.game.sound.enabled;
      e.target.innerText = this.game.sound.enabled ? '🔊 Enabled' : '🔇 Muted';
    });

    document.getElementById('toggle-music').addEventListener('click', (e) => {
      const playing = this.game.sound.toggleMusic();
      e.target.innerText = playing ? '🎵 Music: Playing' : '🎵 Music: Paused';
    });

    document.getElementById('zoom-in').addEventListener('click', () => {
      this.game.camera.zoom = Math.min(CONFIG.CAMERA.MAX_ZOOM, this.game.camera.zoom + 0.3);
      document.getElementById('zoom-val').innerText = `${this.game.camera.zoom.toFixed(1)}×`;
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
      this.game.camera.zoom = Math.max(CONFIG.CAMERA.MIN_ZOOM, this.game.camera.zoom - 0.3);
      document.getElementById('zoom-val').innerText = `${this.game.camera.zoom.toFixed(1)}×`;
    });

    // Keyboard Shortcuts (B, Q, V, Esc)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyB') this.toggleModal('build');
      if (e.code === 'KeyV') this.toggleModal('villagers');
      if (e.code === 'KeyQ') this.toggleModal('quests');
      if (e.code === 'Escape') this.closeAllModals();
    });
  }

  toggleModal(modalName) {
    const target = this['modal' + modalName.charAt(0).toUpperCase() + modalName.slice(1)];
    const isCurrentlyHidden = target.classList.contains('hidden');
    this.closeAllModals();
    if (isCurrentlyHidden) {
      target.classList.remove('hidden');
      if (modalName === 'villagers') this.updateVillagerModal();
      if (modalName === 'quests') this.updateQuestModal();
    }
  }

  closeAllModals() {
    this.modalBuild.classList.add('hidden');
    this.modalVillagers.classList.add('hidden');
    this.modalQuests.classList.add('hidden');
    this.modalSettings.classList.add('hidden');
  }

  showRaidAlert() {
    this.raidAlert.classList.remove('hidden');
    setTimeout(() => {
      this.raidAlert.classList.add('hidden');
    }, 6000);
  }

  showDawnAlert() {
    this.dawnAlert.classList.remove('hidden');
    setTimeout(() => {
      this.dawnAlert.classList.add('hidden');
    }, 6000);
  }

  openTrade() {
    // Quick marketplace exchange
    if (this.game.resources.wood >= 20) {
      this.game.resources.wood -= 20;
      this.game.resources.gold += 30;
      this.game.sound.playCoin();
      this.game.particles.addFloatingText('Sold 20 Wood for 30 Gold! 🪙', this.game.player.x, this.game.player.y - 20, '#f1c40f');
    } else {
      this.game.particles.addFloatingText('Need at least 20 Wood to trade!', this.game.player.x, this.game.player.y - 20, '#e74c3c');
    }
  }

  toggleWorldMap() {
    // Toggle camera zoom between close-up and world overview
    if (this.game.camera.zoom > 1.8) {
      this.game.camera.zoom = 1.3;
      this.game.particles.addFloatingText('World Overview 🗺️', this.game.player.x, this.game.player.y - 20, '#ffffff');
    } else {
      this.game.camera.zoom = CONFIG.CAMERA.DEFAULT_ZOOM;
      this.game.particles.addFloatingText('Focus on Hero ⭐', this.game.player.x, this.game.player.y - 20, '#ffffff');
    }
    document.getElementById('zoom-val').innerText = `${this.game.camera.zoom.toFixed(1)}×`;
  }

  updateVillagerModal() {
    const sys = this.game.villagerSystem;
    document.getElementById('val-unassigned').innerText = sys.unassigned;
    document.getElementById('role-lumberjack-count').innerText = sys.roles.lumberjack;
    document.getElementById('role-farmer-count').innerText = sys.roles.farmer;
    document.getElementById('role-blacksmith-count').innerText = sys.roles.blacksmith;
    document.getElementById('role-archer-count').innerText = sys.roles.archer;
    document.getElementById('role-swordsman-count').innerText = sys.roles.swordsman;
    document.getElementById('badge-unassigned').innerText = sys.unassigned;
  }

  updateQuestModal() {
    const list = document.getElementById('quest-modal-list');
    list.innerHTML = '';
    for (const q of this.game.questSystem.quests) {
      const item = document.createElement('div');
      item.className = 'objective-item';
      item.style.marginBottom = '10px';
      item.innerHTML = `
        <div style="font-weight: bold; color: #f7d468; font-size: 14px;">${q.title} ${q.completed ? '✅ (Completed)' : ''}</div>
        <div style="font-size: 12px; color: #eedcbe; margin: 4px 0;">${q.desc}</div>
        <div style="font-size: 11px; color: #2ecc71;">Reward: +${q.reward.gold || 0} 🪙, +${q.reward.wood || 0} 🪵</div>
      `;
      list.appendChild(item);
    }
  }

  update() {
    // 1. Update Resources
    this.elGold.innerText = Math.floor(this.game.resources.gold);
    this.elWood.innerText = Math.floor(this.game.resources.wood);
    this.elStone.innerText = Math.floor(this.game.resources.stone);
    this.elFood.innerText = Math.floor(this.game.resources.food);
    this.elPop.innerText = '45/60';

    // 2. Calendar Display
    this.elCalendarText.innerText = 'Day 15, Spring';
    this.elTimeBadge.className = 'badge-day';
    this.elTimeBadge.innerText = '☀️ Spring';

    // 3. Update Quests & Objectives
    const curQuest = this.game.questSystem.getCurrentQuest();
    if (curQuest) {
      this.elQuestDesc.innerText = `${curQuest.title}: ${curQuest.desc}`;
      this.elQuestCheck.innerText = curQuest.completed ? '✓' : '';

      // Objectives progress bars
      if (curQuest.requirements.tower) {
        const cur = curQuest.requirements.tower.current;
        const tgt = curQuest.requirements.tower.target;
        const pct = Math.floor((cur / tgt) * 100);
        this.elTowerPct.innerText = `${pct}%`;
        this.elTowerBar.style.width = `${pct}%`;
      }
      if (curQuest.requirements.militia) {
        const cur = curQuest.requirements.militia.current;
        const tgt = curQuest.requirements.militia.target;
        this.elMilitiaText.innerText = `${cur}/${tgt}`;
        this.elMilitiaBar.style.width = `${Math.min(100, (cur / tgt) * 100)}%`;
      }
      if (curQuest.requirements.wood) {
        const cur = curQuest.requirements.wood.current;
        const tgt = curQuest.requirements.wood.target;
        this.elWoodText.innerText = `${cur}/${tgt}`;
        this.elWoodBar.style.width = `${Math.min(100, (cur / tgt) * 100)}%`;
      }
    }

    // 4. Update Hover Tooltip
    this.updateHoverTooltip();
  }

  updateHoverTooltip() {
    const mouse = this.game.input.mouse;
    let hovered = null;

    // Check tree hover
    for (const tree of this.game.trees) {
      if (tree.isDepleted) continue;
      const dist = Math.hypot(mouse.worldX - tree.x, mouse.worldY - tree.y);
      if (dist < 26) {
        hovered = '🪓 Left-Click to Chop Timber';
        break;
      }
    }

    // Check rock hover
    if (!hovered) {
      for (const rock of this.game.rocks) {
        if (rock.isDepleted) continue;
        const dist = Math.hypot(mouse.worldX - rock.x, mouse.worldY - rock.y);
        if (dist < 24) {
          hovered = '⚒️ Left-Click to Mine Stone';
          break;
        }
      }
    }

    // Check enemy hover
    if (!hovered) {
      for (const enemy of this.game.enemies) {
        if (enemy.isDead) continue;
        const dist = Math.hypot(mouse.worldX - enemy.x, mouse.worldY - enemy.y);
        if (dist < 26) {
          hovered = `⚔️ Attack ${enemy.type.toUpperCase()}`;
          break;
        }
      }
    }

    if (hovered && !this.game.buildingSystem.isPlacing) {
      this.tooltip.classList.remove('hidden');
      this.tooltipText.innerText = hovered;
      this.tooltip.style.left = `${mouse.screenX}px`;
      this.tooltip.style.top = `${mouse.screenY}px`;
    } else {
      this.tooltip.classList.add('hidden');
    }
  }
}
