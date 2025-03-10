import React, { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const RoomScreen: React.FC = () => {
  const { 
    gameState, 
    setDirection, 
    startGame, 
    pauseGame, 
    resumeGame, 
    restartGame,
    activeSkin,
    currentRoom,
    setInRoomView,
    rooms,
    bots
  } = useGame();
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const room = currentRoom ? rooms.find(r => r.id === currentRoom) : null;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    
    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        setDirection(diffX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        setDirection(diffY > 0 ? 'DOWN' : 'UP');
      }
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  useEffect(() => {
    if (boardRef.current && room) {
      boardRef.current.style.setProperty('--grid-size', room.gridSize.toString());
    }
  }, [room]);

  useEffect(() => {
    if (!gameState.isPlaying && !gameState.gameOver) {
      startGame();
    }
  }, [gameState.isPlaying, gameState.gameOver, startGame]);

  const getSkinClass = (isHead: boolean) => {
    if (isHead) return 'snake-head';
    
    const skinClasses: Record<string, string> = {
      default: 'snake-cell',
      shine: 'snake-cell bg-blue-400 animate-pulse',
      rgb: 'snake-cell bg-purple-500 animate-rgb-shift',
      fire: 'snake-cell bg-orange-500 animate-fire',
      ice: 'snake-cell bg-blue-300 animate-ice',
      galaxy: 'snake-cell bg-indigo-600 animate-stars',
      gold: 'snake-cell bg-yellow-500 animate-shine',
    };
    
    return skinClasses[activeSkin] || 'snake-cell';
  };

  const getBotSkinClass = (isHead: boolean, botId: number) => {
    const botColors = [
      'bg-red-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-purple-500'
    ];
    
    const colorIndex = (botId - 1) % botColors.length;
    return isHead ? `bot-head ${botColors[colorIndex]}` : `bot-cell ${botColors[colorIndex]}`;
  };

  const renderGrid = () => {
    if (!room) return [];
    
    const grid = [];
    
    for (let x = 0; x < room.gridSize; x++) {
      grid.push(
        <div 
          key={`top-wall-${x}`} 
          className="wall-cell"
          style={{
            gridColumn: x + 1,
            gridRow: 1,
          }}
        />
      );
      
      grid.push(
        <div 
          key={`bottom-wall-${x}`} 
          className="wall-cell"
          style={{
            gridColumn: x + 1,
            gridRow: room.gridSize,
          }}
        />
      );
    }
    
    for (let y = 0; y < room.gridSize; y++) {
      grid.push(
        <div 
          key={`left-wall-${y}`} 
          className="wall-cell"
          style={{
            gridColumn: 1,
            gridRow: y + 1,
          }}
        />
      );
      
      grid.push(
        <div 
          key={`right-wall-${y}`} 
          className="wall-cell"
          style={{
            gridColumn: room.gridSize,
            gridRow: y + 1,
          }}
        />
      );
    }
    
    for (let i = 0; i < gameState.snake.length; i++) {
      const segment = gameState.snake[i];
      const isHead = i === 0;
      grid.push(
        <div 
          key={`snake-${i}`} 
          className={getSkinClass(isHead)}
          style={{
            gridColumn: segment.x + 1,
            gridRow: segment.y + 1,
          }}
        />
      );
    }
    
    bots.forEach(bot => {
      bot.snake.forEach((segment, i) => {
        const isHead = i === 0;
        grid.push(
          <div 
            key={`bot-${bot.id}-${i}`} 
            className={getBotSkinClass(isHead, bot.id)}
            style={{
              gridColumn: segment.x + 1,
              gridRow: segment.y + 1,
            }}
          />
        );
      });
    });
    
    gameState.food.forEach((food, i) => {
      grid.push(
        <div 
          key={`food-${i}`} 
          className={food.type === 'APPLE' ? 'apple-cell' : 'lemon-cell'}
          style={{
            gridColumn: food.x + 1,
            gridRow: food.y + 1,
          }}
        />
      );
    });
    
    return grid;
  };

  const handleExit = () => {
    setInRoomView(false);
    
    if (currentRoom) {
      const roomToUpdate = rooms.find(r => r.id === currentRoom);
      if (roomToUpdate && roomToUpdate.players > 0) {
        roomToUpdate.players -= 1;
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      <header className="border-b bg-card shadow-sm">
        <div className="container py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleExit}
          >
            <ArrowLeft className="h-4 w-4" />
            Sair da Sala
          </Button>
          
          <div className="flex items-center gap-4">
            {room?.topPlayer && (
              <Card className="bg-muted/50 flex items-center p-2 h-9">
                <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{room.topPlayer.username}: {room.topPlayer.score}</span>
              </Card>
            )}
            
            <Card className="bg-muted/50 flex items-center p-2 h-9">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{room?.players || 0} Jogadores</span>
            </Card>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-6 flex flex-col items-center">
        <div className="flex justify-between w-full max-w-5xl mb-4">
          <Card className="bg-muted/50 p-3">
            <div className="text-sm text-muted-foreground">Pontuação</div>
            <div className="text-2xl font-bold">{gameState.score}</div>
          </Card>
          
          <div className="flex gap-2">
            {bots.map(bot => (
              <Card key={bot.id} className="bg-muted/50 p-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                <div>
                  <div className="text-xs text-muted-foreground">{bot.name}</div>
                  <div className="text-sm font-medium">{bot.score}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div 
          ref={boardRef}
          className="room-game-grid w-full max-w-5xl aspect-square relative shadow-md transition-all duration-300 bg-black/5 rounded-md"
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
          
          {gameState.isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 animate-fade-in">
              <div className="text-white text-2xl font-bold">PAUSADO</div>
            </div>
          )}
          
          {gameState.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 animate-fade-in">
              <div className="text-white text-3xl font-bold">FIM DE JOGO</div>
              <Button onClick={restartGame} size="lg" className="animate-bounce">
                Jogar Novamente
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoomScreen;
