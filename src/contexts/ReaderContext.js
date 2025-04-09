import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const ReaderContext = createContext();

export const ReaderProvider = ({ children }) => {
  const { language } = useLanguage();
  const data = language === 'ko' ? koData : enData;

  const [isReaderEnabled, setIsReaderEnabled] = useState(false); // 기본값 false

  useEffect(() => {
    const checkVoiceOver = () => {
      // iOS VoiceOver 감지
      const isVoiceOverActive = 
        // 1. aria-live 요소가 있는지 확인
        document.querySelectorAll('[aria-live]').length > 0 ||
        // 2. role="alert" 요소가 있는지 확인
        document.querySelectorAll('[role="alert"]').length > 0 ||
        // 3. VoiceOver가 활성화되면 추가되는 클래스 확인
        document.documentElement.classList.contains('no-touch') ||
        // 4. VoiceOver 커서 확인
        document.querySelector('*:focus') !== null;

      console.log("VoiceOver 감지 상태:", isVoiceOverActive);
      setIsReaderEnabled(isVoiceOverActive);
    };

    // 초기 체크
    checkVoiceOver();

    // VoiceOver 상태 변경 감지를 위한 이벤트 리스너들
    document.addEventListener('focusin', checkVoiceOver);
    document.addEventListener('focusout', checkVoiceOver);
    
    return () => {
      document.removeEventListener('focusin', checkVoiceOver);
      document.removeEventListener('focusout', checkVoiceOver);
    };
  }, []);

  // 페이지별 추가 안내 메시지
  const additionalGuidance = {
    home: {
      enter: {
        ko: "화면을 보면 중앙에 사각형이 있습니다. 기기를 움직이면 사각형이 회전합니다.",
        en: "There is a square in the center of the screen. The square rotates as you move your device."
      },
      start: {
        ko: "시작하기 버튼이 나타났습니다. 화면을 빠르게 세번 터치하여 시작해주세요.",
        en: "The start button has appeared. Tap the screen three times quickly to start."
      }
    },
    tutorial: {
      navigation: {
        ko: "시계 반대 방향으로 기기를 조금만 돌려보세요.",
        en: "Try rotating the device slightly in the opposite direction of the clock."
      },
      next: {
        ko: "화면을 빠르게 세번 터치하여 다음으로 이동해주세요.",
        en: "Tap the screen three times quickly to move to the next step."
      },
      completion: {
        ko: "화면을 빠르게 세번 터치하여 메뉴를 열어주세요.",
        en: "Tap the screen three times quickly to open the menu."
      }
    },
    artwork: {
      navigation: {
        ko: "현재 {artwork} 작품을 보고 있습니다. 화면을 천천히 회전하며 작품 설명을 찾아보세요.",
        en: "You are currently viewing {artwork}. Rotate the screen slowly to find the artwork description."
      }
    }
  };

  // 텍스트 읽기 함수
  const speak = (text) => {
    if (!isReaderEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // json 데이터에서 페이지 컨텐츠 읽기
  const readPageContent = (pageKey, section) => {
    if (!isReaderEnabled || !data[pageKey]) return;
    const content = data[pageKey][section];
    if (content) speak(content);
  };

  // 추가 안내 메시지 읽기
  const readGuidance = (pageKey, section) => {
    if (!isReaderEnabled || !additionalGuidance[pageKey]) return;
    const guidance = additionalGuidance[pageKey][section]?.[language];
    if (guidance) speak(guidance);
  };

  return (
    <ReaderContext.Provider
      value={{
        isReaderEnabled,
        speak,
        readPageContent,
        readGuidance
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};

export const useReader = () => {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
}; 