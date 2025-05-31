import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ArrowDownTrayIcon, PlayCircleIcon, MagnifyingGlassIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

export default function Downloader() {
  const { isDark } = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [notification, setNotification] = useState(null);
  
  // Get detected videos on component mount - in a real extension,
  // you would query active tabs and check for videos
  useEffect(() => {
    // Clean up any download progress timers
    return () => {
      Object.keys(downloadProgress).forEach(id => {
        if (downloadProgress[id].timer) {
          clearInterval(downloadProgress[id].timer);
        }
      });
    };
  }, []);
  
  // Get detected videos on component mount
  useEffect(() => {
    // Check if we're in a Chrome extension environment
    if (chrome && chrome.runtime) {
      // Retrieve any already detected videos from the background script
      chrome.runtime.sendMessage(
        { action: "getDetectedVideos" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error getting detected videos:', chrome.runtime.lastError.message);
            return;
          }
          if (response && response.success && response.videos && response.videos.length > 0) {
            setVideos(response.videos);
            setHasScanned(true);
          }
        }
      );
    }
  }, []);
  
  const handleScan = () => {
    setLoading(true);
    setNotification('Scanning for videos...');
    
    // Check if we're in a Chrome extension environment
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage(
        { action: "scanForVideos" },
        (response) => {
          setLoading(false);
          
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError.message);
            setNotification('Error scanning for videos. Try refreshing the page.');
            setTimeout(() => setNotification(null), 3000);
            return;
          }
          
          if (response && response.success && response.videos) {
            setVideos(response.videos);
            setHasScanned(true);
            
            if (response.videos.length === 0) {
              setNotification('No videos found on this page.');
            } else {
              setNotification(`Found ${response.videos.length} videos.`);
            }
          } else {
            const errorMsg = response?.error || 'Unknown error occurred';
            setNotification(`Error: ${errorMsg}`);
          }
          
          setTimeout(() => setNotification(null), 3000);
        }
      );
    } else {
      // Fallback for development environment - simulate an API call
      setTimeout(() => {
        const foundVideos = [
          {
            id: 1,
            title: 'Solo Levelling Season 1 Episode 01',
            duration: '22 mins',
            quality: '1080p',
            quality_options: ['1080p', '720p', '480p', '360p'],
            thumbnail: '/assets/placeholder-video.png',
            url: 'https://example.com/videos/sample-video-1.mp4'
          },
          {
            id: 2,
            title: 'Solo Levelling Season 1 Episode 02',
            duration: '24 mins',
            quality: '1080p',
            quality_options: ['1080p', '720p', '480p', '360p'],
            thumbnail: '/assets/placeholder-video.png',
            url: 'https://example.com/videos/sample-video-2.mp4'
          },
          {
            id: 3,
            title: 'Solo Levelling Season 1 Episode 03',
            duration: '25 mins',
            quality: '1080p',
            quality_options: ['1080p', '720p', '480p', '360p'],
            thumbnail: '/assets/placeholder-video.png',
            url: 'https://example.com/videos/sample-video-3.mp4'
          }
        ];
        
        setVideos(foundVideos);
        setLoading(false);
        setHasScanned(true);
        
        if (foundVideos.length === 0) {
          setNotification('No videos found on this page.');
        } else {
          setNotification(`Found ${foundVideos.length} videos.`);
        }
        
        setTimeout(() => setNotification(null), 3000);
      }, 1500);
    }
  };
  
  const handleDownload = (video) => {
    const videoId = video.id;
    
    // Don't start a new download if one is already in progress
    if (downloadProgress[videoId]?.progress < 100 && downloadProgress[videoId]?.progress > 0) {
      return;
    }
    
    setNotification(`Starting download: ${video.title}`);
    
    // Initialize download progress
    setDownloadProgress(prev => ({
      ...prev,
      [videoId]: { progress: 0 }
    }));
    
    // Prepare video URL and filename
    let videoUrl = video.url;
    const filename = `${video.title.replace(/[/\\?%*:|"<>]/g, '-')}_${video.quality}.mp4`;
    
    // If this is a YouTube video, add the quality parameter (in a real extension, this would be more sophisticated)
    if (videoId.startsWith('youtube_') && videoUrl.includes('youtube.com')) {
      const quality = video.quality.replace('p', '');
      if (!videoUrl.includes('&quality=')) {
        videoUrl += `&quality=${quality}`;
      }
    }
    
    // Use Chrome extension API to communicate with the background script
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage(
        {
          action: "downloadVideo",
          videoUrl: videoUrl,
          filename: filename,
          quality: video.quality,
          saveAs: true // Show the save dialog
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError.message);
            setNotification('Error: Extension communication failed');
            setTimeout(() => setNotification(null), 3000);
            
            // Reset progress
            setDownloadProgress(prev => {
              const newProgress = { ...prev };
              if (newProgress[videoId]?.timer) {
                clearInterval(newProgress[videoId].timer);
              }
              delete newProgress[videoId];
              return newProgress;
            });
            return;
          }
          
          if (response && response.success) {
            // Success, simulate progress
            simulateDownloadProgress(videoId);
            
            // Update download counter in storage
            chrome.storage.local.get(['totalDownloads'], (result) => {
              if (!chrome.runtime.lastError) {
                const count = (result.totalDownloads || 0) + 1;
                chrome.storage.local.set({ totalDownloads: count });
              }
            });
          } else {
            // Handle error
            const errorMsg = response?.error || 'Unknown error';
            console.error('Download error:', errorMsg);
            setNotification(`Error downloading: ${errorMsg}`);
            setTimeout(() => setNotification(null), 3000);
            
            // Reset progress
            setDownloadProgress(prev => {
              const newProgress = { ...prev };
              if (newProgress[videoId]?.timer) {
                clearInterval(newProgress[videoId].timer);
              }
              delete newProgress[videoId];
              return newProgress;
            });
          }
        }
      );
    } else {
      // Fallback for development environment or when Chrome API is not available
      simulateDownloadProgress(videoId);
    }
  };
  
  const simulateDownloadProgress = (videoId) => {
    // Simulate download progress
    const timer = setInterval(() => {
      setDownloadProgress(prev => {
        const currentProgress = prev[videoId]?.progress || 0;
        
        if (currentProgress >= 100) {
          clearInterval(timer);
          setNotification(`Downloaded: ${videos.find(v => v.id === videoId)?.title}`);
          setTimeout(() => setNotification(null), 3000);
          return prev;
        }
        
        const newProgress = currentProgress + (5 + Math.floor(Math.random() * 10));
        const cappedProgress = Math.min(newProgress, 100);
        
        return {
          ...prev,
          [videoId]: { 
            progress: cappedProgress,
            timer: prev[videoId]?.timer
          }
        };
      });
    }, 300);
    
    // Store the timer for cleanup
    setDownloadProgress(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        timer
      }
    }));
  };
  
  const handleQualityChange = (videoId, quality) => {
    setVideos(currentVideos => 
      currentVideos.map(v => v.id === videoId ? {...v, quality} : v)
    );
  };
  
  // Different content sections based on state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <MagnifyingGlassIcon className={`h-10 w-10 mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
      <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        No videos detected
      </h3>
      <p className={`text-sm mb-4 max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Visit a page with video content and scan to find downloadable videos.
      </p>
    </div>
  );
  
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-3"></div>
      <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        Scanning for videos
      </h3>
      <p className={`text-sm max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        This may take a moment...
      </p>
    </div>
  );
  
  const renderVideoItem = (video) => {
    const isDownloading = downloadProgress[video.id]?.progress > 0 && downloadProgress[video.id]?.progress < 100;
    const downloadComplete = downloadProgress[video.id]?.progress === 100;
    
    return (
      <div key={video.id} className={`p-2.5 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          {/* Video info with thumbnail */}
          <div className="flex items-center space-x-2.5">
            <div className="w-14 h-9 bg-gray-700 relative rounded flex items-center justify-center overflow-hidden">
              <PlayCircleIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate max-w-[180px]">{video.title}</h4>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{video.duration}</span>
                <div className="relative">
                  <select
                    value={video.quality}
                    onChange={(e) => handleQualityChange(video.id, e.target.value)}
                    className={`text-xs px-2 py-0.5 pr-5 rounded border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-800'
                    } appearance-none focus:ring-1 focus:ring-green-500 focus:outline-none`}
                    disabled={isDownloading}
                  >
                    {video.quality_options.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                    <svg className="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Download button or progress */}
          <div>
            {isDownloading ? (
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${isDark ? 'text-gray-700' : 'text-gray-200'}`} strokeWidth="2"></circle>
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    className="stroke-current text-green-500" 
                    strokeWidth="2" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - downloadProgress[video.id]?.progress || 0}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-green-500">
                  {`${downloadProgress[video.id]?.progress || 0}%`}
                </div>
              </div>
            ) : downloadComplete ? (
              <CloudArrowDownIcon className="h-5 w-5 text-green-500" />
            ) : (
              <button
                onClick={() => handleDownload(video)}
                className={`p-1.5 rounded-full ${
                  isDark 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                aria-label={`Download ${video.title}`}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Show progress bar if downloading */}
        {isDownloading && (
          <div className="mt-1.5">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-green-500 h-1 rounded-full" 
                style={{ width: `${downloadProgress[video.id]?.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} h-full flex flex-col`}>
      {/* Notification area */}
      <div className="mb-4">
        {notification && (
          <div className="p-2 rounded-md bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-800 dark:text-green-200">{notification}</p>
          </div>
        )}
      </div>
      
      {/* Main content based on state */}
      <div className="mb-4 flex-grow overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Detected Videos</h2>
          
          {hasScanned && videos.length > 0 && (
            <button
              onClick={handleScan}
              disabled={loading}
              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                loading
                  ? 'cursor-not-allowed opacity-80 bg-gray-500 text-white'
                  : isDark
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
              } focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDark ? 'focus:ring-offset-gray-900 focus:ring-green-500' : 'focus:ring-offset-white focus:ring-green-400'}`}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Rescan
            </button>
          )}
        </div>
        
        {loading ? (
          renderLoadingState()
        ) : videos.length > 0 ? (
          <div className="overflow-y-auto pr-1 space-y-2 max-h-[350px]">
            {videos.map(renderVideoItem)}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
      
      {/* Scan button */}
      {(!hasScanned || videos.length === 0) && (
        <div className="mt-auto pt-2">
          <button
            onClick={handleScan}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors duration-150 ease-in-out ${
              loading
                ? 'cursor-not-allowed opacity-80 bg-gray-500 text-white'
                : isDark
                  ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                  : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}`}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full mr-2"></div>
                Scanning...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5" />
                Scan for Videos
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}