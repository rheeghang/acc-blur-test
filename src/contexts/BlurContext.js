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
  const initialAlphaRef = useRef(null);
  const isFirstEventRef = useRef(true);

  // 페이지 로드 시 currentAlpha 초기화
  useEffect(() => {
    setCurrentAlpha(0);
  }, []);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    // 새로고침 시 초기화
    setCurrentAlpha(0);
    initialAlphaRef.current = null;
    
    const handleOrientation = (event) => {
      if (!isMobileRef.current) {
        setBlurAmount(0);
        setIsUnlocked(true);
        return;
      }

      if (event.alpha == null) {
        return;
      }
      
      let alpha = event.alpha;
      // alpha 값을 -180 ~ 180 범위로 정규화
      if (alpha > 180) {
        alpha = alpha - 360;
      }
      
      if (navigator.userAgent.toLowerCase().includes('android')) {
        if (isFirstEventRef.current) {
          isFirstEventRef.current = false;
          
          // 초기 각도가 80~100도 사이인 경우
          if (alpha >= 80 && alpha <= 100) {
            initialAlphaRef.current = 90; // 기준점을 90도로 설정
          } else {
            initialAlphaRef.current = 0;
          }
        }
        
        // 기준점이 90도인 경우, 현재 각도에서 90도를 빼서 0도로 맞춤
        if (initialAlphaRef.current === 90) {
          alpha = alpha - 90;
        } else {
          alpha = alpha - initialAlphaRef.current;
        }
        
        // 결과값을 -180 ~ 180 범위로 정규화
        if (alpha > 180) {
          alpha = alpha - 360;
        } else if (alpha < -180) {
          alpha = alpha + 360;
        }
      }
      
      setCurrentAlpha(alpha);
      
      // 페이지 블러 처리 (isUnlocked에 의존)
      if (!isUnlockedRef.current) {
        const tolerance = 20;
        const maxBlur = 15;
        
        // 일반 케이스
        const alphaDifference = Math.min(
          Math.abs(alpha - targetAlpha)
        );
        
        if (alphaDifference <= tolerance) {
          setBlurAmount(0);
          setIsUnlocked(true);
        } else {
          const blur = Math.min(maxBlur, (alphaDifference - tolerance) / 3);
          setBlurAmount(blur);
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha]);

  // 페이지 변경 시 초기화
  useEffect(() => {
    // 안드로이드이고 튜토리얼 모드일 때는 초기화하지 않음
    if (navigator.userAgent.toLowerCase().includes('android') && isTutorialModeRef.current) {
      return;
    }
    
    initialAlphaRef.current = null;
    isFirstEventRef.current = true;
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
      isUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext);