console.log('StreamSave Pro background script loaded');

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    adsBlocked: 0,
    totalDownloads: 0,
    isAdBlockEnabled: true
  });
});

// Track blocked ads (only if available)
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    if (info.rule.ruleId <= 3) { // Our ad-blocking rules
      chrome.storage.local.get('adsBlocked', (data) => {
        const count = (data.adsBlocked || 0) + 1;
        chrome.storage.local.set({ adsBlocked: count });
      });
    }
  });
}

// Store detected videos
let detectedVideos = new Map();

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle stats request
  if (message.action === "getStats") {
    chrome.storage.local.get(['adsBlocked', 'totalDownloads'], (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({
          success: true,
          adsBlocked: data.adsBlocked || 0,
          totalDownloads: data.totalDownloads || 0
        });
      }
    });
    return true;
  }
  
  // Handle getting detected videos
  if (message.action === "getDetectedVideos") {
    const tabId = sender?.tab?.id;
    if (tabId && detectedVideos.has(tabId)) {
      sendResponse({ success: true, videos: detectedVideos.get(tabId) });
    } else {
      sendResponse({ success: true, videos: [] });
    }
    return true;
  }
  
  // Handle videos detected from content script
  if (message.action === "videosDetected") {
    const tabId = sender?.tab?.id;
    if (tabId && message.videos) {
      detectedVideos.set(tabId, message.videos);
    }
    return true;
  }
  
  // Handle scan for videos
  if (message.action === "scanForVideos") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scanForVideos" }, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: "Unable to scan this page. Please refresh and try again." });
          } else {
            if (response && response.videos) {
              detectedVideos.set(tabs[0].id, response.videos);
            }
            sendResponse(response || { success: false, error: "No response from content script" });
          }
        });
      } else {
        sendResponse({ success: false, error: "No active tab found" });
      }
    });
    return true;
  }
  
  // Handle ad-block toggle
  if (message.action === "toggleAdBlocker") {
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: message.enabled ? ['adblock_ruleset'] : [],
      disableRulesetIds: message.enabled ? [] : ['adblock_ruleset']
    }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        chrome.storage.local.set({ isAdBlockEnabled: message.enabled }, () => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ success: true });
          }
        });
      }
    });
    return true;
  }
  
  // Handle downloads
  if (message.action === "downloadVideo") {
    // YouTube special handling
    if (message.videoUrl.includes('youtube.com')) {
      return handleYouTubeDownload(message, sendResponse);
    }
    // Standard download
    chrome.downloads.download({
      url: message.videoUrl,
      filename: message.filename || "video.mp4"
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        updateDownloadCounter();
        sendResponse({ success: true, downloadId });
      }
    });
    return true;
  }
});

// YouTube download handler
async function handleYouTubeDownload(message, sendResponse) {
  let responded = false;
  const responseTimeout = 8000; // 8 seconds timeout
  
  try {
    // Create offscreen document if needed
    if (!(await chrome.offscreen.hasDocument())) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['DOM_PARSER'],
        justification: 'YouTube video processing'
      });
    }

    // Listen for response from offscreen
    const listener = (response) => {
      if (response.type === 'youtube-processed') {
        chrome.downloads.download({
          url: response.data.directUrl,
          filename: response.data.filename
        }, (downloadId) => {
          chrome.runtime.onMessage.removeListener(listener);
          updateDownloadCounter();
          if (!responded) {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              sendResponse({ success: true, downloadId });
            }
            responded = true;
          }
        });
      } else if (response.type === 'youtube-error') {
        chrome.runtime.onMessage.removeListener(listener);
        if (!responded) {
          sendResponse({ success: false, error: response.error });
          responded = true;
        }
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    // Timeout fallback
    const timeout = setTimeout(() => {
      chrome.runtime.onMessage.removeListener(listener);
      if (!responded) {
        sendResponse({ success: false, error: 'YouTube processing timed out.' });
        responded = true;
      }
    }, responseTimeout);

    // Send processing request
    chrome.runtime.sendMessage({
      type: 'process-youtube',
      target: 'offscreen',
      url: message.videoUrl,
      quality: message.quality || '720p'
    });
    
    // Keep the message channel open for async response
    return true;
  } catch (error) {
    if (!responded) {
      sendResponse({ success: false, error: error.message });
      responded = true;
    }
    return true;
  }
}

// Update download counter
function updateDownloadCounter() {
  chrome.storage.local.get('totalDownloads', (data) => {
    if (!chrome.runtime.lastError) {
      const count = (data.totalDownloads || 0) + 1;
      chrome.storage.local.set({ totalDownloads: count });
    }
  });
}

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  detectedVideos.delete(tabId);
});