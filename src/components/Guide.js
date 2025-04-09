import React from 'react';

const Guide = ({ show, language, fullscreen }) => {
  const guideText = {
    ko: "기기를 회전하며 방향을 찾아보세요.",
    en: "Rotate your device to find the direction."
  };

  const textColorClass = fullscreen ? 'text-black' : 'text-white';
  const borderColorClass = fullscreen ? 'border-black' : 'border-white';

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-700
        ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${fullscreen ? 'bg-base-color' : ''}`}
    >
      {/* 중앙 정렬을 위한 컨테이너 */}
      <div className="h-full flex flex-col items-center justify-center">

        {/* 회전하는 사각형과 텍스트를 포함하는 영역 */}
        <div className="text-center">
          <div className="flex justify-center mb-6" aria-hidden="true">
            <div className={`w-[100px] h-[60px] border-2 ${borderColorClass} animate-rotate-left`}></div>
          </div>
          {/* 가이드 텍스트를 스크린리더에서 제외 */}
          <p className={`mb-6 p-4 pb-2 text-lg font-medium ${textColorClass}`} aria-hidden="true">
            {guideText[language] || guideText.ko}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guide;