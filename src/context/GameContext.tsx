
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Types
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type CellType = 'EMPTY' | 'SNAKE' | 'APPLE' | 'LEMON';

export interface Cell {
  x: number;
  y: number;
  type: CellType;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  price: number;
  effect: string;
  duration?: number;
  active?: boolean;
  timeLeft?: number;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  className: string;
}

interface GameState {
  snake: Cell[];
  food: Cell[];
  direction: Direction;
  nextDirection: Direction;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  speed: number;
  gridSize: number;
  activePowerUps: PowerUp[];
  playersOnline: number;
}

interface GameContextType {
  gameState: GameState;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  setDirection: (direction: Direction) => void;
  availablePowerUps: PowerUp[];
  availableSkins: Skin[];
  buyPowerUp: (powerUpId: string) => void;
  buySkin: (skinId: string) => void;
  activatePowerUp: (powerUpId: string) => void;
  changeSkin: (skinId: string) => void;
  activeSkin: string;
  leaderboard: { username: string; highScore: number; totalScore: number }[];
  rooms: { id: number; players: number; maxPlayers: number }[];
  joinRoom: (roomId: number) => void;
  currentRoom: number | null;
}

// Initial game state
const initialGameState: GameState = {
  snake: [{ x: 5, y: 5, type: 'SNAKE' }],
  food: [],
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  score: 0,
  gameOver: false,
  isPaused: false,
  isPlaying: false,
  speed: 150,
  gridSize: 20,
  activePowerUps: [],
  playersOnline: 0,
};

// Available power-ups
const powerUps: PowerUp[] = [
  {
    id: 'lemon',
    name: 'Lemon Boost',
    description: 'Earn 5 points per apple for 10 seconds',
    price: 100,
    effect: 'pointBoost',
    duration: 10,
  },
  {
    id: 'timeFreeze',
    name: 'Time Freeze',
    description: 'Become immune to collisions for 5 seconds',
    price: 200,
    effect: 'immunity',
    duration: 5,
  },
  {
    id: 'multipleApples',
    name: 'Apple Feast',
    description: 'Increases apples on the board',
    price: 150,
    effect: 'moreFood',
  },
  {
    id: 'speedBoost',
    name: 'Speed Boost',
    description: 'Move faster for 15 seconds',
    price: 120,
    effect: 'speed',
    duration: 15,
  },
];

// Available skins
const skins: Skin[] = [
  {
    id: 'default',
    name: 'Classic Snake',
    description: 'The original snake skin',
    price: 0,
    className: 'bg-snake',
  },
  {
    id: 'shine',
    name: 'Shining Snake',
    description: 'A shimmering snake skin',
    price: 300,
    className: 'bg-blue-400 animate-pulse',
  },
  {
    id: 'rgb',
    name: 'RGB Snake',
    description: 'The ultimate color-shifting snake',
    price: 1000,
    className: 'bg-purple-500 animate-rgb-shift',
  },
];

// Mock leaderboard data
const mockLeaderboard = [
  { username: 'player1', highScore: 120, totalScore: 1500 },
  { username: 'player2', highScore: 95, totalScore: 2100 },
  { username: 'snake_master', highScore: 200, totalScore: 4500 },
  { username: 'apple_eater', highScore: 150, totalScore: 3200 },
  { username: 'gamer123', highScore: 85, totalScore: 1700 },
];

