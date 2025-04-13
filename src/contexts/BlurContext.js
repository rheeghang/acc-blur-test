import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const BlurContext = createContext();
const MOBILE_MAX_WIDTH = 1024; // 태블릿 크기까지 허용
const MENU_TOLERANCE = 30; // 메뉴 허용 각도 범위

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [menuBlurAmount, setMenuBlurAmount] = useState(0);
  const isUnlockedRef = useRef(isUnlocked);
  const isTutorialModeRef = useRef(false);
  const isMobileRef = useRef(window.innerWidth <= MOBILE_MAX_WIDTH);

  // 현재 각도가 메뉴 허용 범위 안에 있는지 확인
  const isInMenuRange = (alpha) => {
    if (!isMobileRef.current) return true;
    
    const diffFrom0 = Math.abs(alpha - 0);
    const diffFrom360 = Math.abs(alpha - 360);
    return diffFrom0 <= MENU_TOLERANCE || diffFrom360 <= MENU_TOLERANCE;
  };

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (!isMobileRef.current) {
        setBlurAmount(0);
        setMenuBlurAmount(0);
        setIsUnlocked(true);
        return;
      }

      if (event.alpha == null) return;
      const alpha = event.alpha;
      setCurrentAlpha(alpha);
      
      if (!isUnlockedRef.current) {
        const tolerance = 20;
        const maxBlur = 15;
        
        // 튜토리얼 4 특수 케이스: 0도 또는 360도 처리
        if (Array.isArray(targetAlpha)) {
          // alpha값이 0도 근처이거나 360도 근처일 때
          const diffFrom0 = Math.abs(alpha - 0);
          const diffFrom360 = Math.abs(alpha - 360);
          
          if (diffFrom0 <= tolerance || diffFrom360 <= tolerance) {
            setBlurAmount(0);
            setIsUnlocked(true);
          } else {
            // 가장 가까운 목표 각도와의 차이를 기준으로 블러 계산
            const minDifference = Math.min(diffFrom0, diffFrom360);
            const blur = Math.min(maxBlur, (minDifference - tolerance) / 3);
            setBlurAmount(blur);
          }
        } else {
          // 일반 케이스
          const alphaDifference = Math.abs(alpha - targetAlpha);
          
          if (alphaDifference <= tolerance) {
            setBlurAmount(0);
            setIsUnlocked(true);
          } else {
            const blur = Math.min(maxBlur, (alphaDifference - tolerance) / 3);
            setBlurAmount(blur);
          }
        }

        // 메뉴 블러 처리
        if (!isInMenuRange(alpha)) {
          setMenuBlurAmount(10);
        } else {
          setMenuBlurAmount(0);
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha]);

  const setTargetAngles = (alpha, isTutorial = false) => {
    if (!isMobileRef.current) {
      setIsUnlocked(true);
      return;
    }
    setTargetAlpha(alpha);
    setIsUnlocked(false);
    isUnlockedRef.current = false;
    isTutorialModeRef.current = isTutorial;
  };

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles,
      setIsUnlocked,
      isUnlocked,
      menuBlurAmount,
      isInMenuRange
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext);