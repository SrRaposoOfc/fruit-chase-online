
import React from 'react';
import { useGame, PowerUp } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, ShoppingCart } from 'lucide-react';

const PowerUpCard: React.FC<{
  powerUp: PowerUp;
  isOwned: boolean;
  isActive: boolean;
  onBuy: () => void;
  onActivate: () => void;
}> = ({ powerUp, isOwned, isActive, onBuy, onActivate }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{powerUp.name}</CardTitle>
          {isOwned && (
            <Badge variant="outline" className="bg-primary/10">
              Owned
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">{powerUp.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-primary" />
          <span>Effect: {powerUp.effect}</span>
        </div>
        {powerUp.duration && (
          <div className="flex items-center gap-2 text-sm mt-1">
            <Clock className="h-4 w-4 text-primary" />
            <span>Duration: {powerUp.duration} seconds</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isOwned ? (
          <Button 
            onClick={onActivate} 
            className="w-full"
            disabled={isActive}
            variant={isActive ? "outline" : "default"}
          >
            {isActive ? "Active" : "Activate"}
          </Button>
        ) : (
          <Button onClick={onBuy} className="w-full" variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy for {powerUp.price} points
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const PowerUps: React.FC = () => {
  const { availablePowerUps, buyPowerUp, activatePowerUp, gameState } = useGame();
  const { user } = useAuth();

  if (!user) return null;

  // All power ups (both owned and available)
  const allPowerUps = [
    ...user.purchasedPowerUps.map(id => {
      const powerUpInfo = availablePowerUps.find(p => p.id === id) || 
                          gameState.activePowerUps.find(p => p.id === id);
      if (!powerUpInfo) {
        // Fallback if power-up data is not found
        return {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          description: "Power-up",
          price: 0,
          effect: "Unknown",
        };
      }
      return powerUpInfo;
    }),
    ...availablePowerUps,
  ];

  // Remove duplicates
  const uniquePowerUps = Array.from(new Map(allPowerUps.map(p => [p.id, p])).values());

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Power Ups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniquePowerUps.map((powerUp) => (
          <PowerUpCard
            key={powerUp.id}
            powerUp={powerUp}
            isOwned={user.purchasedPowerUps.includes(powerUp.id)}
            isActive={gameState.activePowerUps.some(
              (p) => p.id === powerUp.id && p.active
            )}
            onBuy={() => buyPowerUp(powerUp.id)}
            onActivate={() => activatePowerUp(powerUp.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PowerUps;
