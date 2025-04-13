import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const BlurContext = createContext();
const MOBILE_MAX_WIDTH = 1024; // 태블릿 크기까지 허용
const MENU_TOLERANCE = 20; // 메뉴 허용 각도 범위
const MAX_MENU_BLUR = 10; // 최대 메뉴 블러 값

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [menuBlurAmount, setMenuBlurAmount] = useState(0);
  const isUnlockedRef = useRef(isUnlocked);
  const isTutorialModeRef = useRef(false);
  const isMobileRef = useRef(window.innerWidth <= MOBILE_MAX_WIDTH);

  // 현재 각도가 메뉴 허용 범위 안에 있는지 확인하고 블러 정도 계산
  const isInMenuRange = (alpha) => {
    if (!isMobileRef.current) return true;
    
    const diffFrom0 = Math.abs(alpha - 0);
    const diffFrom360 = Math.abs(alpha - 360);
    const minDifference = Math.min(diffFrom0, diffFrom360);
    
    return minDifference <= MENU_TOLERANCE;
  };

  // 메뉴 블러 설정을 위한 별도 함수
  const updateMenuBlur = (alpha) => {
    if (!isMobileRef.current) {
      setMenuBlurAmount(0);
      return;
    }

    const diffFrom0 = Math.abs(alpha - 0);
    const diffFrom360 = Math.abs(alpha - 360);
    const minDifference = Math.min(diffFrom0, diffFrom360);
    
    if (minDifference <= MENU_TOLERANCE) {
      setMenuBlurAmount(0);
    } else {
      const blur = Math.min(MAX_MENU_BLUR, (minDifference - MENU_TOLERANCE) / 3);
      setMenuBlurAmount(blur);
    }
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
      
      // 페이지 블러 처리 (isUnlocked에 의존)
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
      }

      // 메뉴 블러 처리 (isUnlocked와 독립적으로 실행)
      updateMenuBlur(alpha);
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