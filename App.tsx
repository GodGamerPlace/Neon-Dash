import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GameOverlay from './components/GameOverlay';
import { GameState, Difficulty } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0); // Used to force remount of GameCanvas

  const handleStart = () => {
    setGameState(GameState.PLAYING);
    audioService.setMute(isMuted);
  };

  const handleRestart = () => {
    setScore(0);
    setProgress(0);
    setGameId(prev => prev + 1); // Force GameCanvas to remount, resetting all physics refs
    setGameState(GameState.PLAYING);
  };

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    audioService.setMute(newState);
  };

  return (
    <div className="w-full h-[100dvh] bg-neutral-950 flex items-center justify-center overflow-hidden overscroll-none">
      {/* Container for Game - scales with aspect ratio */}
      <div className="relative w-full md:max-w-[1000px] aspect-video md:rounded-xl overflow-hidden md:shadow-[0_0_80px_rgba(0,0,0,0.8)] md:border border-white/10 bg-black">
        
        <GameCanvas 
          key={gameId} 
          gameState={gameState} 
          setGameState={setGameState}
          score={score}
          setScore={setScore}
          setHighScore={setHighScore}
          difficulty={difficulty}
          setProgress={setProgress}
        />
        
        <GameOverlay 
          gameState={gameState}
          score={score}
          highScore={highScore}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          progress={progress}
          onStart={handleStart}
          onRestart={handleRestart}
          isMuted={isMuted}
          toggleMute={toggleMute}
        />
        
      </div>

      {/* Background decoration - visible only on larger screens */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black"></div>
      
      {/* Top progress bar ambient glow */}
      <div className={`fixed top-0 left-0 w-full h-1 bg-gradient-to-r transition-colors duration-500 opacity-50 md:opacity-100 ${
        difficulty === Difficulty.DEMON ? 'from-red-600 via-orange-600 to-yellow-600' : 
        difficulty === Difficulty.EXTREME ? 'from-purple-600 via-pink-600 to-red-600' :
        'from-cyan-500 via-purple-500 to-pink-500'
      }`}></div>
    </div>
  );
};

export default App;