import React, { useState, useEffect, useMemo, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBlur } from '../contexts/BlurContext';
import ReactGA from 'react-ga4';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import { useNavigate } from 'react-router-dom';
import Howto from '../pages/Howto';

// 메뉴 아이템 버튼을 메모이제이션
const MenuItemButton = memo(({ 
  item, 
  pageNumber, 
  pageType, 
  isTransitioning, 
  selectedPage, 
  previousPage, 
  handlePageSelect,
  language,
  isMenuVisible,
  // style  // [BLUR] 블러 스타일 prop 주석 처리
}) => {
  return (
    <button
      onClick={() => isMenuVisible && handlePageSelect(item.pageNumber)}
      className={`menu-button py-4 px-1 ${item.bgClass} ${item.textClass} mb-2 rounded-none shadow-lg hover:opacity-90 transition-all duration-500 font-semibold flex items-center justify-center
        ${isTransitioning ? 
          (selectedPage === item.pageNumber ? 'w-full' : 
           previousPage === item.pageNumber && pageType === 'artwork' ? 'w-[calc(100%-2rem)]' : 
           'w-[calc(100%-2rem)]') :
          (pageNumber === item.pageNumber && pageType === 'artwork' ? 'w-full' : 'w-[calc(100%-2rem)]')
        }`}
      aria-current={pageNumber === item.pageNumber ? 'page' : undefined}
      aria-label={item.ariaLabel}
      disabled={!isMenuVisible}
      tabIndex={-1}
      // style={style}  // [BLUR] 블러 스타일 적용 주석 처리
    >
      <span className="text-center">{item.label}</span>
    </button>
  );
});

// 네비게이션 버튼을 메모이제이션
const NavButton = memo(({ item, isMenuVisible, style }) => {
  return (
    <button
      onClick={() => isMenuVisible && item.action()}
      className="flex-1 h-full text-gray-800 hover:text-gray-600 transition-colors duration-200"
      aria-label={item.ariaLabel}
      disabled={!isMenuVisible}
      // style={style}  // [BLUR] 블러 스타일 적용 주석 처리
    >
      {item.label}
    </button>
  );
});

