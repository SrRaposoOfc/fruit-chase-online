
import React from 'react';
import { useGame, Skin } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingCart } from 'lucide-react';

const SkinCard: React.FC<{
  skin: Skin;
  isOwned: boolean;
  isActive: boolean;
  onBuy: () => void;
  onActivate: () => void;
}> = ({ skin, isOwned, isActive, onBuy, onActivate }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{skin.name}</CardTitle>
          {isOwned && (
            <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-primary" : "bg-primary/10"}>
              {isActive ? "Active" : "Owned"}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">{skin.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className={`h-8 w-full rounded ${skin.className} mb-2`}></div>
      </CardContent>
      <CardFooter>
        {isOwned ? (
          <Button 
            onClick={onActivate} 
            className="w-full"
            disabled={isActive}
            variant={isActive ? "outline" : "default"}
          >
            {isActive ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Active
              </>
            ) : (
              "Apply Skin"
            )}
          </Button>
        ) : (
          <Button onClick={onBuy} className="w-full" variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy for {skin.price} points
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const Skins: React.FC = () => {
  const { availableSkins, buySkin, changeSkin, activeSkin } = useGame();
  const { user } = useAuth();

  if (!user) return null;

  // Collect all skins (both purchased and available)
  const ownedSkins = availableSkins.filter(skin => 
    user.purchasedSkins.includes(skin.id)
  );
  
  // All unique skins
  const allSkins = [...ownedSkins, ...availableSkins]
    .filter((skin, index, self) => 
      index === self.findIndex(s => s.id === skin.id)
    );

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Snake Skins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allSkins.map((skin) => (
          <SkinCard
            key={skin.id}
            skin={skin}
            isOwned={user.purchasedSkins.includes(skin.id)}
            isActive={activeSkin === skin.id}
            onBuy={() => buySkin(skin.id)}
            onActivate={() => changeSkin(skin.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Skins;
