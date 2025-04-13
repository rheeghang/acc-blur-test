import React from 'react';
import { useNavigate } from 'react-router-dom';
import RotatedText from '../components/RotatedText';

const Intro = () => {
  const navigate = useNavigate();

  const title = "2025 ACC 접근성 강화 주제전";
  const subtitle = "우리의 몸에는 타인이 깃든다";
  
  const text1 = "2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 존재의 '다름'을 인정할 뿐만 아니라 나와 다른 존재에 취해야 할 태도에 대해 고민하는 전시입니다. 우리 안에는 다양한 경계가 있습니다.";
  
  const text2 = "'안과 밖', '우리와 타인', '안전한 것과 위험한 것', '나 그리고 나와 다른' 등의 언어처럼 말이죠. 그러나 경계가 지극히 상대적인 개념이며, 나 또한 누군가에게는 또 다른 타자가 될 수 있다면요? 내가 나인 채로 당신이 당신인 채로, 우리는 어떻게 비대칭적으로 소통하고 함께할 수 있을까요?";

  return (
    <div className="min-h-screen bg-white text-black relative">
      <div className="w-full max-w-2xl mx-auto pb-[20vh]">
        <RotatedText 
          text={`${text1}\n\n${text2}`}
          title={title}
          subtitle={subtitle}
          rotationAngle={-15}
          useGuideMessage={false}
          styles={{
            titleMargin: '10px',
            lineSpacing: '15px',
            textTop: '20px',
            containerPadding: '10vh',
            titleBlockMargin: '10px'
          }}
        />
      </div>

      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 w-[90%] bg-black text-white p-2 text-center">
        휴대폰을 흔들면 메뉴가 열립니다.
      </div>
    </div>
  );
};

export default Intro;

