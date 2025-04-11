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
      // iOS 기기이고 권한 요청이 필요한 경우
      if (isIOSDevice() && typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log("iOS 기기 감지됨 - 권한 요청 시도");
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          console.log("권한 응답:", permission);
          if (permission === 'granted') {
            console.log("권한 승인됨");
            onConfirm();
          } else {
            console.log("권한 거부됨");
            alert("방향 감지 센서 권한이 필요합니다. 설정에서 권한을 허용해주세요.");
          }
        } catch (permissionError) {
          console.error("권한 요청 중 오류:", permissionError);
          if (window.confirm("센서 권한 요청에 실패했습니다. 계속 진행하시겠습니까?")) {
            onConfirm();
          }
        }
      } else {
        // iOS가 아니거나 권한 요청이 필요없는 기기
        console.log("non-iOS 기기 감지됨 또는 권한 요청 불필요 - 권한 요청 없이 진행");
        onConfirm();
      }
    } catch (error) {
      console.error('전체 처리 실패:', error);
      if (window.confirm("센서 접근에 문제가 발생했습니다. 계속 진행하시겠습니까?")) {
        onConfirm();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 transition-opacity pointer-events-none" />
      <div className="relative z-[101] w-80 rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900 select-none">
          센서 권한을 허용해 주세요
        </h3>
        <p className="mb-6 text-gray-600 select-none">
          "작품 감상을 위해 기기의 방향 감지 센서를 허용해 주세요."
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            handlePermissionRequest();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePermissionRequest();
          }}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors active:bg-gray-800"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          "허용 후 계속하기"
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
    <div className="text-xl font-bold text-black">
      <button 
        onClick={(e) => handleLanguageSelect('ko', e)}
        onTouchStart={(e) => handleLanguageSelect('ko', e)}
        className={`px-3 py-2 ${language === 'ko' ? 'text-black' : 'text-gray-400'}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={language === 'ko' ? "한국어 선택됨" : "한국어로 변경"}
      >
        Ko
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
  const [alpha, setAlpha] = useState(0);
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
    setAlpha(event.alpha || 0);
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

  const oppositeAlpha = (alpha + 180) % 360;

  return (
    <Layout>
      <div 
        className="container h-full overflow-y-auto overflow-x-hidden flex flex-col p-10 text-black leading-relaxed z-10"
        style={{
          background: `linear-gradient(to left, #FFEA7B ${gradientRatio - 15}%, #FACFB9 ${gradientRatio + 15}%)`
        }}>
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
            <p className="angle-text text-xl font-lg text-black" aria-hidden="true">{Math.round(alpha)}°</p>
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
              transition: "transform 0.05s linear, border-radius 0s linear",
              transform: `rotate(${currentAlpha - 90}deg)`,
              width: '250px',
              height: '250px',
              borderRadius: (() => {
                if ((currentAlpha >= 40 && currentAlpha <= 90) || 
                    (currentAlpha >= 270 && currentAlpha <= 320)) {
                  return '999px';
                }
                return '0px';
              })()
            }}
          />
        </div>

        <div className="bottom-content fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
          <button 
            onTouchStart={handleStart}
            className="start-button rounded-full w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-2xl"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              opacity: startButtonOpacity,
              transition: 'opacity 2s ease-in',
              pointerEvents: startButtonOpacity === 1 ? 'auto' : 'none'
            }}
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