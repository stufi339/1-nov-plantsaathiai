import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslation } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Load from localStorage, default to english
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'english';
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string) => getTranslation(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
