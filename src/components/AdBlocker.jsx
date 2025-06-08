import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheckIcon, BellSlashIcon, PauseIcon, PlayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AdBlocker() {
  const { isDark } = useTheme();
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(true);
  const [blockDistractions, setBlockDistractions] = useState(true);
  const [isPausedOnSite, setIsPausedOnSite] = useState(false);
  const [currentSite, setCurrentSite] = useState('netflix.com');
  const [notification, setNotification] = useState(null);
  
  // Stats with randomization for realistic updates
  const [stats, setStats] = useState({
    pageAds: 141,
    totalAds: 132946,
    todayAds: 164
  });

  // Simulate real-time ad blocking when enabled
  useEffect(() => {
    let interval;
    
    if (isAdBlockEnabled && !isPausedOnSite) {
      interval = setInterval(() => {
        if (Math.random() > 0.7) {
          setStats(prev => ({
            pageAds: prev.pageAds + 1,
            totalAds: prev.totalAds + 1,
            todayAds: prev.todayAds + 1
          }));
        }
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [isAdBlockEnabled, isPausedOnSite]);
  
  // Show notification with auto-dismiss
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleAdBlock = () => {
    const newValue = !isAdBlockEnabled;
    setIsAdBlockEnabled(newValue);
    showNotification(newValue ? 'Ad Blocker enabled' : 'Ad Blocker disabled');
  };
  
  const toggleBlockDistractions = () => {
    const newValue = !blockDistractions;
    setBlockDistractions(newValue);
    showNotification(newValue ? 'Distraction blocking enabled' : 'Distraction blocking disabled');
  };

  const togglePauseOnSite = () => {
    const newValue = !isPausedOnSite;
    setIsPausedOnSite(newValue);
    showNotification(newValue
      ? `Ad Blocking paused on ${currentSite}`
      : `Ad Blocking resumed on ${currentSite}`
    );
  };

  return (
    <div className={`p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} h-full flex flex-col`}>
      {/* Notification */}
      <div className="mb-2">
        {notification && (
          <div className="p-2 rounded-md bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-800 dark:text-green-200">{notification}</p>
          </div>
        )}
      </div>
      
      {/* Warning banners */}
      {!isAdBlockEnabled && !isPausedOnSite && (
        <div className="p-3 mb-3 rounded-lg bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-800 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 text-yellow-700 dark:text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Ad Blocker is currently <span className="font-medium">off</span>. Enable it to block ads on all sites.
          </p>
        </div>
      )}
      
      {isPausedOnSite && (
        <div className="p-3 mb-3 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-800 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 text-red-700 dark:text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">
            Ad Blocker is <span className="font-medium">paused</span> on this site. Ads may appear on the current page.
          </p>
        </div>
      )}

      {/* Main block ads toggle */}
      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShieldCheckIcon className={`h-5 w-5 mr-3 ${
              isAdBlockEnabled && !isPausedOnSite 
                ? (isDark ? 'text-green-400' : 'text-green-500') 
                : (isDark ? 'text-gray-500' : 'text-gray-400')
            }`} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Block Ads
            </span>
          </div>
          <button
            onClick={toggleAdBlock}
            disabled={isPausedOnSite}
            aria-label={isAdBlockEnabled ? "Disable ad blocking" : "Enable ad blocking"}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
            } ${isAdBlockEnabled && !isPausedOnSite 
                ? (isDark ? 'bg-green-500 focus:ring-green-400' : 'bg-green-600 focus:ring-green-500') 
                : (isDark ? 'bg-gray-600 focus:ring-gray-500' : 'bg-gray-300 focus:ring-gray-400')
              } ${isPausedOnSite ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAdBlockEnabled && !isPausedOnSite ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Ad Blocker Statistics - Only show when enabled and not paused */}
      {(isAdBlockEnabled && !isPausedOnSite) && (
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-3`}>
          <h3 className={`text-base font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Ad Blocker Statistics
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {stats.pageAds}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This page
              </p>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <p className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {stats.totalAds.toLocaleString()}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total
              </p>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {stats.todayAds}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Today
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Block Distractions Toggle */}
      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BellSlashIcon className={`h-5 w-5 mr-3 ${
              blockDistractions && !isPausedOnSite 
                ? (isDark ? 'text-blue-400' : 'text-blue-500') 
                : (isDark ? 'text-gray-500' : 'text-gray-400')
            }`} />
            <div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                Block Distractions
              </span>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                Blocks floating videos and popups
              </p>
            </div>
          </div>
          <button
            onClick={toggleBlockDistractions}
            disabled={isPausedOnSite}
            aria-label={blockDistractions ? "Disable distraction blocking" : "Enable distraction blocking"}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
            } ${blockDistractions && !isPausedOnSite 
                ? (isDark ? 'bg-green-500 focus:ring-green-400' : 'bg-green-600 focus:ring-green-500') 
                : (isDark ? 'bg-gray-600 focus:ring-gray-500' : 'bg-gray-300 focus:ring-gray-400')
              } ${isPausedOnSite ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              blockDistractions && !isPausedOnSite ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>
      
      {/* Pause/Resume on this Site Button - moved to bottom */}
      <div className="mt-auto pt-2">
        <button 
          onClick={togglePauseOnSite}
          aria-label={isPausedOnSite ? "Resume ad blocking on this site" : "Pause ad blocking on this site"}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 ease-in-out
            ${isPausedOnSite
              ? (isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600')
              : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }
            ${isPausedOnSite 
              ? 'text-white' 
              : (isDark ? 'text-gray-300' : 'text-gray-700')
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isPausedOnSite
              ? (isDark ? 'focus:ring-green-500' : 'focus:ring-green-400')
              : (isDark ? 'focus:ring-gray-500' : 'focus:ring-gray-400')
            }
            ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}`}
        >
          {isPausedOnSite ? (
            <>
              <PlayIcon className="h-4 w-4" />
              Resume on this Site
            </>
          ) : (
            <>
              <PauseIcon className="h-4 w-4" />
              Pause on this Site
            </>
          )}
        </button>
      </div>
    </div>
  );
}