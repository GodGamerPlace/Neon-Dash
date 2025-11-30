export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN'
}

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXTREME = 'EXTREME',
  DEMON = 'DEMON'
}

export enum ObstacleType {
  SPIKE = 'SPIKE',
  BLOCK = 'BLOCK',
  FLOATING_BLOCK = 'FLOATING_BLOCK'
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  angle: number; // In degrees
  isGrounded: boolean;
  color: string;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
