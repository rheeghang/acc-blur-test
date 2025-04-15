import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const BlurContext = createContext();
const MOBILE_MAX_WIDTH = 1024; // 태블릿 크기까지 허용
const INITIAL_EVENTS_COUNT = 5; // 처음 5개의 이벤트를 관찰

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
  const eventCountRef = useRef(0);

  // 컴포넌트 마운트 시 강제 초기화
  useEffect(() => {
    console.log("📱 컴포넌트 마운트 - 초기화");
    initialAlphaRef.current = null;
    isFirstEventRef.current = true;
    eventCountRef.current = 0;
    
    // 안드로이드에서 이벤트가 늦게 발생할 수 있으므로 타임아웃 추가
    const timeoutId = setTimeout(() => {
      if (initialAlphaRef.current === null && navigator.userAgent.toLowerCase().includes('android')) {
        console.log("📱 안드로이드 - 강제 초기화");
        initialAlphaRef.current = 0;
        isFirstEventRef.current = false;
        eventCountRef.current = 0;
      }
    }, 1000); // 1초 후에 체크
    
    return () => clearTimeout(timeoutId);
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 페이지 로드 시 currentAlpha 초기화
  useEffect(() => {
    setCurrentAlpha(0);
  }, []);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    // 새로고침 시 초기화
    console.log("📱 targetAlpha 변경 - 초기화");
    
    // 튜토리얼 모드가 아닐 때만 초기화
    if (!isTutorialModeRef.current) {
      initialAlphaRef.current = null;
      eventCountRef.current = 0;
      isFirstEventRef.current = true;
      setCurrentAlpha(0);
    }
    
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
        // 처음 INITIAL_EVENTS_COUNT개의 이벤트 동안 초기값 설정 가능
        if (eventCountRef.current < INITIAL_EVENTS_COUNT) {
          eventCountRef.current++;
          
          // 80~100도 사이의 값이 들어오면 90도로 보정
          if (alpha >= 80 && alpha <= 100) {
            console.log("📱 Found 90 degree initial position");
            initialAlphaRef.current = 90;
            isFirstEventRef.current = false;
          } else if (isFirstEventRef.current) {
            // 첫 이벤트이고 90도가 아닌 경우
            console.log("📱 First event, setting initial alpha:", alpha);
            initialAlphaRef.current = alpha;  // 0 대신 현재 alpha값을 사용
            isFirstEventRef.current = false;
          }
        }

        let correctedAlpha = alpha;
        // 초기값이 설정된 경우에만 보정 적용
        if (initialAlphaRef.current !== null) {
          correctedAlpha = alpha - initialAlphaRef.current;
          
          // 결과값을 -180 ~ 180 범위로 정규화
          if (correctedAlpha > 180) {
            correctedAlpha = correctedAlpha - 360;
          } else if (correctedAlpha < -180) {
            correctedAlpha = correctedAlpha + 360;
          }
        }

        alpha = correctedAlpha;
      }
      
      setCurrentAlpha(alpha);
      
      // 페이지 블러 처리 (isUnlocked에 의존)
      if (!isUnlockedRef.current) {

        if (isNaN(alpha)) {
          return;
        }
        
        if (isUnlockedRef.current && !isNaN(blurAmount)) {
          setBlurAmount(0);
          return;
        }

        const tolerance = 20;
        const maxBlur = 15;

        if (isNaN(alpha)) {
          setBlurAmount(0);
          return;
        }
        
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
    
    // 안드로이드에서 이벤트가 늦게 발생할 수 있으므로 타임아웃 추가
    const timeoutId = setTimeout(() => {
      if (initialAlphaRef.current === null && 
          navigator.userAgent.toLowerCase().includes('android') && 
          !isTutorialModeRef.current) {  // 튜토리얼 모드가 아닐 때만 실행
        console.log("📱 안드로이드 - 강제 초기화 (targetAlpha 변경)");
        initialAlphaRef.current = 0;
        isFirstEventRef.current = false;
        eventCountRef.current = 0;
        setCurrentAlpha(0);
      }
    }, 1500);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      clearTimeout(timeoutId);
    };
  }, [targetAlpha]);

  // 페이지 변경 시 초기화
  useEffect(() => {
    // 안드로이드이고 튜토리얼 모드일 때는 초기화하지 않음
    if (navigator.userAgent.toLowerCase().includes('android') && isTutorialModeRef.current) {
      return;
    }
    
    initialAlphaRef.current = null;
    isFirstEventRef.current = true;
    eventCountRef.current = 0;
    setCurrentAlpha(0);  // currentAlpha도 함께 초기화
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