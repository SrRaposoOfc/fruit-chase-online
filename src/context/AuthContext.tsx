
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  points: number;
  highScore: number;
  totalScore: number;
  purchasedSkins: string[];
  purchasedPowerUps: string[];
  activeSkin: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Mock data for users
const MOCK_USERS = [
  {
    id: '1',
    username: 'player1',
    password: 'password123',
    points: 500,
    highScore: 120,
    totalScore: 1500,
    purchasedSkins: ['default', 'shine'],
    purchasedPowerUps: ['lemon', 'timeFreeze'],
    activeSkin: 'default',
  },
  {
    id: '2',
    username: 'player2',
    password: 'password123',
    points: 1200,
    highScore: 95,
    totalScore: 2100,
    purchasedSkins: ['default'],
    purchasedPowerUps: ['lemon'],
    activeSkin: 'default',
  },
];

// Initialize Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('snakeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Store user whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('snakeUser', JSON.stringify(user));
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Find user in our mock data
      const foundUser = MOCK_USERS.find(
        (u) => u.username === username && u.password === password
      );
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        toast.success('Successfully logged in!');
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Check if username exists
      const userExists = MOCK_USERS.some((u) => u.username === username);
      
      if (userExists) {
        toast.error('Username already exists');
        return;
      }
      
      // Create new user
      const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        username,
        points: 0,
        highScore: 0,
        totalScore: 0,
        purchasedSkins: ['default'],
        purchasedPowerUps: [],
        activeSkin: 'default',
      };
      
      // Add to mock database and set current user
      MOCK_USERS.push({ ...newUser, password });
      setUser(newUser);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('snakeUser');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Also update in our mock database
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updates };
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
