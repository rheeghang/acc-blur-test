import React, { useState, useEffect, useMemo, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBlur } from '../contexts/BlurContext';
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
      className={`menu-button py-3 px-1 ${item.bgClass} ${item.textClass} mb-2 rounded-none shadow-md hover:opacity-90 transition-all duration-500 font-medium flex items-center justify-center
        ${isTransitioning ? 
          (selectedPage === item.pageNumber ? 'w-full' : 
           previousPage === item.pageNumber && pageType === 'artwork' ? 'w-[calc(100%-2rem)]' : 
           'w-[calc(100%-2rem)]') :
          (pageNumber === item.pageNumber && pageType === 'artwork' ? 'w-full' : 'w-[calc(100%-2rem)]')
        }`}
      aria-current={pageNumber === item.pageNumber ? 'page' : undefined}
      aria-label={`${item.label} ${language === 'ko' ? '페이지' : 'page'}`}
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
      className="flex-1 h-full text-black hover:text-gray-600 transition-colors duration-200"
      aria-label={item.label}
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
    { id: 'artwork1', label: data.page1.title, pageNumber: 1, bgClass: 'bg-page1-bg', textClass: 'text-page1-text' },
    { id: 'artwork2', label: data.page2.title, pageNumber: 2, bgClass: 'bg-page2-bg', textClass: 'text-page2-text' },
    { id: 'artwork3', label: data.page3.title, pageNumber: 3, bgClass: 'bg-page3-bg', textClass: 'text-page3-text' },
    { id: 'artwork4', label: data.page4.title, pageNumber: 4, bgClass: 'bg-page4-bg', textClass: 'text-page4-text' },
    { id: 'artwork5', label: data.page5.title, pageNumber: 5, bgClass: 'bg-page5-bg', textClass: 'text-page5-text' },
    { id: 'artwork6', label: data.page6.title, pageNumber: 6, bgClass: 'bg-page6-bg', textClass: 'text-page6-text' },
    { id: 'artwork7', label: data.page7.title, pageNumber: 7, bgClass: 'bg-page7-bg', textClass: 'text-page7-text' },
    { id: 'artwork8', label: data.page8.title, pageNumber: 8, bgClass: 'bg-page8-bg', textClass: 'text-page8-text' },
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
      action: () => handleNavigation('home')
    },
    { 
      id: 'howto', 
      label: language === 'ko' ? '웹 사용법' : 'How to Use',
      action: () => handleNavigation('howto')
    },
    { 
      id: 'about', 
      label: language === 'ko' ? '전시설명' : 'About',
      action: () => handleNavigation('about')
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center text-center"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'ko' ? '메뉴' : 'Menu'}
        aria-hidden={showHowto}  // Howto가 열려있을 때 메뉴를 숨김
      >
        {/* 스크린 리더용 안내 메시지 */}
        {isOpen && !showHowto && (
          <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
            {language === 'ko' 
              ? '메뉴가 열렸습니다. 닫기 버튼을 누르면 닫힙니다. 작품명을 선택해 관람하세요, 메뉴 하단에는 처음으로, 웹 사용법, 전시 설명, 버튼이 있습니다.'
              : 'Menu is open. Press the close button to close it. Select artwork titles to view. At the bottom of the menu, there are Home, How to Use, and About buttons.'}
          </div>
        )}

        <div 
          className="menu-container w-[90%] h-[90%] bg-white bg-opacity-90 shadow-lg mx-6 my-6 flex flex-col relative text-bold"
          role="document"
        >
          <div className="h-12 flex justify-end items-center pr-4">
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-2">
            <div className="flex flex-col items-center">
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

          <div className="flex h-12" role="navigation" aria-label={language === 'ko' ? '하단 메뉴' : 'Bottom menu'}>
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
            className="w-[330px] h-[600px] bg-white rounded-lg shadow-xl overflow-hidden"
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