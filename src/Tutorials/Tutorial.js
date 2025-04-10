import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useBlur } from '../contexts/BlurContext';
import { useGuide } from '../contexts/GuideContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import pageConfig from '../config/pages.json';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import MenuIcon from '../components/MenuIcon';
import Menu from '../components/Menu';
import { useReader } from '../contexts/ReaderContext';
import Guide from '../components/Guide';

const Tutorial = () => {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  
  // tutorialStep 초기값 설정
  const [tutorialStep, setTutorialStep] = useState(() => {
    const step = Number(stepParam);
    return isNaN(step) || step < 1 || step > 4 ? 1 : step;
  });

  const [hasIntroSpoken, setHasIntroSpoken] = useState(false);
  const [hasContentAnnounced, setHasContentAnnounced] = useState(false);
  const [alphaInit, setAlphaInit] = useState(null);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [currentBeta, setCurrentBeta] = useState(0);
  const [currentGamma, setCurrentGamma] = useState(0);
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const { blurAmount, setTargetAngles, isUnlocked } = useBlur();
  const { showGuideMessage } = useGuide();
  const { language } = useLanguage();
  const data = language === 'ko' ? koData : enData;
  const { readGuidance, readPageContent } = useReader();
  const [showGuide, setShowGuide] = useState(true);
  const [lastInputType, setLastInputType] = useState(null);
  const [showIntroMessage, setShowIntroMessage] = useState(false); // New state for intro message

  // 현재 설정 가져오기
  const currentConfig = pageConfig.tutorial[tutorialStep];

  // 모든 useEffect를 조건문 밖으로 이동
  useEffect(() => {
    const step = Number(stepParam);
    if (isNaN(step) || step < 1 || step > 4) {
      setTutorialStep(1);
      return;
    }
    setTutorialStep(step);
  }, [stepParam]);

  useEffect(() => {
    if (currentConfig) {
      setTargetAngles(currentConfig.targetAlpha);
    }
  }, [tutorialStep]);

  // Show intro message on tutorial step change
  useEffect(() => {
    setShowIntroMessage(true);
    const timer = setTimeout(() => {
      setShowIntroMessage(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [tutorialStep]);

  // 컴포넌트 마운트 시 전체 상태 확인
  useEffect(() => {
    console.log("📱 Tutorial 컴포넌트 마운트");
    console.log("📱 Reader 초기 상태:", {
      readGuidance: !!readGuidance,
      readPageContent: !!readPageContent,
    });
    console.log("📱 기타 상태:", {
      tutorialStep,
      blurAmount,
      language,
    });
  }, []); // 마운트 시에만 실행

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasIntroSpoken(true);
    }, 3000); // Adjust timing based on the intro text duration
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (blurAmount === 0 && hasIntroSpoken && !hasContentAnnounced && !showIntroMessage) {
      setHasContentAnnounced(true);
    }
  }, [blurAmount, hasIntroSpoken, hasContentAnnounced, showIntroMessage]);

  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;

      setCurrentAlpha(alpha);
      setCurrentBeta(beta);
      setCurrentGamma(gamma);

      if (alphaInit === null) {
        setAlphaInit(alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [alphaInit]);

  useEffect(() => {
    const originalShakeEvent = window.onshake;

    return () => {
      window.onshake = originalShakeEvent;
    };
  }, [tutorialStep]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGuide(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleTripleTap = (() => {
    const tapTimes = [];
    let lastTapType = null;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log("🔧 초기 상태:", {
      디바이스: isMobile ? "모바일" : "PC"
    });

    return (e) => {
      const eventType = e.type;

      // 👇 같은 클릭이 touch → click 두 번 감지될 경우 무시
      if (lastInputType === 'touchstart' && eventType === 'click') {
        console.log("⚠️ touch → click 중복 감지, click 무시");
        return;
      }
      
      setLastInputType(eventType);
      
      const now = Date.now();
      
      // 1초 이상 된 탭 제거
      while (tapTimes.length > 0 && now - tapTimes[0] > 1000) {
        console.log("⏰ 오래된 탭 제거됨");
        tapTimes.shift();
      }
      
      tapTimes.push(now);
      console.log("👆 탭/클릭 감지됨:", {
        횟수: tapTimes.length,
        이벤트: e.type,
        시간: new Date().toLocaleTimeString()
      });
      
      if (tapTimes.length === 3 && tapTimes[2] - tapTimes[0] <= 1000) {
        console.log("✨ 트리플 탭 감지!", {
          총소요시간: `${tapTimes[2] - tapTimes[0]}ms`,
          탭간격: [
            `1-2: ${tapTimes[1] - tapTimes[0]}ms`,
            `2-3: ${tapTimes[2] - tapTimes[1]}ms`
          ]
        });
        
        if (tutorialStep === 4) {
          setShowMenu((prev) => !prev);
        } else {
          handleTutorialNext();
        }
        tapTimes.length = 0;
        
        if (window.navigator.vibrate) {
          window.navigator.vibrate(200);
        }
      }
    };
  })();

  const handleOpenMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setTimeout(() => {
      setShowMenu(true);
    }, 100);
  };

  const handleTutorialNext = () => {
    if (tutorialStep < 4) {
      const nextStep = tutorialStep + 1;
      setTutorialStep(nextStep);
    } else {
      window.location.href = '/artwork/1';
    }
  };

  const handleTutorialPrev = () => {
    if (tutorialStep > 1) {
      const prevStep = tutorialStep - 1;
      setTutorialStep(prevStep);
    }
  };

  const handlePageChange = (newPage) => {
    setShowMenu(false);
    setOutOfRangeStartTime(null);
    
    if (newPage === 'home') {
      window.location.href = '/';
    } else if (newPage === 'about') {
      window.location.href = '/about';
    } else if (newPage === 'tutorial') {
      setTutorialStep(1);
    } else {
      window.location.href = `/artwork/${newPage}`;
    }
  };

  // 튜토리얼 메시지를 동적으로 가져오는 함수
  const getTutorialMessage = (step) => {
    return data.tutorial[`step${step}`];
  };


  return (
    <Layout>
      <div 
        className="relative min-h-screen overflow-hidden bg-base-color"
        onTouchStart={(e) => {
          // 메뉴 아이콘이나 튜토리얼 버튼 영역이면 트리플 탭 처리하지 않음
          if (!e.target.closest('.tutorial-button') && !e.target.closest('.menu-icon')) {
            handleTripleTap(e);
          }
        }}
        onClick={(e) => {
          // 메뉴 아이콘이나 튜토리얼 버튼 영역이면 트리플 탭 처리하지 않음
          if (!e.target.closest('.tutorial-button') && !e.target.closest('.menu-icon')) {
            handleTripleTap(e);
          }
        }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        role="button"
      >
       
        {showIntroMessage && (
          <div aria-live="polite" className="sr-only">
            시계 반대 방향으로 기기를 조금만 돌려보세요.
          </div>
        )}

        {hasContentAnnounced && (
          <div aria-live="polite" className="sr-only">
            {getTutorialMessage(tutorialStep)}
            {tutorialStep === 4 
              ? "화면을 빠르게 세번 터치하여 메뉴를 열어주세요."
              : "화면을 빠르게 세번 터치하여 다음으로 이동해주세요."
            }
          </div>
        )}

        <Guide 
          show={showGuide} 
          language={language}
          fullscreen={true}
        />

        <div className="fixed top-2 left-0 right-0 text-center z-10">
          {(tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4) && (
            <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
          )}
        </div>

        {tutorialStep === 4 && (
          <button
            className={`fixed top-3 right-3 cursor-pointer menu-icon rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 transition-all z-50 bg-key-color ${
              isUnlocked && !showMenu ? 'animate-pulse-scale' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (isUnlocked || showMenu) {
                setShowMenu(!showMenu);
              }
            }}
            style={{ 
              pointerEvents: isUnlocked || showMenu ? 'auto' : 'none',
              border: 'none',
              padding: 0,
              transition: 'all 0.3s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
            aria-label={showMenu ? "메뉴 닫기" : "메뉴 열기"}
          >
            {showMenu ? (
              <svg 
                width="30" 
                height="30" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <MenuIcon />
            )}
          </button>
        )}

        <div 
          className="fixed left-1/2 -translate-x-1/2 z-0"
          style={{
            ...currentConfig.style,
            transform: `translate(-50%, -50%) rotate(${currentConfig.rotationAngle}deg)`,
            transformOrigin: 'center center',
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease, transform 0.3s ease, top 0.3s ease',
            width: currentConfig.style.width,
            top: '50%'
          }}
        >
          <div className={`p-4 ${currentConfig.bgColor} shadow-lg relative`} aria-hidden={true}>
            <p className={`text-lg leading-relaxed ${currentConfig.textColor} break-keep ${tutorialStep === 4 ? 'mb-0' : 'mb-8'}`}>
              {data.tutorial[`step${tutorialStep}`]}
            </p>
            
            <div className={`${tutorialStep === 4 ? 'mt-0' : 'mt-14'}`}>
              {tutorialStep !== 4 && (
                <div
                  className="absolute bottom-2 right-2 cursor-pointer tutorial-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isUnlocked) {
                      handleTutorialNext();
                    }
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (isUnlocked) {
                      handleTutorialNext();
                    }
                  }}
                  style={{ 
                    pointerEvents: isUnlocked ? 'auto' : 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                  aria-label={language === 'ko' ? "다음 단계로" : "Next step"}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" 
                      stroke="#FF5218" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {showMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Menu
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              onPageSelect={handlePageChange}
              pageNumber={tutorialStep}
              pageType="tutorial"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tutorial;