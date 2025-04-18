import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const Howto = ({ isOverlay = false, onClose }) => {
  const { language } = useLanguage();
  const { isOrientationMode, setIsOrientationMode } = useMode();
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

  // 모드 토글 핸들러
  const handleModeToggle = () => {
    const newMode = !isOrientationMode;
    setIsOrientationMode(newMode);
    localStorage.setItem('orientationMode', newMode.toString());
  };

  return (
    <div className="h-full flex flex-col" role="region" aria-label="사용 방법 안내">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 
            className="text-lg text-center text-black font-medium"
          >
            {data.howto.title}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={language === 'ko' ? '닫기' : 'Close'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4"
        role="region"
        aria-label={language === 'ko' ? '사용 방법 내용' : 'How to use content'}
      >
        <div className="space-y-3 break-keep text-black">
          {data.howto.steps?.map((step, index) => (
            <p 
              key={index} 
              className="mb-3 leading-relaxed font-medium text-base"
            >
              {step}
            </p>
          ))}
        </div>
      </div>
      
      <div className="p-4 pt-2 border-t">
        <div className="flex flex-col items-center gap-2">
          <span className="font-medium text-black">{data.menu?.orientationMode}</span>
          <button 
            onClick={handleModeToggle}
            className="focus:outline-none"
            aria-label={language === 'ko' 
              ? `흐림 모드 ${isOrientationMode ? '켜짐' : '꺼짐'}` 
              : `Blur mode ${isOrientationMode ? 'on' : 'off'}`
            }
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