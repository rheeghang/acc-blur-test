import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlur } from '../contexts/BlurContext';
import { useGuide } from '../contexts/GuideContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import { Layout } from '../components/Layout';
import MenuIcon from '../components/MenuIcon';
import Menu from '../components/Menu';
import pageConfig from '../config/pages.json';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const ArtworkPage = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);
  const { blurAmount, currentAlpha, setTargetAngles, setIsUnlocked, isUnlocked } = useBlur();
  const { showGuideMessage } = useGuide();
  const { language } = useLanguage();
  const { isOrientationMode } = useMode();
  const [outOfRangeStartTime, setOutOfRangeStartTime] = React.useState(null);
  const [menuIconColor, setMenuIconColor] = React.useState('#FF5218');
  const [menuIconScale, setMenuIconScale] = React.useState(1);
  const [initialAlpha, setInitialAlpha] = React.useState(null);

  const data = language === 'ko' ? koData : enData;
  const config = pageConfig.pages[pageNumber];
  const pageContent = data[`page${pageNumber}`];

  useEffect(() => {
    if (config) {
      setTargetAngles(config.targetAlpha);
    }
  }, [pageNumber]);


  useEffect(() => {
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      if (container) {
        container.scrollTop = 0;
      }
    });
  }, [pageNumber]);

  // 가이드 메시지 관리
  useEffect(() => {
    if (isOrientationMode && !showMenu && !isUnlocked) {
      const now = Date.now();
      
      if (blurAmount >= 2) {
        if (!outOfRangeStartTime) {
          setOutOfRangeStartTime(now);
        } else if (now - outOfRangeStartTime >= 4000) {
          showGuideMessage();
          setOutOfRangeStartTime(null);
        }
      } else {
        setOutOfRangeStartTime(null);
      }
    }
  }, [blurAmount, isOrientationMode, showMenu, outOfRangeStartTime, showGuideMessage, isUnlocked]);

  // 스크롤 이벤트 핸들러 추가
  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const scrollPosition = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollRatio = scrollPosition / maxScroll;
      
      // 스크롤이 90% 이상 되었을 때 크기와 색상 모두 변경
      if (scrollRatio >= 0.9 && !showMenu) {
        setMenuIconColor('#FF8000');
        setMenuIconScale(1.3);
        
        // 0.5초 후에 원래 상태로 돌아오기
        setTimeout(() => {
          setMenuIconColor('#FF5218');
          setMenuIconScale(1);
        }, 500);
      }
    };

    // 컨테이너 요소 찾기
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      container.addEventListener('scroll', handleScroll);
    });

    return () => {
      containers.forEach(container => {
        container.removeEventListener('scroll', handleScroll);
      });
    };
  }, [showMenu]);

  const handlePageChange = (newPage) => {
    setShowMenu(false);
    setIsUnlocked(false);
    setOutOfRangeStartTime(null);
    
    if (newPage === 'home') {
      navigate('/');
    } else if (newPage === 'about') {
      navigate('/about');
    } else {
      navigate(`/artwork/${newPage}`);
    }
  };

  if (!config || !pageContent) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-base-color fixed w-full flex items-center justify-center">
        <div className="fixed top-2 left-0 right-0 text-center z-10 flex justify-center space-x-4">
          <p className="text-xl font-bold text-white">
            {Math.round(currentAlpha)}°
            {/* 디버깅용 추가 정보 */}
            {/* <span className="text-sm ml-2">
              (Target: {config?.targetAlpha}°)
            </span> */}
          </p>
        </div>

        {/* 메뉴 아이콘 */}
        <div className="fixed top-5 right-5 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-all z-100"
            style={{ 
              backgroundColor: menuIconColor,
              transform: `scale(${menuIconScale})`,
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

        <div 
          className="outer-container absolute w-[120%] h-[150vh] flex items-center justify-center"
          role="presentation"
          aria-hidden="true"
          style={{
            transform: `rotate(${config.rotationAngle}deg)`,
            top: pageNumber === '3' ? '40%' : '50%',
            marginTop: '-75vh',
            filter: isOrientationMode && !isUnlocked ? `blur(${blurAmount}px)` : 'none',
            transition: 'filter 0.5s ease, transform 0.5s ease'
          }}
        >
          <div 
            className="container h-[150vh] overflow-y-auto overflow-x-hidden flex flex-col items-center"
            style={{
              transform: 'translateZ(0)',
              maxHeight: '140vh',
              overflowY: 'auto',
              WebkitScrollbar: 'none',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <div 
              className={`container p-6 w-[320px] ${config.className} shadow-xl mt-[50vh] mb-[80vh]`}
              role="presentation"
              aria-hidden="true"
              style={{
                marginTop: config.marginTop
              }}
            >
              <div className="text-center mb-8 break-keep">
                <h1 className="text-xl font-bold mb-4">{pageContent.title}</h1>
                <p className="text-base mb-2">{pageContent.artist}</p>
                <p className="text-xs" dangerouslySetInnerHTML={{ __html: pageContent.caption }} />
              </div>
              
              <div 
                className="text-base leading-relaxed break-keep"
                dangerouslySetInnerHTML={{ __html: pageContent.body }}
              />  
            </div>
          </div>
        </div>

        {/* 메뉴 오버레이 */}
        {showMenu && (
          <Menu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            onPageSelect={handlePageChange}
            pageNumber={Number(pageNumber)}
            pageType="artwork"
          />
        )}
      </div>
    </Layout>
  );
};

export default ArtworkPage;