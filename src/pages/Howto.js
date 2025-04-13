// src/Pages/Howto.js
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const Howto = ({ isOverlay = false, onClose }) => {
  const { language } = useLanguage();
  const { isOrientationMode, setIsOrientationMode } = useMode();
  const [hasTitleAnnounced, setHasTitleAnnounced] = useState(false);
  const [data, setData] = useState(language === 'ko' ? koData : enData);
  
  // 언어 변경 시 데이터 업데이트
  useEffect(() => {
    setData(language === 'ko' ? koData : enData);
  }, [language]);

  // 로컬 스토리지 연동
  useEffect(() => {
    const savedMode = localStorage.getItem('orientationMode');
    if (savedMode !== null) {
      setIsOrientationMode(savedMode === 'true');
    }
  }, []);

  // 페이지 로드 시 제목 읽기
  useEffect(() => {
    if (!hasTitleAnnounced && data?.howto?.title) {
      const titleElement = document.createElement('div');
      titleElement.setAttribute('aria-live', 'assertive');
      titleElement.className = 'sr-only';
      titleElement.textContent = data.howto.title;
      document.body.appendChild(titleElement);
      
      setHasTitleAnnounced(true);
      
      // 일정 시간 후 제거
      setTimeout(() => {
        document.body.removeChild(titleElement);
      }, 1000);
    }
  }, [language, hasTitleAnnounced, data?.howto?.title]);

  // 모드 토글 핸들러
  const handleModeToggle = () => {
    const newMode = !isOrientationMode;
    setIsOrientationMode(newMode);
    localStorage.setItem('orientationMode', newMode.toString());
  };

  if (!data?.howto) {
    return <div className="h-full flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 
          className="text-lg text-center text-black font-medium"
          aria-live="off"
        >
          {data.howto.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 break-keep text-black">
          {data.howto.steps?.map((step, index) => (
            <p key={index} className="mb-4 leading-relaxed font-normal text-base">
              {step}
            </p>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-medium">{data.menu?.orientationMode}</span>
          <button 
            onClick={handleModeToggle}
            className="focus:outline-none left-1/2 -translate-x-1/2"
            aria-label={language === 'ko' ? '모드 전환' : 'Toggle mode'}
          >
            <div className={`relative w-[72px] h-[36px] rounded-full transition-colors duration-200 ease-in-out ${
              isOrientationMode ? 'bg-black' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-1/2 left-0.5 -translate-y-1/2 flex items-center justify-center w-[32px] h-[32px] rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                isOrientationMode ? 'translate-x-[37px]' : 'translate-x-[0.5px]'
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
  );
};

export default Howto;