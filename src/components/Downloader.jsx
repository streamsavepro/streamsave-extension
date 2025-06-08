import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MagnifyingGlassIcon, ArrowPathIcon, FolderIcon } from '@heroicons/react/24/outline';

export default function Downloader() {
    const { isDark } = useTheme();
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabId, setTabId] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState(null);

    const requestVideoData = useCallback(() => {
        if (!tabId) { setLoading(false); return; }
        setLoading(true);
        chrome.runtime.sendMessage({ action: 'getVideoData', tabId }, (res) => {
            setVideoData(res || null);
            if (res?.formats?.length > 0) {
                setSelectedFormat(res.formats[0]);
            }
            setLoading(false);
        });
    }, [tabId]);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => tabs[0] && setTabId(tabs[0].id));
        const listener = (message) => message.action === 'videosUpdated' && requestVideoData();
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, [requestVideoData]);
    
    useEffect(() => { if (tabId) requestVideoData(); }, [tabId, requestVideoData]);

    const handleReload = () => tabId && chrome.runtime.sendMessage({ action: 'reloadTab', tabId });
    const handleDownload = (format) => {
      if (!format) return;
      chrome.runtime.sendMessage({ action: 'downloadVideo', title: videoData.title, format });
    };
    const handleOpenFolder = () => {
      chrome.runtime.sendMessage({ action: 'openDownloadFolder' });
    };

    const renderContent = () => {
        if (loading) return <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand"></div></div>;
        if (!videoData) return (
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4 text-light-text-secondary dark:text-dark-text-secondary">
                <MagnifyingGlassIcon className="h-12 w-12 mb-3" />
                <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">No Video Found</h3>
            </div>
        );
        return (
            <div className="flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-start gap-3 mb-4">
                        <img src={videoData.thumbnail} alt="thumbnail" className="w-24 h-14 rounded-md object-cover flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold line-clamp-2 text-light-text-primary dark:text-dark-text-primary">{videoData.title}</p>
                            <p className="text-xs mt-1 text-light-text-secondary dark:text-dark-text-secondary">{videoData.author}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedFormat?.itag || ''}
                            onChange={(e) => {
                                const newItag = parseInt(e.target.value, 10);
                                const format = videoData.formats.find(f => f.itag === newItag);
                                if (format) setSelectedFormat(format);
                            }}
                            className={`w-48 p-2 rounded-lg border-2 border-light-border dark:border-dark-border text-sm shadow-sm
                                ${isDark ? 'bg-dark-card text-dark-text-primary' : 'bg-light-card text-light-text-primary'}`}
                        >
                            <option value="" disabled>Select Quality</option>
                            {videoData.formats.map(format => (
                                <option key={format.itag} value={format.itag}>
                                    {format.qualityLabel} .{format.container}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleDownload(selectedFormat)}
                            className={`px-4 py-1.5 rounded-lg bg-brand hover:bg-brand-hover shadow-sm border-2 border-brand ${isDark ? 'text-dark-text-primary' : 'text-light-text-primary'} font-semibold text-sm`}
                            aria-label="Download"
                        >
                            Download
                        </button>
                        <button
                            onClick={handleOpenFolder}
                            className={`p-1.5 rounded-full ${isDark ? 'text-dark-text-secondary hover:bg-dark-card' : 'text-light-text-secondary hover:bg-light-border'}`}
                            aria-label="Open Folder"
                        >
                            <FolderIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`p-4 h-[550px] flex flex-col font-sans ${isDark ? 'dark bg-dark-bg' : 'bg-light-bg'}`}>
            <header className="flex items-center justify-between mb-4 flex-shrink-0">
                <h1 className={`text-base font-bold ${isDark ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>Your Downloads</h1>
                <button onClick={handleReload} className={`p-1.5 rounded-full ${isDark ? 'text-dark-text-secondary hover:bg-dark-card' : 'text-light-text-secondary hover:bg-light-border'}`} aria-label="Reload Tab">
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
            </header>
            <main className="flex-grow min-h-0">{renderContent()}</main>
        </div>
    );
}