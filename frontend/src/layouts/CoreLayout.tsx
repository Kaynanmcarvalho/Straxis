/**
 * CoreLayout - Premium layout without traditional sidebar
 * Clean, minimal, focused on content with Straxis Design System
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Dock } from '../components/core/Dock';
import './CoreLayout.css';

const CoreLayout: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  React.useEffect(() => {
    if (isDashboard) {
      // Force Dashboard background
      document.documentElement.style.background = 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)';
      document.body.style.background = 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)';
    } else {
      // Reset to white for other pages
      document.documentElement.style.background = '#FFFFFF';
      document.body.style.background = '#FFFFFF';
    }
  }, [isDashboard]);

  return (
    <div 
      className="core-layout"
      style={isDashboard ? {
        background: 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)'
      } : {}}
    >
      {/* Main Content Area */}
      <main 
        className="core-content"
        style={isDashboard ? {
          background: 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)'
        } : {}}
      >
        <Outlet />
      </main>

      {/* Floating Dock Navigation */}
      <Dock />
    </div>
  );
};

export default CoreLayout;
