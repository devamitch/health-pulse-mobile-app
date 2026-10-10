import { useGameProgression } from '@/hooks/useGameProgression';
import React, { createContext, useContext, useEffect } from 'react';

interface GameProgressionContextValue
  extends ReturnType<typeof useGameProgression> {
  isReady: boolean;
}

const GameProgressionContext =
  createContext<GameProgressionContextValue | null>(null);

export const GameProgressionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const gameProgression = useGameProgression();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Initialize game progression on mount
    gameProgression.initialize();
    setIsReady(true);
  }, []);

  const value = {
    ...gameProgression,
    isReady,
  };

  return (
    <GameProgressionContext.Provider value={value}>
      {children}
    </GameProgressionContext.Provider>
  );
};

export const useGameHook = () => {
  const context = useContext(GameProgressionContext);
  if (!context) {
    throw new Error(
      'useGameProgressionContext must be used within GameProgressionProvider',
    );
  }
  return context;
};
