/**
 * StreamSave Pro - Content Script (v2.3 - Hybrid Detection)
 *
 * This script listens for requests from the background script and scrapes
 * the page's DOM to find rich metadata (title, duration) for a given video URL.
 */

console.log('StreamSave Pro v2.3 Content Script Loaded.');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'processVideoStream') {
    console.log('Received request to process stream:', message.url);
    const videoData = enrichVideoData(message.url);

    sendResponse({ success: true, videoData });
  }
  return true;
});

function enrichVideoData(url) {
  const title = getPageTitle();
  const duration = getPageVideoDuration();
  const videoId = `vid_${btoa(title)}`; // Create an ID based on the title

  return {
    id: videoId,
    url: url,
    title: title,
    quality: 'Auto', // Can be improved later
    quality_options: ['Auto', '1080p', '720p'],
    duration: duration,
    source: 'Page & Network'
  };
}

/**
 * Finds the most accurate video title from the page.
 * Prioritizes YouTube's specific title element.
 */
function getPageTitle() {
  // YouTube specific title element (this is much more reliable)
  const ytTitleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
  if (ytTitleElement && ytTitleElement.textContent) {
    return ytTitleElement.textContent.trim();
  }

  // Fallback to the document's main title
  return document.title;
}

/**
 * Finds the video duration from the page.
 * Prioritizes YouTube's specific time display element.
 */
function getPageVideoDuration() {
    const videoElement = document.querySelector('video');
    if (videoElement && videoElement.duration) {
        return formatDuration(videoElement.duration);
    }
    return 'N/A';
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return 'N/A';
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
}