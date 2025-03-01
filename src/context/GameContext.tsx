<lov-code>
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Types
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type CellType = 'EMPTY' | 'SNAKE' | 'APPLE' | 'LEMON' | 'BOT_SNAKE';

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  botId?: number;
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

export interface Bot {
  id: number;
  snake: Cell[];
  direction: Direction;
  score: number;
  name: string;
}

export interface Room {
  id: number;
  players: number;
  maxPlayers: number;
  bots: Bot[];
  topPlayer?: {
    username: string;
    score: number;
  };
  gridSize: number;
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
  rooms: Room[];
  joinRoom: (roomId: number) => void;
  currentRoom: number | null;
  inRoomView: boolean;
  setInRoomView: (inRoom: boolean) => void;
  bots: Bot[];
  checkCollisionWithBots: (head: Cell) => boolean;
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
  {
    id: 'fire',
    name: 'Fire Snake',
    description: 'A blazing hot snake',
    price: 500,
    className: 'bg-orange-500 animate-fire',
  },
  {
    id: 'ice',
    name: 'Ice Snake',
    description: 'A freezing cold snake',
    price: 450,
    className: 'bg-blue-300 animate-ice',
  },
  {
    id: 'galaxy',
    name: 'Galaxy Snake',
    description: 'A cosmic snake from the stars',
    price: 750,
    className: 'bg-indigo-600 animate-stars',
  },
  {
    id: 'gold',
    name: 'Golden Snake',
    description: 'A luxurious gold-plated snake',
    price: 850,
    className: 'bg-yellow-500 animate-shine',
  },
];

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameInterval, setGameInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeSkin, setActiveSkin] = useState<string>('default');
  const [leaderboard, setLeaderboard] = useState<{ username: string; highScore: number; totalScore: number }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const [inRoomView, setInRoomView] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);

  // Initialize rooms with real player counts (all zero initially)
  useEffect(() => {
    const initialRooms = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      players: 0,
      maxPlayers: 20,
      bots: [],
      gridSize: 160,
    }));
    setRooms(initialRooms);
    
    // Initialize leaderboard with only the current user if authenticated
    if (user) {
      setLeaderboard([{
        username: user.username,
        highScore: user.highScore,
        totalScore: user.totalScore
      }]);
    } else {
      setLeaderboard([]);
    }
  }, [user]);

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
      // Set a realistic number of players online
      setGameState((prev) => ({
        ...prev,
        playersOnline: Math.floor(Math.random() * 10) + 1,
      }));
    }
  }, [user]);

  // Generate food
  const generateFood = useCallback(() => {
    let newFood: Cell[] = [];
    const gridSize = inRoomView && currentRoom 
      ? rooms.find(r => r.id === currentRoom)?.gridSize || gameState.gridSize
      : gameState.gridSize;

    // Determinar número de maçãs e limões com base no número de jogadores
    // 3 maçãs para cada jogador e 1 limão a cada 3 jogadores
    const roomData = currentRoom ? rooms.find(r => r.id === currentRoom) : null;
    const playerCount = roomData?.players || 1;
    const numApples = inRoomView ? playerCount * 3 : (gameState.snake.length > 10 ? 2 : 1);
    const numLemons = inRoomView ? Math.floor(playerCount / 3) : 0;

    // Gerar maçãs
    for (let i = 0; i < numApples; i++) {
      let validPosition = false;
      
      while (!validPosition) {
        // Ajustar para não gerar comida nas bordas do mapa em modo sala
        const minPosition = inRoomView ? 2 : 0;
        const maxPosition = inRoomView ? gridSize - 3 : gridSize - 1;
        
        const x = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
        const y = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
        
        // Check if position is occupied by snake or existing food
        const isOccupied = gameState.snake.some(segment => segment.x === x && segment.y === y) ||
                          newFood.some(food => food.x === x && food.y === y) ||
                          bots.some(bot => bot.snake.some(segment => segment.x === x && segment.y === y));
        
        if (!isOccupied) {
          validPosition = true;
          newFood.push({ x, y, type: 'APPLE' });
        }
      }
    }

    // Gerar limões
    for (let i = 0; i < numLemons; i++) {
      let validPosition = false;
      
      while (!validPosition) {
        // Ajustar para não gerar comida nas bordas do mapa em modo sala
        const minPosition = inRoomView ? 2 : 0;
        const maxPosition = inRoomView ? gridSize - 3 : gridSize - 1;
        
        const x = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
        const y = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
        
        // Check if position is occupied
        const isOccupied = gameState.snake.some(segment => segment.x === x && segment.y === y) ||
                          newFood.some(food => food.x === x && food.y === y) ||
                          bots.some(bot => bot.snake.some(segment => segment.x === x && segment.y === y));
        
        if (!isOccupied) {
          validPosition = true;
          newFood.push({ x, y, type: 'LEMON' });
        }
      }
    }

    return newFood;
  }, [gameState.gridSize, gameState.snake, inRoomView, currentRoom, rooms, bots]);

  // Generate bots for a room
  const generateBots = useCallback((roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return [];
    
    const botNames = ['BotPython', 'BotCobra', 'BotViper', 'BotAnaconda', 'BotMamba'];
    const newBots: Bot[] = [];
    
    // Sempre gerar exatamente 2 bots, como solicitado
    const numBots = 2;
    
    for (let i = 0; i < numBots; i++) {
      // Place bot in random position
      const x = Math.floor(Math.random() * room.gridSize);
      const y = Math.floor(Math.random() * room.gridSize);
      
      // Random direction
      const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      
      newBots.push({
        id: i + 1,
        snake: [{ x, y, type: 'BOT_SNAKE', botId: i + 1 }],
        direction: randomDirection,
        score: 0,
        name: botNames[i % botNames.length],
      });
    }
    
    return newBots;
  }, [rooms]);

  // Move bots
  const moveBots = useCallback(() => {
    if (!inRoomView) return;
    
    setBots(prevBots => {
      return prevBots.map(bot => {
        // Calculate new head position
        const head = bot.snake[0];
        let newDirection = bot.direction;
        
        // Occasionally change direction (10% chance)
        if (Math.random() < 0.1) {
          const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
          // Filter out opposite direction to prevent 180-degree turns
          const validDirections = directions.filter(dir => {
            if (newDirection === 'UP' && dir === 'DOWN') return false;
            if (newDirection === 'DOWN' && dir === 'UP') return false;
            if (newDirection === 'LEFT' && dir === 'RIGHT') return false;
            if (newDirection === 'RIGHT' && dir === 'LEFT') return false;
            return true;
          });
          newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
        }
        
        // If food exists, try to move towards it (80% chance)
        if (gameState.food.length > 0 && Math.random() < 0.8) {
          const closestFood = gameState.food[0];
          
          // Simple pathfinding towards food
          if (closestFood.x < head.x && newDirection !== 'RIGHT') {
            newDirection = 'LEFT';
          } else if (closestFood.x > head.x && newDirection !== 'LEFT') {
            newDirection = 'RIGHT';
          } else if (closestFood.y < head.y && newDirection !== 'DOWN') {
            newDirection = 'UP';
          } else if (closestFood.y > head.y && newDirection !== 'UP') {
            newDirection = 'DOWN';
          }
        }
        
        // Calculate new head position
        let newHead: Cell = { 
          x: head.x, 
          y: head.y, 
          type: 'BOT_SNAKE',
          botId: bot.id
        };
        
        const gridSize = currentRoom 
          ? rooms.find(r => r.id === currentRoom)?.gridSize || gameState.gridSize
          : gameState.gridSize;
        
        // Movimento com detecção de colisão com paredes para bots
        switch (newDirection) {
          case 'UP':
            newHead.y = head.y - 1;
            // Se colidir com a parede, alterar direção
            if (newHead.y < 1) {
              newHead.y = 1;
              newDirection = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
            }
            break;
          case 'DOWN':
            newHead.y = head.y + 1;
            // Se colidir com a parede, alterar direção
            if (newHead.y >= gridSize - 1) {
              newHead.y = gridSize - 2;
              newDirection = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
            }
            break;
          case 'LEFT':
            newHead.x = head.x - 1;
            // Se colidir com a parede, alterar direção
            if (newHead.x < 1) {
              newHead.x = 1;
              newDirection = Math.random() < 0.5 ? 'UP' : 'DOWN';
            }
            break;
          case 'RIGHT':
            newHead.x = head.x + 1;
            // Se colidir com a parede, alterar direção
            if (newHead.x >= gridSize - 1) {
              newHead.x = gridSize - 2;
              newDirection = Math.random() < 0.5 ? 'UP' : 'DOWN';
            }
            break;
        }
        
        // Check for collision with self
        const selfCollision = bot.snake.some(
          (segment, i) => i !== 0 && segment.x === newHead.x && segment.y === newHead.y
        );
        
        if (selfCollision) {
          // Bot collided with itself, reset it
          const x = Math.floor(Math.random() * (gridSize - 4)) + 2;
          const y = Math.floor(Math.random() * (gridSize - 4)) + 2;
          
          return {
            ...bot,
            snake: [{ x, y, type: 'BOT_SNAKE', botId: bot.id }],
            score: 0,
          };
        }
        
        // Check for food collision
        const foodIndex = gameState.food.findIndex(
          (f) => f.x === newHead.x && f.y === newHead.y
        );
        
        let newSnake = [newHead, ...bot.snake];
        let newScore = bot.score;
        
        if (foodIndex >= 0) {
          const foodItem = gameState.food[foodIndex];
          // Points calculation
          const pointValue = foodItem.type === 'LEMON' ? 10 : 1;
          newScore += pointValue;
          
          // Remove eaten food from game state
          setGameState(prev => ({
            ...prev,
            food: prev.food.filter((_, i) => i !== foodIndex)
          }));
          
          // Generate new food if all food is eaten
          if (gameState.food.length <= 1) {
            setGameState(prev => ({
              ...prev,
              food: [...prev.food, ...generateFood()]
            }));
          }
        } else {
          // Remove tail if no food eaten
          newSnake.pop();
        }
        
        return {
          ...bot,
          snake: newSnake,
          direction: newDirection,
          score: newScore,
        };
      });
    });
  }, [inRoomView, gameState.food, generateFood, currentRoom, rooms]);

  // Handle bot movement timer
  useEffect(() => {
    if (!inRoomView || bots.length === 0) return;
    
    const botMovementTimer = setInterval(moveBots, 300); // Bots move slightly slower than player
    
    return () => clearInterval(botMovementTimer);
  }, [inRoomView, bots.length, moveBots]);

  // Check for collision with bots
  const checkCollisionWithBots = useCallback((head: Cell) => {
    // Check if player's head collides with any bot body part
    for (const bot of bots) {
      for (const segment of bot.snake) {
        if (segment.x === head.x && segment.y === head.y) {
          // Player collided with bot
          if (user) {
            // Give bot the player's points
            setBots(prevBots => 
              prevBots.map(b => 
                b.id === bot.id 
                  ? { ...b, score: b.score + gameState.score } 
                  : b
              )
            );
            
            // Update room's top player if this bot now has the highest score
            if (currentRoom) {
              setRooms(prevRooms => 
                prevRooms.map(room => 
                  room.id === currentRoom 
                    ? { 
                        ...room, 
                        topPlayer: {
                          username: bot.name,
                          score: bot.score + gameState.score
                        }
                      } 
                    : room
                )
              );
            }
            
            // Update high score if needed
            const highScore = Math.max(user.highScore, gameState.score);
            const totalScore = user.totalScore + gameState.score;
            
            updateUser({ highScore, totalScore });
          }
          
          toast.error(`You collided with ${bot.name}! They stole your points!`);
          return true;
        }
      }
    }
    return false;
  }, [bots, gameState.score, currentRoom, user, updateUser]);

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

      // Use the appropriate grid size based on whether we're in a room
      const gridSize = inRoomView && currentRoom 
        ? rooms.find(r => r.id === currentRoom)?.gridSize || prevState.gridSize
        : prevState.gridSize;

      // Movimento com colisão de paredes quando estiver em uma sala
      if (inRoomView) {
        switch (direction) {
          case 'UP':
            newHead.y = head.y - 1;
            // Verificar colisão com a parede superior
            if (newHead.y < 1) {
              return { ...prevState, gameOver: true };
            }
            break;
          case 'DOWN':
            newHead.y = head.y + 1;
            // Verificar colisão com a parede inferior
            if (newHead.y >= gridSize - 1) {
              return { ...prevState, gameOver: true };
            }
            break;
          case 'LEFT':
            newHead.x = head.x - 1;
            // Verificar colisão com a parede esquerda
            if (newHead.x < 1) {
              return { ...prevState, gameOver: true };
            }
            break;
          case 'RIGHT':
            newHead.x = head.x + 1;
            // Verificar colisão com a parede direita
            if (newHead.x >= gridSize - 1) {
              return { ...prevState, gameOver: true };
            }
            break;
        }
      } else {
        // Modo normal - atravessa as bordas
        switch (direction) {
          case 'UP':
            newHead.y = (head.y - 1 + gridSize) % gridSize;
            break;
          case 'DOWN':
            newHead.y = (head.y + 1) % gridSize;
            break;
          case 'LEFT':
            newHead.x = (head.x - 1 + gridSize) % gridSize;
            break;
          case 'RIGHT':
            newHead.x = (head.x + 1) % gridSize;
            break;
        }
      }

      // Check for collision with self
      const hasImmunity = prevState.activePowerUps.some(
        (p) => p.effect === 'immunity' && p.active
      );
      
      const selfCollision = prevState.snake.some(
        (segment, i) => i !== 0 && segment.x === newHead.x && segment.y === newHead.y
      );

      // Check for collision with bots
      const botCollision = inRoomView && checkCollisionWithBots(newHead);

      if ((selfCollision || botCollision) && !hasImmunity) {
        if (user) {
          const highScore = Math.max(user.highScore, prevState.score);
          const totalScore = user.totalScore + prevState.score;
          const points = user.points + prevState.score;
          
          updateUser({ highScore, totalScore, points });
          
          // Update room's top player if player has the highest score
          if (currentRoom && prevState.score > (rooms.find(r => r.id === currentRoom)?.topPlayer?.score || 0)) {
            setRooms(prevRooms => 
              prevRooms.map(room => 
                room.id === currentRoom 
                  ? { 
                      ...room, 
                      topPlayer: {
                        username: user.username,
                        score: prevState.score
                      }
                    } 
                  : room
              )
            );
          }
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
  }, [generateFood, user, updateUser, inRoomView, currentRoom, rooms, checkCollisionWithBots]);

  // Start the game
  const startGame = useCallback(() => {
    if (gameState.isPlaying) return;

    // Posição inicial segura para o jogador
    const initialX = inRoomView ? Math.floor(Math.random() * 80) + 40 : 5;
    const initialY = inRoomView ? Math.floor(Math.random() * 80) + 40 : 5;

    // Reset the game state
    setGameState({
      ...initialGameState,
      snake: [{ x: initialX, y: initialY, type: 'SNAKE' }],
      food: generateFood(),
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      gridSize: inRoomView && currentRoom 
        ? rooms.find(r => r.id === currentRoom)?.gridSize || initialGameState.gridSize
        : initialGameState.gridSize,
    });

    // Start the game interval
    const interval = setInterval(gameLoop, gameState.speed);
    setGameInterval(interval);
  }, [gameState.isPlaying, gameState.speed, gameLoop, generateFood, inRoomView, currentRoom, rooms]);

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
      gridSize: inRoomView && currentRoom 
        ? rooms.find(r => r.id === currentRoom)?.gridSize || initialGameState.gridSize
        : initialGameState.gridSize,
    });
    
    const interval = setInterval(gameLoop, initialGameState.speed);
    setGameInterval(interval);
  }, [gameInterval, gameLoop, generateFood, inRoomView, currentRoom, rooms]);

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
