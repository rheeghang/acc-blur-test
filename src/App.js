import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactGA from 'react-ga4';
import Routes from './Routes';
import { LanguageProvider } from './contexts/LanguageContext';
import { BlurProvider } from './contexts/BlurContext';
import { GuideProvider } from './contexts/GuideContext';
import { ModeProvider } from './contexts/ModeContext';
import Home from './pages/Home';
import Tutorial from './Tutorials/Tutorial';
import ArtworkPage from './pages/ArtworkPage';
import About from './pages/About';
import Howto from './pages/Howto';  

// GA 초기화
ReactGA.initialize('YOUR-MEASUREMENT-ID'); // GA4 측정 ID로 교체해주세요

const App = () => {
  useEffect(() => {
    // 페이지뷰 이벤트 전송
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return (
    <LanguageProvider>
      <BlurProvider>
        <GuideProvider>
          <ModeProvider>
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
          </ModeProvider>
        </GuideProvider>
      </BlurProvider>
    </LanguageProvider>
  );
};

export default App;
