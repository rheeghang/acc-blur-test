import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import { useBlur } from '../contexts/BlurContext';

const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLegacyIOS = () => {
    const match = navigator.userAgent.match(/OS (\d+)_/);
    return match && parseInt(match[1], 10) < 13;
  };
  
  const modalMessage = isLegacyIOS() 
    ? "iOS 13 이하 디바이스에선 방향 센서 사용이 어려운 기기입니다. 데스크에 문의해 주세요."
    : "작품 감상을 위해 기기의 방향 감지 센서를 허용해 주세요.";
  const buttonText = isLegacyIOS() ? "확인" : "허용 후 계속하기";

  if (!isMobile) return null;

  const handlePermissionRequest = async (e) => {
    if (isLegacyIOS()) {
      onClose();
      return;
    }

    try {
      // iOS 13+ 디바이스(iPhone/iPad)에서 권한 요청
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          onConfirm();
        } else {
          console.error('방향 감지 센서 권한이 거부되었습니다.');
        }
      } else {
        // 안드로이드나 이전 버전 iOS 디바이스
        onConfirm();
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
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
          {modalMessage}
        </p>
        <button
          onClick={handlePermissionRequest}
          onTouchStart={(e) => {
            e.stopPropagation();
            handlePermissionRequest();
          }}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors active:bg-gray-800"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const LanguageSelector = ({ language, onLanguageChange }) => {
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

const isIOS = () => {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      if (isIOS()) {
        setShowModal(true);
      } else {
        setPermissionGranted(true);
        setShowModal(false);
      }
    } else {
      setPermissionGranted(true);
      setShowModal(false);
    }
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
      const timer = setTimeout(() => {
        setShowStartMessage(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [permissionGranted, introSpoken]);

  // 화면 처음 로드될 때 enter 메시지 재생
  useEffect(() => {
    if (!initialEnterSpoken) {
      setInitialEnterSpoken(true);
    }
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
            setIntroSpoken(true);
          }}
        />

        {/* intro 메시지 - 허용 버튼 클릭 후 */}
        {permissionGranted && !introSpoken && (
          <div 
            aria-live="polite" 
            className="sr-only"
          >
            {data.home1.guidance.intro}
          </div>
        )}

        {/* start 메시지 - 2초 후 */}
        {showStartMessage && (
          <div 
            aria-live="assertive" 
            className="sr-only"
          >
            {data.home1.guidance.start}
          </div>
        )}

        <div className="fixed bottom-[23vh] left-2 right-0 flex flex-col items-center space-y-2 text-center z-10">
          <div className="items-center space-y-2 text-center font-bold text-black">
            <p className="text-xl font-lg text-black" aria-hidden="true">{Math.round(alpha)}°</p>
          </div>
        </div>

        <div className="fixed top-0 left-0 right-0 flex items-center justify-center z-10">
          <img 
            src="/title.png" 
            alt="우리의 몸에는 타인이 깃든다." 
            className="w-[80vw] h-auto"
          />
        </div>

        <div className="fixed inset-0 flex items-center justify-center z-0">
          <div className="bg-key-gradient shadow-lg"
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

        <div className="fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
          <button 
            onTouchStart={(e) => {
              e.preventDefault();
              if (startButtonOpacity === 1) {
                handleStart();
              }
            }}
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
            />
          </div>
        </div>
      </div>
      </div>

    </Layout>
  );
};

export default Home;