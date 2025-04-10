import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { BlurProvider } from './contexts/BlurContext';
import { GuideProvider } from './contexts/GuideContext';
import { ModeProvider } from './contexts/ModeContext';
import Home from './Pages/Home';
import Tutorial from './Tutorials/Tutorial';
import ArtworkPage from './Pages/ArtworkPage';
import About from './Pages/About';
import Howto from './Pages/Howto';  

function App() {
  return (
    <LanguageProvider>
      <BlurProvider>
        <GuideProvider>
          <ModeProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/howto" element={<Howto />} />
                <Route path="/tutorial/step/:step" element={<Tutorial />} />
                <Route path="/artwork/:pageNumber" element={<ArtworkPage />} />
              </Routes>
            </Router>
          </ModeProvider>
        </GuideProvider>
      </BlurProvider>
    </LanguageProvider>
  );
}

export default App;
