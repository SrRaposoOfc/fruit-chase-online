
import React, { useEffect, useRef } from 'react';
import { useGame, Direction } from '@/context/GameContext';
import { cn } from '@/lib/utils';

const GameBoard: React.FC = () => {
  const { 
    gameState, 
    setDirection, 
    startGame, 
    pauseGame, 
    resumeGame, 
    activeSkin 
  } = useGame();
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Handle touch events for mobile controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    
    // Determine swipe direction if the movement is significant enough
    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        setDirection(diffX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        // Vertical swipe
        setDirection(diffY > 0 ? 'DOWN' : 'UP');
      }
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Set CSS variables for grid size
  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.style.setProperty('--grid-size', gameState.gridSize.toString());
    }
  }, [gameState.gridSize]);

  // Start game automatically when component mounts
  useEffect(() => {
    if (!gameState.isPlaying && !gameState.gameOver) {
      startGame();
    }
  }, [gameState.isPlaying, gameState.gameOver, startGame]);

  // Get skin class for snake cells
  const getSkinClass = (isHead: boolean) => {
    if (isHead) return 'snake-head';
    
    const skinClasses: Record<string, string> = {
      default: 'snake-cell',
      shine: 'snake-cell bg-blue-400 animate-pulse',
      rgb: 'snake-cell bg-purple-500 animate-rgb-shift',
    };
    
    return skinClasses[activeSkin] || 'snake-cell';
  };

  // Create grid cells
  const renderGrid = () => {
    const grid = [];
    
    // Create empty grid
    for (let y = 0; y < gameState.gridSize; y++) {
      for (let x = 0; x < gameState.gridSize; x++) {
        let cellType = 'grid-cell';
        
        // Check if cell is part of snake
        const isSnake = gameState.snake.findIndex(
          (segment) => segment.x === x && segment.y === y
        );
        
        if (isSnake >= 0) {
          cellType = getSkinClass(isSnake === 0); // Applies special class to head
        }
        
        // Check if cell is food
        const foodItem = gameState.food.find(
          (food) => food.x === x && food.y === y
        );
        
        if (foodItem) {
          cellType = foodItem.type === 'APPLE' ? 'apple-cell' : 'lemon-cell';
        }
        
        grid.push(
          <div key={`${x}-${y}`} className={cellType} />
        );
      }
    }
    
    return grid;
  };

  return (
    <div 
      ref={boardRef}
      className="game-grid w-full aspect-square max-w-2xl mx-auto transition-all duration-300 shadow-md"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (gameState.isPaused) {
          resumeGame();
        } else if (gameState.isPlaying) {
          pauseGame();
        } else {
          startGame();
        }
      }}
    >
      {renderGrid()}
      
      {/* Pause Overlay */}
      {gameState.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 animate-fade-in">
          <div className="text-white text-2xl font-bold">PAUSED</div>
        </div>
      )}
      
      {/* Game Over Overlay */}
      {gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 animate-fade-in">
          <div className="text-white text-3xl font-bold">GAME OVER</div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
