import React, { useState } from 'react';
import Downloader from '../components/Downloader';
import AdBlocker from '../components/AdBlocker';
import { useTheme } from '../context/ThemeContext';
import Settings from '../components/Settings'
export default function HomePage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('downloader');

  return (<>
    {activeTab === 'settings' && <Settings />}
   <div className="min-w-[400px] min-h-[500px] p-4">
      <p className="test-rule">If this is red, CSS is processing</p>
      <div className="flex border-b dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'downloader'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setActiveTab('downloader')}
        >
          Downloader
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'adblocker'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setActiveTab('adblocker')}
        >
          Ad Blocker
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'settings'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="overflow-auto" style={{ maxHeight: '420px' }}>
        {activeTab === 'downloader' && <Downloader />}
        {activeTab === 'adblocker' && <AdBlocker />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-3 border-t dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        StreamSave Pro v1.0 • Ready
      </div>
    </div>
  </>
  );
}