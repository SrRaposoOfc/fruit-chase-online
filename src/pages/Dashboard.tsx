
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import GameBoard from '@/components/game/GameBoard';
import Controls from '@/components/game/Controls';
import Scoreboard from '@/components/game/Scoreboard';
import PowerUps from '@/components/game/PowerUps';
import Skins from '@/components/game/Skins';
import Leaderboard from '@/components/game/Leaderboard';
import RoomSelector from '@/components/game/RoomSelector';
import { useGame } from '@/context/GameContext';
import { Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('game');
  const { gameState } = useGame();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Snake Game</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{gameState.playersOnline} Players Online</span>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="game" className="min-h-[60vh] animate-fade-in">
            <div className="flex flex-col gap-6">
              <Scoreboard />
              <GameBoard />
              <Controls />
            </div>
          </TabsContent>
          
          <TabsContent value="shop" className="min-h-[60vh] animate-fade-in">
            <div className="flex flex-col gap-8">
              <PowerUps />
              <Skins />
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard" className="min-h-[60vh] animate-fade-in">
            <div className="flex justify-center pt-4">
              <Leaderboard />
            </div>
          </TabsContent>
          
          <TabsContent value="rooms" className="min-h-[60vh] animate-fade-in">
            <div className="flex justify-center pt-4">
              <RoomSelector />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
