import React, { useRef, useEffect, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  GROUND_HEIGHT,
  PLAYER_SIZE,
  PLAYER_START_X,
  ROTATION_SPEED,
  COLOR_BG,
  COLOR_NEON_CYAN,
  COLOR_NEON_PINK,
  COLOR_NEON_LIME,
  COLOR_NEON_YELLOW,
  DIFFICULTY_SETTINGS
} from '../constants';
import { GameState, Obstacle, ObstacleType, Particle, Player, Difficulty } from '../types';
import { audioService } from '../services/audioService';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (score: React.SetStateAction<number>) => void;
  setHighScore: (score: React.SetStateAction<number>) => void;
  difficulty: Difficulty;
  setProgress: (progress: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  score, 
  setScore, 
  setHighScore,
  difficulty,
  setProgress
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  
  // Load difficulty settings
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Game Objects References
  const playerRef = useRef<Player>({
    x: PLAYER_START_X,
    y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    dy: 0,
    angle: 0,
    isGrounded: true,
    color: settings.color
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedRef = useRef<number>(settings.startSpeed);
  const bgOffsetRef = useRef<number>(0);

  // Helper: Create Particles
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  };

  // Helper: Create Win Fireworks
  const createConfetti = () => {
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 2.0,
        color: Math.random() > 0.5 ? COLOR_NEON_YELLOW : COLOR_NEON_PINK,
        size: Math.random() * 6 + 3
      });
    }
  };

  // Helper: Reset Game
  const resetGame = useCallback(() => {
    const freshSettings = DIFFICULTY_SETTINGS[difficulty];
    playerRef.current = {
      x: PLAYER_START_X,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      dy: 0,
      angle: 0,
      isGrounded: true,
      color: freshSettings.color
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    speedRef.current = freshSettings.startSpeed;
    scoreRef.current = 0;
    distanceRef.current = 0;
    setScore(0);
    setProgress(0);
  }, [setScore, difficulty, setProgress]);

  // Helper: Jump
  const jump = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    
    if (playerRef.current.isGrounded) {
        playerRef.current.dy = JUMP_FORCE;
        playerRef.current.isGrounded = false;
        audioService.playJump();
    }
  }, [gameState]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault(); 
        if (gameState === GameState.PLAYING) {
             jump();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (gameState === GameState.PLAYING) {
            jump();
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('mousedown', () => gameState === GameState.PLAYING && jump());
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
          canvas.removeEventListener('touchstart', handleTouchStart);
          canvas.removeEventListener('mousedown', () => gameState === GameState.PLAYING && jump());
      }
    };
  }, [gameState, jump]);

  // Watch for Start/Reset
  useEffect(() => {
    if (gameState === GameState.START) {
      resetGame();
    }
  }, [gameState, resetGame]);

  // Main Loop
  const update = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- LOGIC ---
    if (gameState === GameState.PLAYING) {
        const player = playerRef.current;
        const currentSettings = DIFFICULTY_SETTINGS[difficulty];
        
        // 1. Update Speed and Distance
        if (speedRef.current < currentSettings.maxSpeed) {
            speedRef.current += currentSettings.speedIncrement;
        }
        
        distanceRef.current += speedRef.current;
        
        // Calculate Progress
        const percent = Math.min(100, (distanceRef.current / currentSettings.levelLength) * 100);
        // Optimize: Only set progress occasionally to avoid react render spam? 
        // Actually, passing it to a ref in parent or debouncing is better, but for now we set it directly.
        // To reduce lag, we can cast to integer and check if changed.
        if (Math.floor(percent) > Math.floor((distanceRef.current - speedRef.current) / currentSettings.levelLength * 100)) {
           setProgress(percent);
        }

        // Win Condition Check
        // If we passed the level length + some buffer to clear screen
        if (distanceRef.current > currentSettings.levelLength + 800) {
            // Player runs off screen
            if (player.x < CANVAS_WIDTH + 100) {
              player.x += speedRef.current; // Run forward
            } else {
              setGameState(GameState.WIN);
              createConfetti();
              audioService.playScore(); // Reuse playScore as win sound
              setHighScore(prev => Math.max(prev, scoreRef.current));
            }
        } else {
            // Normal Physics
            player.dy += GRAVITY;
            player.y += player.dy;

            // Rotation
            if (!player.isGrounded) {
                player.angle += ROTATION_SPEED;
            } else {
                const rem = player.angle % 90;
                if (rem !== 0) {
                    player.angle = Math.round(player.angle / 90) * 90;
                }
            }

            // Floor Collision
            const floorY = CANVAS_HEIGHT - GROUND_HEIGHT - player.height;
            let onGround = false;

            if (player.y >= floorY) {
                player.y = floorY;
                player.dy = 0;
                onGround = true;
                if (!player.isGrounded) audioService.playLand();
            }

            // Platform/Block Collisions
            obstaclesRef.current.forEach(obs => {
                if (obs.type === ObstacleType.BLOCK || obs.type === ObstacleType.FLOATING_BLOCK) {
                    const pRight = player.x + player.width;
                    const pLeft = player.x;
                    const pBottom = player.y + player.height;
                    const pTop = player.y;

                    const oRight = obs.x + obs.width;
                    const oLeft = obs.x;
                    const oBottom = obs.y + obs.height;
                    const oTop = obs.y;

                    if (pRight > oLeft && pLeft < oRight && pBottom > oTop && pTop < oBottom) {
                        const overlapY = Math.min(pBottom - oTop, oBottom - pTop);
                        const overlapX = Math.min(pRight - oLeft, oRight - pLeft);

                        if (overlapY < overlapX && player.dy >= 0 && pBottom - player.dy <= oTop + 5) {
                            player.y = oTop - player.height;
                            player.dy = 0;
                            onGround = true;
                            if (!player.isGrounded) audioService.playLand();
                        } else {
                            createExplosion(player.x + player.width/2, player.y + player.height/2, player.color);
                            audioService.playCrash();
                            setGameState(GameState.GAME_OVER);
                            setHighScore(prev => Math.max(prev, scoreRef.current));
                        }
                    }
                }
            });

            player.isGrounded = onGround;
        }

        // 3. Obstacle Spawning (Only if level isn't finished)
        if (distanceRef.current < currentSettings.levelLength) {
            const spawnDistance = currentSettings.spawnMinDistance + Math.random() * currentSettings.spawnRandomness;
            const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
            
            if (!lastObstacle || (CANVAS_WIDTH - lastObstacle.x > spawnDistance)) {
                const r = Math.random();
                let type = ObstacleType.SPIKE;
                
                // Difficulty affects obstacle types slightly?
                if (difficulty === Difficulty.EASY) {
                    type = r > 0.8 ? ObstacleType.BLOCK : ObstacleType.SPIKE; // Mostly spikes
                } else if (difficulty === Difficulty.DEMON) {
                    // Demon mode: lots of spikes and floating blocks
                    type = r > 0.6 ? ObstacleType.SPIKE : (r > 0.8 ? ObstacleType.BLOCK : ObstacleType.FLOATING_BLOCK);
                } else {
                    type = r > 0.7 ? ObstacleType.BLOCK : (r > 0.85 ? ObstacleType.FLOATING_BLOCK : ObstacleType.SPIKE);
                }
                
                let newObs: Obstacle = {
                    id: Date.now(),
                    x: CANVAS_WIDTH + 100,
                    y: 0,
                    width: 0,
                    height: 0,
                    type: type,
                    passed: false
                };

                if (type === ObstacleType.SPIKE) {
                    newObs.y = CANVAS_HEIGHT - GROUND_HEIGHT - 40;
                    newObs.width = 30;
                    newObs.height = 40;
                } else if (type === ObstacleType.BLOCK) {
                    newObs.y = CANVAS_HEIGHT - GROUND_HEIGHT - 40;
                    newObs.width = 40;
                    newObs.height = 40;
                } else {
                    // Floating Block
                    newObs.y = CANVAS_HEIGHT - GROUND_HEIGHT - 90; // Higher up
                    newObs.width = 60;
                    newObs.height = 30;
                }
                
                obstaclesRef.current.push(newObs);
            }
        }

        // 4. Update Obstacles
        obstaclesRef.current.forEach(obs => {
            obs.x -= speedRef.current;
        });
        obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x + obs.width > -100);

        // 5. Check Spike Collisions
        obstaclesRef.current.forEach(obs => {
            if (obs.type === ObstacleType.SPIKE) {
                const pBox = { l: player.x + 5, r: player.x + player.width - 5, t: player.y + 5, b: player.y + player.height - 5 };
                const oBox = { l: obs.x + 5, r: obs.x + obs.width - 5, t: obs.y + 5, b: obs.y + obs.height };

                if (pBox.r > oBox.l && pBox.l < oBox.r && pBox.b > oBox.t && pBox.t < oBox.b) {
                     createExplosion(player.x + player.width/2, player.y + player.height/2, player.color);
                     audioService.playCrash();
                     setGameState(GameState.GAME_OVER);
                     setHighScore(prev => Math.max(prev, scoreRef.current));
                }
            }
        });

        // 6. Score
        scoreRef.current += speedRef.current * 0.05;
        setScore(scoreRef.current);
    }
    
    // Win Animation State Logic
    if (gameState === GameState.WIN) {
         // Maybe just some confetti update here
    }

    // Update Particles (Always run for explosions)
    particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.2;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);


    // --- RENDER ---
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    bgOffsetRef.current = (bgOffsetRef.current - speedRef.current * 0.5) % 40;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = bgOffsetRef.current; x < CANVAS_WIDTH; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) { ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); }
    ctx.stroke();

    // Floor
    const floorY = CANVAS_HEIGHT - GROUND_HEIGHT;
    const levelColor = DIFFICULTY_SETTINGS[difficulty].color;
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = levelColor;
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, floorY, CANVAS_WIDTH, GROUND_HEIGHT);
    ctx.strokeStyle = levelColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(CANVAS_WIDTH, floorY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Player
    if ((gameState !== GameState.GAME_OVER || particlesRef.current.length > 0) && gameState !== GameState.WIN) {
        const p = playerRef.current;
        if (gameState !== GameState.GAME_OVER) {
            ctx.save();
            ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
            ctx.rotate((p.angle * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(-p.width / 2 + 4, -p.height / 2 + 4, p.width - 8, p.height - 8);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.width / 2 + 10, -p.height / 2 + 10, p.width - 20, p.height - 20);
            ctx.restore();
        }
    }

    // Win Player (Auto Run Off)
    if (gameState === GameState.WIN && playerRef.current.x < CANVAS_WIDTH + 100) {
        // Render simple player exiting
         const p = playerRef.current;
         ctx.save();
         ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
         ctx.rotate((p.angle * Math.PI) / 180);
         ctx.fillStyle = p.color;
         ctx.shadowBlur = 15;
         ctx.shadowColor = p.color;
         ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
         ctx.restore();
    }

    // Obstacles
    obstaclesRef.current.forEach(obs => {
        ctx.shadowBlur = 10;
        if (obs.type === ObstacleType.SPIKE) {
            ctx.fillStyle = COLOR_NEON_PINK;
            ctx.shadowColor = COLOR_NEON_PINK;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width / 2, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.fill();
        } else {
            ctx.fillStyle = COLOR_NEON_LIME;
            ctx.shadowColor = COLOR_NEON_LIME;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
        ctx.shadowBlur = 0;
    });

    // Particles
    particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
    });
    
    // Win Text if in WIN state
    if (gameState === GameState.WIN) {
        // Overlay handles the UI, but we can add some fireworks here
    }

    requestRef.current = requestAnimationFrame(() => update(time));
  }, [gameState, setGameState, setScore, setHighScore, difficulty, setProgress]);


  useEffect(() => {
    requestRef.current = requestAnimationFrame((time) => update(time));
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 shadow-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full max-w-4xl max-h-[600px] object-contain bg-black"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default GameCanvas;
