// public/background.js (v10.0 - Final Stability Fix)
console.log('StreamSave Pro v10.0 Loaded.');
const videoDataByTab = new Map();
const lastVideoIdByTab = new Map(); // Tracks the last processed video ID
const HELPER_SERVER_URL = 'http://localhost:4000';

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
});

async function fetchVideoInfo(url, tabId) {
  try {
    const videoId = new URL(url).searchParams.get('v');
    // THE FIX: Only fetch if the video ID is new for this tab
    if (!videoId || lastVideoIdByTab.get(tabId) === videoId) {
      return;
    }
    lastVideoIdByTab.set(tabId, videoId);
    
    videoDataByTab.delete(tabId); // Clear old data before fetching new
    updateBadge(tabId);

    const res = await fetch(`${HELPER_SERVER_URL}/get-video-info?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.success) {
      videoDataByTab.set(tabId, data);
    }
  } catch (e) {
    // This can happen on non-youtube pages, which is fine.
  } finally {
    updateBadge(tabId);
    chrome.runtime.sendMessage({ action: 'videosUpdated' }).catch(() => {});
  }
}

const listenToTab = (tabId) => chrome.tabs.get(tabId, (tab) => tab?.url && fetchVideoInfo(tab.url, tabId));
chrome.tabs.onActivated.addListener(info => listenToTab(info.tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        listenToTab(tabId);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, tabId, format, title } = message;
  if (action === 'getVideoData') {
    sendResponse(videoDataByTab.get(tabId));
  } else if (action === 'reloadTab') {
    if(tabId) chrome.tabs.reload(tabId);
  } else if (action === 'downloadVideo') {
    chrome.downloads.download({ url: format.url, filename: `${title.replace(/[\\/:*?"<>|]/g, '_')}.${format.container}` });
  } else if (action === 'openDownloadFolder') {
    chrome.downloads.showDefaultFolder();
  }
  return true;
});

chrome.tabs.onRemoved.addListener(tabId => {
    videoDataByTab.delete(tabId);
    lastVideoIdByTab.delete(tabId);
});

function updateBadge(tabId) {
  chrome.action.setBadgeText({ tabId, text: videoDataByTab.has(tabId) ? '✓' : '' });
}