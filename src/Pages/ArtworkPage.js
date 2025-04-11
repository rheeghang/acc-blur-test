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

  // 페이지 로드 시 가이던스 intro 읽기
  useEffect(() => {
    if (!isIntroRead && data[`page${pageNumber}`]?.guidance?.intro) {
      setIsIntroRead(true);
      // intro 내용을 읽기 위한 div 추가
      const introElement = document.createElement('div');
      introElement.setAttribute('aria-live', 'polite');
      introElement.textContent = data[`page${pageNumber}`].guidance.intro;
      document.body.appendChild(introElement);
      
      // 일정 시간 후 제거
      setTimeout(() => {
        document.body.removeChild(introElement);
      }, 1000);
    }
  }, [pageNumber, data, isIntroRead]);

  // 콘텐츠 클릭 가능 여부 확인
  const isContentInteractive = !isOrientationMode || (isOrientationMode && blurAmount === 0);

  // blur가 0이 되면 콘텐츠 읽기 시작
  useEffect(() => {
    if (isContentInteractive && !hasReadContent && pageContent) {
      setHasReadContent(true);
      
      const readContent = () => {
        // 타이틀 읽기
        const titleElement = document.createElement('div');
        titleElement.setAttribute('aria-live', 'assertive');
        titleElement.setAttribute('role', 'status');
        titleElement.textContent = pageContent.guidance.title;
        
        // 아티스트 읽기
        const artistElement = document.createElement('div');
        artistElement.setAttribute('aria-live', 'assertive');
        artistElement.setAttribute('role', 'status');
        artistElement.textContent = pageContent.guidance.artist;
        
        // 캡션 읽기
        const captionElement = document.createElement('div');
        captionElement.setAttribute('aria-live', 'assertive');
        captionElement.setAttribute('role', 'status');
        captionElement.textContent = pageContent.guidance.caption.replace(/<[^>]*>/g, '');
        
        // 본문 읽기
        const bodyElement = document.createElement('div');
        bodyElement.setAttribute('aria-live', 'assertive');
        bodyElement.setAttribute('role', 'status');
        bodyElement.textContent = pageContent.guidance.body.replace(/<[^>]*>/g, '');
        
        // 메뉴 안내
        const menuElement = document.createElement('div');
        menuElement.setAttribute('aria-live', 'assertive');
        menuElement.setAttribute('role', 'status');
        menuElement.textContent = data.pages.next;

        // 순차적으로 읽기 실행
        const elements = [titleElement, artistElement, captionElement, bodyElement, menuElement];
        let currentIndex = 0;

        const readNext = () => {
          if (currentIndex < elements.length) {
            const currentElement = elements[currentIndex];
            document.body.appendChild(currentElement);

            // 현재 요소의 읽기가 완료되면 1초 후 다음 요소로 진행
            const onEnd = () => {
              document.body.removeChild(currentElement);
              currentIndex++;
              // 1초 후에 다음 요소 읽기
              setTimeout(() => {
                readNext();
              }, 1000);
            };

            // VoiceOver나 다른 스크린리더가 읽기를 완료할 때까지 대기
            currentElement.addEventListener('DOMNodeRemoved', onEnd, { once: true });
          }
        };

        readNext();
      };

      readContent();
    }
  }, [isContentInteractive, hasReadContent, pageContent]);

  // 페이지 변경 시 상태 초기화
  useEffect(() => {
    setHasReadContent(false);
    setIsIntroRead(false);
  }, [pageNumber]);

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
      <div className="min-h-screen bg-base-color fixed w-full flex items-center justify-center">
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

        <div 
          className="outer-container absolute w-[120%] h-[150vh] flex items-center justify-center"
          style={{
            transform: `rotate(${config.rotationAngle}deg)`,
            top: pageNumber === '3' ? '40%' : '50%',
            marginTop: '-75vh',
            filter: isOrientationMode && !isUnlocked ? `blur(${blurAmount}px)` : 'none',
            transition: 'filter 0.5s ease, transform 0.5s ease',
            pointerEvents: isContentInteractive ? 'auto' : 'none' // 클릭 이벤트 제어
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
            aria-hidden={!isContentInteractive} // 스크린리더 접근 제어
          >
            <div 
              className={`text-container p-6 w-[320px] ${config.className} shadow-xl mt-[50vh] mb-[80vh] 
              ${blurAmount === 0 && !isScrolled ? 'animate-wobble' : ''}`}
              aria-labelledby={pageContent.title}
              tabIndex={isContentInteractive ? 0 : -1} // 키보드 포커스 제어
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