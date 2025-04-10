import React, { useState } from 'react';
import { useMode } from '../contexts/ModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const Menu = ({ isOpen, onClose, onPageSelect, pageNumber, pageType }) => {
  const { isOrientationMode, setIsOrientationMode } = useMode();
  const { language } = useLanguage();
  
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

  // 모드 토글 핸들러
  const handleModeToggle = () => {
    setIsOrientationMode(!isOrientationMode);
  };

  // 버튼 텍스트를 언어에 따라 표시
  const buttonText = {
    home: language === 'ko' ? '홈' : 'Home',
    about: language === 'ko' ? '전시 설명' : 'About'
  };

  const handlePageSelect = (pageNum) => {
    setPreviousPage(pageNumber); // 현재 페이지 저장
    setSelectedPage(pageNum);
    setIsTransitioning(true);
    
    // 0.5초 후에 페이지 전환
    setTimeout(() => {
      onPageSelect(pageNum);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 z-51 flex items-center justify-center text-center">
      <div className="w-[90%] h-[90%] bg-white bg-opacity-90 shadow-lg mx-6 my-6 flex flex-col relative text-bold">
        <div className="h-12"></div>

        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-black !text-black z-100">
              {language === 'ko' 
                ? (isOrientationMode ? '각도 모드' : '각도해제 모드')
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

        <div className="flex-1 overflow-y-auto py-2 px-2">
          <div className="flex flex-col items-center">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageSelect(item.pageNumber)}
                className={`py-3 px-1 ${item.bgClass} ${item.textClass} mb-2 rounded-none shadow-md hover:opacity-90 transition-all duration-500 font-medium flex items-center justify-center
                  ${isTransitioning ? 
                    (selectedPage === item.pageNumber ? 'w-full' : 
                     previousPage === item.pageNumber && pageType === 'artwork' ? 'w-[calc(100%-2rem)]' : 
                     'w-[calc(100%-2rem)]') :
                    (pageNumber === item.pageNumber && pageType === 'artwork' ? 'w-full' : 'w-[calc(100%-2rem)]')
                  }`}
              >
                <span className="text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-12">
          <button
            onClick={() => handlePageSelect('home')}
            className={`w-1/2 h-full bg-white text-black border border-gray-200 hover:bg-gray-50 transition-all duration-500
              ${isTransitioning && selectedPage === 'home' ? 'w-[55%]' : 'w-1/2'}`}
          >
            {buttonText.home}
          </button>
          <button
            onClick={() => handlePageSelect('about')}
            className={`w-1/2 h-full bg-black text-white hover:bg-gray-900 transition-all duration-500
              ${isTransitioning && selectedPage === 'about' ? 'w-[55%]' : 'w-1/2'}`}
          >
            {buttonText.about}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu; 