
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Coins } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-bold text-xl tracking-tight">Snake Game</div>
        </div>
        
        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{user.points} points</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <div className="font-medium">{user.username}</div>
                <div className="text-xs text-muted-foreground">
                  High Score: {user.highScore}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="rounded-full h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
