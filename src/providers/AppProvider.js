import React from 'react';
import { BlurProvider } from '../contexts/BlurContext';
import { GuideProvider } from '../contexts/GuideContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ModeProvider } from '../contexts/ModeContext';

export const AppProvider = ({ children }) => {
  return (
    <LanguageProvider>
      <ModeProvider>
        <BlurProvider>
          <GuideProvider>
            {children}
          </GuideProvider>
        </BlurProvider>
      </ModeProvider>
    </LanguageProvider>
  );
}; 