const Menu = ({ isOpen, onClose, onPageSelect, pageNumber, pageType }) => {
  const { language } = useLanguage();
  // const { menuBlurAmount, currentAlpha, isInMenuRange } = useBlur();  // [BLUR] 블러 관련 context 주석 처리
  const navigate = useNavigate();
  const [showHowto, setShowHowto] = useState(false);
  
  // 언어에 따른 데이터 선택
  const data = language === 'ko' ? koData : enData;
  
  const menuItems = [
    { 
      id: 'artwork1', 
      label: data.page1.title, 
      pageNumber: 1, 
      bgClass: 'bg-page1-bg', 
      textClass: 'text-page1-text',
      ariaLabel: data.page1.guidance.title
    },
    { 
      id: 'artwork2', 
      label: data.page2.title, 
      pageNumber: 2, 
      bgClass: 'bg-page2-bg', 
      textClass: 'text-page2-text',
      ariaLabel: data.page2.guidance.title
    },
    { 
      id: 'artwork3', 
      label: data.page3.title, 
      pageNumber: 3, 
      bgClass: 'bg-page3-bg', 
      textClass: 'text-page3-text',
      ariaLabel: data.page3.guidance.title
    },
    { 
      id: 'artwork4', 
      label: data.page4.title, 
      pageNumber: 4, 
      bgClass: 'bg-page4-bg', 
      textClass: 'text-page4-text',
      ariaLabel: data.page4.guidance.title
    },
    { 
      id: 'artwork5', 
      label: data.page5.title, 
      pageNumber: 5, 
      bgClass: 'bg-page5-bg', 
      textClass: 'text-page5-text',
      ariaLabel: data.page5.guidance.title
    },
    { 
      id: 'artwork6', 
      label: data.page6.title, 
      pageNumber: 6, 
      bgClass: 'bg-page6-bg', 
      textClass: 'text-page6-text',
      ariaLabel: data.page6.guidance.title
    },
    { 
      id: 'artwork7', 
      label: data.page7.title, 
      pageNumber: 7, 
      bgClass: 'bg-page7-bg', 
      textClass: 'text-page7-text',
      ariaLabel: data.page7.guidance.title
    },
    { 
      id: 'artwork8', 
      label: data.page8.title, 
      pageNumber: 8, 
      bgClass: 'bg-page8-bg', 
      textClass: 'text-page8-text',
      ariaLabel: data.page8.guidance.title
    },
  ];

  const [selectedPage, setSelectedPage] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPage, setPreviousPage] = useState(pageNumber);

  // 메뉴가 열려있을 때 현재 각도가 메뉴 범위 안에 있는지 확인
  // const isMenuVisible = isOpen ? isInMenuRange(currentAlpha) : true;  // [BLUR] 메뉴 가시성 체크 주석 처리
  const isMenuVisible = true;  // [BLUR] 메뉴 항상 보이도록 설정

  // 메뉴 컨텐츠에만 블러 효과 적용
  // const getContentBlurStyle = useMemo(() => ({  // [BLUR] 블러 스타일 계산 주석 처리
  //   filter: `blur(${menuBlurAmount}px)`,
  //   transition: 'filter 0.3s ease',
  //   pointerEvents: menuBlurAmount === 0 ? 'auto' : 'none',
  // }), [menuBlurAmount]);

  const handleNavigation = (path) => {
    // GA 이벤트 전송
    ReactGA.event({
      category: 'Navigation',
      action: 'Click Menu Button',
      label: path
    });

    switch(path) {
      case 'home':
        navigate('/');
        break;
      case 'howto':
        setShowHowto(true);
        return; // 메뉴를 닫지 않고 Howto 오버레이를 표시
      case 'about':
        navigate('/about');
        break;
      default:
        onPageSelect(path);
    }
    onClose();
  };

  const handlePageSelect = (pageNum) => {
    // GA 이벤트 전송
    const selectedArtwork = menuItems.find(item => item.pageNumber === pageNum);
    ReactGA.event({
      category: 'Artwork',
      action: 'Select Artwork',
      label: selectedArtwork ? selectedArtwork.label : `Page ${pageNum}`
    });

    // 현재 페이지와 동일한 버튼을 클릭했을 때 새로고침
    if (pageNumber === pageNum && pageType === 'artwork') {
      window.location.reload();
      return;
    }

    setPreviousPage(pageNumber);
    setSelectedPage(pageNum);
    setIsTransitioning(true);
    
    setTimeout(() => {
      onPageSelect(pageNum);
      onClose();
    }, 500);
  };

  const navItems = [
    { 
      id: 'home', 
      label: language === 'ko' ? '처음으로' : 'Home',
      action: () => handleNavigation('home'),
      ariaLabel: language === 'ko' ? '처음 화면으로' : 'home'
    },
    { 
      id: 'howto', 
      label: language === 'ko' ? '웹 사용법' : 'How to Use',
      action: () => handleNavigation('howto'),
      ariaLabel: language === 'ko' ? '웹 사용법' : 'How to use'
    },
    { 
      id: 'about', 
      label: language === 'ko' ? '전시설명' : 'About',
      action: () => handleNavigation('about'),
      ariaLabel: language === 'ko' ? '전시 설명' : 'about'
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center text-center font-medium"
        aria-label={language === 'ko' ? '메뉴' : 'Menu'}
        aria-hidden={showHowto}
        role="region"
      >
        {/* 스크린 리더용 안내 메시지 */}
        {isOpen && !showHowto && (
          <div 
            className="sr-only" 
            aria-live="assertive" 
            aria-atomic="true"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {language === 'ko' 
              ? '메뉴가 열렸습니다. 화면에 작품 페이지 버튼이 나열되어있습니다. 메뉴 하단에는, 처음으로, 웹 사용법, 전시 설명, 버튼이 있습니다.'
              : 'Menu is open. Select artwork titles to view. At the bottom of the menu, there are Home, How to Use, and About buttons.'}
          </div>
        )}

        <div className="fixed top-5 right-5 z-50">
          <button
            onClick={onClose}
            className="menu-icon rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 bg-black transition-all"
            aria-label={language === 'ko' ? '메뉴 닫기' : 'Close menu'}
          >
            <svg 
              width="30" 
              height="30" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div 
          className="menu-container w-[90%] h-[90%] bg-white bg-opacity-90 shadow-lg mx-6 my-6 flex flex-col relative text-bold"
          role="none"
        >
          <div 
            className="flex-1 overflow-y-auto py-2 px-2"
            role="none"
          >
            <div className="flex mt-8 flex-col items-center">
              {menuItems.map((item) => (
                <MenuItemButton
                  key={item.id}
                  item={item}
                  pageNumber={pageNumber}
                  pageType={pageType}
                  isTransitioning={isTransitioning}
                  selectedPage={selectedPage}
                  previousPage={previousPage}
                  handlePageSelect={handlePageSelect}
                  language={language}
                  isMenuVisible={true}  // [BLUR] 메뉴 항상 보이도록 설정
                  // style={getContentBlurStyle}  // [BLUR] 블러 스타일 적용 주석 처리
                />
              ))}
            </div>
          </div>

          <div className="flex h-12 text-gray-800" role="navigation" aria-label={language === 'ko' ? '하단 메뉴' : 'Bottom menu'}>
            {navItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <div className="flex items-center text-gray-300" aria-hidden="true">
                    <span>|</span>
                  </div>
                )}
                <NavButton 
                  item={item} 
                  isMenuVisible={true}  // [BLUR] 메뉴 항상 보이도록 설정
                  // style={getContentBlurStyle}  // [BLUR] 블러 스타일 적용 주석 처리
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {showHowto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowHowto(false)}
          role="dialog"
          aria-modal="true"
          aria-label={language === 'ko' ? '웹 도슨트를 사용하는 방법' : 'How to Use'}
        >
          <div 
            className="howto-overlay w-[330px] h-[600px] bg-white rounded-lg shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <Howto isOverlay={true} onClose={() => setShowHowto(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Menu); 