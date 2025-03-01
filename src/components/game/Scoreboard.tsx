
import React from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';

const Scoreboard: React.FC = () => {
  const { gameState } = useGame();
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-2xl mx-auto p-4 gap-4 animate-fade-in">
      <div className="flex flex-col items-center md:items-start gap-1">
        <div className="text-sm text-muted-foreground">Current Score</div>
        <div className="text-4xl font-bold tracking-tight">{gameState.score}</div>
      </div>

      <div className="flex gap-3">
        {gameState.activePowerUps.map((powerUp) => (
          <Badge 
            key={powerUp.id} 
            variant="outline"
            className="flex gap-1 items-center px-3 py-1 bg-secondary/50 animate-pulse"
          >
            <Zap className="h-3 w-3" />
            <span>{powerUp.name}</span>
            {powerUp.timeLeft && (
              <span className="flex items-center ml-1">
                <Clock className="h-3 w-3 mr-1" />
                {powerUp.timeLeft}s
              </span>
            )}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col items-center md:items-end gap-1">
        <div className="text-sm text-muted-foreground">High Score</div>
        <div className="text-2xl font-semibold tracking-tight">
          {user ? user.highScore : 0}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
