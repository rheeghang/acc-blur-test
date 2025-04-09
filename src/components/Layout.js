import React, { useState } from 'react';
import Menu from './Menu';
import { useNavigate } from 'react-router-dom';
import { useBlur } from '../contexts/BlurContext';

export const Layout = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { setIsUnlocked } = useBlur();
  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    setShowMenu(false);
    setIsUnlocked(false);

    if (newPage === 'home') {
      navigate('/');
    } else if (newPage === 'about') {
      navigate('/about');
    } else {
      navigate(`/artwork/${newPage}`);
    }
  };

  return (
    <>
      {children}
      {showMenu && (
        <Menu
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onPageSelect={handlePageChange}
        />
      )}
    </>
  );
}; 