import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import { useBlur } from '../contexts/BlurContext';

const MOBILE_MAX_WIDTH = 1024; // 태블릿 크기까지 허용

// iOS 체크 함수
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// 모바일 기기 체크 함수 수정
const isMobileDevice = () => {
  return window.innerWidth <= MOBILE_MAX_WIDTH;
};

// iOS 버전 체크 함수 추가 (Modal 컴포넌트 위에)
const getIOSVersion = () => {
  const agent = window.navigator.userAgent;
  const start = agent.indexOf('OS ');
  if ((agent.indexOf('iPhone') > -1 || agent.indexOf('iPad') > -1) && start > -1) {
    return parseInt(agent.substr(start + 3, 2), 10);
  }
  return 0;
};

const Modal = ({ isOpen, onClose, onConfirm, className }) => {
  if (!isOpen) return null;

  // PC 체크
  if (window.innerWidth > MOBILE_MAX_WIDTH) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 transition-opacity pointer-events-none" />
        <div className="relative z-[101] w-80 rounded-lg bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-xl font-bold text-gray-900 select-none">
            모바일로 접속해 주세요
          </h3>
          <p className="mb-6 text-gray-600 select-none">
            이 작품은 모바일 기기에서만 감상하실 수 있습니다.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors active:bg-gray-800"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  const handlePermissionRequest = async (e) => {
    try {
      
      // iOS 기기에서 DeviceOrientationEvent.requestPermission 함수가 있는지 확인
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        
        // 직접 권한 요청 실행
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            console.log("🟢 권한 응답:", permissionState);
            if (permissionState === 'granted') {
              console.log("✅ 권한 허용됨");
              onConfirm();
            }
          })
          .catch(error => {
            console.error('권한 요청 에러:', error);
            // 에러 발생시에도 계속 진행
            onConfirm();
          });
      } else {
        // iOS가 아니거나 iOS 13 미만인 경우
        console.log("📱 non-iOS 기기 또는 iOS 13 미만");
        onConfirm();
      }
    } catch (error) {
      console.log('권한 요청 처리 에러:', error);
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 transition-opacity pointer-events-none" />
      <div className="relative z-[101] w-80 rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900 select-none" aria-hidden="true">
          센서 접근 권한을 허용해 주세요
        </h3>
        <p className="mb-6 text-gray-600 select-none">
          작품 감상을 위해 아래 버튼을 눌러 기기의 방향 감지 센서 사용을 허용해 주세요.
        </p>
        <button
          onClick={handlePermissionRequest}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors active:bg-gray-800"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          허용 후 계속하기
        </button>
      </div>
    </div>
  );
};

