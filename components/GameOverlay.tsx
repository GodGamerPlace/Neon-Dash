import React from 'react';
import { GameState, Difficulty } from '../types';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Star, Shield, Zap, Skull, Flame, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';

interface GameOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  progress: number; // 0 to 100
  onStart: () => void;
  onRestart: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  gameState,
  score,
  highScore,
  difficulty,
  setDifficulty,
  progress,
  onStart,
  onRestart,
  isMuted,
  toggleMute,
}) => {
  
  const difficulties = Object.values(Difficulty);

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY: return 'text-cyan-400';
      case Difficulty.NORMAL: return 'text-lime-400';
      case Difficulty.HARD: return 'text-pink-500';
      case Difficulty.EXTREME: return 'text-purple-500';
      case Difficulty.DEMON: return 'text-red-600';
    }
  };

  const getDifficultyBg = (diff: Difficulty) => {
     switch (diff) {
      case Difficulty.EASY: return 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/50';
      case Difficulty.NORMAL: return 'bg-lime-500 hover:bg-lime-400 shadow-lime-500/50';
      case Difficulty.HARD: return 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/50';
      case Difficulty.EXTREME: return 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/50';
      case Difficulty.DEMON: return 'bg-red-600 hover:bg-red-500 shadow-red-600/50';
    }
  };

  const cycleDifficulty = (direction: 'next' | 'prev') => {
    if (gameState === GameState.PLAYING) return;
    const currentIndex = difficulties.indexOf(difficulty);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % difficulties.length;
    } else {
      newIndex = (currentIndex - 1 + difficulties.length) % difficulties.length;
    }
    setDifficulty(difficulties[newIndex]);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 md:p-6 z-10 select-none">
      
      {/* Header / HUD */}
      <div className="w-full flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tighter" style={{ textShadow: '0 0 10px rgba(0, 243, 255, 0.5)' }}>
            NEON DASH
          </h1>
          <div className="text-white font-mono text-[10px] md:text-xs opacity-50 flex items-center gap-2">
            v1.3
            {gameState !== GameState.PLAYING && <span className="hidden md:inline text-[10px] bg-white/10 px-1 rounded">SELECT DIFFICULTY ↗</span>}
          </div>
        </div>
        
        {/* Progress Bar (Visible during Play) */}
        {gameState === GameState.PLAYING && (
          <div className="absolute left-1/2 top-4 md:top-8 -translate-x-1/2 w-1/2 md:w-1/3 h-1.5 md:h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div 
              className={`h-full bg-gradient-to-r transition-all duration-300 ease-linear ${
                difficulty === Difficulty.DEMON ? 'from-red-900 via-red-500 to-orange-500' : 'from-cyan-500 via-lime-400 to-pink-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        <div className="flex items-center gap-3 md:gap-6">
          {/* Difficulty Selector in HUD */}
          <div className="flex flex-col items-end">
             <span className="text-[8px] md:text-[10px] text-slate-400 font-bold tracking-widest mb-1">DIFFICULTY</span>
             <div className="flex items-center gap-1 md:gap-2 bg-slate-800/80 backdrop-blur rounded-lg p-1 border border-white/5">
                <button 
                  onClick={() => cycleDifficulty('prev')}
                  disabled={gameState === GameState.PLAYING}
                  className="p-1 hover:bg-white/10 rounded text-slate-400 disabled:opacity-30"
                >
                  <ChevronLeft size={14} className="md:w-4 md:h-4" />
                </button>
                <div className={`w-14 md:w-20 text-center font-black text-xs md:text-sm ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </div>
                <button 
                  onClick={() => cycleDifficulty('next')}
                  disabled={gameState === GameState.PLAYING}
                  className="p-1 hover:bg-white/10 rounded text-slate-400 disabled:opacity-30"
                >
                  <ChevronRight size={14} className="md:w-4 md:h-4" />
                </button>
             </div>
          </div>

          <div className="flex flex-col items-end">
             <span className="text-[8px] md:text-[10px] text-cyan-300 font-bold tracking-widest mb-1">SCORE</span>
             <span className="text-xl md:text-2xl font-mono text-white leading-none tracking-tighter">{Math.floor(score)}</span>
          </div>

          <button 
            onClick={toggleMute}
            className="p-1.5 md:p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/80 text-cyan-400 transition-all border border-cyan-500/30 backdrop-blur-sm"
          >
            {isMuted ? <VolumeX size={16} className="md:w-5 md:h-5" /> : <Volume2 size={16} className="md:w-5 md:h-5" />}
          </button>
        </div>
      </div>

      {/* Center Content based on State */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md pointer-events-auto">
        
        {gameState === GameState.START && (
          <div className="bg-slate-900/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,243,255,0.15)] text-center animate-fade-in-up w-[90%] md:w-full">
            <div className="mb-4 md:mb-6 flex justify-center">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg flex items-center justify-center animate-bounce ${getDifficultyBg(difficulty)}`}>
                {difficulty === Difficulty.EASY && <Shield className="text-white w-8 h-8 md:w-10 md:h-10" />}
                {difficulty === Difficulty.NORMAL && <Zap className="text-white w-8 h-8 md:w-10 md:h-10" />}
                {difficulty === Difficulty.HARD && <Skull className="text-white w-8 h-8 md:w-10 md:h-10" />}
                {difficulty === Difficulty.EXTREME && <Flame className="text-white w-8 h-8 md:w-10 md:h-10" />}
                {difficulty === Difficulty.DEMON && <AlertTriangle className="text-white w-8 h-8 md:w-10 md:h-10" />}
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">READY?</h2>
            <p className={`font-mono text-xs md:text-sm mb-6 md:mb-8 ${getDifficultyColor(difficulty)}`}>
              MODE: {difficulty}
            </p>
            
            <button
              onClick={onStart}
              className={`group relative w-full py-3 md:py-4 text-white font-black text-lg md:text-xl rounded-xl transition-all hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center gap-3 ${getDifficultyBg(difficulty)}`}
            >
              <Play fill="currentColor" size={20} className="md:w-6 md:h-6" /> 
              <span>START RUN</span>
            </button>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="bg-slate-900/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-pink-500/30 shadow-[0_0_50px_rgba(255,0,170,0.15)] text-center animate-fade-in-up w-[90%] md:w-full">
            <h2 className="text-4xl md:text-5xl font-black text-pink-500 mb-2 tracking-widest italic" style={{ textShadow: '0 0 20px rgba(255, 0, 170, 0.5)' }}>CRASHED</h2>
            <div className="text-slate-400 mb-6 text-xs md:text-sm font-mono">{Math.floor(progress)}% COMPLETE</div>
            
            <div className="grid grid-cols-2 gap-4 my-6 md:my-8">
              <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-white/10">
                <div className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-wider mb-1">Score</div>
                <div className="text-2xl md:text-3xl font-mono text-white">{Math.floor(score)}</div>
              </div>
              <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-yellow-500/20">
                <div className="text-[8px] md:text-[10px] text-yellow-500/80 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                   <Trophy size={10} /> Best
                </div>
                <div className="text-2xl md:text-3xl font-mono text-yellow-400">{Math.floor(highScore)}</div>
              </div>
            </div>

            <button
              onClick={onRestart}
              className="w-full py-3 md:py-4 bg-white hover:bg-slate-200 text-black font-black text-lg rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> RETRY LEVEL
            </button>
          </div>
        )}

        {gameState === GameState.WIN && (
          <div className="bg-slate-900/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-yellow-500/50 shadow-[0_0_60px_rgba(255,234,0,0.2)] text-center animate-fade-in-up w-[90%] md:w-full">
            <div className="mb-4 flex justify-center">
              <Star className="text-yellow-400 fill-current animate-spin-slow md:w-16 md:h-16" size={48} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-yellow-400 mb-2 tracking-widest" style={{ textShadow: '0 0 20px rgba(255, 234, 0, 0.6)' }}>COMPLETE!</h2>
            <p className="text-yellow-100/80 mb-6 md:mb-8 font-mono text-sm">You conquered {difficulty} mode!</p>
            
            <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-yellow-500/20 mb-6 md:mb-8">
               <div className="text-xs text-yellow-500/80 uppercase tracking-wider mb-1">Final Score</div>
               <div className="text-3xl md:text-4xl font-mono text-white">{Math.floor(score)}</div>
            </div>

            <button
              onClick={onRestart}
              className="w-full py-3 md:py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-xl transition-all hover:shadow-[0_0_30px_rgba(255,234,0,0.4)] flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> PLAY AGAIN
            </button>
          </div>
        )}

      </div>

      {/* Footer Instructions */}
      <div className="text-slate-500 text-[10px] md:text-xs font-mono tracking-widest opacity-50 text-center">
        [SPACE] OR [TAP] TO JUMP
      </div>
    </div>
  );
};

export default GameOverlay;