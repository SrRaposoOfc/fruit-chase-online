
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GameProvider } from '@/context/GameContext';
import Auth from './Auth';
import Dashboard from './Dashboard';

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium animate-pulse">Loading...</h2>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <GameProvider>
      <Dashboard />
    </GameProvider>
  ) : (
    <Auth />
  );
};

export default Index;