const LanguageSelector = ({ language, onLanguageChange, className }) => {
  const handleLanguageSelect = (lang, e) => {
    e.preventDefault();
    e.stopPropagation();
    onLanguageChange(lang);
  };

  return (
    <div className="fixed bottom-[15vh] left-0 right-0 flex justify-center">
    <div className="language-selector text-xl font-bold text-black">
      <button 
        onClick={(e) => handleLanguageSelect('ko', e)}
        onTouchStart={(e) => handleLanguageSelect('ko', e)}
        className={`px-3 py-2 ${language === 'ko' ? 'text-black' : 'text-gray-400'}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={language === 'ko' ? "한국어 선택됨" : "한국어로 변경"}
      >
        Kr
      </button>
      <span className="mx-2" aria-hidden="true">|</span>
      <button 
        onClick={(e) => handleLanguageSelect('en', e)}
        onTouchStart={(e) => handleLanguageSelect('en', e)}
        className={`px-3 py-2 ${language === 'en' ? 'text-black' : 'text-gray-400'}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={language === 'en' ? "English selected" : "Change to English"}
      >
        En
      </button>
    </div>
    </div>
  );
};

const Home = () => {
  const [gamma, setGamma] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [startButtonOpacity, setStartButtonOpacity] = useState(0);
  const [introSpoken, setIntroSpoken] = useState(false);
  const [showStartMessage, setShowStartMessage] = useState(false);
  const [initialEnterSpoken, setInitialEnterSpoken] = useState(false);
  const [introMessageComplete, setIntroMessageComplete] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const data = language === 'ko' ? koData : enData;
  const gradientRatio = Math.min(100, Math.max(0, ((gamma + 90) / 180) * 100));
  const { currentAlpha } = useBlur();

  const handleOrientation = (event) => {
    setGamma(event.gamma || 0);
  };

  useEffect(() => {
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  useEffect(() => {
    setShowModal(true);  // 항상 모달을 표시하고, Modal 컴포넌트에서 내용을 결정
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setTimeout(() => {
        setStartButtonOpacity(1);
      }, 100);
    }, 4000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = '/title.png';
  }, []);

  useEffect(() => {
    if (permissionGranted && !introSpoken) {
      // intro 메시지가 읽히는데 충분한 시간을 줌 (예: 4초)
      const introTimer = setTimeout(() => {
        setIntroMessageComplete(true);
      }, 4000);

      // start 메시지는 intro 메시지가 완료된 후에 표시
      if (introMessageComplete) {
        const startTimer = setTimeout(() => {
          setShowStartMessage(true);
        }, 1000); // intro 완료 1초 후 start 메시지
        return () => clearTimeout(startTimer);
      }

      return () => clearTimeout(introTimer);
    }
  }, [permissionGranted, introSpoken, introMessageComplete]);

  // 화면 처음 로드될 때 enter 메시지 재생
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialEnterSpoken(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    navigate('/tutorial/step/1');
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const oppositeAlpha = (gamma + 180) % 360;

  return (
    <Layout>
      <div 
        className="home-container h-full overflow-y-auto overflow-x-hidden flex flex-col p-10 text-black leading-relaxed z-10"
        style={{
          background: `linear-gradient(to left, #FFEA7B ${gradientRatio - 15}%, #FACFB9 ${gradientRatio + 15}%)`
        }}
        role="region"
      >
      <div className="min-h-screen p-4 relative flex flex-col">
        {/* 초기 enter 메시지 */}
        {!initialEnterSpoken && (
          <div 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {data.home1.guidance.enter}
          </div>
        )}

        <Modal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setPermissionGranted(true);
            setShowModal(false);
            setTimeout(() => {
              setIntroSpoken(true);
            }, 4500);
          }}
          className="modal-content"
        />

        {/* intro 메시지 - 허용 버튼 클릭 후 */}
        {permissionGranted && !introSpoken && !introMessageComplete && (
          <div 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {data.home1.guidance.intro}
          </div>
        )}

        {/* start 메시지 - intro 메시지 완료 후 */}
        {showStartMessage && introMessageComplete && (
          <div 
            aria-live="assertive" 
            aria-atomic="true"
            className="sr-only"
          >
            {data.home1.guidance.start}
          </div>
        )}

        <div className="fixed bottom-[23vh] left-2 right-0 flex flex-col items-center space-y-2 text-center z-10">
          <div className="items-center space-y-2 text-center font-bold text-black">
            <p className="angle-text text-xl font-lg text-black" aria-hidden="true">{Math.round(currentAlpha)}°</p>
          </div>
        </div>

        <div className="fixed top-0 left-0 right-0 flex items-center justify-center z-10" aria-hidden="true">
          <img 
            src="/title.png" 
            alt="우리의 몸에는 타인이 깃든다." 
            className="title-image w-[80vw] h-auto"
          />
        </div>

        <div className="fixed inset-0 flex items-center justify-center z-0">
          <div className="center-box bg-key-gradient shadow-lg"
            style={{
              transition: "transform 0.05s linear, border-radius 0.3s ease-in-out",
              transform: `rotate(${(currentAlpha > 180 ? currentAlpha - 360 : currentAlpha) - 90}deg)`,
              width: '250px',
              height: '250px',
              borderRadius: (() => {
                const normalizedAlpha = currentAlpha > 180 ? currentAlpha - 360 : currentAlpha;
                const absAlpha = Math.abs(normalizedAlpha);
                
                // 40도에서 90도 사이에서 점진적으로 변화
                if (absAlpha >= 40 && absAlpha <= 90) {
                  // 40도에서 90도 사이의 값을 0에서 1 사이의 값으로 정규화
                  const progress = (absAlpha - 40) / 50;
                  // 정규화된 값을 이용해 border-radius를 계산
                  return `${progress * 999}px`;
                }
                return '0px';
              })()
            }}
          />
        </div>

        <div className="bottom-content fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleStart();
            }}
            className="start-button rounded-full w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-2xl"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              opacity: startButtonOpacity,
              transition: 'opacity 2s ease-in',
              pointerEvents: startButtonOpacity === 1 ? 'auto' : 'none'
            }}
            role="button"
            aria-label={data.home1.startButton}
            tabIndex={startButtonOpacity === 1 ? 0 : -1}
          >
            {data.home1.startButton}
          </button>
          
          <div className="mt-4">
            <LanguageSelector 
              language={language}
              onLanguageChange={handleLanguageChange}
              className="language-selector"
            />
          </div>
        </div>
      </div>
      </div>

    </Layout>
  );
};

export default Home;