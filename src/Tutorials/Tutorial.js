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
  const [isIntroMessageActive, setIsIntroMessageActive] = useState(false);
  const { blurAmount, setTargetAngles, isUnlocked, setIsUnlocked } = useBlur();
  const { showGuideMessage } = useGuide();
  const { language } = useLanguage();
  const data = language === 'ko' ? koData : enData;
  const [showGuide, setShowGuide] = useState(true);
  const [lastInputType, setLastInputType] = useState(null);
  const [showIntroMessage, setShowIntroMessage] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

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
    setHasContentAnnounced(false);
    setShowIntroMessage(true);
    
    // 스텝 4일 때는 다른 메시지 출력
    if (tutorialStep === 4) {
      // 먼저 holdStraight 메시지를 표시
      const timer1 = setTimeout(() => {
        setShowIntroMessage(false);
      }, 3000);
      
      // 그 다음에 성공 메시지를 표시 (타임아웃 + blurAmount === 0 조건)
      const timer2 = setTimeout(() => {
        if (blurAmount === 0) {
          setShowIntroMessage(true);
          setHasContentAnnounced(true);
        }
      }, 3500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      const timer = setTimeout(() => {
        setShowIntroMessage(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [tutorialStep, blurAmount]);

  // 컴포넌트 마운트 시 전체 상태 확인
  useEffect(() => {
    console.log("📱 Tutorial 컴포넌트 마운트");
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
    if (showIntroMessage) {
      setIsIntroMessageActive(true);
      const timer = setTimeout(() => {
        setIsIntroMessageActive(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showIntroMessage]);

  useEffect(() => {
    if (blurAmount === 0 && hasIntroSpoken && !hasContentAnnounced && !isIntroMessageActive) {
      setHasContentAnnounced(true);
    }
  }, [blurAmount, hasIntroSpoken, hasContentAnnounced, isIntroMessageActive]);

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

  useEffect(() => {
    document.documentElement.style.setProperty('--rotation-angle', `${currentConfig.rotationAngle}deg`);
  }, [currentConfig.rotationAngle]);

  const handleTutorialNext = () => {
    if (isAdvancing) return; // 이미 진행 중이면 중복 실행 방지
    setIsAdvancing(true);
    
    if (tutorialStep < 4) {
      const nextStep = tutorialStep + 1;
      setTutorialStep(nextStep);
      setIsUnlocked(false); // 다음 스텝으로 넘어갈 때 isUnlocked 리셋
    } else {
      window.location.href = '/artwork/1';
    }
    
    // 일정 시간 후에 플래그 초기화
    setTimeout(() => {
      setIsAdvancing(false);
    }, 500);
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
    return data.tutorial.steps[`step${step}`];
  };

  // 회전 안내 메시지 선택 함수
  const getRotationGuidance = (step) => {
    if (step === 4) {
      return data.tutorial.guidance.holdStraight;
    }
    return data.tutorial.guidance.rotate;
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 즉시 안내 메시지 표시
    setShowIntroMessage(true);
  }, []);

  return (
    <Layout>
      <div 
        className="tutorial-container relative min-h-screen w-full overflow-hidden bg-[#B7B7B7]"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
       
        {showIntroMessage && (
          <div aria-live="assertive" className="sr-only">
            {getRotationGuidance(tutorialStep)}
          </div>
        )}

        {((blurAmount === 0 && hasIntroSpoken) || hasContentAnnounced) && (
          <div 
            aria-live="assertive" 
            className="sr-only"
          >
            {getTutorialMessage(tutorialStep)}
            {tutorialStep === 4 
              ? data.tutorial.guidance.menu
              : data.tutorial.guidance.next
            }
          </div>
        )}

        <Guide 
          show={showGuide} 
          language={language}
          fullscreen={true}
        />

        <div className="fixed top-2 left-0 right-0 text-center z-10" aria-hidden="true">
          {(tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4) && (
            <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
          )}
        </div>

        {tutorialStep === 4 && !showMenu && (
          <button
            className={`menu-icon fixed top-5 right-5 cursor-pointer rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 transition-all z-50 bg-black ${
              isUnlocked && !showMenu ? 'animate-pulse-scale' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (blurAmount === 0 || showMenu) {
                setShowMenu(!showMenu);
              }
            }}
            style={{ 
              pointerEvents: blurAmount === 0 || showMenu ? 'auto' : 'none',
              border: 'none',
              padding: 0,
              transition: 'all 0.3s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
            aria-label={showMenu ? "메뉴 닫기" : "메뉴 열기"}
          >
            <MenuIcon />
          </button>
        )}

        <div 
          className="tutorial-textbox font-medium fixed left-1/2 -translate-x-1/2 z-0"
          style={{
            ...currentConfig.style,
            transform: `translate(-50%, -50%) rotate(var(--rotation-angle))`,
            transformOrigin: 'center center',
            filter: isUnlocked ? 'none' : `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease, transform 0.3s ease, top 0.3s ease',
            width: currentConfig.style.width,
            top: '50%'
          }}
        >
          <button 
            className={`p-4 shadow-lg relative w-full font-medium ${
              tutorialStep === 4 ? 'bg-key-color text-center' : 'bg-white text-left'
            }`}
            aria-hidden={blurAmount !== 0}
            onClick={(e) => {
              e.stopPropagation();
              if (blurAmount === 0 && !isAdvancing && tutorialStep !== 4) {
                handleTutorialNext();
              }
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (blurAmount === 0 && !isAdvancing && tutorialStep !== 4) {
                handleTutorialNext();
              }
            }}
            style={{
              border: 'none',
              cursor: blurAmount === 0 && tutorialStep !== 4 ? 'pointer' : 'default',
              pointerEvents: blurAmount === 0 ? 'auto' : 'none'
            }}
            disabled={blurAmount !== 0 || tutorialStep === 4}
            tabIndex={blurAmount === 0 ? 0 : -1}
            role="button"
            aria-label={language === 'ko' ? "다음 단계로" : "Next step"}
          >
            <p className={`text-lg leading-relaxed ${currentConfig.textColor} break-keep ${tutorialStep === 4 ? 'mb-0' : 'mb-8'}`}>
              {data.tutorial.steps[`step${tutorialStep}`]}
            </p>
            
            <div className={`${tutorialStep === 4 ? 'mt-0' : 'mt-14'} relative`}>
              {tutorialStep !== 4 && (
                <svg 
                  className="absolute bottom-2 right-2"
                  role="img"
                  aria-hidden="true"
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                    stroke="black" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>
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