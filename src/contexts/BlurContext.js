import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha || 0;
      setCurrentAlpha(alpha);
      
      if (isUnlocked) {
        setBlurAmount(0);
        return;
      }
      
      const tolerance = 30; 
      const maxBlur = 20;
      
      // 단순히 현재 알파값과 타겟 알파값의 차이 계산
      const alphaDifference = Math.abs(alpha - targetAlpha);
      
      if (alphaDifference <= tolerance) {
        setBlurAmount(0);
        setIsUnlocked(true);
      } else {
        const blur = Math.min(maxBlur, (alphaDifference - tolerance) / 3);
        setBlurAmount(blur);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha, isUnlocked]);

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles: (alpha) => {
        setTargetAlpha(alpha);
        setIsUnlocked(false);
      },
      setIsUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext); 