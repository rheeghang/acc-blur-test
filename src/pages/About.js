import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import MenuIcon from '../components/MenuIcon';
import Menu from '../components/Menu';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const About = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [menuIconColor, setMenuIconColor] = useState('#000000');
  const { language } = useLanguage();
  const navigate = useNavigate();
  const data = language === 'ko' ? koData : enData;
  const { title, subtitle, body } = data.about;
  const [hasTitleAnnounced, setHasTitleAnnounced] = useState(false);

  const handlePageChange = (newPage) => {
    setShowMenu(false);
    
    if (newPage === 'home') {
      navigate('/');
    } else if (newPage === 'about') {
      navigate('/about');
    } else {
      navigate(`/artwork/${newPage}`);
    }
  };

  useEffect(() => {
    if (!hasTitleAnnounced) {
      const titleElement = document.createElement('div');
      titleElement.setAttribute('aria-live', 'assertive');
      titleElement.className = 'sr-only';
      titleElement.textContent = '우리의 몸에는 타인이 깃든다. 전시 설명';
      document.body.appendChild(titleElement);
      
      setHasTitleAnnounced(true);
      
      setTimeout(() => {
        document.body.removeChild(titleElement);
      }, 1000);
    }
  }, [hasTitleAnnounced]);

  useEffect(() => {
    const img = new Image();
    img.src = '/title.png';
  }, []);

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

    const containers = document.querySelectorAll('.scroll-container');
    containers.forEach(container => {
      container.addEventListener('scroll', handleScroll);
    });

    return () => {
      containers.forEach(container => {
        container.removeEventListener('scroll', handleScroll);
      });
    };
  }, [showMenu]);

  return (
    <Layout>
      <div className="min-h-screen bg-base-color fixed w-full flex items-center justify-center">
        {/* 메뉴 아이콘 */}
        <div className="fixed top-5 right-5 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className={`menu-icon rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-all z-100 
              ${scrollRatio >= 0.9 && !showMenu ? 'animate-pulse-scale' : ''}`}
            style={{ 
              backgroundColor: menuIconColor,
              transition: 'all 0.3s ease'
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
        </div>

        {/* 바깥 컨테이너 */}
        <div className="outer-container absolute w-[120%] h-[150vh] flex items-center justify-center"
          style={{
            transform: `rotate(-10deg)`,
            top: '50%',
            marginTop: '-75vh',
          }}
        >
          {/* 스크롤 컨테이너 */}
          <div 
            className="scroll-container h-[150vh] w-full overflow-y-auto overflow-x-hidden flex flex-col items-center"
            style={{
              transform: 'translateZ(0)',
              maxHeight: '140vh',
              overflowY: 'auto',
              WebkitScrollbar: 'none',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
            aria-hidden="true"
          >
            {/* 텍스트 컨테이너 */}
            <div className="text-container w-[320px] shadow-xl mt-[50vh] mb-[80vh]"
              style={{
                background: 'linear-gradient(to left, #FFEA7B, #FACFB9)',
              }}
              aria-label={data.about.body}
            >
              <div className="p-10">
                {/* 타이틀 이미지를 텍스트 컨테이너 상단에 배치 */}
                <div className="flex justify-center mb-8">
                  <img 
                    src="/title.png" 
                    alt="" 
                    aria-hidden="true"
                    className="w-[90%] h-auto"
                  />
                </div>
                <div className="text-base font-medium text-black leading-relaxed break-keep"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 메뉴 오버레이 */}
        {showMenu && (
          <Menu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            onPageSelect={handlePageChange}
            pageNumber="about"
          />
        )}
      </div>
    </Layout>
  );
};

export default About;