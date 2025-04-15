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

const MOBILE_MAX_WIDTH = 1024; // 태블릿 크기까지 허용

const isMobileDevice = () => {
  // iPad detection for iOS 13+
  const isIPad = navigator.maxTouchPoints &&
                 navigator.maxTouchPoints > 2 &&
                 /MacIntel/.test(navigator.platform);

  // 화면 크기가 MOBILE_MAX_WIDTH 이하이거나 모바일/태블릿 기기인 경우
  return window.innerWidth <= MOBILE_MAX_WIDTH || 
         /iPhone|iPad|iPod|Android/.test(navigator.userAgent) ||
         isIPad ||
         (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

const ArtworkPage = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);
  const { blurAmount, currentAlpha, setTargetAngles, setIsUnlocked, isUnlocked } = useBlur();
  const { showGuideMessage } = useGuide();
  const { language } = useLanguage();
  const { isOrientationMode } = useMode();
  const [outOfRangeStartTime, setOutOfRangeStartTime] = React.useState(null);
  const [menuIconColor, setMenuIconColor] = React.useState('#000000'); // 기본 검정색
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [hasReadContent, setHasReadContent] = useState(false);
  const [isIntroRead, setIsIntroRead] = useState(false);

  const data = language === 'ko' ? koData : enData;
  const config = pageConfig.pages[pageNumber];
  const pageContent = data[`page${pageNumber}`];

  useEffect(() => {
    if (config) {
      // PC가 아닌 경우에만 방향 감지 적용 (모바일과 태블릿 동일하게 처리)
      if (window.innerWidth <= MOBILE_MAX_WIDTH) {
        setTargetAngles(config.targetAlpha);
      } else {
        setIsUnlocked(true); // PC인 경우 잠금 해제
      }
    }
  }, [pageNumber]);

  // 페이지 변경 시 스크롤 초기화 및 isScrolled 리셋
  useEffect(() => {
    const containers = document.querySelectorAll('.scroll-container');
    containers.forEach(container => {
      if (container) {
        container.scrollTop = 0;
      }
    });
    setIsScrolled(false); // 페이지 변경 시 isScrolled 초기화
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

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const scrollPosition = container.scrollTop;
      
      if (scrollPosition > 0) {
        setIsScrolled(true);
      }
      
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

  // 애니메이션 상태 모니터링을 위한 useEffect 추가
  useEffect(() => {
    let lastPercent = -1; // 마지막으로 체크한 퍼센트

    const handleAnimation = () => {
      const textContainer = document.querySelector('.text-container');
      if (!textContainer) return;

      requestAnimationFrame(function checkProgress() {
        const animation = textContainer.getAnimations()[0];
        if (!animation) return;

        const currentPercent = (animation.currentTime % 2000) / 2000 * 100; // 2000ms = 2s

        lastPercent = currentPercent;

        if (animation.playState === 'running') {
          requestAnimationFrame(checkProgress);
        }
      });
    };

    const textContainer = document.querySelector('.text-container');
    if (textContainer) {
      textContainer.addEventListener('animationstart', handleAnimation);
    }

    return () => {
      if (textContainer) {
        textContainer.removeEventListener('animationstart', handleAnimation);
      }
    };
  }, [blurAmount, isScrolled]);

  // 콘텐츠 클릭 가능 여부 확인
  const isContentInteractive = isOrientationMode ? blurAmount === 0 : true;

  // 페이지 로드 시 intro 메시지 읽기
  useEffect(() => {
    if (!isIntroRead && pageContent?.guidance?.intro) {
      // intro 메시지 읽기
      const introElement = document.createElement('div');
      introElement.setAttribute('aria-live', 'polite');
      introElement.className = 'sr-only';
      introElement.textContent = pageContent.guidance.intro;
      document.body.appendChild(introElement);
      
      // 페이지 시작 후 0.2초 후에 isIntroRead를 true로 설정
      setTimeout(() => {
        setIsIntroRead(true);
      }, 200);

      // intro 메시지 제거 타이머
      setTimeout(() => {
        if (document.body.contains(introElement)) {
          document.body.removeChild(introElement);
        }
      }, 2000);
    }
  }, [pageNumber, data, isIntroRead, pageContent]);

  // blur 상태에 따른 콘텐츠 읽기
  useEffect(() => {
    if (blurAmount === 0 && !hasReadContent && isIntroRead) {
      setHasReadContent(true);
      
      const contentToRead = `
        ${pageContent?.guidance?.title || ''}.
        ${pageContent?.guidance?.artist || ''}.
        ${pageContent?.guidance?.caption || ''}.
        ${pageContent?.guidance?.body || ''}.
        ${data?.pages?.next || ''}
      `;

      const contentElement = document.createElement('div');
      contentElement.setAttribute('role', 'alert');
      contentElement.setAttribute('aria-live', 'assertive');
      contentElement.setAttribute('aria-atomic', 'true');
      contentElement.className = 'sr-only';
      contentElement.textContent = contentToRead;
      
      document.body.appendChild(contentElement);

      setTimeout(() => {
        if (document.body.contains(contentElement)) {
          document.body.removeChild(contentElement);
        }
      }, 10000);
    }
  }, [blurAmount, hasReadContent, isIntroRead, pageContent, data]);

  // 페이지 변경 시 상태 초기화
  useEffect(() => {
    setHasReadContent(false);
    setIsIntroRead(false);
  }, [pageNumber]);

  // blurAmount 변경 감지
  useEffect(() => {
  }, [blurAmount]);

  const handlePageChange = (newPage) => {
    setShowMenu(false);
    setIsUnlocked(false);
    setOutOfRangeStartTime(null);
    setIsScrolled(false); // 페이지 변경 시 isScrolled 초기화
    
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
      <div className="artwork-background min-h-screen bg-base-color fixed w-full flex items-center justify-center">
        <div className="fixed top-2 left-0 right-0 text-center z-10 flex justify-center space-x-4">
          <p className="text-xl font-bold text-white" aria-hidden="true">
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
            className={`menu-icon rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-all z-100 
              ${scrollRatio >= 0.9 && !showMenu ? 'animate-pulse-scale bg-key-color' : 'bg-black'}
              ${showMenu ? 'hidden' : ''}`}
            style={{ 
              transition: 'all 0.3s ease'
            }}
            aria-label={showMenu ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={showMenu}
            aria-controls="menu-overlay"
            role="button"
            tabIndex={0}
          >
            <MenuIcon aria-hidden="true" focusable="false" role="img" />
          </button>
        </div>

        <div 
          className="outer-container absolute w-[120%] h-[150vh] flex items-center justify-center"
          data-page={pageNumber}
          style={{
            transform: `rotate(${config.rotationAngle}deg)`,
            top: '50%',
            marginTop: '-75vh',
            filter: isOrientationMode && !isUnlocked ? `blur(${blurAmount}px)` : 'none',
            transition: 'filter 0.5s ease, transform 0.5s ease',
            pointerEvents: isContentInteractive ? 'auto' : 'none'
          }}
          role="presentation"
        >
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
            role="none"
            aria-hidden={!isContentInteractive}
          >
            <div 
              className={`text-container p-6 w-[320px] font-medium ${config.className} shadow-xl mt-[50vh] mb-[80vh] 
              ${blurAmount === 0 && !isScrolled ? 'animate-wobble' : ''}`}
              style={{
                marginTop: config.marginTop
              }}
              tabIndex={isContentInteractive ? 0 : -1}
            >
              <div 
                className="text-center mb-8 break-keep" 
                aria-hidden={blurAmount !== 0}
                role="text"
                aria-label={`${pageContent.guidance.title}. ${pageContent.guidance.artist}. ${pageContent.guidance.caption}. ${pageContent.guidance.body}. ${data?.pages?.next}`}
              >
                <h1 className="text-xl font-bold mb-4">{pageContent.title}</h1>
                <p className="text-base font-semibold mb-2">{pageContent.artist}</p>
                <p className="text-[14px]" dangerouslySetInnerHTML={{ __html: pageContent.caption }} />
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