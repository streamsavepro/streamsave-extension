import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { XMarkIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [autoDetect, setAutoDetect] = useState(true);
  const [downloadType, setDownloadType] = useState('Video');
  const [quality, setQuality] = useState('Best');
  const [videoFormat, setVideoFormat] = useState('Auto');
  const [downloadSubtitles, setDownloadSubtitles] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState('Default');
  const [saveTo, setSaveTo] = useState('D:/EaseUS__streamsaepro');
  const [settingSaved, setSettingSaved] = useState(false);

  const handleConfirm = () => {
    // Simulate saving settings
    console.log('Saving settings:', {
      autoDetect,
      downloadType,
      quality,
      videoFormat,
      downloadSubtitles,
      subtitleLanguage,
      saveTo,
    });
    
    // Show success indicator
    setSettingSaved(true);
    setTimeout(() => {
      setSettingSaved(false);
      // Navigate back after saving
      navigate('/');
    }, 1200);
  };

  const handleCancel = () => {
    // Go back without saving changes
    navigate('/');
  };

  // Reusable toggle switch component
  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
        checked ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
  
  // More compact setting row component
  const SettingRow = ({ label, children, description }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
      <div>
        <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
          {label}
        </label>
        {description && (
          <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="mt-1 sm:mt-0 sm:col-span-2 flex justify-end items-center">{children}</div>
    </div>
  );
  
  // More compact select input with consistent styling
  const Select = ({ value, onChange, options }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full rounded-md py-1.5 pl-3 pr-8 text-sm ${
          isDark 
            ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500 focus:border-green-500' 
            : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500 focus:border-green-500'
        } border shadow-sm focus:outline-none appearance-none`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className={`w-[400px] h-[520px] flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className={`mr-2 rounded-full p-1 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Download Settings</h2>
        </div>
        
        {settingSaved && (
          <div className="flex items-center text-green-500">
            <CheckIcon className="h-5 w-5 mr-1" />
            <span className="text-sm">Saved</span>
          </div>
        )}
      </div>

      {/* Settings form */}
      <div className="p-4 flex-grow overflow-y-auto">
        <div className={`space-y-1 divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
          <SettingRow label="Automatically Detect Videos">
            <ToggleSwitch checked={autoDetect} onChange={setAutoDetect} />
          </SettingRow>

          <SettingRow label="Content Type">
            <Select 
              value={downloadType} 
              onChange={setDownloadType} 
              options={['Video', 'Audio', 'Playlist']} 
            />
          </SettingRow>
          
          <SettingRow label="Quality">
            <Select 
              value={quality} 
              onChange={setQuality} 
              options={['Best', '1080p', '720p', '480p', '360p']} 
            />
          </SettingRow>

          <SettingRow label="Video Format">
            <Select 
              value={videoFormat} 
              onChange={setVideoFormat} 
              options={['Auto', 'MP4', 'MKV', 'WEBM']} 
            />
          </SettingRow>

          <SettingRow label="Download Subtitles">
            <div className="flex items-center gap-3">
              <ToggleSwitch checked={downloadSubtitles} onChange={setDownloadSubtitles} />
              
              {downloadSubtitles && (
                <Select 
                  value={subtitleLanguage} 
                  onChange={setSubtitleLanguage} 
                  options={['Default', 'English', 'Spanish', 'French', 'Japanese']} 
                />
              )}
            </div>
          </SettingRow>

          <SettingRow 
            label="Save to" 
            description="Choose folder to save downloads"
          >
            <div className="flex items-center gap-2 w-full max-w-xs">
              <input
                type="text"
                value={saveTo}
                onChange={(e) => setSaveTo(e.target.value)}
                className={`block w-full rounded-md py-1.5 px-3 text-sm ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500 focus:border-green-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500 focus:border-green-500'
                } border shadow-sm focus:outline-none truncate`}
              />
              <button
                className={`px-2 py-1.5 rounded text-sm font-medium ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Browse
              </button>
            </div>
          </SettingRow>
        </div>
      </div>
      
      {/* Footer with action buttons */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex justify-end gap-3`}>
        <button
          onClick={handleCancel}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            isDark 
              ? 'border-gray-700 hover:bg-gray-800 text-gray-200' 
              : 'border-gray-300 hover:bg-gray-100 text-gray-800'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            isDark 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
            isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}