// src/Pages/Howto.js
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import Menu from '../components/Menu';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import MenuIcon from '../components/MenuIcon';
import { useNavigate } from 'react-router-dom';

const Howto = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { language } = useLanguage();
  const { isOrientationMode, setIsOrientationMode } = useMode();
  const navigate = useNavigate();
  const data = language === 'ko' ? koData : enData;
  const [menuIconColor, setMenuIconColor] = useState('#000000'); // 기본 검정색

  // 로컬 스토리지 연동
  useEffect(() => {
    const savedMode = localStorage.getItem('orientationMode');
    if (savedMode !== null) {
      setIsOrientationMode(savedMode === 'true');
    }
  }, []);

  // 모드 토글 핸들러
  const handleModeToggle = () => {
    const newMode = !isOrientationMode;
    setIsOrientationMode(newMode);
    localStorage.setItem('orientationMode', newMode.toString());
  };

  // 흔들기 감지 설정
  useEffect(() => {
    let lastTime = 0;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    const SHAKE_THRESHOLD = 15;

    const handleShake = (event) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastTime;

      if (timeDiff > 100) {
        const diffX = Math.abs(current.x - lastX);
        const diffY = Math.abs(current.y - lastY);
        const diffZ = Math.abs(current.z - lastZ);

        if (diffX > SHAKE_THRESHOLD || diffY > SHAKE_THRESHOLD || diffZ > SHAKE_THRESHOLD) {
          setShowMenu(true);
        }

        lastTime = currentTime;
        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    window.addEventListener('devicemotion', handleShake);
    return () => window.removeEventListener('devicemotion', handleShake);
  }, []);

  const handlePageChange = (pageNum) => {
    // 페이지 전환 로직 수정
    if (typeof pageNum === 'number') {
      navigate(`/artwork/${pageNum}`);
    } else if (typeof pageNum === 'string') {
      switch(pageNum) {
        case 'home':
          navigate('/');
          break;
        case 'about':
          navigate('/about');
          break;
        default:
          break;
      }
    }
    setShowMenu(false);
  };


  return (
    <Layout>
      <div className="min-h-screen bg-base-color text-black">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="howto-text-container w-[320px] h-[600px] bg-white shadow-xl relative">
                <div className="p-5 pt-8">
                  <h1 className="text-lg text-center font-bold mb-8">
                    {language === 'ko' ? '이 도슨트 웹사이트를 사용하는 방법' : 'How to Use This Website'}
                    </h1>
                  <div className="space-y-4 break-keep text-base">
                    {data.howto?.steps?.map((step, index) => (
                      <p key={index} className="mb-4 leading-relaxed">
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
                
                {/* 하단에 각도 모드 토글 추가 */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
                  <button 
                    onClick={handleModeToggle}
                    className="focus:outline-none"
                    aria-label="모드 전환"
                  >
                    <div className={`relative w-[72px] h-[36px] rounded-full transition-colors duration-200 ease-in-out ${
                      isOrientationMode ? 'bg-black' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-0.5 flex items-center justify-center w-[32px] h-[32px] rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        isOrientationMode ? 'translate-x-[38px]' : 'translate-x-0.5'
                      }`}>
                        <span className="text-xs font-medium text-gray-500">
                          {isOrientationMode ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed top-5 right-5 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className={`menu-icon rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-all z-100 bg-black`}
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
              <MenuIcon color={menuIconColor} />
            )}
          </button>
        </div>

        {showMenu && (
          <Menu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            onPageSelect={handlePageChange}
            pageNumber="howto"
            pageType="howto"
          />
        )}
      </div>
    </Layout>
  );
};

export default Howto;