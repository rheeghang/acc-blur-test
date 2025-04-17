import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import Home from './pages/Home';
import About from './pages/About';
import Howto from './pages/Howto';
import Tutorial from './Tutorials/Tutorial';
import ArtworkPage from './pages/ArtworkPage';

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // 페이지 변경 시마다 GA에 페이지뷰 이벤트 전송
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/howto" element={<Howto />} />
      <Route path="/tutorial/step/:step" element={<Tutorial />} />
      <Route path="/artwork/:pageNumber" element={<ArtworkPage />} />
    </Routes>
  );
};

export default AppRoutes; 