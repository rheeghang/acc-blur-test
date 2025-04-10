import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const BlurContext = createContext();
const MOBILE_MAX_WIDTH = 1024; // 태블릿 크기까지 허용

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const isUnlockedRef = useRef(isUnlocked);
  const isTutorialModeRef = useRef(false);
  const isMobileRef = useRef(window.innerWidth <= MOBILE_MAX_WIDTH);

 
  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (!isMobileRef.current) {
        setBlurAmount(0);
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
            console.log("✅ 튜토리얼 4: 0도 또는 360도 조건 충족!");
          } else {
            // 가장 가까운 목표 각도와의 차이를 기준으로 블러 계산
            const minDifference = Math.min(diffFrom0, diffFrom360);
            const blur = Math.min(maxBlur, (minDifference - tolerance) / 3);
            setBlurAmount(blur);
          }
          return;
        }

        // 일반 케이스
        const alphaDifference = Math.abs(alpha - targetAlpha);
        
        if (alphaDifference <= tolerance) {
          setBlurAmount(0);
          setIsUnlocked(true);
          console.log("✅ 언락 조건 충족! blur = 0");
        } else {
          const blur = Math.min(maxBlur, (alphaDifference - tolerance) / 3);
          setBlurAmount(blur);
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
    console.log("🔒 타겟 알파 설정! isUnlocked = false, isTutorial =", isTutorial);
  };

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles,
      setIsUnlocked,
      isUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext);