import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Settings from './components/Settings'
import Downloader from './components/Downloader'
import AdBlocker from './components/AdBlocker'
import { useTheme } from './context/ThemeContext'
import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('downloader');
  
  // Update active tab based on route changes
  useEffect(() => {
    if (location.pathname === '/adblocker') {
      setActiveTab('adblocker');
    } else if (location.pathname === '/downloader' || location.pathname === '/') {
      setActiveTab('downloader');
    }
  }, [location.pathname]);

  const navigateToSettings = () => {
    navigate('/settings');
  };
  
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'downloader' ? '/' : `/${tab}`);
  };
  
  const containerStyle = {
    width: '400px',
    height: '520px',
    maxHeight: '520px',
    overflow: 'hidden' 
  };

  return (
    <div 
      className={`flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
      style={containerStyle}
    >
      {/* Only show header on main views, not on settings page */}
      {location.pathname !== '/settings' && (
        <header className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-10 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center gap-2" onClick={() => setActiveTab('downloader')}>
              <div className={`w-8 h-8 rounded-lg overflow-hidden ${isDark ? 'bg-transparent' : 'bg-white'}`}>
                <img
                  src="/assets/logo.png"
                  alt="StreamSave Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                StreamSave Pro
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                className={`p-1.5 rounded-full transition-colors duration-150 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-gray-700" />}
              </button>
              <button 
                onClick={navigateToSettings} 
                className={`p-1.5 rounded-full transition-colors duration-150 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Settings"
              >
                <Cog6ToothIcon className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
              <button 
                className={`p-1.5 rounded-full transition-colors duration-150 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="User Profile"
              >
                <UserCircleIcon className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs with improved styling */}
          <nav className={`flex ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <button 
              onClick={() => navigateToTab('downloader')}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors duration-150 ease-in-out relative
                ${activeTab === 'downloader'
                  ? isDark 
                    ? 'text-green-400' 
                    : 'text-green-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              <span>Video Downloader</span>
              {activeTab === 'downloader' && (
                <span className={`absolute bottom-0 inset-x-0 h-0.5 ${isDark ? 'bg-green-400' : 'bg-green-600'}`}></span>
              )}
            </button>
            <button 
              onClick={() => navigateToTab('adblocker')}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors duration-150 ease-in-out relative
                ${activeTab === 'adblocker'
                  ? isDark 
                    ? 'text-yellow-400' 
                    : 'text-yellow-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              <span>Ad Blocker</span>
              {activeTab === 'adblocker' && (
                <span className={`absolute bottom-0 inset-x-0 h-0.5 ${isDark ? 'bg-yellow-400' : 'bg-yellow-600'}`}></span>
              )}
            </button>
          </nav>
        </header>
      )}

      <main className="flex-grow overflow-y-auto">
        <Routes>
          <Route path="/" element={<Downloader />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/downloader" element={<Downloader />} />
          <Route path="/adblocker" element={<AdBlocker />} />
        </Routes>
      </main>
    </div>
  );
}