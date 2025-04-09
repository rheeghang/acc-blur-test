import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import Home from './Pages/Home';
import Tutorial from './Tutorials/Tutorial';
import ArtworkPage from './Pages/ArtworkPage';
import About from './Pages/About';
import { ReaderProvider } from './contexts/ReaderContext';

function App() {
  return (
    <AppProvider>
      <ReaderProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tutorial/step/:number" element={<Tutorial />} />
            <Route path="/artwork/:pageNumber" element={<ArtworkPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </BrowserRouter>
      </ReaderProvider>
    </AppProvider>
  );
}

export default App;
