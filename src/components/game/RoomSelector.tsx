
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const RoomSelector: React.FC = () => {
  const { rooms, joinRoom, currentRoom } = useGame();

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-2xl font-bold">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Game Rooms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {rooms.map((room) => {
            const isFull = room.players >= room.maxPlayers;
            const isActive = room.id === currentRoom;
            
            return (
              <Button
                key={room.id}
                onClick={() => joinRoom(room.id)}
                disabled={isFull || isActive}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 justify-start",
                  isActive && "border-primary",
                  isFull && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="font-medium">Room {room.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {room.players}/{room.maxPlayers}
                    </span>
                    {isActive && <DoorOpen className="h-4 w-4 ml-1 text-green-500" />}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomSelector;
