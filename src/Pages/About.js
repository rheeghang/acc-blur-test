import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import MenuIcon from '../components/MenuIcon';
import Menu from '../components/Menu';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import { useReader } from '../contexts/ReaderContext';

const About = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const data = language === 'ko' ? koData : enData;
  const { title, subtitle, body } = data.about;
  const { isReaderEnabled, readGuidance } = useReader();

  const handlePageChange = (newPage) => {
    setShowMenu(false);
    
    if (newPage === 'home') {
      navigate('/');
    } else if (newPage === 'about') {
      navigate('/about');
    } else {
      navigate(`/artwork/${newPage}`);
    }
  };

  useEffect(() => {
    if (isReaderEnabled) {
      const readSequentially = async () => {
        // 첫 번째 안내 메시지
        await new Promise(resolve => {
          const utterance = new SpeechSynthesisUtterance("우리의 몸에는 타인이 깃든다, 전시 소개 페이지입니다.");
          utterance.onend = resolve;
          utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
          window.speechSynthesis.speak(utterance);
        });

        // 타이틀과 본문 읽기
        await new Promise(resolve => {
          const titleAndBody = `${data.about.title}. ${data.about.body}`;
          const utterance = new SpeechSynthesisUtterance(titleAndBody);
          utterance.onend = resolve;
          utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
          window.speechSynthesis.speak(utterance);
        });

        // 모든 텍스트를 다 읽은 후 메뉴 안내
        readGuidance('tutorial', 'completion');
      };

      readSequentially();
    }
  }, []); // 페이지 진입시 한 번만 실행

  return (
    <Layout>
      <div className="min-h-screen bg-black fixed w-full flex items-center justify-center white-space-pre-wrap">
        {/* 메뉴 아이콘 */}
        <div className="fixed top-5 right-5 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-all z-100"
            style={{ 
              backgroundColor: '#FF5218',
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

        <div className="w-full h-full absolute inset-0">
          <div 
            className="container h-full w-full overflow-y-auto overflow-x-hidden flex flex-col p-10 text-black leading-relaxed"
            style={{
              background: 'linear-gradient(to left, #FFEA7B, #FACFB9)',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <div className="text-center mb-14 w-full max-w-2xl mx-auto">
              <p className="text-base mb-2">{subtitle}</p>
              <h1 className="text-2xl font-bold mb-4">{title}</h1>
            </div>
            
            <div 
              className="text-base leading-relaxed break-keep w-full max-w-2xl mx-auto flex-1 pb-[50px]"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>

        {/* 메뉴 오버레이 */}
        {showMenu && (
          <Menu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            onPageSelect={handlePageChange}
            pageNumber="about"
          />
        )}
      </div>
    </Layout>
  );
};

export default About;