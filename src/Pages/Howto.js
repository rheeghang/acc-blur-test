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

  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const scrollPosition = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const ratio = scrollPosition / maxScroll;
      setScrollRatio(ratio);
      
      // 스크롤이 90% 이상일 때 짙은 회색으로 변경
      if (ratio >= 0.9 && !showMenu) {
        setMenuIconColor('#333333');
      } else {
        setMenuIconColor('#000000');
      }
    };
    // ... 나머지 코드 유지
  }, [showMenu]);

  return (
    <Layout>
      <div className="min-h-screen bg-base-color text-black">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="text-container w-[320px] h-[600px] bg-white shadow-xl relative">
                <div className="p-8">
                  <h1 className="text-xl text-center font-bold mb-8">
                    {language === 'ko' ? '웹 사용법' : 'How to Use'}
                  </h1>
                  <ol className="list-decimal list-inside space-y-4 break-keep">
                    {data.howto?.steps?.map((step, index) => (
                      <li key={index} className="mb-4 leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* 하단에 각도 모드 토글 추가 */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-black">
                      {language === 'ko' 
                        ? (isOrientationMode ? '각도 모드' : '각도 모드')
                        : (isOrientationMode ? 'Angle Mode' : 'Angle Off')
                      }
                    </span>
                    <button 
                      onClick={handleModeToggle}
                      className="focus:outline-none"
                      aria-label="모드 전환"
                    >
                      <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        isOrientationMode ? 'bg-page3-bg' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                          isOrientationMode ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </div>
                    </button>
                  </div>
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