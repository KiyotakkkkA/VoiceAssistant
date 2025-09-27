import React, { createContext, useContext, ReactNode } from 'react';
import { useAppNavigation, NavigationState } from '../composables';
import { AppTab } from '../types/Global';

const NavigationContext = createContext<NavigationState | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
  initialTab?: AppTab;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialTab = 'home' 
}) => {
  const navigation = useAppNavigation(initialTab);

  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationState => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};