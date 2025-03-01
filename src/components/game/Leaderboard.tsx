
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Medal } from 'lucide-react';

const LeaderboardItem: React.FC<{
  username: string;
  score: number;
  rank: number;
}> = ({ username, score, rank }) => {
  const getIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <Star className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className={`flex items-center p-3 ${rank <= 3 ? 'bg-muted/50' : ''} rounded-md mb-2 transition-all hover:bg-muted`}>
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mr-4">
        {getIcon()}
      </div>
      <div className="flex-grow">
        <div className="font-medium">{username}</div>
      </div>
      <div className="font-bold text-lg">{score}</div>
    </div>
  );
};

const Leaderboard: React.FC = () => {
  const { leaderboard } = useGame();
  const [activeTab, setActiveTab] = useState('highScore');

  // Sort leaderboard by the active metric
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (activeTab === 'highScore') {
      return b.highScore - a.highScore;
    } else {
      return b.totalScore - a.totalScore;
    }
  });

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-2xl font-bold">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="highScore" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="highScore">Game High Scores</TabsTrigger>
            <TabsTrigger value="totalScore">Total Points</TabsTrigger>
          </TabsList>
          
          <TabsContent value="highScore" className="mt-0 animate-fade-in">
            <div className="space-y-1">
              {sortedLeaderboard.map((player, index) => (
                <LeaderboardItem
                  key={player.username}
                  username={player.username}
                  score={player.highScore}
                  rank={index + 1}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="totalScore" className="mt-0 animate-fade-in">
            <div className="space-y-1">
              {sortedLeaderboard.map((player, index) => (
                <LeaderboardItem
                  key={player.username}
                  username={player.username}
                  score={player.totalScore}
                  rank={index + 1}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
