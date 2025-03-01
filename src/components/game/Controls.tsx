
import React from 'react';
import { useGame, Direction } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Controls: React.FC = () => {
  const { 
    gameState, 
    setDirection, 
    startGame, 
    pauseGame, 
    resumeGame, 
    restartGame 
  } = useGame();
  const isMobile = useIsMobile();

  const handleDirectionChange = (direction: Direction) => {
    setDirection(direction);
  };

  const handleGameControl = () => {
    if (gameState.gameOver) {
      restartGame();
    } else if (gameState.isPaused) {
      resumeGame();
    } else if (gameState.isPlaying) {
      pauseGame();
    } else {
      startGame();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 animate-fade-in">
      {/* Game control buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <Button 
          onClick={handleGameControl}
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-sm hover:shadow-md transition-all"
        >
          {gameState.gameOver ? (
            <RotateCcw className="h-6 w-6" />
          ) : gameState.isPaused ? (
            <Play className="h-6 w-6" />
          ) : (
            <Pause className="h-6 w-6" />
          )}
        </Button>
        
        <Button
          onClick={restartGame}
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-sm hover:shadow-md transition-all"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      {/* Direction controls - only show on mobile or touch devices */}
      {isMobile && (
        <div className="grid grid-cols-3 gap-2 p-2">
          <div className="col-start-2">
            <Button
              onClick={() => handleDirectionChange('UP')}
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full shadow hover:shadow-md hover:bg-secondary active:scale-95 transition-all"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="col-start-1 row-start-2">
            <Button
              onClick={() => handleDirectionChange('LEFT')}
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full shadow hover:shadow-md hover:bg-secondary active:scale-95 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="col-start-3 row-start-2">
            <Button
              onClick={() => handleDirectionChange('RIGHT')}
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full shadow hover:shadow-md hover:bg-secondary active:scale-95 transition-all"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="col-start-2 row-start-3">
            <Button
              onClick={() => handleDirectionChange('DOWN')}
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full shadow hover:shadow-md hover:bg-secondary active:scale-95 transition-all"
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
