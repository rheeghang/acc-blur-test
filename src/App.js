import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import Home from './Pages/Home';
import Tutorial from './Tutorials/Tutorial';
import ArtworkPage from './Pages/ArtworkPage';
import About from './Pages/About';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutorial/step/:number" element={<Tutorial />} />
          <Route path="/artwork/:pageNumber" element={<ArtworkPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
