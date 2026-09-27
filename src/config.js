// Game Configuration & Balance Settings

export const CONFIG = {
  TILE_SIZE: 32,
  WORLD_COLS: 32,
  WORLD_ROWS: 32,
  
  CAMERA: {
    DEFAULT_ZOOM: 1.15,
    MIN_ZOOM: 0.8,
    MAX_ZOOM: 2.8,
    LERP_SPEED: 0.12
  },

  DAY_CYCLE: {
    DURATION: 120, // seconds for full day/night cycle
    MORNING_START: 0.0,
    AFTERNOON_START: 0.3,
    DUSK_START: 0.6,
    NIGHT_START: 0.75,
    DAWN_START: 0.95
  },

  PLAYER: {
    SPEED: 140, // pixels per second
    ATTACK_RANGE: 44,
    ATTACK_COOLDOWN: 0.35,
    DAMAGE: 25,
    MAX_HEALTH: 100
  },

  BUILDINGS: {
    wall: {
      id: 'wall',
      name: 'Palisade Wall',
      width: 1,
      height: 1,
      cost: { wood: 15, stone: 0, gold: 0 },
      health: 200,
      description: 'Blocks nocturnal raiders'
    },
    watchtower: {
      id: 'watchtower',
      name: 'Watchtower',
      width: 2,
      height: 2,
      cost: { wood: 40, stone: 15, gold: 0 },
      health: 350,
      attackRange: 160,
      attackCooldown: 1.2,
      damage: 18,
      description: 'Stations an archer to shoot bandits'
    },
    blacksmith: {
      id: 'blacksmith',
      name: 'Blacksmith Forge',
      width: 3,
      height: 3,
      cost: { wood: 50, stone: 40, gold: 0 },
      health: 500,
      isCutaway: true,
      description: 'Cutaway forge; upgrades militia weapons'
    },
    tavern: {
      id: 'tavern',
      name: 'Cutaway Tavern',
      width: 4,
      height: 3,
      cost: { wood: 80, stone: 0, gold: 100 },
      health: 600,
      isCutaway: true,
      description: 'Attracts new villagers & mercenaries'
    },
    farm: {
      id: 'farm',
      name: 'Wheat & Carrot Farm',
      width: 2,
      height: 2,
      cost: { wood: 25, stone: 0, gold: 20 },
      health: 150,
      description: 'Produces continuous food supply'
    },
    barn: {
      id: 'barn',
      name: 'Livestock Barn',
      width: 4,
      height: 3,
      cost: { wood: 70, stone: 20, gold: 50 },
      health: 450,
      isCutaway: true,
      description: 'Pasture barn with cows, sheep & chickens'
    },
    cottage: {
      id: 'cottage',
      name: 'Stone Cottage',
      width: 3,
      height: 3,
      cost: { wood: 40, stone: 30, gold: 40 },
      health: 400,
      description: 'Houses villagers and increases max population'
    },
    lumber_camp: {
      id: 'lumber_camp',
      name: 'Lumberjack Camp',
      width: 3,
      height: 2,
      cost: { wood: 30, stone: 0, gold: 30 },
      health: 300,
      description: 'Lumberjacks automatically chop timber'
    },
    street_lamp: {
      id: 'street_lamp',
      name: 'Lantern Post',
      width: 1,
      height: 1,
      cost: { wood: 10, stone: 0, gold: 10 },
      health: 80,
      lightRadius: 110,
      description: 'Illuminates the darkness during night raids'
    }
  },

  COLORS: {
    OUTLINE: '#1b1a17',
    GRASS_BASE: '#489c38',
    GRASS_LIGHT: '#5cb846',
    GRASS_DARK: '#337526',
    DIRT_BASE: '#c8924f',
    DIRT_LIGHT: '#deb070',
    DIRT_DARK: '#9e6e32',
    STONE_BASE: '#6b7382',
    STONE_LIGHT: '#8c95a6',
    STONE_DARK: '#474d57',
    WOOD_BASE: '#8c5529',
    WOOD_LIGHT: '#ad6e39',
    WOOD_DARK: '#5c3314',
    ROOF_RED: '#b8442e',
    ROOF_BLUE: '#386385'
  }
};
