import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface CompanyTheme {
  name: string;
  primary: string;
  accent: string;
  logo: string;
  description: string;
}

const companyThemes: Record<string, CompanyTheme> = {
  'Broen-Lab': {
    name: 'Broen-Lab',
    primary: '213 100% 25%', // Navy blue for safety equipment
    accent: '213 85% 45%',
    logo: '/brand-logos/broen-lab-logo.png',
    description: 'Advanced fume hoods and ventilation systems designed for chemical safety and efficiency'
  },
  'Hamilton Laboratory Solutions': {
    name: 'Hamilton Laboratory Solutions',
    primary: '215 30% 25%', // Professional gray-blue
    accent: '215 50% 45%',
    logo: '/brand-logos/hamilton-laboratory-logo.png',
    description: 'Premium laboratory furniture and benches with chemical-resistant surfaces'
  },
  'Oriental Giken Inc.': {
    name: 'Oriental Giken Inc.',
    primary: '15 100% 35%', // Modern orange/red (Tangerine inspired)
    accent: '15 85% 55%',
    logo: '/brand-logos/oriental-giken-logo.png',
    description: 'Emergency safety equipment including eye wash stations and safety showers'
  },
  'Innosin Lab': {
    name: 'Innosin Lab',
    primary: '200 85% 35%', // Clean teal/green for modular solutions
    accent: '200 75% 55%',
    logo: '/brand-logos/innosin-lab-logo.png',
    description: 'Comprehensive storage solutions and laboratory equipment for modern research facilities'
  }
};

interface CompanyThemeContextType {
  activeTheme: CompanyTheme | null;
  setActiveCompany: (company: string | null) => void;
  resetTheme: () => void;
}

const CompanyThemeContext = createContext<CompanyThemeContextType | undefined>(undefined);

export const useCompanyTheme = () => {
  const context = useContext(CompanyThemeContext);
  if (!context) {
    throw new Error('useCompanyTheme must be used within a CompanyThemeProvider');
  }
  return context;
};

interface CompanyThemeProviderProps {
  children: React.ReactNode;
}

export const CompanyThemeProvider: React.FC<CompanyThemeProviderProps> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<CompanyTheme | null>(null);
  const [searchParams] = useSearchParams();

  const setActiveCompany = (company: string | null) => {
    const theme = company && companyThemes[company] ? companyThemes[company] : null;
    setActiveTheme(theme);
    
    if (theme) {
      // Apply theme CSS variables
      document.documentElement.style.setProperty('--company-primary', theme.primary);
      document.documentElement.style.setProperty('--company-accent', theme.accent);
      document.documentElement.classList.add('company-themed');
    } else {
      // Reset to default theme
      document.documentElement.style.removeProperty('--company-primary');
      document.documentElement.style.removeProperty('--company-accent');
      document.documentElement.classList.remove('company-themed');
    }
  };

  const resetTheme = () => {
    setActiveCompany(null);
  };

  // Auto-detect company from URL parameters
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && companyThemes[categoryFromUrl]) {
      setActiveCompany(categoryFromUrl);
    } else {
      resetTheme();
    }
  }, [searchParams]);

  return (
    <CompanyThemeContext.Provider value={{ activeTheme, setActiveCompany, resetTheme }}>
      {children}
    </CompanyThemeContext.Provider>
  );
};

export default CompanyThemeProvider;