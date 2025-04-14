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
  const initialAlphaRef = useRef(null);

  // 페이지 로드 시 currentAlpha 초기화
  useEffect(() => {
    setCurrentAlpha(0);
  }, []);

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
    console.log('BlurContext useEffect 실행');
    console.log('안드로이드 기기인가?', navigator.userAgent.toLowerCase().includes('android'));
    console.log('userAgent:', navigator.userAgent);
    
    // 새로고침 시 초기화
    setCurrentAlpha(0);
    initialAlphaRef.current = null;
    
    let isFirstEvent = true;
    
    const handleOrientation = (event) => {
      console.log('deviceorientation 이벤트 발생');
      console.log('event.alpha:', event.alpha);
      
      if (!isMobileRef.current) {
        console.log('모바일 기기가 아님');
        setBlurAmount(0);
        setMenuBlurAmount(0);
        setIsUnlocked(true);
        return;
      }

      if (event.alpha == null) {
        console.log('event.alpha가 null');
        return;
      }
      
      let alpha = event.alpha;
      if (navigator.userAgent.toLowerCase().includes('android')) {
        console.log('안드로이드 기기 처리 시작');
        if (isFirstEvent) {
          console.log('첫 이벤트 각도:', alpha);
          isFirstEvent = false;
          
          // 초기 각도가 80~100도 사이인 경우
          if (alpha >= 80 && alpha <= 100) {
            console.log('보정 전 initialAlphaRef:', alpha);
            initialAlphaRef.current = 90; // 기준점을 90도로 설정
            console.log('보정 후 initialAlphaRef:', initialAlphaRef.current);
          } else {
            initialAlphaRef.current = 90;
          }
        }

        console.log('현재 각도:', alpha);
        console.log('기준 각도:', initialAlphaRef.current);
        
        // 기준점이 90도인 경우, 현재 각도에서 90도를 빼서 0도로 맞춤
        if (initialAlphaRef.current === 90) {
          alpha = (alpha - 90 + 360) % 360;
        } else {
          alpha = (alpha - initialAlphaRef.current + 360) % 360;
        }
        console.log('계산된 각도:', alpha);
      }
      
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
      }

      // 메뉴 블러 처리 (isUnlocked와 독립적으로 실행)
      updateMenuBlur(alpha);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha]);

  // 페이지 변경 시 초기화
  useEffect(() => {
    console.log('페이지 변경 감지 - initialAlphaRef 초기화');
    initialAlphaRef.current = null;
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