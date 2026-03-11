import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  showModulesDropdown: boolean;
  setShowModulesDropdown: (value: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  activeSection: string;
  setActiveSection: (value: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showModulesDropdown, setShowModulesDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  return (
    <NavigationContext.Provider
      value={{
        showModulesDropdown,
        setShowModulesDropdown,
        mobileMenuOpen,
        setMobileMenuOpen,
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
