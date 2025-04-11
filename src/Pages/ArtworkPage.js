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
    if (!isIntroRead) {
      setIsIntroRead(true);
      
      // intro 메시지 읽기
      const introElement = document.createElement('div');
      introElement.setAttribute('aria-live', 'polite');
      introElement.className = 'sr-only';
      introElement.textContent = data[`page${pageNumber}`]?.guidance?.intro || '';
      document.body.appendChild(introElement);
      
      // intro 메시지 제거 타이머
      setTimeout(() => {
        document.body.removeChild(introElement);
      }, 2000);
    }
  }, [pageNumber, data, isIntroRead]);

  // blur가 0이 되었을 때만 콘텐츠 읽기
  useEffect(() => {
    // blur가 0이고 아직 콘텐츠를 읽지 않았을 때만 실행
    if (blurAmount === 0 && !hasReadContent && isIntroRead) {
      setHasReadContent(true);
      
      const contentToRead = `
        ${pageContent.guidance.title}.
        ${pageContent.guidance.artist}.
        ${pageContent.guidance.caption}.
        ${pageContent.guidance.body}.
        ${data.pages.next}
      `;

      const contentElement = document.createElement('div');
      contentElement.setAttribute('role', 'alert');
      contentElement.setAttribute('aria-live', 'assertive');
      contentElement.setAttribute('aria-atomic', 'true');
      contentElement.className = 'sr-only';
      
      // 요소를 먼저 추가
      document.body.appendChild(contentElement);
      
      // 약간의 지연 후 콘텐츠 설정 (스크린 리더가 변경을 감지하도록)
      setTimeout(() => {
        contentElement.textContent = contentToRead;
      }, 100);

      // 콘텐츠 요소 제거 타이머
      setTimeout(() => {
        document.body.removeChild(contentElement);
      }, 10000);
    }
  }, [blurAmount, hasReadContent, isIntroRead, pageContent, data]);

  // 페이지 변경 시 상태 초기화
  useEffect(() => {
    setHasReadContent(false);
    setIsIntroRead(false);
  }, [pageNumber]);

  // blur 상태 변화 추적을 위한 useEffect
  useEffect(() => {
    console.log('🔍 Blur 상태 변경:', {
      현재_blur: blurAmount,
      isUnlocked: isUnlocked,
      isOrientationMode: isOrientationMode,
      hasReadContent: hasReadContent,
      isIntroRead: isIntroRead,
      targetAngles: config?.targetAlpha,
      currentAlpha: currentAlpha
    });
  }, [blurAmount]);

  // 콘텐츠 읽기 조건 체크 useEffect
  useEffect(() => {
    if (blurAmount === 0) {
      console.log('✨ Blur=0 감지됨:', {
        시간: new Date().toLocaleTimeString(),
        blur상태: blurAmount,
        콘텐츠읽음여부: hasReadContent,
        인트로읽음여부: isIntroRead,
        방향모드: isOrientationMode,
        잠금해제: isUnlocked,
        현재각도: currentAlpha,
        목표각도: config?.targetAlpha
      });
    }

    console.log('📊 콘텐츠 읽기 조건 상태:', {
      조건1_Blur0: blurAmount === 0,
      조건2_미읽음: !hasReadContent,
      조건3_인트로완료: isIntroRead,
      조건_모두충족: (blurAmount === 0 && !hasReadContent && isIntroRead),
      추가정보: {
        현재_blur: blurAmount,
        콘텐츠상태: hasReadContent ? '읽음' : '미읽음',
        인트로상태: isIntroRead ? '완료' : '미완료',
        방향모드: isOrientationMode ? '활성' : '비활성',
        잠금상태: isUnlocked ? '해제' : '잠김'
      }
    });

    if (blurAmount === 0 && !hasReadContent && isIntroRead) {
      console.log('🎯 콘텐츠 읽기 시도:', {
        시간: new Date().toLocaleTimeString(),
        pageContent존재: !!pageContent,
        데이터존재: {
          title: !!pageContent?.guidance?.title,
          artist: !!pageContent?.guidance?.artist,
          caption: !!pageContent?.guidance?.caption,
          body: !!pageContent?.guidance?.body
        }
      });

      // 콘텐츠 읽기 시도 시 기존 코드...
      setHasReadContent(true);
      
      const contentToRead = `
        ${pageContent.guidance.title}.
        ${pageContent.guidance.artist}.
        ${pageContent.guidance.caption.replace(/<[^>]*>/g, '')}.
        ${pageContent.guidance.body.replace(/<[^>]*>/g, '')}.
        ${data.pages.next}
      `;

      console.log('📝 생성된 콘텐츠:', {
        전체텍스트: contentToRead,
        길이: contentToRead.length
      });

      const contentElement = document.createElement('div');
      contentElement.setAttribute('role', 'alert');
      contentElement.setAttribute('aria-live', 'assertive');
      contentElement.setAttribute('aria-atomic', 'true');
      contentElement.className = 'sr-only';
      
      document.body.appendChild(contentElement);
      console.log('➕ DOM 요소 생성 완료');
      
      setTimeout(() => {
        contentElement.textContent = contentToRead;
        console.log('📢 콘텐츠 텍스트 설정 완료');
      }, 100);

      setTimeout(() => {
        document.body.removeChild(contentElement);
        console.log('🗑 콘텐츠 요소 제거 완료');
      }, 10000);
    }
  }, [blurAmount, hasReadContent, isIntroRead, pageContent, data, isOrientationMode, isUnlocked, currentAlpha, config]);

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
              tabIndex={isContentInteractive ? 0 : -1} // 키보드 포커스 제어
              style={{
                marginTop: config.marginTop
              }}
            >
              <div className="text-center mb-8 break-keep" aria-hidden={blurAmount !== 0}>
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