// Mock room data
const mockRooms = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  players: Math.floor(Math.random() * 15),
  maxPlayers: 20,
}));

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameInterval, setGameInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeSkin, setActiveSkin] = useState<string>('default');
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [rooms, setRooms] = useState(mockRooms);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);

  // Get purchased power-ups and skins
  const availablePowerUps = powerUps.filter(
    (powerUp) => !user?.purchasedPowerUps.includes(powerUp.id)
  );
  
  const availableSkins = skins.filter(
    (skin) => !user?.purchasedSkins.includes(skin.id)
  );

  // Initialize game
  useEffect(() => {
    if (user) {
      setActiveSkin(user.activeSkin);
      // Simulate random players online
      setGameState((prev) => ({
        ...prev,
        playersOnline: Math.floor(Math.random() * 50) + 10,
      }));
    }
  }, [user]);

  // Generate food
  const generateFood = useCallback(() => {
    const numApples = gameState.snake.length > 10 ? 2 : 1;
    const newFood: Cell[] = [];

    for (let i = 0; i < numApples; i++) {
      let newFoodCell: Cell;
      let validPosition = false;

      while (!validPosition) {
        const x = Math.floor(Math.random() * gameState.gridSize);
        const y = Math.floor(Math.random() * gameState.gridSize);
        
        // Check if position is occupied by snake or existing food
        const isOccupied = gameState.snake.some(segment => segment.x === x && segment.y === y) ||
                          newFood.some(food => food.x === x && food.y === y);
        
        if (!isOccupied) {
          validPosition = true;
          // 10% chance for lemon when score > 20
          const isLemon = gameState.score > 20 && Math.random() < 0.1;
          newFoodCell = { 
            x, 
            y, 
            type: isLemon ? 'LEMON' : 'APPLE' 
          };
          newFood.push(newFoodCell);
        }
      }
    }

    return newFood;
  }, [gameState.gridSize, gameState.snake, gameState.score]);

  // Handle power-up timers
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const powerUpTimer = setInterval(() => {
      setGameState((prev) => {
        const updatedPowerUps = prev.activePowerUps.map((powerUp) => {
          if (!powerUp.timeLeft) return powerUp;
          
          const timeLeft = powerUp.timeLeft - 1;
          
          // If time's up, deactivate the power-up
          if (timeLeft <= 0) {
            toast.info(`${powerUp.name} has expired`);
            return { ...powerUp, active: false, timeLeft: 0 };
          }
          
          return { ...powerUp, timeLeft };
        });
        
        // Filter out inactive power-ups
        const activeOnes = updatedPowerUps.filter((p) => p.active);
        
        return {
          ...prev,
          activePowerUps: activeOnes,
        };
      });
    }, 1000);

    return () => clearInterval(powerUpTimer);
  }, [gameState.isPlaying, gameState.isPaused]);

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver || prevState.isPaused) return prevState;

      // Update direction
      const direction = prevState.nextDirection;

      // Calculate new head position
      const head = prevState.snake[0];
      let newHead: Cell = { x: head.x, y: head.y, type: 'SNAKE' };

      switch (direction) {
        case 'UP':
          newHead.y = (head.y - 1 + prevState.gridSize) % prevState.gridSize;
          break;
        case 'DOWN':
          newHead.y = (head.y + 1) % prevState.gridSize;
          break;
        case 'LEFT':
          newHead.x = (head.x - 1 + prevState.gridSize) % prevState.gridSize;
          break;
        case 'RIGHT':
          newHead.x = (head.x + 1) % prevState.gridSize;
          break;
      }

      // Check for collision with self
      const hasImmunity = prevState.activePowerUps.some(
        (p) => p.effect === 'immunity' && p.active
      );
      
      const selfCollision = prevState.snake.some(
        (segment, i) => i !== 0 && segment.x === newHead.x && segment.y === newHead.y
      );

      if (selfCollision && !hasImmunity) {
        if (user) {
          const highScore = Math.max(user.highScore, prevState.score);
          const totalScore = user.totalScore + prevState.score;
          const points = user.points + prevState.score;
          
          updateUser({ highScore, totalScore, points });
        }
        
        return { ...prevState, gameOver: true };
      }

      // Check for food collision
      const foodIndex = prevState.food.findIndex(
        (f) => f.x === newHead.x && f.y === newHead.y
      );

      let newSnake = [newHead, ...prevState.snake];
      let newFood = [...prevState.food];
      let newScore = prevState.score;

      if (foodIndex >= 0) {
        const foodItem = prevState.food[foodIndex];
        
        // Points calculation
        const hasPointBoost = prevState.activePowerUps.some(
          (p) => p.effect === 'pointBoost' && p.active
        );
        
        const pointValue = foodItem.type === 'LEMON' ? 10 : 
                          hasPointBoost ? 5 : 1;
        
        newScore += pointValue;
        
        // Display message for special food
        if (foodItem.type === 'LEMON') {
          toast.success('Lemon collected! +10 points');
        } else if (hasPointBoost) {
          toast.success('Power-up active! +5 points');
        }
        
        // Remove eaten food and possibly generate new food
        newFood.splice(foodIndex, 1);
        
        // Generate new food if all food is eaten
        if (newFood.length === 0) {
          newFood = generateFood();
        }
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        direction,
        score: newScore,
      };
    });
  }, [generateFood, user, updateUser]);

  // Start the game
  const startGame = useCallback(() => {
    if (gameState.isPlaying) return;

    // Reset the game state
    setGameState({
      ...initialGameState,
      food: generateFood(),
      isPlaying: true,
      isPaused: false,
      gameOver: false,
    });

    // Start the game interval
    const interval = setInterval(gameLoop, gameState.speed);
    setGameInterval(interval);
  }, [gameState.isPlaying, gameState.speed, gameLoop, generateFood]);

  // Pause the game
  const pauseGame = useCallback(() => {
    if (gameInterval) {
      clearInterval(gameInterval);
      setGameInterval(null);
    }
    
    setGameState((prev) => ({ ...prev, isPaused: true }));
  }, [gameInterval]);

  // Resume the game
  const resumeGame = useCallback(() => {
    if (gameState.isPaused) {
      const interval = setInterval(gameLoop, gameState.speed);
      setGameInterval(interval);
      setGameState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [gameState.isPaused, gameState.speed, gameLoop]);

  // Restart the game
  const restartGame = useCallback(() => {
    if (gameInterval) {
      clearInterval(gameInterval);
    }
    
    const newFood = generateFood();
    
    setGameState({
      ...initialGameState,
      food: newFood,
      isPlaying: true,
      isPaused: false,
    });
    
    const interval = setInterval(gameLoop, initialGameState.speed);
    setGameInterval(interval);
  }, [gameInterval, gameLoop, generateFood]);

  // Change direction
  const setDirection = useCallback((newDirection: Direction) => {
    setGameState((prev) => {
      // Prevent 180-degree turns
      if (
        (prev.direction === 'UP' && newDirection === 'DOWN') ||
        (prev.direction === 'DOWN' && newDirection === 'UP') ||
        (prev.direction === 'LEFT' && newDirection === 'RIGHT') ||
        (prev.direction === 'RIGHT' && newDirection === 'LEFT')
      ) {
        return prev;
      }
      
      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          setDirection('UP');
          break;
        case 'ArrowDown':
          setDirection('DOWN');
          break;
        case 'ArrowLeft':
          setDirection('LEFT');
          break;
        case 'ArrowRight':
          setDirection('RIGHT');
          break;
        case ' ':
          if (gameState.isPaused) {
            resumeGame();
          } else {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.isPaused, setDirection, pauseGame, resumeGame]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    };
  }, [gameInterval]);

  // Buy a power-up
  const buyPowerUp = useCallback(
    (powerUpId: string) => {
      if (!user) return;

      const powerUp = powerUps.find((p) => p.id === powerUpId);
      if (!powerUp) return;

      if (user.points < powerUp.price) {
        toast.error('Not enough points to buy this power-up');
        return;
      }

      const updatedPurchasedPowerUps = [...user.purchasedPowerUps, powerUpId];
      const updatedPoints = user.points - powerUp.price;

      updateUser({
        purchasedPowerUps: updatedPurchasedPowerUps,
        points: updatedPoints,
      });

      toast.success(`Successfully purchased ${powerUp.name}`);
    },
    [user, updateUser]
  );

  // Buy a skin
  const buySkin = useCallback(
    (skinId: string) => {
      if (!user) return;

      const skin = skins.find((s) => s.id === skinId);
      if (!skin) return;

      if (user.points < skin.price) {
        toast.error('Not enough points to buy this skin');
        return;
      }

      const updatedPurchasedSkins = [...user.purchasedSkins, skinId];
      const updatedPoints = user.points - skin.price;

      updateUser({
        purchasedSkins: updatedPurchasedSkins,
        points: updatedPoints,
      });

      toast.success(`Successfully purchased ${skin.name}`);
    },
    [user, updateUser]
  );

  // Activate a power-up
  const activatePowerUp = useCallback(
    (powerUpId: string) => {
      if (!user || !user.purchasedPowerUps.includes(powerUpId)) return;

      const powerUp = powerUps.find((p) => p.id === powerUpId);
      if (!powerUp) return;

      // Check if already active
      const isAlreadyActive = gameState.activePowerUps.some(
        (p) => p.id === powerUpId && p.active
      );

      if (isAlreadyActive) {
        toast.info(`${powerUp.name} is already active`);
        return;
      }

      const activePowerUp = {
        ...powerUp,
        active: true,
        timeLeft: powerUp.duration,
      };

      setGameState((prev) => ({
        ...prev,
        activePowerUps: [...prev.activePowerUps, activePowerUp],
      }));

      toast.success(`${powerUp.name} activated!`);
    },
    [user, gameState.activePowerUps]
  );

  // Change active skin
  const changeSkin = useCallback(
    (skinId: string) => {
      if (!user || !user.purchasedSkins.includes(skinId)) return;

      setActiveSkin(skinId);
      updateUser({ activeSkin: skinId });
      toast.success('Skin changed successfully');
    },
    [user, updateUser]
  );

  // Join room
  const joinRoom = useCallback(
    (roomId: number) => {
      const room = rooms.find((r) => r.id === roomId);
      
      if (!room) {
        toast.error('Room not found');
        return;
      }
      
      if (room.players >= room.maxPlayers) {
        toast.error('Room is full');
        return;
      }
      
      setCurrentRoom(roomId);
      
      // Update room player count
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === roomId ? { ...r, players: r.players + 1 } : r
        )
      );
      
      toast.success(`Joined Room ${roomId}`);
    },
    [rooms]
  );

  return (
    <GameContext.Provider
      value={{
        gameState,
        startGame,
        pauseGame,
        resumeGame,
        restartGame,
        setDirection,
        availablePowerUps,
        availableSkins,
        buyPowerUp,
        buySkin,
        activatePowerUp,
        changeSkin,
        activeSkin,
        leaderboard,
        rooms,
        joinRoom,
        currentRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
