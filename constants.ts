export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

// Physics
export const GRAVITY = 0.6;
export const JUMP_FORCE = -10.5;
export const GROUND_HEIGHT = 100;

// Player
export const PLAYER_SIZE = 30;
export const PLAYER_START_X = 100;
export const ROTATION_SPEED = 5;

// Base Game Constants (Fallbacks)
export const BASE_SPEED = 6;
export const SPEED_INCREMENT = 0.001;
export const MAX_SPEED = 12;

// Colors
export const COLOR_NEON_CYAN = '#00f3ff';
export const COLOR_NEON_PINK = '#ff00aa';
export const COLOR_NEON_LIME = '#ccff00';
export const COLOR_NEON_YELLOW = '#ffea00';
export const COLOR_NEON_RED = '#ff0000';
export const COLOR_NEON_PURPLE = '#bf00ff';
export const COLOR_BG = '#050510';

// Difficulty Configuration
export const DIFFICULTY_SETTINGS = {
  EASY: {
    label: 'EASY',
    startSpeed: 5,
    maxSpeed: 9,
    speedIncrement: 0.0005,
    spawnMinDistance: 500,
    spawnRandomness: 500,
    levelLength: 15000,
    color: '#00f3ff' // Cyan
  },
  NORMAL: {
    label: 'NORMAL',
    startSpeed: 6.5,
    maxSpeed: 12,
    speedIncrement: 0.001,
    spawnMinDistance: 380,
    spawnRandomness: 400,
    levelLength: 25000,
    color: '#ccff00' // Lime
  },
  HARD: {
    label: 'HARD',
    startSpeed: 8,
    maxSpeed: 15,
    speedIncrement: 0.002,
    spawnMinDistance: 280,
    spawnRandomness: 300,
    levelLength: 40000,
    color: '#ff00aa' // Pink
  },
  EXTREME: {
    label: 'EXTREME',
    startSpeed: 10,
    maxSpeed: 18,
    speedIncrement: 0.003,
    spawnMinDistance: 220,
    spawnRandomness: 200,
    levelLength: 60000,
    color: '#bf00ff' // Purple
  },
  DEMON: {
    label: 'DEMON',
    startSpeed: 13,
    maxSpeed: 22,
    speedIncrement: 0.004,
    spawnMinDistance: 180,
    spawnRandomness: 100,
    levelLength: 100000,
    color: '#ff0000' // Red
  }
};
