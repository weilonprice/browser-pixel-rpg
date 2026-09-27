// Main Game Engine Coordinator

import { CONFIG } from '../config.js';
import { Camera } from './Camera.js';
import { Input } from './Input.js';
import { Sound } from './Sound.js';
import { ParticleSystem } from './ParticleSystem.js';
import { PixelArtGenerator } from '../art/PixelArtGenerator.js';
import { Tilemap } from '../world/Tilemap.js';
import { DayNightCycle } from '../world/DayNightCycle.js';
import { Player } from '../entities/Player.js';
import { Tree, Rock } from '../entities/Resources.js';
import { Building } from '../entities/Building.js';
import { Enemy } from '../entities/Enemy.js';
import { Animal, WorldProp } from '../entities/WorldObjects.js';
import { Villager } from '../entities/Villager.js';
import { BuildingSystem } from '../systems/BuildingSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { VillagerSystem } from '../systems/VillagerSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { Minimap } from '../ui/Minimap.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Core Engine Systems
    this.art = new PixelArtGenerator();
    this.camera = new Camera(this.canvas);
    this.input = new Input(this.canvas);
    this.sound = new Sound();
    this.particles = new ParticleSystem();

    // Resources (Matching Image 4 Header)
    this.resources = {
      gold: 1250,
      wood: 340,
      stone: 120,
      food: 85
    };
    this.maxPop = 60;

    // World & Systems
    this.tilemap = new Tilemap(this.art);
    this.dayCycle = new DayNightCycle(this);
    this.buildingSystem = new BuildingSystem(this);
    this.questSystem = new QuestSystem(this);
    this.villagerSystem = new VillagerSystem(this);

    // Entity Lists
    this.player = null;
    this.villagers = [];
    this.animals = [];
    this.props = [];
    this.enemies = [];
    this.buildings = [];
    this.trees = [];
    this.rocks = [];

    // UI
    this.ui = new UIManager(this);
    this.minimap = new Minimap(document.getElementById('minimap-canvas'), this);

    // Load Authentic 1024x1024 Scene Map
    this.sceneImage = new Image();
    this.sceneImage.src = 'assets/images/clean_scene_map.jpg';
    this.sceneImageLoaded = false;
    this.mapCanvas = null;

    this.sceneImage.onload = () => {
      this.sceneImageLoaded = true;
      this.mapCanvas = document.createElement('canvas');
      this.mapCanvas.width = this.sceneImage.width;
      this.mapCanvas.height = this.sceneImage.height;
      const mctx = this.mapCanvas.getContext('2d');
      mctx.drawImage(this.sceneImage, 0, 0);

      // Clean the static hero spot at (345, 442) using clean road patch from (355, 510)
      mctx.drawImage(this.sceneImage, 355, 510, 36, 42, 345, 442, 36, 42);
    };

    // Time Tracking
    this.lastTime = performance.now();
    this.totalTime = 0;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initWorld();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  initWorld() {
    // 1. Moveable Hero Character at Crossroads with Green Selection Reticle
    this.player = new Player(358, 456);
    this.camera.x = 358;
    this.camera.y = 456;

    // 2. Livestock Animals in Pasture & Pens (Matching Reference)
    this.animals = [
      new Animal(165, 395, 'cow'),
      new Animal(195, 430, 'cow'),
      new Animal(230, 385, 'sheep'),
      new Animal(210, 455, 'sheep'),
      new Animal(150, 480, 'pig'),
      new Animal(140, 440, 'chicken'),
      new Animal(250, 430, 'chicken'),
      new Animal(330, 520, 'chicken')
    ];

    // 3. World Props (Matching Kingdom Layout)
    this.props = [
      // Blacksmith & Sawmill
      new WorldProp(740, 640, 'anvil'),
      new WorldProp(780, 620, 'forge'),
      new WorldProp(705, 655, 'grindstone'),
      new WorldProp(825, 675, 'sawmill_logs'),

      // Training Grounds
      new WorldProp(770, 320, 'archery_target'),
      new WorldProp(815, 320, 'archery_target'),
      new WorldProp(750, 370, 'training_dummy'),
      new WorldProp(790, 370, 'training_dummy'),
      new WorldProp(835, 360, 'weapon_rack'),

      // Barn & Pasture
      new WorldProp(185, 360, 'hay_bale'),
      new WorldProp(205, 360, 'hay_bale'),
      new WorldProp(140, 410, 'water_trough'),

      // Crossroads & Town Plaza
      new WorldProp(405, 475, 'stone_well'),
      new WorldProp(335, 435, 'street_lamp'),
      new WorldProp(475, 445, 'street_lamp'),
      new WorldProp(340, 480, 'barrel'),
      new WorldProp(352, 492, 'crate'),

      // Tavern Interior Props
      new WorldProp(435, 275, 'tavern_table'),
      new WorldProp(390, 230, 'fireplace')
    ];

    // 4. Townsfolk / NPCs
    this.villagers = [
      new Villager(735, 630, 'blacksmith'),
      new Villager(415, 260, 'barkeep'),
      new Villager(180, 570, 'farmer'),
      new Villager(715, 350, 'guard')
    ];
  }

  start() {
    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;
      this.totalTime += dt;

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  update(dt) {
    // 1. Input update
    this.input.update(this.camera);

    // 2. Moveable Player update
    this.player.update(dt, this);

    // 3. Animal AI Wander
    for (const animal of this.animals) {
      animal.update(dt, this);
    }

    // 4. Villager AI Wander
    for (const villager of this.villagers) {
      villager.update(dt, this);
    }

    // 5. Particle System update (wood chips, sparks, floating text)
    this.particles.update(dt);

    // 6. Smooth Camera tracking
    this.camera.follow(this.player.x, this.player.y);
    this.camera.update(dt);

    // 7. Diegetic UI update
    this.ui.update();

    // End frame input triggers
    this.input.endFrame();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Camera World Transformation
    this.camera.applyTransform(ctx);

    // 2. Render Authentic 1024x1024 Kingdom Scene Map
    if (this.sceneImageLoaded && this.mapCanvas) {
      ctx.drawImage(this.mapCanvas, 0, 0);
    }

    // 3. Render all scene entities sorted by Y position for true 2.5D depth layering
    const renderables = [
      ...this.props,
      ...this.animals,
      ...this.villagers,
      this.player
    ].sort((a, b) => a.y - b.y);

    for (const entity of renderables) {
      entity.render(ctx, this.art);
    }

    // 4. Render Dynamic Particles, Wood Chips & Floating Texts
    this.particles.render(ctx);

    // 5. Restore Camera Transformation (Screen Space)
    this.camera.restoreTransform(ctx);

    // 6. Render Live Minimap
    this.minimap.render();
  }
}
